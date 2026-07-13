import "server-only";
import { getZizkaDB } from "@/zizkadb/client";

export interface ContextForOptions {
  maxTokens?: number;
  sessionId?: string;
}

/** Prompt-ready memory block (recent + semantically relevant past events) for a given task. */
export async function getContextFor(task: string, options: ContextForOptions = {}) {
  const { db, agentName } = getZizkaDB();
  return db.contextForFull({ agent: agentName, task, ...options });
}
