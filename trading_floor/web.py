"""Servidor local de la oficina: sirve la página y el estado en JSON.

Normalmente solo se puede abrir desde este ordenador (127.0.0.1). Con «Abrir en el móvil» se abre además una segunda
puerta en la red de casa (el puerto siguiente), protegida con una clave que va dentro del código QR: el móvil la guarda
en una cookie y cualquier otro aparato de la red sin la clave recibe un «prohibido»."""

from __future__ import annotations

import datetime as dt
import hmac
import http.cookies
import json
import re
import secrets
import socket
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
ESTATICOS = {"/paseo.js": ("paseo.js", False), "/vendor/three.module.min.js": ("vendor/three.module.min.js", True),
             "/vendor/qrcode.js": ("vendor/qrcode.js", True)}


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
        for k in ("fracciones", "aprobadas", "vetadas", "forzadas", "mesa_vistas"):   # solo los usa el cálculo, no la oficina
            t.pop(k, None)
        if t.get("examen"):
            t["examen"] = {k: v for k, v in t["examen"].items() if k != "movimientos"}
    papel["mesa_analisis"] = (papel.get("mesa_analisis") or [])[:20]   # las últimas decisiones de la mesa de análisis
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


_movil: dict = {"servidor": None, "puerto": None, "base": 8050}
_cerrojo_movil = threading.Lock()


def _ip_local() -> str:
    """La dirección de este ordenador en la red de casa (la que usa el móvil para llegar)."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))   # no envía nada: solo sirve para que el sistema elija la tarjeta de red
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


def _clave_movil() -> str:
    datos = almacen.cargar("movil", {})
    if not datos.get("clave"):
        datos["clave"] = secrets.token_urlsafe(9)
        almacen.guardar("movil", datos)
    return datos["clave"]


def estado_movil() -> dict:
    if not _movil["servidor"]:
        return {"activo": False, "puerto": _movil["base"] + 1}
    ip = _ip_local()
    return {"activo": True, "ip": ip, "puerto": _movil["puerto"], "en_red": not ip.startswith("127."),
            "url": f"http://{ip}:{_movil['puerto']}/?clave={_clave_movil()}"}


def activar_movil() -> dict:
    """Abre la puerta para el móvil (si no estaba abierta) y lo recuerda para la próxima vez."""
    with _cerrojo_movil:
        if not _movil["servidor"]:
            puerto = _movil["base"] + 1
            servidor = ThreadingHTTPServer(("0.0.0.0", puerto), _Manejador)
            servidor.es_movil = True
            threading.Thread(target=servidor.serve_forever, daemon=True).start()
            _movil.update(servidor=servidor, puerto=puerto)
        datos = almacen.cargar("movil", {})
        if not datos.get("activo"):
            datos["activo"] = True
            almacen.guardar("movil", datos)
    _clave_movil()
    return estado_movil()


def desactivar_movil() -> dict:
    with _cerrojo_movil:
        servidor = _movil["servidor"]
        if servidor:
            servidor.shutdown()
            servidor.server_close()
        _movil.update(servidor=None, puerto=None)
        datos = almacen.cargar("movil", {})
        datos["activo"] = False
        almacen.guardar("movil", datos)
    return estado_movil()


PROHIBIDO = ("<!doctype html><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
             "<title>Trading Floor</title><body style='margin:0;min-height:100vh;display:grid;place-items:center;background:#0d0d0d;"
             "color:#f0efec;font:15px/1.5 system-ui,sans-serif;padding:24px'><div style='max-width:340px'><b>Falta la clave</b><p style='color:#c3c2b7'>"
             "En el ordenador, abre la oficina, pulsa «Móvil» arriba a la derecha y escanea el código QR con la cámara del móvil."
             "</p></div>").encode()


class _Manejador(BaseHTTPRequestHandler):
    def _es_movil(self) -> bool:
        return getattr(self.server, "es_movil", False)

    def _permitido(self) -> bool:
        """Desde este ordenador, siempre. Desde el móvil (o cualquier aparato de la red), solo con la clave."""
        if not self._es_movil() or self.client_address[0] in ("127.0.0.1", "::1"):
            return True
        try:
            galleta = http.cookies.SimpleCookie(self.headers.get("Cookie", ""))
        except http.cookies.CookieError:
            return False
        dada = galleta["tf_clave"].value if "tf_clave" in galleta else ""
        return hmac.compare_digest(dada.encode(), _clave_movil().encode())

    def do_GET(self) -> None:  # noqa: N802 (nombre impuesto por http.server)
        ruta = self.path.split("?")[0]
        if self._es_movil():
            dada = urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query).get("clave", [""])[0]
            if dada and hmac.compare_digest(dada.encode(), _clave_movil().encode()):
                # el enlace del QR trae la clave: el móvil la guarda y se quita de la barra de direcciones
                self.send_response(303)
                self.send_header("Set-Cookie", f"tf_clave={_clave_movil()}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax")
                self.send_header("Location", "/")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return
            if not self._permitido():
                self.send_response(403)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(PROHIBIDO)))
                self.end_headers()
                self.wfile.write(PROHIBIDO)
                return
        if ruta == "/api/movil" and not self._es_movil():
            self._responder(json.dumps(estado_movil()).encode(), "application/json; charset=utf-8")
        elif ruta in ("/", "/index.html"):
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
        # Solo desde la propia oficina: el navegador no deja a otras webs mandar esta cabecera. Desde el móvil, además,
        # con la clave y desde la misma dirección que sirvió la página.
        origen = self.headers.get("Origin", "")
        propio = re.match(r"^http://(127\.0\.0\.1|localhost)(:\d+)?$", origen) or (self._es_movil() and origen == f"http://{self.headers.get('Host', '')}")
        if self.headers.get("X-Trading-Floor") != "1" or (origen and not propio) or not self._permitido():
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
        elif ruta == "/api/movil" and not self._es_movil():   # solo desde el ordenador se abre o se cierra la puerta del móvil
            try:
                respuesta = activar_movil() if datos.get("activar") else desactivar_movil()
            except OSError as e:
                respuesta = {"activo": False, "error": f"No he podido abrir el puerto {_movil['base'] + 1}: {e}"}
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
    _movil["base"] = puerto
    url = f"http://127.0.0.1:{puerto}"
    print(f"[web] Oficina abierta en {url}", flush=True)
    if almacen.cargar("movil", {}).get("activo"):   # la última vez se dejó abierta la puerta del móvil
        try:
            m = activar_movil()
            print(f"[web] También en el móvil (mismo WiFi): {m['url']}", flush=True)
        except OSError as e:
            print(f"[web] No he podido abrir la puerta del móvil (puerto {puerto + 1}): {e}", flush=True)
    if abrir:
        webbrowser.open(url)
    return servidor
