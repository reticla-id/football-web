import TimelineEvent from "./TimelineEvent";
import TimelineIcon from "./TimelineIcon";
import TimelineMinute from "./TimelineMinute";
import type { PreparedTimelineEvent } from "./timeline-utils";

export default function TimelineItem({ event }: { event: PreparedTimelineEvent }) {
  const eventIcon = <TimelineIcon eventCode={event.eventCode} tone={event.tone} />;

  return (
    <div className="relative grid grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] items-center gap-4 px-4 py-3">
      <div className="flex justify-end">
        {event.side === "home" ? (
          <TimelineEvent
            align="left"
            icon={eventIcon}
            title={event.title}
            subtitle={event.subtitle}
          />
        ) : null}
      </div>

      <TimelineMinute label={event.minuteLabel} />

      <div className="flex justify-start">
        {event.side === "away" ? (
          <TimelineEvent
            align="right"
            icon={eventIcon}
            title={event.title}
            subtitle={event.subtitle}
          />
        ) : null}
      </div>
    </div>
  );
}
