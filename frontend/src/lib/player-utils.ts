import { Player } from "@/types/player";

const POSITION_ORDER: Record<string, number> = {
  Goalkeeper: 1,
  Defender: 2,
  Midfielder: 3,
  Attacker: 4,
};

export function sortPlayers(players: Player[]) {
  return [...players].sort((a, b) => {
    const pa = POSITION_ORDER[a.position] ?? 99;
    const pb = POSITION_ORDER[b.position] ?? 99;

    if (pa !== pb) return pa - pb;

    return a.display_name.localeCompare(b.display_name);
  });
}