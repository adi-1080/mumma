import OpenAI from "openai"

export const openRouterModels = {
  recipe: process.env.OPENROUTER_RECIPE_MODEL || "cohere/north-mini-code:free",
  stepChat: process.env.OPENROUTER_STEP_CHAT_MODEL || "cohere/north-mini-code:free",
  voice: process.env.OPENROUTER_VOICE_MODEL || "cohere/north-mini-code:free",
} as const

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL!,
    "X-Title": "Mumma's Kitchen",
  },
})
