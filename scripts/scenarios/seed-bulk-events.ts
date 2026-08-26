/**
 * Seeds 1000+ events by running many realistic sessions through the real
 * agent decision logic, so the ZizkaDB dashboard has enough volume to
 * verify event recording/ingestion at scale.
 *
 * Usage: npm run scenario:seed-bulk
 */
import { ZizkaDB } from "zizkadb-sdk";
import { loadEnvLocal, requireEnv } from "./load-env";
import { normalSessionMessages, shiftedSessionMessages } from "./messages";
import { runSession } from "./run-session";

const TARGET_EVENT_COUNT = 1100;

/** session_started + session_ended + per message (user_message + ~2 steps) */
function estimateEventsPerSession(messageCount: number): number {
  return 2 + messageCount * 3;
}

async function main() {
  loadEnvLocal();
  const apiKey = requireEnv("ZIZKADB_API_KEY");
  const agent = requireEnv("ZIZKADB_AGENT_NAME");
  const db = new ZizkaDB({ apiKey });

  console.log(`Seeding events for agent "${agent}" until >= ${TARGET_EVENT_COUNT} events logged...`);

  let totalEvents = 0;
  let sessionCount = 0;
  let consecutiveFailures = 0;

  while (totalEvents < TARGET_EVENT_COUNT) {
    const messages = sessionCount % 3 === 0 ? shiftedSessionMessages() : normalSessionMessages();
    const before = totalEvents;

    try {
      const { sessionId } = await runSession(db, agent, messages);
      sessionCount += 1;
      totalEvents += estimateEventsPerSession(messages.length);
      consecutiveFailures = 0;

      if (sessionCount % 10 === 0 || totalEvents >= TARGET_EVENT_COUNT) {
        console.log(
          `  [session ${sessionCount}] ${sessionId} — ~${totalEvents} events logged so far (+${totalEvents - before})`,
        );
      }
    } catch (error) {
      consecutiveFailures += 1;
      console.error(
        `  session ${sessionCount + 1} failed (attempt ${consecutiveFailures}): ${(error as Error).message}`,
      );
      if (consecutiveFailures >= 5) {
        throw new Error(`Aborting after ${consecutiveFailures} consecutive session failures.`);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000 * consecutiveFailures));
    }
  }

  console.log(`Done. Ran ${sessionCount} sessions, ~${totalEvents} events logged.`);
  console.log("Check the ZizkaDB dashboard Timeline/Sessions tabs to confirm.");
}

main().catch((error) => {
  console.error("seed-bulk-events failed:", error);
  process.exitCode = 1;
});
