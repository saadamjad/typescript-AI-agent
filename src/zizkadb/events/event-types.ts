/**
 * Full catalog of event types this agent logs to ZizkaDB. Grouped by what
 * they represent so the causal chain for one chat turn reads top-to-bottom:
 * session lifecycle -> user interaction -> agent decision -> tool execution
 * -> outcome -> (optional) state change.
 */
export const EVENT_TYPES = [
  // Lifecycle
  "session_started",
  "session_ended",
  // User interaction
  "user_message",
  // Agent decisions
  "intent_classified",
  "tool_selected",
  // Tool / action execution
  "tool_call",
  "tool_result",
  "tool_error",
  // Errors / failures
  "agent_error",
  // Outcome
  "assistant_response",
  // State inspection (event-sourced key/value patches, consumed by at())
  "STATE_SET",
  "STATE_DELETE",
] as const;

export type AgentEventType = (typeof EVENT_TYPES)[number];
