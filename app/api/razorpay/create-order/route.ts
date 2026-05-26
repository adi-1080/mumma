import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRazorpay } from "@/lib/razorpay"
import { getAuthUserId } from "@/lib/auth-session"
import { ok, err } from "@/lib/api-response"

/** ₹199 Pro Plan — amount in paise */
const PRO_PLAN_AMOUNT = 19900
const CURRENCY = "INR"

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const auth = await getAuthUserId()
    if (auth.error) return auth.error

    const userId = auth.userId

    // 2. Create Razorpay order
    const order = await getRazorpay().orders.create({
      amount: PRO_PLAN_AMOUNT,
      currency: CURRENCY,
      receipt: `pro_${userId.slice(0, 20)}_${Date.now().toString(36)}`,
      notes: {
        userId,
        plan: "PRO",
      },
    })

    // 3. Create Payment record in DB
    await prisma.payment.create({
      data: {
        userId,
        razorpayOrderId: order.id,
        amount: PRO_PLAN_AMOUNT,
        currency: CURRENCY,
        status: "PENDING",
        planPurchased: "PRO",
      },
    })

    // 4. Return order details to the client
    return ok({
      orderId: order.id,
      amount: PRO_PLAN_AMOUNT,
      currency: CURRENCY,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (e) {
    console.error("POST /api/razorpay/create-order error:", e)
    return err("Failed to create order. Please try again.", 500)
  }
}
