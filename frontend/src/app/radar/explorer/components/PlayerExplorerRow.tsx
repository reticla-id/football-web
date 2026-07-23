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
    ? "md:grid-cols-[minmax(260px,2.2fr)_minmax(62px,72px)_minmax(76px,84px)_minmax(92px,104px)_minmax(72px,84px)_minmax(64px,72px)_minmax(68px,76px)_44px] xl:grid-cols-[minmax(320px,2.5fr)_76px_88px_110px_92px_72px_76px_48px]"
    : "md:grid-cols-[minmax(260px,2.2fr)_minmax(62px,72px)_minmax(76px,84px)_minmax(92px,104px)_minmax(72px,84px)_minmax(64px,72px)_minmax(68px,76px)] xl:grid-cols-[minmax(320px,2.5fr)_76px_88px_110px_92px_72px_76px]";
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
      className={`grid min-w-0 grid-cols-1 ${rowGridClassName} items-start gap-3 border-b border-zinc-800 px-3 py-3 transition-colors hover:bg-zinc-900/75 sm:px-4 md:items-center`}
    >
      <motion.button
        type="button"
        whileHover={{ x: 4 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onClick={() => onToggleExpanded?.(player.player_id)}
        className={`${contentSpanClassName} min-w-0 text-left md:grid md:grid-cols-subgrid md:items-center md:gap-3`}
        aria-expanded={isExpanded}
        aria-controls={`radar-player-panel-${player.player_id}`}
      >
        <div className="flex min-w-0 items-center gap-3 pl-1 sm:pl-2 md:pl-3 xl:pl-4">
          <img
            src={player.image_path ?? "/placeholder-player.png"}
            alt={player.display_name}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-white">{player.display_name}</p>
            <p className="truncate text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              {player.detailed_position_name}
            </p>
          </div>

          <div className="ml-auto flex shrink-0 justify-end pr-0 md:pr-2">
            <img
              src={player.team_image_path ?? "/placeholder-club.png"}
              alt={player.clubName}
              className="h-8 w-8 shrink-0 object-contain sm:ml-2"
            />
          </div>
        </div>

        <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 text-xs text-zinc-400 sm:grid-cols-3 md:mt-0 md:contents">
          <div className="border border-zinc-800/70 bg-zinc-950/55 px-3 py-2 md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-sm md:text-zinc-300">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-zinc-500 md:hidden">Age</span>
            {player.age ?? "-"}
          </div>
          <div className="border border-zinc-800/70 bg-zinc-950/55 px-3 py-2 md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-sm md:text-zinc-300">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-zinc-500 md:hidden">Height</span>
            {player.heightValue != null ? `${player.heightValue} cm` : "-"}
          </div>
          <div className="border border-zinc-800/70 bg-zinc-950/55 px-3 py-2 md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-sm md:text-zinc-300">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-zinc-500 md:hidden">Pref. Foot</span>
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

      <div className="mt-1 flex min-w-0 justify-end pr-0 md:mt-0 md:justify-center">
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
            className={`${detailCardSpanClassName} min-w-0 overflow-hidden`}
          >
            <div className="min-w-0 border border-zinc-800 bg-zinc-950/70 px-3 py-4 sm:px-4">
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {detailStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="min-w-0 border border-zinc-800/60 bg-zinc-950/55 px-3 py-3 xl:border-0 xl:bg-transparent"
                  >
                    <p className="break-words text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex min-w-0 justify-stretch md:justify-end">
                <Link
                  href={`/players/${player.slug}`}
                  className="accent-text inline-flex w-full max-w-full items-center justify-center gap-2 border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-sm font-medium transition hover:border-zinc-700 hover:text-white md:w-auto md:justify-end md:border-0 md:bg-transparent md:px-0 md:py-0"
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
