export interface Player {
  id: number;

  // Identity
  display_name: string;
  firstname?: string | null;
  lastname?: string | null;
  common_name?: string | null;

  // Team
  team_id: number;
  team_name?: string | null;

  // Appearance
  image_path?: string | null;
  jersey_number?: number | null;

  // Info
  position: "Goalkeeper" | "Defender" | "Midfielder" | "Attacker" | string;
  age?: number | null;
  date_of_birth?: string | null;

  country?: string | null;
  nationality?: string | null;

  // Contract
  height?: number | null;
  weight?: number | null;
  foot?: string | null;

  // Season
  season_id?: number | null;
  season_name?: string | null;

  // Stats
  appearances: number;
  minutes_played: number;

  goals: number;
  assists: number;

  rating?: number | null;

  yellow_cards: number;
  red_cards: number;
}

export interface PlayerSummary {
  player_id: number;

  display_name: string;
  height: number;
  date_of_birth: string | null;
  image_path: string | null;

  team_name: string | null;
  team_image_path: string | null;

  prefer_foot: string | null;
  position_name: string | null;

  goals: number;
  assists: number;

  passes: number;
  successful_passes: number;
  pass_accuracy: number | null;

  tackles: number;
  tackles_won: number;

  interceptions: number;
  successful_interceptions: number;
}