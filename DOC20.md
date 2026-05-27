# DOC20 — Testing Razorpay & Voice Chat API Endpoints

## Prerequisites

Add these environment variables to `.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FISH_AUDIO_API_KEY=your_fish_audio_api_key
FISH_AUDIO_VOICE_ID=933563129e564b19a115bedd57b7406a
```

Start the dev server:

```bash
npm run dev
```

> **Note:** All endpoints require authentication via Better Auth session cookies.
> For curl testing, you must first sign in through the browser and extract your session cookie.
> Replace `YOUR_SESSION_COOKIE` below with the actual cookie value from your browser.

---

## 1. POST /api/razorpay/create-order

Creates a Razorpay order for the ₹199 Pro Plan.

### Request

```bash
curl -X POST http://localhost:3000/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_COOKIE"
```

### Success Response (200)

```json
{
  "orderId": "order_XXXXXXXXXXXXXX",
  "amount": 19900,
  "currency": "INR",
  "key": "rzp_test_xxxxxxxxxxxx"
}
```

### Error Responses

| Status | Body | Cause |
|--------|------|-------|
| 401 | `{ "error": "Unauthorized. Please sign in." }` | No session cookie / expired session |
| 500 | `{ "error": "Failed to create order. Please try again." }` | Razorpay API or DB failure |

---

## 2. POST /api/razorpay/verify

Verifies the Razorpay payment signature and upgrades user to PRO.

### Request

```bash
curl -X POST http://localhost:3000/api/razorpay/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_COOKIE" \
  -d '{
    "razorpay_order_id": "order_XXXXXXXXXXXXXX",
    "razorpay_payment_id": "pay_XXXXXXXXXXXXXX",
    "razorpay_signature": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }'
```

### Success Response (200)

```json
{
  "success": true,
  "plan": "PRO"
}
```

### Error Responses

| Status | Body | Cause |
|--------|------|-------|
| 400 | `{ "error": "Missing required fields: ..." }` | Missing body fields |
| 400 | `{ "error": "Invalid payment signature. Verification failed." }` | Tampered or incorrect signature |
| 400 | `{ "error": "Payment record not found for this order." }` | No matching order in DB |
| 401 | `{ "error": "Unauthorized. Please sign in." }` | No session |
| 401 | `{ "error": "Unauthorized: This payment does not belong to you." }` | Order belongs to a different user |
| 500 | `{ "error": "Payment verification failed. ..." }` | DB transaction failure |

### Testing Signature Verification (Invalid Signature)

```bash
curl -X POST http://localhost:3000/api/razorpay/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_COOKIE" \
  -d '{
    "razorpay_order_id": "order_test123",
    "razorpay_payment_id": "pay_test123",
    "razorpay_signature": "invalid_signature_here"
  }'
```

Expected: `400 — { "error": "Invalid payment signature. Verification failed." }`

---

## 3. POST /api/chat/voice

Sends a user message in the context of a cooking step, generates an AI response (Mumma's voice), converts it to audio via TTS, and returns both text and Base64-encoded MP3.

### Request

```bash
curl -X POST http://localhost:3000/api/chat/voice \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_COOKIE" \
  -d '{
    "stepId": "YOUR_COOKING_STEP_ID",
    "userMessage": "Mumma, how much oil should I add?"
  }'
```

### Success Response (200)

```json
{
  "text": "Just add about 2 tablespoons of oil, beta. Let it heat up until you see a slight shimmer before adding anything else.",
  "audio": "//uQxAAAAAANIAAAAAE...",
  "audioFormat": "mp3",
  "ttsCharsUsed": 1250,
  "ttsCharsLimit": 10000
}
```

> The `audio` field is a Base64-encoded MP3 string. Decode it client-side and play it directly.

### Playing the Audio (Browser)

```javascript
const data = await response.json();
const audioBlob = new Blob(
  [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
  { type: 'audio/mpeg' }
);
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
audio.play();
```

### Error Responses

| Status | Body | Cause |
|--------|------|-------|
| 400 | `{ "error": "stepId is required" }` | Missing or empty stepId |
| 400 | `{ "error": "userMessage is required" }` | Missing or empty message |
| 400 | `{ "error": "userMessage must be 500 characters or less" }` | Message too long |
| 401 | `{ "error": "Unauthorized. Please sign in." }` | No session |
| 402 | `{ "error": "TTS character quota exceeded. ..." }` | Free tier limit reached |
| 404 | `{ "error": "Cooking step not found." }` | Invalid stepId |
| 404 | `{ "error": "User not found." }` | User deleted/corrupted |
| 500 | `{ "error": "Voice generation failed. ..." }` | Fish Audio API error |
| 500 | `{ "error": "Mumma is speechless right now. ..." }` | LLM returned empty response |
| 500 | `{ "error": "Voice chat failed. ..." }` | General server error |

### Testing Without Auth (Expected 401)

```bash
curl -X POST http://localhost:3000/api/chat/voice \
  -H "Content-Type: application/json" \
  -d '{ "stepId": "test", "userMessage": "hello" }'
```

Expected: `401 — { "error": "Unauthorized. Please sign in." }`

---

## Postman Collection Setup

1. Create a new collection named **Mumma's Kitchen API**
2. Set a collection variable `base_url` = `http://localhost:3000`
3. For auth, add a cookie `better-auth.session_token` in the Cookie header for all requests
4. Import the three endpoints above with their respective bodies

---

## Architecture Summary

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Client App    │────▶│  Next.js API      │────▶│  Razorpay   │
│                 │◀────│  Route Handlers   │◀────│  API        │
└─────────────────┘     │                  │     └─────────────┘
                        │  ┌────────────┐  │
                        │  │  Prisma    │  │     ┌─────────────┐
                        │  │  (Postgres)│  │────▶│  OpenRouter  │
                        │  └────────────┘  │◀────│  (LLM)      │
                        │                  │     └─────────────┘
                        │                  │
                        │                  │     ┌─────────────┐
                        │                  │────▶│  Fish Audio  │
                        │                  │◀────│  (TTS)       │
                        └──────────────────┘     └─────────────┘
```
