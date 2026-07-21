"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTeamCountries, getTeams } from "@/lib/supabase/queries";
import type { Team } from "@/types/team";

const PAGE_SIZE = 12;

function mergeTeams(existingTeams: Team[], nextTeams: Team[]) {
  const uniqueTeams = new Map<number, Team>();

  for (const team of existingTeams) {
    uniqueTeams.set(team.id, team);
  }

  for (const team of nextTeams) {
    uniqueTeams.set(team.id, team);
  }

  return Array.from(uniqueTeams.values());
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("Indonesia");

  const loaderRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const nextPageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loadedPagesRef = useRef(new Set<number>());

  const loadTeams = useCallback(async (pageNumber: number, reset = false) => {
    if (loadingRef.current) {
      return;
    }

    if (!reset && (!hasMoreRef.current || loadedPagesRef.current.has(pageNumber))) {
      return;
    }

    loadingRef.current = true;
    setError(null);

    if (reset) {
      setIsLoadingInitial(true);
      loadedPagesRef.current.clear();
      nextPageRef.current = 0;
      hasMoreRef.current = true;
      setHasMore(true);
    } else {
      setIsLoadingMore(true);
    }

    const { data, error: queryError } = await getTeams(
      pageNumber * PAGE_SIZE,
      PAGE_SIZE,
      countryFilter
    );

    if (queryError) {
      setError(queryError);
      loadingRef.current = false;
      setIsLoadingInitial(false);
      setIsLoadingMore(false);
      return;
    }

    const nextTeams = data ?? [];
    const hasNextPage = nextTeams.length === PAGE_SIZE;

    loadedPagesRef.current.add(pageNumber);
    nextPageRef.current = pageNumber;
    hasMoreRef.current = hasNextPage;

    setTeams((currentTeams) =>
      reset ? nextTeams : mergeTeams(currentTeams, nextTeams)
    );
    setHasMore(hasNextPage);

    loadingRef.current = false;
    setIsLoadingInitial(false);
    setIsLoadingMore(false);
  }, [countryFilter]);

  useEffect(() => {
    void loadTeams(0, true);
  }, [loadTeams]);

  useEffect(() => {
    const loadCountries = async () => {
      const { data, error: queryError } = await getTeamCountries();

      if (queryError || !data) {
        setError(queryError ?? "Unable to load countries.");
        return;
      }

      setCountries(data);
    };

    void loadCountries();
  }, []);

  useEffect(() => {
    const loader = loaderRef.current;

    if (!loader) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loadingRef.current || !hasMoreRef.current) {
          return;
        }

        void loadTeams(nextPageRef.current + 1);
      },
      { rootMargin: "240px 0px", threshold: 0.01 }
    );

    observer.observe(loader);

    return () => observer.disconnect();
  }, [loadTeams]);

  const filteredTeams = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return teams.filter((team) => {
      const matchSearch =
        keyword === "" ||
        team.name.toLowerCase().includes(keyword) ||
        (team.league ?? "").toLowerCase().includes(keyword) ||
        (team.country ?? "").toLowerCase().includes(keyword);

      return matchSearch;
    });
  }, [countryFilter, search, teams]);

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="app-shell-panel flex flex-col gap-4 p-6">
          <div>
            <p className="accent-text text-sm uppercase tracking-[0.3em]">Teams</p>

            <h1 className="font-display mt-2 text-[2.8rem] leading-none text-white sm:text-[3.4rem]">
              Teams Explorer
            </h1>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="focus-accent-within flex h-11 items-center gap-3 border border-zinc-800 bg-zinc-900/80 px-4 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800">
              <Search className="h-4 w-4 shrink-0 text-zinc-500" />

              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
                placeholder="Search club..."
                className="h-full border-0 bg-transparent p-0 text-zinc-200 shadow-none placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="shrink-0 text-zinc-500">Country:</span>
                  <SelectValue placeholder="Country" />
                </div>
              </SelectTrigger>

              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        {isLoadingInitial ? <p className="text-sm text-zinc-400">Loading teams...</p> : null}
        {!isLoadingInitial && !error && filteredTeams.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No teams match the selected search and filters.
          </p>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredTeams.map((team) => (
            <Link key={team.id} href={`/teams/${team.slug ?? team.id}`}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
                <Card className="h-full transition-all hover:border-zinc-700 hover:shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
                  <CardContent className="flex h-full flex-col items-center gap-4 p-6 text-center">
                    <img
                      src={team.logo ?? "/placeholder-club.png"}
                      alt={team.name}
                      className="h-20 w-20 object-contain"
                    />

                    <div>
                      <h3 className="text-lg font-semibold text-white">{team.name}</h3>

                      <p className="text-sm uppercase tracking-widest text-zinc-500">
                        {team.short_code}
                      </p>
                    </div>

                    <p className="text-sm text-zinc-400">
                      {[team.league, team.country].filter(Boolean).join(" • ")}
                    </p>

                    <Button variant="outline" className="mt-2 w-full">
                      Explore Team
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </section>

        {isLoadingMore ? <TeamsLoadingSkeleton /> : null}
        {hasMore ? <div ref={loaderRef} className="h-12" /> : null}
      </div>
    </div>
  );
}

function TeamsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[280px] animate-pulse border border-zinc-800/80 bg-zinc-900/60"
        />
      ))}
    </div>
  );
}
