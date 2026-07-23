"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export type TeamTab = "overview" | "squad" | "fixtures";

interface Props {
  activeTab: TeamTab;
  onTabChange: (tab: TeamTab) => void;
}

const tabs: { key: TeamTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "squad", label: "Squads" },
  { key: "fixtures", label: "Fixtures" },
];

export default function TeamTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="overflow-hidden -2xl border border-zinc-800/80 bg-zinc-900/70">
      <div
        className="grid grid-cols-3"
        role="tablist"
        aria-label="Team sections"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`team-panel-${tab.key}`}
              id={`team-tab-${tab.key}`}
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
                  layoutId="team-tab-indicator"
                  className="absolute bottom-0 left-3 right-3 h-[3px] bg-[color:var(--accent-secondary)] sm:left-5 sm:right-5"
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
