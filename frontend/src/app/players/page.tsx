"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPlayersSummary } from "@/lib/supabase/queries";
import { buildPlayerSlug } from "@/lib/player-utils";
import type { PlayerSummary } from "@/types/player";

const ITEMS_PER_PAGE = 25;

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("");
  const [clubFilter, setClubFilter] = useState("All");
  const [positionFilter, setPositionFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadPlayers = async () => {
      setLoading(true);

      const { data, error: queryError } = await getPlayersSummary();

      if (queryError || !data) {
        setError(queryError ?? "Unable to load players.");
        setLoading(false);
        return;
      }

      setPlayers(data);
      setError(null);
      setLoading(false);
    };

    void loadPlayers();
  }, []);

  const leagues = useMemo(
    () =>
      Array.from(
        new Set(
          players
            .map((player) => player.league_name?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [players]
  );

  const defaultLeague = useMemo(() => {
    const liga1League = leagues.find(
      (league) => league.localeCompare("Liga 1", undefined, { sensitivity: "base" }) === 0
    );

    return liga1League ?? leagues[0] ?? "";
  }, [leagues]);

  const effectiveLeagueFilter = useMemo(
    () => (leagues.includes(leagueFilter) ? leagueFilter : defaultLeague),
    [defaultLeague, leagueFilter, leagues]
  );

  useEffect(() => {
    if (!effectiveLeagueFilter || leagueFilter === effectiveLeagueFilter) {
      return;
    }

    setLeagueFilter(effectiveLeagueFilter);
  }, [effectiveLeagueFilter, leagueFilter]);

  const clubs = useMemo(() => {
    const visiblePlayers = effectiveLeagueFilter
      ? players.filter((player) => player.league_name === effectiveLeagueFilter)
      : players;

    return [
      "All",
      ...Array.from(
        new Set(
          visiblePlayers
            .map((player) => player.team_name?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => a.localeCompare(b)),
    ];
  }, [effectiveLeagueFilter, players]);

  const positions = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          players
            .map(
              (player) =>
                player.detailed_position_name?.trim() ?? player.position_name?.trim()
            )
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => a.localeCompare(b)),
    ],
    [players]
  );

  const effectiveClubFilter = useMemo(
    () => (clubs.includes(clubFilter) ? clubFilter : "All"),
    [clubFilter, clubs]
  );

  const filteredPlayers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return players.filter((player) => {
      const position =
        player.detailed_position_name?.trim() ?? player.position_name?.trim() ?? "";
      const matchesSearch =
        keyword === "" ||
        player.display_name.toLowerCase().includes(keyword) ||
        (player.team_name ?? "").toLowerCase().includes(keyword) ||
        (player.league_name ?? "").toLowerCase().includes(keyword) ||
        position.toLowerCase().includes(keyword) ||
        (player.nationality ?? "").toLowerCase().includes(keyword);

      const matchesLeague =
        effectiveLeagueFilter === "" || player.league_name === effectiveLeagueFilter;
      const matchesClub =
        effectiveClubFilter === "All" || player.team_name === effectiveClubFilter;
      const matchesPosition = positionFilter === "All" || position === positionFilter;

      return matchesSearch && matchesLeague && matchesClub && matchesPosition;
    });
  }, [players, search, effectiveLeagueFilter, effectiveClubFilter, positionFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedPlayers = filteredPlayers.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );
  const paginatedPlayersWithMeta = useMemo(
    () =>
      paginatedPlayers.map((player) => ({
        ...player,
        slug: buildPlayerSlug(player.display_name),
        position:
          player.detailed_position_name?.trim() ?? player.position_name?.trim() ?? null,
      })),
    [paginatedPlayers]
  );

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="app-shell-panel flex flex-col gap-4 p-6">
          <div>
            <p className="accent-text text-sm uppercase tracking-[0.3em]">Players</p>

            <h1 className="font-display mt-2 text-[2.8rem] leading-none text-white sm:text-[3.4rem]">
              Players Explorer
            </h1>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="focus-accent-within flex h-11 items-center gap-3 border border-zinc-800 bg-zinc-900/80 px-4 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800">
              <Search className="h-4 w-4 shrink-0 text-zinc-500" />

              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search player, club..."
                className="h-full border-0 bg-transparent p-0 text-zinc-200 shadow-none placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <Select
              value={effectiveLeagueFilter}
              onValueChange={(value) => {
                setLeagueFilter(value);
                setClubFilter("All");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <LabeledSelectValue label="League" placeholder="League" />
              </SelectTrigger>

              <SelectContent>
                {leagues.map((league) => (
                  <SelectItem key={league} value={league}>
                    {league}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={effectiveClubFilter}
              onValueChange={(value) => {
                setClubFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <LabeledSelectValue label="Team" placeholder="All" />
              </SelectTrigger>

              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club} value={club}>
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={positionFilter}
              onValueChange={(value) => {
                setPositionFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <LabeledSelectValue label="Position" placeholder="All" />
              </SelectTrigger>

              <SelectContent>
                {positions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {loading ? <p className="text-zinc-400">Loading players...</p> : null}
        {error ? <p className="text-rose-400">{error}</p> : null}

        {!loading && !error && filteredPlayers.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No players match the selected search and filters.
          </p>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paginatedPlayersWithMeta.map((player) => (
            <Link
              key={player.player_id}
              href={`/players/${player.slug}`}
              className="block"
            >
              <Card className="h-full transition-all duration-200 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
                <CardContent className="flex items-center gap-4 p-4">
                  <img
                    src={player.image_path ?? "/placeholder-player.png"}
                    alt={player.display_name}
                    className="h-14 w-14 rounded-full object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-white">
                      {player.display_name}
                    </h3>

                    <div className="mt-1 flex items-center justify-between gap-4">
                      <span className="truncate text-sm text-zinc-400">
                        {player.team_name ?? "Club unavailable"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
                      {player.position ?? "Position unavailable"}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-600">
                      {player.league_name ?? "League unavailable"}
                    </p>
                  </div>

                  <img
                    src={player.team_image_path ?? "/placeholder-club.png"}
                    alt={player.team_name ?? "Club crest"}
                    className="h-10 w-10 object-contain"
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        <div className="flex items-center justify-between border border-zinc-800 bg-zinc-900/50 px-4 py-3">
          <p className="text-sm text-zinc-400">
            Showing{" "}
            <span className="font-medium text-white">
              {filteredPlayers.length === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>
            {" - "}
            <span className="font-medium text-white">
              {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredPlayers.length)}
            </span>
            {" of "}
            <span className="font-medium text-white">{filteredPlayers.length}</span>
            {" players"}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="hover-accent-border flex h-10 w-10 items-center justify-center border border-zinc-800 bg-zinc-900 transition-all duration-200 hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium">
              {safeCurrentPage}
              <span className="mx-1 text-zinc-500">/</span>
              {totalPages}
            </div>

            <button
              disabled={safeCurrentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="hover-accent-border flex h-10 w-10 items-center justify-center border border-zinc-800 bg-zinc-900 transition-all duration-200 hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabeledSelectValue({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="shrink-0 text-zinc-500">{label}:</span>
      <SelectValue placeholder={placeholder} />
    </div>
  );
}
