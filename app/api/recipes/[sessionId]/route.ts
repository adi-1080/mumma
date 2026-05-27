import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, err } from "@/lib/api-response"
import { getOptionalSession } from "@/lib/auth-session"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    const session = await prisma.cookingSession.findUnique({
      where: { id: sessionId },
      include: {
        steps: {
          orderBy: { stepNumber: "asc" },
          select: {
            stepNumber: true,
            title: true,
            instruction: true,
          },
        },
        result: {
          select: {
            score: true,
            recipeName: true,
            foodPhotoUrl: true,
            selfieUrl: true,
            isPublished: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    if (!session) return err("recipe_not_found", 404)

    // Allow viewing recipes if they're published or belong to current user
    // For community viewing, we should allow published recipes
    // For personal viewing, user should be able to see their own recipes
    if (session.result && !session.result.isPublished) {
      // If recipe exists but isn't published, check if it belongs to current user
      const currentUserId = await getOptionalSession();
      if (session.userId !== currentUserId) {
        return err("recipe_not_public", 403)
      }
    }

    return ok({
      recipe: {
        id: session.id,
        recipeName: session.recipeName,
        recipeDesc: session.recipeDesc,
        totalSteps: session.totalSteps,
        status: session.status,
        ingredients: session.ingredients,
        servings: session.servings,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        steps: session.steps,
        result: session.result,
        user: session.user,
      },
    })
  } catch (e) {
    console.error("GET /api/recipe/[sessionId] error:", e)
    return err("internal_server_error", 500)
  }
}
