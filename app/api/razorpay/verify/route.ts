import { NextRequest } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { getAuthUserId } from "@/lib/auth-session"
import { ok, err } from "@/lib/api-response"

import { getRazorpay } from "@/lib/razorpay"

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const auth = await getAuthUserId()
    if (auth.error) return auth.error

    const userId = auth.userId

    // 2. Parse and validate body
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return err(
        "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature",
        400
      )
    }

    // 3. Verify signature using HMAC-SHA256
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      console.error("RAZORPAY_KEY_SECRET is not configured")
      return err("Payment verification unavailable. Please contact support.", 500)
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    // Use timingSafeEqual to prevent timing attacks
    const isValid =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpay_signature)
      )

    if (!isValid) {
      return err("Invalid payment signature. Verification failed.", 400)
    }

    // 4. Find the payment record
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    })

    if (!payment) {
      return err("Payment record not found for this order.", 400)
    }

    if (payment.userId !== userId) {
      return err("Unauthorized: This payment does not belong to you.", 401)
    }

    if (payment.status === "SUCCESS") {
      return ok({ success: true, plan: "PRO", message: "Payment already verified." })
    }

    // 5. Fetch payment details to retrieve customer_id if associated
    let customerId: string | null = null
    try {
      const paymentDetails = await getRazorpay().payments.fetch(razorpay_payment_id)
      if (paymentDetails && typeof paymentDetails === "object") {
        customerId = (paymentDetails.customer_id as string) || null
      }
    } catch (fetchErr) {
      console.warn("Failed to fetch payment details from Razorpay:", fetchErr)
    }

    // 6. Transaction: update Payment + upgrade User to PRO
    await prisma.$transaction([
      prisma.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "SUCCESS",
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          plan: "PRO",
          ttsCharacterLimit: 50000,
          razorpayCustomerId: customerId,
        },
      }),
    ])

    return ok({ success: true, plan: "PRO" })
  } catch (e) {
    console.error("POST /api/razorpay/verify error:", e)
    return err("Payment verification failed. Please contact support.", 500)
  }
}
