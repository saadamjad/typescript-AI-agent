import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useChat } from "@/hooks/useChat";
import * as chatService from "@/services/chat.service";

describe("useChat", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ eventId: "evt_test" }),
      } as Response),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("appends the user message and the AI response on success", async () => {
    vi.spyOn(chatService, "sendMessage").mockResolvedValue({
      response: "Hi! How can I help?",
      source: "external",
      steps: [],
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject({ role: "user", content: "Hello" });
    expect(result.current.messages[1]).toMatchObject({
      role: "assistant",
      content: "Hi! How can I help?",
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets a user-friendly error when the service call fails", async () => {
    vi.spyOn(chatService, "sendMessage").mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });

  it("rejects an empty message without calling the service", async () => {
    const sendSpy = vi.spyOn(chatService, "sendMessage");

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("   ");
    });

    expect(sendSpy).not.toHaveBeenCalled();
    expect(result.current.error).toBe("Message cannot be empty.");
  });

  it("ignores a duplicate submission while a request is in flight", async () => {
    let resolveSend: (value: chatService.SendMessageResult) => void = () => {};
    vi.spyOn(chatService, "sendMessage").mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSend = resolve;
        }),
    );

    const { result } = renderHook(() => useChat());

    act(() => {
      void result.current.sendMessage("First");
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    await act(async () => {
      await result.current.sendMessage("Second");
    });

    expect(chatService.sendMessage).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSend({ response: "Reply", source: "external", steps: [] });
    });
  });

  it("logs each agent step in order, chaining parentId across the causal tree", async () => {
    let nextEventId = 0;
    const loggedRequests: unknown[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (_url: string, init: RequestInit) => {
        loggedRequests.push(JSON.parse(init.body as string));
        nextEventId += 1;
        return { ok: true, json: async () => ({ eventId: `evt_${nextEventId}` }) } as Response;
      }),
    );

    vi.spyOn(chatService, "sendMessage").mockResolvedValue({
      response: "Your balance is $10.",
      source: "billing_lookup",
      steps: [
        { event: "intent_classified", data: { intent: "billing" } },
        { event: "tool_selected", data: { tool: "billing_lookup" } },
        { event: "tool_call", data: { tool: "billing_lookup" } },
        { event: "tool_result", data: { tool: "billing_lookup" } },
        { event: "assistant_response", data: { content: "Your balance is $10." } },
      ],
      statePatch: { billing_status: "reviewed" },
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("What's my bill?");
    });

    // Wait for the fire-and-forget step-chain logging to flush.
    await waitFor(() => {
      const events = loggedRequests.map((r) => (r as { event: string }).event);
      expect(events).toContain("STATE_SET");
    });

    const events = loggedRequests.map((r) => (r as { event: string }).event);
    expect(events).toEqual([
      "session_started",
      "user_message",
      "intent_classified",
      "tool_selected",
      "tool_call",
      "tool_result",
      "assistant_response",
      "STATE_SET",
    ]);

    // Each step from intent_classified onward should chain off the previous
    // step's eventId. (user_message's own parentId depends on whether the
    // fire-and-forget session_started log has resolved yet, which is a race
    // not worth pinning down here — the rest of the chain is deterministic
    // because it only starts once user_message's log call has resolved.)
    const parentIds = loggedRequests.map((r) => (r as { parentId?: string }).parentId);
    for (let i = 2; i < parentIds.length; i++) {
      expect(parentIds[i]).toBe(`evt_${i}`);
    }
  });
});
