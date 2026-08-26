import "server-only";
import { z } from "zod";
import { ZizkaDB } from "zizkadb-sdk";

const CLOUD_BASE_URL = "https://db.zizka.ai";

const zizkaDBEnvSchema = z
  .object({
    ZIZKADB_API_KEY: z.string().min(1).optional(),
    ZIZKADB_HOST: z.string().min(1).optional(),
    ZIZKADB_AGENT_NAME: z
      .string({ required_error: "ZIZKADB_AGENT_NAME is required." })
      .min(1, "ZIZKADB_AGENT_NAME must not be empty."),
  })
  .refine((env) => Boolean(env.ZIZKADB_API_KEY || env.ZIZKADB_HOST), {
    message: "Either ZIZKADB_API_KEY (cloud) or ZIZKADB_HOST (self-hosted) is required.",
  });

function loadZizkaDBEnv() {
  const parsed = zizkaDBEnvSchema.safeParse({
    ZIZKADB_API_KEY: process.env.ZIZKADB_API_KEY,
    ZIZKADB_HOST: process.env.ZIZKADB_HOST,
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

interface ZizkaDBContext {
  db: ZizkaDB;
  agentName: string;
  baseUrl: string;
  apiKey?: string;
}

let cached: ZizkaDBContext | null = null;

function initZizkaDB(): ZizkaDBContext {
  const env = loadZizkaDBEnv();
  const db = new ZizkaDB({
    ...(env.ZIZKADB_HOST ? { host: env.ZIZKADB_HOST } : {}),
    ...(env.ZIZKADB_API_KEY ? { apiKey: env.ZIZKADB_API_KEY } : {}),
  });

  return {
    db,
    agentName: env.ZIZKADB_AGENT_NAME,
    baseUrl: (env.ZIZKADB_HOST ?? CLOUD_BASE_URL).replace(/\/$/, ""),
    apiKey: env.ZIZKADB_API_KEY,
  };
}

export function getZizkaDB(): { db: ZizkaDB; agentName: string } {
  cached ??= initZizkaDB();
  return cached;
}

/**
 * Base URL + bearer token for the handful of REST endpoints the TypeScript
 * SDK (zizkadb-sdk@0.2.4) doesn't wrap yet: agent stats, session/timeline
 * listing, and time-windowed behavior-change. See src/zizkadb/rest-client.ts.
 */
export function getZizkaDBConnection(): { baseUrl: string; apiKey?: string } {
  cached ??= initZizkaDB();
  return { baseUrl: cached.baseUrl, apiKey: cached.apiKey };
}
