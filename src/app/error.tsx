"use client";

interface ErrorPageProps {
  reset: () => void;
}

export default function Error({ reset }: ErrorPageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Something went wrong
      </h1>
      <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
        We ran into an unexpected problem. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Try again
      </button>
    </div>
  );
}
