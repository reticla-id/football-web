import { TIMELINE_EVENT_CONFIG } from "./timeline-config";
import { getTimelineToneClasses } from "./timeline-utils";

export default function TimelineIcon({
  eventCode,
  tone,
}: {
  eventCode: string;
  tone: Parameters<typeof getTimelineToneClasses>[0];
}) {
  const Icon = (TIMELINE_EVENT_CONFIG[eventCode] ?? TIMELINE_EVENT_CONFIG.default).icon;
  const toneClasses = getTimelineToneClasses(tone);

  return (
    <div className={`flex h-8 w-8 items-center justify-center border ${toneClasses.icon}`}>
      <Icon className="h-4 w-4" />
    </div>
  );
}
