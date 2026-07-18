"use client";

import { Shirt } from "lucide-react";

import { cn } from "@/lib/utils";

interface LineupCardProps {
  index: number;
  compact?: boolean;
}

export default function LineupCard({ index, compact = false }: LineupCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border border-zinc-800 bg-zinc-950/70 px-3 py-3 transition-colors duration-200 hover:border-zinc-700 hover:bg-zinc-900/80",
        compact && "py-2.5"
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center border border-zinc-800 bg-black/50 text-zinc-500">
        <Shirt className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-white">Player Slot {index + 1}</p>
        <p className="text-xs text-zinc-500">Awaiting squad selection</p>
      </div>
    </div>
  );
}
