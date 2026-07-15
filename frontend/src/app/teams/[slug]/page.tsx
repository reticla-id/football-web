import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

import TeamDetailClient from "@/components/teams/TeamDetailClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTeamFixtureFilters,
  getTeams,
  getTeamSquad,
  getTeamFixtures,
} from "@/lib/supabase/queries";
import type { Team } from "@/types/team";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function TeamDetailPage({ params }: Props) {
  const { slug } = await params;

  const { data: teams, error: teamsError } = await getTeams();

  if (teamsError) {
    return (
      <TeamDetailPageShell>
        <StatusCard
          title="Unable to load team"
          description={teamsError}
          tone="error"
        />
      </TeamDetailPageShell>
    );
  }

  const team =
    teams?.find((entry: Team) => (entry.slug ?? String(entry.id)) === slug) ??
    null;

  if (!team) {
    return (
      <TeamDetailPageShell>
        <StatusCard
          title="Team not found"
          description="We couldn't find a club that matches this team link."
        />
      </TeamDetailPageShell>
    );
  }

  const [squadResult, fixtureResult, fixtureSeasonsResult] = await Promise.all([
    getTeamSquad(team.id),
    getTeamFixtures(team.id, undefined, 10, 0),
    getTeamFixtureFilters(team.id),
  ]);

  if (squadResult.error || fixtureResult.error || fixtureSeasonsResult.error) {
    return (
      <TeamDetailPageShell>
        <StatusCard
          title="Unable to load team details"
          description={
            squadResult.error ??
            fixtureResult.error ??
            fixtureSeasonsResult.error ??
            "An unexpected error occurred while loading the team page."
          }
          tone="error"
        />
      </TeamDetailPageShell>
    );
  }

  return (
    <TeamDetailPageShell>
      <TeamDetailClient
        team={team}
        players={squadResult.data ?? []}
        fixtures={fixtureResult.data ?? []}
        fixtureSeasons={fixtureSeasonsResult.data ?? []}
      />
    </TeamDetailPageShell>
  );
}

function TeamDetailPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:gap-6">
        <Link
          href="/teams"
          className="inline-flex w-fit items-center gap-2 -full px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Link>

        {children}
      </div>
    </div>
  );
}

function StatusCard({
  title,
  description,
  tone = "neutral",
}: {
  title: string;
  description: string;
  tone?: "neutral" | "error";
}) {
  return (
    <Card className="border-zinc-800/80 bg-zinc-900/70">
      <CardHeader className="pb-2">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center border ${
            tone === "error"
              ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
              : "border-zinc-800 bg-zinc-900 text-zinc-300"
          }`}
        >
          <AlertCircle className="h-5 w-5" />
        </div>

        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="max-w-xl text-sm leading-6 text-zinc-400">{description}</p>
      </CardContent>
    </Card>
  );
}
