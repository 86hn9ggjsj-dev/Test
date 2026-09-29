"""Servidor local de la oficina: sirve la página y el estado en JSON (solo en este ordenador)."""

from __future__ import annotations

import datetime as dt
import json
import threading
import time
import urllib.parse
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from . import almacen, banco
from .config import CAPITAL_POR_ESTRATEGIA, COSTE_IDA_VUELTA, SIMBOLOS

PAGINA = Path(__file__).resolve().parent / "web" / "index.html"


_vivo: dict = {"t": 0.0, "precios": {}}
_cerrojo = threading.Lock()


def precios_en_vivo(simbolos: set[str]) -> dict[str, float]:
    """Último precio de cada símbolo en Binance, como mucho con 5 segundos de retraso."""
    with _cerrojo:
        if time.time() - _vivo["t"] > 5 and simbolos:
            lista = json.dumps(sorted(simbolos), separators=(",", ":"))
            url = "https://data-api.binance.vision/api/v3/ticker/price?" + urllib.parse.urlencode({"symbols": lista})
            try:
                with urllib.request.urlopen(url, timeout=4) as resp:
                    _vivo["precios"] = {x["symbol"]: float(x["price"]) for x in json.load(resp)}
            except (OSError, ValueError, KeyError):
                pass  # sin conexión: se muestran los últimos precios conocidos
            _vivo["t"] = time.time()
        return dict(_vivo["precios"])


def estado() -> dict:
    papel, holding = almacen.cargar("papel", {}), almacen.cargar("holding", {})
    simbolos = set(SIMBOLOS) | set(papel.get("precios", {})) | set(holding.get("planes", {}))
    return {
        "vivo": precios_en_vivo(simbolos),
        "coste_ida_vuelta": COSTE_IDA_VUELTA,
        "ahora": dt.datetime.now().astimezone().isoformat(timespec="seconds"),
        "mineria": almacen.cargar("mineria", {}),
        "banco": banco.cargar(),
        "papel": papel,
        "macro": almacen.cargar("macro", {}),
        "holding": holding,
        "capital_por_estrategia": CAPITAL_POR_ESTRATEGIA,
    }


class _Manejador(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802 (nombre impuesto por http.server)
        ruta = self.path.split("?")[0]
        if ruta in ("/", "/index.html"):
            self._responder(PAGINA.read_bytes(), "text/html; charset=utf-8")
        elif ruta == "/api/estado":
            self._responder(json.dumps(estado(), ensure_ascii=False).encode(), "application/json; charset=utf-8")
        else:
            self.send_error(404)

    def _responder(self, cuerpo: bytes, tipo: str) -> None:
        self.send_response(200)
        self.send_header("Content-Type", tipo)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.end_headers()
        self.wfile.write(cuerpo)

    def log_message(self, *args) -> None:
        pass  # sin ruido en la consola


def servir(puerto: int = 8050, abrir: bool = True) -> ThreadingHTTPServer:
    """Arranca el servidor en segundo plano y devuelve el objeto servidor."""
    servidor = ThreadingHTTPServer(("127.0.0.1", puerto), _Manejador)
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{puerto}"
    print(f"[web] Oficina abierta en {url}", flush=True)
    if abrir:
        webbrowser.open(url)
    return servidor
