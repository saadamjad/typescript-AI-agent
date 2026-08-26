import { ApiError, postJson } from "@/services/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { chatResponseSchema, type ChatRequest, type ChatResponse } from "@/types/chat";
import { resolveUsage } from "@/lib/tokens";
import type { Tool } from "@/agent/types";
import type { BackendUsage } from "@/lib/tokens";

interface ExternalChatResult {
  response: string;
  usage?: BackendUsage;
}

async function fetchExternalResponse(message: string): Promise<ExternalChatResult> {
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

  return { response: parsed.data.data.response, usage: parsed.data.data.usage };
}

/**
 * Delegates to the external AI backend (the real "LLM" for general
 * conversation) and reports token usage: real counts when the backend sends
 * them, otherwise a character-based estimate so token tracking still works.
 */
export const externalChatTool: Tool = {
  name: "external_chat",
  async run(message) {
    const { response, usage } = await fetchExternalResponse(message);
    return { output: response, usage: resolveUsage(usage, message, response) };
  },
};
