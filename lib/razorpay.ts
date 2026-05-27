import Razorpay from "razorpay"

let _razorpay: Razorpay | null = null

/**
 * Lazily initialized Razorpay client.
 * Defers initialization to request-time so the build doesn't fail
 * when RAZORPAY env vars aren't set at compile time.
 */
export function getRazorpay(): Razorpay {
  if (!_razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        "Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables"
      )
    }
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
  return _razorpay
}
