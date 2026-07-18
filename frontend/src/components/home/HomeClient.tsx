"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Shield,
  Sparkles,
  Goal
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import FixtureCard from "@/components/dashboard/FixtureCard";
import { LeaderboardTable } from "@/components/dashboard/LeaderboardTable";
import { StandingsTable } from "@/components/dashboard/StandingsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { readStoredState, writeStoredState } from "@/app/radar/components/storage";
import { getDashboardData, getFixtures } from "@/lib/supabase/queries";
import type { DashboardStats, Fixture } from "@/lib/supabase/types";

const HOME_FILTER_STORAGE_KEY = "dashboard-home-filters";

function StatSkeleton() {
  return (
    <div className="-[24px] border border-zinc-800/80 bg-zinc-950/60 p-5">
      <div className="h-3 w-24 animate-pulse  bg-zinc-800" />
      <div className="mt-4 h-8 w-16 animate-pulse  bg-zinc-800" />
    </div>
  );
}

export default function HomeClient() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [selectedLeague, setSelectedLeague] = useState(
    () =>
      readStoredState<{ league: string; season: string }>(HOME_FILTER_STORAGE_KEY, {
        league: "",
        season: "",
      }).league
  );
  const [selectedSeason, setSelectedSeason] = useState(
    () =>
      readStoredState<{ league: string; season: string }>(HOME_FILTER_STORAGE_KEY, {
        league: "",
        season: "",
      }).season
  );

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      const [dashboardResult, fixturesResult] = await Promise.all([
        getDashboardData(),
        getFixtures(),
      ]);

      if (dashboardResult.error || !dashboardResult.data) {
        setError(dashboardResult.error ?? "Unable to load dashboard.");
        setIsLoading(false);
        return;
      }

      setDashboardData(dashboardResult.data);
      setFixtures(fixturesResult.data ?? []);
      setError(null);
      setIsLoading(false);
    };

    void loadData();
  }, []);

  const filterSource = useMemo(
    () => [
      ...(dashboardData?.standings ?? []),
      ...(dashboardData?.topScorers ?? []),
      ...(dashboardData?.topAssists ?? []),
      ...(dashboardData?.topRedcards ?? []),
    ],
    [dashboardData]
  );

  const leagueOptions = useMemo(
    () =>
      Array.from(
        new Set(
          filterSource
            .map((row) => row.league)
            .filter((value): value is string => Boolean(value))
        )
      ).sort(compareValuesAsc),
    [filterSource]
  );

  const seasonsByLeague = useMemo(() => {
    const leagueMap = new Map<string, string[]>();

    for (const row of filterSource) {
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
  }, [filterSource]);

  const defaultLeague = useMemo(() => {
    const leagues = Array.from(seasonsByLeague.keys());

    return leagues.sort((leftLeague, rightLeague) => {
      const leftLatestSeason = seasonsByLeague.get(leftLeague)?.[0] ?? "";
      const rightLatestSeason = seasonsByLeague.get(rightLeague)?.[0] ?? "";
      const seasonComparison = compareValuesDesc(leftLatestSeason, rightLatestSeason);

      if (seasonComparison !== 0) {
        return seasonComparison;
      }

      return compareValuesAsc(leftLeague, rightLeague);
    })[0] ?? "";
  }, [seasonsByLeague]);

  const effectiveLeague = useMemo(
    () => (leagueOptions.includes(selectedLeague) ? selectedLeague : defaultLeague),
    [defaultLeague, leagueOptions, selectedLeague]
  );

  const seasonOptions = useMemo(
    () => seasonsByLeague.get(effectiveLeague) ?? [],
    [effectiveLeague, seasonsByLeague]
  );

  const effectiveSeason = useMemo(
    () => (seasonOptions.includes(selectedSeason) ? selectedSeason : (seasonOptions[0] ?? "")),
    [seasonOptions, selectedSeason]
  );

  useEffect(() => {
    writeStoredState(HOME_FILTER_STORAGE_KEY, {
      league: effectiveLeague,
      season: effectiveSeason,
    });
  }, [effectiveLeague, effectiveSeason]);

  const filteredStandings = useMemo(
    () =>
      (dashboardData?.standings ?? []).filter(
        (row) =>
          row.league === effectiveLeague && row.season === effectiveSeason
      ),
    [dashboardData, effectiveLeague, effectiveSeason]
  );

  const filteredTopScorers = useMemo(
    () =>
      (dashboardData?.topScorers ?? []).filter(
        (row) =>
          row.league === effectiveLeague && row.season === effectiveSeason
      ),
    [dashboardData, effectiveLeague, effectiveSeason]
  );

  const filteredTopAssists = useMemo(
    () =>
      (dashboardData?.topAssists ?? []).filter(
        (row) =>
          row.league === effectiveLeague && row.season === effectiveSeason
      ),
    [dashboardData, effectiveLeague, effectiveSeason]
  );

  const filteredLeagueStats = useMemo(() => {
    const matchedLeagueStats = (dashboardData?.leagueStats ?? []).find(
      (row) => row.league === effectiveLeague && row.season === effectiveSeason
    );

    if (matchedLeagueStats) {
      return matchedLeagueStats;
    }

    const totalTeams = filteredStandings.length;
    const totalMatches =
      filteredStandings.reduce((sum, row) => sum + row.played, 0) / 2;
    const totalGoals = filteredStandings.reduce(
      (sum, row) => sum + (row.goalsFor ?? 0),
      0
    );

    return {
      seasonId: 0,
      season: effectiveSeason,
      leagueId: 0,
      league: effectiveLeague,
      totalTeams,
      totalMatches,
      totalGoals,
      avgGoalsPerMatch: totalMatches > 0 ? totalGoals / totalMatches : 0,
    };
  }, [dashboardData, effectiveLeague, effectiveSeason, filteredStandings]);

  const summaryStats = useMemo(
    () => [
      {
        label: "Teams",
        value: filteredLeagueStats.totalTeams,
        icon: Shield,
        description: "Participating clubs",
      },
      {
        label: "Fixtures",
        value: filteredLeagueStats.totalMatches,
        icon: CalendarDays,
        description: "Matches played",
      },
      {
        label: "Goals",
        value: filteredLeagueStats.totalGoals,
        icon: Goal,
        description: "Goals scored",
      },
      {
        label: "Avg Goals / Match",
        value: filteredLeagueStats.avgGoalsPerMatch.toFixed(1),
        icon: BarChart3,
        description: "Goals per Match",
      },
    ],
    [filteredLeagueStats]
  );

  const topScorersRows = useMemo(
    () =>
      filteredTopScorers.slice(0, 10).map((player, index) => ({
        rank: index + 1,
        name: player.player,
        team: player.team,
        image_path: player.image_path,
        team_image_path: player.team_image_path,
        value: player.goals,
        label: "Goals",
      })),
    [filteredTopScorers]
  );

  const topAssistsRows = useMemo(
    () =>
      filteredTopAssists.slice(0, 10).map((player, index) => ({
        rank: index + 1,
        name: player.player,
        team: player.team,
        image_path: player.image_path,
        team_image_path: player.team_image_path,
        value: player.assists,
        label: "Assists",
      })),
    [filteredTopAssists]
  );

  const recentFixtures = useMemo(() => fixtures.slice(0, 5), [fixtures]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 lg:px-6 lg:py-6">
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 xl:space-y-10"
        >
          <section className="space-y-8">
            <div className="w-full">
              <p className="accent-text mb-6 text-xs font-semibold uppercase tracking-[0.36em]">
                Enterprise Football Intelligence
              </p>

              <h1 className="font-display max-w-6xl text-5xl leading-[0.9] text-white sm:text-6xl lg:text-7xl">
                Club Performance
                <br />
                Command Center
              </h1>

              <p className="mt-8 max-w-5xl text-lg leading-8 text-zinc-400">
                Built for coaching staff, analysts, scouts, and sporting directors.
                A modern decision-making workspace for tracking team form, player output,
                and match intelligence with the discipline of an elite football department.
              </p>
            </div>

            <div className="app-shell-panel flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                  Dashboard Filters
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Narrow standings and league leaderboards by competition and season.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="w-full sm:w-[220px]">
                  <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    League
                  </p>
                  <Select
                    value={effectiveLeague}
                    onValueChange={(value) => {
                      setSelectedLeague(value);
                      setSelectedSeason(seasonsByLeague.get(value)?.[0] ?? "");
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

                <div className="w-full sm:w-[220px]">
                  <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    Season
                  </p>
                  <Select value={effectiveSeason} onValueChange={setSelectedSeason}>
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
          </section>

          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-[1.9rem] leading-none text-white">Recent & Upcoming Fixtures</h2>

              <Link
                href="/fixtures"
                className="hover-accent-text accent-text inline-flex items-center gap-1 text-sm transition-transform"
              >
                <span>View all</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {recentFixtures.map((fixture) => (
                <Link
                  key={fixture.id}
                  href={`/fixtures/${slugify(fixture.league.name)}/${buildFixtureSlug(fixture)}`}
                  className="block"
                >
                  <FixtureCard fixture={fixture} />
                </Link>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => <StatSkeleton key={index} />)
              : summaryStats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <Card key={stat.label} className="transition-transform duration-200 hover:-translate-y-1 hover:border-zinc-700">
                      <CardContent className="flex items-center justify-between px-5 py-5">
                        <div>
                          <p className="text-sm text-zinc-400">{stat.label}</p>
                          <p className="font-display mt-2 text-[2.2rem] leading-none text-white">
                            {stat.value}
                          </p>
                          <p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                            {stat.description}
                          </p>
                        </div>

                        <div className="accent-bg-soft accent-text accent-border-soft -2xl border p-3">
                          <Icon className="h-5 w-5" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
          </section>

          {error ? (
            <div className="-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
              {error}
            </div>
          ) : null}

          {!isLoading && !error && !dashboardData ? (
            <div className="-[28px] border border-dashed border-zinc-800 bg-zinc-950/60 p-10 text-center text-zinc-400">
              <div className="accent-text mx-auto mb-3 flex h-12 w-12 items-center justify-center -full border border-zinc-800 bg-zinc-900">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">No league data available yet</h2>
              <p className="mt-2 text-sm">
                The dashboard will populate automatically once the analytics feed is
                available.
              </p>
            </div>
          ) : null}

          {dashboardData ? (
            <>
              <section className="grid w-full min-w-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)_minmax(300px,1fr)]">
                <Card className="flex h-full w-full min-w-0 flex-col">
                  <CardHeader className="px-4 py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-[2rem]">League standings</CardTitle>
                        <p className="mt-1 text-sm text-zinc-400">
                          Live table view with form, goal difference, and momentum cues.
                        </p>
                      </div>

                      <Link
                        href="/league"
                        className="hover-accent-text accent-text inline-flex items-center gap-2 text-sm font-medium transition"
                      >
                        Open league
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </CardHeader>

                  <CardContent className="min-w-0 flex-1 overflow-x-auto px-4 pb-4 pt-2">
                    <StandingsTable standings={filteredStandings.slice(0, 12)} />
                  </CardContent>
                </Card>

                <LeaderboardTable
                  title="Top scorers"
                  description="Most goals in the current campaign"
                  rows={topScorersRows}
                  emptyMessage="No scorer data is available right now."
                />

                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
                  <LeaderboardTable
                    title="Top assists"
                    description="Most Assist in the current Campaign"
                    rows={topAssistsRows}
                    emptyMessage="No assist leaders available yet."
                  />

                  {/* <LeaderboardTable
                    title="Top red cards"
                    description="Disciplinary leaders in the selected campaign"
                    rows={topRedcardsRows}
                    emptyMessage="No red card leaders available yet."
                  /> */}
                </div>
              </section>

              <section className="grid gap-6 pt-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>League snapshot</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2 text-sm text-zinc-300">
                    <div className="flex items-center justify-between -2xl border border-zinc-800 bg-zinc-950/65 px-4 py-3">
                      <span>Total teams</span>
                      <span className="font-semibold text-white">
                        {filteredLeagueStats.totalTeams}
                      </span>
                    </div>
                    <div className="flex items-center justify-between -2xl border border-zinc-800 bg-zinc-950/65 px-4 py-3">
                      <span>Total matches</span>
                      <span className="font-semibold text-white">
                        {filteredLeagueStats.totalMatches}
                      </span>
                    </div>
                    <div className="flex items-center justify-between -2xl border border-zinc-800 bg-zinc-950/65 px-4 py-3">
                      <span>Average goals</span>
                      <span className="font-semibold text-white">
                        {filteredLeagueStats.avgGoalsPerMatch.toFixed(1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-3 text-sm text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 -2xl border border-zinc-800 bg-zinc-950/65 px-4 py-3">
                      <div className="accent-bg-soft accent-text -full p-2">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p>Explore team profiles and player pages for deeper context.</p>
                    </div>

                    <Link
                      href="/teams"
                      className="hover-accent-text accent-text inline-flex items-center gap-2 text-sm font-medium transition"
                    >
                      Browse teams
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>

                  <CardContent className="flex flex-col gap-3 text-sm text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 -2xl border border-zinc-800 bg-zinc-950/65 px-4 py-3">
                      <div className="accent-bg-soft accent-text -full p-2">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p>Explore player profiles and career data in one place.</p>
                    </div>

                    <Link
                      href="/players"
                      className="hover-accent-text accent-text inline-flex items-center gap-2 text-sm font-medium transition"
                    >
                      Browse players
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>

                  <CardContent className="flex flex-col gap-3 text-sm text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 -2xl border border-zinc-800 bg-zinc-950/65 px-4 py-3">
                      <div className="accent-bg-soft accent-text -full p-2">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p>Access scouting intelligence to identify and evaluate transfer targets.</p>
                    </div>

                    <Link
                      href="/radar"
                      className="hover-accent-text accent-text inline-flex items-center gap-2 text-sm font-medium transition"
                    >
                      Browse Radar
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              </section>
            </>
          ) : null}
        </motion.main>
      </div>
    </div>
  );
}

function buildFixtureSlug(fixture: Fixture): string {
  return `${slugify(fixture.home.name)}-vs-${slugify(fixture.away.name)}-${fixture.id}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
