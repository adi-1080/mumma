import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { openrouter } from "@/lib/openrouter"
import { getOptionalSession } from "@/lib/auth-session"
import { ok, err } from "@/lib/api-response"
import { StartSessionSchema } from "@/lib/validators/session"

const SYSTEM_PROMPT = `You are a warm Indian mom who is an expert home cook.
A child tells you what ingredients they have and how many people they want to cook for.
Your job is to suggest the single best recipe they can make.
Ensure that all ingredient quantities, proportions, and measurements in the recipe description and steps are scaled specifically for that number of people.
Break it into clear, simple numbered steps.
Each step should be short, friendly, and doable by a beginner.
Aim for 5 to 8 steps. Never more than 8.
Return ONLY a raw JSON object. No markdown. No explanation.`

async function callLLM(ingredients: string[], servings: number = 2, retry = false): Promise<{
  recipeName: string
  recipeDesc: string
  steps: { stepNumber: number; title: string; instruction: string }[]
} | null> {
  const userPrompt = `I have these ingredients: ${ingredients.join(", ")}.
I want to cook a delicious dish for exactly ${servings} ${servings === 1 ? 'person' : 'people'}.
What is the best thing I can cook? Please adjust and specify the exact ingredient proportions, quantities, and steps scaled for exactly ${servings} ${servings === 1 ? 'person' : 'people'}.

Return this exact JSON:
{
  "recipeName": "short recipe name",
  "recipeDesc": "one warm sentence describing this dish and stating the exact portion sizes/quantities for ${servings} ${servings === 1 ? 'person' : 'people'}",
  "steps": [
    { "stepNumber": 1, "title": "short title", "instruction": "clear instruction with specific quantities scaled for ${servings} ${servings === 1 ? 'person' : 'people'}" }
  ]
}${retry ? "\n\nReturn ONLY raw JSON, no text before or after." : ""}`

  const res = await openrouter.chat.completions.create({
    model: "openai/gpt-oss-120b:free",
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

    const { ingredients, servings = 2 } = parsed.data
    let recipe = await callLLM(ingredients, servings)
    if (!recipe) recipe = await callLLM(ingredients, servings, true)
    if (!recipe) return err("recipe_generation_failed", 500)

    const userId = await getOptionalSession()

    const session = await prisma.cookingSession.create({
      data: {
        userId,
        ingredients,
        recipeName: recipe.recipeName,
        recipeDesc: recipe.recipeDesc,
        totalSteps: recipe.steps.length,
        servings,
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
