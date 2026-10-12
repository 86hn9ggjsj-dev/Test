"""Mesa de análisis: antes de entrar, cada señal de la sala de trading pasa por una mesa de seis, como la de los
vídeos de «bots de trading en un chat de grupo», pero con reglas fijas y medidas:

- Scout: el volumen de la vela de la señal frente a lo normal (informa; no veta).
- Noticias: cuánto se ha movido la moneda en 24 horas y el régimen macro (informa; no veta).
- Sentimiento: el índice de miedo y codicia del día. No compra con codicia extrema (75 o más) ni vende en corto con
  miedo extremo (25 o menos): ahí suele estar la masa equivocada.
- Charts: la tendencia diaria y el riesgo/beneficio. Solo compra si el último cierre diario está por encima de su media
  de 50 días (y solo vende en corto si está por debajo), y solo si el objetivo está al menos a 1,5 veces la distancia
  del stop.
- Escéptico: lleva la contraria. Si falla cualquiera de las tres reglas, PASA; si no, da el visto bueno.
- Jefe de mesa: anuncia la decisión.

Por qué: con las 213 estrategias que aprobaba la minería de 2024 a 2026 (6.448 operaciones en datos que no había visto),
la operación media perdía un 0,05 %; las que aprobaría esta mesa (una de cada cinco) ganaban de media un 0,15 %, en los
cuatro semestres mejor que sin filtro y en las seis monedas. Es una mejora modesta, no una máquina de hacer dinero:
la mitad de las estrategias casi no llegan a operar y dos de los cuatro semestres siguieron en negativo.

Solo se aplica a la sala de trading y a sus estrategias de la incubadora (velas de 30 minutos), y solo a las entradas
desde que la mesa existe: lo ya operado no cambia.
"""

from __future__ import annotations

import datetime as dt
import json
import threading
import time
import urllib.request

import numpy as np
import pandas as pd

from . import almacen
from .mercado import Mercado

MEDIA_DIAS = 50
RB_MINIMO = 1.5          # el objetivo, al menos a 1,5 veces la distancia del stop
CODICIA_EXTREMA = 75     # no comprar con el índice en 75 o más
MIEDO_EXTREMO = 25       # no vender en corto con el índice en 25 o menos
ROLES = {
    "jefe": "Jefe de mesa", "scout": "Scout", "noticias": "Noticias", "sentimiento": "Sentimiento",
    "charts": "Charts", "esceptico": "Escéptico",
}
_cerrojo = threading.Lock()
_cache: dict = {"t": 0.0, "serie": None}


def _ahora() -> str:
    return dt.datetime.now().astimezone().isoformat(timespec="seconds")


def _num(x: float, d: int = 1) -> str:
    return f"{x:,.{d}f}".replace(",", "_").replace(".", ",").replace("_", ".")


def sentimiento() -> pd.Series:
    """Histórico diario del índice de miedo y codicia de cripto (alternative.me), guardado en sentimiento.json y
    actualizado como mucho cada 6 horas. Si no hay conexión, se usa lo guardado (o nada)."""
    with _cerrojo:
        if _cache["serie"] is not None and time.time() - _cache["t"] < 6 * 3600:
            return _cache["serie"]
        guardado = almacen.cargar("sentimiento", {})
        datos = guardado.get("datos") or []
        viejo = not guardado.get("actualizado") or (pd.Timestamp.now(tz="UTC") - pd.Timestamp(guardado["actualizado"])
                                                     > pd.Timedelta(hours=6))
        if viejo:
            try:
                req = urllib.request.Request("https://api.alternative.me/fng/?limit=0&format=json", headers={"User-Agent": "trading-floor"})
                with urllib.request.urlopen(req, timeout=20) as r:
                    bruto = json.load(r)["data"]
                datos = sorted([[int(x["timestamp"]), int(x["value"])] for x in bruto])
                almacen.guardar("sentimiento", {"datos": datos, "actualizado": pd.Timestamp.now(tz="UTC").isoformat()})
            except (OSError, ValueError, KeyError):
                pass   # sin conexión: lo que hubiera guardado
        serie = pd.Series([v for _, v in datos], index=pd.to_datetime([t for t, _ in datos], unit="s", utc=True), dtype=float)
        _cache.update(t=time.time(), serie=serie)
        return serie


