import { NextRequest } from "next/server";
import { getAuthUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { ok, err } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUserId();
    if (auth.error) {
      return auth.error;
    }
    const userId = auth.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, emailVerified: true },
    });

    if (!user) {
      return err("User not found", 404);
    }

    if (!user.emailVerified) {
      return err("Email must be verified to receive welcome email", 400);
    }

    // Send the welcome email since email is verified!
    await sendWelcomeEmail(user.email, user.name || "beta");

    return ok({ message: "Welcome email sent successfully" });
  } catch (e) {
    console.error("POST /api/auth/send-welcome error:", e);
    return err("Failed to send welcome email", 500);
  }
}
