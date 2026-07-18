"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";

import CollectionPickerDialog from "@/app/radar/components/CollectionPickerDialog";
import RadarBackButton from "@/app/radar/components/RadarBackButton";
import { normalizeExplorerPlayer } from "@/app/radar/components/explorer-player-utils";
import {
  readStoredState,
  writeStoredState,
} from "@/app/radar/components/storage";
import {
  hasPlayerInCollection,
  loadUserShortlistData,
} from "@/app/radar/components/shortlist-utils";
import RadarExplorerFilters from "./components/RadarExplorerFilters";
import RadarExplorerHeader from "./components/RadarExplorerHeader";
import RadarExplorerPagination from "./components/RadarExplorerPagination";
import RadarExplorerTable from "./components/RadarExplorerTable";
import { sortExplorerPlayers } from "./components/sort-utils";
import type {
  ExplorerPlayer,
  ExplorerSortColumn,
  ExplorerSortState,
} from "./components/types";
import { addPlayerToShortlist, getCurrentUser, getPlayersSummary } from "@/lib/supabase/queries";
import { Card, CardContent } from "@/components/ui/card";
import type { ShortlistCollection, ShortlistPlayer } from "@/lib/supabase/types";

const PAGE_SIZE = 25;
const EXPLORER_STORAGE_KEY = "radar-explorer-state-v1";

type FiltersState = {
  search: string;
  minAge: number;
  maxAge: number;
  minHeight: number;
  maxHeight: number;
  position: string[];
  nationality: string[];
  country: string[];
  league: string[];
  transferStatus: string[];
  preferredFoot: string[];
  minimumGoals: number;
  minimumAssists: number;
  minimumPassAccuracy: number;
  minimumTacklesPer90: number;
  minimumInterceptionsPer90: number;
  minimumSavesPer90: number;
  traits: string[];
  playstyles: string[];
};

const defaultFilters: FiltersState = {
  search: "",
  minAge: 16,
  maxAge: 40,
  minHeight: 150,
  maxHeight: 220,
  position: [],
  nationality: [],
  country: [],
  league: [],
  transferStatus: [],
  preferredFoot: [],
  minimumGoals: 0,
  minimumAssists: 0,
  minimumPassAccuracy: 0,
  minimumTacklesPer90: 0,
  minimumInterceptionsPer90: 0,
  minimumSavesPer90: 0,
  traits: [],
  playstyles: [],
};

