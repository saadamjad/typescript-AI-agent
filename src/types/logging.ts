import { z } from "zod";

export const logEventRequestSchema = z.object({
  event: z.enum(["user_message", "assistant_response"]),
  data: z.record(z.unknown()),
  sessionId: z.string().min(1),
  parentId: z.string().min(1).optional(),
});

export type LogEventRequest = z.infer<typeof logEventRequestSchema>;

export interface LogEventResponse {
  eventId: string;
}
