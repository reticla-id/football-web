"use client";

import { useEffect, useMemo, useState } from "react";
import { Swords } from "lucide-react";
import { motion } from "framer-motion";

import type { ExplorerPlayer } from "@/app/radar/explorer/components/types";
import { normalizeExplorerPlayer } from "@/app/radar/components/explorer-player-utils";
import { loadUserShortlistData } from "@/app/radar/components/shortlist-utils";
import { readStoredState, writeStoredState } from "@/app/radar/components/storage";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser, getPlayersSummary } from "@/lib/supabase/queries";
import type { ShortlistCollection, ShortlistPlayer } from "@/lib/supabase/types";

import MatchUpComparisonTable from "./MatchUpComparisonTable";
import MatchUpHeader from "./MatchUpHeader";
import MatchUpPlayerPicker from "./MatchUpPlayerPicker";
import MatchUpSelectedPlayerCard from "./MatchUpSelectedPlayerCard";

const MATCH_UP_STORAGE_KEY = "match-up-state-v1";

type SelectionMode = "shortlist" | "manual";

type PlayerSlotState = {
  mode: SelectionMode;
  searchQuery: string;
  collectionId: string;
  playerId: number | null;
};

type StoredMatchUpState = {
  left: PlayerSlotState;
  right: PlayerSlotState;
};

function createDefaultSlotState(): PlayerSlotState {
  return {
    mode: "manual",
    searchQuery: "",
    collectionId: "",
    playerId: null,
  };
}

function createDefaultStoredState(): StoredMatchUpState {
  return {
    left: createDefaultSlotState(),
    right: createDefaultSlotState(),
  };
}

