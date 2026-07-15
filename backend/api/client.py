import requests
from config import BASE_URL, API_TOKEN


class FootballAPI:

    def __init__(self):
        self.base_url = BASE_URL
        self.api_token = API_TOKEN

    def get(self, endpoint, params=None):

        if params is None:
            params = {}

        params["api_token"] = self.api_token

        url = f"{self.base_url}/{endpoint}"

        response = requests.get(
            url,
            params=params,
            timeout=30
        )

        response.raise_for_status()

        return response.json()