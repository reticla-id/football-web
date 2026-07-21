import pandas as pd

INPUT_CSV = r"D:\Alvin\My Project\football-web\backend\data\raw\25964\venues_25964.csv"
OUTPUT_CSV = r"D:\Alvin\My Project\football-web\backend\data\raw\25964\venues_fixed.csv"


def fix_utf8(value):
    if not isinstance(value, str):
        return value

    try:
        return value.encode("latin1").decode("utf-8")
    except Exception:
        return value


# Read CSV
df = pd.read_csv(INPUT_CSV, dtype=str)

# Convert every text column
for col in df.columns:
    df[col] = df[col].map(fix_utf8)

# Save
df.to_csv(
    OUTPUT_CSV,
    index=False,
    encoding="utf-8-sig"
)

print(f"Done: {OUTPUT_CSV}")