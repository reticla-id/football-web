"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import FilterSection from "./FilterSection";

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

interface Props {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
  minAvailableAge: number;
  maxAvailableAge: number;
  minAvailableHeight: number;
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
  minAvailableAge,
  maxAvailableAge,
  minAvailableHeight,
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
  const safeMinAge = Math.max(16, minAvailableAge);
  const safeMaxAge = Math.max(maxAvailableAge, safeMinAge);
  const safeMinHeight = Math.max(120, minAvailableHeight);
  const safeMaxHeight = Math.max(maxAvailableHeight, safeMinHeight);

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
              onClick={() =>
                onFiltersChange({
                  ...defaultFilters,
                  minAge: safeMinAge,
                  maxAge: safeMaxAge,
                  minHeight: safeMinHeight,
                  maxHeight: safeMaxHeight,
                })
              }
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

              <RangeField
                label="Age"
                minValue={filters.minAge}
                maxValue={filters.maxAge}
                min={safeMinAge}
                max={safeMaxAge}
                suffix=""
                onMinChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    minAge: Math.min(value, filters.maxAge),
                  })
                }
                onMaxChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    maxAge: Math.max(value, filters.minAge),
                  })
                }
              />

              <RangeField
                label="Height"
                minValue={filters.minHeight}
                maxValue={filters.maxHeight}
                min={safeMinHeight}
                max={safeMaxHeight}
                suffix=" cm"
                onMinChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    minHeight: Math.min(value, filters.maxHeight),
                  })
                }
                onMaxChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    maxHeight: Math.max(value, filters.minHeight),
                  })
                }
              />

              <MultiSelectField
                label="Position"
                values={filters.position}
                onChange={(value) => onFiltersChange({ ...filters, position: value })}
                options={positionOptions}
              />
              <MultiSelectField
                label="Nationality"
                values={filters.nationality}
                onChange={(value) => onFiltersChange({ ...filters, nationality: value })}
                options={nationalityOptions}
              />
              <MultiSelectField
                label="Country"
                values={filters.country}
                onChange={(value) => onFiltersChange({ ...filters, country: value })}
                options={countryOptions}
              />
              <MultiSelectField
                label="League"
                values={filters.league}
                onChange={(value) => onFiltersChange({ ...filters, league: value })}
                options={leagueOptions}
              />
              <MultiSelectField
                label="Status"
                values={filters.transferStatus}
                onChange={(value) =>
                  onFiltersChange({ ...filters, transferStatus: value })
                }
                options={transferStatusOptions}
              />
              <MultiSelectField
                label="Foot"
                values={filters.preferredFoot}
                onChange={(value) =>
                  onFiltersChange({ ...filters, preferredFoot: value })
                }
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
                onChange={(value) =>
                  onFiltersChange({ ...filters, minimumAssists: value })
                }
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
              <SliderField
                label="Minimum Saves / 90"
                valueLabel={filters.minimumSavesPer90.toFixed(1)}
                min={0}
                max={Math.max(5, Math.ceil(filters.minimumSavesPer90), 10)}
                step={0.5}
                value={filters.minimumSavesPer90}
                onChange={(value) =>
                  onFiltersChange({ ...filters, minimumSavesPer90: value })
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

function MultiSelectField({
  label,
  values,
  onChange,
  options,
}: {
  label: string;
  values: string[];
  onChange: (value: string[]) => void;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const cleanOptions = options.filter(Boolean);
  const summary =
    values.length === 0
      ? "All"
      : values.length === 1
        ? values[0]
        : `${values.length} selected`;

  const toggleValue = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((value) => value !== option));
      return;
    }

    onChange([...values, option]);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="focus-accent flex h-11 w-full items-center justify-between border border-zinc-800 bg-zinc-950/75 px-4 text-left text-sm text-zinc-200 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-900"
      >
        <div className="flex min-w-0 items-center gap-1.5 text-xs">
          <span className="shrink-0 uppercase tracking-[0.16em] text-zinc-500">
            {label}:
          </span>
          <span className="truncate">{summary}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-zinc-500 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 border border-zinc-800 bg-zinc-950/98 p-1 shadow-[0_22px_60px_rgba(0,0,0,0.4)]">
          <button
            type="button"
            onClick={() => onChange([])}
            className={cn(
              "flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-zinc-900 hover:text-white",
              values.length === 0 && "accent-bg-soft accent-text"
            )}
          >
            <span>All</span>
            {values.length === 0 ? <Check className="h-4 w-4" /> : null}
          </button>

          {cleanOptions.map((option) => {
            const active = values.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleValue(option)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-zinc-900 hover:text-white",
                  active && "accent-bg-soft accent-text"
                )}
              >
                <span>{option}</span>
                {active ? <Check className="h-4 w-4" /> : null}
              </button>
            );
          })}

          <div className="flex items-center justify-end border-t border-zinc-800 px-2 pb-1 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-white"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RangeField({
  label,
  minValue,
  maxValue,
  min,
  max,
  suffix,
  onMinChange,
  onMaxChange,
}: {
  label: string;
  minValue: number;
  maxValue: number;
  min: number;
  max: number;
  suffix: string;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-zinc-500">{label}</span>
        {/* <span className="font-medium text-zinc-300">
          {minValue}
          {suffix} - {maxValue}
          {suffix}
        </span> */}
      </div>

      <SliderField
        label="Min"
        valueLabel={`${minValue}${suffix}`}
        min={min}
        max={max}
        value={minValue}
        onChange={onMinChange}
      />

      <SliderField
        label="Max"
        valueLabel={`${maxValue}${suffix}`}
        min={min}
        max={max}
        value={maxValue}
        onChange={onMaxChange}
      />
    </div>
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
        style={{ accentColor: "var(--accent)" }}
        className="radar-accent-slider h-2 w-full cursor-pointer appearance-none bg-zinc-800 accent-[var(--accent)]"
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
    <div className="flex flex-wrap gap-1">
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
            className={cn(
              "border px-1.5 py-0.5 text-[7px] leading-none font-medium uppercase tracking-[0.12em] transition-colors",
              active
                ? "accent-border-soft accent-bg-soft accent-text"
                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
