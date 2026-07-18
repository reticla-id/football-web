"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export type SimulationResultTab =
  | "overview"
  | "timeline"
  | "tactical"
  | "players"
  | "heatmaps"
  | "charts";

interface SimulationTabsProps {
  activeTab: SimulationResultTab;
  onTabChange: (tab: SimulationResultTab) => void;
}

const tabs: Array<{ key: SimulationResultTab; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "timeline", label: "Timeline" },
  { key: "tactical", label: "Tactical" },
  { key: "players", label: "Players" },
  { key: "heatmaps", label: "Heatmaps" },
  { key: "charts", label: "Charts" },
];

export default function SimulationTabs({
  activeTab,
  onTabChange,
}: SimulationTabsProps) {
  return (
    <div className="overflow-hidden border border-zinc-800/80 bg-zinc-900/70">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6" role="tablist" aria-label="Simulation result sections">
        {tabs.map((tab) => {
          const active = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(tab.key)}
              className="relative px-3 py-4 text-sm font-medium transition-colors duration-200 hover:bg-zinc-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--accent)] sm:px-5"
            >
              <span className={cn(active ? "text-white" : "text-zinc-500")}>{tab.label}</span>

              {active ? (
                <motion.div
                  layoutId="simulation-tab-indicator"
                  className="absolute bottom-0 left-3 right-3 h-[3px] bg-[color:var(--accent)] sm:left-5 sm:right-5"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
