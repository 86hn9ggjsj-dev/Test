"""Modo tiempo: datos oficiales de NOAA / National Weather Service (api.weather.gov).

Los mercados meteorológicos (temperatura máxima, lluvia, nieve, tormentas) resuelven
con datos oficiales y en pocos días. Es el nicho donde las previsiones públicas pueden
ir por delante del precio, así que el bot los prioriza y le da a Claude una
herramienta para consultar la previsión oficial de cualquier punto de EE. UU.
"""

from __future__ import annotations

import logging
import re

import requests

from .polymarket import Market

NWS_URL = "https://api.weather.gov"
log = logging.getLogger("polybot.weather")

_WEATHER = re.compile(
    r"\b(temperature|°f|°c|degrees|high(?:est)? temp|low(?:est)? temp|rain(?:fall)?|snow(?:fall)?|"
    r"precipitation|hurricane|tropical storm|named storm|tornado|landfall|weather|noaa|nws|nhc|"
    r"inches of|wildfire|heatwave|heat wave|blizzard|frost)\b",
    re.IGNORECASE,
)


def is_weather_market(m: Market) -> bool:
    return bool(_WEATHER.search(m.question)) or "weather.gov" in m.resolution_source or "noaa" in m.resolution_source.lower()


NWS_TOOL = {
    "name": "get_nws_forecast",
    "description": (
        "Official US National Weather Service (NOAA) forecast for a location: the next 7 days "
        "(day/night periods with temperature, precipitation probability and description) plus the "
        "latest observation at the nearest station. Only covers the United States. Pass the "
        "coordinates of the city or station the market resolves on."
    ),
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {
            "latitude": {"type": "number", "description": "Latitude in decimal degrees"},
            "longitude": {"type": "number", "description": "Longitude in decimal degrees"},
        },
        "required": ["latitude", "longitude"],
        "additionalProperties": False,
    },
}


class NWSClient:
    def __init__(self, session: requests.Session | None = None, timeout: float = 15.0):
        self.session = session or requests.Session()
        # La API de NWS exige un User-Agent identificable.
        self.session.headers.setdefault("User-Agent", "polybot/1.0 (prediction-market research)")
        self.session.headers.setdefault("Accept", "application/geo+json")
        self.timeout = timeout

    def _get(self, url: str) -> dict:
        resp = self.session.get(url, timeout=self.timeout)
        resp.raise_for_status()
        return resp.json()

    def forecast(self, latitude: float, longitude: float) -> dict:
        point = self._get(f"{NWS_URL}/points/{latitude:.4f},{longitude:.4f}")["properties"]
        periods = self._get(point["forecast"])["properties"]["periods"]
        out = {
            "location": point.get("relativeLocation", {}).get("properties", {}),
            "forecast": [
                {
                    "name": p.get("name"),
                    "start": p.get("startTime"),
                    "temperature": p.get("temperature"),
                    "unit": p.get("temperatureUnit"),
                    "precip_probability_pct": (p.get("probabilityOfPrecipitation") or {}).get("value"),
                    "wind": f"{p.get('windSpeed', '')} {p.get('windDirection', '')}".strip(),
                    "detail": p.get("detailedForecast"),
                }
                for p in periods[:14]
            ],
        }
        try:
            stations = self._get(point["observationStations"])["features"]
            if stations:
                sid = stations[0]["properties"]["stationIdentifier"]
                obs = self._get(f"{NWS_URL}/stations/{sid}/observations/latest")["properties"]
                temp_c = (obs.get("temperature") or {}).get("value")
                out["latest_observation"] = {
                    "station": sid,
                    "time": obs.get("timestamp"),
                    "temperature_f": None if temp_c is None else round(temp_c * 9 / 5 + 32, 1),
                    "description": obs.get("textDescription"),
                }
        except (requests.RequestException, KeyError, ValueError, IndexError) as exc:
            log.debug("Sin observación reciente: %s", exc)
        return out


def run_nws_tool(client: NWSClient, tool_input: dict) -> tuple[dict, bool]:
    """Ejecuta la herramienta para Claude. Devuelve (resultado, es_error)."""
    try:
        lat, lon = float(tool_input["latitude"]), float(tool_input["longitude"])
        return client.forecast(lat, lon), False
    except (KeyError, TypeError, ValueError) as exc:
        return {"error": f"invalid input: {exc}"}, True
    except requests.RequestException as exc:
        return {"error": f"NWS request failed (outside the US or service down?): {exc}"}, True
