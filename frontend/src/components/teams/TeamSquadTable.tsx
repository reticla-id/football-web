"use client";

import { useMemo, useState } from "react";

import type { SquadPlayer } from "@/types/squad";

import SquadSeasonFilter from "./SquadSeasonFilter";
import SquadTable from "./SquadTable";

interface Props {
  players: SquadPlayer[];
}

const POSITION_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];

export default function TeamSquadTable({ players }: Props) {
  const seasons = useMemo(
    () =>
      Array.from(
        new Set(
          players
            .map((player) => player.season?.name)
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => b.localeCompare(a)),
    [players]
  );
  const [season, setSeason] = useState("");
  const effectiveSeason = seasons.includes(season) ? season : (seasons[0] ?? "");

  const filteredPlayers = useMemo(() => {
    const seasonPlayers = effectiveSeason
      ? players.filter((player) => player.season?.name === effectiveSeason)
      : players;

    return [...seasonPlayers].sort((a, b) => {
      const pa = POSITION_ORDER.indexOf(a.position.name ?? "");
      const pb = POSITION_ORDER.indexOf(b.position.name ?? "");

      if (pa !== pb) {
        return (pa === -1 ? POSITION_ORDER.length : pa) -
          (pb === -1 ? POSITION_ORDER.length : pb);
      }

      const jerseyDelta = (a.jersey_number ?? 999) - (b.jersey_number ?? 999);
      if (jerseyDelta !== 0) {
        return jerseyDelta;
      }

      return String(a.player?.name ?? "").localeCompare(String(b.player?.name ?? ""));
    });
  }, [effectiveSeason, players]);

  return (
    <section
      id="team-panel-squad"
      role="tabpanel"
      aria-labelledby="team-tab-squad"
      className="space-y-5"
    >
      <div className="flex flex-col gap-4 -[24px] border border-zinc-800/80 bg-zinc-900/70 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Squads</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {filteredPlayers.length} player{filteredPlayers.length === 1 ? "" : "s"}
            {effectiveSeason ? ` in ${effectiveSeason}` : ""}
          </p>
        </div>

        <SquadSeasonFilter seasons={seasons} value={effectiveSeason} onChange={setSeason} />
      </div>

      <SquadTable players={filteredPlayers} />
    </section>
  );
}
