"use client";

import { ChevronDown, Shield } from "lucide-react";

import { cn } from "@/lib/utils";

interface FormationCardProps {
  side: "Home" | "Away";
  formation: string;
}

export default function FormationCard({ side, formation }: FormationCardProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            {side}
          </p>
          <p className="mt-1 text-sm font-medium text-white">Formation</p>
        </div>

        <div className="flex items-center gap-2 border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-zinc-300">
          <Shield className="h-4 w-4 accent-text" />
          <span>{formation}</span>
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 bg-zinc-800",
              index === 1 ? "bg-[color:var(--accent)]/60" : ""
            )}
          />
        ))}
      </div>
    </div>
  );
}
