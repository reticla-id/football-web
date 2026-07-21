from os import path
import time
import pandas as pd


class Transformer:

    @staticmethod
    def to_dataframe(data):

        if not data:
            return pd.DataFrame()

        if isinstance(data, dict) and "data" in data:
            data = data["data"]

        if isinstance(data, dict):
            data = [data]

        return pd.json_normalize(data, sep="_")

    @staticmethod
    def extract_nested(data, path):

        # Handle SportMonks response
        if isinstance(data, dict):
            data = data.get("data", data)

        if isinstance(data, dict):
            data = [data]

        rows = []

        ID_MAPPING = {
            "rounds": "round_id",
            "fixtures": "fixture_id",
            "participants": "participant_id",
            "statistics": "statistic_id",
            "details": "detail_id",
            "scores": "score_id",
            "events": "event_id",
            "trends": "trend_id",
            "formations": "formation_id",
            "lineups": "lineup_id",
            "ballcoordinates": "ballcoordinate_id",
            "timeline": "timeline_id",
            "pressure": "pressure_id"
        }

        def flatten(prefix, value, row):

            if isinstance(value, dict):

                if "id" in value:
                    row[f"{prefix}id"] = value["id"]

                else:
                    for k, v in value.items():
                        flatten(f"{prefix}{k}_", v, row)

            elif not isinstance(value, list):
                row[prefix[:-1]] = value

        def recurse(obj, keys, context):

            if not isinstance(obj, dict):
                return

            row = context.copy()

            # Simpan semua field primitive parent
            for k, v in obj.items():
                if not isinstance(v, (dict, list)):
                    row[k] = v

            # Flatten semua nested dict
            for k, v in obj.items():
                if isinstance(v, dict):
                    flatten(f"{k}_", v, row)

            # Sampai object tujuan
            if not keys:
                rows.append(row)
                return

            key = keys[0]

            # Simpan parent id
            if key == "participants" and "id" in obj:
                row["fixture_id"] = obj["id"]

            children = obj.get(key)

            if children is None:
                return

            # Support {"data":[...]}
            if isinstance(children, dict) and "data" in children:
                children = children["data"]

            # Support object tunggal
            elif isinstance(children, dict):
                children = [children]

            # Harus list
            if not isinstance(children, list):
                return

            for child in children:

                child_row = row.copy()

                if isinstance(child, dict) and "id" in child and key in ID_MAPPING:
                    child_row[ID_MAPPING[key]] = child["id"]

                recurse(child, keys[1:], child_row)

        for item in data:
            recurse(item, path, {})

        return pd.DataFrame(rows)
    
    @staticmethod
    def extract_root_list(raw, key, parent=None):
        data = raw.get("data", {})

        rows = data.get(key, [])

        df = pd.DataFrame(rows)

        if parent:
            for col, value in parent.items():
                df[col] = value

        return df