export default function RadarExplorerPage() {
  const storedExplorerState = readStoredState(EXPLORER_STORAGE_KEY, {
    filters: defaultFilters,
    currentPage: 1,
    sortState: {
      column: null,
      direction: null,
    } satisfies ExplorerSortState,
  });
  const [players, setPlayers] = useState<ExplorerPlayer[]>([]);
  const [collections, setCollections] = useState<ShortlistCollection[]>([]);
  const [shortlistLinks, setShortlistLinks] = useState<ShortlistPlayer[]>([]);
  const [filters, setFilters] = useState<FiltersState>(() =>
    ({
      ...defaultFilters,
      ...storedExplorerState.filters,
    })
  );
  const [currentPage, setCurrentPage] = useState(() => storedExplorerState.currentPage);
  const [sortState, setSortState] = useState<ExplorerSortState>(
    () => storedExplorerState.sortState
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isAddingToCollection, setIsAddingToCollection] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<ExplorerPlayer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlayerId, setExpandedPlayerId] = useState<number | null>(null);

  useEffect(() => {
    const loadPlayers = async () => {
      setIsLoading(true);

      const [result, userResult] = await Promise.all([
        getPlayersSummary(),
        getCurrentUser(),
      ]);

      if (result.error) {
        setError(result.error);
        setPlayers([]);
        setIsLoading(false);
        return;
      }

      setPlayers((result.data ?? []).map(normalizeExplorerPlayer));

      if (userResult.data?.id) {
        const shortlistResult = await loadUserShortlistData(userResult.data.id);

        if (shortlistResult.error) {
          setError(shortlistResult.error);
        } else {
          setCollections(shortlistResult.collections);
          setShortlistLinks(shortlistResult.links);
        }
      }

      setError(null);
      setIsLoading(false);
    };

    void loadPlayers();
  }, []);

  const maxAvailableAge = useMemo(() => {
    const ages = players
      .map((player) => player.age)
      .filter((age): age is number => age != null);

    return ages.length ? Math.max(...ages) : 40;
  }, [players]);

  const minAvailableAge = useMemo(() => {
    const ages = players
      .map((player) => player.age)
      .filter((age): age is number => age != null);

    return ages.length ? Math.min(...ages) : 16;
  }, [players]);

  const maxAvailableHeight = useMemo(() => {
    const heights = players
      .map((player) => player.height)
      .filter((height): height is number => height != null);

    return heights.length ? Math.max(...heights) : 220;
  }, [players]);

  const minAvailableHeight = useMemo(() => {
    const heights = players
      .map((player) => player.height)
      .filter((height): height is number => height != null);

    return heights.length ? Math.min(...heights) : 150;
  }, [players]);

  const availableLeagues = useMemo(
    () => getUniqueValues(players.map((player) => player.league)),
    [players]
  );

  const availableCountries = useMemo(
    () => getUniqueValues(players.map((player) => player.country)),
    [players]
  );

  const availableNationalities = useMemo(
    () => getUniqueValues(players.map((player) => player.nationality)),
    [players]
  );

  const availablePositions = useMemo(
    () => getUniqueValues(players.map((player) => player.positionLabel)),
    [players]
  );

  const availableTransferStatuses = useMemo(
    () => getUniqueValues(players.map((player) => player.transferStatus)),
    [players]
  );

  const availablePreferredFeet = useMemo(
    () => getUniqueValues(players.map((player) => player.prefer_foot)),
    [players]
  );

  const availableTraits = useMemo(
    () => getUniqueValues(players.flatMap((player) => player.traits)),
    [players]
  );

  const availablePlaystyles = useMemo(
    () => getUniqueValues(players.flatMap((player) => player.playstyles)),
    [players]
  );

  const leagueOptions = useMemo(() => {
    if (filters.country.length === 0) {
      return availableLeagues;
    }

    return getUniqueValues(
      players
        .filter(
          (player) => player.country && filters.country.includes(player.country)
      )
      .map((player) => player.league)
    );
  }, [availableLeagues, filters.country, players]);

  const filteredPlayers = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    return players.filter((player) => {
      const matchesSearch =
        keyword === "" ||
        player.display_name.toLowerCase().includes(keyword) ||
        player.clubName.toLowerCase().includes(keyword) ||
        player.positionLabel.toLowerCase().includes(keyword) ||
        player.playstyles.some((playstyle) => playstyle.toLowerCase().includes(keyword));

      const matchesAge =
        player.age == null ||
        (player.age >= filters.minAge && player.age <= filters.maxAge);
      const matchesHeight =
        player.height == null ||
        (player.height >= filters.minHeight && player.height <= filters.maxHeight);
      const matchesPosition =
        filters.position.length === 0 || filters.position.includes(player.positionLabel);
      const matchesNationality =
        filters.nationality.length === 0 ||
        (player.nationality != null && filters.nationality.includes(player.nationality));
      const matchesCountry =
        filters.country.length === 0 ||
        (player.country != null && filters.country.includes(player.country));
      const matchesLeague =
        filters.league.length === 0 ||
        (player.league != null && filters.league.includes(player.league));
      const matchesTransferStatus =
        filters.transferStatus.length === 0 ||
        (player.transferStatus != null &&
          filters.transferStatus.includes(player.transferStatus));
      const matchesPreferredFoot =
        filters.preferredFoot.length === 0 ||
        (player.prefer_foot != null && filters.preferredFoot.includes(player.prefer_foot));
      const matchesGoals = player.goals >= filters.minimumGoals;
      const matchesAssists = player.assists >= filters.minimumAssists;
      const matchesPassAccuracy =
        player.passAccuracyValue >= filters.minimumPassAccuracy;
      const matchesTackles = player.tacklesPer90 >= filters.minimumTacklesPer90;
      const matchesInterceptions =
        player.interceptionsPer90 >= filters.minimumInterceptionsPer90;
      const matchesSaves = player.savesPer90 >= filters.minimumSavesPer90;
      const matchesTraits =
        filters.traits.length === 0 ||
        filters.traits.every((trait) => player.traits.includes(trait));
      const matchesPlaystyles =
        filters.playstyles.length === 0 ||
        filters.playstyles.every((playstyle) => player.playstyles.includes(playstyle));

      return (
        matchesSearch &&
        matchesAge &&
        matchesHeight &&
        matchesPosition &&
        matchesNationality &&
        matchesCountry &&
        matchesLeague &&
        matchesTransferStatus &&
        matchesPreferredFoot &&
        matchesGoals &&
        matchesAssists &&
        matchesPassAccuracy &&
        matchesTackles &&
        matchesInterceptions &&
        matchesSaves &&
        matchesTraits &&
        matchesPlaystyles
      );
    });
  }, [filters, players]);

  const sortedPlayers = useMemo(
    () => sortExplorerPlayers(filteredPlayers, sortState),
    [filteredPlayers, sortState]
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

  const emptyState = {
    icon: SearchX as LucideIcon,
    title: "No players found",
    description: "Try adjusting your scouting filters.",
  };

  useEffect(() => {
    writeStoredState(EXPLORER_STORAGE_KEY, {
      filters,
      currentPage,
      sortState,
    });
  }, [currentPage, filters, sortState]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToastMessage(null);
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const handleOpenCollectionPicker = (player: ExplorerPlayer) => {
    setSelectedPlayer(player);
    setIsPickerOpen(true);
  };

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

  const handleFiltersChange = (nextFilters: FiltersState) => {
    const nextLeagueOptions = getLeagueOptionsForCountries(
      players,
      availableLeagues,
      nextFilters.country
    );

    setFilters({
      ...nextFilters,
      league: nextFilters.league.filter((value) => nextLeagueOptions.includes(value)),
    });
    setCurrentPage(1);
  };

  const handleAddPlayerToCollection = async (collection: ShortlistCollection) => {
    if (!selectedPlayer) {
      return;
    }

    if (hasPlayerInCollection(shortlistLinks, collection.id, selectedPlayer.player_id)) {
      setToastMessage(`Player already exists in ${collection.name}`);
      setIsPickerOpen(false);
      return;
    }

    setIsAddingToCollection(true);
    const result = await addPlayerToShortlist(collection.id, selectedPlayer.player_id);

    if (result.error) {
      setError(result.error);
      setIsAddingToCollection(false);
      return;
    }

    const optimisticLink: ShortlistPlayer = {
      id: Date.now(),
      shortlist_id: collection.id,
      player_id: selectedPlayer.player_id,
      created_at: new Date().toISOString(),
    };

    setShortlistLinks((current) => [optimisticLink, ...current]);
    setToastMessage(`Player added to ${collection.name}`);
    setIsPickerOpen(false);
    setIsAddingToCollection(false);
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
        <RadarBackButton />
        <RadarExplorerHeader />

        {error ? (
          <div className="border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[292px_minmax(0,1fr)] xl:items-start 2xl:grid-cols-[304px_minmax(0,1fr)]">
          <RadarExplorerFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            minAvailableAge={minAvailableAge}
            maxAvailableAge={maxAvailableAge}
            minAvailableHeight={minAvailableHeight}
            maxAvailableHeight={maxAvailableHeight}
            positionOptions={availablePositions}
            nationalityOptions={availableNationalities}
            countryOptions={availableCountries}
            leagueOptions={leagueOptions}
            transferStatusOptions={availableTransferStatuses}
            preferredFootOptions={availablePreferredFeet}
            traitOptions={availableTraits}
            playstyleOptions={availablePlaystyles}
          />

          <div className="space-y-4">
            <RadarExplorerTable
              players={paginatedPlayers}
              isLoading={isLoading}
              sortState={sortState}
              onSortChange={handleSortChange}
              expandedPlayerId={expandedPlayerId}
              onToggleExpandedPlayer={handleToggleExpandedPlayer}
              rowAction={{
                label: "",
                title: "Add to Shortlist",
                tone: "accent",
                onClick: handleOpenCollectionPicker,
              }}
              emptyState={emptyState}
            />

            <RadarExplorerPagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={sortedPlayers.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        <CollectionPickerDialog
          open={isPickerOpen}
          collections={collections}
          selectedPlayerName={selectedPlayer?.display_name}
          isSubmitting={isAddingToCollection}
          onClose={() => {
            if (isAddingToCollection) {
              return;
            }

            setIsPickerOpen(false);
          }}
          onSelectCollection={(collection) => {
            void handleAddPlayerToCollection(collection);
          }}
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

function getUniqueValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value?.trim())))
  ).sort((left, right) => left.localeCompare(right));
}

function getLeagueOptionsForCountries(
  players: ExplorerPlayer[],
  availableLeagues: string[],
  selectedCountries: string[]
) {
  if (selectedCountries.length === 0) {
    return availableLeagues;
  }

  return getUniqueValues(
    players
      .filter(
        (player) => player.country && selectedCountries.includes(player.country)
      )
      .map((player) => player.league)
  );
}
