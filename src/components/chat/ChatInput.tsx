"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { MAX_MESSAGE_LENGTH } from "@/constants/api";

interface ChatInputProps {
  isLoading: boolean;
  onSend: (message: string) => void;
}

export function ChatInput({ isLoading, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    if (isLoading || value.trim().length === 0) {
      return;
    }
    onSend(value);
    setValue("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-gray-200 p-4 dark:border-gray-800 sm:p-6"
    >
      <div className="flex-1">
        <label htmlFor="chat-message-input" className="sr-only">
          Type your message
        </label>
        <textarea
          id="chat-message-input"
          name="message"
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          value={value}
          disabled={isLoading}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || value.trim().length === 0}
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
