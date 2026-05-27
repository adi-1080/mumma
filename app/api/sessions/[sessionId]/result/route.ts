import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOptionalSession } from "@/lib/auth-session"
import { ok, err } from "@/lib/api-response"
import { put } from "@vercel/blob"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const userId = await getOptionalSession()

    const session = await prisma.cookingSession.findUnique({ where: { id: sessionId } })
    if (!session) return err("session_not_found", 404)
    if (session.userId && session.userId !== userId) {
      return err("unauthorized", 403)
    }
    if (session.status !== "COMPLETED") {
      return err("session_not_completed", 400)
    }

    // If result already exists, return it
    const existing = await prisma.cookResult.findUnique({
      where: { sessionId: sessionId },
    })
    if (existing) return ok({ result: existing })

    const formData = await request.formData()
    let foodPhotoUrl: string | null = null
    let selfieUrl: string | null = null

    const foodPhoto = formData.get("foodPhoto") as File | null
    if (foodPhoto && foodPhoto.size > 0) {
      if (foodPhoto.size > 5 * 1024 * 1024) return err("foodPhoto max 5MB", 400)
      if (!["image/jpeg", "image/jpg", "image/png"].includes(foodPhoto.type)) {
        return err("foodPhoto must be jpeg, jpg, or png", 400)
      }
      const blob = await put(`food/${sessionId}-${Date.now()}.${foodPhoto.type === "image/png" ? "png" : "jpg"}`, foodPhoto, { access: "public" })
      foodPhotoUrl = blob.url
    }

    const selfie = formData.get("selfie") as File | null
    if (selfie && selfie.size > 0) {
      if (selfie.size > 5 * 1024 * 1024) return err("selfie max 5MB", 400)
      if (!["image/jpeg", "image/jpg", "image/png"].includes(selfie.type)) {
        return err("selfie must be jpeg, jpg, or png", 400)
      }
      const blob = await put(`selfie/${sessionId}-${Date.now()}.${selfie.type === "image/png" ? "png" : "jpg"}`, selfie, { access: "public" })
      selfieUrl = blob.url
    }

    const score = Math.floor(Math.random() * 4) + 7

    const result = await prisma.cookResult.create({
      data: {
        sessionId: sessionId,
        userId,
        score,
        foodPhotoUrl,
        selfieUrl,
        recipeName: session.recipeName,
        ingredients: session.ingredients as unknown as string[],
        servings: session.servings,
      },
    })

    return ok({
      result: {
        id: result.id,
        score: result.score,
        foodPhotoUrl: result.foodPhotoUrl,
        selfieUrl: result.selfieUrl,
        recipeName: result.recipeName,
        isPublished: result.isPublished,
        createdAt: result.createdAt,
      },
    })
  } catch (e) {
    console.error("POST /api/sessions/[sessionId]/result error:", e)
    return err("internal_server_error", 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const userId = await getOptionalSession()

    const existing = await prisma.cookResult.findUnique({
      where: { sessionId: sessionId },
    })
    
    if (!existing) return err("result_not_found_run_post_first", 404)
    if (existing.userId && existing.userId !== userId) {
      return err("unauthorized", 403)
    }

    const formData = await request.formData()
    let foodPhotoUrl = existing.foodPhotoUrl
    let selfieUrl = existing.selfieUrl

    const foodPhoto = formData.get("foodPhoto") as File | null
    if (foodPhoto && foodPhoto.size > 0) {
      if (foodPhoto.size > 5 * 1024 * 1024) return err("foodPhoto max 5MB", 400)
      if (!["image/jpeg", "image/jpg", "image/png"].includes(foodPhoto.type)) {
        return err("foodPhoto must be jpeg, jpg, or png", 400)
      }
      const blob = await put(`food/${sessionId}-${Date.now()}.${foodPhoto.type === "image/png" ? "png" : "jpg"}`, foodPhoto, { access: "public" })
      foodPhotoUrl = blob.url
    }

    const selfie = formData.get("selfie") as File | null
    if (selfie && selfie.size > 0) {
      if (selfie.size > 5 * 1024 * 1024) return err("selfie max 5MB", 400)
      if (!["image/jpeg", "image/jpg", "image/png"].includes(selfie.type)) {
        return err("selfie must be jpeg, jpg, or png", 400)
      }
      const blob = await put(`selfie/${sessionId}-${Date.now()}.${selfie.type === "image/png" ? "png" : "jpg"}`, selfie, { access: "public" })
      selfieUrl = blob.url
    }

    const result = await prisma.cookResult.update({
      where: { sessionId: sessionId },
      data: {
        foodPhotoUrl,
        selfieUrl,
      },
    })

    return ok({
      result: {
        id: result.id,
        score: result.score,
        foodPhotoUrl: result.foodPhotoUrl,
        selfieUrl: result.selfieUrl,
        recipeName: result.recipeName,
        isPublished: result.isPublished,
        createdAt: result.createdAt,
      },
    })
  } catch (e) {
    console.error("PATCH /api/sessions/[sessionId]/result error:", e)
    return err("internal_server_error", 500)
  }
}
