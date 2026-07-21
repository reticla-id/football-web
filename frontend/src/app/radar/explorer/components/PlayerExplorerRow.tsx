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
    ? "md:grid-cols-[minmax(280px,2.6fr)_78px_88px_108px_108px_80px_80px_44px] xl:grid-cols-[minmax(320px,2.7fr)_88px_96px_116px_116px_84px_84px_48px]"
    : "md:grid-cols-[minmax(280px,2.6fr)_78px_88px_108px_108px_80px_80px] xl:grid-cols-[minmax(320px,2.7fr)_88px_96px_116px_116px_84px_84px]";
  const contentSpanClassName = rowAction ? "md:col-span-7" : "md:col-span-6";
  const detailCardSpanClassName = rowAction ? "md:col-span-8" : "md:col-span-7";
  const detailStats = [
    { label: "Successful Passes", value: player.successful_passes },
    { label: "Pass Accuracy %", value: formatPercentage(player.pass_accuracy) },
    { label: "Tackles Won", value: player.tackles_won },
    { label: "Interceptions", value: player.interceptions },
    { label: "Saves", value: player.saves },
  ];

  return (
    <div
      className={`grid grid-cols-1 ${rowGridClassName} items-start gap-3 border-b border-zinc-800 px-4 py-3 transition-colors hover:bg-zinc-900/75 md:items-center`}
    >
      <motion.button
        type="button"
        whileHover={{ x: 4 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onClick={() => onToggleExpanded?.(player.player_id)}
        className={`${contentSpanClassName} text-left md:grid md:grid-cols-subgrid md:items-center md:gap-3`}
        aria-expanded={isExpanded}
        aria-controls={`radar-player-panel-${player.player_id}`}
      >
        <div className="flex min-w-0 items-center gap-4 pl-2 md:pl-3 xl:pl-4">
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

          <div className="ml-auto flex justify-end pr-1 md:pr-2">
            <img
              src={player.team_image_path ?? "/placeholder-club.png"}
              alt={player.clubName}
              className="h-8 w-8 shrink-0 object-contain"
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400 md:mt-0 md:contents">
          <div className="border border-zinc-800/70 bg-zinc-950/55 px-3 py-2 md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-sm md:text-zinc-300">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-zinc-500 md:hidden">Age</span>
            {player.age ?? "-"}
          </div>
          <div className="border border-zinc-800/70 bg-zinc-950/55 px-3 py-2 md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-sm md:text-zinc-300">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-zinc-500 md:hidden">Height</span>
            {player.heightValue != null ? `${player.heightValue} cm` : "-"}
          </div>
          <div className="border border-zinc-800/70 bg-zinc-950/55 px-3 py-2 md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-sm md:text-zinc-300">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-zinc-500 md:hidden">Foot</span>
            {player.prefer_foot ?? "-"}
          </div>
          <div className="border border-zinc-800/70 bg-zinc-950/55 px-3 py-2 md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-sm md:text-zinc-300">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-zinc-500 md:hidden">Apps</span>
            {player.appearances ?? "-"}
          </div>
          <div className="border border-zinc-800/70 bg-zinc-950/55 px-3 py-2 font-medium text-white md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-sm">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-zinc-500 md:hidden">Goals</span>
            {player.goals}
          </div>
          <div className="border border-zinc-800/70 bg-zinc-950/55 px-3 py-2 font-medium text-white md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-sm">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-zinc-500 md:hidden">Assists</span>
            {player.assists}
          </div>
        </div>
      </motion.button>

      <div className="mt-1 flex justify-end pr-1 sm:pr-0 md:mt-0 md:justify-center md:pr-0">
        {rowAction ? (
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={
              rowAction.tone === "danger"
                ? "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-rose-500 transition-[opacity,filter,color] duration-200 hover:brightness-110 hover:opacity-80"
                : "accent-text flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center transition-[opacity,filter,color] duration-200 hover:brightness-110 hover:opacity-80"
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
                    className="border border-zinc-800/60 bg-zinc-950/55 px-3 py-3 xl:border-0 xl:bg-transparent"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-stretch sm:justify-end">
                <Link
                  href={`/players/${player.slug}`}
                  className="accent-text inline-flex w-full items-center justify-center gap-2 border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-sm font-medium transition hover:border-zinc-700 hover:text-white sm:w-auto sm:justify-end sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"
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
