import "server-only";
import { getZizkaDB } from "@/zizkadb/client";

/** Session replay/diff — summarizes what happened in a session, for debugging past runs. */
export async function getSessionReplay(sessionId: string) {
  const { db } = getZizkaDB();
  return db.memoryDiff(sessionId);
}
