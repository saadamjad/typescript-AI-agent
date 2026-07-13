import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <li
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      aria-label={isUser ? "Your message" : "Assistant message"}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words sm:max-w-[70%] ${
          isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-900 rounded-bl-sm dark:bg-gray-800 dark:text-gray-100"
        }`}
      >
        {message.content}
      </div>
    </li>
  );
}
