import type { FixtureBallCoordinate } from "@/types/fixture";

export const PITCH_WIDTH = 68;
export const PITCH_LENGTH = 105;

export interface PitchPoint {
  x: number;
  y: number;
}

export interface HeatmapCircle extends PitchPoint {
  duration: number;
  radius: number;
  opacity: number;
  tone: "cool" | "warm" | "hot";
}

export interface PitchZoneStat {
  id: string;
  label: string;
  seconds: number;
  percentage: number;
  intensity: number;
  center: PitchPoint;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

export function toVerticalPitchPoint(x: number, y: number): PitchPoint {
  const clampedX = clamp(x);
  const clampedY = clamp(y);

  return {
    x: clampedY * PITCH_WIDTH,
    y: PITCH_LENGTH - clampedX * PITCH_LENGTH,
  };
}

export function buildHeatmapCircles(points: FixtureBallCoordinate[]): HeatmapCircle[] {
  const safePoints = points.filter(
    (point) =>
      Number.isFinite(point.x) &&
      Number.isFinite(point.y) &&
      Number.isFinite(point.duration_seconds) &&
      point.duration_seconds > 0
  );

  const maxDuration = safePoints.length
    ? Math.max(...safePoints.map((point) => point.duration_seconds))
    : 1;

  return safePoints.map((point) => {
    const position = toVerticalPitchPoint(point.x, point.y);
    const normalized = point.duration_seconds / maxDuration;

    return {
      ...position,
      duration: point.duration_seconds,
      radius: 2.4 + Math.sqrt(normalized) * 7.6,
      opacity: 0.14 + normalized * 0.42,
      tone: normalized > 0.72 ? "hot" : normalized > 0.38 ? "warm" : "cool",
    };
  });
}

const ZONE_LAYOUT = [
  ["attack-left", "Attack Left"],
  ["attack-center", "Attack Center"],
  ["attack-right", "Attack Right"],
  ["middle-left", "Middle Left"],
  ["middle-center", "Middle Center"],
  ["middle-right", "Middle Right"],
  ["defense-left", "Defense Left"],
  ["defense-center", "Defense Center"],
  ["defense-right", "Defense Right"],
] as const;

export function buildPitchZoneStats(points: FixtureBallCoordinate[]): PitchZoneStat[] {
  const zoneMap = new Map<string, number>(ZONE_LAYOUT.map(([id]) => [id, 0]));
  const totalSeconds = points.reduce((sum, point) => sum + Math.max(point.duration_seconds || 0, 0), 0);

  points.forEach((point) => {
    const clampedX = clamp(point.x);
    const clampedY = clamp(point.y);

    const row = clampedX >= 2 / 3 ? 0 : clampedX >= 1 / 3 ? 1 : 2;
    const column = clampedY < 1 / 3 ? 0 : clampedY < 2 / 3 ? 1 : 2;
    const zoneId = ZONE_LAYOUT[row * 3 + column]?.[0];

    if (!zoneId) {
      return;
    }

    zoneMap.set(zoneId, (zoneMap.get(zoneId) ?? 0) + Math.max(point.duration_seconds || 0, 0));
  });

  const maxSeconds = Math.max(...Array.from(zoneMap.values()), 1);
  const zoneWidth = PITCH_WIDTH / 3;
  const zoneHeight = PITCH_LENGTH / 3;

  return ZONE_LAYOUT.map(([id, label], index) => {
    const row = Math.floor(index / 3);
    const column = index % 3;
    const seconds = zoneMap.get(id) ?? 0;
    const percentage = totalSeconds > 0 ? roundToSingleDecimal((seconds / totalSeconds) * 100) : 0;

    return {
      id,
      label,
      seconds,
      percentage,
      intensity: seconds / maxSeconds,
      center: {
        x: column * zoneWidth + zoneWidth / 2,
        y: row * zoneHeight + zoneHeight / 2,
      },
      rect: {
        x: column * zoneWidth,
        y: row * zoneHeight,
        width: zoneWidth,
        height: zoneHeight,
      },
    };
  });
}
