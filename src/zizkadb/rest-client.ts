import "server-only";
import { getZizkaDBConnection } from "@/zizkadb/client";
import {
  fetchAgentStats,
  fetchAgentSessions,
  fetchBehaviorChange,
  type AgentSession,
  type AgentStats,
  type BehaviorChangeResult,
  type BehaviorChangeWindow,
} from "@/zizkadb/rest";

export type { AgentSession, AgentStats, BehaviorChangeResult, BehaviorChangeWindow } from "@/zizkadb/rest";

export async function getAgentStats(agent: string): Promise<AgentStats> {
  const { baseUrl, apiKey } = getZizkaDBConnection();
  return fetchAgentStats(baseUrl, apiKey, agent);
}

export async function getAgentSessions(agent: string, limit = 50): Promise<AgentSession[]> {
  const { baseUrl, apiKey } = getZizkaDBConnection();
  return fetchAgentSessions(baseUrl, apiKey, agent, limit);
}

export async function getBehaviorChange(
  agent: string,
  window: BehaviorChangeWindow = "7d",
  fromTs?: string,
  toTs?: string,
): Promise<BehaviorChangeResult> {
  const { baseUrl, apiKey } = getZizkaDBConnection();
  return fetchBehaviorChange(baseUrl, apiKey, agent, window, fromTs, toTs);
}
