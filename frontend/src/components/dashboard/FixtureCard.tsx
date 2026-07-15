"use client";

import { CalendarDays } from "lucide-react";

import type { Fixture } from "@/lib/supabase/types";

type Props = {
  fixture: Fixture;
};

export default function FixtureCard({ fixture }: Props) {
  const kickoff = new Date(fixture.starting_at);

  return (
    <div className="w-full shrink-0 overflow-hidden -[24px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,24,0.94),rgba(10,10,10,0.96))] transition-all duration-200 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/70 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <img src={fixture.league.image_path} className="h-5 w-5 object-contain" />

          <span className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
            {fixture.league.name}
          </span>
        </div>

        <span className="-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-grey">
          FT
        </span>
      </div>

      <div className="space-y-3 px-4 py-5">
        <div className="flex items-center justify-between -2xl border border-zinc-800/70 bg-zinc-950/55 px-3 py-3">
          <div className="flex items-center gap-3">
            <img src={fixture.home.image_path} className="h-9 w-9 object-contain" />

            <span
              className={`text-sm ${
                fixture.home.winner ? "font-semibold text-white" : "text-zinc-300"
              }`}
            >
              {fixture.home.name}
            </span>
          </div>

          <span className="font-display text-[1.8rem] leading-none text-white">
            {fixture.home.goals}
          </span>
        </div>

        <div className="flex items-center justify-between -2xl border border-zinc-800/70 bg-zinc-950/55 px-3 py-3">
          <div className="flex items-center gap-3">
            <img src={fixture.away.image_path} className="h-9 w-9 object-contain" />

            <span
              className={`text-sm ${
                fixture.away.winner ? "font-semibold text-white" : "text-zinc-300"
              }`}
            >
              {fixture.away.name}
            </span>
          </div>

          <span className="font-display text-[1.8rem] leading-none text-white">
            {fixture.away.goals}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-zinc-800/80 px-4 py-3 text-xs text-zinc-500">
        <CalendarDays className="accent-text h-3.5 w-3.5" />

        {kickoff.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </div>
    </div>
  );
}
