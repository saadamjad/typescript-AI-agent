"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface ChatWindowProps {
  messages: ChatMessageType[];
  isLoading: boolean;
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div
      className="flex-1 overflow-y-auto scroll-smooth px-4 py-4 sm:px-6"
      role="log"
      aria-live="polite"
      aria-label="Conversation"
    >
      {messages.length === 0 ? (
        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Send a message to start the conversation.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </ul>
      )}

      {isLoading && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
          AI is thinking...
        </p>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
