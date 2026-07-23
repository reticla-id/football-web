"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import type {
  FixtureClubOption,
  FixtureLeagueDirectory,
  FixtureSeasonOption,
} from "@/lib/supabase/types";
import {
  getLeagueFinishedFixtures,
  getLeagueUpcomingFixtures,
} from "@/lib/supabase/queries";
import type { TeamFixture } from "@/types/fixture";

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FixtureCardFinished from "@/components/teams/FixtureCardFinished";
import FixtureCardUpcoming from "@/components/teams/FixtureCardUpcoming";

interface Props {
  league: FixtureLeagueDirectory;
  seasons: FixtureSeasonOption[];
  clubs: FixtureClubOption[];
}

const PAGE_SIZE = 10;

export default function LeagueFixturesClient({ league, seasons, clubs }: Props) {
  const [season, setSeason] = useState(seasons[0]?.name ?? "");
  const [club, setClub] = useState("all");
  const [fixtures, setFixtures] = useState<TeamFixture[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTimestamp] = useState(() => Date.now());

  const loaderRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const upcomingOffsetRef = useRef(0);
  const finishedOffsetRef = useRef(0);
  const phaseRef = useRef<"upcoming" | "finished" | "done">("upcoming");

  const effectiveSeason = useMemo(() => {
    if (seasons.some((seasonOption) => seasonOption.name === season)) {
      return season;
    }

    return seasons[0]?.name ?? "";
  }, [season, seasons]);
  const selectedClubId = useMemo(
    () => (club === "all" ? undefined : Number(club)),
    [club]
  );

  const loadNextPage = useCallback(
    async (reset: boolean) => {
      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;

      if (reset) {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      let remaining = PAGE_SIZE;
      let nextPhase = reset ? "upcoming" : phaseRef.current;
      let nextUpcomingOffset = reset ? 0 : upcomingOffsetRef.current;
      let nextFinishedOffset = reset ? 0 : finishedOffsetRef.current;
      const nextFixtures: TeamFixture[] = [];

      if (nextPhase === "upcoming") {
        const requested = remaining;
        const upcomingResult = await getLeagueUpcomingFixtures(
          league.id,
          effectiveSeason || undefined,
          selectedClubId,
          requested,
          nextUpcomingOffset
        );

        if (upcomingResult.error) {
          setError(upcomingResult.error);
          loadingRef.current = false;
          setIsInitialLoading(false);
          setIsLoadingMore(false);
          return;
        }

        const upcomingFixtures = upcomingResult.data ?? [];
        nextFixtures.push(...upcomingFixtures);
        nextUpcomingOffset += upcomingFixtures.length;
        remaining -= upcomingFixtures.length;

        if (upcomingFixtures.length < requested) {
          nextPhase = "finished";
        }
      }

      if (remaining > 0 && nextPhase !== "done") {
        const requested = remaining;
        const finishedResult = await getLeagueFinishedFixtures(
          league.id,
          effectiveSeason || undefined,
          selectedClubId,
          requested,
          nextFinishedOffset
        );

        if (finishedResult.error) {
          setError(finishedResult.error);
          loadingRef.current = false;
          setIsInitialLoading(false);
          setIsLoadingMore(false);
          return;
        }

        const finishedFixtures = finishedResult.data ?? [];
        nextFixtures.push(...finishedFixtures);
        nextFinishedOffset += finishedFixtures.length;
        remaining -= finishedFixtures.length;

        nextPhase = finishedFixtures.length < requested ? "done" : "finished";
      }

      setError(null);
      setFixtures((prev) => (reset ? nextFixtures : [...prev, ...nextFixtures]));
      upcomingOffsetRef.current = nextUpcomingOffset;
      finishedOffsetRef.current = nextFinishedOffset;
      phaseRef.current = nextPhase;
      setHasMore(nextFixtures.length === PAGE_SIZE || nextPhase !== "done");

      loadingRef.current = false;
      setIsInitialLoading(false);
      setIsLoadingMore(false);
    },
    [effectiveSeason, league.id, selectedClubId]
  );

  useEffect(() => {
    upcomingOffsetRef.current = 0;
    finishedOffsetRef.current = 0;
    phaseRef.current = "upcoming";
    setHasMore(true);
    setFixtures([]);
    void loadNextPage(true);
  }, [club, effectiveSeason, loadNextPage]);

  useEffect(() => {
    if (!hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingRef.current) {
          void loadNextPage(false);
        }
      },
      { rootMargin: "320px 0px", threshold: 0.01 }
    );

    const loader = loaderRef.current;
    if (loader) {
      observer.observe(loader);
    }

    return () => observer.disconnect();
  }, [hasMore, loadNextPage]);

  const fixtureCards = useMemo(
    () =>
      fixtures.map((fixture) => {
        const isUpcoming = new Date(fixture.starting_at).getTime() > currentTimestamp;

        return (
          <Link
            key={fixture.id}
            href={`/fixtures/${league.slug}/${buildFixtureSlug(fixture)}`}
            className="block"
          >
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {isUpcoming ? (
                <FixtureCardUpcoming fixture={fixture} />
              ) : (
                <FixtureCardFinished fixture={fixture} />
              )}
            </motion.div>
          </Link>
        );
      }),
    [currentTimestamp, fixtures, league.slug]
  );

  return (
    <>
      <Card className="overflow-hidden border-zinc-800/80 bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--accent)_18%,transparent),_transparent_35%),linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,11,0.94))]">
        <div className="grid gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10 lg:px-10">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[24px] border border-zinc-800 bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)] sm:h-32 sm:w-32 lg:mx-0">
            <img
              src={league.logo ?? "/placeholder-club.png"}
              alt={`${league.name} logo`}
              className="h-full w-full object-contain"
            />
          </div>

          <div className="space-y-4 text-center lg:text-left">
            <div className="space-y-2">
              <p className="accent-text text-xs font-semibold uppercase tracking-[0.32em]">
                Competition Fixtures
              </p>
              <h1 className="font-display text-[3.1rem] leading-[0.92] text-white sm:text-[4rem] lg:text-[5rem]">
                {league.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-400 lg:justify-start">
                <span className="border border-zinc-800 bg-zinc-950/70 px-3 py-1">
                  {league.country ?? "Country unavailable"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-4 border border-zinc-800/80 bg-zinc-900/70 p-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Fixtures</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Upcoming fixtures are prioritized first, followed by the latest completed matches.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={effectiveSeason} onValueChange={setSeason}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((seasonOption) => (
                <SelectItem key={seasonOption.id} value={seasonOption.name}>
                  {seasonOption.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={club} onValueChange={setClub}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Club" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clubs</SelectItem>
              {clubs.map((clubOption) => (
                <SelectItem key={clubOption.id} value={String(clubOption.id)}>
                  {clubOption.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <div className="border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      ) : null}

      {isInitialLoading ? <FixtureSkeletonList /> : null}
      {!isInitialLoading && !fixtures.length ? (
        <div className="border border-dashed border-zinc-800 bg-zinc-900/60 px-6 py-12 text-center">
          <p className="text-base font-medium text-white">No fixtures available</p>
          <p className="mt-2 text-sm text-zinc-500">
            Try another season or club filter.
          </p>
        </div>
      ) : null}
      {!isInitialLoading ? <div className="space-y-4">{fixtureCards}</div> : null}
      {isLoadingMore ? <FixtureSkeletonList compact /> : null}
      {hasMore ? <div ref={loaderRef} className="h-10" /> : null}
    </>
  );
}

function buildFixtureSlug(fixture: TeamFixture): string {
  const home = slugify(fixture.home.name, "home");
  const away = slugify(fixture.away.name, "away");

  return `${home}-vs-${away}-${fixture.id}`;
}

function slugify(value: string | null | undefined, fallback = "item") {
  const normalizedValue = String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalizedValue || fallback;
}

function FixtureSkeletonList({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: compact ? 1 : 2 }).map((_, index) => (
        <div
          key={index}
          className="h-[92px] animate-pulse border border-zinc-800/80 bg-zinc-900/60"
        />
      ))}
    </div>
  );
}
