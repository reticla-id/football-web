import type { FixtureTimelineEvent, TeamFixture } from "@/types/fixture";

import {
  TIMELINE_EVENT_CONFIG,
  type TimelineEventTone,
} from "./timeline-config";

export type TimelineSide = "home" | "away";

export interface PreparedTimelineEvent {
  id: number;
  minuteLabel: string;
  side: TimelineSide;
  title: string;
  subtitle: string;
  eventCode: string;
  tone: TimelineEventTone;
}

export function buildPreparedTimelineEvents(
  events: FixtureTimelineEvent[],
  fixture: TeamFixture
): PreparedTimelineEvent[] {
  const participantMap = buildParticipantSideMap(events, fixture);

  return events
    .filter((event): event is FixtureTimelineEvent => Boolean(event))
    .map((event, index) => {
      const eventCode = normalizeEventCode(getEventTypeCode(event));
      const config = TIMELINE_EVENT_CONFIG[eventCode] ?? TIMELINE_EVENT_CONFIG.default;

      return {
        id: getEventId(event, index),
        minuteLabel: getEventMinuteLabel(event),
        side: resolveEventSide(event, participantMap),
        title: getEventTitle(event),
        subtitle: getEventSubtitle(event, eventCode),
        eventCode,
        tone: config.tone,
      };
    });
}

export function getTimelineToneClasses(tone: TimelineEventTone) {
  switch (tone) {
    case "accent":
      return {
        icon: "accent-text accent-border-soft accent-bg-soft",
        title: "text-white",
      };
    case "warning":
      return {
        icon: "border-amber-500/30 bg-amber-500/10 text-amber-300",
        title: "text-white",
      };
    case "danger":
      return {
        icon: "border-rose-500/30 bg-rose-500/10 text-rose-300",
        title: "text-white",
      };
    case "muted":
      return {
        icon: "border-zinc-700 bg-zinc-900 text-zinc-300",
        title: "text-white",
      };
    default:
      return {
        icon: "border-zinc-700 bg-zinc-950 text-zinc-300",
        title: "text-white",
      };
  }
}

function resolveEventSide(
  event: FixtureTimelineEvent,
  participantMap: Map<number, TimelineSide>
): TimelineSide {
  const participantId = getParticipantId(event);
  const mappedSide = participantId != null ? participantMap.get(participantId) : undefined;

  if (mappedSide) {
    return mappedSide;
  }

  const section = normalizeSection(event.section);

  if (section === "home") {
    return "home";
  }

  if (section === "away") {
    return "away";
  }

  return "home";
}

function buildParticipantSideMap(events: FixtureTimelineEvent[], fixture: TeamFixture) {
  const participantMap = new Map<number, TimelineSide>();
  const homeParticipantId = getFixtureParticipantId(fixture, "home");
  const awayParticipantId = getFixtureParticipantId(fixture, "away");

  if (homeParticipantId != null) {
    participantMap.set(homeParticipantId, "home");
  }

  if (awayParticipantId != null) {
    participantMap.set(awayParticipantId, "away");
  }

  for (const event of events) {
    const section = normalizeSection(event.section);
    const participantId = getParticipantId(event);

    if (participantId != null && section && !participantMap.has(participantId)) {
      participantMap.set(participantId, section);
    }
  }

  for (const event of events) {
    const participantId = getParticipantId(event);

    if (participantId != null && !participantMap.has(participantId)) {
      const participantName = event.participant?.name?.trim().toLowerCase() ?? "";
      const homeName = fixture.home.name?.trim().toLowerCase() ?? "";
      const awayName = fixture.away.name?.trim().toLowerCase() ?? "";

      if (participantName && participantName === homeName) {
        participantMap.set(participantId, "home");
        continue;
      }

      if (participantName && participantName === awayName) {
        participantMap.set(participantId, "away");
        continue;
      }

      participantMap.set(participantId, homeParticipantId == null ? "home" : "away");
    }
  }

  return participantMap;
}

function getFixtureParticipantId(fixture: TeamFixture, side: TimelineSide) {
  const participant = side === "home" ? fixture.home : fixture.away;

  return typeof participant.id === "number" ? participant.id : null;
}