export default function MatchUpClient() {
  const storedState = readStoredState<StoredMatchUpState>(
    MATCH_UP_STORAGE_KEY,
    createDefaultStoredState()
  );

  const [players, setPlayers] = useState<ExplorerPlayer[]>([]);
  const [collections, setCollections] = useState<ShortlistCollection[]>([]);
  const [links, setLinks] = useState<ShortlistPlayer[]>([]);
  const [leftSlot, setLeftSlot] = useState<PlayerSlotState>(() => ({
    ...createDefaultSlotState(),
    ...storedState.left,
  }));
  const [rightSlot, setRightSlot] = useState<PlayerSlotState>(() => ({
    ...createDefaultSlotState(),
    ...storedState.right,
  }));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatchUpData = async () => {
      setIsLoading(true);

      const [playersResult, userResult] = await Promise.all([
        getPlayersSummary(),
        getCurrentUser(),
      ]);

      if (playersResult.error) {
        setError(playersResult.error);
        setPlayers([]);
        setIsLoading(false);
        return;
      }

      const normalizedPlayers = (playersResult.data ?? []).map(normalizeExplorerPlayer);
      setPlayers(normalizedPlayers);

      if (userResult.data?.id) {
        const shortlistResult = await loadUserShortlistData(userResult.data.id);

        if (shortlistResult.error) {
          setError(shortlistResult.error);
        } else {
          setCollections(shortlistResult.collections);
          setLinks(shortlistResult.links);

          setLeftSlot((current) => ({
            ...current,
            collectionId:
              current.collectionId ||
              (shortlistResult.collections[0] ? String(shortlistResult.collections[0].id) : ""),
          }));
          setRightSlot((current) => ({
            ...current,
            collectionId:
              current.collectionId ||
              (shortlistResult.collections[0] ? String(shortlistResult.collections[0].id) : ""),
          }));
        }
      }

      setError(null);
      setIsLoading(false);
    };

    void loadMatchUpData();
  }, []);

  useEffect(() => {
    writeStoredState(MATCH_UP_STORAGE_KEY, {
      left: leftSlot,
      right: rightSlot,
    });
  }, [leftSlot, rightSlot]);

  const playerMap = useMemo(
    () => new Map(players.map((player) => [player.player_id, player])),
    [players]
  );

  const leftPlayer = leftSlot.playerId ? playerMap.get(leftSlot.playerId) ?? null : null;
  const rightPlayer = rightSlot.playerId ? playerMap.get(rightSlot.playerId) ?? null : null;

  const leftCollectionPlayers = useMemo(
    () => getCollectionPlayers(leftSlot.collectionId, collections, links, playerMap),
    [collections, leftSlot.collectionId, links, playerMap]
  );
  const rightCollectionPlayers = useMemo(
    () => getCollectionPlayers(rightSlot.collectionId, collections, links, playerMap),
    [collections, rightSlot.collectionId, links, playerMap]
  );

  const leftManualPlayers = useMemo(
    () => filterPlayersForSearch(players, leftSlot.searchQuery),
    [leftSlot.searchQuery, players]
  );
  const rightManualPlayers = useMemo(
    () => filterPlayersForSearch(players, rightSlot.searchQuery),
    [players, rightSlot.searchQuery]
  );

  const updateSlot = (
    side: "left" | "right",
    updater: (current: PlayerSlotState) => PlayerSlotState
  ) => {
    if (side === "left") {
      setLeftSlot(updater);
      return;
    }

    setRightSlot(updater);
  };

  const handleClearComparison = () => {
    setLeftSlot(createDefaultSlotState());
    setRightSlot(createDefaultSlotState());
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-[1600px] min-w-0 flex-col gap-5 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="min-w-0 space-y-5 sm:space-y-6"
        >
          <MatchUpHeader />

          {error ? (
            <div className="border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          ) : null}

          <div className="grid min-w-0 gap-5 sm:gap-6 xl:grid-cols-2">
            <MatchUpPlayerPicker
              title="Player A"
              mode={leftSlot.mode}
              onModeChange={(mode) =>
                updateSlot("left", (current) => ({ ...current, mode }))
              }
              selectedPlayer={leftPlayer}
              onSelectPlayer={(player) =>
                updateSlot("left", (current) => ({
                  ...current,
                  playerId: player.player_id,
                }))
              }
              searchQuery={leftSlot.searchQuery}
              onSearchQueryChange={(searchQuery) =>
                updateSlot("left", (current) => ({ ...current, searchQuery }))
              }
              collectionId={leftSlot.collectionId}
              onCollectionIdChange={(collectionId) =>
                updateSlot("left", (current) => ({ ...current, collectionId }))
              }
              collections={collections}
              collectionPlayers={leftCollectionPlayers}
              manualPlayers={leftManualPlayers}
              isLoading={isLoading}
              disabledPlayerId={rightPlayer?.player_id ?? null}
            />

            <MatchUpPlayerPicker
              title="Player B"
              mode={rightSlot.mode}
              onModeChange={(mode) =>
                updateSlot("right", (current) => ({ ...current, mode }))
              }
              selectedPlayer={rightPlayer}
              onSelectPlayer={(player) =>
                updateSlot("right", (current) => ({
                  ...current,
                  playerId: player.player_id,
                }))
              }
              searchQuery={rightSlot.searchQuery}
              onSearchQueryChange={(searchQuery) =>
                updateSlot("right", (current) => ({ ...current, searchQuery }))
              }
              collectionId={rightSlot.collectionId}
              onCollectionIdChange={(collectionId) =>
                updateSlot("right", (current) => ({ ...current, collectionId }))
              }
              collections={collections}
              collectionPlayers={rightCollectionPlayers}
              manualPlayers={rightManualPlayers}
              isLoading={isLoading}
              disabledPlayerId={leftPlayer?.player_id ?? null}
            />
          </div>

          <div className="grid min-w-0 gap-5 sm:gap-6 xl:grid-cols-2">
            <MatchUpSelectedPlayerCard
              title="Selected Player A"
              player={leftPlayer}
            />
            <MatchUpSelectedPlayerCard
              title="Selected Player B"
              player={rightPlayer}
            />
          </div>

          <Card className="border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,24,0.96),rgba(10,10,10,0.96))]">
            <CardContent className="flex min-w-0 flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-start gap-3 sm:items-center">
                <div className="accent-bg-soft accent-border-soft accent-text flex h-11 w-11 shrink-0 items-center justify-center border sm:h-12 sm:w-12">
                  <Swords className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    Comparison Status
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white">
                    {leftPlayer && rightPlayer
                      ? "Both players selected. Comparison view is ready."
                      : "Select another player to begin comparison."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearComparison}
                className="accent-bg accent-border inline-flex h-10 w-full shrink-0 items-center justify-center border px-4 text-sm font-semibold text-black transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
                disabled={!leftPlayer && !rightPlayer}
              >
                Clear Comparison
              </button>
            </CardContent>
          </Card>

          <MatchUpComparisonTable leftPlayer={leftPlayer} rightPlayer={rightPlayer} />
        </motion.div>
      </div>
    </div>
  );
}

function getCollectionPlayers(
  collectionId: string,
  collections: ShortlistCollection[],
  links: ShortlistPlayer[],
  playerMap: Map<number, ExplorerPlayer>
) {
  const selectedCollection = collections.find(
    (collection) => String(collection.id) === collectionId
  );

  if (!selectedCollection) {
    return [];
  }

  return links
    .filter((link) => link.shortlist_id === selectedCollection.id)
    .map((link) => playerMap.get(link.player_id))
    .filter((player): player is ExplorerPlayer => Boolean(player));
}

function filterPlayersForSearch(players: ExplorerPlayer[], query: string) {
  const keyword = query.trim().toLowerCase();

  if (!keyword) {
    return players.slice(0, 12);
  }

  return players
    .filter((player) => {
      return (
        player.display_name.toLowerCase().includes(keyword) ||
        player.clubName.toLowerCase().includes(keyword) ||
        player.positionLabel.toLowerCase().includes(keyword) ||
        (player.league ?? "").toLowerCase().includes(keyword) ||
        (player.nationality ?? "").toLowerCase().includes(keyword)
      );
    })
    .slice(0, 18);
}
