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
  rowAction,
  emptyState,
}: Props) {
  const EmptyIcon = emptyState.icon;
  const hasAction = Boolean(rowAction);
  const gridClassName = hasAction
    ? "grid-cols-[minmax(0,2.4fr)_96px_120px_120px_88px_88px_52px]"
    : "grid-cols-[minmax(0,2.4fr)_96px_120px_120px_88px_88px]";
  const columns: Array<{ key: ExplorerSortColumn; label: string }> = [
    { key: "display_name", label: "Player" },
    { key: "age", label: "Age" },
    { key: "prefer_foot", label: "Preferred Foot" },
    { key: "appearances", label: "Appearances" },
    { key: "goals", label: "Goals" },
    { key: "assists", label: "Assists" },
  ];

  return (
    <Card className="overflow-hidden border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,24,0.94),rgba(11,11,11,0.94))]">
      <div className="border-b border-zinc-800 px-4 py-4">
        <h3 className="font-display text-[1.45rem] leading-none text-white">
          Player Pool
        </h3>
        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-zinc-500">
          Scouting shortlist
        </p>
      </div>

      <div className="border-b border-zinc-800 bg-zinc-950/60 px-4 py-3">
        <div
          className={cn(
            "grid gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500",
            gridClassName
          )}
        >
          {columns.map((column) => {
            const active = sortState?.column === column.key;
            const direction = active ? sortState?.direction : null;

            return (
              <button
                key={column.key}
                type="button"
                onClick={() => onSortChange?.(column.key)}
                className={cn(
                  "flex items-center gap-1.5 text-left transition-colors hover:text-white",
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
        <div>
          {players.map((player) => (
            <PlayerExplorerRow
              key={player.player_id}
              player={player}
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