function normalizeSection(section: string | null) {
  const value = String(section ?? "").toLowerCase();

  if (value === "home" || value === "local") {
    return "home" as const;
  }

  if (value === "away" || value === "visitor") {
    return "away" as const;
  }

  return null;
}

function normalizeEventCode(code: string | null | undefined) {
  const normalized = String(code ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");

  const aliases: Record<string, string> = {
    owngoal: "own-goal",
    "own-goal-goal": "own-goal",
    penalty: "penalty-goal",
    "penalty-goal-scored": "penalty-goal",
    "missed-penalty": "penalty-missed",
    penaltymissed: "penalty-missed",
    "second-yellow": "second-yellowcard",
    secondyellowcard: "second-yellowcard",
  };

  return aliases[normalized] ?? normalized;
}

function getEventTitle(event: FixtureTimelineEvent) {
  return getPlayerName(event) || getEventTypeName(event) || "Match Event";
}

function getEventSubtitle(event: FixtureTimelineEvent, eventCode: string) {
  const relatedPlayer = getRelatedPlayerName(event);
  const typeName = getEventTypeName(event) ?? "Match Event";

  const subtitleFactories: Record<string, () => string> = {
    goal: () => (relatedPlayer ? `Assist: ${relatedPlayer}` : "Goal"),
    "own-goal": () => typeName,
    "penalty-goal": () => "Penalty",
    "penalty-missed": () => "Penalty Missed",
    yellowcard: () => typeName,
    redcard: () => typeName,
    "second-yellowcard": () => typeName,
    substitution: () =>
      relatedPlayer ? `For ${relatedPlayer}` : "Player In",
    var: () => typeName,
  };

  return subtitleFactories[eventCode]?.() ?? typeName;
}

function getEventRecord(event: FixtureTimelineEvent) {
  return event as FixtureTimelineEvent & Record<string, unknown>;
}

function getEventId(event: FixtureTimelineEvent, fallbackIndex: number) {
  const record = getEventRecord(event);
  const value = record.id;

  return typeof value === "number" ? value : fallbackIndex;
}

function getEventMinuteLabel(event: FixtureTimelineEvent) {
  const record = getEventRecord(event);

  if (event.time?.label) {
    return event.time.label;
  }

  if (typeof record.label === "string" && record.label.trim()) {
    return record.label;
  }

  const minute = typeof record.minute === "number" ? record.minute : event.time?.minute;
  const extraMinute =
    typeof record.extra_minute === "number" ? record.extra_minute : event.time?.extra_minute;

  if (typeof minute === "number") {
    return extraMinute != null ? `${minute}+${extraMinute}'` : `${minute}'`;
  }

  return "-";
}

function getEventTypeCode(event: FixtureTimelineEvent) {
  const record = getEventRecord(event);

  if (event.type?.code) {
    return event.type.code;
  }

  if (typeof record.code === "string") {
    return record.code;
  }

  if (typeof record.type_code === "string") {
    return record.type_code;
  }

  return "";
}

function getEventTypeName(event: FixtureTimelineEvent) {
  const record = getEventRecord(event);

  if (event.type?.name) {
    return event.type.name;
  }

  if (typeof record.name === "string" && record.name.trim()) {
    return record.name;
  }

  if (typeof record.type_name === "string" && record.type_name.trim()) {
    return record.type_name;
  }

  return null;
}

function getParticipantId(event: FixtureTimelineEvent) {
  const record = getEventRecord(event);

  if (typeof event.participant?.id === "number") {
    return event.participant.id;
  }

  if (typeof record.participant_id === "number") {
    return record.participant_id;
  }

  return null;
}

function getPlayerName(event: FixtureTimelineEvent) {
  const record = getEventRecord(event);

  if (event.player?.display_name?.trim()) {
    return event.player.display_name.trim();
  }

  if (typeof record.player_name === "string" && record.player_name.trim()) {
    return record.player_name.trim();
  }

  if (typeof record.display_name === "string" && record.display_name.trim()) {
    return record.display_name.trim();
  }

  return null;
}

function getRelatedPlayerName(event: FixtureTimelineEvent) {
  const record = getEventRecord(event);

  if (event.related_player?.display_name?.trim()) {
    return event.related_player.display_name.trim();
  }

  if (typeof record.related_player_name === "string" && record.related_player_name.trim()) {
    return record.related_player_name.trim();
  }

  return null;
}
