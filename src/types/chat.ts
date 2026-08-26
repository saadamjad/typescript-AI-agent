import { z } from "zod";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  message: string;
}

const usageSchema = z
  .object({
    model: z.string().optional(),
    prompt_tokens: z.number().optional(),
    completion_tokens: z.number().optional(),
    total_tokens: z.number().optional(),
  })
  .partial();

export const chatResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    response: z.string(),
    usage: usageSchema.optional(),
  }),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;
