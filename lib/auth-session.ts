import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function getOptionalSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    return session?.user?.id ?? null
  } catch {
    return null
  }
}

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    throw new Response(
      JSON.stringify({ error: "unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }
  return session.user.id
}

/**
 * Non-throwing auth helper for API route handlers.
 * Returns { userId } on success, or { error: Response } on failure.
 */
export async function getAuthUserId(): Promise<
  { userId: string; error?: never } | { userId?: never; error: Response }
> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session?.user?.id) {
      return {
        error: Response.json(
          { error: "Unauthorized. Please sign in." },
          { status: 401 }
        ),
      }
    }
    return { userId: session.user.id }
  } catch {
    return {
      error: Response.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      ),
    }
  }
}
