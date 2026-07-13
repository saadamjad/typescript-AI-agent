import "server-only";
import { getZizkaDB } from "@/zizkadb/client";
import type { AgentEventType } from "@/zizkadb/events/event-types";

export interface LogAgentEventInput {
  event: AgentEventType;
  data: Record<string, unknown>;
  sessionId: string;
  parentId?: string;
  metadata?: Record<string, unknown>;
}

export async function logAgentEvent(input: LogAgentEventInput) {
  const { db, agentName } = getZizkaDB();
  return db.log({
    agent: agentName,
    event: input.event,
    data: input.data,
    sessionId: input.sessionId,
    parentId: input.parentId,
    metadata: input.metadata,
  });
}
