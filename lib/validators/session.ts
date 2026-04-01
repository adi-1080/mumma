import { z } from "zod"

export const StartSessionSchema = z.object({
  ingredients: z.array(z.string().min(1).max(40)).min(1).max(15),
})

export const StepChatSchema = z.object({
  message: z.string().min(1).max(500),
})

export const PublishSchema = z.object({
  caption: z.string().max(280).optional(),
})

export const CompleteStepSchema = z.object({
  isCompleted: z.literal(true),
})
