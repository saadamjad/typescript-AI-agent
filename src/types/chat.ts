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

export const chatResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    response: z.string(),
  }),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;
