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

from . import academia, almacen, banco, chat, control, fondo, informe
from .config import (CAPITAL_POR_ESTRATEGIA, COSTE_IDA_VUELTA, COSTE_SCALPING, INTERVALO, MAX_POR_SIMBOLO, MAX_SCALPERS_POR_SIMBOLO,
                     CAPITAL_INCUBADORA, INCUBADORA, KELLY_MIN_OPERACIONES, MESAS, PRUEBA, SCALPING_INTERVALO,
                     SCALPING_SIMBOLOS, SIMBOLOS, cupo_banco)

PAGINA = Path(__file__).resolve().parent / "web" / "index.html"
# Archivos que necesita el paseo en primera persona (solo estos: no se sirve nada más del disco).
ESTATICOS = {"/paseo.js": ("paseo.js", False), "/vendor/three.module.min.js": ("vendor/three.module.min.js", True)}


_vivo: dict = {"t": 0.0, "precios": {}}
_lecciones: dict = {"t": 0.0, "datos": None}


def lecciones() -> dict:
    """Lo que enseña la academia (se recalcula como mucho cada 30 segundos)."""
    if _lecciones["datos"] is None or time.time() - _lecciones["t"] > 30:
        try:
            _lecciones["datos"] = academia.lecciones(almacen.cargar("papel", {}))
        except Exception:   # sin datos todavía
            _lecciones["datos"] = None
        _lecciones["t"] = time.time()
    return _lecciones["datos"]
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
    tendencia = almacen.cargar("tendencia", {})
    resumen_fondo = fondo.resumen_rapido(papel, holding, tendencia)
    # las curvas largas solo las necesita el dashboard del fondo (/api/fondo): aquí se quitan para no cargar la oficina
    papel.pop("series", None)
    # de las estrategias retiradas, solo las últimas y sin su curva ni sus operaciones
    for t in [*(papel.get("estrategias") or {}).values(), *(papel.get("incubadora") or {}).values()]:
        for k in ("fracciones", "aprobadas", "vetadas", "forzadas"):   # solo los usa el cálculo, no la oficina
            t.pop(k, None)
        if t.get("examen"):
            t["examen"] = {k: v for k, v in t["examen"].items() if k != "movimientos"}
    retirados = sorted((papel.pop("retirados", None) or {}).values(), key=lambda r: r.get("fin", ""), reverse=True)
    papel["retirados"] = [{k: v for k, v in r.items() if k not in ("serie", "operaciones")} | {"n_operaciones": len(r.get("operaciones", []))}
                          for r in retirados[:40]]
    holding.pop("serie", None)
    for plan in (holding.get("planes") or {}).values():
        plan.pop("serie", None)
    tendencia.pop("serie", None)
    for mon in (tendencia.get("monedas") or {}).values():
        mon.pop("serie", None)
        mon["operaciones"] = mon.get("operaciones", [])[-12:]
    simbolos = set(SIMBOLOS) | set(papel.get("precios", {})) | set(holding.get("planes", {}))
    E = {
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
        "tendencia": tendencia,
        "liquidez": {k: v for k, v in almacen.cargar("liquidez", {}).items() if k != "serie"},
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
        "incubadora": {"capital": CAPITAL_INCUBADORA, "reglas": INCUBADORA},
        "kelly_min_operaciones": KELLY_MIN_OPERACIONES,
        "academia": lecciones(),
        "sistema": almacen.cargar("sistema", {}),
    }
    E["informe"] = informe.generar(E)
    return E


class _Manejador(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802 (nombre impuesto por http.server)
        ruta = self.path.split("?")[0]
        if ruta in ("/", "/index.html"):
            self._responder(PAGINA.read_bytes(), "text/html; charset=utf-8")
        elif ruta in ESTATICOS:
            archivo, guardar = ESTATICOS[ruta]
            self._responder((PAGINA.parent / archivo).read_bytes(), "text/javascript; charset=utf-8", guardar)
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

    def _responder(self, cuerpo: bytes, tipo: str, guardar: bool = False) -> None:
        self.send_response(200)
        self.send_header("Content-Type", tipo)
        self.send_header("Cache-Control", "max-age=86400" if guardar else "no-store")
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
