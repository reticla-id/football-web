export interface UserProfile {
  id: string;
  auth_id: string;
  email: string;
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
  username?: string | null;
}

export interface Team {
  id: number;
  name: string;
  slug?: string;
  short_code?: string | null;
  country?: string | null;
  league?: string | null;
  season?: string | null;
  logo?: string | null;
  founded?: number | null;
  stadium?: string | null;
}

export interface Player {
  id: number;
  name: string;
  slug?: string;
  nationality?: string | null;
  position?: string | null;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  club?: string | null;
  club_image_path?: string | null;
  season?: string | null;
  league?: string | null;
  number?: number | null;
  avatar?: string | null;
}

export interface Fixture {

    id:number;
    starting_at:string;
    state_id:number;
    round_name: string;

    league:{
        id:number;
        name:string;
        image_path:string;
    };

    home:{
        id:number;
        name:string;
        short_code: string;
        image_path:string;
        winner:boolean;
        goals:number;
    };

    away:{
        id:number;
        name:string;
        short_code: string;
        image_path:string;
        winner:boolean;
        goals:number;
    };

}

export interface FixtureLeagueDirectory {
  id: number;
  name: string;
  slug: string;
  country: string | null;
  logo: string | null;
}

export interface FixtureClubOption {
  id: number;
  name: string;
  image_path: string | null;
}

export interface FixtureSeasonOption {
  id: number;
  name: string;
}

export interface FixtureRoundOption{
  round_id: number;
  round_name: number;
}

export interface StandingRow {
  position: number;
  team: string;
  leagueId?: number;
  seasonId?: number;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor?: number;
  goalsAgainst?: number;
  points: number;
  result: string;
  image_path: string;
  form?: string;
  league?: string;
  season?: string;
}

export interface LeagueStats {
  seasonId: number;
  season: string;
  leagueId: number;
  league: string;
  totalTeams: number;
  totalMatches: number;
  totalGoals: number;
  avgGoalsPerMatch: number;
}

export interface DashboardStats {
  standings: StandingRow[];
  topScorers: Array<{ player: string; position?: string; team: string; goals: number; image_path: string, team_image_path: string; season?: string; league?: string; }>;
  topAssists: Array<{ player: string; position?: string; team: string; assists: number; image_path: string, team_image_path: string; season?: string; league?: string;  }>;
  topRedcards: Array<{ player: string; position?: string; team: string; redcards: number; image_path: string, team_image_path: string; season?: string; league?: string;  }>;
  recentFixtures: Fixture[];
  upcomingFixtures: Fixture[];
  leagueStats: LeagueStats[];
}

export interface InsertShortlistCollection {
  user_id: string;
  name: string;
  description?: string | null;
}

export interface ShortlistCollection {
  id: number;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface ShortlistPlayer {
  id: number;
  shortlist_id: number;
  player_id: number;
  created_at: string;
}

export interface ClubSeasonSummary {
  season_id: number;
  season_name: string;

  league_id: number;
  league_name: string;

  team_id: number;
  team_name: string;
  team_image_path: string | null;

  played: number;

  possession_avg: number | null;

  passes: number | null;
  passes_per_game: number | null;
  successful_passes: number | null;
  successful_passes_per_game: number | null;
  pass_accuracy: number | null;

  shots: number | null;
  shots_per_game: number | null;
  shots_on_target: number | null;
  shots_on_target_per_game: number | null;

  corners: number | null;
  corners_per_game: number | null;

  fouls: number | null;
  fouls_per_game: number | null;

  offsides: number | null;
  offsides_per_game: number | null;

  saves: number | null;
  saves_per_game: number | null;

  yellow_cards: number | null;
  yellow_cards_per_game: number | null;

  red_cards: number | null;
  red_cards_per_game: number | null;
}
