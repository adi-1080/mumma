import { z } from "zod"

export const VoiceChatSchema = z.object({
  stepId: z
    .string()
    .min(1, "stepId is required"),
  userMessage: z
    .string()
    .min(1, "userMessage is required")
    .max(500, "userMessage must be 500 characters or less"),
})
