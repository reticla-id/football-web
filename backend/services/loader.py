from pathlib import Path


class Loader:

    @staticmethod
    def csv(df, filename):

        output = Path("data/raw")

        output.mkdir(
            parents=True,
            exist_ok=True
        )

        df.to_csv(
            output / f"{filename}.csv",
            index=False
        )