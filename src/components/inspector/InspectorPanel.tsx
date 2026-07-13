"use client";

import { useState } from "react";
import { CausalityTab } from "@/components/inspector/tabs/CausalityTab";
import { SearchTab } from "@/components/inspector/tabs/SearchTab";
import { ReplayTab } from "@/components/inspector/tabs/ReplayTab";
import { DriftTab } from "@/components/inspector/tabs/DriftTab";
import { StateTab } from "@/components/inspector/tabs/StateTab";
import { TimelineTab } from "@/components/inspector/tabs/TimelineTab";

const TABS = [
  { id: "causality", label: "Causality" },
  { id: "search", label: "Search" },
  { id: "replay", label: "Replay" },
  { id: "drift", label: "Drift" },
  { id: "state", label: "State" },
  { id: "timeline", label: "Timeline" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface InspectorPanelProps {
  sessionId: string;
  lastEventId?: string;
}

/** Debug/observability panel demonstrating ZizkaDB's read-side capabilities against live data this agent just produced. */
export function InspectorPanel({ sessionId, lastEventId }: InspectorPanelProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("causality");

  return (
    <div className="border-t border-gray-200 dark:border-gray-800">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900 sm:px-6"
      >
        <span>ZizkaDB Inspector</span>
        <span aria-hidden>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap gap-1 border-b border-gray-200 px-4 pt-2 dark:border-gray-800 sm:px-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-t-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="max-h-72 overflow-y-auto px-4 py-3 sm:px-6">
            {activeTab === "causality" && <CausalityTab defaultEventId={lastEventId} />}
            {activeTab === "search" && <SearchTab />}
            {activeTab === "replay" && <ReplayTab defaultSessionId={sessionId} />}
            {activeTab === "drift" && <DriftTab />}
            {activeTab === "state" && <StateTab />}
            {activeTab === "timeline" && <TimelineTab />}
          </div>
        </div>
      )}
    </div>
  );
}
