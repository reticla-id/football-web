import time

from api.endpoints import get_fixture_stats, get_fixture_stats, get_player_profile, get_standings, get_team_squads, get_team_stats, get_schedules, get_topscorers, get_types


class Extractor:

    @staticmethod
    def all_pages(fetch_func, **kwargs):

        page = 1
        results = []

        while True:

            print(f"[INFO] Fetching page {page}...")

            response = fetch_func(page=page, **kwargs)

            data = response.get("data", [])
            results.extend(data)

            pagination = response.get("pagination", {})

            print(
                f"[INFO] Page {pagination.get('current_page', page)} | "
                f"Items: {pagination.get('count', len(data))} | "
                f"Has More: {pagination.get('has_more')}"
            )

            # Stop when there are no more pages
            if not pagination.get("has_more", False):
                print(f"[INFO] Completed. Total records: {len(results)}")
                break

            page += 1

            time.sleep(2)

        return {"data": results}

    @staticmethod
    def standings(season_id, include=None):

        return get_standings(
            season_id=season_id,
            include=include
        )
    
    @staticmethod
    def team_stats(season_id, include=None, filters=None):

        return get_team_stats(
            season_id=season_id,
            include=include,
            filters=filters
        )
    
    def team_squads(season_id, team_id, include=None):

        return get_team_squads(
            season_id=season_id,
            team_id=team_id,
            include=include
        )
    
    def player_profile(player_id, include=None):

        return get_player_profile(
            player_id=player_id,
            include=include
        )
    
    def season_schedules(season_id, include=None):

        return get_schedules(
            season_id=season_id,
            include=include
        )
    
    def fixture_stats(fixture_id, include=None):

        return get_fixture_stats(
            fixture_id=fixture_id,
            include=include
        )
    
    def topscorers(season_id, include=None, page=1):

        return get_topscorers(
            season_id=season_id,
            include=include,
            page=page
        )
    
    def types(per_page=50, page=1):
        return get_types(
            page=page,
            per_page=per_page
        )