class Contexto:
    """Lo que la mesa necesita de un mercado, calculado una vez por vuelta: cierres diarios y su media, volumen."""

    def __init__(self, m: Mercado, fng: pd.Series | None = None) -> None:
        self.m = m
        c = pd.Series(m.c, index=m.tiempo)
        dia = c.resample("1D").last().dropna()
        self.cierre = dia
        self.media = dia.rolling(MEDIA_DIAS).mean()
        self.fng = sentimiento() if fng is None else fng
        v = getattr(m, "v", None)
        self.vol_rel = None
        if v is not None:
            s = pd.Series(v, index=m.tiempo)
            self.vol_rel = (s / s.rolling(48).mean().shift(1)).to_numpy()

    def tendencia(self, momento: pd.Timestamp) -> tuple[float | None, float | None]:
        """Cierre del último día terminado antes de `momento` y su media de 50 días."""
        dia = momento.floor("D") - pd.Timedelta(days=1)
        k = int(self.cierre.index.searchsorted(dia, side="right")) - 1
        if k < 0 or np.isnan(self.media.iloc[k]):
            return None, None
        return float(self.cierre.iloc[k]), float(self.media.iloc[k])

    def indice(self, momento: pd.Timestamp) -> float | None:
        if self.fng is None or not len(self.fng):
            return None
        k = int(self.fng.index.searchsorted(momento, side="right")) - 1
        return float(self.fng.iloc[k]) if k >= 0 else None


def veredicto(est, ctx: Contexto, e: int) -> dict:
    """La mesa opina sobre la entrada de `est` en la vela `e` (la señal es el cierre de la vela anterior).
    Devuelve {"entra": bool, "motivos": [...], "roles": {rol: texto}}."""
    m = ctx.m
    momento = m.tiempo[e]
    largo = est.direccion == "largo"
    lado = "largo" if largo else "corto"
    moneda = est.simbolo.replace("USDT", "")
    roles: dict[str, str] = {}
    motivos: list[str] = []

    vr = ctx.vol_rel[e - 1] if ctx.vol_rel is not None and e - 1 < len(ctx.vol_rel) else None
    roles["scout"] = (f"{moneda}: señal en {lado} de {est.id}. Volumen {_num(vr)} veces lo normal."
                      if vr is not None and not np.isnan(vr) else f"{moneda}: señal en {lado} de {est.id}.")
    velas_dia = max(1, 1440 // m.minutos)
    if e - 1 - velas_dia >= 0:
        mov = (m.c[e - 1] / m.c[e - 1 - velas_dia] - 1) * 100
        roles["noticias"] = f"{moneda} {'+' if mov >= 0 else '−'}{_num(abs(mov))} % en 24 horas."

    fg = ctx.indice(momento)
    if fg is None:
        roles["sentimiento"] = "Sin dato del índice de miedo y codicia: no lo tengo en cuenta."
    else:
        clase = ("miedo extremo" if fg <= MIEDO_EXTREMO else "miedo" if fg < 45 else "neutral" if fg <= 55
                 else "codicia" if fg < CODICIA_EXTREMA else "codicia extrema")
        roles["sentimiento"] = f"Miedo y codicia: {int(fg)} ({clase})."
        if largo and fg >= CODICIA_EXTREMA:
            motivos.append(f"codicia extrema ({int(fg)}): comprar ahora es ir con la masa")
        elif not largo and fg <= MIEDO_EXTREMO:
            motivos.append(f"miedo extremo ({int(fg)}): vender ahora es ir con la masa")

    cierre, media = ctx.tendencia(momento)
    rb = est.objetivo_atr / est.stop_atr if est.stop_atr else 0.0
    if cierre is None:
        roles["charts"] = f"Sin historia diaria suficiente. Gana {_num(rb)} veces lo que arriesga."
    else:
        a_favor = cierre > media if largo else cierre < media
        roles["charts"] = (f"Tendencia diaria {'a favor' if a_favor else 'en contra'}: cierre {_num(cierre, 2)} "
                           f"{'por encima' if cierre > media else 'por debajo'} de su media de {MEDIA_DIAS} días ({_num(media, 2)}). "
                           f"Gana {_num(rb)} veces lo que arriesga.")
        if not a_favor:
            motivos.append(f"va contra la tendencia diaria ({'precio bajo' if largo else 'precio sobre'} su media de {MEDIA_DIAS} días)")
    if rb < RB_MINIMO:
        motivos.append(f"gana solo {_num(rb)} veces lo que arriesga: demasiado justo (pido {_num(RB_MINIMO)})")

    entra = not motivos
    roles["esceptico"] = (f"{'COMPRA' if largo else 'VENDE EN CORTO'}. Lo he intentado tumbar y aguanta: a favor de la "
                          "tendencia, buen riesgo/beneficio y sin la masa en contra." if entra
                          else "PASA: " + "; ".join(motivos) + ".")
    roles["jefe"] = (f"Adelante, {est.id}: {lado} en {moneda}." if entra else f"{est.id} no entra en {moneda}. Siguiente.")
    return {"entra": entra, "motivos": motivos, "roles": roles}


def resumen_dia(decisiones: list[dict]) -> dict:
    """Cuántas señales ha visto la mesa hoy y cuántas ha dejado pasar (para la oficina)."""
    hoy = dt.datetime.now().astimezone().date().isoformat()
    de_hoy = [d for d in decisiones if str(d.get("t", ""))[:10] == hoy]
    return {"hoy": len(de_hoy), "entran_hoy": sum(1 for d in de_hoy if d.get("entra")),
            "total": len(decisiones), "entran": sum(1 for d in decisiones if d.get("entra"))}
