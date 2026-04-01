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
