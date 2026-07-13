import { Chat } from "@/components/chat/Chat";

export default function Home() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-3xl flex-1 flex-col">
      <header className="border-b border-gray-200 px-4 py-4 sm:px-6 dark:border-gray-800">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          AI Customer Support Assistant
        </h1>
      </header>
      <Chat />
    </div>
  );
}
