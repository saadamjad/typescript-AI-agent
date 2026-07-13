"use client";

import { useState } from "react";
import { JsonPreview } from "@/components/inspector/JsonPreview";
import { fetchJson, useInspectorAction } from "@/components/inspector/useInspectorAction";

function nowLocalDatetime(): string {
  const now = new Date();
  now.setSeconds(0, 0);
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function StateTab() {
  const [timestamp, setTimestamp] = useState(nowLocalDatetime());
  const { result, loading, error, run } = useInspectorAction<unknown>();

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Time travel — reconstructs agent state (from STATE_SET/STATE_DELETE events) as of a timestamp.
      </p>
      <div className="mt-2 flex gap-2">
        <input
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
        />
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            run(() =>
              fetchJson(`/api/zizkadb/state?timestamp=${encodeURIComponent(new Date(timestamp).toISOString())}`),
            )
          }
          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "View state"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {result !== null && <JsonPreview data={result} />}
    </div>
  );
}
