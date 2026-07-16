import Link from "next/link";
import { ArrowLeft, Dna } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RadarDnaPage() {
  return (
    <div className="min-h-screen bg-transparent px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:gap-6">
        <Link
          href="/radar"
          className="inline-flex w-fit items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Radar
        </Link>

        <Card className="border-zinc-800/80 bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--accent)_12%,transparent),_transparent_42%),linear-gradient(180deg,rgba(24,24,24,0.96),rgba(10,10,10,0.96))]">
          <CardHeader className="px-6 py-6 sm:px-8 sm:py-8">
            <div className="accent-bg-soft accent-border-soft accent-text flex h-20 w-20 items-center justify-center border">
              <Dna className="h-12 w-12" />
            </div>

            <CardTitle className="mt-6 text-[2.8rem]">DNA</CardTitle>

            <p className="max-w-2xl text-sm leading-7 text-zinc-400">
              This module is prepared for advanced attribute DNA, role fit, strength
              profiling, and similarity analysis.
            </p>
          </CardHeader>

          <CardContent className="px-6 pb-12 pt-0 sm:px-8">
            <div className="border border-dashed border-zinc-800 bg-zinc-950/60 px-6 py-16 text-center">
              <p className="font-display text-[2rem] leading-none text-white">
                DNA Workspace
              </p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                The entry point is ready. The full radar DNA workflow can be connected here
                in the next pass.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
