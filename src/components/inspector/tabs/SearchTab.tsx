"use client";

import { useState } from "react";
import { JsonPreview } from "@/components/inspector/JsonPreview";
import { fetchJson, useInspectorAction } from "@/components/inspector/useInspectorAction";

export function SearchTab() {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const { result, loading, error, run } = useInspectorAction<unknown>();

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Semantic search over this agent&apos;s logged event history.
      </p>
      <div className="mt-2 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. money back for a purchase"
          className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
        />
        <input
          type="number"
          min={1}
          max={50}
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="w-14 rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
        />
        <button
          type="button"
          disabled={loading || !query.trim()}
          onClick={() =>
            run(() =>
              fetchJson("/api/zizkadb/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: query.trim(), limit }),
              }),
            )
          }
          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {result !== null && <JsonPreview data={result} />}
    </div>
  );
}
