import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, err } from "@/lib/api-response"
import { requireAuth } from "@/lib/auth-session"

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth()
    
    const recipes = await prisma.recipe.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        ingredients: true,
        instructions: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return ok({ recipes })
  } catch (error) {
    console.error("GET /api/user/recipes error:", error)
    return err("internal_server_error", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth()
    const { title, ingredients, instructions } = await request.json()

    if (!title || !ingredients || !instructions) {
      return err("missing_fields", 400)
    }

    const recipe = await prisma.recipe.create({
      data: {
        id: `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        ingredients,
        instructions,
        userId,
      }
    })

    return ok({ recipe })
  } catch (error) {
    console.error("POST /api/user/recipes error:", error)
    return err("internal_server_error", 500)
  }
}
