import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runAgentTurn } from "@/agent/run-agent-turn";

function mockFetchOnce(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
      ...response,
    } as Response),
  );
}

describe("runAgentTurn", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("dedicated billing tool short-circuits before the external/knowledge-base path", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await runAgentTurn("What's my current bill?");

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.source).toBe("billing_lookup");
    expect(result.steps.map((s) => s.event)).toEqual([
      "intent_classified",
      "tool_selected",
      "tool_call",
      "tool_result",
      "assistant_response",
    ]);
  });

  it("general intent tries external chat first and succeeds", async () => {
    mockFetchOnce({ json: async () => ({ success: true, data: { response: "Hi there!" } }) });

    const result = await runAgentTurn("Hello");

    expect(result.source).toBe("external");
    expect(result.response).toBe("Hi there!");
    expect(result.steps.map((s) => s.event)).toEqual([
      "intent_classified",
      "tool_selected",
      "tool_call",
      "tool_result",
      "assistant_response",
    ]);
  });

  it("falls back to knowledge base when external chat fails", async () => {
    mockFetchOnce({ ok: false, status: 500 });

    const result = await runAgentTurn("What is 2 + 2?");

    expect(result.source).toBe("internal_fallback");
    expect(result.response).toBe("The answer is 4.");
    expect(result.steps.map((s) => s.event)).toEqual([
      "intent_classified",
      "tool_selected",
      "tool_call",
      "tool_error",
      "tool_selected",
      "tool_call",
      "tool_result",
      "assistant_response",
    ]);
  });

  it("logs an agent_error when no tool can handle the request", async () => {
    mockFetchOnce({ ok: false, status: 500 });

    const result = await runAgentTurn("What is the capital of France?");

    expect(result.source).toBe("internal_fallback");
    expect(result.steps.map((s) => s.event)).toContain("agent_error");
  });
});
