"use client";

import { useChat } from "@/hooks/useChat";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";

export function Chat() {
  const { messages, isLoading, error, sendMessage } = useChat();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {error && (
        <div
          role="alert"
          className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 sm:mx-6 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </div>
      )}
      <ChatWindow messages={messages} isLoading={isLoading} />
      <ChatInput isLoading={isLoading} onSend={sendMessage} />
    </div>
  );
}
