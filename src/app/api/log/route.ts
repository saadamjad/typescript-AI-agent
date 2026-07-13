import { NextResponse } from "next/server";
import { logAgentEvent } from "@/zizkadb/events/event-logger";
import { logEventRequestSchema, type LogEventResponse } from "@/types/logging";

/**
 * Server-side proxy for ZizkaDB logging. Keeps ZIZKADB_API_KEY out of the
 * browser bundle. Never surfaces failures to the caller as an error status —
 * logging must not be able to break the chat UI.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = logEventRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ eventId: null }, { status: 202 });
  }

  try {
    const result = await logAgentEvent(parsed.data);
    return NextResponse.json({ eventId: result.eventId } satisfies LogEventResponse);
  } catch (error) {
    console.warn("ZizkaDB logging failed", error);
    return NextResponse.json({ eventId: null }, { status: 202 });
  }
}
