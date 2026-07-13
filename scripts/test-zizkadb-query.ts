/**
 * Standalone script to manually exercise the ZizkaDB SDK's causal-lineage
 * query (log -> log with parentId -> why). Not part of the Next.js app;
 * run it directly to sanity-check the SDK/API key against the live service.
 *
 * Usage: npm run test:zizkadb
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ZizkaDB } from "zizkadb-sdk";

function loadEnvLocal(): void {
  let content: string;
  try {
    content = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
  } catch {
    return;
  }

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvLocal();

  const apiKey = process.env.ZIZKADB_API_KEY;
  if (!apiKey) {
    throw new Error("ZIZKADB_API_KEY is required. Set it in .env.local.");
  }

  const db = new ZizkaDB({ apiKey });

  const msg = await db.log({
    agent: "support-bot",
    event: "user_message",
    data: { text: "why is my bill $200?" },
    sessionId: "sess_abc123",
  });

  const tool = await db.log({
    agent: "support-bot",
    event: "tool_call",
    data: { tool: "get_billing" },
    parentId: msg.eventId,
    sessionId: "sess_abc123",
  });

  const chain = await db.why(tool.eventId);
  chain.print();
}

main().catch((error) => {
  console.error("ZizkaDB test query failed:", error);
  process.exitCode = 1;
});
