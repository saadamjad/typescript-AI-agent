"use client";

import { useCallback, useRef, useState } from "react";
import { sendMessage as sendMessageToApi } from "@/services/chat.service";
import { logEvent } from "@/services/logging.service";
import { validateMessage } from "@/utils/validation";
import type { ChatMessage } from "@/types/chat";

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: Date.now(),
  };
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSendingRef = useRef(false);
  const sessionIdRef = useRef(crypto.randomUUID());

  const sendMessage = useCallback(async (text: string) => {
    if (isSendingRef.current) {
      return;
    }

    const validation = validateMessage(text);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    const trimmed = text.trim();
    isSendingRef.current = true;
    setError(null);
    setIsLoading(true);
    setMessages((prev) => [...prev, createMessage("user", trimmed)]);

    const userEventIdPromise = logEvent(
      "user_message",
      { content: trimmed },
      sessionIdRef.current,
    );

    try {
      const { response, source } = await sendMessageToApi(trimmed);
      setMessages((prev) => [...prev, createMessage("assistant", response)]);
      void userEventIdPromise.then((parentId) =>
        logEvent(
          "assistant_response",
          { content: response, source },
          sessionIdRef.current,
          parentId,
        ),
      );
    } catch {
      setError("Something went wrong while reaching the assistant. Please try again.");
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  }, []);

  return { messages, isLoading, error, sendMessage };
}
