import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { openrouter } from "@/lib/openrouter"
import { getOptionalSession } from "@/lib/auth-session"
import { ok, err } from "@/lib/api-response"
import { StartSessionSchema } from "@/lib/validators/session"

const SYSTEM_PROMPT = `You are a warm Indian mom who is an expert home cook.
A child tells you what ingredients they have.
Your job is to suggest the single best recipe they can make
and break it into clear, simple numbered steps.
Each step should be short, friendly, and doable by a beginner.
Aim for 5 to 8 steps. Never more than 8.
Return ONLY a raw JSON object. No markdown. No explanation.`

async function callLLM(ingredients: string[], retry = false): Promise<{
  recipeName: string
  recipeDesc: string
  steps: { stepNumber: number; title: string; instruction: string }[]
} | null> {
  const userPrompt = `I have these ingredients: ${ingredients.join(", ")}.
What is the best thing I can cook?

Return this exact JSON:
{
  "recipeName": "short recipe name",
  "recipeDesc": "one warm sentence describing this dish",
  "steps": [
    { "stepNumber": 1, "title": "short title", "instruction": "clear instruction" }
  ]
}${retry ? "\n\nReturn ONLY raw JSON, no text before or after." : ""}`

  const res = await openrouter.chat.completions.create({
    model: "google/gemini-2.5-flash",
    max_tokens: 1000,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  })

  const raw = res.choices[0]?.message?.content ?? ""
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()

  try {
    const parsed = JSON.parse(cleaned)
    if (!parsed.recipeName || !Array.isArray(parsed.steps)) return null
    if (parsed.steps.length < 1 || parsed.steps.length > 8) return null
    return parsed
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = StartSessionSchema.safeParse(body)
    if (!parsed.success) {
      return err("Invalid ingredients: array of 1-15 strings required", 400)
    }

    const { ingredients } = parsed.data
    let recipe = await callLLM(ingredients)
    if (!recipe) recipe = await callLLM(ingredients, true)
    if (!recipe) return err("recipe_generation_failed", 500)

    const userId = await getOptionalSession()

    const session = await prisma.cookingSession.create({
      data: {
        userId,
        ingredients,
        recipeName: recipe.recipeName,
        recipeDesc: recipe.recipeDesc,
        totalSteps: recipe.steps.length,
        steps: {
          create: recipe.steps.map((s) => ({
            stepNumber: s.stepNumber,
            title: s.title,
            instruction: s.instruction,
          })),
        },
      },
      include: {
        steps: { orderBy: { stepNumber: "asc" } },
      },
    })

    return ok({
      session: {
        id: session.id,
        recipeName: session.recipeName,
        recipeDesc: session.recipeDesc,
        totalSteps: session.totalSteps,
        status: session.status,
        steps: session.steps.map((s) => ({
          id: s.id,
          stepNumber: s.stepNumber,
          title: s.title,
          instruction: s.instruction,
          isCompleted: s.isCompleted,
        })),
      },
    })
  } catch (e) {
    console.error("POST /api/sessions/start error:", e)
    return err("internal_server_error", 500)
  }
}
