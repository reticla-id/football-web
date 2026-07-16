import { memo } from "react";
import { useRouter } from "next/navigation";

import type { SquadPlayer } from "@/types/squad";

interface Props {
  player: SquadPlayer;
}

function PlayerRow({ player }: Props) {
  const router = useRouter();
  const minutesPlayed =
    typeof player.minutes_played === "number"
      ? player.minutes_played.toLocaleString()
      : "-";
  const href = `/players/${slugify(player.player.name)}`;

  return (
    <tr
      role="link"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(href);
        }
      }}
      className="cursor-pointer border-b border-zinc-800/70 transition-colors duration-200 hover:bg-zinc-800/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--accent)]"
    >
      <td className="px-4 py-4 text-center font-semibold text-zinc-400 sm:px-5">
        {player.jersey_number ?? "-"}
      </td>

      <td className="px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <img
            src={player.player.image_path ?? "/placeholder-player.png"}
            alt={player.player.name}
            className="h-11 w-11 rounded-full bg-zinc-900 object-cover"
            loading="lazy"
            decoding="async"
          />

          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{player.player.name}</p>
            <p className="text-xs text-zinc-500">{player.detailed_position.name}</p>
          </div>
        </div>
      </td>

      <td className="px-3 text-center text-zinc-300">{player.age ?? "-"}</td>
      <td className="px-3 text-center text-zinc-300">{player.country.name ?? "-"}</td>
      <td className="px-3 text-center text-zinc-300">{player.appearances}</td>
      <td className="px-3 text-center font-medium text-white">{player.goals}</td>
      <td className="px-3 text-center font-medium text-white">{player.assists}</td>
      <td className="px-3 text-center text-zinc-300">{minutesPlayed}</td>
      <td className="px-3 text-center">
        <span className="accent-bg-soft accent-text inline-flex px-2.5 py-1 text-xs font-semibold">
          {player.rating ? player.rating.toFixed(2) : "-"}
        </span>
      </td>
      <td className="px-3 text-center text-yellow-300">{player.yellow_cards}</td>
      <td className="px-3 text-center text-red-400">{player.red_cards}</td>
    </tr>
  );
}

export default memo(PlayerRow);

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
