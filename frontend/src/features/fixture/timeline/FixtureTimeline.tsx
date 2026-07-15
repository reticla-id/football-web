"use client";

import { useEffect, useMemo, useState } from "react";

import { getFixtureTimeline } from "@/lib/supabase/queries";
import type { FixtureTimelineEvent } from "@/types/fixture";

import Timeline from "./Timeline";
import { buildPreparedTimelineEvents } from "./timeline-utils";

export default function FixtureTimeline({ fixtureId }: { fixtureId: number }) {
  const [events, setEvents] = useState<FixtureTimelineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadTimeline = async () => {
      setIsLoading(true);

      const result = await getFixtureTimeline(fixtureId);

      if (!isActive) {
        return;
      }

      if (result.error) {
        setError(result.error);
        setEvents([]);
        setIsLoading(false);
        return;
      }

      setEvents(result.data ?? []);
      setError(null);
      setIsLoading(false);
    };

    void loadTimeline();

    return () => {
      isActive = false;
    };
  }, [fixtureId]);

  const preparedEvents = useMemo(
    () => buildPreparedTimelineEvents(events),
    [events]
  );

  if (isLoading) {
    return <FixtureTimelineSkeleton />;
  }

  if (error) {
    return (
      <div
        id="fixture-panel-timeline"
        role="tabpanel"
        aria-labelledby="fixture-tab-timeline"
        className="border border-zinc-800/80 bg-zinc-900/70 px-6 py-10 text-center"
      >
        <p className="font-display text-[2rem] leading-none text-white">Timeline</p>
        <p className="mt-3 text-sm leading-6 text-rose-300">{error}</p>
      </div>
    );
  }

  if (!preparedEvents.length) {
    return (
      <div
        id="fixture-panel-timeline"
        role="tabpanel"
        aria-labelledby="fixture-tab-timeline"
        className="border border-dashed border-zinc-800 bg-zinc-900/60 px-6 py-14 text-center"
      >
        <p className="font-display text-[2rem] leading-none text-white">Timeline</p>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          No key events are available for this match yet.
        </p>
      </div>
    );
  }

  return (
    <div
      id="fixture-panel-timeline"
      role="tabpanel"
      aria-labelledby="fixture-tab-timeline"
      className="space-y-4"
    >
      <div className="border border-zinc-800/80 bg-zinc-900/70 px-5 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
          Key Events
        </h3>
      </div>

      <Timeline events={preparedEvents} />
    </div>
  );
}

function FixtureTimelineSkeleton() {
  return (
    <div
      id="fixture-panel-timeline"
      role="tabpanel"
      aria-labelledby="fixture-tab-timeline"
      className="space-y-4"
      aria-hidden="true"
    >
      <div className="h-14 animate-pulse border border-zinc-800/80 bg-zinc-900/60" />
      <div className="space-y-0 overflow-hidden border border-zinc-800/80 bg-zinc-900/70">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-[78px] animate-pulse border-b border-zinc-800 bg-zinc-900/50 last:border-b-0"
          />
        ))}
      </div>
    </div>
  );
}
