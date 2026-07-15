import {
  AlertCircle,
  ArrowLeftRight,
  BadgeMinus,
  BadgePlus,
  CircleDot,
  Flag,
  Goal,
  OctagonAlert,
  ShieldAlert,
  Siren,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TimelineEventTone = "accent" | "warning" | "danger" | "muted" | "neutral";

export interface TimelineEventConfig {
  icon: LucideIcon;
  tone: TimelineEventTone;
}

export const TIMELINE_EVENT_CONFIG: Record<string, TimelineEventConfig> = {
  goal: { icon: Goal, tone: "accent" },
  "own-goal": { icon: Goal, tone: "danger" },
  "penalty-goal": { icon: Goal, tone: "accent" },
  "penalty-missed": { icon: AlertCircle, tone: "warning" },
  yellowcard: { icon: BadgeMinus, tone: "warning" },
  redcard: { icon: OctagonAlert, tone: "danger" },
  "second-yellowcard": { icon: ShieldAlert, tone: "danger" },
  substitution: { icon: ArrowLeftRight, tone: "muted" },
  var: { icon: Siren, tone: "neutral" },
  offsides: { icon: Flag, tone: "muted" },
  default: { icon: CircleDot, tone: "neutral" },
};
