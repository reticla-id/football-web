"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FolderPlus, SearchX, Trash2 } from "lucide-react";

import { sortExplorerPlayers } from "@/app/radar/explorer/components/sort-utils";
import type {
  ExplorerPlayer,
  ExplorerSortColumn,
  ExplorerSortState,
} from "@/app/radar/explorer/components/types";
import { normalizeExplorerPlayer } from "@/app/radar/components/explorer-player-utils";
import RadarExplorerPagination from "@/app/radar/explorer/components/RadarExplorerPagination";
import RadarExplorerTable from "@/app/radar/explorer/components/RadarExplorerTable";
import RadarBackButton from "@/app/radar/components/RadarBackButton";
import { loadUserShortlistData } from "@/app/radar/components/shortlist-utils";
import {
  readStoredState,
  writeStoredState,
} from "@/app/radar/components/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createShortlistCollection,
  getCurrentUser,
  getPlayersSummary,
} from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";
import type {
  ShortlistCollection,
  ShortlistPlayer,
} from "@/lib/supabase/types";

import ConfirmActionModal from "./ConfirmActionModal";
import CreateCollectionModal from "./CreateCollectionModal";
import ShortlistHeader from "./ShortlistHeader";

const PAGE_SIZE = 25;
const SHORTLIST_STORAGE_KEY = "radar-shortlist-state-v1";

