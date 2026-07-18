"use client";

import { Users } from "lucide-react";

interface BenchCardProps {
  count?: number;
}

export default function BenchCard({ count = 7 }: BenchCardProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Bench Area
          </p>
          <p className="mt-1 text-sm font-medium text-white">Substitutes</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center border border-zinc-800 bg-black/50 text-zinc-500">
          <Users className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="border border-dashed border-zinc-800 bg-black/25 px-3 py-2 text-xs text-zinc-500"
          >
            Bench Slot {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
