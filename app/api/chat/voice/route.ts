import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { openrouter } from "@/lib/openrouter"
import { getAuthUserId } from "@/lib/auth-session"
import { ok, err } from "@/lib/api-response"
import { VoiceChatSchema } from "@/lib/validators/voice-chat"

/**
 * Google Cloud TTS voice config.
 * en-IN-Neural2-A = Female Indian English Neural2 voice (warm, natural).
 * Free tier: 1M Neural2 chars/month.
 * Override via GOOGLE_TTS_VOICE env var if needed.
 */
const DEFAULT_TTS_VOICE = "en-IN-Neural2-A"
const TTS_LANGUAGE_CODE = "en-IN"

const VOICE_SYSTEM_PROMPT = `You are a warm, loving Indian mom (Mumma) who is guiding your child through cooking.
You are currently helping them with a specific step in a recipe.
Rules:
- Respond in 2-3 short, conversational sentences MAX.
- Be encouraging, warm, and practical.
- Stay focused on the current cooking step. Do not go off-topic.
- Use simple language a beginner cook would understand.
- You may use light Hindi terms of endearment like "beta" or "baccha" naturally.
- Never use markdown formatting. Speak naturally as if talking aloud.`

/**
 * POST /api/chat/voice
 *
 * Flow: Auth → Quota Check → LLM (OpenRouter) → TTS (Google Cloud) → Prisma Transaction → Response
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Auth & Validation
    const auth = await getAuthUserId()
    if (auth.error) return auth.error
    const userId = auth.userId

    const body = await request.json()
    const parsed = VoiceChatSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid request body"
      return err(firstError, 400)
    }
    const { stepId, userMessage } = parsed.data

    // 2. Quota Check
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { ttsCharactersUsed: true, ttsCharacterLimit: true },
    })

    if (!user) {
      return err("User not found.", 404)
    }

    const used = user.ttsCharactersUsed ?? 0
    const limit = user.ttsCharacterLimit ?? 10000

    if (used >= limit) {
      return err(
        "TTS character quota exceeded. Upgrade to Pro for more characters.",
        402
      )
    }

    // 3. Fetch CookingStep context + recent chat history
    const step = await prisma.cookingStep.findUnique({
      where: { id: stepId },
      include: {
        chats: {
          orderBy: { createdAt: "desc" },
          take: 4,
          select: { role: true, content: true },
        },
        session: {
          select: { recipeName: true },
        },
      },
    })

    if (!step) {
      return err("Cooking step not found.", 404)
    }

    // Build conversation history for context
    const chatHistory = step.chats
      .reverse()
      .map((c) => ({
        role: c.role === "USER" ? "user" as const : "assistant" as const,
        content: c.content,
      }))

    const stepContext = `Recipe: "${step.session.recipeName}"\nCurrent Step ${step.stepNumber}: ${step.title}\nInstruction: ${step.instruction}`

    // 4. LLM Generation (OpenRouter — Llama 3.1)
    const llmResponse = await openrouter.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct",
      max_tokens: 150,
      temperature: 0.7,
      messages: [
        { role: "system", content: VOICE_SYSTEM_PROMPT },
        {
          role: "system",
          content: `Context for this conversation:\n${stepContext}`,
        },
        ...chatHistory,
        { role: "user", content: userMessage },
      ],
    })

    const llmText =
      llmResponse.choices[0]?.message?.content?.trim() ?? ""

    if (!llmText) {
      return err("Mumma is speechless right now. Please try again.", 500)
    }

    const charLength = llmText.length

    // Check if this response would exceed the quota
    if (used + charLength > limit) {
      return err(
        `TTS character quota will be exceeded. You have ${limit - used} characters remaining.`,
        402
      )
    }

    // 5. TTS Generation (Google Cloud TTS) — best-effort, falls back to text-only
    let audioBase64: string | null = null

    const gcpApiKey = process.env.GOOGLE_TTS_API_KEY
    if (gcpApiKey) {
      try {
        const voiceName = process.env.GOOGLE_TTS_VOICE || DEFAULT_TTS_VOICE

        const ttsResponse = await fetch(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${gcpApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              input: { text: llmText },
              voice: {
                languageCode: TTS_LANGUAGE_CODE,
                name: voiceName,
              },
              audioConfig: {
                audioEncoding: "MP3",
                speakingRate: 1.0,
                pitch: 1.0,
              },
            }),
          }
        )

        if (ttsResponse.ok) {
          const ttsData = await ttsResponse.json()
          audioBase64 = ttsData.audioContent ?? null
        } else {
          const ttsError = await ttsResponse.text().catch(() => "Unknown TTS error")
          console.warn("Google TTS error (falling back to text-only):", ttsResponse.status, ttsError)
        }
      } catch (ttsErr) {
        console.warn("Google TTS exception (falling back to text-only):", ttsErr)
      }
    } else {
      console.warn("GOOGLE_TTS_API_KEY not configured — returning text-only response")
    }

    // 6. Prisma Transaction — save chat messages + update user quota
    await prisma.$transaction([
      // User's message
      prisma.stepChat.create({
        data: {
          stepId,
          role: "USER",
          content: userMessage,
        },
      }),
      // Mom's response
      prisma.stepChat.create({
        data: {
          stepId,
          role: "MOM",
          content: llmText,
          ttsCharsUsed: charLength,
        },
      }),
      // Increment user's TTS usage
      prisma.user.update({
        where: { id: userId },
        data: {
          ttsCharactersUsed: { increment: charLength },
        },
      }),
    ])

    // 7. Response
    return ok({
      text: llmText,
      audio: audioBase64,
      audioFormat: "mp3",
      ttsCharsUsed: used + charLength,
      ttsCharsLimit: limit,
    })
  } catch (e) {
    console.error("POST /api/chat/voice error:", e)
    return err("Voice chat failed. Please try again.", 500)
  }
}
