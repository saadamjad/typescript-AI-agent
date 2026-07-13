import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useChat } from "@/hooks/useChat";
import * as chatService from "@/services/chat.service";

describe("useChat", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("appends the user message and the AI response on success", async () => {
    vi.spyOn(chatService, "sendMessage").mockResolvedValue("Hi! How can I help?");

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
    let resolveSend: (value: string) => void = () => {};
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
      resolveSend("Reply");
    });
  });
});
