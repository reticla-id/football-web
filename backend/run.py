from services.extractor import Extractor
from services.transformer import Transformer
from services.loader import Loader
import json

def export_standings():
    # season_id = 23620
    # raw = Extractor.standings(season_id=season_id, include="participant;rule.type;details.type;form;stage;league;group")
    # df = Transformer.to_dataframe(raw)
    # Loader.csv(df, f"standings_{season_id}")

    season_id = 25790

    keep_col_details = ["id", "standing_type", "standing_id", "type_id", "value"]
    keep_col_form = ["id", "standing_type", "standing_id", "fixture_id", "form", "sort_order"]

    raw = Extractor.standings(
        season_id=season_id,
        include="details;form"
    )

    Loader.csv(
        Transformer.to_dataframe(raw),
        f"standings_{season_id}"
    )

    # Details
    df_detail = (
        Transformer.extract_nested(raw, ["details"])
        .reindex(columns=keep_col_details)
    )

    Loader.csv(
        df_detail,
        f"standing_details_{season_id}"
    )

    # Forms
    df_form = (
        Transformer.extract_nested(raw, ["form"])
        .reindex(columns=keep_col_form)
    )

    Loader.csv(
        df_form,
        f"standing_forms_{season_id}"
    )

def export_team_stats():
    season_id = 25965

    raw = Extractor.team_stats(
        season_id=season_id,
        include="venue"
    )

    # Main team table
    # Loader.csv(
    #     Transformer.to_dataframe(raw),
    #     f"teams_stats_{season_id}"
    # )

    # Actual statistics
    # Loader.csv(
    #     Transformer.extract_nested(
    #         raw,
    #         path=["statistics", "details"]
    #     ),
    #     f"team_statistics_{season_id}"
    # )

    Loader.csv(
        Transformer.extract_nested(raw, ["venue"]),
        f"venues_{season_id}"
    )

import time

def export_squads():
    team_list = [270737]
    season_id = 25965

    for team_id in team_list:
        try:
            print(f"Exporting team {team_id}...")

            raw = Extractor.team_squads(
                season_id=season_id,
                team_id=team_id,
                include="team;player.nationality;details.type;player.position"
            )

            df = Transformer.to_dataframe(raw)

            # Player table
            player_df = (
                df[
                    [
                        "player_id",
                        "player_firstname",
                        "player_lastname",
                        "player_display_name",
                        "player_common_name",
                        "player_position_id",
                        "player_height",
                        "player_weight",
                        "player_date_of_birth",
                        "player_nationality_id",
                        "player_city_id",
                        "player_image_path",
                        "player_gender",
                    ]
                ]
                .rename(columns={
                    "player_id": "id",
                    "player_firstname": "first_name",
                    "player_lastname": "last_name",
                    "player_display_name": "display_name",
                    "player_common_name": "common_name",
                    "player_position_id": "position_id",
                    "player_height": "height",
                    "player_weight": "weight",
                    "player_date_of_birth": "date_of_birth",
                    "player_nationality_id": "nationality_id",
                    "player_city_id": "city_id",
                    "player_image_path": "image_path",
                    "player_gender": "gender",
                })
                .drop_duplicates(subset="id")
            )

            # Squad table
            squad_df = (
                df[
                    [
                        "id",
                        "player_id",
                        "team_id",
                        "season_id",
                        "has_values",
                        "player_position_id",
                        "player_detailed_position_id",
                        "jersey_number",
                    ]
                ]
                .rename(columns={
                    "player_position_id": "position_id",
                    "player_detailed_position_id": "detailed_position_id",
                })
                .drop_duplicates(subset="id")
            )

            Loader.csv(player_df, f"players_{season_id}_{team_id}")
            Loader.csv(squad_df, f"squads_{season_id}_{team_id}")

            # Delay untuk rate limit
            time.sleep(10)

        except Exception as e:
            print(f"Failed team {team_id}: {e}")
            time.sleep(10)

