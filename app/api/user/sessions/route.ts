import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, err } from "@/lib/api-response"
import { requireAuth } from "@/lib/auth-session"

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth()
    
    const sessions = await prisma.cookingSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        result: {
          select: {
            id: true,
            score: true,
            isPublished: true,
            foodPhotoUrl: true,
            recipeName: true,
            createdAt: true,
          }
        }
      }
    })

    return ok({ sessions })
  } catch (error) {
    console.error("GET /api/user/sessions error:", error)
    return err("internal_server_error", 500)
  }
}
