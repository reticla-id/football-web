export type StatisticDisplayType = "hero" | "percentage" | "default";

export type StatisticSectionName =
  | "Overview"
  | "Attack"
  | "Ball Distribution"
  | "Defense"
  | "Discipline";

export interface StatisticConfigItem {
  section: StatisticSectionName;
  code: string;
  label: string;
  displayType: StatisticDisplayType;
}

export const STATISTIC_CONFIG: StatisticConfigItem[] = [
  { section: "Overview", code: "ball-possession", label: "Ball Possession", displayType: "hero" },
  { section: "Overview", code: "corners", label: "Corners", displayType: "default" },
  { section: "Overview", code: "offsides", label: "Offsides", displayType: "default" },
  { section: "Overview", code: "injuries", label: "Injuries", displayType: "default" },

  { section: "Attack", code: "shots-total", label: "Shots", displayType: "default" },
  { section: "Attack", code: "shots-on-target", label: "Shots on Target", displayType: "default" },
  { section: "Attack", code: "shots-off-target", label: "Shots off Target", displayType: "default" },
  { section: "Attack", code: "blocked-shots", label: "Blocked Shots", displayType: "default" },
  { section: "Attack", code: "successful-dribbles", label: "Successful Dribbles", displayType: "default" },

  { section: "Ball Distribution", code: "passes", label: "Passes", displayType: "default" },
  { section: "Ball Distribution", code: "successful-passes", label: "Successful Passes", displayType: "default" },
  { section: "Ball Distribution", code: "successful-passes-percentage", label: "Pass Accuracy", displayType: "percentage" },
  { section: "Ball Distribution", code: "successful-long-passes", label: "Successful Long Passes", displayType: "default" },
  { section: "Ball Distribution", code: "successful-long-passes-percentage", label: "Long Pass Accuracy", displayType: "percentage" },
  { section: "Ball Distribution", code: "key-passes", label: "Key Passes", displayType: "default" },
  { section: "Ball Distribution", code: "total-crosses", label: "Total Crosses", displayType: "default" },
  { section: "Ball Distribution", code: "accurate-crosses", label: "Accurate Crosses", displayType: "default" },

  { section: "Defense", code: "tackles", label: "Tackles", displayType: "default" },
  { section: "Defense", code: "tackles-won", label: "Tackles Won", displayType: "default" },
  { section: "Defense", code: "interceptions", label: "Interceptions", displayType: "default" },
  { section: "Defense", code: "clearances", label: "Clearances", displayType: "default" },
  { section: "Defense", code: "shots_blocked", label: "Shots Blocked", displayType: "default" },
  { section: "Defense", code: "aeriels-won", label: "Aerials Won", displayType: "default" },
  { section: "Defense", code: "saves", label: "Saves", displayType: "default" },

  { section: "Discipline", code: "fouls", label: "Fouls", displayType: "default" },
  { section: "Discipline", code: "yellowcards", label: "Yellow Cards", displayType: "default" },
  { section: "Discipline", code: "redcards", label: "Red Cards", displayType: "default" },
];

export const STATISTIC_SECTION_ORDER: StatisticSectionName[] = [
  "Overview",
  "Attack",
  "Ball Distribution",
  "Defense",
  "Discipline",
];
