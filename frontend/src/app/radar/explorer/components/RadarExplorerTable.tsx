"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import PlayerExplorerRow from "./PlayerExplorerRow";
import type {
  ExplorerPlayer,
  ExplorerSortColumn,
  ExplorerSortState,
} from "./types";

interface Props {
  players: ExplorerPlayer[];
  isLoading: boolean;
  sortState?: ExplorerSortState;
  onSortChange?: (column: ExplorerSortColumn) => void;
  expandedPlayerId?: number | null;
  onToggleExpandedPlayer?: (playerId: number) => void;
  rowAction?: {
    label: string;
    title: string;
    tone: "accent" | "danger";
    onClick: (player: ExplorerPlayer) => void;
  };
  emptyState: {
    icon: LucideIcon;
    title: string;
    description: string;
    ctaLabel?: string;
    ctaHref?: string;
  };
}

export default function RadarExplorerTable({
  players,
  isLoading,
  sortState,
  onSortChange,
  expandedPlayerId,
  onToggleExpandedPlayer,
  rowAction,
  emptyState,
}: Props) {
  const EmptyIcon = emptyState.icon;
  const hasAction = Boolean(rowAction);
  const gridClassName = hasAction
    ? "md:grid-cols-[minmax(260px,2.2fr)_minmax(62px,72px)_minmax(76px,84px)_minmax(92px,104px)_minmax(72px,84px)_minmax(64px,72px)_minmax(68px,76px)_44px] xl:grid-cols-[minmax(320px,2.5fr)_76px_88px_110px_92px_72px_76px_48px]"
    : "md:grid-cols-[minmax(260px,2.2fr)_minmax(62px,72px)_minmax(76px,84px)_minmax(92px,104px)_minmax(72px,84px)_minmax(64px,72px)_minmax(68px,76px)] xl:grid-cols-[minmax(320px,2.5fr)_76px_88px_110px_92px_72px_76px]";
  const columns: Array<{ key: ExplorerSortColumn; label: string }> = [
    { key: "display_name", label: "Player" },
    { key: "age", label: "Age" },
    { key: "height", label: "Height" },
    { key: "prefer_foot", label: "Preferred Foot" },
    { key: "appearances", label: "Appearances" },
    { key: "goals", label: "Goals" },
    { key: "assists", label: "Assists" },
  ];

  return (
    <Card className="w-full min-w-0 overflow-hidden border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,24,0.94),rgba(11,11,11,0.94))]">
      <div className="border-b border-zinc-800 px-4 py-4">
        <h3 className="font-display text-[1.45rem] leading-none text-white">
          Player Pool
        </h3>
        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-zinc-500">
          Listed Players by Criteria
        </p>
      </div>

      <div className="hidden border-b border-zinc-800 bg-zinc-950/60 px-4 py-3 md:block">
        <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain">
          <div
            className={cn(
              "grid min-w-[720px] gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 lg:min-w-[780px] xl:min-w-0",
              gridClassName
            )}
          >
            {columns.map((column, index) => {
              const active = sortState?.column === column.key;
              const direction = active ? sortState?.direction : null;

              return (
                <button
                  key={column.key}
                  type="button"
                  onClick={() => onSortChange?.(column.key)}
                  className={cn(
                    "min-w-0 items-center gap-1.5 truncate text-left transition-colors hover:text-white",
                    index === 0 ? "flex" : "inline-flex justify-center md:justify-start",
                    index === 0 && "pl-3 xl:pl-4",
                    !onSortChange && "pointer-events-none"
                  )}
                  aria-label={`Sort by ${column.label}`}
                >
                  <span>{column.label}</span>
                  {direction === "asc" ? (
                    <ChevronUp className="h-3.5 w-3.5 text-white" />
                  ) : direction === "desc" ? (
                    <ChevronDown className="h-3.5 w-3.5 text-white" />
                  ) : null}
                </button>
              );
            })}
            {hasAction ? <div className="text-right">{rowAction?.label}</div> : null}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div aria-hidden="true">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-[74px] animate-pulse border-b border-zinc-800 bg-zinc-900/50 last:border-b-0"
            />
          ))}
        </div>
      ) : players.length ? (
        <div className="w-full min-w-0">
          {players.map((player) => (
            <PlayerExplorerRow
              key={player.player_id}
              player={player}
              isExpanded={expandedPlayerId === player.player_id}
              onToggleExpanded={onToggleExpandedPlayer}
              rowAction={rowAction}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center border border-zinc-800 bg-zinc-950 text-zinc-400">
            <EmptyIcon className="h-6 w-6" />
          </div>
          <p className="mt-5 font-display text-[2rem] leading-none text-white">
            {emptyState.title}
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">
            {emptyState.description}
          </p>
          {emptyState.ctaLabel && emptyState.ctaHref ? (
            <Button asChild type="button" className="mt-5 !text-black">
              <Link href={emptyState.ctaHref}>{emptyState.ctaLabel}</Link>
            </Button>
          ) : null}
        </div>
      )}
    </Card>
  );
}
