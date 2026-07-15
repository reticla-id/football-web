import TimelineItem from "./TimelineItem";
import type { PreparedTimelineEvent } from "./timeline-utils";

export default function Timeline({ events }: { events: PreparedTimelineEvent[] }) {
  return (
    <div className="relative overflow-hidden border border-zinc-800/80 bg-zinc-900/70">
      <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-zinc-800" />

      <div className="divide-y divide-zinc-800">
        {events.map((event) => (
          <TimelineItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
