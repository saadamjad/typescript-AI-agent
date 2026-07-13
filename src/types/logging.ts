import { z } from "zod";
import { EVENT_TYPES } from "@/zizkadb/events/event-types";

export const logEventRequestSchema = z.object({
  event: z.enum(EVENT_TYPES),
  data: z.record(z.unknown()),
  sessionId: z.string().min(1),
  parentId: z.string().min(1).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type LogEventRequest = z.infer<typeof logEventRequestSchema>;

export interface LogEventResponse {
  eventId: string;
}
