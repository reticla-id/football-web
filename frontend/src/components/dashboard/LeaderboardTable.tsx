import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { buildPlayerSlug } from "@/lib/player-utils";

interface LeaderboardRow {
  rank: number;
  name: string;
  team: string;
  image_path?: string;
  team_image_path?: string;
  value: number;
  label: string;
}

interface LeaderboardTableProps extends ComponentPropsWithoutRef<"div"> {
  title: string;
  description: string;
  rows: LeaderboardRow[];
  emptyMessage: string;
}

export function LeaderboardTable({
  title,
  description,
  rows,
  emptyMessage,
  className,
}: LeaderboardTableProps) {
  return (
    <div
      className={`overflow-hidden -[24px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,24,0.94),rgba(11,11,11,0.94))] ${className ?? ""}`}
    >
      <div className="border-b border-zinc-800 px-4 py-4">
        <h3 className="font-display text-[1.45rem] leading-none text-white">{title}</h3>
        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-zinc-500">{description}</p>
      </div>

      {rows.length === 0 ? (
        <div className="p-6 text-center text-sm text-zinc-500">{emptyMessage}</div>
      ) : (
        <div>
          {rows.map((row) => (
            <Link
              key={`${row.rank}-${row.name}`}
              href={`/players/${buildPlayerSlug(row.name)}`}
              className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 transition-colors hover:bg-zinc-900/75 last:border-none"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className={`flex h-6 w-6 items-center justify-center -full text-xs font-bold ${
                    row.rank === 1
                      ? "bg-yellow-400 text-black"
                      : "border border-zinc-800 bg-zinc-950 text-zinc-400"
                  }`}
                >
                  {row.rank}
                </div>

                <img
                  src={row.image_path || "/placeholder-player.png"}
                  alt={row.name}
                  className="h-9 w-9 -full rounded-full object-cover"
                />

                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{row.name}</p>
                  <p className="truncate text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    {row.team}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="font-display text-[1.6rem] leading-none text-white">
                  {row.value}
                </div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  {row.label}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
