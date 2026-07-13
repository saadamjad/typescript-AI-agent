"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sendMessage as sendMessageToApi } from "@/services/chat.service";
import { logEvent } from "@/services/logging.service";
import { validateMessage } from "@/utils/validation";
import type { ChatMessage } from "@/types/chat";
import type { AgentStep } from "@/agent/types";

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: Date.now(),
  };
}

/** Logs each agent step in order, chaining parentId so the causal tree is unbroken. */
async function logStepChain(
  steps: AgentStep[],
  sessionId: string,
  initialParentId: string | undefined,
): Promise<string | undefined> {
  let parentId = initialParentId;
  for (const step of steps) {
    const eventId = await logEvent(step.event, step.data, sessionId, parentId);
    parentId = eventId ?? parentId;
  }
  return parentId;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastEventId, setLastEventId] = useState<string | undefined>(undefined);
  const isSendingRef = useRef(false);
  const sessionIdRef = useRef(crypto.randomUUID());
  const lastEventIdRef = useRef<string | undefined>(undefined);
  const sessionStartLoggedRef = useRef(false);

  const updateLastEventId = useCallback((eventId: string | undefined) => {
    lastEventIdRef.current = eventId;
    setLastEventId(eventId);
  }, []);

  useEffect(() => {
    if (sessionStartLoggedRef.current) {
      return;
    }
    sessionStartLoggedRef.current = true;
    void logEvent("session_started", {}, sessionIdRef.current).then(updateLastEventId);
  }, [updateLastEventId]);

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

    const sessionId = sessionIdRef.current;
    const userEventIdPromise = logEvent(
      "user_message",
      { content: trimmed },
      sessionId,
      lastEventIdRef.current,
    );

    try {
      const { response, steps, statePatch } = await sendMessageToApi(trimmed);
      setMessages((prev) => [...prev, createMessage("assistant", response)]);

      void userEventIdPromise.then(async (userEventId) => {
        const chainParentId = await logStepChain(steps, sessionId, userEventId);
        let finalEventId = chainParentId ?? userEventId;
        if (statePatch) {
          finalEventId = (await logEvent("STATE_SET", statePatch, sessionId, finalEventId)) ?? finalEventId;
        }
        updateLastEventId(finalEventId);
      });
    } catch {
      setError("Something went wrong while reaching the assistant. Please try again.");
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  }, [updateLastEventId]);

  const endSession = useCallback(() => {
    void logEvent("session_ended", {}, sessionIdRef.current, lastEventIdRef.current);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    endSession,
    sessionId: sessionIdRef.current,
    lastEventId,
  };
}
