import "server-only";
import { getZizkaDB } from "@/zizkadb/client";

/** Lists all agents ZizkaDB has seen for this tenant. */
export async function listAgents() {
  const { db } = getZizkaDB();
  return db.agents();
}
