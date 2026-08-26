import { runAgentTurn } from "@/agent/run-agent-turn";
import type { AgentStep, MessageSource } from "@/agent/types";
import type { TokenUsage } from "@/lib/tokens";

export type { MessageSource } from "@/agent/types";

export interface SendMessageResult {
  response: string;
  source: MessageSource;
  steps: AgentStep[];
  statePatch?: Record<string, unknown>;
  usage?: TokenUsage;
}

/**
 * Runs one agent turn for the given message. Intent classification, tool
 * selection/execution, and the external-chat/internal-fallback behavior all
 * live in @/agent — this is just the entry point the chat UI calls.
 */
export async function sendMessage(message: string): Promise<SendMessageResult> {
  return runAgentTurn(message);
}
