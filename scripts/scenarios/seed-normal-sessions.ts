/**
 * Seeds realistic "normal traffic" — a mostly-stable mix of smalltalk/faq/
 * billing/refund conversations — by actually running the agent's decision
 * logic (@/agent/run-agent-turn) through many sessions. This is what
 * baseline()/behavior-change() treat as the "before" window when checking
 * for drift after seed-behavior-shift.ts runs.
 *
 * Usage: npm run scenario:seed-normal
 */
import { ZizkaDB } from "zizkadb-sdk";
import { loadEnvLocal, requireEnv } from "./load-env";
import { normalSessionMessages } from "./messages";
import { runSession } from "./run-session";

const SESSION_COUNT = 15;

async function main() {
  loadEnvLocal();
  const apiKey = requireEnv("ZIZKADB_API_KEY");
  const agent = requireEnv("ZIZKADB_AGENT_NAME");
  const db = new ZizkaDB({ apiKey });

  console.log(`Seeding ${SESSION_COUNT} normal-traffic sessions for agent "${agent}"...`);
  for (let i = 0; i < SESSION_COUNT; i++) {
    const messages = normalSessionMessages();
    const { sessionId } = await runSession(db, agent, messages);
    console.log(`  [${i + 1}/${SESSION_COUNT}] ${sessionId} — ${messages.length} turns`);
  }
  console.log("Done. Check the Drift/Timeline tabs, or run scripts/scenarios/full-tour.ts.");
}

main().catch((error) => {
  console.error("seed-normal-sessions failed:", error);
  process.exitCode = 1;
});
