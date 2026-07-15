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