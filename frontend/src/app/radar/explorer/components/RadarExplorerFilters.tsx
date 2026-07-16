"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

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

import FilterSection from "./FilterSection";

type FiltersState = {
  search: string;
  maxAge: number;
  maxHeight: number;
  position: string;
  nationality: string;
  country: string;
  league: string;
  transferStatus: string;
  preferredFoot: string;
  minimumGoals: number;
  minimumAssists: number;
  minimumPassAccuracy: number;
  minimumTacklesPer90: number;
  minimumInterceptionsPer90: number;
  traits: string[];
  playstyles: string[];
};

const defaultFilters: FiltersState = {
  search: "",
  maxAge: 40,
  maxHeight: 220,
  position: "All",
  nationality: "All",
  country: "All",
  league: "All",
  transferStatus: "All",
  preferredFoot: "All",
  minimumGoals: 0,
  minimumAssists: 0,
  minimumPassAccuracy: 0,
  minimumTacklesPer90: 0,
  minimumInterceptionsPer90: 0,
  traits: [],
  playstyles: [],
};

interface Props {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
  maxAvailableAge: number;
  maxAvailableHeight: number;
  positionOptions: string[];
  nationalityOptions: string[];
  countryOptions: string[];
  leagueOptions: string[];
  transferStatusOptions: string[];
  preferredFootOptions: string[];
  traitOptions: string[];
  playstyleOptions: string[];
}

export default function RadarExplorerFilters({
  filters,
  onFiltersChange,
  maxAvailableAge,
  maxAvailableHeight,
  positionOptions,
  nationalityOptions,
  countryOptions,
  leagueOptions,
  transferStatusOptions,
  preferredFootOptions,
  traitOptions,
  playstyleOptions,
}: Props) {
  const maxAgeValue = Math.max(maxAvailableAge, 18);
  const maxHeightValue = Math.max(maxAvailableHeight, 150);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }}
      className="xl:sticky xl:top-6"
    >
      <Card className="border-zinc-800/80 bg-zinc-900/70">
        <CardContent className="space-y-5 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Scouting Filters
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-8 px-2.5 !text-[10px] uppercase tracking-[0.16em]"
              onClick={() => onFiltersChange(defaultFilters)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear Filters
            </Button>
          </div>

          <div className="space-y-4">
            <FilterSection title="General">
              <Input
                value={filters.search}
                onChange={(event) =>
                  onFiltersChange({ ...filters, search: event.target.value })
                }
                placeholder="Search player name..."
              />

              <SliderField
                label="Age"
                valueLabel={`Up to ${filters.maxAge}`}
                min={16}
                max={maxAgeValue}
                value={filters.maxAge}
                onChange={(value) => onFiltersChange({ ...filters, maxAge: value })}
              />

              <SliderField
                label="Height"
                valueLabel={`Up to ${filters.maxHeight} cm`}
                min={150}
                max={maxHeightValue}
                value={filters.maxHeight}
                onChange={(value) => onFiltersChange({ ...filters, maxHeight: value })}
              />

              <SelectField
                value={filters.position}
                onChange={(value) => onFiltersChange({ ...filters, position: value })}
                label="Position"
                options={positionOptions}
              />
              <SelectField
                value={filters.nationality}
                onChange={(value) => onFiltersChange({ ...filters, nationality: value })}
                label="Nationality"
                options={nationalityOptions}
              />
              <SelectField
                value={filters.country}
                onChange={(value) => onFiltersChange({ ...filters, country: value })}
                label="Country"
                options={countryOptions}
              />
              <SelectField
                value={filters.league}
                onChange={(value) => onFiltersChange({ ...filters, league: value })}
                label="League"
                options={leagueOptions}
              />
              <SelectField
                value={filters.transferStatus}
                onChange={(value) => onFiltersChange({ ...filters, transferStatus: value })}
                label="Status"
                options={transferStatusOptions}
              />
              <SelectField
                value={filters.preferredFoot}
                onChange={(value) => onFiltersChange({ ...filters, preferredFoot: value })}
                label="Foot"
                options={preferredFootOptions}
              />
            </FilterSection>

            <FilterSection title="Performance">
              <SliderField
                label="Minimum Goals"
                valueLabel={`${filters.minimumGoals}`}
                min={0}
                max={Math.max(10, filters.minimumGoals, 20)}
                value={filters.minimumGoals}
                onChange={(value) => onFiltersChange({ ...filters, minimumGoals: value })}
              />
              <SliderField
                label="Minimum Assists"
                valueLabel={`${filters.minimumAssists}`}
                min={0}
                max={Math.max(10, filters.minimumAssists, 20)}
                value={filters.minimumAssists}
                onChange={(value) => onFiltersChange({ ...filters, minimumAssists: value })}
              />
              <SliderField
                label="Minimum Pass Accuracy"
                valueLabel={`${filters.minimumPassAccuracy}%`}
                min={0}
                max={100}
                value={filters.minimumPassAccuracy}
                onChange={(value) =>
                  onFiltersChange({ ...filters, minimumPassAccuracy: value })
                }
              />
              <SliderField
                label="Minimum Tackles / 90"
                valueLabel={filters.minimumTacklesPer90.toFixed(1)}
                min={0}
                max={Math.max(5, Math.ceil(filters.minimumTacklesPer90), 10)}
                step={0.5}
                value={filters.minimumTacklesPer90}
                onChange={(value) =>
                  onFiltersChange({ ...filters, minimumTacklesPer90: value })
                }
              />
              <SliderField
                label="Minimum Interceptions / 90"
                valueLabel={filters.minimumInterceptionsPer90.toFixed(1)}
                min={0}
                max={Math.max(5, Math.ceil(filters.minimumInterceptionsPer90), 10)}
                step={0.5}
                value={filters.minimumInterceptionsPer90}
                onChange={(value) =>
                  onFiltersChange({ ...filters, minimumInterceptionsPer90: value })
                }
              />
            </FilterSection>

            <FilterSection title="Identity">
              <TokenSelector
                options={traitOptions}
                selected={filters.traits}
                onToggle={(nextTraits) => onFiltersChange({ ...filters, traits: nextTraits })}
              />
              <TokenSelector
                options={playstyleOptions}
                selected={filters.playstyles}
                onToggle={(nextPlaystyles) =>
                  onFiltersChange({ ...filters, playstyles: nextPlaystyles })
                }
              />
            </FilterSection>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SelectField({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <div className="flex min-w-0 items-center gap-1.5 text-xs">
          <span className="shrink-0 uppercase tracking-[0.16em] text-zinc-500">
            {label}:
          </span>
          <SelectValue placeholder="All" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SliderField({
  label,
  valueLabel,
  min,
  max,
  step = 1,
  value,
  onChange,
}: {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-zinc-500">{label}</span>
        <span className="font-medium text-zinc-300">{valueLabel}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none bg-zinc-800 accent-[var(--accent)]"
      />
    </div>
  );
}

function TokenSelector({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (nextValues: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = selected.includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() =>
              onToggle(
                active
                  ? selected.filter((value) => value !== option)
                  : [...selected, option]
              )
            }
            className={`border px-2 py-1 text-[9px] font-medium uppercase tracking-[0.14em] transition-colors ${
              active
                ? "accent-border-soft accent-bg-soft accent-text"
                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
