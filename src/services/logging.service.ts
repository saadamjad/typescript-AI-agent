import { API_ENDPOINTS } from "@/constants/api";
import type { LogEventRequest, LogEventResponse } from "@/types/logging";

/**
 * Fire-and-forget event log to ZizkaDB via the server-side /api/log proxy.
 * Never throws — a logging failure must not affect the chat experience.
 */
export async function logEvent(
  event: LogEventRequest["event"],
  data: Record<string, unknown>,
  sessionId: string,
  parentId?: string,
  metadata?: Record<string, unknown>,
): Promise<string | undefined> {
  try {
    const response = await fetch(API_ENDPOINTS.LOG, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        data,
        sessionId,
        parentId,
        metadata,
      } satisfies LogEventRequest),
    });

    if (!response.ok) {
      return undefined;
    }

    const result = (await response.json()) as LogEventResponse;
    return result.eventId ?? undefined;
  } catch (error) {
    console.warn("Failed to log event to ZizkaDB", error);
    return undefined;
  }
}
