/**
 * Pure (non "server-only") REST calls for the ZizkaDB endpoints
 * zizkadb-sdk@0.2.4 doesn't wrap yet: agent stats, session/timeline listing,
 * and time-windowed behavior-change. Parameterized on baseUrl/apiKey so it
 * can be used both from the Next.js server (via rest-client.ts) and from
 * standalone Node scripts (scripts/scenarios/*.ts).
 */

const DEFAULT_DEV_API_KEY = "zizkadb_dev_local";

function isLocalHost(baseUrl: string): boolean {
  return baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
}

export function resolveApiKey(baseUrl: string, apiKey?: string): string | undefined {
  if (apiKey) return apiKey;
  if (isLocalHost(baseUrl)) {
    return process.env.DEV_API_KEY ?? DEFAULT_DEV_API_KEY;
  }
  return undefined;
}

async function requestZizkaDB<T>(
  baseUrl: string,
  apiKey: string | undefined,
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const resolvedKey = resolveApiKey(baseUrl, apiKey);
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";

  const res = await fetch(`${baseUrl}${path}${qs}`, {
    headers: resolvedKey ? { Authorization: `Bearer ${resolvedKey}` } : {},
  });

  if (!res.ok) {
    throw new Error(`ZizkaDB REST request failed (${res.status}): ${path}`);
  }

  return res.json() as Promise<T>;
}

export interface AgentStats {
  agent: string;
  total_events: number;
  unique_event_types: number;
  sessions: number;
  first_event: string | null;
  last_event: string | null;
  top_events: { event: string; count: number }[];
}

export interface AgentSession {
  session_id: string;
  event_count: number;
  event_types: number;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  types: string[];
}

export type BehaviorChangeWindow = "24h" | "7d" | "30d" | "custom";

export interface BehaviorChangeResult {
  agent: string;
  status: string;
  [key: string]: unknown;
}

export async function fetchAgentStats(
  baseUrl: string,
  apiKey: string | undefined,
  agent: string,
): Promise<AgentStats> {
  return requestZizkaDB<AgentStats>(baseUrl, apiKey, `/v1/agents/${encodeURIComponent(agent)}/stats`);
}

export async function fetchAgentSessions(
  baseUrl: string,
  apiKey: string | undefined,
  agent: string,
  limit = 50,
): Promise<AgentSession[]> {
  return requestZizkaDB<AgentSession[]>(
    baseUrl,
    apiKey,
    `/v1/agents/${encodeURIComponent(agent)}/sessions`,
    { limit: String(limit) },
  );
}

export async function fetchBehaviorChange(
  baseUrl: string,
  apiKey: string | undefined,
  agent: string,
  window: BehaviorChangeWindow = "7d",
  fromTs?: string,
  toTs?: string,
): Promise<BehaviorChangeResult> {
  const params: Record<string, string> = { window };
  if (fromTs) params.from_ts = fromTs;
  if (toTs) params.to_ts = toTs;
  return requestZizkaDB<BehaviorChangeResult>(
    baseUrl,
    apiKey,
    `/v1/agents/${encodeURIComponent(agent)}/behavior-change`,
    params,
  );
}
