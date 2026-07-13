import "server-only";
import { getZizkaDB } from "@/zizkadb/client";
import {
  getBehaviorChange as fetchBehaviorChange,
  type BehaviorChangeWindow,
} from "@/zizkadb/rest-client";

/** Session-count-based behavioral baseline + drift score (recent N sessions vs. everything before). */
export async function getBaseline(recentWindow = 50) {
  const { db, agentName } = getZizkaDB();
  return db.baseline({ agent: agentName, recentWindow });
}

/**
 * Calendar-time-windowed behavior change (24h/7d/30d/custom vs. everything
 * before the window). Not wrapped by zizkadb-sdk@0.2.4 — called via REST directly.
 */
export async function getBehaviorChange(
  window: BehaviorChangeWindow = "7d",
  fromTs?: string,
  toTs?: string,
) {
  const { agentName } = getZizkaDB();
  return fetchBehaviorChange(agentName, window, fromTs, toTs);
}
