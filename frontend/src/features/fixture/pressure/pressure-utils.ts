import type { FixturePressure } from "@/types/fixture";

export interface PressureTimelinePoint {
  minute: number;
  homePressure: number;
  awayPressure: number;
  homePressureDisplay: number;
  awayPressureDisplay: number;
  events: PressureEventMarker[];
}

export interface PressureEventMarker {
  id: string;
  minute: number;
  eventMinuteLabel: string;
  participantId: number;
  teamName: string;
  teamImagePath: string | null;
  pressure: number;
  mirroredPressure: number;
  stackIndex: number;
  code: string;
  name: string;
  playerId: number | null;
  relatedPlayerId: number | null;
}

export function buildPressureTimelineData(
  pressures: FixturePressure[],
  homeParticipantId: number | null | undefined,
  awayParticipantId: number | null | undefined
): PressureTimelinePoint[] {
  const minuteMap = new Map<number, PressureTimelinePoint>();
  const eventCounts = new Map<string, number>();

  for (const entry of pressures) {
    const minute = normalizeMinute(entry.minute);
    const isHome = entry.participant_id === homeParticipantId;
    const isAway = entry.participant_id === awayParticipantId;

    if (!isHome && !isAway) {
      continue;
    }

    const existing = minuteMap.get(minute) ?? {
      minute,
      homePressure: 0,
      awayPressure: 0,
      homePressureDisplay: 0,
      awayPressureDisplay: 0,
      events: [],
    };

    const rawPressure = normalizePressure(entry.pressure);

    if (isHome) {
      existing.homePressure = rawPressure;
      existing.homePressureDisplay = rawPressure;
    }

    if (isAway) {
      existing.awayPressure = -rawPressure;
      existing.awayPressureDisplay = rawPressure;
    }

    for (const event of entry.events ?? []) {
      const stackKey = `${entry.participant_id}-${minute}`;
      const stackIndex = eventCounts.get(stackKey) ?? 0;
      eventCounts.set(stackKey, stackIndex + 1);

      existing.events.push({
        id: `${entry.participant_id}-${minute}-${event.event_id}-${stackIndex}`,
        minute,
        eventMinuteLabel:
          event.extra_minute && event.extra_minute > 0
            ? `${minute}+${event.extra_minute}'`
            : `${minute}'`,
        participantId: entry.participant_id,
        teamName: entry.team_name,
        teamImagePath: entry.image_path ?? null,
        pressure: rawPressure,
        mirroredPressure: isHome ? rawPressure : -rawPressure,
        stackIndex,
        code: String(event.code ?? "default"),
        name: String(event.name ?? "Event"),
        playerId: event.player_id ?? null,
        relatedPlayerId: event.related_player_id ?? null,
      });
    }

    minuteMap.set(minute, existing);
  }

  const maxMinute = Math.max(
    90,
    ...Array.from(minuteMap.keys(), (minute) => normalizeMinute(minute))
  );

  for (let minute = 0; minute <= maxMinute; minute += 1) {
    if (!minuteMap.has(minute)) {
      minuteMap.set(minute, {
        minute,
        homePressure: 0,
        awayPressure: 0,
        homePressureDisplay: 0,
        awayPressureDisplay: 0,
        events: [],
      });
    }
  }

  return Array.from(minuteMap.values()).sort((left, right) => left.minute - right.minute);
}

export function normalizePressure(value: number | null | undefined) {
  const numericValue = typeof value === "number" ? value : 0;
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function normalizeMinute(value: number | null | undefined) {
  const numericValue = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.floor(numericValue));
}
