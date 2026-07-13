import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Same manual .env.local loader used by scripts/test-zizkadb-query.ts, shared across scenario scripts. */
export function loadEnvLocal(): void {
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

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required. Set it in .env.local.`);
  }
  return value;
}
