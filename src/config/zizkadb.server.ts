import "server-only";
import { z } from "zod";
import { ZizkaDB } from "zizkadb-sdk";

const zizkaDBEnvSchema = z.object({
  ZIZKADB_API_KEY: z
    .string({ required_error: "ZIZKADB_API_KEY is required." })
    .min(1, "ZIZKADB_API_KEY must not be empty."),
  ZIZKADB_AGENT_NAME: z
    .string({ required_error: "ZIZKADB_AGENT_NAME is required." })
    .min(1, "ZIZKADB_AGENT_NAME must not be empty."),
});

function loadZizkaDBEnv() {
  const parsed = zizkaDBEnvSchema.safeParse({
    ZIZKADB_API_KEY: process.env.ZIZKADB_API_KEY,
    ZIZKADB_AGENT_NAME: process.env.ZIZKADB_AGENT_NAME,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => issue.message).join(", ");
    throw new Error(
      `Invalid ZizkaDB environment configuration: ${issues}. See .env.local.example.`,
    );
  }

  return parsed.data;
}

let cached: { db: ZizkaDB; agentName: string } | null = null;

export function getZizkaDB(): { db: ZizkaDB; agentName: string } {
  if (!cached) {
    const env = loadZizkaDBEnv();
    cached = {
      db: new ZizkaDB({ apiKey: env.ZIZKADB_API_KEY }),
      agentName: env.ZIZKADB_AGENT_NAME,
    };
  }
  return cached;
}
