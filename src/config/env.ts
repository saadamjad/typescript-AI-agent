import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string({ required_error: "NEXT_PUBLIC_API_URL is required." })
    .min(1, "NEXT_PUBLIC_API_URL must not be empty.")
    .url("NEXT_PUBLIC_API_URL must be a valid URL."),
});

function loadEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => issue.message).join(", ");
    throw new Error(
      `Invalid environment configuration: ${issues}. Did you create a .env.local file? See .env.local.example.`,
    );
  }

  return parsed.data;
}

export const env = loadEnv();
