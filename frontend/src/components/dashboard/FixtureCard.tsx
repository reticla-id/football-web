"use client";

import { CalendarDays } from "lucide-react";

import type { Fixture } from "@/lib/supabase/types";

type Props = {
  fixture: Fixture;
};

export default function FixtureCard({ fixture }: Props) {
  const kickoff = new Date(fixture.starting_at);
  const homeCode = fixture.home.short_code || fixture.home.name;
  const awayCode = fixture.away.short_code || fixture.away.name;
  const leagueName = fixture.league.name || "League";
  const leagueImage = fixture.league.image_path || "/placeholder-club.png";
  const roundName = fixture.round_name || "-";

  return (
    <div className="w-full shrink-0 overflow-hidden -[24px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,24,0.94),rgba(10,10,10,0.96))] transition-all duration-200 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 border-b border-zinc-800/80 bg-zinc-950/70 px-4 py-3">
        <div />

        <div className="min-w-0 justify-self-center text-center">
          <div className="inline-flex max-w-full items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            <img
              src={leagueImage}
              alt={leagueName}
              className="h-3.5 w-3.5 shrink-0 object-contain"
            />
            <span className="truncate">Match Week</span>
          </div>

          <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300 sm:text-xs">
            {roundName}
          </p>
        </div>

        <span className="justify-self-end shrink-0 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-grey sm:px-3 sm:py-1">
          FT
        </span>
      </div>

      <div className="space-y-4 px-4 py-5">
        <div className="flex items-center justify-between px-3 py-4">
          <div className="flex min-w-0 flex-1 justify-center">
            <img
              src={fixture.home.image_path}
              alt={fixture.home.name}
              className="h-10 w-10 object-contain"
            />
          </div>

          <div className="flex shrink-0 items-center justify-center px-3">
            <span className="font-display text-[1.9rem] leading-none text-white">
              {fixture.home.goals} - {fixture.away.goals}
            </span>
          </div>

          <div className="flex min-w-0 flex-1 justify-center">
            <img
              src={fixture.away.image_path}
              alt={fixture.away.name}
              className="h-10 w-10 object-contain"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <span
            className={`truncate text-sm uppercase tracking-[0.16em] ${
              fixture.home.winner ? "font-semibold text-white" : "text-zinc-300"
            }`}
          >
            {homeCode}
          </span>

          <span
            className={`truncate text-sm uppercase tracking-[0.16em] ${
              fixture.away.winner ? "font-semibold text-white" : "text-zinc-300"
            }`}
          >
            {awayCode}
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
