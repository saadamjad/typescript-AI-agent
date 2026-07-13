import "server-only";
import { getZizkaDB } from "@/zizkadb/client";

/** Walks the causal chain (parent_id lineage) up from the given event. */
export async function getCausalChain(eventId: string, depth = 10) {
  const { db } = getZizkaDB();
  return db.why(eventId, depth);
}
