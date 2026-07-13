import type { ZizkaDB } from "zizkadb-sdk";
import { randomUUID } from "node:crypto";

export interface SessionResult {
  sessionId: string;
  lastEventId: string;
}

/**
 * Drives one full chat session through the real agent decision logic
 * (@/agent/run-agent-turn) and logs every step directly via the SDK,
 * building the same causal chain the app produces via /api/log — just
 * invoked outside the Next.js server so it can run standalone against cloud.
 */
export async function runSession(
  db: ZizkaDB,
  agent: string,
  messages: string[],
): Promise<SessionResult> {
  const { runAgentTurn } = await import("@/agent/run-agent-turn");
  const sessionId = `sess_${randomUUID()}`;

  const started = await db.log({ agent, event: "session_started", data: {}, sessionId });
  let parentId: string | undefined = started.eventId;

  for (const message of messages) {
    const userEvent = await db.log({
      agent,
      event: "user_message",
      data: { content: message },
      sessionId,
      parentId,
    });
    parentId = userEvent.eventId;

    const { steps, statePatch } = await runAgentTurn(message);
    for (const step of steps) {
      const logged = await db.log({ agent, event: step.event, data: step.data, sessionId, parentId });
      parentId = logged.eventId;
    }
    if (statePatch) {
      const logged = await db.log({ agent, event: "STATE_SET", data: statePatch, sessionId, parentId });
      parentId = logged.eventId;
    }
  }

  const ended = await db.log({ agent, event: "session_ended", data: {}, sessionId, parentId });
  return { sessionId, lastEventId: ended.eventId };
}
