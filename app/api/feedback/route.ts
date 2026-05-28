import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUserId } from "@/lib/auth-session"
import { ok, err } from "@/lib/api-response"

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUserId()
    if (auth.error) {
      return auth.error
    }
    const userId = auth.userId

    const body = await request.json()
    const { message, rating, category } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return err("Feedback message is required", 400)
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        message: message.trim(),
        rating: rating ? parseInt(rating, 10) : null,
        category: category || null,
      }
    })

    return ok({ success: true, feedbackId: feedback.id })
  } catch (e) {
    console.error("POST /api/feedback error:", e)
    return err("Failed to submit feedback. Please try again.", 500)
  }
}
