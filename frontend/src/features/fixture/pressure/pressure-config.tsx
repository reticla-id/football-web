"use client";

import {
  AlertCircle,
  ArrowLeftRight,
  BadgeMinus,
  CircleDot,
  CornerDownRight,
  Flag,
  Goal,
  OctagonAlert,
  ShieldAlert,
  ShieldOff,
  Siren,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { TIMELINE_EVENT_CONFIG } from "@/features/fixture/timeline/timeline-config";

export type PressureEventTone =
  | "home"
  | "away"
  | "warning"
  | "danger"
  | "muted"
  | "neutral";

export interface PressureEventConfig {
  icon: LucideIcon;
  tone: PressureEventTone;
}

export const PRESSURE_EVENT_CONFIG: Record<string, PressureEventConfig> = {
  ...Object.fromEntries(
    Object.entries(TIMELINE_EVENT_CONFIG).map(([code, config]) => [
      code,
      {
        icon: config.icon,
        tone:
          config.tone === "accent"
            ? "home"
            : config.tone === "danger"
              ? "danger"
              : config.tone === "warning"
                ? "warning"
                : config.tone === "muted"
                  ? "muted"
                  : "neutral",
      } satisfies PressureEventConfig,
    ])
  ),
  shot: { icon: CircleDot, tone: "neutral" },
  "shot-on-target": { icon: Target, tone: "home" },
  "saved-shot": { icon: ShieldOff, tone: "away" },
  corner: { icon: CornerDownRight, tone: "muted" },
  substitution: { icon: ArrowLeftRight, tone: "muted" },
  yellowcard: { icon: BadgeMinus, tone: "warning" },
  redcard: { icon: OctagonAlert, tone: "danger" },
  "second-yellowcard": { icon: ShieldAlert, tone: "danger" },
  goal: { icon: Goal, tone: "home" },
  "own-goal": { icon: Goal, tone: "danger" },
  "penalty-goal": { icon: Goal, tone: "home" },
  "penalty-missed": { icon: AlertCircle, tone: "warning" },
  var: { icon: Siren, tone: "neutral" },
  offsides: { icon: Flag, tone: "muted" },
  default: { icon: CircleDot, tone: "neutral" },
};

export const PRESSURE_TONE_CLASSNAME: Record<PressureEventTone, string> = {
  home: "text-sky-300",
  away: "text-rose-300",
  warning: "text-amber-300",
  danger: "text-rose-300",
  muted: "text-zinc-400",
  neutral: "text-zinc-200",
};

export function resolvePressureEventConfig(code: string, name: string) {
  const normalizedCode = normalizePressureEventKey(code);
  const normalizedName = normalizePressureEventKey(name);

  return (
    PRESSURE_EVENT_CONFIG[normalizedCode] ??
    PRESSURE_EVENT_CONFIG[normalizedName] ??
    PRESSURE_EVENT_CONFIG.default
  );
}

function normalizePressureEventKey(value: string | null | undefined) {
  return String(value ?? "default")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
