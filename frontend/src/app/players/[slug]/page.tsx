import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

import PlayerDetailClient from "@/components/players/PlayerDetailClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlayersSummary } from "@/lib/supabase/queries";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PlayerDetailPage({ params }: Props) {
  const { slug } = await params;
  const { data: players, error } = await getPlayersSummary();

  if (error) {
    return (
      <PlayerDetailPageShell>
        <StatusCard
          title="Unable to load player"
          description={error}
          tone="error"
        />
      </PlayerDetailPageShell>
    );
  }

  const player =
    players?.find((entry) => slugify(entry.display_name) === slug) ?? null;

  if (!player) {
    return (
      <PlayerDetailPageShell>
        <StatusCard
          title="Player not found"
          description="We couldn't find a player that matches this profile link."
        />
      </PlayerDetailPageShell>
    );
  }

  return (
    <PlayerDetailPageShell>
      <PlayerDetailClient player={player} />
    </PlayerDetailPageShell>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function PlayerDetailPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:gap-6">
        <Link
          href="/players"
          className="inline-flex w-fit items-center gap-2 -full px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Players
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
    <Card className="-[28px] border-zinc-800/80 bg-zinc-900/70">
      <CardHeader className="pb-2">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center -2xl border ${
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
