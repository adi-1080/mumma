import { NextRequest } from "next/server"
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
      select: { 
        id: true, 
        name: true, 
        email: true,
        username: true,
        bio: true,
        image: true,
        createdAt: true 
      },
    })
    if (!user) return err("user_not_found", 404)

    const [sessionsStarted, sessionsCompleted, sessions, postsPublished] =
      await prisma.$transaction([
        prisma.cookingSession.count({ where: { userId } }),
        prisma.cookingSession.count({ where: { userId, status: "COMPLETED" } }),
        prisma.cookingSession.findMany({
          where: { userId },
          include: {
            result: {
              select: {
                id: true,
                score: true,
                isPublished: true,
              }
            }
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.communityPost.count({ where: { userId } }),
      ])

    const avgScore =
      sessions
        .filter(s => s.result?.score)
        .length > 0
        ? Math.round(
            (sessions
              .filter(s => s.result?.score)
              .reduce((sum, s) => sum + s.result!.score, 0) / 
              sessions.filter(s => s.result?.score).length) *
              10
          ) / 10
        : 0

    return ok({
      user,
      sessions: sessions.map(s => ({
        id: s.id,
        recipeName: s.recipeName,
        status: s.status,
        totalSteps: s.totalSteps,
        createdAt: s.createdAt,
        score: s.result?.score,
        isPublished: s.result?.isPublished || false,
      })),
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

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireAuth()
    
    // Check if this is FormData (for image upload) or JSON (for text updates)
    const contentType = request.headers.get('content-type')
    let updateData: any = {}
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData (image upload)
      const formData = await request.formData()
      const image = formData.get('image') as File
      
      if (image && image.size > 0) {
        // Convert image to base64 or handle upload
        const bytes = await image.arrayBuffer()
        const base64 = Buffer.from(bytes).toString('base64')
        const mimeType = image.type
        updateData.image = `data:${mimeType};base64,${base64}`
      }
    } else {
      // Handle JSON (text updates)
      const body = await request.json()
      console.log('Received body:', body)
      
      // Validate input
      const { name, username, bio, image } = body
      
      if (name !== undefined) updateData.name = name
      if (username !== undefined) updateData.username = username
      if (bio !== undefined) updateData.bio = bio
      if (image !== undefined) updateData.image = image
    }

    console.log('Update data:', updateData)

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        createdAt: true,
      }
    })

    return ok({ user: updatedUser })
  } catch (e) {
    console.error("PATCH /api/user/profile error:", e)
    return err("internal_server_error", 500)
  }
}
