"use client";

import { useState } from "react";

import type { FixtureSeasonOption } from "@/lib/supabase/types";
import type { TeamFixture } from "@/types/fixture";
import type { SquadPlayer } from "@/types/squad";
import type { Team } from "@/types/team";

import TeamFixtures from "./TeamFixtures";
import TeamHeader from "./TeamHeader";
import TeamOverview from "./TeamOverview";
import TeamSquadTable from "./TeamSquadTable";
import TeamTabs, { type TeamTab } from "./TeamTabs";

interface Props {
  team: Team;
  players: SquadPlayer[];
  fixtures: TeamFixture[];
  fixtureSeasons: FixtureSeasonOption[];
}

export default function TeamDetailClient({
  team,
  players,
  fixtures,
  fixtureSeasons,
}: Props) {
  const [tab, setTab] = useState<TeamTab>("overview");

  return (
    <>
      <TeamHeader team={team} />

      <TeamTabs activeTab={tab} onTabChange={setTab} />

      <section aria-live="polite">
        {tab === "overview" && (
          <TeamOverview team={team} players={players} fixtures={fixtures} />
        )}

        {tab === "squad" && <TeamSquadTable players={players} />}

        {tab === "fixtures" && (
          <TeamFixtures
            teamId={team.id}
            fixtures={fixtures}
            seasons={fixtureSeasons}
          />
        )}
      </section>
    </>
  );
}
