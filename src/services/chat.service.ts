import { ApiError, postJson } from "@/services/api-client";
import { getInternalResponse } from "@/services/internal-knowledge.service";
import { API_ENDPOINTS, FALLBACK_UNSUPPORTED_MESSAGE } from "@/constants/api";
import { chatResponseSchema, type ChatRequest, type ChatResponse } from "@/types/chat";

async function fetchExternalResponse(message: string): Promise<string> {
  const raw = await postJson<ChatResponse>(API_ENDPOINTS.CHAT, {
    message,
  } satisfies ChatRequest);

  const parsed = chatResponseSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError(
      "invalid-response",
      "Received an unexpected response from the server.",
    );
  }

  return parsed.data.data.response;
}

/**
 * Sends a message to the external AI service. If the service is unavailable
 * for any reason (missing/invalid API key, network failure, timeout, or an
 * error response), falls back to the internal knowledge handler so the
 * conversation degrades gracefully instead of failing.
 */
export async function sendMessage(message: string): Promise<string> {
  try {
    return await fetchExternalResponse(message);
  } catch (error) {
    console.warn(
      "External AI service unavailable, using internal fallback.",
      error instanceof ApiError ? { kind: error.kind, message: error.message } : error,
    );
    return getInternalResponse(message) ?? FALLBACK_UNSUPPORTED_MESSAGE;
  }
}
