"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus } from "lucide-react";

import type { ExplorerPlayer } from "./types";

export default function PlayerExplorerRow({
  player,
  isExpanded = false,
  onToggleExpanded,
  rowAction,
}: {
  player: ExplorerPlayer;
  isExpanded?: boolean;
  onToggleExpanded?: (playerId: number) => void;
  rowAction?: {
    label: string;
    title: string;
    tone: "accent" | "danger";
    onClick: (player: ExplorerPlayer) => void;
  };
}) {
  const rowGridClassName = rowAction
    ? "grid-cols-[minmax(0,2.2fr)_90px_96px_112px_112px_88px_88px_52px]"
    : "grid-cols-[minmax(0,2.2fr)_90px_96px_112px_112px_88px_88px]";
  const contentSpanClassName = rowAction ? "col-span-7" : "col-span-6";
  const detailCardSpanClassName = rowAction ? "col-span-8" : "col-span-7";
  const detailStats = [
    { label: "Successful Passes", value: player.successful_passes },
    { label: "Pass Accuracy %", value: formatPercentage(player.pass_accuracy) },
    { label: "Tackles Won", value: player.tackles_won },
    { label: "Interceptions", value: player.interceptions },
    { label: "Saves", value: player.saves },
  ];

  return (
    <div
      className={`grid ${rowGridClassName} items-center gap-3 border-b border-zinc-800 px-4 py-3 transition-colors hover:bg-zinc-900/75`}
    >
      <motion.button
        type="button"
        whileHover={{ x: 4 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onClick={() => onToggleExpanded?.(player.player_id)}
        className={`${contentSpanClassName} grid grid-cols-subgrid items-center gap-3 text-left`}
        aria-expanded={isExpanded}
        aria-controls={`radar-player-panel-${player.player_id}`}
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
              {player.detailed_position_name}
            </p>
          </div>

          <div className="ml-auto flex justify-end">
            <img
              src={player.team_image_path ?? "/placeholder-club.png"}
              alt={player.clubName}
              className="h-7 w-7 shrink-0 object-contain"
            />
          </div>
        </div>

        <div className="text-sm text-zinc-300">{player.age ?? "-"}</div>
        <div className="text-sm text-zinc-300">
          {player.heightValue != null ? `${player.heightValue} cm` : "-"}
        </div>
        <div className="text-sm text-zinc-300">{player.prefer_foot ?? "-"}</div>
        <div className="text-sm text-zinc-300">{player.appearances ?? "-"}</div>
        <div className="text-sm font-medium text-white">{player.goals}</div>
        <div className="text-sm font-medium text-white">{player.assists}</div>
      </motion.button>

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
            onClick={(event) => {
              event.stopPropagation();
              rowAction.onClick(player);
            }}
          >
            {rowAction.tone === "danger" ? (
              <Minus className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </motion.button>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            id={`radar-player-panel-${player.player_id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`${detailCardSpanClassName} overflow-hidden`}
          >
            <div className="border border-zinc-800 bg-zinc-950/70 px-4 py-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {detailStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="px-3 py-3"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  href={`/players/${player.slug}`}
                  className="accent-text inline-flex items-center gap-2 text-sm font-medium transition hover:text-white"
                >
                  View Player
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function formatPercentage(value: number | null) {
  return value != null ? `${value}%` : "-";
}
