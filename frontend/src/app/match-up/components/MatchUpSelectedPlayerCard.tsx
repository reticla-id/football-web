"use client";

import { UserRound, Shield } from "lucide-react";

import type { ExplorerPlayer } from "@/app/radar/explorer/components/types";

interface MatchUpSelectedPlayerCardProps {
  title: string;
  player: ExplorerPlayer | null;
}

export default function MatchUpSelectedPlayerCard({
  title,
  player,
}: MatchUpSelectedPlayerCardProps) {
  return (
    <div className="min-w-0 overflow-hidden border border-zinc-800 bg-zinc-950/70 p-4 sm:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
        {title}
      </p>

      {player ? (
        <div className="mt-4 flex min-w-0 items-start gap-3 sm:gap-4">
          <img
            src={player.image_path ?? "/placeholder-player.png"}
            alt={player.display_name}
            className="h-14 w-14 shrink-0 rounded-full object-cover sm:h-16 sm:w-16"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-white sm:text-lg">
              {player.display_name}
            </p>
            <p className="mt-1 truncate text-[11px] uppercase tracking-[0.2em] text-zinc-500 sm:text-xs">
              {player.positionLabel}
            </p>
            <div className="mt-3 grid gap-2 text-sm text-zinc-300 sm:mt-4">
              <div className="flex min-w-0 items-center gap-2">
                <Shield className="h-4 w-4 shrink-0 text-zinc-500" />
                <span className="truncate">{player.clubName}</span>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <UserRound className="h-4 w-4 shrink-0 text-zinc-500" />
                <span className="truncate">{player.nationality ?? "-"}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 border border-dashed border-zinc-800 bg-black/20 px-4 py-8 text-center sm:py-10">
          <p className="text-sm text-zinc-500">
            Select a player to populate this comparison slot.
          </p>
        </div>
      )}
    </div>
  );
}
