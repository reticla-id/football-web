"use client";

import { Search, FolderOpenDot } from "lucide-react";

import type { ExplorerPlayer } from "@/app/radar/explorer/components/types";
import type { ShortlistCollection } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SelectionMode = "shortlist" | "manual";

interface MatchUpPlayerPickerProps {
  title: string;
  mode: SelectionMode;
  onModeChange: (mode: SelectionMode) => void;
  selectedPlayer: ExplorerPlayer | null;
  onSelectPlayer: (player: ExplorerPlayer) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  collectionId: string;
  onCollectionIdChange: (value: string) => void;
  collections: ShortlistCollection[];
  collectionPlayers: ExplorerPlayer[];
  manualPlayers: ExplorerPlayer[];
  isLoading: boolean;
  disabledPlayerId?: number | null;
}

export default function MatchUpPlayerPicker({
  title,
  mode,
  onModeChange,
  selectedPlayer,
  onSelectPlayer,
  searchQuery,
  onSearchQueryChange,
  collectionId,
  onCollectionIdChange,
  collections,
  collectionPlayers,
  manualPlayers,
  isLoading,
  disabledPlayerId,
}: MatchUpPlayerPickerProps) {
  const visiblePlayers = mode === "shortlist" ? collectionPlayers : manualPlayers;

  return (
    <div className="min-w-0 overflow-hidden border border-zinc-800 bg-[linear-gradient(180deg,rgba(24,24,24,0.96),rgba(10,10,10,0.96))]">
      <div className="border-b border-zinc-800 px-4 py-4 sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Choose a player from a shortlist collection or search the same explorer dataset manually.
        </p>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant={mode === "shortlist" ? "default" : "outline"}
            className={mode === "shortlist" ? "w-full !text-black" : "w-full"}
            onClick={() => onModeChange("shortlist")}
          >
            Quick Compare
          </Button>
          <Button
            type="button"
            variant={mode === "manual" ? "default" : "outline"}
            className={mode === "manual" ? "w-full !text-black" : "w-full"}
            onClick={() => onModeChange("manual")}
          >
            Manual Search
          </Button>
        </div>

        {mode === "shortlist" ? (
          <div className="space-y-3">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Collection
              </p>
              <Select value={collectionId} onValueChange={onCollectionIdChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent>
                  {collections.length ? (
                    collections.map((collection) => (
                      <SelectItem key={collection.id} value={String(collection.id)}>
                        {collection.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-collections" disabled>
                      No collections available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {!collections.length ? (
              <div className="border border-dashed border-zinc-800 bg-black/20 px-4 py-8 text-center">
                <FolderOpenDot className="mx-auto h-5 w-5 text-zinc-500" />
                <p className="mt-3 text-sm text-zinc-500">
                  Create a shortlist collection first to use Quick Compare.
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              Search Players
            </p>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder="Search by player, club, or position..."
                className="pl-10"
              />
            </div>
          </div>
        )}

        <div className="min-w-0 overflow-hidden border border-zinc-800 bg-zinc-950/60">
          <div className="border-b border-zinc-800 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              Available Players
            </p>
          </div>

          <div className="max-h-[360px] overflow-y-auto sm:max-h-[420px]">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse border border-zinc-800 bg-zinc-900/50"
                  />
                ))}
              </div>
            ) : visiblePlayers.length ? (
              visiblePlayers.map((player) => {
                const active = selectedPlayer?.player_id === player.player_id;
                const disabled = disabledPlayerId === player.player_id;

                return (
                  <button
                    key={player.player_id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelectPlayer(player)}
                    className={`flex w-full min-w-0 items-center gap-3 border-b border-zinc-800 px-3 py-3 text-left transition-colors sm:px-4 ${
                      active
                        ? "bg-[color:var(--accent-soft)]"
                        : "hover:bg-zinc-900/70"
                    } ${disabled ? "cursor-not-allowed opacity-40" : ""} last:border-b-0`}
                  >
                    <img
                      src={player.image_path ?? "/placeholder-player.png"}
                      alt={player.display_name}
                      className="h-9 w-9 shrink-0 rounded-full object-cover sm:h-10 sm:w-10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white sm:text-base">
                        {player.display_name}
                      </p>
                      <p className="mt-1 truncate text-[10px] uppercase tracking-[0.18em] text-zinc-500 sm:text-[11px]">
                        {player.positionLabel}
                      </p>
                    </div>
                    <div className="ml-auto min-w-0 max-w-[42%] text-right">
                      <p className="truncate text-xs text-zinc-300 sm:text-sm">{player.clubName}</p>
                      <p className="mt-1 truncate text-[10px] uppercase tracking-[0.18em] text-zinc-500 sm:text-[11px]">
                        {player.league ?? "-"}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-zinc-500">
                  {mode === "shortlist"
                    ? "No players found in this collection."
                    : "No players match your search."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
