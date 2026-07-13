import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendMessage } from "@/services/chat.service";
import { FALLBACK_UNSUPPORTED_MESSAGE } from "@/constants/api";

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

describe("chat.service sendMessage", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns the AI response on success", async () => {
    mockFetchOnce({
      json: async () => ({ success: true, data: { response: "Hi there!" } }),
    });

    const result = await sendMessage("Hello");
    expect(result).toMatchObject({ response: "Hi there!", source: "external" });
    expect(result.steps.map((s) => s.event)).toEqual([
      "intent_classified",
      "tool_selected",
      "tool_call",
      "tool_result",
      "assistant_response",
    ]);
  });

  it("falls back to the internal handler when the HTTP response is not ok", async () => {
    mockFetchOnce({ ok: false, status: 500 });

    const result = await sendMessage("How many days are there in a week?");
    expect(result).toMatchObject({
      response: "There are 7 days in a week.",
      source: "internal_fallback",
    });
  });

  it("falls back to the internal handler when the response body is malformed", async () => {
    mockFetchOnce({ json: async () => ({ unexpected: "shape" }) });

    const result = await sendMessage("What is 2 + 2?");
    expect(result).toMatchObject({ response: "The answer is 4.", source: "internal_fallback" });
  });

  it("falls back to the internal handler on a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const result = await sendMessage("How many months are there in a year?");
    expect(result).toMatchObject({
      response: "There are 12 months in a year.",
      source: "internal_fallback",
    });
  });

  it("returns the safe fallback message when the question is unsupported and the API fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const result = await sendMessage("What is the capital of France?");
    expect(result).toMatchObject({
      response: FALLBACK_UNSUPPORTED_MESSAGE,
      source: "internal_fallback",
    });
    expect(result.steps.map((s) => s.event)).toEqual([
      "intent_classified",
      "tool_selected",
      "tool_call",
      "tool_error",
      "tool_selected",
      "tool_call",
      "tool_error",
      "agent_error",
      "assistant_response",
    ]);
  });

  it("never throws, even when the API fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(sendMessage("Hello")).resolves.toMatchObject({
      source: "internal_fallback",
    });
  });

  it("routes billing questions to the billing_lookup tool without calling the external API", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await sendMessage("What's my current bill?");

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.source).toBe("billing_lookup");
    expect(result.response).toContain("balance");
    expect(result.statePatch).toMatchObject({ billing_status: "reviewed" });
  });

  it("routes refund requests to the refund_policy tool and denies expired items", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await sendMessage("I want a refund, the item expired.");

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.source).toBe("refund_policy");
    expect(result.statePatch).toMatchObject({ refund_status: "denied" });
  });

  it("approves a normal refund request", async () => {
    vi.stubGlobal("fetch", vi.fn());

    const result = await sendMessage("I'd like a refund please.");

    expect(result.source).toBe("refund_policy");
    expect(result.statePatch).toMatchObject({ refund_status: "approved" });
  });
});
