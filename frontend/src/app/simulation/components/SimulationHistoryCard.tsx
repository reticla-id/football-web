"use client";

import { History } from "lucide-react";

interface SimulationHistoryCardProps {
  title: string;
  description: string;
}

export default function SimulationHistoryCard({
  title,
  description,
}: SimulationHistoryCardProps) {
  return (
    <div className="border border-dashed border-zinc-800 bg-black/20 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center border border-zinc-800 bg-zinc-950/70 text-zinc-500">
          <History className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        </div>
      </div>
    </div>
  );
}
