import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOptionalSession } from "@/lib/auth-session"
import { ok, err } from "@/lib/api-response"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await getOptionalSession()

    const session = await prisma.cookingSession.findUnique({
      where: { id },
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
    console.error("GET /api/session/[id] error:", e)
    return err("internal_server_error", 500)
  }
}
