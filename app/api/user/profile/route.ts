import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-session"
import { ok, err } from "@/lib/api-response"

export async function GET() {
  try {
    let userId: string
    try {
      userId = await requireAuth()
    } catch (response) {
      return response as Response
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    })
    if (!user) return err("user_not_found", 404)

    const [sessionsStarted, sessionsCompleted, results, postsPublished] =
      await prisma.$transaction([
        prisma.cookingSession.count({ where: { userId } }),
        prisma.cookingSession.count({ where: { userId, status: "COMPLETED" } }),
        prisma.cookResult.findMany({
          where: { userId },
          select: { score: true },
        }),
        prisma.communityPost.count({ where: { userId } }),
      ])

    const avgScore =
      results.length > 0
        ? Math.round(
            (results.reduce((sum, r) => sum + r.score, 0) / results.length) *
              10
          ) / 10
        : 0

    return ok({
      user,
      stats: {
        sessionsStarted,
        sessionsCompleted,
        avgScore,
        postsPublished,
      },
    })
  } catch (e) {
    console.error("GET /api/user/profile error:", e)
    return err("internal_server_error", 500)
  }
}
