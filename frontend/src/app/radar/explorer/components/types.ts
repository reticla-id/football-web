import type { PlayerSummary } from "@/types/player";

export type ExplorerPlayer = PlayerSummary & {
  slug: string;
  age: number | null;
  heightValue: number | null;
  appearances: number | null;
  positionLabel: string;
  clubName: string;
  clubLogo: string | null;
  nationality: string | null;
  country: string | null;
  league: string | null;
  transferStatus: string | null;
  passAccuracyValue: number;
  tacklesPer90: number;
  interceptionsPer90: number;
  savesPer90: number;
  traits: string[];
  playstyles: string[];
};

export type ExplorerSortColumn =
  | "display_name"
  | "age"
  | "height"
  | "prefer_foot"
  | "appearances"
  | "goals"
  | "assists";

export type ExplorerSortDirection = "asc" | "desc" | null;

export type ExplorerSortState = {
  column: ExplorerSortColumn | null;
  direction: ExplorerSortDirection;
};
