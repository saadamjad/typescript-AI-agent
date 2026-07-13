import "server-only";
import { getZizkaDB } from "@/zizkadb/client";

/** Time-travel / state inspection — reconstructs agent state as of `timestamp`. */
export async function getStateAt(timestamp: Date) {
  const { db, agentName } = getZizkaDB();
  return db.at({ agent: agentName, timestamp });
}
