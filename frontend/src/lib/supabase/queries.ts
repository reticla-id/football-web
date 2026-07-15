import type { User } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { supabase, supabaseAnonKey, supabaseRestUrl } from "./client";
import type {
  DashboardStats,
  Fixture,
  FixtureClubOption,
  FixtureLeagueDirectory,
  FixtureSeasonOption,
  Player,
  UserProfile,
} from "./types";
import type { SquadPlayer } from "@/types/squad";
import type { TeamFixture, FixtureLineups, FixtureStatistic, FixtureTimelineEvent } from "@/types/fixture";
import type { Team } from "@/types/team";

type QueryResult<T> = { data: T | null; error: string | null };
type FetchParams = Record<string, string | number | boolean | undefined> & {
    order?: string;
};

async function fetchSupabaseData<T>(
  table: string,
  select: string,
  params?: FetchParams
): Promise<QueryResult<T[]>> {
  if (!supabaseRestUrl || !supabaseAnonKey) {
    return {
      data: null,
      error: "Supabase data API is not configured.",
    };
  }

  const url = new URL(`${supabaseRestUrl}/rest/v1/${table}`);

  const searchParams = new URLSearchParams();
  searchParams.set("select", select);

  const { order, ...filters } = params ?? {};

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      searchParams.set(key, String(value));
    }
  });

  if (order) {
    searchParams.set("order", order);
  }

  url.search = searchParams.toString();

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const body = await response.text();

  let data: unknown = null;

  if (body) {
    try {
      data = JSON.parse(body);
    } catch {
      data = body;
    }
  }

  if (!response.ok) {
    return {
      data: null,
      error:
        typeof data === "object" &&
        data &&
        "message" in data &&
        typeof (data as { message?: unknown }).message === "string"
          ? (data as { message: string }).message
          : "Supabase data request failed.",
    };
  }

  return {
    data: Array.isArray(data) ? (data as T[]) : [],
    error: null,
  };
}

function normalizeUserProfile(user: User | null): UserProfile | null {
  if (!user) {
    return null;
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

  return {
    id: user.id,
    auth_id: user.id,
    email: user.email ?? "",
    tenant_id: typeof metadata.tenant_id === "string" ? metadata.tenant_id : null,
    created_at: user.created_at ?? "",
    updated_at: user.updated_at ?? "",
    username: typeof metadata.username === "string" ? metadata.username : null,
  };
}

export async function signUpWithEmail(email: string, password: string, username?: string): Promise<QueryResult<{ user: User | null; profile: UserProfile | null }>> {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username?.trim() || email.split("@")[0],
      },
    },
  });

  if (authError || !authData.user) {
    return { data: null, error: authError?.message ?? "Unable to create your account right now." };
  }

  const profileResult = await createUserProfile(authData.user);
  if (profileResult.error) {
    return { data: null, error: profileResult.error };
  }

  return {
    data: {
      user: authData.user,
      profile: profileResult.data,
    },
    error: null,
  };
}

export async function signInWithEmail(email: string, password: string): Promise<QueryResult<{ user: User | null }>> {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { data: null, error: error?.message ?? "Unable to sign in with those credentials." };
  }

  return { data: { user: data.user }, error: null };
}

export async function createUserProfile(user: User | null): Promise<QueryResult<UserProfile | null>> {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  if (!user) {
    return { data: null, error: "No authenticated user available." };
  }

  return { data: normalizeUserProfile(user), error: null };
}

export async function signOutSession(): Promise<QueryResult<null>> {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: null, error: null };
}

export async function getCurrentUser(): Promise<QueryResult<User | null>> {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data.user, error: null };
}

export async function getCurrentUserProfile(): Promise<QueryResult<UserProfile | null>> {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const currentUser = await getCurrentUser();
  if (currentUser.error || !currentUser.data) {
    return { data: null, error: currentUser.error ?? "No active user session." };
  }

  return { data: normalizeUserProfile(currentUser.data), error: null };
}

