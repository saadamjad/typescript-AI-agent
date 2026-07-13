import { ApiError, postJson } from "@/services/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { chatResponseSchema, type ChatRequest, type ChatResponse } from "@/types/chat";
import type { Tool } from "@/agent/types";

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

/** Delegates to the external AI backend (the real "LLM" for general conversation). */
export const externalChatTool: Tool = {
  name: "external_chat",
  async run(message) {
    const output = await fetchExternalResponse(message);
    return { output };
  },
};
