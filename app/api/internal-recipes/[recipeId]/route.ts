import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, err } from "@/lib/api-response"
import { requireAuth } from "@/lib/auth-session"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  try {
    const userId = await requireAuth()
    const { recipeId } = await params

    // Check if recipe belongs to user
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId }
    })

    if (!recipe) {
      return err("recipe_not_found", 404)
    }

    if (recipe.userId !== userId) {
      return err("unauthorized", 403)
    }

    // Delete the recipe
    await prisma.recipe.delete({
      where: { id: recipeId }
    })

    return ok({ message: "Recipe deleted successfully" })
  } catch (error) {
    console.error("DELETE /api/recipe/[recipeId] error:", error)
    return err("internal_server_error", 500)
  }
}