"use client";

import { useState } from "react";
import { JsonPreview } from "@/components/inspector/JsonPreview";
import { fetchJson, useInspectorAction } from "@/components/inspector/useInspectorAction";

const WINDOWS = ["24h", "7d", "30d"] as const;

export function DriftTab() {
  const [window, setWindow] = useState<(typeof WINDOWS)[number]>("7d");
  const { result, loading, error, run } = useInspectorAction<unknown>();

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Behavioral baseline + time-windowed behavior-change (drift) for this agent.
      </p>
      <div className="mt-2 flex gap-2">
        <select
          value={window}
          onChange={(e) => setWindow(e.target.value as (typeof WINDOWS)[number])}
          className="rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
        >
          {WINDOWS.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={loading}
          onClick={() => run(() => fetchJson(`/api/zizkadb/drift?window=${window}`))}
          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "Check drift"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {result !== null && <JsonPreview data={result} />}
    </div>
  );
}
