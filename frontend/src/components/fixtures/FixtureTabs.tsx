"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export type FixtureTab =
  | "match-facts"
  | "timeline"
  | "lineups"
  | "action-maps"
  | "details";

interface Props {
  activeTab: FixtureTab;
  onTabChange: (tab: FixtureTab) => void;
}

const tabs: { key: FixtureTab; label: string }[] = [
  { key: "match-facts", label: "Match Facts" },
  { key: "timeline", label: "Timeline" },
  { key: "lineups", label: "Lineups" },
  { key: "action-maps", label: "Action Maps" },
  { key: "details", label: "Details" },
];

export default function FixtureTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="overflow-hidden -2xl border border-zinc-800/80 bg-zinc-900/70">
      <div
        className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"
        role="tablist"
        aria-label="Fixture sections"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`fixture-panel-${tab.key}`}
              id={`fixture-tab-${tab.key}`}
              onClick={() => onTabChange(tab.key)}
              className="relative px-3 py-4 text-sm font-medium transition-colors duration-200 hover:bg-zinc-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--accent)] sm:px-5"
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
                  layoutId="fixture-tab-indicator"
                  className="absolute bottom-0 left-3 right-3 h-[3px] -full bg-[color:var(--accent)] sm:left-5 sm:right-5"
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
