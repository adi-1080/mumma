import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOptionalSession } from "@/lib/auth-session"
import { ok, err } from "@/lib/api-response"
import { CompleteStepSchema } from "@/lib/validators/session"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; stepId: string }> }
) {
  try {
    const { sessionId, stepId } = await params
    const body = await request.json()
    const parsed = CompleteStepSchema.safeParse(body)
    if (!parsed.success) return err("isCompleted must be true", 400)

    const userId = await getOptionalSession()

    // Verify session exists and ownership
    const session = await prisma.cookingSession.findUnique({ where: { id: sessionId } })
    if (!session) return err("session_not_found", 404)
    if (session.userId && session.userId !== userId) {
      return err("unauthorized", 403)
    }

    // Verify step belongs to session
    const step = await prisma.cookingStep.findFirst({
      where: { 
        sessionId: sessionId,
        OR: [
          { id: stepId },
          ...(isNaN(Number(stepId)) ? [] : [{ stepNumber: Number(stepId) }])
        ]
      },
    })
    if (!step) return err("step_not_found", 404)

    // Mark step completed
    const updatedStep = await prisma.cookingStep.update({
      where: { id: step.id },
      data: { isCompleted: true },
    })

    // Check if all steps are now completed
    const incompleteCount = await prisma.cookingStep.count({
      where: { sessionId: sessionId, isCompleted: false },
    })

    let sessionCompleted = false
    if (incompleteCount === 0) {
      await prisma.cookingSession.update({
        where: { id: sessionId },
        data: { status: "COMPLETED" },
      })
      sessionCompleted = true
    }

    return ok({
      step: {
        id: updatedStep.id,
        stepNumber: updatedStep.stepNumber,
        title: updatedStep.title,
        isCompleted: updatedStep.isCompleted,
      },
      sessionCompleted,
    })
  } catch (e) {
    console.error("PATCH /api/sessions/[sessionId]/step/[stepId] error:", e)
    return err("internal_server_error", 500)
  }
}
