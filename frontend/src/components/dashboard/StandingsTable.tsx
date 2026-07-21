import Link from "next/link";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import type { StandingRow } from "@/lib/supabase/types";

type TrendState = "up" | "down" | "neutral";

function normalizeTrend(result: StandingRow["result"] | null | undefined): TrendState {
  const value = String(result ?? "").trim().toLowerCase();

  if (value === "up" || value === "+1" || value === "rise") {
    return "up";
  }

  if (value === "down" || value === "-1" || value === "fall") {
    return "down";
  }

  return "neutral";
}

function getTrend(result: StandingRow["result"] | null | undefined) {
  const normalizedResult = normalizeTrend(result);

  switch (normalizedResult) {
    case "up":
      return {
        icon: ArrowUp,
        className: "accent-text",
      };

    case "down":
      return {
        icon: ArrowDown,
        className: "text-rose-400",
      };

    default:
      return {
        icon: Minus,
        className: "text-zinc-500",
      };
  }
}

function getRowPositionClass(position: number, totalRows: number) {
  if (position <= 3) {
    return "accent-border-soft accent-bg-soft accent-text";
  }

  if (position >= Math.max(totalRows - 2, 1)) {
    return "border-rose-500/30 bg-rose-500/10 text-rose-300";
  }

  return "border-zinc-700 bg-zinc-900 text-zinc-300";
}

function getFormClass(result: string) {
  if (result === "W") {
    return "accent-bg-soft accent-text";
  }

  if (result === "D") {
    return "bg-zinc-800 text-zinc-200";
  }

  return "bg-rose-500/15 text-rose-300";
}

