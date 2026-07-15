import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

import FixtureDetailClient from "@/components/fixtures/FixtureDetailClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getFixtureById,
  getFixtureLeagues,
  getFixtureLineups,
  getFixtureStatistics,
} from "@/lib/supabase/queries";

interface Props {
  params: Promise<{
    slug: string;
    fixtureSlug: string;
  }>;
}

export default async function FixtureDetailPage({ params }: Props) {
  const { slug, fixtureSlug } = await params;
  const leaguesResult = await getFixtureLeagues();

  if (leaguesResult.error) {
    return (
      <FixtureDetailPageShell>
        <StatusCard
          title="Unable to load fixture"
          description={leaguesResult.error}
          tone="error"
        />
      </FixtureDetailPageShell>
    );
  }

  const league = (leaguesResult.data ?? []).find((entry) => entry.slug === slug) ?? null;

  if (!league) {
    return (
      <FixtureDetailPageShell>
        <StatusCard
          title="League not found"
          description="We couldn't find a competition that matches this fixture link."
        />
      </FixtureDetailPageShell>
    );
  }

  const fixtureId = extractFixtureId(fixtureSlug);

  if (!fixtureId) {
    return (
      <FixtureDetailPageShell>
        <StatusCard
          title="Fixture not found"
          description="This fixture link is invalid or incomplete."
        />
      </FixtureDetailPageShell>
    );
  }

  const fixtureResult = await getFixtureById(fixtureId);

  if (fixtureResult.error || !fixtureResult.data) {
    return (
      <FixtureDetailPageShell>
        <StatusCard
          title="Unable to load fixture"
          description={
            fixtureResult.error ??
            "The requested fixture could not be loaded."
          }
          tone="error"
        />
      </FixtureDetailPageShell>
    );
  }

  const lineupsResult = await getFixtureLineups(fixtureId);
  const statisticsResult = await getFixtureStatistics(fixtureId);

  return (
    <FixtureDetailPageShell slug={slug}>
      <FixtureDetailClient
        league={league}
        fixture={fixtureResult.data}
        lineups={lineupsResult.data}
        statistics={statisticsResult.data ?? []}
      />
    </FixtureDetailPageShell>
  );
}

function extractFixtureId(fixtureSlug: string): number | null {
  const trailingSegment = fixtureSlug.split("-").at(-1);
  const parsed = trailingSegment ? Number(trailingSegment) : NaN;

  return Number.isFinite(parsed) ? parsed : null;
}

function FixtureDetailPageShell({
  slug,
  children,
}: {
  slug?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-transparent px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:gap-6">
        <Link
          href={slug ? `/fixtures/${slug}` : "/fixtures"}
          className="inline-flex w-fit items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Fixtures
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
