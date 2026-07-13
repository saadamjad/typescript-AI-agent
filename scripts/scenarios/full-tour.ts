/**
 * Runs one realistic session through the real agent logic, then exercises
 * every ZizkaDB capability against the data it just produced — events,
 * causality, query (filters + time-range + cursor pagination), search,
 * state/time-travel, context, replay, forget, agents, baseline, and
 * time-windowed behavior-change (via REST directly, since the TS SDK
 * doesn't wrap stats/sessions/behavior-change) — and prints a pass/fail
 * report. Supersedes scripts/test-zizkadb-query.ts for full coverage.
 *
 * Usage: npm run scenario:full-tour
 */
import { randomUUID } from "node:crypto";
import { ZizkaDB } from "zizkadb-sdk";
import { loadEnvLocal, requireEnv } from "./load-env";
import { runSession } from "./run-session";
import { fetchAgentSessions, fetchAgentStats, fetchBehaviorChange } from "@/zizkadb/rest";

const CLOUD_BASE_URL = "https://db.zizka.ai";

interface SectionResult {
  name: string;
  ok: boolean;
  detail: string;
}

const results: SectionResult[] = [];

async function section(name: string, fn: () => Promise<string>): Promise<void> {
  console.log(`\n=== ${name} ===`);
  try {
    const detail = await fn();
    console.log(detail);
    results.push({ name, ok: true, detail });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAILED: ${message}`);
    results.push({ name, ok: false, detail: message });
  }
}

async function main() {
  loadEnvLocal();
  const apiKey = process.env.ZIZKADB_API_KEY;
  const host = process.env.ZIZKADB_HOST;
  if (!apiKey && !host) {
    throw new Error("ZIZKADB_API_KEY or ZIZKADB_HOST is required. Set it in .env.local.");
  }
  const agent = requireEnv("ZIZKADB_AGENT_NAME");
  const baseUrl = (host ?? CLOUD_BASE_URL).replace(/\/$/, "");
  const db = host ? new ZizkaDB({ host }) : new ZizkaDB({ apiKey });

  let sessionId = "";
  let lastEventId = "";

  await section("1. Events + Causality — running one realistic session", async () => {
    const result = await runSession(db, agent, [
      "Hello, how are you?",
      "What's my current bill?",
      "I want a refund, my item was damaged.",
    ]);
    sessionId = result.sessionId;
    lastEventId = result.lastEventId;

    const chain = await db.why(lastEventId);
    return `session ${sessionId} logged, ${chain.chainLength} events in the causal chain leading to ${lastEventId}`;
  });

  await section("2. Query — filters, time-range, cursor pagination", async () => {
    const page1 = await db.query({ agent, limit: 5 });
    let detail = `page 1: ${page1.map((e) => e.event).join(", ")}`;
    if (page1.length > 0) {
      const page2 = await db.query({ agent, limit: 5, before: page1[page1.length - 1].timestamp });
      detail += `\npage 2 (before=${page1[page1.length - 1].timestamp.toISOString()}): ${page2.map((e) => e.event).join(", ") || "(none)"}`;
    }
    const toolResults = await db.query({ agent, eventType: "tool_result", limit: 5 });
    detail += `\nfiltered by eventType=tool_result: ${toolResults.length} events`;
    const sessionEvents = await db.query({ agent, sessionId, limit: 50 });
    detail += `\nfiltered by sessionId=${sessionId}: ${sessionEvents.length} events`;
    return detail;
  });

  await section("3. Search — semantic search", async () => {
    try {
      const searchResults = await db.search({ query: "money back for a damaged item", agent, limit: 5 });
      return (
        searchResults.map((e) => `${e.event} (score=${e.score?.toFixed(3) ?? "n/a"})`).join("\n") ||
        "(no results)"
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("Embedding generation failed")) {
        return "SKIPPED: no embeddings provider configured for this tenant (Dashboard -> Settings -> Embeddings).";
      }
      throw error;
    }
  });

  await section("4. State — time travel", async () => {
    const state = await db.at({ agent, timestamp: new Date() });
    return `state at now: ${JSON.stringify(state.state)} (${state.eventCount} events considered)`;
  });

  await section("5. Context — prompt-ready memory injection", async () => {
    const context = await db.contextForFull({ agent, task: "user asking about a refund" });
    return `${context.eventCount} events, ~${context.estimatedTokens} tokens:\n${context.context.slice(0, 300)}...`;
  });

  await section("6. Replay — session diff", async () => {
    const diff = await db.memoryDiff(sessionId);
    return `${diff.summary} (hasErrors=${diff.hasErrors}, causalDepth=${diff.causalDepth})`;
  });

  await section("7. Forget — GDPR erasure on a throwaway event", async () => {
    const filterValue = `full-tour-${randomUUID()}`;
    const logged = await db.log({
      agent,
      event: "user_message",
      data: { content: "throwaway", forget_test_id: filterValue },
      sessionId: `sess_forget_${randomUUID()}`,
    });
    const forgetResult = await db.forget({ filterKey: "forget_test_id", filterValue });
    const stillThere = await db.query({ agent, eventType: "user_message", limit: 50 });
    const found = stillThere.some((e) => e.eventId === logged.eventId);
    return `logged ${logged.eventId}, forget() deleted ${forgetResult.deletedEvents} event(s), still present after forget: ${found}`;
  });

  await section("8. Agents — list", async () => {
    const agents = await db.agents();
    return `${agents.length} agent(s): ${agents.map((a) => a.agent).join(", ")}`;
  });

  await section("9. Drift — session-count baseline", async () => {
    const baseline = await db.baseline({ agent, recentWindow: 5 });
    return JSON.stringify(baseline, null, 2).slice(0, 500);
  });

  await section("10. Drift — time-windowed behavior-change (REST, SDK gap)", async () => {
    const behaviorChange = await fetchBehaviorChange(baseUrl, apiKey, agent, "7d");
    return JSON.stringify(behaviorChange, null, 2).slice(0, 500);
  });

  await section("11. Timeline + stats (REST, SDK gap)", async () => {
    const [sessions, stats] = await Promise.all([
      fetchAgentSessions(baseUrl, apiKey, agent, 10),
      fetchAgentStats(baseUrl, apiKey, agent),
    ]);
    return `${sessions.length} sessions listed, stats: ${JSON.stringify(stats)}`;
  });

  console.log("\n\n=== SUMMARY ===");
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"} — ${r.name}`);
  }
  const failures = results.filter((r) => !r.ok);
  if (failures.length > 0) {
    console.log(`\n${failures.length} of ${results.length} sections failed.`);
    process.exitCode = 1;
  } else {
    console.log(`\nAll ${results.length} sections passed.`);
  }
}

main().catch((error) => {
  console.error("full-tour failed:", error);
  process.exitCode = 1;
});
