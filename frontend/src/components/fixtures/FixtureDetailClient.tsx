"use client";

import { useMemo, useState } from "react";
import { Clock3, MapPin, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import FixtureStatistics from "@/features/fixture/statistics/FixtureStatistics";
import FixtureTimeline from "@/features/fixture/timeline/FixtureTimeline";
import type { FixtureLeagueDirectory } from "@/lib/supabase/types";
import type {
  FixtureLineupPlayer,
  FixtureLineups,
  FixtureLineupTeam,
  FixtureStatistic,
  TeamFixture,
} from "@/types/fixture";

import FixtureTabs, { type FixtureTab } from "./FixtureTabs";

interface Props {
  league: FixtureLeagueDirectory;
  fixture: TeamFixture;
  lineups?: FixtureLineups | null;
  statistics: FixtureStatistic[];
}

export default function FixtureDetailClient({ league, fixture, lineups, statistics }: Props) {
  const [tab, setTab] = useState<FixtureTab>("match-facts");
  const kickoff = new Date(fixture.starting_at);
  const hasStarted = kickoff.getTime() <= Date.now();
  const fixtureId = typeof fixture?.id === "number" ? fixture.id : 0;
  const homeName = fixture?.home?.name ?? "Home Team";
  const awayName = fixture?.away?.name ?? "Away Team";
  const homeImage = fixture?.home?.image_path ?? null;
  const awayImage = fixture?.away?.image_path ?? null;
  const homeGoals = fixture?.home?.goals ?? 0;
  const awayGoals = fixture?.away?.goals ?? 0;

  const preparedLineups = useMemo(
    () => buildPreparedLineups(fixture, lineups),
    [fixture, lineups]
  );

  return (
    <>
      <Card className="overflow-hidden border-zinc-800/80 bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--accent)_18%,transparent),_transparent_35%),linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,11,0.94))]">
        <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
          <div className="space-y-2 text-center">
            <p className="accent-text text-xs font-semibold uppercase tracking-[0.32em]">
              Fixture Detail
            </p>
            <h1 className="font-display text-[3rem] leading-[0.92] text-white sm:text-[4rem]">
              {homeName} vs {awayName}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-400">
              <span className="border border-zinc-800 bg-zinc-950/70 px-3 py-1">
                {league.name}
              </span>
              <span className="border border-zinc-800 bg-zinc-950/70 px-3 py-1">
                {league.country ?? "Country unavailable"}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <ParticipantBlock
              name={homeName}
              image={homeImage}
            />

            <div className="border-x border-zinc-800/80 px-8 py-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                {hasStarted ? "Scoreline" : "Kickoff"}
              </p>
              <div className="font-display mt-2 text-[2.8rem] leading-none text-white">
                {hasStarted
                  ? `${homeGoals} - ${awayGoals}`
                  : kickoff.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
              </div>
            </div>

            <ParticipantBlock
              name={awayName}
              image={awayImage}
              align="right"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-400">
            <div className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              <span>
                {kickoff.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{fixture.venue_name ?? "-"}</span>
            </div>
          </div>
        </div>
      </Card>

      <FixtureTabs activeTab={tab} onTabChange={setTab} />

      <section aria-live="polite">
        {tab === "match-facts" ? (
          <FixtureStatistics fixture={fixture} statistics={statistics} />
        ) : null}
        {tab === "timeline" ? (
          <FixtureTimeline fixtureId={fixtureId} fixture={fixture} />
        ) : null}

        {tab === "lineups" ? <LineupsPanel fixture={fixture} lineups={preparedLineups} /> : null}

        <PlaceholderPanel tab={tab} title="Action Maps" active={tab === "action-maps"} />
        <PlaceholderPanel tab={tab} title="Details" active={tab === "details"} />
      </section>
    </>
  );
}

function ParticipantBlock({
  name,
  image,
  align = "left",
}: {
  name: string;
  image: string | null;
  align?: "left" | "right";
}) {
  const isRight = align === "right";

  return (
    <div className={`flex items-center gap-3 ${isRight ? "justify-end" : "justify-start"}`}>
      {isRight ? (
        <>
          <span className="text-right text-sm font-medium text-white">{name}</span>
          <img src={image ?? "/placeholder-club.png"} alt={name} className="h-14 w-14 object-contain" />
        </>
      ) : (
        <>
          <img src={image ?? "/placeholder-club.png"} alt={name} className="h-14 w-14 object-contain" />
          <span className="text-sm font-medium text-white">{name}</span>
        </>
      )}
    </div>
  );
}

function LineupsPanel({
  fixture,
  lineups,
}: {
  fixture: TeamFixture;
  lineups: PreparedFixtureLineups;
}) {
  const hasAnyLineup = lineups.home.players.length > 0 || lineups.away.players.length > 0;
  const homeName = fixture?.home?.name ?? "Home Team";
  const awayName = fixture?.away?.name ?? "Away Team";
  const homeImage = fixture?.home?.image_path ?? null;
  const awayImage = fixture?.away?.image_path ?? null;

  return (
    <div
      id="fixture-panel-lineups"
      role="tabpanel"
      aria-labelledby="fixture-tab-lineups"
      className="grid gap-4 xl:grid-cols-2"
    >
      {!hasAnyLineup ? (
        <div className="xl:col-span-2">
          <EmptyLineupsState />
        </div>
      ) : null}

      {hasAnyLineup ? (
        <>
          <LineupColumn
            side="home"
            fallbackName={homeName}
            fallbackImage={homeImage}
            team={lineups.home.team}
            formation={lineups.home.formation}
            players={lineups.home.players}
          />
          <LineupColumn
            side="away"
            fallbackName={awayName}
            fallbackImage={awayImage}
            team={lineups.away.team}
            formation={lineups.away.formation}
            players={lineups.away.players}
          />
        </>
      ) : null}
    </div>
  );
}

function LineupColumn({
  side,
  fallbackName,
  fallbackImage,
  team,
  formation,
  players,
}: {
  side: "home" | "away";
  fallbackName: string;
  fallbackImage: string | null;
  team: FixtureLineupTeam | null;
  formation: string | null;
  players: FixtureLineupPlayer[];
}) {
  return (
    <Card
      className={`overflow-hidden border-zinc-800/80 bg-zinc-900/70 ${
        side === "home"
          ? "shadow-[inset_2px_0_0_0_color-mix(in_srgb,var(--accent)_55%,transparent)]"
          : "shadow-[inset_-2px_0_0_0_color-mix(in_srgb,var(--accent)_30%,transparent)]"
      }`}
    >
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <img
            src={team?.image_path ?? fallbackImage ?? "/placeholder-club.png"}
            alt={team?.name ?? fallbackName}
            className="h-12 w-12 object-contain"
          />

          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{team?.name ?? fallbackName}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              {formation ?? "Formation unavailable"}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-zinc-800">
        {players.length ? (
          players.map((player) => (
            <LineupPlayerRow key={`${side}-${player.id}-${player.player_id}`} player={player} />
          ))
        ) : (
          <div className="px-5 py-8 text-sm text-zinc-500">
            No lineup data is available for this team yet.
          </div>
        )}
      </div>
    </Card>
  );
}

function LineupPlayerRow({ player }: { player: FixtureLineupPlayer }) {
  const positionLabel = getLineupPositionLabel(player);
  const playerName = player.player.display_name ?? "Player unavailable";

  return (
    <div className="grid grid-cols-[44px_44px_minmax(0,1fr)] items-center gap-3 px-5 py-3 transition-colors duration-200 hover:bg-zinc-900/80">
      <div className="flex h-9 w-9 items-center justify-center border border-zinc-800 bg-zinc-950 text-sm font-semibold text-zinc-200">
        {player.jersey_number ?? "-"}
      </div>

      <img
        src={player.player.image_path ?? "/placeholder-player.png"}
        alt={playerName}
        className="h-11 w-11 rounded-full object-cover"
      />

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">
          {playerName}
        </p>
        <p className="mt-1 truncate text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          {positionLabel}
        </p>
      </div>
    </div>
  );
}

function EmptyLineupsState() {
  return (
    <div className="border border-dashed border-zinc-800 bg-zinc-900/60 px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center border border-zinc-800 bg-zinc-950 text-zinc-400">
        <Users className="h-5 w-5" />
      </div>
      <p className="font-display mt-5 text-[2rem] leading-none text-white">Lineups</p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">
        This fixture does not have lineup data available in `fixture_lineups_view` yet.
      </p>
    </div>
  );
}

function PlaceholderPanel({
  tab,
  title,
  active,
}: {
  tab: FixtureTab;
  title: string;
  active: boolean;
}) {
  if (!active) {
    return null;
  }

  return (
    <div
      id={`fixture-panel-${tab}`}
      role="tabpanel"
      aria-labelledby={`fixture-tab-${tab}`}
      className="border border-dashed border-zinc-800 bg-zinc-900/60 px-6 py-14 text-center"
    >
      <p className="font-display text-[2rem] leading-none text-white">{title}</p>
      <p className="mt-3 text-sm leading-6 text-zinc-500">
        This section is prepared and will be populated in a future data pass.
      </p>
    </div>
  );
}

type PreparedFixtureLineups = {
  home: {
    team: FixtureLineupTeam | null;
    formation: string | null;
    players: FixtureLineupPlayer[];
  };
  away: {
    team: FixtureLineupTeam | null;
    formation: string | null;
    players: FixtureLineupPlayer[];
  };
};

function buildPreparedLineups(
  _fixture: TeamFixture,
  lineups?: FixtureLineups | null
): PreparedFixtureLineups {
  const homePlayers = sortLineupPlayers(lineups?.home_lineups ?? []);
  const awayPlayers = sortLineupPlayers(lineups?.away_lineups ?? []);

  return {
    home: {
      team: lineups?.teams?.home ?? null,
      formation: getFormation(lineups, "home"),
      players: homePlayers,
    },
    away: {
      team: lineups?.teams?.away ?? null,
      formation: getFormation(lineups, "away"),
      players: awayPlayers,
    },
  };
}

function sortLineupPlayers(players: FixtureLineupPlayer[]) {
  return [...players]
    .filter((player): player is FixtureLineupPlayer => Boolean(player))
    .sort((left, right) => {
      const leftPosition = left?.formation_position ?? Number.MAX_SAFE_INTEGER;
      const rightPosition = right?.formation_position ?? Number.MAX_SAFE_INTEGER;

      if (leftPosition !== rightPosition) {
        return leftPosition - rightPosition;
      }

      const leftName = left?.player?.display_name ?? "";
      const rightName = right?.player?.display_name ?? "";

      return leftName.localeCompare(rightName);
    });
}

function getFormation(
  lineups: FixtureLineups | null | undefined,
  side: "home" | "away"
) {
  if (!lineups) {
    return null;
  }

  if (side === "home") {
    return lineups.teams?.home?.formation ?? null;
  }

  return lineups.teams?.away?.formation ?? null;
}

function getLineupPositionLabel(player: FixtureLineupPlayer) {
  return player.position_id != null
    ? `Position ${player.position_id}`
    : "Position unavailable";
}
