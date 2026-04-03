import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, err } from "@/lib/api-response"

export async function GET(request: NextRequest) {
  try {
    const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1))
    const limit = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? 12)))
    const skip = (page - 1) * limit

    const [posts, total] = await prisma.$transaction([
      prisma.communityPost.findMany({
        where: { result: { isPublished: true } },
        include: {
          result: {
            select: {
              sessionId: true,
              score: true,
              recipeName: true,
              foodPhotoUrl: true,
              selfieUrl: true,
            },
          },
          user: { 
            select: { 
              name: true, 
              image: true
            } 
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.communityPost.count({
        where: { result: { isPublished: true } },
      }),
    ])

    return ok({
      posts: posts.map((p: any) => ({
        id: p.id,
        caption: p.caption,
        createdAt: p.createdAt,
        sessionId: p.result.sessionId, // Correctly use the result's actual sessionId
        user: p.user ? { 
          name: p.user.name, 
          image: p.user.image,
          username: p.user.username 
        } : null,
        result: p.result,
      })),
      total,
      page,
      hasMore: skip + posts.length < total,
    })
  } catch (e) {
    console.error("GET /api/community error:", e)
    return err("internal_server_error", 500)
  }
}
