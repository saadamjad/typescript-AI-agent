export type Intent = "billing" | "refund" | "general";

export type MessageSource = "external" | "internal_fallback" | "billing_lookup" | "refund_policy";

export interface ToolOutcome {
  output: string;
  statePatch?: Record<string, unknown>;
}

export interface Tool {
  name: string;
  run(message: string): Promise<ToolOutcome>;
}

export type AgentStepType =
  | "intent_classified"
  | "tool_selected"
  | "tool_call"
  | "tool_result"
  | "tool_error"
  | "agent_error"
  | "assistant_response";

export interface AgentStep {
  event: AgentStepType;
  data: Record<string, unknown>;
}

export interface AgentTurnResult {
  response: string;
  source: MessageSource;
  steps: AgentStep[];
  statePatch?: Record<string, unknown>;
}
