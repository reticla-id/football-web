"use client";

import { ArrowUpRight } from "lucide-react";

import type { ExplorerPlayer } from "@/app/radar/explorer/components/types";
import {
  comparePlayerValues,
  type ComparisonDirection,
  type ComparisonResult,
} from "./comparison-utils";

type MetricConfig = {
  label: string;
  getValue?: (player: ExplorerPlayer) => string | number | null | undefined;
  placeholder?: string;
  formatter?: (value: string | number | null | undefined) => string;
  comparisonDirection?: ComparisonDirection;
};

const profileMetrics: MetricConfig[] = [
  { label: "Club", getValue: (player) => player.clubName },
  { label: "League", getValue: (player) => player.league },
  { label: "Season", placeholder: "-" },
  { label: "Nationality", getValue: (player) => player.nationality },
  { label: "Position", getValue: (player) => player.positionLabel },
  { label: "Preferred Foot", getValue: (player) => player.prefer_foot },
  { label: "Age", getValue: (player) => player.age },
  {
    label: "Height",
    getValue: (player) => (player.heightValue != null ? `${player.heightValue} cm` : "-"),
  },
];

const performanceMetrics: MetricConfig[] = [
  { label: "Goals", getValue: (player) => player.goals },
  { label: "Assists", getValue: (player) => player.assists },
  { label: "xG", placeholder: "-" },
  { label: "xA", placeholder: "-" },
  { label: "Shots", placeholder: "-" },
  { label: "Shots on Target", placeholder: "-" },
  {
    label: "Pass Accuracy",
    getValue: (player) => player.pass_accuracy,
    formatter: formatPercentage,
  },
  { label: "Progressive Passes", placeholder: "-" },
  { label: "Key Passes", placeholder: "-" },
  { label: "Progressive Carries", placeholder: "-" },
  { label: "Dribbles", placeholder: "-" },
  { label: "Touches", placeholder: "-" },
  { label: "Tackles", getValue: (player) => player.tackles },
  { label: "Tackles Won", getValue: (player) => player.tackles_won },
  { label: "Interceptions", getValue: (player) => player.interceptions },
  { label: "Recoveries", placeholder: "-" },
  { label: "Duels", placeholder: "-" },
  { label: "Aerial Duels", placeholder: "-" },
  { label: "Saves", getValue: (player) => player.saves },
  { label: "Clean Sheets", placeholder: "-" },
  { label: "Minutes Played", placeholder: "-" },
];

interface MatchUpComparisonTableProps {
  leftPlayer: ExplorerPlayer | null;
  rightPlayer: ExplorerPlayer | null;
}

export default function MatchUpComparisonTable({
  leftPlayer,
  rightPlayer,
}: MatchUpComparisonTableProps) {
  const canCompare = Boolean(leftPlayer && rightPlayer);
  const playerAStats = leftPlayer;
  const playerBStats = rightPlayer;

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <ComparisonSection
        title="Profile Comparison"
        metrics={profileMetrics}
        playerAStats={playerAStats}
        playerBStats={playerBStats}
        canCompare={canCompare}
      />

      <ComparisonSection
        title="Performance Comparison"
        metrics={performanceMetrics}
        playerAStats={playerAStats}
        playerBStats={playerBStats}
        canCompare={canCompare}
      />
    </div>
  );
}

function ComparisonSection({
  title,
  metrics,
  playerAStats,
  playerBStats,
  canCompare,
}: {
  title: string;
  metrics: MetricConfig[];
  playerAStats: ExplorerPlayer | null;
  playerBStats: ExplorerPlayer | null;
  canCompare: boolean;
}) {
  return (
    <div className="min-w-0 overflow-hidden border border-zinc-800 bg-[linear-gradient(180deg,rgba(24,24,24,0.96),rgba(10,10,10,0.96))]">
      <div className="border-b border-zinc-800 px-4 py-4 sm:px-5">
        <h2 className="font-display text-[1.65rem] leading-none text-white sm:text-[2rem]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Head-to-head player comparison using standardized scouting metrics and performance statistics.
        </p>
      </div>

      {canCompare ? (
        <div className="w-full overflow-x-auto overscroll-x-contain">
          <table className="min-w-[640px] w-full text-sm sm:min-w-[760px]">
            <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-500">
              <tr>
                <th className="w-[34%] px-4 py-3 text-left text-xs font-medium sm:px-5 sm:text-sm">
                  {playerAStats?.display_name ?? "Player A"}
                </th>
                <th className="w-[32%] px-3 py-3 text-center text-xs font-medium sm:px-4 sm:text-sm">
                  Metric
                </th>
                <th className="w-[34%] px-4 py-3 text-right text-xs font-medium sm:px-5 sm:text-sm">
                  {playerBStats?.display_name ?? "Player B"}
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => {
                const comparison = getMetricComparison(
                  metric,
                  playerAStats,
                  playerBStats
                );

                return (
                  <tr key={metric.label} className="border-b border-zinc-800 last:border-b-0">
                  <ComparisonValueCell
                    comparison={comparison}
                    align="left"
                    side="A"
                  />
                  <td className="px-3 py-3 text-center text-xs text-zinc-500 sm:px-4 sm:text-sm">
                    {metric.label}
                  </td>
                  <ComparisonValueCell
                    comparison={comparison}
                    align="right"
                    side="B"
                  />
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-4 py-10 text-center sm:px-5 sm:py-12">
          <p className="text-sm text-zinc-500">
            Select another player to begin comparison.
          </p>
        </div>
      )}
    </div>
  );
}

function ComparisonValueCell({
  comparison,
  align,
  side,
}: {
  comparison: ComparisonResult;
  align: "left" | "right";
  side: "A" | "B";
}) {
  const isWinner = comparison.shouldShowIndicators && comparison.winner === side;
  const displayValue =
    side === "A" ? comparison.playerADisplayValue : comparison.playerBDisplayValue;

  return (
    <td
      className={[
        "px-4 py-3 text-xs text-zinc-200 sm:px-5 sm:text-sm",
        align === "left" ? "text-left" : "text-right",
        isWinner ? "accent-text" : "",
      ].join(" ")}
    >
      <div
        className={[
          "flex items-center gap-2",
          align === "left" ? "justify-start" : "justify-end",
        ].join(" ")}
      >
        {align === "right" ? null : isWinner ? (
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[var(--accent)] sm:h-4 sm:w-4" />
        ) : null}
        <span className="truncate">{displayValue}</span>
        {align === "right" && isWinner ? (
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[var(--accent)] sm:h-4 sm:w-4" />
        ) : null}
      </div>
    </td>
  );
}

function getMetricComparison(
  metric: MetricConfig,
  leftPlayer: ExplorerPlayer | null,
  rightPlayer: ExplorerPlayer | null
) {
  return comparePlayerValues({
    playerAValue: getMetricRawValue(metric, leftPlayer),
    playerBValue: getMetricRawValue(metric, rightPlayer),
    formatter: (value) => formatMetric(metric, value),
    comparisonDirection: metric.comparisonDirection,
  });
}

function getMetricRawValue(metric: MetricConfig, player: ExplorerPlayer | null) {
  if (!player || !metric.getValue) {
    return null;
  }

  return metric.getValue(player);
}

function formatMetric(metric: MetricConfig, value: string | number | null | undefined) {
  if (metric.formatter) {
    return metric.formatter(value);
  }

  if (value === null || value === undefined || value === "") {
    return metric.placeholder ?? "-";
  }

  return String(value);
}

function formatPercentage(value: string | number | null | undefined) {
  return value != null ? `${value}%` : "-";
}
