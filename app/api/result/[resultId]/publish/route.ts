import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOptionalSession } from "@/lib/auth-session"
import { ok, err } from "@/lib/api-response"
import { PublishSchema } from "@/lib/validators/session"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params
    const body = await request.json()
    const parsed = PublishSchema.safeParse(body)
    if (!parsed.success) return err("caption max 280 chars", 400)

    const userId = await getOptionalSession()

    const result = await prisma.cookResult.findUnique({
      where: { id: resultId },
      include: { communityPost: true },
    })
    if (!result) return err("result_not_found", 404)
    if (result.userId && result.userId !== userId) {
      return err("unauthorized", 403)
    }

    // Already published — return existing post
    if (result.communityPost) {
      return ok({
        post: {
          id: result.communityPost.id,
          caption: result.communityPost.caption,
          result: {
            score: result.score,
            recipeName: result.recipeName,
            foodPhotoUrl: result.foodPhotoUrl,
            selfieUrl: result.selfieUrl,
          },
          createdAt: result.communityPost.createdAt,
        },
      })
    }

    const now = new Date()
    const [post] = await prisma.$transaction([
      prisma.communityPost.create({
        data: {
          resultId,
          userId,
          caption: parsed.data.caption ?? null,
        },
      }),
      prisma.cookResult.update({
        where: { id: resultId },
        data: { isPublished: true, publishedAt: now },
      }),
    ])

    return ok({
      post: {
        id: post.id,
        caption: post.caption,
        result: {
          score: result.score,
          recipeName: result.recipeName,
          foodPhotoUrl: result.foodPhotoUrl,
          selfieUrl: result.selfieUrl,
        },
        createdAt: post.createdAt,
      },
    })
  } catch (e) {
    console.error("POST /api/result/[resultId]/publish error:", e)
    return err("internal_server_error", 500)
  }
}
