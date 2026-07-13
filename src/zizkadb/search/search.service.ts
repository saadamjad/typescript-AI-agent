import "server-only";
import { getZizkaDB } from "@/zizkadb/client";

/** Semantic search over this agent's event history. */
export async function searchEvents(query: string, limit = 10) {
  const { db, agentName } = getZizkaDB();
  return db.search({ query, agent: agentName, limit });
}
