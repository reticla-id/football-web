import { MapPin, Shield } from "lucide-react";

import { Card } from "@/components/ui/card";

import type { Team } from "@/types/team";

interface TeamHeaderProps {
  team: Team;
}

export default function TeamHeader({ team }: TeamHeaderProps) {
  return (
    <Card className="overflow-hidden border-zinc-800/80 bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--accent)_18%,transparent),_transparent_35%),linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,11,0.94))]">
      <div className="grid gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10 lg:px-10">
        <div className="mx-auto flex h-28 w-28 items-center rounded-[24px] justify-center -[24px] border border-zinc-800 bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)] sm:h-32 sm:w-32 lg:mx-0">
          <img
            src={team.logo ?? "/placeholder-club.png"}
            alt={`${team.name} logo`}
            className="h-full w-full object-contain"
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="space-y-4 text-center lg:text-left">
          <div className="space-y-2">
            <p className="accent-text text-xs font-semibold uppercase tracking-[0.32em]">
              Team Profile
            </p>

            <h1 className="font-display text-[3.1rem] leading-[0.92] text-white sm:text-[4rem] lg:text-[5rem]">
              {team.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-400 lg:justify-start">
              <span className="-full border border-zinc-800 bg-zinc-950/70 px-3 py-1">
                {team.league ?? "League unavailable"}
              </span>
              <span className="-full border border-zinc-800 bg-zinc-950/70 px-3 py-1">
                {team.country ?? "Country unavailable"}
              </span>
              {team.short_code ? (
                <span className="-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 font-medium text-zinc-300">
                  {team.short_code}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-300 lg:justify-start">
            <div className="inline-flex items-center gap-2 -full border border-zinc-800/90 bg-zinc-950/80 px-4 py-2">
              <MapPin className="accent-text h-4 w-4" />
              <span>{team.stadium ?? "Unknown stadium"}</span>
            </div>

            <div className="inline-flex items-center gap-2 -full border border-zinc-800/90 bg-zinc-950/80 px-4 py-2">
              <Shield className="h-4 w-4 text-zinc-400" />
              <span>Founded {team.founded ?? "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
