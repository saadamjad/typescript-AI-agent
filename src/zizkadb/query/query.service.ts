import "server-only";
import type { AgentEvent } from "zizkadb-sdk";
import { getZizkaDB } from "@/zizkadb/client";
import { getAgentSessions, getAgentStats } from "@/zizkadb/rest-client";

export interface QueryEventsOptions {
  limit?: number;
  before?: Date;
  after?: Date;
  eventType?: string;
  sessionId?: string;
}

/** Event query with filters (event type, session, time-range) — GET /v1/events. */
export async function queryEvents(options: QueryEventsOptions = {}): Promise<AgentEvent[]> {
  const { db, agentName } = getZizkaDB();
  return db.query({ agent: agentName, ...options });
}

export interface EventsPage {
  events: AgentEvent[];
  /**
   * ISO timestamp cursor for the next page. zizkadb-sdk@0.2.4's query()
   * doesn't expose the REST API's `offset` param, so pagination here uses a
   * `before`-timestamp cursor instead (the last event's timestamp).
   */
  nextBefore: string | null;
}

/** Cursor-paginated event query — pass `nextBefore` back in as `before` for the next page. */
export async function queryEventsPage(options: QueryEventsOptions = {}): Promise<EventsPage> {
  const limit = options.limit ?? 50;
  const events = await queryEvents({ ...options, limit });
  const nextBefore =
    events.length === limit ? events[events.length - 1].timestamp.toISOString() : null;
  return { events, nextBefore };
}

/** Timeline query — lists this agent's sessions (GET /v1/agents/{id}/sessions, REST-only). */
export async function getTimeline(limit = 50) {
  const { agentName } = getZizkaDB();
  return getAgentSessions(agentName, limit);
}

/** Aggregate/metadata query — event-type and volume stats (GET /v1/agents/{id}/stats, REST-only). */
export async function getAgentStatsSummary() {
  const { agentName } = getZizkaDB();
  return getAgentStats(agentName);
}