def export_schedules():
    season_id = 25965

    raw = Extractor.season_schedules(
        season_id=season_id
    )

    Loader.csv(
        Transformer.extract_nested(raw, ["rounds"]),
        f"rounds_{season_id}"
    )

    Loader.csv(
        Transformer.extract_nested(raw, ["rounds", "fixtures"]),
        f"fixtures_{season_id}"
    )

    Loader.csv(
        Transformer.extract_nested(raw, ["rounds", "fixtures", "participants", "scores"]),
        f"fixture_scores_{season_id}"
    )

def export_fixture_stats():
    fixture_lists = [
        19479257
        , 19479259, 19479260, 19479261, 19479262, 19479263, 19479264, 19479265,
        19479266, 19479267, 19479268, 19479269, 19479270, 19479271, 19479272, 19479273,
        19479274, 19479275, 19479276, 19479277, 19479278, 19479279, 19479280, 19479281,
        19479282, 19479283, 19479284, 19479285, 19479287, 19479288, 19479289, 19479290,
        19479291, 19479292, 19479293, 19479294, 19479295, 19479296, 19479297, 19479298,
        19479299, 19479300, 19479301, 19479302, 19479303, 19479304, 19479305, 19479306,
        19479308, 19479309, 19479310, 19479311, 19479312, 19479313, 19479314, 19479315,
        19479316, 19479317, 19479318, 19479319, 19479320, 19479321, 19479323, 19479324,
        19479325, 19479326, 19479327, 19479329, 19479330, 19479331, 19479332, 19479333,
        19479334, 19479335, 19479336, 19479337, 19479338, 19479339, 19479340, 19479342,
        19479343, 19479344, 19479345, 19479346, 19479347, 19479348, 19479349, 19479350,
        19479351, 19479352, 19479353, 19479354, 19479355, 19479357, 19479358, 19479359,
        19479360, 19479361, 19479362, 19479363, 19479364, 19479365, 19479366, 19479367,
        19479368, 19479369, 19479370, 19479371, 19479373, 19479374, 19479375, 19479376,
        19479377, 19479378, 19479379, 19479380, 19479381, 19479382, 19479383, 19479384,
        19479385, 19479386, 19479387, 19479389, 19479390, 19479391, 19479392, 19479393,
        19479394, 19479395, 19479396, 19479397, 19479398, 19479399, 19479400, 19479401,
        19479402, 19479403, 19479404, 19479405, 19479406, 19479407, 19479408, 19479409,
        19479410, 19479412, 19479413, 19479414, 19479415, 19479416, 19479417, 19479418,
        19479419, 19479420, 19479421, 19479422, 19479423, 19479424, 19479425, 19479426,
        19479427, 19479428, 19479429, 19479430, 19479431, 19479432, 19479433, 19479434,
        19479436, 19479437, 19479438, 19479439, 19479440, 19479441, 19479442, 19479443,
        19479444, 19479445, 19479446, 19479447, 19479448, 19479449, 19479450, 19479451,
        19479452, 19479453, 19479454, 19479456, 19479457, 19479458, 19479459, 19479460,
        19479461, 19479462, 19479463, 19479464, 19479465, 19479466, 19479467, 19516802,
        19516803, 19516804, 19516805, 19565349, 19605503, 19606609,
        ]

    keep_col_events = [
        "id",
        "fixture_id",
        "period_id",
        "participant_id",
        "type_id",
        "section",
        "player_id",
        "related_player_id",
        "result",
        "info",
        "addition",
        "minute",
        "extra_minute",
        "injured",
        "on_bench",
        "coach_id",
        "sub_type_id",
        "detailed_period_id",
        "rescinded",
        "sort_order",
    ]

    keep_col_stats = ["id", "fixture_id", "participant_id", "type_id", "data_value", "location"]
    
    keep_col_formations = ["id", "fixture_id", "participant_id", "formation", "location"]

    keep_col_lineup = ["id", "fixture_id",  "player_id", "team_id", "position_id", "formation_field", "type_id", "formation_position", "player_name", "jersey_number"]

    keep_col_trends = ["id", "fixture_id", "participant_id", "type_id", "value", "minute"]

    keep_col_scores = ["id", "fixture_id", "type_id", "participant_id", "goals", "participant", "description"]

    keep_col_ballcoordinates = ["id", "fixture_id", "period_id", "timer", "x", "y"]

    keep_col_participants = ["id", "fixture_id", "location", "winner", "position"]

    keep_col_timeline = ["id", "fixture_id", "participant_id", "type_id", "section", "player_id", "related_player_id", "result", "info", "addition", "minute", "extra_minute", "injured", "on_bench", "coach_id", "sub_type_id", "detailed_period_id", "rescinded", "sort_order"]

    for fixture_id in fixture_lists:
        try:
            print(f"Exporting fixture {fixture_id}...")

            raw = Extractor.fixture_stats(
                fixture_id=fixture_id,
                include="events;statistics;formations;trends;ballCoordinates"
            )

            # # LINEUP
            # df_lineup = (
            #     Transformer.extract_nested(raw, ["lineups"])
            #     .reindex(columns=keep_col_lineup)
            # )

            # Loader.csv(
            #     df_lineup,
            #     f"fixture_lineup_{fixture_id}"
            # )
                
            # EVENTS
            df_events = (
                Transformer.extract_nested(raw, ["events"])
                .reindex(columns=keep_col_events)
            )

            Loader.csv(
                df_events,
                f"fixture_events_{fixture_id}"
            )

            # STATISTICS
            df_stats = (
                Transformer.extract_nested(raw, ["statistics"])
                .reindex(columns=keep_col_stats)
            )

            Loader.csv(
                df_stats,
                f"fixture_stats_{fixture_id}"
            )

            # FORMATIONS
            df_form = (
                Transformer.extract_nested(raw, ["formations"])
                .reindex(columns=keep_col_formations)
            )

            Loader.csv(
                df_form,
                f"fixture_formations_{fixture_id}"
            )
            
            # TRENDS
            df_trends = (
                Transformer.extract_nested(raw, ["trends"])
                .reindex(columns=keep_col_trends)
            )

            Loader.csv(
                df_trends,
                f"fixture_trends_{fixture_id}"
            )

            # # Ball Coordinates
            # df_ballcoordinates = (
            #     Transformer.extract_nested(raw, ["ballcoordinates"])
            #     .reindex(columns=[keep_col_ballcoordinates])
            # )

            # Loader.csv(
            #     df_ballcoordinates,
            #     f"fixture_ballcoordinates_{fixture_id}"
            # )

            # # Participants
            # df_participants = (
            #     Transformer.extract_nested(raw, ["participants", "meta"])
            #     .reindex(columns=keep_col_participants)
            # )
            
            # Loader.csv(
            #     df_participants,
            #     f"fixture_participants_{fixture_id}"
            # )

            # # Scores
            # df_scores = (
            #     Transformer.extract_nested(raw, ["scores", "score"])
            #     .reindex(columns=keep_col_scores)
            # )
            
            # Loader.csv(
            #     df_scores,
            #     f"fixture_scores_{fixture_id}"
            # )

            # # Timeline
            # df_timeline = (
            #     Transformer.extract_nested(raw, ["timeline"])
            #     .reindex(columns=[keep_col_timeline])
            # )

            # Loader.csv(
            #     df_timeline,
            #     f"fixture_timeline_{fixture_id}"
            # )

            time.sleep(5)

        except Exception as e:
            print(f"Failed fixture {fixture_id}: {e}")
            time.sleep(2)

def export_topscorers():
    season_id = 25965

    keep_col= ["id", "name", "code", "developer_name", "model_type", "stat_group"]

    raw = Extractor.all_pages(
        Extractor.topscorers,
        season_id=season_id,
        include="type"
    )

    Loader.csv(
        Transformer.to_dataframe(raw),
        f"topscorers_{season_id}"
    )

    # Types
    df_types = (
        Transformer.extract_nested(raw, ["type"])
        .reindex(columns=keep_col)
        .drop_duplicates(subset="id")
    )

    Loader.csv(
        df_types,
        f"types_{season_id}"
    )

def export_types():

    results = []

    for page in range(1, 51):

        print(f"[INFO] Fetching page {page}")

        response = Extractor.types(
            page=page,
            per_page=50
        )

        results.extend(response.get("data", []))

        if not response["pagination"]["has_more"]:
            print(f"[INFO] Last page: {page}")
            break

    Loader.csv(
        Transformer.to_dataframe(results),
        "types"
    )

if __name__ == "__main__":
    export_fixture_stats()