import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { openrouter } from "@/lib/openrouter"
import { getOptionalSession } from "@/lib/auth-session"
import { ok, err } from "@/lib/api-response"
import { StepChatSchema } from "@/lib/validators/session"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; stepId: string }> }
) {
  try {
    const { sessionId, stepId } = await params
    const body = await request.json()
    const parsed = StepChatSchema.safeParse(body)
    if (!parsed.success) return err("message: 1-500 chars required", 400)

    const userId = await getOptionalSession()

    // Fetch step + session for context
    const step = await prisma.cookingStep.findFirst({
      where: { 
        sessionId: sessionId,
        OR: [
          { id: stepId },
          ...(isNaN(Number(stepId)) ? [] : [{ stepNumber: Number(stepId) }])
        ]
      },
      include: { session: { select: { recipeName: true, userId: true } } },
    })
    if (!step) return err("step_not_found", 404)
    if (step.session.userId && step.session.userId !== userId) {
      return err("unauthorized", 403)
    }

    // Last 6 chats for context
    const history = await prisma.stepChat.findMany({
      where: { stepId: step.id },
      orderBy: { createdAt: "asc" },
      take: 6,
    })

    const systemPrompt = `You are the user's warm, funny, slightly dramatic Indian mom.
You are helping your child cook ${step.session.recipeName}.
Right now they are on step ${step.stepNumber}: '${step.title}'.
The full instruction for this step is: '${step.instruction}'.

Your personality:
- Warm and encouraging, never discouraging
- Playfully teases your child (like 'Arre beta, how do you not know this!')
- Gives practical, accurate cooking advice
- Keeps answers SHORT — 2 to 4 sentences max
- If they ask about ingredient substitution, give a clear yes/no and why
- If they go off-topic, playfully redirect them back to cooking

Never break character. You are always their mom, always in the kitchen with them.`

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...history.map((c) => ({
        role: (c.role === "USER" ? "user" : "assistant") as "user" | "assistant",
        content: c.content,
      })),
      { role: "user", content: parsed.data.message },
    ]

    const res = await openrouter.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct",
      max_tokens: 300,
      messages,
    })

    const momReply = res.choices[0]?.message?.content ?? "Beta, mom is having a moment. Ask me again!"

    // Save both messages
    const [userMsg, momMsg] = await prisma.$transaction([
      prisma.stepChat.create({
        data: { stepId: step.id, role: "USER", content: parsed.data.message },
      }),
      prisma.stepChat.create({
        data: { stepId: step.id, role: "MOM", content: momReply },
      }),
    ])

    return ok({
      userMessage: { id: userMsg.id, role: userMsg.role, content: userMsg.content, createdAt: userMsg.createdAt },
      momMessage: { id: momMsg.id, role: momMsg.role, content: momMsg.content, createdAt: momMsg.createdAt },
    })
  } catch (e) {
    console.error("POST /api/sessions/[sessionId]/step/[stepId]/chat error:", e)
    return err("internal_server_error", 500)
  }
}
