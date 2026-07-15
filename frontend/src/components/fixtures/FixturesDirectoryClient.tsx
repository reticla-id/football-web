"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { FixtureLeagueDirectory } from "@/lib/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  leagues: FixtureLeagueDirectory[];
  error: string | null;
}

export default function FixturesDirectoryClient({ leagues, error }: Props) {
  const [countryFilter, setCountryFilter] = useState("all");
  const [search, setSearch] = useState("");

  const countries = useMemo(
    () => [
      { value: "all", label: "All Countries" },
      ...Array.from(
        new Set(leagues.map((league) => league.country).filter((value): value is string => !!value))
      )
        .sort((a, b) => a.localeCompare(b))
        .map((country) => ({ value: country, label: country })),
    ],
    [leagues]
  );

  const filteredLeagues = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return leagues.filter((league) => {
      const matchesCountry =
        countryFilter === "all" || league.country === countryFilter;
      const matchesSearch =
        keyword === "" ||
        league.name.toLowerCase().includes(keyword) ||
        (league.country ?? "").toLowerCase().includes(keyword);

      return matchesCountry && matchesSearch;
    });
  }, [countryFilter, leagues, search]);

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="app-shell-panel flex flex-col gap-4 p-6">
          <div>
            <p className="accent-text text-sm uppercase tracking-[0.3em]">
              Fixtures
            </p>

            <h1 className="font-display mt-2 text-[2.8rem] leading-none text-white sm:text-[3.4rem]">
              League Fixtures
            </h1>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="focus-accent-within flex h-11 items-center gap-3 border border-zinc-800 bg-zinc-900/80 px-4 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800 md:col-span-2">
              <Search className="h-4 w-4 shrink-0 text-zinc-500" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search league or country..."
                className="h-full border-0 bg-transparent p-0 text-zinc-200 shadow-none placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>

              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {error ? (
          <div className="border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        {filteredLeagues.length === 0 && !error ? (
          <div className="border border-dashed border-zinc-800 bg-zinc-900/60 px-6 py-12 text-center">
            <p className="text-base font-medium text-white">No leagues available</p>
            <p className="mt-2 text-sm text-zinc-500">
              Try another country filter or search term.
            </p>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredLeagues.map((league) => (
            <Link key={league.id} href={`/fixtures/${league.slug}`} className="block">
              <Card className="h-full transition-all duration-200 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <img
                    src={league.logo ?? "/placeholder-club.png"}
                    alt={league.name}
                    className="h-20 w-20 object-contain"
                  />

                  <div>
                    <h3 className="text-lg font-semibold text-white">{league.name}</h3>
                    <p className="text-sm uppercase tracking-widest text-zinc-500">
                      {league.country ?? "Country unavailable"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
