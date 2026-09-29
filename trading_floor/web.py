"""Servidor local de la oficina: sirve la página y el estado en JSON (solo en este ordenador)."""

from __future__ import annotations

import datetime as dt
import json
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from . import almacen, banco
from .config import CAPITAL_POR_ESTRATEGIA

PAGINA = Path(__file__).resolve().parent / "web" / "index.html"


def estado() -> dict:
    return {
        "ahora": dt.datetime.now().astimezone().isoformat(timespec="seconds"),
        "mineria": almacen.cargar("mineria", {}),
        "banco": banco.cargar(),
        "papel": almacen.cargar("papel", {}),
        "macro": almacen.cargar("macro", {}),
        "holding": almacen.cargar("holding", {}),
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
