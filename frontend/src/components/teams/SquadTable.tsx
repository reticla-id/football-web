import type { SquadPlayer } from "@/types/squad";

import PlayerRow from "./PlayerRow";

interface Props {
  players: SquadPlayer[];
}

export default function SquadTable({ players }: Props) {
  if (!players.length) {
    return (
      <div className="-[24px] border border-dashed border-zinc-800 bg-zinc-900/60 px-6 py-12 text-center">
        <p className="text-base font-medium text-white">No squad data available</p>
        <p className="mt-2 text-sm text-zinc-500">
          Try another season filter or check back when player data has been synced.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden -[24px] border border-zinc-800/80 bg-zinc-900/60">
      <div className="border-b border-zinc-800/80 bg-zinc-950/70 px-4 py-3 text-xs uppercase tracking-[0.24em] text-zinc-500 sm:px-5">
        Swipe sideways on smaller screens to explore the full squad table.
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full text-sm">
          <thead className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
            <tr className="text-zinc-500">
              <th className="px-4 py-3 text-left font-medium sm:px-5">#</th>
              <th className="px-4 py-3 text-left font-medium sm:px-5">Player</th>
              <th className="px-3 py-3 text-center font-medium">Age</th>
              <th className="px-3 py-3 text-center font-medium">Country</th>
              <th className="px-3 py-3 text-center font-medium">Apps</th>
              <th className="px-3 py-3 text-center font-medium">Goals</th>
              <th className="px-3 py-3 text-center font-medium">Assists</th>
              <th className="px-3 py-3 text-center font-medium">Minutes</th>
              <th className="px-3 py-3 text-center font-medium">Rating</th>
              <th className="px-3 py-3 text-center font-medium">YC</th>
              <th className="px-3 py-3 text-center font-medium">RC</th>
            </tr>
          </thead>

          <tbody>
            {players.map((player) => (
              <PlayerRow key={player.id} player={player} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
