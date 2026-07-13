"use client";

import { useChat } from "@/hooks/useChat";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { InspectorPanel } from "@/components/inspector/InspectorPanel";

export function Chat() {
  const { messages, isLoading, error, sendMessage, endSession, sessionId, lastEventId } = useChat();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 pt-4 sm:px-6">
        <span className="text-xs text-gray-400 dark:text-gray-600">Session: {sessionId.slice(0, 8)}</span>
        <button
          type="button"
          onClick={endSession}
          className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900"
        >
          End session
        </button>
      </div>
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
      <InspectorPanel sessionId={sessionId} lastEventId={lastEventId} />
    </div>
  );
}
