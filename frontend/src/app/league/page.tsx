"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
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
import { getDashboardData, getFixtures } from "@/lib/supabase/queries";
import type { DashboardStats, Fixture } from "@/lib/supabase/types";
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

const FIXTURE_PAGE_SIZE = 10;

export default function LeaguePage() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState("Liga 1");
  const [activeTab, setActiveTab] = useState<LeagueTab>("standings");
  const [visibleFixtureCount, setVisibleFixtureCount] = useState(FIXTURE_PAGE_SIZE);
  const [isLoadingMoreFixtures, setIsLoadingMoreFixtures] = useState(false);

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

  const leagueOptions = useMemo(() => {
    const standingsLeagues = (dashboardData?.standings ?? [])
      .map((row) => row.league)
      .filter((value): value is string => Boolean(value));

    const fixtureLeagues = fixtures
      .map((fixture) => fixture.league.name)
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set([...standingsLeagues, ...fixtureLeagues])).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [dashboardData, fixtures]);

  useEffect(() => {
    if (!leagueOptions.length) {
      return;
    }

    if (leagueOptions.includes("Liga 1")) {
      setSelectedLeague((current) => (leagueOptions.includes(current) ? current : "Liga 1"));
      return;
    }

    setSelectedLeague((current) =>
      leagueOptions.includes(current) ? current : leagueOptions[0]
    );
  }, [leagueOptions]);

  const filteredStandings = useMemo(
    () => (dashboardData?.standings ?? []).filter((row) => row.league === selectedLeague),
    [dashboardData, selectedLeague]
  );

  const filteredTeamNames = useMemo(
    () => new Set(filteredStandings.map((row) => row.team)),
    [filteredStandings]
  );

  const filteredTopScorers = useMemo(
    () =>
      buildLeagueLeaderboardRows(
        (dashboardData?.topScorers ?? [])
          .filter((row) => filteredTeamNames.has(row.team))
          .map((row) => ({
            name: row.player,
            team: row.team,
            image_path: row.image_path,
            team_image_path: row.team_image_path,
            value: row.goals,
            label: "Goals",
            positionSubtitle: "Position unavailable",
          }))
      ),
    [dashboardData, filteredTeamNames]
  );

  const filteredTopAssists = useMemo(
    () =>
      buildLeagueLeaderboardRows(
        (dashboardData?.topAssists ?? [])
          .filter((row) => filteredTeamNames.has(row.team))
          .map((row) => ({
            name: row.player,
            team: row.team,
            image_path: row.image_path,
            team_image_path: row.team_image_path,
            value: row.assists,
            label: "Assists",
            positionSubtitle: "Position unavailable",
          }))
      ),
    [dashboardData, filteredTeamNames]
  );

  const filteredTopRedCards = useMemo(
    () =>
      buildLeagueLeaderboardRows(
        (dashboardData?.topRedcards ?? [])
          .filter((row) => filteredTeamNames.has(row.team))
          .map((row) => ({
            name: row.player,
            team: row.team,
            image_path: row.image_path,
            team_image_path: row.team_image_path,
            value: row.redcards,
            label: "Red Cards",
            positionSubtitle: "Position unavailable",
          }))
      ),
    [dashboardData, filteredTeamNames]
  );

  const filteredFixtures = useMemo(
    () => fixtures.filter((fixture) => fixture.league.name === selectedLeague),
    [fixtures, selectedLeague]
  );

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
    setVisibleFixtureCount(FIXTURE_PAGE_SIZE);
  }, [selectedLeague]);

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
                League Intelligence
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                Compare standings, disciplinary leaders, attacking leaders and
                recent fixtures inside one league-focused workspace.
              </p>
            </div>

            <div className="w-full lg:w-[240px]">
              <Select value={selectedLeague} onValueChange={setSelectedLeague}>
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

            {activeTab === "top-scorers" ? (
              <LeaguePanel tab="top-scorers">
                <LeagueLeaderboardTable
                  title="Top Scorers"
                  description="Goalscorers filtered by selected league clubs"
                  rows={filteredTopScorers}
                  emptyMessage="No top scorer data is available for this league selection."
                />
              </LeaguePanel>
            ) : null}

            {activeTab === "top-assists" ? (
              <LeaguePanel tab="top-assists">
                <LeagueLeaderboardTable
                  title="Top Assists"
                  description="Assist leaders filtered by selected league clubs"
                  rows={filteredTopAssists}
                  emptyMessage="No assist data is available for this league selection."
                />
              </LeaguePanel>
            ) : null}

            {activeTab === "most-red-cards" ? (
              <LeaguePanel tab="most-red-cards">
                <LeagueLeaderboardTable
                  title="Most Red Cards"
                  description="Disciplinary leaders filtered by selected league clubs"
                  rows={filteredTopRedCards}
                  emptyMessage="No red card data is available for this league selection."
                />
              </LeaguePanel>
            ) : null}

            {activeTab === "team-statistics" ? (
              <LeaguePanel tab="team-statistics">
                <Card className="border-zinc-800/80 bg-zinc-900/70">
                  <CardHeader className="border-b border-zinc-800 px-5 py-4">
                    <CardTitle>Team Statistics</CardTitle>
                  </CardHeader>

                  <CardContent className="px-6 py-14">
                    <EmptyStateCopy message="Team statistics will be connected in a future pass." />
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
                          href={`/fixtures/${slugify(fixture.league.name)}/${buildTeamFixtureSlug(fixture)}`}
                          className="block"
                        >
                          <motion.div
                            whileHover={{ y: -3 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                          >
                            {new Date(fixture.starting_at).getTime() > Date.now() ? (
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
          <div>
            {rows.map((row) => (
              <Link
                key={`${row.rank}-${row.name}`}
                href={`/players/${slugify(row.name)}`}
                className="grid grid-cols-[56px_minmax(0,1.7fr)_56px_minmax(0,1fr)_120px] items-center gap-3 border-b border-zinc-800 px-5 py-3 transition-colors hover:bg-zinc-900/75 last:border-none"
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
        )}
      </CardContent>
    </Card>
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
  return rows.slice(0, 30).map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}

function buildTeamFixtureSlug(fixture: TeamFixture): string {
  return `${slugify(fixture.home.name)}-vs-${slugify(fixture.away.name)}-${fixture.id}`;
}

function getTrend(position: number, total: number) {
  if (position <= 3) {
    return { icon: motionArrow("up"), className: "accent-text" };
  }

  if (position >= total - 2) {
    return { icon: motionArrow("down"), className: "text-rose-400" };
  }

  return { icon: motionArrow("minus"), className: "text-zinc-500" };
}

function motionArrow(direction: "up" | "down" | "minus") {
  if (direction === "up") {
    return function UpIcon({ className }: { className?: string }) {
      return <span className={className}>↑</span>;
    };
  }

  if (direction === "down") {
    return function DownIcon({ className }: { className?: string }) {
      return <span className={className}>↓</span>;
    };
  }

  return function MinusIcon({ className }: { className?: string }) {
    return <span className={className}>-</span>;
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
