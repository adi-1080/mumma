import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-session"
import { ok, err } from "@/lib/api-response"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params
    const userId = await requireAuth()

    const result = await prisma.cookResult.findUnique({
      where: { id: resultId },
      include: { communityPost: true },
    })
    if (!result) return err("result_not_found", 404)
    if (result.userId && result.userId !== userId) {
      return err("unauthorized", 403)
    }

    const newPublishedState = !result.isPublished

    if (newPublishedState) {
      // Publishing: Create community post
      const now = new Date()
      const [communityPost, updatedResult] = await prisma.$transaction([
        prisma.communityPost.create({
          data: {
            resultId,
            userId,
            caption: null, // User can add caption later
          },
        }),
        prisma.cookResult.update({
          where: { id: resultId },
          data: { isPublished: true, publishedAt: now },
        }),
      ])

      return ok({
        result: {
          id: updatedResult.id,
          isPublished: true,
          publishedAt: now,
          communityPost: {
            id: communityPost.id,
            caption: communityPost.caption,
            createdAt: communityPost.createdAt,
          },
        },
      })
    } else {
      // Unpublishing: Delete community post
      if (result.communityPost) {
        await prisma.$transaction([
          prisma.communityPost.delete({
            where: { id: result.communityPost.id },
          }),
          prisma.cookResult.update({
            where: { id: resultId },
            data: { isPublished: false, publishedAt: null },
          }),
        ])
      } else {
        await prisma.cookResult.update({
          where: { id: resultId },
          data: { isPublished: false, publishedAt: null },
        })
      }

      return ok({
        result: {
          id: resultId,
          isPublished: false,
          publishedAt: null,
        },
      })
    }
  } catch (e) {
    console.error("PATCH /api/result/[resultId]/toggle-visibility error:", e)
    return err("internal_server_error", 500)
  }
}
