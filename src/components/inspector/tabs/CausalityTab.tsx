"use client";

import { useEffect, useState } from "react";
import { JsonPreview } from "@/components/inspector/JsonPreview";
import { fetchJson, useInspectorAction } from "@/components/inspector/useInspectorAction";

interface CausalityTabProps {
  defaultEventId?: string;
}

export function CausalityTab({ defaultEventId }: CausalityTabProps) {
  const [eventId, setEventId] = useState(defaultEventId ?? "");
  const [dirty, setDirty] = useState(false);
  const { result, loading, error, run } = useInspectorAction<unknown>();

  useEffect(() => {
    if (!dirty && defaultEventId) {
      setEventId(defaultEventId);
    }
  }, [defaultEventId, dirty]);

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Causal chain (why()) for an event — defaults to the most recent event logged this session.
      </p>
      <div className="mt-2 flex gap-2">
        <input
          value={eventId}
          onChange={(e) => {
            setEventId(e.target.value);
            setDirty(true);
          }}
          placeholder="event id"
          className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
        />
        <button
          type="button"
          disabled={loading || !eventId.trim()}
          onClick={() => run(() => fetchJson(`/api/zizkadb/why/${encodeURIComponent(eventId.trim())}`))}
          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "Why?"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {result !== null && <JsonPreview data={result} />}
    </div>
  );
}