export async function getDashboardData(): Promise<QueryResult<DashboardStats>> {
  const [{ data: standings, error: standingsError }, { data: topScorers, error: topScorersError }, { data: assists, error: assistsError }, { data: redCards, error: redCardsError }] = await Promise.all([
    fetchSupabaseData<Record<string, unknown>>("standing_table", "position, points, participant, league, result, details, form", { limit: 50, order: "position.asc" }),
    fetchSupabaseData<Record<string, unknown>>("player_standing_aggs", "position, total, type_id, player, participant", { type_id: "eq.208", limit: 10, order: "total.desc" }),
    fetchSupabaseData<Record<string, unknown>>("player_standing_aggs", "position, total, type_id, player, participant", { type_id: "eq.209", limit: 10, order: "total.desc" }),
    fetchSupabaseData<Record<string, unknown>>("player_standing_aggs", "position, total, type_id, player, participant", { type_id: "eq.83", limit: 10, order: "total.desc" }),
  ]);

  if (standingsError || topScorersError || assistsError || redCardsError) {
    return {
      data: null,
      error: [standingsError, topScorersError, assistsError, redCardsError].filter(Boolean).join("; "),
    };
  }

  const normalizedStandings = (standings ?? []).map((standing) => {
  const participant = standing.participant as Record<string, unknown>;
  const league = standing.league as Record<string, unknown>;
  const details = (standing.details as Array<Record<string, unknown>>) ?? [];
  const form = (standing.form as Array<Record<string, unknown>>) ?? [];

  const getValue = (typeId: number) =>
    Number(details.find((d) => Number(d.type_id) === typeId)?.value ?? 0);

  return {
      position: Number(standing.position),
      team: String(participant?.name ?? ""),
      league: String(league?.name ?? ""),

      played: getValue(129),
      win: getValue(130),
      draw: getValue(131),
      loss: getValue(132),
      goalsFor: getValue(133),
      goalsAgainst: getValue(134),

      points: Number(standing.points),
      result: String(standing.result),
      image_path: String(participant.image_path ?? ""),

      form: form.slice(0, 5).map((f) => f.form).join("")
    };
  });

  const normalizedTopScorers = (topScorers ?? []).map((row) => {
  const player = row.player as Record<string, unknown>;
  const participant = row.participant as Record<string, unknown>;
  const getValue = (
      row: Record<string, unknown>,
      typeId: number
    ) => Number(row.type_id) === typeId
      ? Number(row.total ?? 0)
      : 0;

  return {
      player: String(player.name ?? ""),
      team: String(participant.name ?? ""),
      goals: getValue(row, 208),
      image_path: String(player.image_path ?? ""),
      team_image_path: String(participant.image_path ?? "")
    };
  });

  const normalizedTopAssists = (assists ?? []).map((row) => {
  const player = row.player as Record<string, unknown>;
  const participant = row.participant as Record<string, unknown>;
  const getValue = (
      row: Record<string, unknown>,
      typeId: number
    ) => Number(row.type_id) === typeId
      ? Number(row.total ?? 0)
      : 0;

    return {
      player: String(player.name ?? ""),
      team: String(participant.name ?? ""),
      assists: getValue(row, 209),
      image_path: String(player.image_path ?? ""),
      team_image_path: String(participant.image_path ?? "")
    };
  });

  const normalizedRedCards = (redCards ?? []).map((row) => {
  const player = row.player as Record<string, unknown>;
  const participant = row.participant as Record<string, unknown>;
  const getValue = (
      row: Record<string, unknown>,
      typeId: number
    ) => Number(row.type_id) === typeId
      ? Number(row.total ?? 0)
      : 0;

    return {
      player: String(player.name ?? ""),
      team: String(participant.name ?? ""),
      redcards: getValue(row, 83),
      image_path: String(player.image_path ?? ""),
      team_image_path: String(participant.image_path ?? "")
    };
  });

  return {
    data: {
      standings: normalizedStandings,
      topScorers: normalizedTopScorers,
      topAssists: normalizedTopAssists,
      topRedcards: normalizedRedCards,
      recentFixtures: [],
      upcomingFixtures: [],
      leagueStats: {
        totalTeams: 0,
        totalMatches: 0,
        avgGoals: 0,
        homeWins: 0,
      },
    },
    error: null,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getAgeFromDateOfBirth(dateOfBirth: unknown): number | null {
  if (typeof dateOfBirth !== "string" || !dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
}

function buildClubFilter(clubId?: number): string | undefined {
  if (!clubId) {
    return undefined;
  }

  return `(home_team_id.eq.${clubId},away_team_id.eq.${clubId})`;
}

async function getSeasonOptionsFromIds(
  seasonIds: number[]
): Promise<QueryResult<FixtureSeasonOption[]>> {
  if (!seasonIds.length) {
    return { data: [], error: null };
  }

  const { data, error } = await fetchSupabaseData<Record<string, unknown>>(
    "seasons",
    "id,name",
    {
      id: `in.(${seasonIds.join(",")})`,
      order: "id.desc",
    }
  );

  if (error) {
    return { data: null, error };
  }

  const seasonMap = new Map(
    (data ?? []).map((season) => [
      Number(season.id ?? 0),
      String(season.name ?? `Season ${season.id}`),
    ])
  );

  return {
    data: seasonIds
      .slice()
      .sort((a, b) => b - a)
      .map((id) => ({
        id,
        name: seasonMap.get(id) ?? `Season ${id}`,
      })),
    error: null,
  };
}

function normalizeFixtureLeagueRow(
  league: Record<string, unknown>,
  countryMap: Map<number, string>
): FixtureLeagueDirectory {
  const id = Number(league.id ?? 0);

  return {
    id,
    name: String(league.name ?? ""),
    slug: slugify(String(league.name ?? "")),
    country:
      league.country_id != null
        ? countryMap.get(Number(league.country_id)) ?? null
        : null,
    logo:
      typeof league.image_path === "string"
        ? league.image_path
        : null,
  };
}

export async function getTeams( offset = 0, limit = 24): Promise<QueryResult<Team[]>> {
  const { data: clubs, error: clubsError } = await fetchSupabaseData<Record<string, unknown>>("clubs", "id,name,short_code,founded,country_id,league_id,image_path", { limit, offset, order: "name.asc" });

  if (clubsError) {
    return { data: null, error: clubsError };
  }

  const countryIds = Array.from(new Set((clubs ?? []).map((club) => club.country_id).filter(Boolean)));
  const leagueIds = Array.from(new Set((clubs ?? []).map((club) => club.league_id).filter(Boolean)));

  const [countriesResult, leaguesResult] = await Promise.all([
    countryIds.length > 0
      ? fetchSupabaseData<Record<string, unknown>>("countries", "id, name", { id: `in.(${countryIds.join(",")})` })
      : Promise.resolve({ data: [] as Array<Record<string, unknown>>, error: null }),
    leagueIds.length > 0
      ? fetchSupabaseData<Record<string, unknown>>("leagues", "id, name", { id: `in.(${leagueIds.join(",")})` })
      : Promise.resolve({ data: [] as Array<Record<string, unknown>>, error: null }),
  ]);

  if (countriesResult.error || leaguesResult.error) {
    return {
      data: null,
      error: [countriesResult.error, leaguesResult.error].filter(Boolean).join("; "),
    };
  }

    const countryMap = new Map(
    (countriesResult.data ?? []).map(country => [
        Number(country.id),
        String(country.name ?? "")
    ])
    );

    const leagueMap = new Map(
    (leaguesResult.data ?? []).map(league => [
        Number(league.id),
        String(league.name ?? "")
    ])
    );

  const normalizedTeams = (clubs ?? []).map((club) => ({
    id: Number(club.id ?? ""),
    name: String(club.name ?? ""),
    slug: slugify(String(club.name ?? "")),
    short_code: String(club.short_code ?? ""),
    country: club.country_id ? countryMap.get(Number(club.country_id)) ?? null : null,
    league: club.league_id ? leagueMap.get(Number(club.league_id)) ?? null : null,
    logo: club.image_path ? String(club.image_path) : null,
    founded: typeof club.founded === "number" ? club.founded : club.founded ? Number(club.founded) : null,
  }));

  return { data: normalizedTeams as Team[], error: null };
}

export async function getPlayers(): Promise<QueryResult<Player[]>> {
  const { data, error } = await fetchSupabaseData<Record<string, unknown>>(
    "player_overview",
    `
      player_id,
      display_name,
      image_path,
      date_of_birth,
      height,
      jersey_number,
      country,
      position,
      team,
      league
    `,
    {
      limit: 50,
      order: "display_name.asc",
    }
  );

  if (error) {
    return {
      data: null,
      error,
    };
  }

  const normalizedPlayers: Player[] = (data ?? []).map((player) => ({
    id: Number(player.player_id ?? 0),

    name: String(player.display_name ?? ""),

    slug: slugify(String(player.display_name ?? "")),

    nationality:
      typeof player.country === "object" &&
      player.country &&
      "name" in player.country
        ? String((player.country as any).name ?? "")
        : null,

    position:
      typeof player.position === "object" &&
      player.position &&
      "name" in player.position
        ? String((player.position as any).name ?? "")
        : null,

    age: getAgeFromDateOfBirth(player.date_of_birth),

    height:
      player.height != null
        ? Number(player.height)
        : null,

    weight: null,

    club:
      typeof player.team === "object" &&
      player.team &&
      "name" in player.team
        ? String((player.team as any).name ?? "")
        : null,

    club_image_path:
      typeof player.team === "object" &&
      player.team &&
      "image_path" in player.team
        ? String((player.team as any).image_path ?? "")
        : null,

    season: null,

    league:
      typeof player.league === "object" &&
        player.league &&
        "name" in player.league
          ? String((player.league as any).name ?? "")
          : null,

    number:
      player.jersey_number != null
        ? Number(player.jersey_number)
        : null,

    avatar:
      typeof player.image_path === "string"
        ? player.image_path
        : null,
  }));

  return {
    data: normalizedPlayers,
    error: null,
  };
}

export async function getFixtures(): Promise<QueryResult<Fixture[]>> {
  const { data, error } = await fetchSupabaseData<Fixture>(
    "fixture_table",
    `
      id,
      starting_at,
      state_id,
      venue_name,
      league,
      home,
      away
    `,
    {
      order: "starting_at.desc",
      limit: 50,
    }
  );

  if (error) return { data: null, error };

  return {
    data: data ?? [],
    error: null,
  };
}

export async function getFixtureLeagues(): Promise<QueryResult<FixtureLeagueDirectory[]>> {
  return getCachedFixtureLeagues();
}

const getCachedFixtureLeagues = unstable_cache(
  async (): Promise<QueryResult<FixtureLeagueDirectory[]>> => {
    const { data: leagues, error: leaguesError } = await fetchSupabaseData<Record<string, unknown>>(
      "leagues",
      "id,name,country_id,image_path",
      {
        order: "name.asc",
      }
    );

    if (leaguesError) {
      return { data: null, error: leaguesError };
    }

    const countryIds = Array.from(
      new Set((leagues ?? []).map((league) => league.country_id).filter(Boolean))
    );

    const countriesResult =
      countryIds.length > 0
        ? await fetchSupabaseData<Record<string, unknown>>("countries", "id,name", {
            id: `in.(${countryIds.join(",")})`,
          })
        : { data: [] as Record<string, unknown>[], error: null };

    if (countriesResult.error) {
      return { data: null, error: countriesResult.error };
    }

    const countryMap = new Map(
      (countriesResult.data ?? []).map((country) => [
        Number(country.id ?? 0),
        String(country.name ?? ""),
      ])
    );

    return {
      data: (leagues ?? []).map((league) =>
        normalizeFixtureLeagueRow(league, countryMap)
      ),
      error: null,
    };
  },
  ["fixture-leagues-directory"],
  {
    revalidate: 600,
  }
);

export async function getLeagueFixtureFilters(
  leagueId: number
): Promise<
  QueryResult<{
    seasons: FixtureSeasonOption[];
    clubs: FixtureClubOption[];
  }>
> {
  const { data, error } = await fetchSupabaseData<Record<string, unknown>>(
    "fixture_table",
    "season_id,home,away",
    {
      league_id: `eq.${leagueId}`,
      order: "starting_at.desc",
    }
  );

  if (error) {
    return { data: null, error };
  }

  const seasonIds = Array.from(
    new Set(
      (data ?? [])
        .map((fixture) => fixture.season_id)
        .filter((seasonId): seasonId is number => typeof seasonId === "number")
    )
  );

  const seasonOptionsResult = await getSeasonOptionsFromIds(seasonIds);

  if (seasonOptionsResult.error) {
    return { data: null, error: seasonOptionsResult.error };
  }

  const clubMap = new Map<number, FixtureClubOption>();

  for (const fixture of data ?? []) {
    const participants = [fixture.home, fixture.away];

    for (const participant of participants) {
      if (typeof participant !== "object" || !participant) {
        continue;
      }

      const participantRecord = participant as Record<string, unknown>;
      const id = Number(participantRecord.id ?? 0);

      if (!id || clubMap.has(id)) {
        continue;
      }

      clubMap.set(id, {
        id,
        name: String(participantRecord.name ?? ""),
        image_path:
          typeof participantRecord.image_path === "string"
            ? participantRecord.image_path
            : null,
      });
    }
  }

  return {
    data: {
      seasons: seasonOptionsResult.data ?? [],
      clubs: Array.from(clubMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    },
    error: null,
  };
}

export async function getTeamFixtureFilters(
  teamId: number
): Promise<QueryResult<FixtureSeasonOption[]>> {
  const { data, error } = await fetchSupabaseData<Record<string, unknown>>(
    "fixture_table",
    "season_id",
    {
      or: `(home_team_id.eq.${teamId},away_team_id.eq.${teamId})`,
      order: "starting_at.desc",
    }
  );

  if (error) {
    return { data: null, error };
  }

  const seasonIds = Array.from(
    new Set(
      (data ?? [])
        .map((fixture) => fixture.season_id)
        .filter((seasonId): seasonId is number => typeof seasonId === "number")
    )
  );

  return getSeasonOptionsFromIds(seasonIds);
}

export async function getLeagueUpcomingFixtures(
  leagueId: number,
  seasonId?: number,
  clubId?: number,
  limit = 10,
  offset = 0,
  nowIso = new Date().toISOString()
): Promise<QueryResult<TeamFixture[]>> {
  const filters: Record<string, string | number> = {
    league_id: `eq.${leagueId}`,
    starting_at: `gt.${nowIso}`,
    order: "starting_at.asc",
    limit,
    offset,
  };

  if (seasonId) {
    filters.season_id = `eq.${seasonId}`;
  }

  const clubFilter = buildClubFilter(clubId);
  if (clubFilter) {
    filters.or = clubFilter;
  }

  return fetchSupabaseData<TeamFixture>("fixture_table", "*", filters);
}

export async function getLeagueFinishedFixtures(
  leagueId: number,
  seasonId?: number,
  clubId?: number,
  limit = 10,
  offset = 0,
  nowIso = new Date().toISOString()
): Promise<QueryResult<TeamFixture[]>> {
  const filters: Record<string, string | number> = {
    league_id: `eq.${leagueId}`,
    starting_at: `lte.${nowIso}`,
    order: "starting_at.desc",
    limit,
    offset,
  };

  if (seasonId) {
    filters.season_id = `eq.${seasonId}`;
  }

  const clubFilter = buildClubFilter(clubId);
  if (clubFilter) {
    filters.or = clubFilter;
  }

  return fetchSupabaseData<TeamFixture>("fixture_table", "*", filters);
}

export async function getFixtureById(
  fixtureId: number
): Promise<QueryResult<TeamFixture>> {
  const { data, error } = await fetchSupabaseData<TeamFixture>(
    "fixture_table",
    "*",
    {
      id: `eq.${fixtureId}`,
      limit: 1,
    }
  );

  if (error) {
    return { data: null, error };
  }

  return {
    data: data?.[0] ?? null,
    error: null,
  };
}

export async function getTeamSquad(
    teamId: number,
    seasonId?: number
) {
    const filters: Record<string, string> = {
        team_id: `eq.${teamId}`,
        order: "jersey_number.asc",
    };

    if (seasonId) {
        filters.season_id = `eq.${seasonId}`;
    }

    return fetchSupabaseData<SquadPlayer>(
        "squad_table",
        "*",
        filters
    );
}

export async function getTeamFixtures(
    teamId: number,
    seasonId?: number,
    limit = 10,
    offset = 0
) {
    const filters: Record<string, string | number> = {
        or: `(home_team_id.eq.${teamId},away_team_id.eq.${teamId})`,
        order: "starting_at.desc",
        limit,
        offset,
    };

    if (seasonId) {
        filters.season_id = `eq.${seasonId}`;
    }

    return fetchSupabaseData<TeamFixture>(
        "fixture_table",
        "*",
        filters
    );
}

export async function getFixtureLineups(
  fixtureId: number
): Promise<QueryResult<FixtureLineups | null>> {
  const { data, error } = await fetchSupabaseData<FixtureLineups>(
    "fixture_lineups_view",
    "*",
    {
      fixture_id: `eq.${fixtureId}`,
      limit: 1,
    }
  );

  return {
    data: data?.[0] ?? null,
    error,
  };
}

export async function getFixtureStatistics(
  fixtureId: number
): Promise<QueryResult<FixtureStatistic[]>> {
  const { data, error } = await fetchSupabaseData<FixtureStatistic>(
    "fixture_statistics_view",
    "*",
    {
      fixture_id: `eq.${fixtureId}`,
      order: "type_id.asc",
    }
  );

  return {
    data: data ?? [],
    error,
  };
}

export async function getFixtureTimeline(
  fixtureId: number
): Promise<QueryResult<FixtureTimelineEvent[]>> {
  const { data, error } = await fetchSupabaseData<FixtureTimelineEvent>(
    "fixture_timeline_view",
    "*",
    {
      fixture_id: `eq.${fixtureId}`,
      order: "minute.asc",
    }
  );

  console.log(data)

  return {
    data: data ?? [],
    error,
  };
}
