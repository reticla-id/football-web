import type { FixtureStatistic, TeamFixture } from "@/types/fixture";

import PossessionRow from "./PossessionRow";
import StatisticsGroup from "./StatisticsGroup";
import StatisticsSection from "./StatisticsSection";
import StatisticsSectionHeader from "./StatisticsSectionHeader";
import {
  buildStatisticsGroups,
  getFixtureTeamDisplay,
  getHeroStatistic,
  getStandardGroups,
} from "./statistic-utils";

export default function FixtureStatistics({
  fixture,
  statistics,
}: {
  fixture: TeamFixture;
  statistics: FixtureStatistic[];
}) {
  const groups = buildStatisticsGroups(statistics);
  const heroStatistic = getHeroStatistic(groups);
  const standardGroups = getStandardGroups(groups);
  const homeTeam = getFixtureTeamDisplay(fixture, "home");
  const awayTeam = getFixtureTeamDisplay(fixture, "away");

  return (
    <div
      id="fixture-panel-match-facts"
      role="tabpanel"
      aria-labelledby="fixture-tab-match-facts"
      className="space-y-4"
    >
      <StatisticsSection>
        <StatisticsSectionHeader title="Statistics" />

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-b border-zinc-800 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={homeTeam.image ?? "/placeholder-club.png"}
              alt={homeTeam.name}
              className="h-11 w-11 shrink-0 object-contain"
            />
            <p className="truncate text-sm font-semibold text-white">{homeTeam.name}</p>
          </div>

          <div className="px-2 text-center text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Comparison
          </div>

          <div className="flex min-w-0 items-center justify-end gap-3">
            <p className="truncate text-right text-sm font-semibold text-white">{awayTeam.name}</p>
            <img
              src={awayTeam.image ?? "/placeholder-club.png"}
              alt={awayTeam.name}
              className="h-11 w-11 shrink-0 object-contain"
            />
          </div>
        </div>

        {heroStatistic ? <PossessionRow item={heroStatistic} /> : null}
      </StatisticsSection>

      {standardGroups.length ? (
        standardGroups.map((group) => (
          <StatisticsGroup key={group.section} group={group} />
        ))
      ) : (
        <StatisticsSection>
          <div className="px-6 py-14 text-center">
            <p className="font-display text-[2rem] leading-none text-white">Statistics</p>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              No configured fixture statistics are available for this match yet.
            </p>
          </div>
        </StatisticsSection>
      )}
    </div>
  );
}