function buildGoalDifference(row: StandingRow) {
  return (row.goalsFor ?? 0) - (row.goalsAgainst ?? 0);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function StandingsTable({ standings }: { standings: StandingRow[] }) {
  return (
    <div className="overflow-hidden border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,24,0.9),rgba(13,13,13,0.92))]">
      <div className="overflow-x-auto overscroll-x-contain">
        <table className="min-w-[620px] w-full divide-y divide-zinc-800 text-sm sm:min-w-0">
          <thead className="bg-zinc-950/90 text-zinc-500">
            <tr>
              <th className="w-14 px-2 py-3 text-center font-medium">Pos</th>
              <th className="w-12 px-2 py-3 text-center font-medium" aria-label="Trend" />
              <th className="min-w-[190px] px-3 py-3 text-left font-medium sm:min-w-[220px]">
                Club
              </th>
              <th className="w-10 px-2 py-3 text-center font-medium">P</th>
              <th className="w-10 px-2 py-3 text-center font-medium">W</th>
              <th className="w-10 px-2 py-3 text-center font-medium">D</th>
              <th className="w-10 px-2 py-3 text-center font-medium">L</th>
              <th className="w-12 px-2 py-3 text-center font-medium">+/-</th>
              <th className="w-12 px-2 py-3 text-center font-medium">Pts</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800 bg-transparent text-zinc-200">
            {standings.map((row) => {
              const trend = getTrend(row.result);
              const Icon = trend.icon;
              const goalDifference = buildGoalDifference(row);

              return (
                <tr
                  key={`${row.team}-${row.position}`}
                  className="transition-colors hover:bg-zinc-900/70"
                >
                  <td className="w-14 px-2 py-2 text-center">
                    <span
                      className={[
                        "inline-flex h-8 w-8 items-center justify-center border text-sm font-semibold",
                        getRowPositionClass(row.position, standings.length),
                      ].join(" ")}
                    >
                      {row.position}
                    </span>
                  </td>

                  <td className="w-12 px-2 py-2 text-center">
                    <Icon className={`mx-auto h-3.5 w-3.5 ${trend.className}`} />
                  </td>

                  <td className="min-w-[190px] px-3 py-3 sm:min-w-[220px] sm:px-4">
                    <Link
                      href={`/teams/${slugify(row.team)}`}
                      className="flex min-w-0 items-center gap-2.5 transition-colors hover:text-white"
                    >
                      <img
                        src={row.image_path || "/placeholder-club.png"}
                        alt={row.team}
                        className="h-7 w-7 shrink-0 bg-zinc-900 object-contain"
                      />
                      <span className="truncate pr-2 font-medium text-white">{row.team}</span>
                    </Link>
                  </td>

                  <td className="w-10 px-2 py-2 text-center text-zinc-300">{row.played}</td>
                  <td className="w-10 px-2 py-2 text-center text-zinc-300">{row.win}</td>
                  <td className="w-10 px-2 py-2 text-center text-zinc-300">{row.draw}</td>
                  <td className="w-10 px-2 py-2 text-center text-zinc-300">{row.loss}</td>
                  <td
                    className={`w-12 px-2 py-2 text-center font-medium ${
                      goalDifference >= 0 ? "accent-text" : "text-rose-300"
                    }`}
                  >
                    {goalDifference > 0 ? `+${goalDifference}` : goalDifference}
                  </td>
                  <td className="accent-text w-12 px-2 py-2 text-center font-semibold">
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FullStandingsTable({ standings }: { standings: StandingRow[] }) {
  return (
    <div className="overflow-hidden border border-zinc-800 bg-[linear-gradient(180deg,rgba(24,24,24,0.9),rgba(13,13,13,0.92))]">
      <div className="overflow-x-auto overscroll-x-contain">
        <table className="min-w-[820px] w-full border-collapse text-sm lg:min-w-0">
          <thead className="border-b border-zinc-800 bg-zinc-950 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="w-12 py-3 text-center font-medium">Pos</th>
              <th className="w-8 py-3 text-center font-medium" aria-label="Trend" />
              <th className="w-[24%] px-4 py-3 text-left font-medium">Club</th>
              <th className="w-10 py-3 text-center font-medium">P</th>
              <th className="w-10 py-3 text-center font-medium">W</th>
              <th className="w-10 py-3 text-center font-medium">D</th>
              <th className="w-10 py-3 text-center font-medium">L</th>
              <th className="w-10 py-3 text-center font-medium">GF</th>
              <th className="w-10 py-3 text-center font-medium">GA</th>
              <th className="w-12 py-3 text-center font-medium">+/-</th>
              <th className="w-12 py-3 text-center font-medium">Pts</th>
              <th className="w-28 py-3 text-center font-medium">Recent Form</th>
            </tr>
          </thead>

          <tbody>
            {standings.map((row) => {
              const trend = getTrend(row.result);
              const Icon = trend.icon;
              const goalDifference = buildGoalDifference(row);

              return (
                <tr
                  key={`${row.team}-${row.position}`}
                  className="border-b border-zinc-800 transition-colors hover:bg-white/[0.03]"
                >
                  <td className="py-3 text-center">
                    <span
                      className={[
                        "inline-flex h-8 w-8 items-center justify-center border text-sm font-semibold",
                        getRowPositionClass(row.position, standings.length),
                      ].join(" ")}
                    >
                      {row.position}
                    </span>
                  </td>

                  <td className="text-center">
                    <Icon className={`mx-auto h-4 w-4 ${trend.className}`} />
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/teams/${slugify(row.team)}`}
                      className="flex min-w-0 items-center gap-3 transition-colors hover:text-white"
                    >
                      <img
                        src={row.image_path || "/placeholder-club.png"}
                        alt={row.team}
                        className="h-8 w-8 shrink-0 object-contain"
                      />
                      <span className="truncate font-medium text-white">{row.team}</span>
                    </Link>
                  </td>

                  <td className="text-center text-zinc-300">{row.played}</td>
                  <td className="text-center text-zinc-300">{row.win}</td>
                  <td className="text-center text-zinc-300">{row.draw}</td>
                  <td className="text-center text-zinc-300">{row.loss}</td>
                  <td className="text-center text-zinc-300">{row.goalsFor ?? 0}</td>
                  <td className="text-center text-zinc-300">{row.goalsAgainst ?? 0}</td>
                  <td
                    className={`text-center font-medium ${
                      goalDifference >= 0 ? "accent-text" : "text-rose-300"
                    }`}
                  >
                    {goalDifference > 0 ? `+${goalDifference}` : goalDifference}
                  </td>
                  <td className="text-center text-base font-bold accent-text">
                    {row.points}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex justify-center gap-1">
                      {(row.form ?? "").split("").map((result, index) => (
                        <span
                          key={`${row.team}-${index}-${result}`}
                          className={`flex h-6 w-6 items-center justify-center text-[10px] font-semibold ${getFormClass(result)}`}
                        >
                          {result}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
