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
    expect(result).toEqual({ response: "Hi there!", source: "external" });
  });

  it("falls back to the internal handler when the HTTP response is not ok", async () => {
    mockFetchOnce({ ok: false, status: 500 });

    const result = await sendMessage("How many days are there in a week?");
    expect(result).toEqual({
      response: "There are 7 days in a week.",
      source: "internal_fallback",
    });
  });

  it("falls back to the internal handler when the response body is malformed", async () => {
    mockFetchOnce({ json: async () => ({ unexpected: "shape" }) });

    const result = await sendMessage("What is 2 + 2?");
    expect(result).toEqual({ response: "The answer is 4.", source: "internal_fallback" });
  });

  it("falls back to the internal handler on a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const result = await sendMessage("How many months are there in a year?");
    expect(result).toEqual({
      response: "There are 12 months in a year.",
      source: "internal_fallback",
    });
  });

  it("returns the safe fallback message when the question is unsupported and the API fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const result = await sendMessage("What is the capital of France?");
    expect(result).toEqual({
      response: FALLBACK_UNSUPPORTED_MESSAGE,
      source: "internal_fallback",
    });
  });

  it("never throws, even when the API fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(sendMessage("Hello")).resolves.toMatchObject({
      source: "internal_fallback",
    });
  });
});
