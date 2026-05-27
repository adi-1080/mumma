import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-session"
import { ok, err } from "@/lib/api-response"

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth()
    const { cloneSessionId } = await request.json()

    if (!cloneSessionId) {
      return err("cloneSessionId_required", 400)
    }

    const sourceSession = await prisma.cookingSession.findUnique({
      where: { id: cloneSessionId },
      include: {
        steps: { orderBy: { stepNumber: "asc" } },
      },
    })

    if (!sourceSession) {
      return err("session_not_found", 404)
    }

    // Create a new session for the current user
    const newSession = await prisma.cookingSession.create({
      data: {
        userId,
        ingredients: sourceSession.ingredients ?? [],
        recipeName: sourceSession.recipeName,
        recipeDesc: sourceSession.recipeDesc,
        totalSteps: sourceSession.totalSteps,
        servings: sourceSession.servings,
        status: "IN_PROGRESS",
        steps: {
          create: sourceSession.steps.map((s) => ({
            stepNumber: s.stepNumber,
            title: s.title,
            instruction: s.instruction,
            isCompleted: false, // Ensure steps are not completed for the new user!
          })),
        },
      },
      include: {
        steps: { orderBy: { stepNumber: "asc" } },
      },
    })

    return ok({
      session: {
        id: newSession.id,
      },
    })
  } catch (e) {
    console.error("POST /api/sessions/clone error:", e)
    return err("internal_server_error", 500)
  }
}
