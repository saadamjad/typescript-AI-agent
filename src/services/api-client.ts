import { env } from "@/config/env";
import { REQUEST_TIMEOUT_MS } from "@/constants/api";

export type ApiErrorKind = "network" | "timeout" | "http" | "invalid-response";

export class ApiError extends Error {
  kind: ApiErrorKind;

  constructor(kind: ApiErrorKind, message: string) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
  }
}

export async function postJson<TResponse>(
  path: string,
  body: unknown,
): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("timeout", "The request timed out. Please try again.");
    }
    throw new ApiError(
      "network",
      "Unable to reach the server. Please check your connection.",
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new ApiError("http", `Request failed with status ${response.status}.`);
  }

  try {
    return (await response.json()) as TResponse;
  } catch {
    throw new ApiError(
      "invalid-response",
      "Received an invalid response from the server.",
    );
  }
}
