from pathlib import Path
import re
import time

import pandas as pd
from pandas.errors import EmptyDataError

from services.extractor import Extractor
from services.loader import Loader
from services.transformer import Transformer


# Configuration
season_id = 25964
OUTPUT_DIR = Path("data/raw")
SEASON_EXPORT_DELAY = 10
TEAM_EXPORT_DELAY = 5
FIXTURE_EXPORT_DELAY = 2

team_list = []
fixture_list = []

NON_RECURSIVE_PREFIXES = {
    "fixtures",
    "teams_stats",
    "standings",
    "rounds",
    "topscorers",
    "types",
    "venues",
    "standing_details",
    "standing_forms",
}


def csv_path(filename):
    return OUTPUT_DIR / f"{filename}.csv"


def safe_read_csv(path, context_label=None):
    path = Path(path)
    label = context_label or path.name

    if not path.exists():
        print(f"[WARN] CSV not found: {path}")
        return None

    if path.stat().st_size == 0:
        print(f"[WARN] Skipping empty CSV: {label}")
        return None

    try:
        return pd.read_csv(path)
    except EmptyDataError:
        print(f"[WARN] Skipping CSV with no columns to parse: {label}")
        return None


def build_id_list(filename, id_column="id"):
    path = csv_path(filename)

    df = safe_read_csv(path, f"ID source {path.name}")

    if df is None:
        return []

    if id_column not in df.columns:
        print(f"[WARN] Column '{id_column}' not found in {path.name}")
        return []

    return df[id_column].dropna().drop_duplicates().tolist()


def detect_merge_prefix(filename):
    stem = Path(filename).stem

    if stem.count("_") < 1:
        return None

    match = re.match(r"^(?P<prefix>.+)_(?P<suffix>\d+)$", stem)
    if not match:
        return None

    prefix = match.group("prefix")
    suffix = int(match.group("suffix"))

    if suffix in fixture_list or suffix in team_list:
        return prefix

    if suffix == season_id and prefix in NON_RECURSIVE_PREFIXES:
        return None

    return None


def append_same_prefix_csv(output_dir):
    output_dir = Path(output_dir)
    grouped_files = {}

    for csv_file in output_dir.rglob("*.csv"):
        prefix = detect_merge_prefix(csv_file.name)

        if not prefix:
            continue

        group_key = (csv_file.parent, prefix)
        grouped_files.setdefault(group_key, []).append(csv_file)

    for (parent_dir, prefix), files in grouped_files.items():
        if len(files) <= 1:
            continue

        files = sorted(files, key=lambda path: path.name)
        dataframes = []

        for file_path in files:
            df = safe_read_csv(file_path, f"merge source {file_path.name}")
            if df is None:
                continue

            dataframes.append(df)

        if len(dataframes) <= 1:
            continue

        merged_path = parent_dir / f"{prefix}.csv"
        merged_df = pd.concat(dataframes, ignore_index=True)
        merged_df.to_csv(merged_path, index=False)
        print(f"[INFO] Merged {len(dataframes)} files into {merged_path}")

        for file_path in files:
            if file_path == merged_path or not file_path.exists():
                continue

            file_path.unlink()
            print(f"[INFO] Removed merged source file: {file_path}")


def export_standings():
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

    df_detail = (
        Transformer.extract_nested(raw, ["details"])
        .reindex(columns=keep_col_details)
    )

    Loader.csv(
        df_detail,
        f"standing_details_{season_id}"
    )

    df_form = (
        Transformer.extract_nested(raw, ["form"])
        .reindex(columns=keep_col_form)
    )

    Loader.csv(
        df_form,
        f"standing_forms_{season_id}"
    )


def export_team_stats():
    raw = Extractor.team_stats(
        season_id=season_id,
        include="venue"
    )

    Loader.csv(
        Transformer.to_dataframe(raw),
        f"teams_stats_{season_id}"
    )

    Loader.csv(
        Transformer.extract_nested(raw, ["venue"]),
        f"venues_{season_id}"
    )


def export_squads():
    for team_id in team_list:
        try:
            print(f"Exporting team {team_id}...")

            raw = Extractor.team_squads(
                season_id=season_id,
                team_id=team_id,
                include="team;player.nationality;details.type;player.position"
            )

            df = Transformer.to_dataframe(raw)

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

            time.sleep(TEAM_EXPORT_DELAY)

        except Exception as e:
            print(f"Failed team {team_id}: {e}")
            time.sleep(TEAM_EXPORT_DELAY)


def export_schedules():
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

