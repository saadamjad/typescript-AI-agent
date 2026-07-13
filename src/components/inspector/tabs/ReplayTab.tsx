"use client";

import { useState } from "react";
import { JsonPreview } from "@/components/inspector/JsonPreview";
import { fetchJson, useInspectorAction } from "@/components/inspector/useInspectorAction";

interface ReplayTabProps {
  defaultSessionId: string;
}

export function ReplayTab({ defaultSessionId }: ReplayTabProps) {
  const [sessionId, setSessionId] = useState(defaultSessionId);
  const { result, loading, error, run } = useInspectorAction<unknown>();

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Session replay/diff — summarizes what happened in a session, including errors and new patterns.
      </p>
      <div className="mt-2 flex gap-2">
        <input
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="session id"
          className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
        />
        <button
          type="button"
          disabled={loading || !sessionId.trim()}
          onClick={() => run(() => fetchJson(`/api/zizkadb/replay/${encodeURIComponent(sessionId.trim())}`))}
          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "Replay"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {result !== null && <JsonPreview data={result} />}
    </div>
  );
}
