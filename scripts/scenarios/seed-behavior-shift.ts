/**
 * Seeds a deliberately shifted traffic mix — heavy refund/billing plus
 * off-topic questions the agent can't resolve — on top of whatever
 * seed-normal-sessions.ts already logged. Run this second so
 * baseline()/behavior-change() have a "before" (normal) and "after"
 * (shifted) window to compare, producing a real, inspectable drift signal.
 *
 * Usage: npm run scenario:seed-shift
 */
import { ZizkaDB } from "zizkadb-sdk";
import { loadEnvLocal, requireEnv } from "./load-env";
import { shiftedSessionMessages } from "./messages";
import { runSession } from "./run-session";

const SESSION_COUNT = 10;

async function main() {
  loadEnvLocal();
  const apiKey = requireEnv("ZIZKADB_API_KEY");
  const agent = requireEnv("ZIZKADB_AGENT_NAME");
  const db = new ZizkaDB({ apiKey });

  console.log(`Seeding ${SESSION_COUNT} shifted-traffic sessions for agent "${agent}"...`);
  console.log("(Run seed-normal-sessions.ts first if you haven't, so there's a baseline to compare against.)");
  for (let i = 0; i < SESSION_COUNT; i++) {
    const messages = shiftedSessionMessages();
    const { sessionId } = await runSession(db, agent, messages);
    console.log(`  [${i + 1}/${SESSION_COUNT}] ${sessionId} — ${messages.length} turns`);
  }
  console.log("Done. Check the Drift tab in the Inspector, or run scripts/scenarios/full-tour.ts.");
}

main().catch((error) => {
  console.error("seed-behavior-shift failed:", error);
  process.exitCode = 1;
});
