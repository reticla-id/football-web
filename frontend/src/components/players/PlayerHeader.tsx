import { Flag, Ruler, Shirt, Shield, Timer } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getPlayerAge } from "@/lib/player-utils";
import type { PlayerSummary } from "@/types/player";

interface Props {
  player: PlayerSummary;
}

export default function PlayerHeader({ player }: Props) {
  const currentAge = getPlayerAge(player.date_of_birth);

  return (
    <Card className="overflow-hidden -[28px] border-zinc-800/80 bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--accent)_18%,transparent),_transparent_35%),linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,11,0.94))]">
      <div className="grid gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10 lg:px-10">
        <div className="mx-auto flex h-28 w-28 items-center justify-center -[24px] border border-zinc-800 bg-zinc-950 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.35)] sm:h-32 sm:w-32 lg:mx-0">
          <img
            src={player.image_path ?? "/placeholder-player.png"}
            alt={player.display_name}
            className="h-full w-full -[20px] object-cover"
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="space-y-4 text-center lg:text-left">
          <div className="space-y-2">
            <p className="accent-text text-xs font-semibold uppercase tracking-[0.32em]">
              Player Profile
            </p>

            <h1 className="font-display text-[3.1rem] leading-[0.92] text-white sm:text-[4rem] lg:text-[5rem]">
              {player.display_name}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-400 lg:justify-start">
              <span className="-full border border-zinc-800 bg-zinc-950/70 px-3 py-1">
                {player.team_name ?? "Club unavailable"}
              </span>
              <span className="-full border border-zinc-800 bg-zinc-950/70 px-3 py-1">
                {player.position_name ?? "Position unavailable"}
              </span>
              <span className="-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 font-medium text-zinc-300">
                {player.detailed_position_name ? `#${player.detailed_position_name}` : "No number"}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <HeaderPill
              icon={<Flag className="accent-text h-4 w-4" />}
              label="Nationality"
              value={player.nationality ?? "-"}
            />
            <HeaderPill
              icon={<Timer className="accent-text h-4 w-4" />}
              label="Age"
              value={currentAge != null ? `${currentAge}` : "-"}
            />
            <HeaderPill
              icon={<Ruler className="accent-text h-4 w-4" />}
              label="Height"
              value={player.height ? `${player.height}` : "-"}
            />
            <HeaderPill
              icon={<Shield className="accent-text h-4 w-4" />}
              label="Season"
              value={player.prefer_foot ?? "-"}
            />
            <HeaderPill
              icon={<Shirt className="accent-text h-4 w-4" />}
              label="Role"
              value={player.position_name ?? "-"}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

function HeaderPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="-2xl border border-zinc-800/80 bg-zinc-950/70 px-4 py-3">
      <div className="flex items-center justify-center gap-2 lg:justify-start">
        {icon}
        <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">{label}</p>
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
