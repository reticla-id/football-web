import {
  CalendarDays,
  Clock3,
  MapPin,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { TeamFixture } from "@/types/fixture";
import type { SquadPlayer } from "@/types/squad";
import type { Team } from "@/types/team";

interface Props {
  team: Team;
  players: SquadPlayer[];
  fixtures: TeamFixture[];
}

export default function TeamOverview({ team, players, fixtures }: Props) {
  const completedFixtures = fixtures.filter(
    (fixture) => Number(fixture.state) === 5
  );
  const recentFixtures = completedFixtures.slice(0, 5);
  const averageAge = players.length
    ? Math.round(
        players.reduce((sum, player) => sum + (player.age ?? 0), 0) / players.length
      )
    : null;
  const squadMinutes = players.reduce(
    (sum, player) => sum + (player.minutes_played ?? 0),
    0
  );

  return (
    <div
      id="team-panel-overview"
      role="tabpanel"
      aria-labelledby="team-tab-overview"
      className="space-y-6"
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewStatCard
          label="Season"
          value={team.season ?? "-"}
          hint="Current campaign"
          icon={<CalendarDays className="accent-text h-5 w-5" />}
        />
        <OverviewStatCard
          label="Founded"
          value={team.founded ? String(team.founded) : "-"}
          hint="Club origin"
          icon={<ShieldCheck className="accent-text h-5 w-5" />}
        />
        <OverviewStatCard
          label="Squad Size"
          value={String(players.length)}
          hint="Registered players"
          icon={<Users className="accent-text h-5 w-5" />}
        />
        <OverviewStatCard
          label="Avg. Age"
          value={averageAge ? String(averageAge) : "-"}
          hint="Squad average"
          icon={<Trophy className="accent-text h-5 w-5" />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="-[24px] border-zinc-800/80 bg-zinc-900/70">
          <CardHeader className="pb-4">
            <CardTitle>Recent Form</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {recentFixtures.length ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {recentFixtures.map((fixture) => {
                    const result = getFixtureResult(team.id, fixture);

                    return (
                      <div
                        key={fixture.id}
                        className={`flex h-11 w-11 items-center justify-center -full border text-sm font-semibold ${result.classes}`}
                        title={`${fixture.home.name} ${fixture.home.goals}-${fixture.away.goals} ${fixture.away.name}`}
                      >
                        {result.label}
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {recentFixtures.slice(0, 2).map((fixture) => (
                    <div
                      key={fixture.id}
                      className="-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3"
                    >
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                        {fixture.league.name}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {fixture.home.name} {fixture.home.goals}-{fixture.away.goals}{" "}
                        {fixture.away.name}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyPanelCopy description="Finished fixtures will appear here as soon as match results are available." />
            )}
          </CardContent>
        </Card>

        <Card className="-[24px] border-zinc-800/80 bg-zinc-900/70">
          <CardHeader className="pb-4">
            <CardTitle>Club Snapshot</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <SnapshotRow
              icon={<Trophy className="accent-text h-4 w-4" />}
              label="League"
              value={team.league ?? "-"}
            />
            <SnapshotRow
              icon={<MapPin className="accent-text h-4 w-4" />}
              label="Stadium"
              value={team.stadium ?? "-"}
            />
            <SnapshotRow
              icon={<Users className="accent-text h-4 w-4" />}
              label="Players"
              value={String(players.length)}
            />
            <SnapshotRow
              icon={<Clock3 className="accent-text h-4 w-4" />}
              label="Squad Minutes"
              value={squadMinutes.toLocaleString()}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function OverviewStatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="-[24px] border-zinc-800/80 bg-zinc-900/70">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {value}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
            {hint}
          </p>
        </div>

        <div className="accent-bg-soft accent-border-soft -2xl border p-3">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function SnapshotRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 -xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="-xl border border-zinc-800 bg-zinc-900 p-2">{icon}</div>
        <span className="text-sm text-zinc-400">{label}</span>
      </div>

      <span className="text-right font-semibold text-white">{value}</span>
    </div>
  );
}

function EmptyPanelCopy({ description }: { description: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center -2xl border border-dashed border-zinc-800 bg-zinc-950/60 px-6 py-8 text-center">
      <p className="max-w-sm text-sm leading-6 text-zinc-500">{description}</p>
    </div>
  );
}

function getFixtureResult(teamId: number, fixture: TeamFixture) {
  if (fixture.home.goals === fixture.away.goals) {
    return {
      label: "D",
      classes: "border-zinc-700 bg-zinc-900 text-zinc-200",
    };
  }

  const isHomeTeam = fixture.home.id === teamId;
  const teamWon = isHomeTeam
    ? fixture.home.winner === true
    : fixture.away.winner === true;

  return teamWon
    ? {
        label: "W",
        classes: "accent-border-soft accent-bg-soft accent-text",
      }
    : {
        label: "L",
        classes: "border-rose-500/30 bg-rose-500/15 text-rose-300",
      };
}
