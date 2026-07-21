"use client";

import type { PlayerSummary } from "@/types/player";
import type { DashboardStats } from "@/lib/supabase/types";

export type CanvasEditorRecord = {
  id: string;
  user_id: string;
  title: string | null;
  status: string | null;
  temp_storage_path: string | null;
  export_storage_path: string | null;
  thumbnail_path: string | null;
  canvas_json: string | null;
  canvas_width: number | null;
  canvas_height: number | null;
  created_at: string | null;
  updated_at: string | null;
  exported_at: string | null;
};

export type CanvasAssetCategory =
  | "upload"
  | "templates"
  | "backgrounds"
  | "frames"
  | "logos"
  | "icons"
  | "text"
  | "football-data";

export type CanvasLibraryAsset = {
  name: string;
  path: string;
  url: string;
  category: Exclude<CanvasAssetCategory, "upload" | "text" | "football-data">;
  createdAt: string | null;
};

export type FootballDataBundle = {
  dashboard: DashboardStats | null;
  players: PlayerSummary[];
};
