"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import type { FixtureSeasonOption } from "@/lib/supabase/types";
import { getTeamFixtures } from "@/lib/supabase/queries";
import type { TeamFixture } from "@/types/fixture";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import FixtureCardFinished from "./FixtureCardFinished";
import FixtureCardUpcoming from "./FixtureCardUpcoming";

interface Props {
  teamId: number;
  fixtures: TeamFixture[];
  seasons: FixtureSeasonOption[];
}

const PAGE_SIZE = 10;

export default function TeamFixtures({ teamId, fixtures, seasons }: Props) {
  const [season, setSeason] = useState("all");
  const [items, setItems] = useState(fixtures);
  const [offset, setOffset] = useState(fixtures.length);
  const [hasMore, setHasMore] = useState(fixtures.length === PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const firstRenderRef = useRef(true);
  const offsetRef = useRef(fixtures.length);

  const selectedSeasonId = useMemo(
    () => (season === "all" ? undefined : Number(season)),
    [season]
  );

  const loadFixtures = useCallback(
    async (reset: boolean) => {
      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;

      if (reset) {
        setIsRefreshing(true);
      } else {
        setIsLoadingMore(true);
      }

      const currentOffset = reset ? 0 : offsetRef.current;
      const result = await getTeamFixtures(
        teamId,
        selectedSeasonId,
        PAGE_SIZE,
        currentOffset
      );

      if (result.error) {
        setError(result.error);
        loadingRef.current = false;
        setIsRefreshing(false);
        setIsLoadingMore(false);
        return;
      }

      const nextItems = result.data ?? [];

      setError(null);
      setItems((prev) => (reset ? nextItems : [...prev, ...nextItems]));
      setOffset(currentOffset + nextItems.length);
      offsetRef.current = currentOffset + nextItems.length;
      setHasMore(nextItems.length === PAGE_SIZE);

      loadingRef.current = false;
      setIsRefreshing(false);
      setIsLoadingMore(false);
    },
    [selectedSeasonId, teamId]
  );

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    offsetRef.current = 0;
    setOffset(0);
    setItems([]);
    setHasMore(true);
    void loadFixtures(true);
  }, [loadFixtures, season]);

  useEffect(() => {
    if (!hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingRef.current) {
          void loadFixtures(false);
        }
      },
      { rootMargin: "320px 0px", threshold: 0.01 }
    );

    const loader = loaderRef.current;
    if (loader) {
      observer.observe(loader);
    }

    return () => observer.disconnect();
  }, [hasMore, loadFixtures]);

  if (!items.length && !isRefreshing) {
    return (
      <section
        id="team-panel-fixtures"
        role="tabpanel"
        aria-labelledby="team-tab-fixtures"
        className="space-y-5"
      >
        <div className="flex flex-col gap-4 border border-zinc-800/80 bg-zinc-900/70 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Fixtures</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Review the latest and upcoming matches for this club.
            </p>
          </div>

          <SeasonFilter seasons={seasons} value={season} onChange={setSeason} />
        </div>

        <div className="border border-dashed border-zinc-800 bg-zinc-900/60 px-6 py-12 text-center">
          <p className="text-base font-medium text-white">No fixtures available</p>
          <p className="mt-2 text-sm text-zinc-500">
            Try another season filter or check back when fixture data is available.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="team-panel-fixtures"
      role="tabpanel"
      aria-labelledby="team-tab-fixtures"
      className="space-y-5"
    >
      <div className="flex flex-col gap-4 border border-zinc-800/80 bg-zinc-900/70 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Fixtures</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Ordered by most recent match date, with upcoming fixtures below.
          </p>
        </div>

        <SeasonFilter seasons={seasons} value={season} onChange={setSeason} />
      </div>

      {error ? (
        <div className="border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      ) : null}

      {isRefreshing ? (
        <FixtureSkeletonGrid />
      ) : (
        <div className="space-y-4">
          {items.map((fixture) => {
            const isUpcoming = new Date(fixture.starting_at).getTime() > Date.now();
            const href = `/fixtures/${slugify(fixture.league.name, "league")}/${buildFixtureSlug(fixture)}`;

            return (
              <Link key={fixture.id} href={href} className="block">
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
          })}
        </div>
      )}

      {isLoadingMore ? <FixtureSkeletonGrid compact /> : null}
      {hasMore ? <div ref={loaderRef} className="h-10" /> : null}
    </section>
  );
}

function SeasonFilter({
  seasons,
  value,
  onChange,
}: {
  seasons: FixtureSeasonOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[200px]">
        <SelectValue placeholder="Season" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">All Seasons</SelectItem>
        {seasons.map((season) => (
          <SelectItem key={season.id} value={String(season.id)}>
            {season.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function FixtureSkeletonGrid({ compact = false }: { compact?: boolean }) {
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

function buildFixtureSlug(fixture: TeamFixture): string {
  const home = slugify(fixture.home.name, "home");
  const away = slugify(fixture.away.name, "away");

  return `${home}-vs-${away}-${fixture.id}`;
}

function slugify(value: string | null | undefined, fallback = "item"): string {
  const normalizedValue = String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalizedValue || fallback;
}