def export_fixture_stats():
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
    keep_col_lineup = ["id", "fixture_id", "player_id", "team_id", "position_id", "formation_field", "type_id", "formation_position", "player_name", "jersey_number"]
    keep_col_trends = ["id", "fixture_id", "participant_id", "type_id", "value", "minute"]
    keep_col_scores = ["id", "fixture_id", "type_id", "participant_id", "goals", "participant", "description"]
    keep_col_ballcoordinates = ["id", "fixture_id", "period_id", "timer", "x", "y"]
    keep_col_participants = ["id", "fixture_id", "location", "winner", "position"]
    keep_col_timeline = ["id", "fixture_id", "participant_id", "type_id", "section", "player_id", "related_player_id", "result", "info", "addition", "minute", "extra_minute", "injured", "on_bench", "coach_id", "sub_type_id", "detailed_period_id", "rescinded", "sort_order"]
    keep_col_pressure = ["id", "fixture_id", "participant_id", "minute", "pressure"]

    for fixture_id in fixture_list:
        try:
            print(f"Exporting fixture {fixture_id}...")

            raw = Extractor.fixture_stats(
                fixture_id=fixture_id,
                include="lineups;events;statistics;formations;trends;participants;timeline;scores;ballCoordinates;pressure"
            )

            df_lineup = (
                Transformer.extract_nested(raw, ["lineups"])
                .reindex(columns=keep_col_lineup)
            )

            Loader.csv(
                df_lineup,
                f"fixture_lineup_{fixture_id}"
            )

            df_events = (
                Transformer.extract_nested(raw, ["events"])
                .reindex(columns=keep_col_events)
            )

            Loader.csv(
                df_events,
                f"fixture_events_{fixture_id}"
            )

            df_stats = (
                Transformer.extract_nested(raw, ["statistics"])
                .reindex(columns=keep_col_stats)
            )

            Loader.csv(
                df_stats,
                f"fixture_stats_{fixture_id}"
            )

            df_form = (
                Transformer.extract_nested(raw, ["formations"])
                .reindex(columns=keep_col_formations)
            )

            Loader.csv(
                df_form,
                f"fixture_formations_{fixture_id}"
            )

            df_trends = (
                Transformer.extract_nested(raw, ["trends"])
                .reindex(columns=keep_col_trends)
            )

            Loader.csv(
                df_trends,
                f"fixture_trends_{fixture_id}"
            )

            Loader.csv(
                pd.DataFrame(raw["data"]["ballcoordinates"]).assign(
                    fixture_id=fixture_id
                ).reindex(columns=keep_col_ballcoordinates),
                f"fixture_ballcoordinates_{fixture_id}"
            )

            df_participants = (
                Transformer.extract_nested(raw, ["participants", "meta"])
                .reindex(columns=keep_col_participants)
            )

            Loader.csv(
                df_participants,
                f"fixture_participants_{fixture_id}"
            )

            df_scores = (
                Transformer.extract_nested(raw, ["scores", "score"])
                .reindex(columns=keep_col_scores)
            )

            Loader.csv(
                df_scores,
                f"fixture_scores_{fixture_id}"
            )

            # df_timeline = (
            #     Transformer.extract_nested(raw, ["timeline"])
            #     .reindex(columns=[keep_col_timeline])
            # )

            # Loader.csv(
            #     df_timeline,
            #     f"fixture_timeline_{fixture_id}"
            # )

            Loader.csv(
                pd.DataFrame(raw["data"]["pressure"]).assign(
                    fixture_id=fixture_id
                ).reindex(columns=keep_col_pressure),
                f"fixture_pressure_{fixture_id}"
            )

        except Exception as e:
            print(f"Failed fixture {fixture_id}: {e}")
            time.sleep(FIXTURE_EXPORT_DELAY)


def export_topscorers():
    keep_col = ["id", "name", "code", "developer_name", "model_type", "stat_group"]

    raw = Extractor.all_pages(
        Extractor.topscorers,
        season_id=season_id,
        include="type"
    )

    Loader.csv(
        Transformer.to_dataframe(raw),
        f"topscorers_{season_id}"
    )

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
    if season_id is None:
        raise ValueError("Set 'season_id' at the top of run.py before running the script.")

    # Season extraction
    export_standings()
    time.sleep(SEASON_EXPORT_DELAY)

    export_team_stats()
    time.sleep(SEASON_EXPORT_DELAY)

    export_schedules()
    time.sleep(SEASON_EXPORT_DELAY)

    export_topscorers()
    time.sleep(SEASON_EXPORT_DELAY)

    # Build team_list
    team_list = build_id_list(f"teams_stats_{season_id}")
    print(f"[INFO] Loaded {len(team_list)} team IDs from teams_stats_{season_id}.csv")

    # Build fixture_list
    fixture_list = build_id_list(f"fixtures_{season_id}")
    print(f"[INFO] Loaded {len(fixture_list)} fixture IDs from fixtures_{season_id}.csv")

    # Team recursive extraction
    export_squads()

    # Fixture recursive extraction
    export_fixture_stats()

    # Merge recursive CSV outputs
    append_same_prefix_csv(OUTPUT_DIR)

    # Finish
    print("[INFO] Extraction finished.")
