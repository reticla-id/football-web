import type { FixtureStatistic, TeamFixture } from "@/types/fixture";

import {
  STATISTIC_CONFIG,
  STATISTIC_SECTION_ORDER,
  type StatisticConfigItem,
  type StatisticDisplayType,
  type StatisticSectionName,
} from "./statistic-config";

export interface PreparedStatisticItem extends StatisticConfigItem {
  homeValue: string | number | null;
  awayValue: string | number | null;
  homeDisplay: string;
  awayDisplay: string;
  comparison: "home" | "away" | "equal" | "none";
  homeNumeric: number | null;
  awayNumeric: number | null;
}

export interface PreparedStatisticsGroup {
  section: StatisticSectionName;
  items: PreparedStatisticItem[];
}

export function buildStatisticsGroups(
  statistics: FixtureStatistic[]
): PreparedStatisticsGroup[] {
  const statisticsMap = new Map(statistics.map((item) => [item.code, item]));

  return STATISTIC_SECTION_ORDER.map((section) => {
    const items = STATISTIC_CONFIG
      .filter((config) => config.section === section)
      .map((config) => buildPreparedStatisticItem(config, statisticsMap.get(config.code)))
      .filter((item): item is PreparedStatisticItem => item !== null);

    return {
      section,
      items,
    };
  }).filter((group) => group.items.length > 0);
}

export function getHeroStatistic(groups: PreparedStatisticsGroup[]) {
  return groups
    .flatMap((group) => group.items)
    .find((item) => item.displayType === "hero") ?? null;
}

export function getStandardGroups(groups: PreparedStatisticsGroup[]) {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.displayType !== "hero"),
    }))
    .filter((group) => group.items.length > 0);
}

export function getComparisonTone(
  comparison: PreparedStatisticItem["comparison"],
  side: "home" | "away"
) {
  if (comparison === "equal" || comparison === "none") {
    return "text-zinc-300";
  }

  if (comparison === side) {
    return "accent-text";
  }

  return "text-zinc-500";
}

export function getPossessionWidths(item: PreparedStatisticItem) {
  const home = item.homeNumeric ?? 0;
  const away = item.awayNumeric ?? 0;
  const total = home + away;

  if (total <= 0) {
    return { homeWidth: 50, awayWidth: 50 };
  }

  return {
    homeWidth: (home / total) * 100,
    awayWidth: (away / total) * 100,
  };
}

export function getFixtureTeamDisplay(fixture: TeamFixture, side: "home" | "away") {
  return side === "home"
    ? { name: fixture.home.name, image: fixture.home.image_path }
    : { name: fixture.away.name, image: fixture.away.image_path };
}

function buildPreparedStatisticItem(
  config: StatisticConfigItem,
  statistic?: FixtureStatistic
): PreparedStatisticItem | null {
  const homeValue = statistic?.home ?? null;
  const awayValue = statistic?.away ?? null;

  if (homeValue == null && awayValue == null) {
    return null;
  }

  const homeNumeric = parseNumericValue(homeValue);
  const awayNumeric = parseNumericValue(awayValue);

  return {
    ...config,
    homeValue,
    awayValue,
    homeDisplay: formatStatisticValue(homeValue, config.displayType),
    awayDisplay: formatStatisticValue(awayValue, config.displayType),
    comparison: getComparison(homeNumeric, awayNumeric),
    homeNumeric,
    awayNumeric,
  };
}

function parseNumericValue(value: string | number | null) {
  if (value == null) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const normalized = value.replace("%", "").trim();
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatStatisticValue(
  value: string | number | null,
  displayType: StatisticDisplayType
) {
  if (value == null || value === "") {
    return "-";
  }

  if (displayType === "percentage") {
    const numeric = parseNumericValue(value);
    return numeric == null ? "-" : `${numeric}%`;
  }

  if (displayType === "hero") {
    const numeric = parseNumericValue(value);
    return numeric == null ? "-" : `${numeric}%`;
  }

  return String(value);
}

function getComparison(homeValue: number | null, awayValue: number | null) {
  if (homeValue == null || awayValue == null) {
    return "none" as const;
  }

  if (homeValue === awayValue) {
    return "equal" as const;
  }

  return homeValue > awayValue ? "home" as const : "away" as const;
}
