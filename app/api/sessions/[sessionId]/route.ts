import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOptionalSession, requireAuth } from "@/lib/auth-session"
import { ok, err } from "@/lib/api-response"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const userId = await getOptionalSession()

    const session = await prisma.cookingSession.findUnique({
      where: { id: sessionId },
      include: {
        steps: {
          orderBy: { stepNumber: "asc" },
          include: {
            chats: { orderBy: { createdAt: "asc" } },
          },
        },
      },
    })

    if (!session) return err("session_not_found", 404)

    // If session belongs to a user, verify ownership
    if (session.userId && session.userId !== userId) {
      return err("unauthorized", 403)
    }

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
          chats: s.chats.map((c) => ({
            id: c.id,
            role: c.role,
            content: c.content,
            createdAt: c.createdAt,
          })),
        })),
      },
    })
  } catch (e) {
    console.error("GET /api/sessions/[sessionId] error:", e)
    return err("internal_server_error", 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const userId = await requireAuth()
    const { sessionId } = await params

    // Check if session belongs to user
    const session = await prisma.cookingSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return err("session_not_found", 404)
    }

    if (session.userId !== userId) {
      return err("unauthorized", 403)
    }

    // Delete the session and related data
    await prisma.cookingSession.delete({
      where: { id: sessionId }
    })

    return ok({ message: "Cooking session deleted successfully" })
  } catch (error) {
    console.error("DELETE /api/sessions/[sessionId] error:", error)
    return err("internal_server_error", 500)
  }
}
