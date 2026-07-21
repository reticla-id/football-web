"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

import { FullStandingsTable } from "@/components/dashboard/StandingsTable";
import LeagueTabs, { type LeagueTab } from "@/components/league/LeagueTabs";
import FixtureCardFinished from "@/components/teams/FixtureCardFinished";
import FixtureCardUpcoming from "@/components/teams/FixtureCardUpcoming";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { readStoredState, writeStoredState } from "@/app/radar/components/storage";
import { buildPlayerSlug } from "@/lib/player-utils";
import { getClubSeasonSummary, getDashboardData, getFixtures } from "@/lib/supabase/queries";
import type { ClubSeasonSummary, DashboardStats, Fixture } from "@/lib/supabase/types";
import type { TeamFixture } from "@/types/fixture";

type LeagueLeaderboardRow = {
  rank: number;
  name: string;
  team: string;
  image_path?: string;
  team_image_path?: string;
  value: number;
  label: string;
  positionSubtitle: string;
};

type ClubStatsSortKey =
  | "team_name"
  | "played"
  | "possession_avg"
  | "pass_accuracy"
  | "passes"
  | "shots"
  | "shots_on_target"
  | "corners"
  | "fouls"
  | "offsides"
  | "saves"
  | "yellow_cards"
  | "red_cards";

type ClubStatsSortState = {
  key: ClubStatsSortKey | null;
  direction: "asc" | "desc" | null;
};

type LeaderboardCategory = "top-scorers" | "top-assists" | "most-red-cards";

const FIXTURE_PAGE_SIZE = 10;
const LEAGUE_FILTER_STORAGE_KEY = "league-page-filters";
const leaderboardOptions: Array<{
  key: LeaderboardCategory;
  label: string;
  title: string;
  description: string;
  emptyMessage: string;
}> = [
  {
    key: "top-scorers",
    label: "Top Scorers",
    title: "Top Scorers",
    description: "Goalscorers filtered by selected league clubs",
    emptyMessage: "No top scorer data is available for this league selection.",
  },
  {
    key: "top-assists",
    label: "Top Assists",
    title: "Top Assists",
    description: "Assist leaders filtered by selected league clubs",
    emptyMessage: "No assist data is available for this league selection.",
  },
  {
    key: "most-red-cards",
    label: "Most Red Cards",
    title: "Most Red Cards",
    description: "Disciplinary leaders filtered by selected league clubs",
    emptyMessage: "No red card data is available for this league selection.",
  },
];

