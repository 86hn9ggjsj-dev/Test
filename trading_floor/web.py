"""Servidor local de la oficina: sirve la página y el estado en JSON (solo en este ordenador)."""

from __future__ import annotations

import datetime as dt
import json
import re
import threading
import time
import urllib.parse
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from . import almacen, banco, chat, control, fondo
from .config import (CAPITAL_POR_ESTRATEGIA, COSTE_IDA_VUELTA, COSTE_SCALPING, INTERVALO, MAX_POR_SIMBOLO, MAX_SCALPERS_POR_SIMBOLO,
                     MESAS, PRUEBA, SCALPING_INTERVALO, SCALPING_SIMBOLOS, SIMBOLOS, cupo_banco)

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
    papel, holding, lista = almacen.cargar("papel", {}), almacen.cargar("holding", {}), banco.cargar()
    resumen_fondo = fondo.resumen_rapido(papel, holding)
    # las curvas largas solo las necesita el dashboard del fondo (/api/fondo): aquí se quitan para no cargar la oficina
    papel.pop("series", None)
    # de las estrategias retiradas, solo las últimas y sin su curva ni sus operaciones
    retirados = sorted((papel.pop("retirados", None) or {}).values(), key=lambda r: r.get("fin", ""), reverse=True)
    papel["retirados"] = [{k: v for k, v in r.items() if k not in ("serie", "operaciones")} | {"n_operaciones": len(r.get("operaciones", []))}
                          for r in retirados[:40]]
    holding.pop("serie", None)
    for plan in (holding.get("planes") or {}).values():
        plan.pop("serie", None)
    simbolos = set(SIMBOLOS) | set(papel.get("precios", {})) | set(holding.get("planes", {}))
    return {
        "vivo": precios_en_vivo(simbolos),
        "control": control.cargar(),
        "chat_modo": "claude" if chat.hay_clave() else "basico",
        "coste_ida_vuelta": COSTE_IDA_VUELTA,
        "coste_scalping": COSTE_SCALPING,
        "ahora": dt.datetime.now().astimezone().isoformat(timespec="seconds"),
        "mineria": almacen.cargar("mineria", {}),
        "banco": lista,
        "repetidas": [[a["id"], [x["id"] for x in resto]] for a, resto in banco.repetidas(lista)],
        "papel": papel,
        "macro": almacen.cargar("macro", {}),
        "holding": holding,
        "fondo": resumen_fondo,
        "capital_por_estrategia": CAPITAL_POR_ESTRATEGIA,
        "simbolos": SIMBOLOS,
        "max_por_simbolo": MAX_POR_SIMBOLO,
        "cupo_banco": cupo_banco(INTERVALO),   # estrategias por activo en el banco: las de las mesas más la reserva
        "mesas": MESAS,
        "prueba": PRUEBA,
        "descartadas": len(banco.descartadas()),
        "scalping": {"simbolos": SCALPING_SIMBOLOS, "max_por_simbolo": MAX_SCALPERS_POR_SIMBOLO, "intervalo": SCALPING_INTERVALO,
                     "cupo_banco": cupo_banco(SCALPING_INTERVALO)},
    }


class _Manejador(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802 (nombre impuesto por http.server)
        ruta = self.path.split("?")[0]
        if ruta in ("/", "/index.html"):
            self._responder(PAGINA.read_bytes(), "text/html; charset=utf-8")
        elif ruta == "/api/estado":
            self._responder(json.dumps(estado(), ensure_ascii=False).encode(), "application/json; charset=utf-8")
        elif ruta == "/api/fondo":
            try:
                datos = fondo.analitica(precios_en_vivo(set(SIMBOLOS)))
            except Exception as e:  # sin datos todavía o sin conexión
                datos = {"error": str(e)}
            self._responder(json.dumps(datos, ensure_ascii=False).encode(), "application/json; charset=utf-8")
        else:
            self.send_error(404)

    def do_POST(self) -> None:  # noqa: N802
        # Solo desde la propia oficina: el navegador no deja a otras webs mandar esta cabecera.
        origen = self.headers.get("Origin", "")
        if self.headers.get("X-Trading-Floor") != "1" or (origen and not re.match(r"^http://(127\.0\.0\.1|localhost)(:\d+)?$", origen)):
            self.send_error(403)
            return
        try:
            datos = json.loads(self.rfile.read(min(int(self.headers.get("Content-Length", 0)), 100_000)) or b"{}")
        except ValueError:
            self.send_error(400)
            return
        ruta = self.path.split("?")[0]
        if ruta == "/api/chat":
            nombres = {str(k): str(v) for k, v in (datos.get("nombres") or {}).items()}
            respuesta = chat.responder(str(datos.get("texto", "")), datos.get("para"), estado(), nombres)
        elif ruta == "/api/decision":
            try:
                respuesta = {"ok": True, "texto": control.aplicar(datos.get("propuesta") or {})}
            except (ValueError, TypeError) as e:
                respuesta = {"ok": False, "texto": str(e)}
            except Exception as e:  # sin conexión al rehacer un plan de holding, etc.
                respuesta = {"ok": False, "texto": f"No se ha podido aplicar: {e}"}
        else:
            self.send_error(404)
            return
        self._responder(json.dumps(respuesta, ensure_ascii=False).encode(), "application/json; charset=utf-8")

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
