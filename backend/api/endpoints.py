from api.client import FootballAPI

api = FootballAPI()


def get_standings(season_id, include=None):

        params = {}

        if include:
            params["include"] = include

        return api.get(
            f"standings/seasons/{season_id}",
            params=params
        )

def get_team_stats(season_id, include=None, filters=None):

        params = {}

        if include:
            params["include"] = include
        if filters:
            params["filters"] = filters

        return api.get(
            f"teams/seasons/{season_id}",
            params=params
        )

def get_team_squads(season_id, team_id, include=None):

        params = {}

        if include:
            params["include"] = include

        return api.get(
            f"squads/seasons/{season_id}/teams/{team_id}",
            params=params
        )

def get_player_profile(player_id, include=None):

        params = {}

        if include:
            params["include"] = include

        return api.get(
            f"players/{player_id}",
            params=params
        )

def get_schedules(season_id, include=None):
        params = {}

        if include:
            params["include"] = include

        return api.get(
            f"schedules/seasons/{season_id}",
            params=params
        )

def get_fixture_stats(fixture_id, include=None):
        params = {}

        if include:
            params["include"] = include

        return api.get(
            f"fixtures/{fixture_id}",
            params=params
        )

def get_topscorers(season_id, include=None, page=1):
        params = {"page": page}

        if include:
            params["include"] = include

        return api.get(
            f"topscorers/seasons/{season_id}",
            params=params
        )

def get_types(page=1, per_page=50):
    params = {
          "per_page": per_page,
          "page": page}

    return api.get("core/types/", params=params)