export default function LeaguesPage() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState(
    () =>
      readStoredState<{ league: string; season: string }>(LEAGUE_FILTER_STORAGE_KEY, {
        league: "",
        season: "",
      }).league
  );
  const [selectedSeason, setSelectedSeason] = useState(
    () =>
      readStoredState<{ league: string; season: string }>(LEAGUE_FILTER_STORAGE_KEY, {
        league: "",
        season: "",
      }).season
  );
  const [activeTab, setActiveTab] = useState<LeagueTab>("standings");
  const [activeLeaderboard, setActiveLeaderboard] =
    useState<LeaderboardCategory>("top-scorers");
  const [visibleFixtureCount, setVisibleFixtureCount] = useState(FIXTURE_PAGE_SIZE);
  const [isLoadingMoreFixtures, setIsLoadingMoreFixtures] = useState(false);
  const [currentTimestamp] = useState(() => Date.now());
  const [clubSeasonStats, setClubSeasonStats] = useState<ClubSeasonSummary[]>([]);
  const [isLoadingClubStats, setIsLoadingClubStats] = useState(false);

  const fixtureLoaderRef = useRef<HTMLDivElement>(null);
  const fixtureLoadingRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      const [dashboardResult, fixturesResult] = await Promise.all([
        getDashboardData(),
        getFixtures(),
      ]);

      if (dashboardResult.error || !dashboardResult.data) {
        setError(dashboardResult.error ?? "Unable to load league data.");
        setIsLoading(false);
        return;
      }

      setDashboardData(dashboardResult.data);
      setFixtures(fixturesResult.data ?? []);
      setError(fixturesResult.error ?? null);
      setIsLoading(false);
    };

    void loadData();
  }, []);

  const dashboardLeagueEntries = useMemo(
    () => [
      ...(dashboardData?.standings ?? []),
      ...(dashboardData?.topScorers ?? []),
      ...(dashboardData?.topAssists ?? []),
      ...(dashboardData?.topRedcards ?? []),
    ],
    [dashboardData]
  );

  const seasonsByLeague = useMemo(() => {
    const leagueMap = new Map<string, string[]>();

    for (const row of dashboardLeagueEntries) {
      if (!row.league || !row.season) {
        continue;
      }

      const currentSeasons = leagueMap.get(row.league) ?? [];
      if (!currentSeasons.includes(row.season)) {
        currentSeasons.push(row.season);
      }
      leagueMap.set(row.league, currentSeasons);
    }

    for (const [league, seasons] of leagueMap) {
      leagueMap.set(league, seasons.sort(compareValuesDesc));
    }

    return leagueMap;
  }, [dashboardLeagueEntries]);

  const leagueOptions = useMemo(() => {
    const leagues = Array.from(seasonsByLeague.keys());

    return leagues.sort((leftLeague, rightLeague) => {
      const leftLatestSeason = seasonsByLeague.get(leftLeague)?.[0] ?? "";
      const rightLatestSeason = seasonsByLeague.get(rightLeague)?.[0] ?? "";
      const seasonComparison = compareValuesDesc(leftLatestSeason, rightLatestSeason);

      if (seasonComparison !== 0) {
        return seasonComparison;
      }

      return compareValuesAsc(leftLeague, rightLeague);
    });
  }, [seasonsByLeague]);

  const defaultLeague = leagueOptions[0] ?? "";
  const effectiveLeague = useMemo(
    () => (leagueOptions.includes(selectedLeague) ? selectedLeague : defaultLeague),
    [defaultLeague, leagueOptions, selectedLeague]
  );

  const seasonOptions = useMemo(
    () => seasonsByLeague.get(effectiveLeague) ?? [],
    [effectiveLeague, seasonsByLeague]
  );

  const effectiveSeason = useMemo(
    () =>
      seasonOptions.includes(selectedSeason)
        ? selectedSeason
        : (seasonOptions[0] ?? ""),
    [seasonOptions, selectedSeason]
  );

  useEffect(() => {
    if (!effectiveLeague || !effectiveSeason) {
      return;
    }

    writeStoredState(LEAGUE_FILTER_STORAGE_KEY, {
      league: effectiveLeague,
      season: effectiveSeason,
    });
  }, [effectiveLeague, effectiveSeason]);

  const filteredStandings = useMemo(
    () =>
      (dashboardData?.standings ?? []).filter(
        (row) => row.league === effectiveLeague && row.season === effectiveSeason
      ),
    [dashboardData, effectiveLeague, effectiveSeason]
  );

  const selectedLeagueId = filteredStandings[0]?.leagueId ?? null;
  const selectedSeasonId = filteredStandings[0]?.seasonId ?? null;

  const filteredTopScorers = useMemo(
    () =>
      buildLeagueLeaderboardRows(
        (dashboardData?.topScorers ?? [])
          .filter(
            (row) => row.league === effectiveLeague && row.season === effectiveSeason
          )
          .slice(0, 30)
          .map((row) => ({
            name: row.player,
            team: row.team,
            image_path: row.image_path,
            team_image_path: row.team_image_path,
            value: row.goals,
            label: "Goals",
            positionSubtitle: row.position ?? "-",
          }))
      ),
    [dashboardData, effectiveLeague, effectiveSeason]
  );

  const filteredTopAssists = useMemo(
    () =>
      buildLeagueLeaderboardRows(
        (dashboardData?.topAssists ?? [])
          .filter(
            (row) => row.league === effectiveLeague && row.season === effectiveSeason
          )
          .slice(0, 30)
          .map((row) => ({
            name: row.player,
            team: row.team,
            image_path: row.image_path,
            team_image_path: row.team_image_path,
            value: row.assists,
            label: "Assists",
            positionSubtitle: row.position ?? "-",
          }))
      ),
    [dashboardData, effectiveLeague, effectiveSeason]
  );

  const filteredTopRedCards = useMemo(
    () =>
      buildLeagueLeaderboardRows(
        (dashboardData?.topRedcards ?? [])
          .filter(
            (row) => row.league === effectiveLeague && row.season === effectiveSeason
          )
          .slice(0, 30)
          .map((row) => ({
            name: row.player,
            team: row.team,
            image_path: row.image_path,
            team_image_path: row.team_image_path,
            value: row.redcards,
            label: "Red Cards",
            positionSubtitle: row.position ?? "-",
          }))
      ),
    [dashboardData, effectiveLeague, effectiveSeason]
  );

  const filteredFixtures = useMemo(
    () => fixtures.filter((fixture) => fixture.league.name === effectiveLeague),
    [effectiveLeague, fixtures]
  );

  const activeLeaderboardConfig = useMemo(
    () =>
      leaderboardOptions.find((option) => option.key === activeLeaderboard) ??
      leaderboardOptions[0],
    [activeLeaderboard]
  );

  const activeLeaderboardRows = useMemo(() => {
    switch (activeLeaderboard) {
      case "top-assists":
        return filteredTopAssists;
      case "most-red-cards":
        return filteredTopRedCards;
      case "top-scorers":
      default:
        return filteredTopScorers;
    }
  }, [activeLeaderboard, filteredTopAssists, filteredTopRedCards, filteredTopScorers]);

  useEffect(() => {
    if (!selectedLeagueId || !selectedSeasonId) {
      return;
    }

    const loadClubSeasonStats = async () => {
      setIsLoadingClubStats(true);
      const result = await getClubSeasonSummary(selectedSeasonId, selectedLeagueId);

      if (result.error || !result.data) {
        setClubSeasonStats([]);
        setIsLoadingClubStats(false);
        return;
      }

      setClubSeasonStats(result.data);
      setIsLoadingClubStats(false);
    };

    void loadClubSeasonStats();
  }, [selectedLeagueId, selectedSeasonId]);

  const visibleClubSeasonStats = selectedLeagueId && selectedSeasonId ? clubSeasonStats : [];

  const normalizedFixtures = useMemo<TeamFixture[]>(
    () =>
      filteredFixtures.map((fixture) => ({
        id: fixture.id,
        state_id: fixture.state_id,
        league_id: fixture.league.id,
        season_id: null,
        state: fixture.state_id,
        result_info: null,
        starting_at: fixture.starting_at,
        venue_name: "-",
        round_id: null,
        round_name: fixture.round_name,
        stage_id: null,
        leg: null,
        league: {
          id: fixture.league.id,
          name: fixture.league.name,
          image_path: fixture.league.image_path,
        },
        home: fixture.home,
        away: fixture.away,
      })),
    [filteredFixtures]
  );

  const visibleFixtures = useMemo(
    () => normalizedFixtures.slice(0, visibleFixtureCount),
    [normalizedFixtures, visibleFixtureCount]
  );

  const hasMoreFixtures = visibleFixtureCount < normalizedFixtures.length;

  useEffect(() => {
    if (activeTab !== "fixtures" || !hasMoreFixtures) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || fixtureLoadingRef.current) {
          return;
        }

        fixtureLoadingRef.current = true;
        setIsLoadingMoreFixtures(true);

        window.setTimeout(() => {
          setVisibleFixtureCount((current) =>
            Math.min(current + FIXTURE_PAGE_SIZE, normalizedFixtures.length)
          );
          fixtureLoadingRef.current = false;
          setIsLoadingMoreFixtures(false);
        }, 180);
      },
      { rootMargin: "320px 0px", threshold: 0.01 }
    );

    const loader = fixtureLoaderRef.current;
    if (loader) {
      observer.observe(loader);
    }

    return () => observer.disconnect();
  }, [activeTab, hasMoreFixtures, normalizedFixtures.length]);

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <header className="app-shell-panel flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="accent-text text-sm uppercase tracking-[0.3em]">
                League
              </p>

              <h1 className="font-display mt-2 text-[2.8rem] leading-none text-white sm:text-[3.4rem]">
                League Overview
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                Compare standings, disciplinary leaders, attacking leaders and
                recent fixtures inside one league-focused workspace.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 md:flex-row lg:w-auto">
              <div className="w-full md:w-[240px]">
                <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  League
                </p>
                <Select
                  value={effectiveLeague}
                  onValueChange={(value) => {
                    setSelectedLeague(value);
                    setSelectedSeason(seasonsByLeague.get(value)?.[0] ?? "");
                    setVisibleFixtureCount(FIXTURE_PAGE_SIZE);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="League" />
                  </SelectTrigger>

                  <SelectContent>
                    {leagueOptions.map((league) => (
                      <SelectItem key={league} value={league}>
                        {league}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-[220px]">
                <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  Season
                </p>
                <Select
                  value={effectiveSeason}
                  onValueChange={(value) => {
                    setSelectedSeason(value);
                    setVisibleFixtureCount(FIXTURE_PAGE_SIZE);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Season" />
                  </SelectTrigger>

                  <SelectContent>
                    {seasonOptions.map((season) => (
                      <SelectItem key={season} value={season}>
                        {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </header>

        <LeagueTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {error ? (
          <div className="border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        {isLoading ? <LeagueLoadingState /> : null}

        {!isLoading ? (
          <section aria-live="polite">
            {activeTab === "standings" ? (
              <LeaguePanel tab="standings">
                <Card className="border-zinc-800/80 bg-zinc-900/70">
                  <CardHeader className="border-b border-zinc-800 px-5 py-4">
                    <CardTitle>Standings</CardTitle>
                    <p className="text-sm text-zinc-400">
                      Full-table view filtered by the selected competition.
                    </p>
                  </CardHeader>

                  <CardContent className="px-0 pb-0 pt-0">
                    {filteredStandings.length ? (
                      <FullStandingsTable standings={filteredStandings} />
                    ) : (
                      <EmptyStateCopy message="No standings available for this league selection." />
                    )}
                  </CardContent>
                </Card>
              </LeaguePanel>
            ) : null}

            {activeTab === "leaderboards" ? (
              <LeaguePanel tab="leaderboards">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {leaderboardOptions.map((option) => {
                      const active = option.key === activeLeaderboard;

                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setActiveLeaderboard(option.key)}
                          className={`border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] transition-colors ${
                            active
                              ? "accent-border-soft accent-bg-soft accent-text"
                              : "border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:border-zinc-700 hover:text-white"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  <LeagueLeaderboardTable
                    title={activeLeaderboardConfig.title}
                    description={activeLeaderboardConfig.description}
                    rows={activeLeaderboardRows}
                    emptyMessage={activeLeaderboardConfig.emptyMessage}
                  />
                </div>
              </LeaguePanel>
            ) : null}

            {activeTab === "team-statistics" ? (
              <LeaguePanel tab="team-statistics">
                <Card className="border-zinc-800/80 bg-zinc-900/70">
                  <CardHeader className="border-b border-zinc-800 px-5 py-4">
                    <CardTitle>Team Statistics</CardTitle>
                  </CardHeader>

                  <CardContent className="px-0 pb-0 pt-0">
                    {isLoadingClubStats ? (
                      <LeagueLoadingState />
                    ) : visibleClubSeasonStats.length ? (
                      <LeagueClubStatisticsTable rows={visibleClubSeasonStats} />
                    ) : (
                      <EmptyStateCopy message="No team statistics are available for this league selection." />
                    )}
                  </CardContent>
                </Card>
              </LeaguePanel>
            ) : null}

            {activeTab === "analytics" ? (
              <LeaguePanel tab="analytics">
                <Card className="border-zinc-800/80 bg-zinc-900/70">
                  <CardHeader className="border-b border-zinc-800 px-5 py-4">
                    <CardTitle>Analytics</CardTitle>
                    <p className="text-sm text-zinc-400">
                      Deeper league-wide analytics modules will live here.
                    </p>
                  </CardHeader>

                  <CardContent className="px-5 py-5">
                    <EmptyStateCopy message="Coming Soon. Advanced league analytics, deeper comparisons, and richer trend views will be available here." />
                  </CardContent>
                </Card>
              </LeaguePanel>
            ) : null}

            {activeTab === "fixtures" ? (
              <LeaguePanel tab="fixtures">
                <Card className="border-zinc-800/80 bg-zinc-900/70">
                  <CardHeader className="border-b border-zinc-800 px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <CardTitle>Fixtures</CardTitle>
                        <p className="mt-1 text-sm text-zinc-400">
                          Recent fixtures filtered by selected league.
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {normalizedFixtures.length} matches
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 px-5 py-5">
                    {visibleFixtures.length ? (
                      visibleFixtures.map((fixture) => (
                        <Link
                          key={fixture.id}
                          href={`/fixtures/${slugify(fixture.league.name, "league")}/${buildTeamFixtureSlug(fixture)}`}
                          className="block"
                        >
                          <motion.div
                            whileHover={{ y: -3 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                          >
                            {new Date(fixture.starting_at).getTime() > currentTimestamp ? (
                              <FixtureCardUpcoming fixture={fixture} />
                            ) : (
                              <FixtureCardFinished fixture={fixture} />
                            )}
                          </motion.div>
                        </Link>
                      ))
                    ) : (
                      <EmptyStateCopy message="No fixtures are available for this league selection." />
                    )}

                    {isLoadingMoreFixtures ? <LeagueFixturesSkeleton /> : null}
                    {hasMoreFixtures ? <div ref={fixtureLoaderRef} className="h-10" /> : null}
                  </CardContent>
                </Card>
              </LeaguePanel>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}

function LeaguePanel({
  tab,
  children,
}: {
  tab: LeagueTab;
  children: React.ReactNode;
}) {
  return (
    <div
      id={`league-panel-${tab}`}
      role="tabpanel"
      aria-labelledby={`league-tab-${tab}`}
    >
      {children}
    </div>
  );
}

function LeagueLeaderboardTable({
  title,
  description,
  rows,
  emptyMessage,
}: {
  title: string;
  description: string;
  rows: LeagueLeaderboardRow[];
  emptyMessage: string;
}) {
  return (
    <Card className="border-zinc-800/80 bg-zinc-900/70">
      <CardHeader className="border-b border-zinc-800 px-5 py-4">
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-zinc-400">{description}</p>
      </CardHeader>

      <CardContent className="px-0 pb-0 pt-0">
        {!rows.length ? (
          <EmptyStateCopy message={emptyMessage} />
        ) : (
          <div className="overflow-x-auto overscroll-x-contain">
            <div className="min-w-[720px]">
              {rows.map((row) => (
                <Link
                  key={`${row.rank}-${row.name}`}
                  href={`/players/${buildPlayerSlug(row.name)}`}
                  className="grid grid-cols-[56px_minmax(240px,1.7fr)_56px_minmax(180px,1fr)_120px] items-center gap-3 border-b border-zinc-800 px-5 py-3 transition-colors hover:bg-zinc-900/75 last:border-none"
                >
                  <div className="text-center text-sm font-semibold text-zinc-500">
                    {row.rank}
                  </div>

                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={row.image_path || "/placeholder-player.png"}
                      alt={row.name}
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{row.name}</p>
                      <p className="truncate text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        {row.positionSubtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <img
                      src={row.team_image_path || "/placeholder-club.png"}
                      alt={row.team}
                      className="h-8 w-8 object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-300">{row.team}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-display text-[1.5rem] leading-none text-white">
                      {row.value}
                    </span>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      {row.label}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LeagueClubStatisticsTable({ rows }: { rows: ClubSeasonSummary[] }) {
  const [sortState, setSortState] = useState<ClubStatsSortState>({
    key: null,
    direction: null,
  });

  const columns: Array<{
    key: ClubStatsSortKey;
    label: string;
    description: string;
  }> = [
    { key: "team_name", label: "Club", description: "Team name and crest." },
    { key: "played", label: "P", description: "Matches played." },
    { key: "possession_avg", label: "Poss%", description: "Average ball possession percentage." },
    { key: "pass_accuracy", label: "Pass%", description: "Successful pass percentage." },
    { key: "passes", label: "Passes", description: "Total passes, with per-game average in brackets." },
    { key: "shots", label: "Shots", description: "Total shots, with per-game average in brackets." },
    { key: "shots_on_target", label: "SoT", description: "Shots on target, with per-game average in brackets." },
    { key: "corners", label: "Corners", description: "Corners won, with per-game average in brackets." },
    { key: "fouls", label: "Fouls", description: "Fouls committed, with per-game average in brackets." },
    { key: "offsides", label: "Offsides", description: "Offside calls, with per-game average in brackets." },
    { key: "saves", label: "Saves", description: "Goalkeeper saves, with per-game average in brackets." },
    { key: "yellow_cards", label: "YC", description: "Yellow cards, with per-game average in brackets." },
    { key: "red_cards", label: "RC", description: "Red cards, with per-game average in brackets." },
  ];

  const sortedRows = useMemo(() => {
    if (!sortState.key || !sortState.direction) {
      return rows;
    }

    const sortKey = sortState.key;
    const directionFactor = sortState.direction === "asc" ? 1 : -1;

    return [...rows].sort((left, right) => {
      const leftValue = getClubStatSortValue(left, sortKey);
      const rightValue = getClubStatSortValue(right, sortKey);

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return (leftValue - rightValue) * directionFactor;
      }

      return String(leftValue).localeCompare(String(rightValue)) * directionFactor;
    });
  }, [rows, sortState]);

  const handleSort = (key: ClubStatsSortKey) => {
    setSortState((current) => {
      if (current.key !== key) {
        return { key, direction: "asc" };
      }

      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }

      if (current.direction === "desc") {
        return { key: null, direction: null };
      }

      return { key, direction: "asc" };
    });
  };

  return (
    <div>
      <div className="overflow-x-auto overscroll-x-contain">
        <table className="min-w-[980px] w-full border-collapse text-sm lg:min-w-0">
          <thead className="border-b border-zinc-800 bg-zinc-950 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              {columns.map((column) => {
                const active = sortState.key === column.key;

                return (
                  <th
                    key={column.key}
                    className={column.key === "team_name" ? "w-[22%] px-4 py-3 text-left font-medium" : "w-16 py-3 text-center font-medium"}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className={`inline-flex items-center gap-1.5 transition-colors hover:text-white ${
                        column.key === "team_name" ? "justify-start" : "justify-center"
                      }`}
                    >
                      <span>{column.label}</span>
                      {active ? (
                        sortState.direction === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5 text-white" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-white" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-zinc-600" />
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {sortedRows.map((row) => (
              <tr
                key={`${row.season_id}-${row.team_id}`}
                className="border-b border-zinc-800 transition-colors hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/teams/${slugify(row.team_name)}`}
                    className="flex min-w-0 items-center gap-3 transition-colors hover:text-white"
                  >
                    <img
                      src={row.team_image_path || "/placeholder-club.png"}
                      alt={row.team_name}
                      className="h-8 w-8 shrink-0 object-contain"
                    />
                    <span className="truncate font-medium text-white">{row.team_name}</span>
                  </Link>
                </td>
                <td className="text-center text-zinc-300">{row.played}</td>
                <td className="text-center text-zinc-300">{formatStat(row.possession_avg, "%")}</td>
                <td className="text-center text-zinc-300">{formatStat(row.pass_accuracy, "%")}</td>
                <td className="text-center text-zinc-300">{formatStatPair(row.passes, row.passes_per_game)}</td>
                <td className="text-center text-zinc-300">{formatStatPair(row.shots, row.shots_per_game)}</td>
                <td className="text-center text-zinc-300">{formatStatPair(row.shots_on_target, row.shots_on_target_per_game)}</td>
                <td className="text-center text-zinc-300">{formatStatPair(row.corners, row.corners_per_game)}</td>
                <td className="text-center text-zinc-300">{formatStatPair(row.fouls, row.fouls_per_game)}</td>
                <td className="text-center text-zinc-300">{formatStatPair(row.offsides, row.offsides_per_game)}</td>
                <td className="text-center text-zinc-300">{formatStatPair(row.saves, row.saves_per_game)}</td>
                <td className="text-center text-zinc-300">{formatStatPair(row.yellow_cards, row.yellow_cards_per_game)}</td>
                <td className="text-center text-zinc-300">{formatStatPair(row.red_cards, row.red_cards_per_game)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-zinc-800 bg-zinc-950/40 px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Glossary
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {columns.map((column) => (
            <p key={`glossary-${column.key}`} className="text-xs leading-5 text-zinc-500">
              <span className="text-zinc-300">{column.label}:</span> {column.description}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyStateCopy({ message }: { message: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center border border-dashed border-zinc-800 bg-zinc-950/60 px-6 py-8 text-center">
      <p className="max-w-xl text-sm leading-6 text-zinc-500">{message}</p>
    </div>
  );
}

function LeagueLoadingState() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="h-14 animate-pulse border border-zinc-800/80 bg-zinc-900/60" />
      <div className="h-[520px] animate-pulse border border-zinc-800/80 bg-zinc-900/60" />
    </div>
  );
}

function LeagueFixturesSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="h-[92px] animate-pulse border border-zinc-800/80 bg-zinc-900/60"
        />
      ))}
    </div>
  );
}

function buildLeagueLeaderboardRows(
  rows: Omit<LeagueLeaderboardRow, "rank">[]
): LeagueLeaderboardRow[] {
  return rows.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}

function buildTeamFixtureSlug(fixture: TeamFixture): string {
  return `${slugify(fixture.home.name, "home")}-vs-${slugify(fixture.away.name, "away")}-${fixture.id}`;
}

function slugify(value: string | null | undefined, fallback = "item") {
  const normalizedValue = String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalizedValue || fallback;
}

function compareValuesAsc(a: string, b: string) {
  return new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  }).compare(a, b);
}

function compareValuesDesc(a: string, b: string) {
  return compareValuesAsc(b, a);
}

function formatStat(value: number | null, suffix = "") {
  if (value == null) {
    return "-";
  }

  const formatted =
    Number.isInteger(value) ? `${value}` : value.toFixed(1);

  return `${formatted}${suffix}`;
}

function formatStatPair(total: number | null, perGame: number | null) {
  const totalLabel = formatStat(total);
  const perGameLabel = perGame == null ? "-" : `${perGame.toFixed(1)}`;

  if (totalLabel === "-" && perGameLabel === "-") {
    return "-";
  }

  return `${totalLabel} (${perGameLabel})`;
}

function getClubStatSortValue(row: ClubSeasonSummary, key: ClubStatsSortKey) {
  switch (key) {
    case "team_name":
      return row.team_name.toLowerCase();
    case "played":
      return row.played;
    case "possession_avg":
      return row.possession_avg ?? Number.NEGATIVE_INFINITY;
    case "pass_accuracy":
      return row.pass_accuracy ?? Number.NEGATIVE_INFINITY;
    case "passes":
      return row.passes ?? Number.NEGATIVE_INFINITY;
    case "shots":
      return row.shots ?? Number.NEGATIVE_INFINITY;
    case "shots_on_target":
      return row.shots_on_target ?? Number.NEGATIVE_INFINITY;
    case "corners":
      return row.corners ?? Number.NEGATIVE_INFINITY;
    case "fouls":
      return row.fouls ?? Number.NEGATIVE_INFINITY;
    case "offsides":
      return row.offsides ?? Number.NEGATIVE_INFINITY;
    case "saves":
      return row.saves ?? Number.NEGATIVE_INFINITY;
    case "yellow_cards":
      return row.yellow_cards ?? Number.NEGATIVE_INFINITY;
    case "red_cards":
      return row.red_cards ?? Number.NEGATIVE_INFINITY;
  }
}
