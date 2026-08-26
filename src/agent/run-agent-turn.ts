import { classifyIntent } from "@/agent/intent-classifier";
import { externalChatTool, intentToolRegistry, knowledgeBaseTool } from "@/agent/tools";
import { FALLBACK_UNSUPPORTED_MESSAGE } from "@/constants/api";
import { toZizkaDBTokenUsage } from "@/lib/tokens";
import type { AgentStep, AgentTurnResult, Tool, ToolOutcome } from "@/agent/types";

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function attemptTool(
  tool: Tool,
  message: string,
  intent: string,
  steps: AgentStep[],
): Promise<ToolOutcome | null> {
  steps.push({ event: "tool_selected", data: { tool: tool.name, intent } });
  steps.push({ event: "tool_call", data: { tool: tool.name, input: message } });

  try {
    const outcome = await tool.run(message);
    steps.push({
      event: "tool_result",
      data: {
        tool: tool.name,
        output: outcome.output,
        ...(outcome.usage ? { token_usage: toZizkaDBTokenUsage(outcome.usage) } : {}),
      },
    });
    return outcome;
  } catch (error) {
    console.warn(`${tool.name} failed`, error);
    steps.push({ event: "tool_error", data: { tool: tool.name, error: toErrorMessage(error) } });
    return null;
  }
}

/**
 * Runs one agent turn: classify intent, select and execute the appropriate
 * tool (dedicated business tool for billing/refund, otherwise external chat
 * with an internal-knowledge fallback), and return the response plus every
 * step taken so the caller can log a fully causal event chain.
 */
export async function runAgentTurn(message: string): Promise<AgentTurnResult> {
  const steps: AgentStep[] = [];
  const intent = classifyIntent(message);
  steps.push({ event: "intent_classified", data: { intent } });

  const dedicatedTool = intentToolRegistry[intent];
  if (dedicatedTool) {
    const outcome = await attemptTool(dedicatedTool, message, intent, steps);
    if (outcome) {
      steps.push({
        event: "assistant_response",
        data: { content: outcome.output, source: dedicatedTool.name },
      });
      return {
        response: outcome.output,
        source: dedicatedTool.name as AgentTurnResult["source"],
        steps,
        statePatch: outcome.statePatch,
      };
    }
  }

  const externalOutcome = await attemptTool(externalChatTool, message, intent, steps);
  if (externalOutcome) {
    steps.push({
      event: "assistant_response",
      data: {
        content: externalOutcome.output,
        source: "external",
        ...(externalOutcome.usage
          ? { token_usage: toZizkaDBTokenUsage(externalOutcome.usage) }
          : {}),
      },
    });
    return {
      response: externalOutcome.output,
      source: "external",
      steps,
      usage: externalOutcome.usage,
    };
  }

  const knowledgeOutcome = await attemptTool(knowledgeBaseTool, message, intent, steps);
  if (knowledgeOutcome) {
    steps.push({
      event: "assistant_response",
      data: { content: knowledgeOutcome.output, source: "internal_fallback" },
    });
    return { response: knowledgeOutcome.output, source: "internal_fallback", steps };
  }

  steps.push({ event: "agent_error", data: { reason: "no_tool_could_handle_request" } });
  steps.push({
    event: "assistant_response",
    data: { content: FALLBACK_UNSUPPORTED_MESSAGE, source: "internal_fallback" },
  });
  return { response: FALLBACK_UNSUPPORTED_MESSAGE, source: "internal_fallback", steps };
}
