from services.extractor import Extractor
from services.transformer import Transformer
from services.loader import Loader


class ETL:

    @staticmethod
    def export(
        endpoint,
        filename,
        columns=None,
        rename=None,
        **params
    ):

        raw = Extractor.fetch(
            endpoint,
            **params
        )

        df = Transformer.dataframe(raw)

        if columns:
            df = df[columns]

        if rename:
            df = df.rename(columns=rename)

        Loader.csv(
            df,
            filename
        )

        return df