export default function ShortlistClient() {
  const [userId, setUserId] = useState<string | null>(null);
  const [collections, setCollections] = useState<ShortlistCollection[]>([]);
  const [links, setLinks] = useState<ShortlistPlayer[]>([]);
  const [players, setPlayers] = useState<ExplorerPlayer[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(() =>
    readStoredState(SHORTLIST_STORAGE_KEY, {
      selectedCollectionId: "",
      currentPage: 1,
      sortState: {
        column: null,
        direction: null,
      } satisfies ExplorerSortState,
    }).selectedCollectionId
  );
  const [currentPage, setCurrentPage] = useState(() =>
    readStoredState(SHORTLIST_STORAGE_KEY, {
      selectedCollectionId: "",
      currentPage: 1,
      sortState: {
        column: null,
        direction: null,
      } satisfies ExplorerSortState,
    }).currentPage
  );
  const [sortState, setSortState] = useState<ExplorerSortState>(() =>
    readStoredState(SHORTLIST_STORAGE_KEY, {
      selectedCollectionId: "",
      currentPage: 1,
      sortState: {
        column: null,
        direction: null,
      } satisfies ExplorerSortState,
    }).sortState
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleteCollectionModalOpen, setIsDeleteCollectionModalOpen] = useState(false);
  const [isDeletingCollection, setIsDeletingCollection] = useState(false);
  const [isRemovingPlayer, setIsRemovingPlayer] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [playerToRemove, setPlayerToRemove] = useState<ExplorerPlayer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlayerId, setExpandedPlayerId] = useState<number | null>(null);

  useEffect(() => {
    const loadShortlist = async () => {
      setIsLoading(true);

      const [{ data: user, error: userError }, playersResult] = await Promise.all([
        getCurrentUser(),
        getPlayersSummary(),
      ]);

      if (userError || !user) {
        setError(userError ?? "No active user session.");
        setIsLoading(false);
        return;
      }

      if (playersResult.error) {
        setError(playersResult.error);
        setIsLoading(false);
        return;
      }

      setUserId(user.id);
      setPlayers((playersResult.data ?? []).map(normalizeExplorerPlayer));

      const collectionResult = await loadUserShortlistData(user.id);

      if (collectionResult.error) {
        setError(collectionResult.error);
        setCollections([]);
        setLinks([]);
        setSelectedCollectionId("");
        setIsLoading(false);
        return;
      }

      setCollections(collectionResult.collections);
      setLinks(collectionResult.links);
      setSelectedCollectionId((current) =>
        current && collectionResult.collections.some(
          (collection) => String(collection.id) === current
        )
          ? current
          : collectionResult.collections[0]
            ? String(collectionResult.collections[0].id)
            : ""
      );
      setError(null);
      setIsLoading(false);
    };

    void loadShortlist();
  }, []);

  const selectedCollection = useMemo(
    () =>
      collections.find(
        (collection) => String(collection.id) === selectedCollectionId
      ) ?? null,
    [collections, selectedCollectionId]
  );

  const playerMap = useMemo(
    () => new Map(players.map((player) => [player.player_id, player])),
    [players]
  );

  const selectedPlayers = useMemo(() => {
    if (!selectedCollection) {
      return [];
    }

    return links
      .filter((link) => link.shortlist_id === selectedCollection.id)
      .sort(
        (left, right) =>
          new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
      )
      .map((link) => playerMap.get(link.player_id))
      .filter((player): player is ExplorerPlayer => Boolean(player));
  }, [links, playerMap, selectedCollection]);

  const sortedPlayers = useMemo(
    () => sortExplorerPlayers(selectedPlayers, sortState),
    [selectedPlayers, sortState]
  );

  const totalPages = Math.max(1, Math.ceil(sortedPlayers.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedPlayers = useMemo(
    () =>
      sortedPlayers.slice(
        (safeCurrentPage - 1) * PAGE_SIZE,
        safeCurrentPage * PAGE_SIZE
      ),
    [safeCurrentPage, sortedPlayers]
  );

  useEffect(() => {
    writeStoredState(SHORTLIST_STORAGE_KEY, {
      selectedCollectionId,
      currentPage,
      sortState,
    });
  }, [currentPage, selectedCollectionId, sortState]);

  const handleSortChange = (column: ExplorerSortColumn) => {
    setSortState((current) => {
      if (current.column !== column) {
        return { column, direction: "asc" };
      }

      if (current.direction === "asc") {
        return { column, direction: "desc" };
      }

      if (current.direction === "desc") {
        return { column: null, direction: null };
      }

      return { column, direction: "asc" };
    });
  };

  const handleToggleExpandedPlayer = (playerId: number) => {
    setExpandedPlayerId((current) => (current === playerId ? null : playerId));
  };

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToastMessage(null);
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const emptyState = selectedCollection
    ? {
        icon: SearchX,
        title: "No players in this collection.",
        description:
          "No players saved here yet. Head to Radar Explorer to discover profiles and add them into this collection.",
        ctaLabel: "Open Explorer",
        ctaHref: "/radar/explorer",
      }
    : {
        icon: FolderPlus,
        title: "Create your first collection",
        description:
          "Start by creating a collection, then use Radar Explorer to discover players and save them into your shortlist.",
        ctaLabel: "Open Explorer",
        ctaHref: "/radar/explorer",
      };

  const handleCreateCollection = async () => {
    if (!userId || !collectionName.trim()) {
      return;
    }

    setIsCreating(true);

    const result = await createShortlistCollection({
      user_id: userId,
      name: collectionName.trim(),
      description: collectionDescription.trim() || null,
    });

    if (result.error || !result.data) {
      setError(result.error ?? "Unable to create collection.");
      setIsCreating(false);
      return;
    }

    const refreshed = await loadUserShortlistData(userId);

    if (refreshed.error) {
      setError(refreshed.error);
      setIsCreating(false);
      return;
    }

    setCollections(refreshed.collections);
    setLinks(refreshed.links);
    setSelectedCollectionId(String(result.data.id));
    setCollectionName("");
    setCollectionDescription("");
    setIsModalOpen(false);
    setError(null);
    setToastMessage(`Collection created: ${result.data.name}`);
    setIsCreating(false);
  };

  const handleDeleteCollection = async () => {
    if (!selectedCollectionId || !selectedCollection || !supabase) {
      return;
    }

    setIsDeletingCollection(true);

    const { error: deleteError } = await supabase
      .from("shortlist_collections")
      .delete()
      .eq("id", Number(selectedCollectionId));

    if (deleteError) {
      setError(deleteError.message);
      setIsDeletingCollection(false);
      return;
    }

    const refreshedCollections = collections.filter(
      (collection) => collection.id !== selectedCollection.id
    );
    const refreshedLinks = links.filter(
      (link) => link.shortlist_id !== selectedCollection.id
    );

    setCollections(refreshedCollections);
    setLinks(refreshedLinks);
    setSelectedCollectionId(
      refreshedCollections[0] ? String(refreshedCollections[0].id) : ""
    );
    setIsDeleteCollectionModalOpen(false);
    setToastMessage(`Collection deleted: ${selectedCollection.name}`);
    setIsDeletingCollection(false);
  };

  const handleRemovePlayer = async () => {
    if (!playerToRemove || !selectedCollection || !supabase) {
      return;
    }

    const currentLink = links.find(
      (link) =>
        link.shortlist_id === selectedCollection.id &&
        link.player_id === playerToRemove.player_id
    );

    if (!currentLink) {
      setPlayerToRemove(null);
      return;
    }

    setIsRemovingPlayer(true);

    const { error: removeError } = await supabase
      .from("shortlist_players")
      .delete()
      .eq("id", currentLink.id);

    if (removeError) {
      setError(removeError.message);
      setIsRemovingPlayer(false);
      return;
    }

    setLinks((current) => current.filter((link) => link.id !== currentLink.id));
    setToastMessage(`Removed ${playerToRemove.display_name} from ${selectedCollection.name}`);
    setPlayerToRemove(null);
    setIsRemovingPlayer(false);
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
        <RadarBackButton />
        <ShortlistHeader />

        {error ? (
          <div className="border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => setIsModalOpen(true)}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              + Collection
            </Button>

            {selectedCollection ? (
              <button
                type="button"
                onClick={() => setIsDeleteCollectionModalOpen(true)}
                className="inline-flex h-11 items-center justify-center border border-rose-500/70 bg-rose-600 px-4 py-2 text-sm font-semibold tracking-[0.02em] text-white transition-all duration-200 hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Collection
              </button>
            ) : null}
          </div>

          <div className="w-full sm:max-w-[320px]">
            <Select
              value={selectedCollectionId}
              onValueChange={(value) => {
                setSelectedCollectionId(value);
                setCurrentPage(1);
              }}
              disabled={!collections.length}
            >
              <SelectTrigger>
                <div className="flex min-w-0 items-center gap-1.5 text-xs">
                  <span className="shrink-0 uppercase tracking-[0.16em] text-zinc-500">
                    Collection:
                  </span>
                  <SelectValue placeholder="Select collection" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={String(collection.id)}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCollectionId || "empty"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-4"
          >
            {selectedCollection ? (
              <Card className="border-zinc-800/80 bg-zinc-900/55">
                <CardContent className="space-y-2 px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    Active Collection
                  </p>
                  <h2 className="font-display text-[2rem] leading-none text-white">
                    {selectedCollection.name}
                  </h2>
                  {selectedCollection.description ? (
                    <p className="max-w-3xl text-sm leading-6 text-zinc-400">
                      {selectedCollection.description}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            <RadarExplorerTable
              players={paginatedPlayers}
              isLoading={isLoading}
              sortState={sortState}
              onSortChange={handleSortChange}
              expandedPlayerId={expandedPlayerId}
              onToggleExpandedPlayer={handleToggleExpandedPlayer}
              rowAction={
                selectedCollection
                  ? {
                      label: "",
                      title: "Remove from Collection",
                      tone: "danger",
                      onClick: setPlayerToRemove,
                    }
                  : undefined
              }
              emptyState={emptyState}
            />

            {collections.length ? (
              <RadarExplorerPagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                totalItems={sortedPlayers.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>

        <CreateCollectionModal
          open={isModalOpen}
          name={collectionName}
          description={collectionDescription}
          isSubmitting={isCreating}
          onNameChange={setCollectionName}
          onDescriptionChange={setCollectionDescription}
          onClose={() => {
            if (isCreating) {
              return;
            }

            setIsModalOpen(false);
          }}
          onSubmit={() => void handleCreateCollection()}
        />

        <ConfirmActionModal
          open={isDeleteCollectionModalOpen}
          eyebrow="Delete Collection"
          title={selectedCollection?.name ?? "Delete Collection"}
          description="This will permanently delete the selected collection and remove all players inside it from the shortlist."
          confirmLabel="Delete Collection"
          isSubmitting={isDeletingCollection}
          onClose={() => {
            if (isDeletingCollection) {
              return;
            }

            setIsDeleteCollectionModalOpen(false);
          }}
          onConfirm={() => void handleDeleteCollection()}
        />

        <ConfirmActionModal
          open={Boolean(playerToRemove)}
          eyebrow="Remove Player"
          title={playerToRemove?.display_name ?? "Remove Player"}
          description={`Remove this player from ${selectedCollection?.name ?? "the selected collection"}?`}
          confirmLabel="Remove Player"
          isSubmitting={isRemovingPlayer}
          onClose={() => {
            if (isRemovingPlayer) {
              return;
            }

            setPlayerToRemove(null);
          }}
          onConfirm={() => void handleRemovePlayer()}
        />

        <AnimatePresence>
          {toastMessage ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed bottom-6 right-6 z-50 w-full max-w-sm"
            >
              <Card className="border-zinc-800 bg-zinc-950 shadow-[0_18px_55px_rgba(0,0,0,0.34)]">
                <CardContent className="px-4 py-3 text-sm text-zinc-200">
                  {toastMessage}
                </CardContent>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
