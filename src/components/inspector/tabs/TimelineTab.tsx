"use client";

import { JsonPreview } from "@/components/inspector/JsonPreview";
import { fetchJson, useInspectorAction } from "@/components/inspector/useInspectorAction";

export function TimelineTab() {
  const { result, loading, error, run } = useInspectorAction<unknown>();

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Session timeline and aggregate event stats for this agent.
      </p>
      <div className="mt-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => run(() => fetchJson("/api/zizkadb/timeline"))}
          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load timeline"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {result !== null && <JsonPreview data={result} />}
    </div>
  );
}
