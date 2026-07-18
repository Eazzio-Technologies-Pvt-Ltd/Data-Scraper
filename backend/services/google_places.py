'''import requests
import time
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY     = os.getenv("GOOGLE_API_KEY")
MAX_RESULTS = int(os.getenv("MAX_RESULTS", 60))
BASE_URL    = "https://maps.googleapis.com/maps/api/place"

def search_places(keyword: str, location: str) -> list:
    query    = f"{keyword} in {location}"
    url      = f"{BASE_URL}/textsearch/json"
    results  = []
    params   = {"query": query, "key": API_KEY}

    for page in range(3):
        if page > 0:
            time.sleep(2)
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if data.get("status") not in ["OK", "ZERO_RESULTS"]:
            raise Exception(f"Google API error: {data.get('status')}")
        results.extend(data.get("results", []))
        token = data.get("next_page_token")
        if not token or len(results) >= MAX_RESULTS:
            break
        params = {"pagetoken": token, "key": API_KEY}

    return results[:MAX_RESULTS]

def get_place_details(place_id: str) -> dict:
    url    = f"{BASE_URL}/details/json"
    params = {
        "place_id": place_id,
        "fields":   "formatted_phone_number,website",
        "key":      API_KEY
    }
    resp   = requests.get(url, params=params, timeout=10)
    result = resp.json().get("result", {})
    return {
        "phone":   result.get("formatted_phone_number"),
        "website": result.get("website")
    }
'''
import requests
import os
from dotenv import load_dotenv

load_dotenv()
SERPAPI_KEY = os.getenv("SERPAPI_KEY")
MAX_RESULTS = int(os.getenv("MAX_RESULTS", 60))

def search_places(keyword: str, location: str) -> list:
    results = []
    start   = 0

    while len(results) < MAX_RESULTS:
        params = {
            "engine":  "google_maps",
            "q":       f"{keyword} {location}",
            "type":    "search",
            "api_key": SERPAPI_KEY,
            "start":   start,
            "hl":      "en",
            "gl":      "in",
        }

        resp = requests.get(
            "https://serpapi.com/search",
            params=params,
            timeout=15
        )
        data = resp.json()

        if "error" in data:
            break

        places = data.get("local_results", [])
        if not places:
            break

        results.extend(places)
        if len(places) < 20:
            break
        start += 20

    return results[:MAX_RESULTS]


def get_place_details(place_id: str) -> dict:
    return {"phone": None, "website": None}