"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import type { ExplorerPlayer } from "./types";

export default function PlayerExplorerRow({
  player,
  rowAction,
}: {
  player: ExplorerPlayer;
  rowAction?: {
    label: string;
    title: string;
    tone: "accent" | "danger";
    onClick: (player: ExplorerPlayer) => void;
  };
}) {
  const rowGridClassName = rowAction
    ? "grid-cols-[minmax(0,2.4fr)_96px_120px_120px_88px_88px_52px]"
    : "grid-cols-[minmax(0,2.4fr)_96px_120px_120px_88px_88px]";
  const linkSpanClassName = rowAction ? "col-span-6" : "col-span-5";

  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`grid ${rowGridClassName} items-center gap-3 border-b border-zinc-800 px-4 py-3 transition-colors hover:bg-zinc-900/75`}
    >
      <Link
        href={`/players/${player.slug}`}
        className={`${linkSpanClassName} grid grid-cols-subgrid items-center gap-3`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={player.image_path ?? "/placeholder-player.png"}
            alt={player.display_name}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />

          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{player.display_name}</p>
            <p className="truncate text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              {player.position_name}
            </p>
          </div>

          <div className="ml-auto flex min-w-0 items-center gap-2">
            <img
              src={player.team_image_path ?? "/placeholder-club.png"}
              alt={player.clubName}
              className="h-7 w-7 shrink-0 object-contain"
            />
            <span className="truncate text-sm text-zinc-400">{player.clubName}</span>
          </div>
        </div>

        <div className="text-sm text-zinc-300">{player.age ?? "-"}</div>
        <div className="text-sm text-zinc-300">{player.prefer_foot ?? "-"}</div>
        <div className="text-sm text-zinc-300">{player.appearances ?? "-"}</div>
        <div className="text-sm font-medium text-white">{player.goals}</div>
        <div className="text-sm font-medium text-white">{player.assists}</div>
      </Link>

      <div className="flex justify-end">
        {rowAction ? (
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={
              rowAction.tone === "danger"
                ? "flex h-8 w-8 cursor-pointer items-center justify-center text-rose-500 transition-[opacity,filter,color] duration-200 hover:brightness-110 hover:opacity-80"
                : "accent-text flex h-8 w-8 cursor-pointer items-center justify-center transition-[opacity,filter,color] duration-200 hover:brightness-110 hover:opacity-80"
            }
            title={rowAction.title}
            aria-label={`${rowAction.label} ${player.display_name}`}
            onClick={() => rowAction.onClick(player)}
          >
            {rowAction.tone === "danger" ? (
              <Minus className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </motion.button>
        ) : null}
      </div>
    </motion.div>
  );
}
