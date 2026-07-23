"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export type PlayerTab =
  | "statistics"
  | "analytics"
  | "action-map"
  | "match-history"
  | "career-history";

interface Props {
  activeTab: PlayerTab;
  onTabChange: (tab: PlayerTab) => void;
}

const tabs: { key: PlayerTab; label: string }[] = [
  { key: "statistics", label: "Statistics" },
  { key: "analytics", label: "Analytics" },
  { key: "action-map", label: "Action Map" },
  { key: "match-history", label: "Match History" },
  { key: "career-history", label: "Career History" },
];

export default function PlayerTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="overflow-hidden -2xl border border-zinc-800/80 bg-zinc-900/70">
      <div
        className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"
        role="tablist"
        aria-label="Player sections"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`player-panel-${tab.key}`}
              id={`player-tab-${tab.key}`}
              onClick={() => onTabChange(tab.key)}
              className="relative px-3 py-4 text-sm font-medium transition-colors duration-200 hover:bg-zinc-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--accent-secondary)] sm:px-5"
            >
              <span
                className={cn(
                  "transition-colors",
                  active ? "text-white" : "text-zinc-500"
                )}
              >
                {tab.label}
              </span>

              {active ? (
                <motion.div
                  layoutId="player-tab-indicator"
                  className="absolute bottom-0 left-3 right-3 h-[3px] -full bg-[color:var(--accent-secondary)] sm:left-5 sm:right-5"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 32,
                  }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
