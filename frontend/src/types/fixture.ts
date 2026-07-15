export interface FixtureLeague {
  id: number;
  name: string;
  image_path: string | null;
}

export interface FixtureParticipant {
  id: number;
  name: string;
  image_path: string | null;

  winner: boolean | null;
  goals: number;
}

export interface TeamFixture {
  id: number;

  league_id: number | null;
  season_id: number | null;

  state: number | string;
  result_info: string | null;

  starting_at: string;

  state_id: number | null;
  venue_name: string;

  round_id: number | null;
  stage_id: number | null;

  leg: string | null;

  league: FixtureLeague;

  home: FixtureParticipant;

  away: FixtureParticipant;
}

export interface FixtureLineupPlayer {
  id: number;

  player_id: number;

  player: {
    id: number;
    display_name: string;
    image_path: string | null;
  };

  position_id: number | null;
  formation_position: number | null;
  jersey_number: number | null;
  type_id: number | null;
}

export interface FixtureLineupTeam {
  id: number;
  name: string;
  image_path: string | null;
  formation: string | null;
}

export interface FixtureLineups {
  fixture_id: number;

  teams: {
    home: FixtureLineupTeam;
    away: FixtureLineupTeam;
  };

  home_lineups: FixtureLineupPlayer[];
  away_lineups: FixtureLineupPlayer[];
}

export interface FixtureStatistic {
  id: number;
  fixture_id: number;

  type_id: number;
  code: string;
  name: string;
  model_type: string | null;

  home: string | number | null;
  away: string | number | null;
}