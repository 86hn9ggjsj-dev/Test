"""Tu fondo de inversión cripto (simulado, con dinero ficticio).

Funciona como un fondo de verdad:
- Tú aportas capital y recibes participaciones. El valor liquidativo (VL) es lo que vale cada
  participación: patrimonio del fondo / participaciones. Aportar o retirar dinero no cambia el VL;
  solo lo mueven las ganancias y las pérdidas, así que la rentabilidad del VL es la del fondo.
- El capital se reparte entre la sala de trading, la de scalping, las carteras de holding y la sala de tendencia
  según el reparto que elijas (en %); lo que no está asignado es liquidez. En trading y scalping, el % se divide
  entre sus mesas (capital de cada trader); en holding y en tendencia es el presupuesto de sus carteras. Al cambiar el
  reparto, o al aportar o retirar dinero, el capital se reajusta desde ese momento: lo ganado antes se
  conserva.
- Patrimonio = dinero aportado − dinero retirado + resultado de todas las áreas.

Se calcula a partir de las curvas de resultado del paper trading (papel.py), del holding (holding.py) y de la
sala de tendencia (tendencia.py),
hora a hora desde el inicio del fondo, y se compara con haber comprado BTC el mismo día.
Nunca toca dinero real.
"""

from __future__ import annotations

import datetime as dt
import threading
import time

import numpy as np
import pandas as pd

from . import almacen
from .config import (CAPITAL_HOLDING, CAPITAL_POR_ESTRATEGIA, COSTE_IDA_VUELTA, COSTE_SCALPING, FONDO_CAPITAL_INICIAL,
                     FONDO_VL_INICIAL, MESAS)

AREAS = ("trading", "scalping", "holding", "tendencia")
_cerrojo = threading.RLock()
_cache: dict = {"t": 0.0, "datos": None}


def _ahora() -> str:
    return dt.datetime.now().astimezone().isoformat(timespec="seconds")


def _serie(puntos: list | None) -> pd.Series:
    if not puntos:
        return pd.Series(dtype=float)
    return pd.Series([float(v) for _, v in puntos], index=pd.to_datetime([t for t, _ in puntos], utc=True)).sort_index()


def _series_areas(papel: dict, holding: dict, tendencia: dict | None = None) -> dict[str, pd.Series]:
    series = papel.get("series") or {}
    return {"trading": _serie(series.get("trading")), "scalping": _serie(series.get("scalping")),
            "holding": _serie(holding.get("serie")), "tendencia": _serie((tendencia or {}).get("serie"))}


def cargar(papel: dict | None = None, holding: dict | None = None, tendencia: dict | None = None) -> dict:
    """Estado del fondo (inicio y movimientos). La primera vez se abre con el capital inicial, con fecha del
    primer resultado que haya (así la historia del fondo incluye lo que ya se ha operado)."""
    with _cerrojo:
        f = almacen.cargar("fondo", {})
        if f.get("movimientos"):
            return f
        papel = almacen.cargar("papel", {}) if papel is None else papel
        holding = almacen.cargar("holding", {}) if holding is None else holding
        tendencia = almacen.cargar("tendencia", {}) if tendencia is None else tendencia
        inicios = [s.index[0] for s in _series_areas(papel, holding, tendencia).values() if len(s)]
        inicio = ((min(inicios) - pd.Timedelta(hours=1)) if inicios else pd.Timestamp.now(tz="UTC")).floor("h")
        f = {"inicio": inicio.isoformat(), "movimientos": [
            {"t": inicio.isoformat(), "tipo": "aportacion", "importe": FONDO_CAPITAL_INICIAL, "nota": "capital inicial"}]}
        # Si ya hay traders o carteras pero aún no se han calculado sus curvas (primer arranque de esta versión),
        # no se guarda: así el fondo empieza con el primer resultado y no «hoy».
        hay_actividad = bool(papel.get("estrategias")) or bool(holding.get("planes")) or bool(tendencia.get("cartera"))
        if inicios or not hay_actividad:
            almacen.guardar("fondo", f)
        return f


def _reparto_inicial() -> dict:
    """El reparto de antes de poder elegirlo: 1.000 $ por mesa y el presupuesto de holding de config.py."""
    return {"trading": round(MESAS["trading"] * CAPITAL_POR_ESTRATEGIA / FONDO_CAPITAL_INICIAL * 100, 2),
            "scalping": round(MESAS["scalping"] * CAPITAL_POR_ESTRATEGIA / FONDO_CAPITAL_INICIAL * 100, 2),
            "holding": round(sum(CAPITAL_HOLDING.values()) / FONDO_CAPITAL_INICIAL * 100, 2), "tendencia": 0.0}


def reparto(f: dict | None = None) -> dict:
    """Reparto objetivo en % de cada área (la liquidez es lo que queda hasta 100)."""
    f = almacen.cargar("fondo", {}) if f is None else f
    r = dict(f.get("reparto") or _reparto_inicial())
    r.setdefault("tendencia", 0.0)   # repartos guardados antes de existir la sala de tendencia
    r["liquidez"] = round(100 - sum(r[a] for a in AREAS), 2)
    return r


def capitales(f: dict | None = None) -> list[tuple[pd.Timestamp, float, float]]:
    """Capital de cada mesa a lo largo del tiempo: [(desde, trader, scalper)]. Lo usa el paper trading para que,
    al cambiar el reparto, cada trader opere con su capital nuevo desde ese momento sin perder lo ganado."""
    f = almacen.cargar("fondo", {}) if f is None else f
    lista = f.get("capitales") or [{"t": "2000-01-01T00:00:00+00:00", "trader": CAPITAL_POR_ESTRATEGIA,
                                    "scalper": CAPITAL_POR_ESTRATEGIA}]
    return sorted((pd.Timestamp(c["t"]), float(c["trader"]), float(c["scalper"])) for c in lista)


def capital_mesa(grupo: str, momento: pd.Timestamp | None = None) -> float:
    """Capital de una mesa (de trading o de scalping) en un momento dado (por defecto, ahora)."""
    col = 2 if grupo == "scalping" else 1
    tramos = capitales()
    valido = [c for c in tramos if momento is None or c[0] <= momento]
    return (valido[-1] if valido else tramos[0])[col]


def asignar(nuevo: dict, patrimonio: float) -> dict:
    """Guarda un reparto nuevo (en %) y el capital de cada mesa que sale de él desde ahora."""
    r = {a: round(float(nuevo.get(a, 0.0)), 2) for a in AREAS}
    for a, v in r.items():
        if not 0 <= v <= 100:
            raise ValueError(f"El % de {a} tiene que estar entre 0 y 100.")
    if sum(r.values()) > 100.001:
        raise ValueError(f"Entre trading, scalping, holding y tendencia suman {sum(r.values()):g} %: no puede pasar del 100 %."
                         .replace(f"{sum(r.values()):g}", f"{sum(r.values()):g}".replace(".", ",")))
    if patrimonio <= 0:
        raise ValueError("El fondo no tiene patrimonio que repartir.")
    trader = round(r["trading"] / 100 * patrimonio / MESAS["trading"], 2)
    scalper = round(r["scalping"] / 100 * patrimonio / MESAS["scalping"], 2)
    with _cerrojo:
        f = cargar()
        f.setdefault("capitales", [{"t": f["inicio"], "trader": CAPITAL_POR_ESTRATEGIA, "scalper": CAPITAL_POR_ESTRATEGIA}])
        f["reparto"] = r
        f["capitales"].append({"t": pd.Timestamp.now(tz="UTC").isoformat(), "trader": trader, "scalper": scalper})
        almacen.guardar("fondo", f)
    _cache["t"] = _cache_resumen["t"] = 0.0
    return {**reparto(f), "trader": trader, "scalper": scalper, "holding_pct": r["holding"],
            "holding": round(r["holding"] / 100 * patrimonio, 2), "tendencia_pct": r["tendencia"],
            "tendencia": round(r["tendencia"] / 100 * patrimonio, 2)}


def mover(tipo: str, importe: float, liquidez: float) -> dict:
    """Aportación o reembolso (dinero ficticio). Un reembolso no puede superar la liquidez del fondo."""
    if tipo not in ("aportacion", "reembolso"):
        raise ValueError("Movimiento desconocido.")
    if not 100 <= importe <= 1_000_000:
        raise ValueError("El importe tiene que estar entre 100 y 1.000.000 $ ficticios.")
    if tipo == "reembolso" and importe > liquidez:
        raise ValueError(f"Solo puedes retirar la liquidez del fondo ({liquidez:,.0f} $). El resto está invertido en "
                         "traders y carteras; para retirar más habría que sacar capital de ellos.".replace(",", "."))
    with _cerrojo:
        f = cargar()
        f["movimientos"].append({"t": pd.Timestamp.now(tz="UTC").isoformat(), "tipo": tipo, "importe": float(importe)})
        almacen.guardar("fondo", f)
    _cache["t"] = _cache_resumen["t"] = 0.0
    return f


def _valor_liquidativo(indice: pd.DatetimeIndex, resultado: pd.Series, movimientos: list[dict]):
    """Aportado neto, patrimonio, participaciones y VL en cada punto. Cada movimiento compra o vende
    participaciones al VL de ese momento, así que no altera el VL."""
    movs = sorted(movimientos, key=lambda m: m["t"])
    aportado, participaciones, vl_prev = 0.0, 0.0, FONDO_VL_INICIAL
    k = 0
    ap, pat, par, vl = [], [], [], []
    for t, r in zip(indice, resultado.values):
        while k < len(movs) and pd.Timestamp(movs[k]["t"]) <= t:
            m = movs[k]
            signo = 1 if m["tipo"] == "aportacion" else -1
            precio = vl_prev if participaciones else FONDO_VL_INICIAL
            participaciones += signo * m["importe"] / precio
            aportado += signo * m["importe"]
            m["participaciones"] = round(m["importe"] / precio, 4)
            m["vl"] = round(precio, 4)
            k += 1
        patrimonio = aportado + r
        vl_prev = patrimonio / participaciones if participaciones else FONDO_VL_INICIAL
        ap.append(aportado)
        pat.append(patrimonio)
        par.append(participaciones)
        vl.append(vl_prev)
    return np.array(ap), np.array(pat), np.array(par), np.array(vl)


def _metricas(vl: pd.Series) -> dict:
    """Rentabilidades, volatilidad, Sharpe y caídas a partir del valor liquidativo."""
    if len(vl) < 2:
        return {}
    ahora, v0 = vl.index[-1], vl.iloc[0]

    def desde(delta: pd.Timedelta) -> float | None:
        previo = vl[vl.index <= ahora - delta]
        return round(float(vl.iloc[-1] / previo.iloc[-1] - 1) * 100, 3) if len(previo) else None

    local = vl.copy()
    local.index = local.index.tz_convert(dt.datetime.now().astimezone().tzinfo)
    inicio_anio = local[local.index < pd.Timestamp(dt.date.today().replace(month=1, day=1)).tz_localize(local.index.tz)]
    diario = local.resample("1D").last().dropna()
    rend = diario.pct_change().dropna()
    maximo = vl.cummax()
    caidas = vl / maximo - 1
    dias = max((vl.index[-1] - vl.index[0]).total_seconds() / 86400, 1e-9)
    total = float(vl.iloc[-1] / v0 - 1)
    return {
        "rentabilidad_pct": round(total * 100, 3),
        "anualizada_pct": round(((1 + total) ** (365 / dias) - 1) * 100, 2) if dias >= 30 else None,
        "r24h_pct": desde(pd.Timedelta(hours=24)), "r7d_pct": desde(pd.Timedelta(days=7)),
        "r30d_pct": desde(pd.Timedelta(days=30)),
        "anio_pct": round(float(vl.iloc[-1] / inicio_anio.iloc[-1] - 1) * 100, 3) if len(inicio_anio) else round(total * 100, 3),
        "volatilidad_pct": round(float(rend.std() * np.sqrt(365)) * 100, 2) if len(rend) >= 5 else None,
        "sharpe": round(float(rend.mean() / rend.std() * np.sqrt(365)), 2) if len(rend) >= 7 and rend.std() > 0 else None,
        # Sortino: como el Sharpe, pero solo penaliza los días malos. Calmar: rentabilidad anual entre la peor caída.
        "sortino": (round(float(rend.mean() / rend[rend < 0].std() * np.sqrt(365)), 2)
                    if len(rend) >= 7 and (rend < 0).sum() >= 2 and rend[rend < 0].std() > 0 else None),
        "calmar": (round(float(((1 + total) ** (365 / dias) - 1) / abs(caidas.min())), 2)
                   if dias >= 30 and caidas.min() < 0 else None),
        "caida_max_pct": round(float(caidas.min()) * 100, 3),
        "caida_actual_pct": round(float(caidas.iloc[-1]) * 100, 3),
        "mejor_dia": [rend.idxmax().date().isoformat(), round(float(rend.max()) * 100, 3)] if len(rend) else None,
        "peor_dia": [rend.idxmin().date().isoformat(), round(float(rend.min()) * 100, 3)] if len(rend) else None,
        "dias_positivos_pct": round(float((rend > 0).mean()) * 100, 1) if len(rend) else None,
        "dias": round(dias, 1),
    }


def _montecarlo(vl: pd.Series, dias: int = 30, n: int = 5000) -> dict | None:
    """Monte Carlo del equipo Quant: se barajan los rendimientos diarios reales del fondo para simular `n` futuros de
    `dias` días. Da el rango probable (percentiles 5, 50 y 95), la probabilidad de perder y la de caer un 5 % o más
    en algún momento. Con menos de 10 días de historia no se calcula (sería inventar)."""
    local = vl.copy()
    local.index = local.index.tz_convert(dt.datetime.now().astimezone().tzinfo)
    rend = local.resample("1D").last().dropna().pct_change().dropna().to_numpy()
    if len(rend) < 10:
        return None
    rng = np.random.default_rng(7)
    caminos = np.cumprod(1 + rng.choice(rend, size=(n, dias), replace=True), axis=1)
    final = caminos[:, -1] - 1
    caida = (caminos / np.maximum.accumulate(np.hstack([np.ones((n, 1)), caminos]), axis=1)[:, 1:] - 1).min(axis=1)
    return {"dias": dias, "muestra_dias": int(len(rend)), "simulaciones": n,
            "p5_pct": round(float(np.percentile(final, 5)) * 100, 2), "p50_pct": round(float(np.percentile(final, 50)) * 100, 2),
            "p95_pct": round(float(np.percentile(final, 95)) * 100, 2),
            "prob_perdida_pct": round(float((final < 0).mean()) * 100, 1),
            "prob_caida5_pct": round(float((caida <= -.05).mean()) * 100, 1),
            "var95_dia_pct": round(float(-np.percentile(rend, 5)) * 100, 3)}


def _mensual(vl: pd.Series) -> list[list]:
    """Rentabilidad de cada mes: [año, mes, %]."""
    if len(vl) < 2:
        return []
    local = vl.copy()
    local.index = local.index.tz_convert(dt.datetime.now().astimezone().tzinfo)
    fin_mes = local.resample("MS").last()
    base = pd.concat([pd.Series([vl.iloc[0]], index=[fin_mes.index[0] - pd.Timedelta(days=1)]), fin_mes])
    cambio = base.pct_change().dropna()
    return [[t.year, t.month, round(float(v) * 100, 3)] for t, v in cambio.items()]


def _operaciones(traders: dict) -> tuple[dict, list[dict]]:
    ops = [dict(o, id=i, simbolo=t["simbolo"], direccion=t["direccion"], grupo=t.get("grupo", "trading"))
           for i, t in traders.items() for o in t.get("operaciones", [])]
    ganancias = [o.get("resultado_usd", CAPITAL_POR_ESTRATEGIA * o["retorno_pct"] / 100) for o in ops]
    positivas, negativas = sum(g for g in ganancias if g > 0), -sum(g for g in ganancias if g < 0)
    stats = {
        "cerradas": len(ops),
        "aciertos_pct": round(sum(g > 0 for g in ganancias) / len(ops) * 100, 1) if ops else None,
        "factor_beneficio": round(positivas / negativas, 2) if negativas else None,
        "media": round(float(np.mean(ganancias)), 2) if ops else None,
        "mejor": round(max(ganancias), 2) if ops else None,
        "peor": round(min(ganancias), 2) if ops else None,
        "comisiones": round(sum(t.get("comisiones", 0.0) for t in traders.values()), 2),
        "coste_ida_vuelta_pct": round(COSTE_IDA_VUELTA * 100, 3),
        "coste_scalping_pct": round(COSTE_SCALPING * 100, 3),
    }
    ultimas = sorted(ops, key=lambda o: o["salida_t"], reverse=True)[:25]
    return stats, [{k: o.get(k) for k in ("id", "simbolo", "direccion", "grupo", "entrada_t", "salida_t", "entrada", "salida",
                                           "retorno_pct", "resultado_usd", "motivo")} for o in ultimas]


def _reparto(papel: dict, holding: dict, patrimonio: float, vivo: dict,
             tendencia: dict | None = None) -> tuple[dict, list[dict], list[dict]]:
    """Dónde está el dinero (por área) y cuánta exposición hay en cada activo."""
    traders = papel.get("estrategias") or {}
    area = {g: sum(t.get("patrimonio", CAPITAL_POR_ESTRATEGIA) for t in traders.values() if t.get("grupo", "trading") == g)
            for g in ("trading", "scalping")}
    area["holding"] = sum(p.get("valor", 0.0) for p in (holding.get("planes") or {}).values())
    area["tendencia"] = sum(p.get("valor", 0.0) for p in ((tendencia or {}).get("monedas") or {}).values())
    area["liquidez"] = patrimonio - sum(area.values())
    exposicion: dict[str, dict] = {}
    abiertas = []
    for i, t in traders.items():
        p = t.get("posicion")
        if not p:
            continue
        nocional = t.get("patrimonio", CAPITAL_POR_ESTRATEGIA) * p["fraccion"]
        e = exposicion.setdefault(t["simbolo"], {"largo": 0.0, "corto": 0.0})
        e["largo" if t["direccion"] == "largo" else "corto"] += nocional
        abiertas.append({"id": i, "simbolo": t["simbolo"], "direccion": t["direccion"], "grupo": t.get("grupo", "trading"),
                         "entrada": p["entrada"], "entrada_t": p["entrada_t"], "fraccion": p["fraccion"],
                         "nocional": round(nocional, 2), "retorno_pct": p["retorno_pct"], "stop": p.get("stop"),
                         "objetivo": p.get("objetivo")})
    for s, p in (holding.get("planes") or {}).items():
        precio = vivo.get(s) or p.get("precio") or 0
        e = exposicion.setdefault(s, {"largo": 0.0, "corto": 0.0})
        e["largo"] += p.get("unidades", 0) * precio
    for s, p in ((tendencia or {}).get("monedas") or {}).items():
        precio = vivo.get(s) or p.get("precio") or 0
        e = exposicion.setdefault(s, {"largo": 0.0, "corto": 0.0})
        e["largo"] += p.get("unidades", 0) * precio
    lista = [{"simbolo": s, "largo": round(e["largo"], 2), "corto": round(e["corto"], 2), "neto": round(e["largo"] - e["corto"], 2)}
             for s, e in sorted(exposicion.items(), key=lambda x: -(x[1]["largo"] + x[1]["corto"]))]
    return {k: round(v, 2) for k, v in area.items()}, lista, abiertas


def _btc(indice: pd.DatetimeIndex) -> pd.Series | None:
    """Precio de BTC en cada hora del fondo (velas de 1 hora de Binance)."""
    try:
        from .datos import velas

        dias = max(30, int((pd.Timestamp.now(tz="UTC") - indice[0]).days) + 3)
        c = velas("BTCUSDT", "1h", dias)["close"]
        c.index = c.index + pd.Timedelta(hours=1)  # hora de cierre de cada vela
        return c.reindex(indice, method="ffill")
    except Exception:  # sin conexión: el fondo se muestra igual, sin la comparación
        return None


def calcular(papel: dict | None = None, holding: dict | None = None, vivo: dict | None = None, completo: bool = True,
             tendencia: dict | None = None) -> dict:
    """Todo lo que muestra el dashboard «Mi fondo». Con completo=False, solo el resumen para la cabecera."""
    papel = almacen.cargar("papel", {}) if papel is None else papel
    holding = almacen.cargar("holding", {}) if holding is None else holding
    tendencia = almacen.cargar("tendencia", {}) if tendencia is None else tendencia
    vivo = vivo or {}
    f = cargar(papel, holding, tendencia)
    inicio = pd.Timestamp(f["inicio"])
    ahora = pd.Timestamp.now(tz="UTC")
    indice = pd.date_range(inicio.floor("h"), max(ahora.floor("h"), inicio.floor("h")), freq="h")
    if ahora > indice[-1]:
        indice = indice.append(pd.DatetimeIndex([ahora]))   # el último punto es «ahora» (incluye aportaciones recientes)
    areas = {}
    for nombre, s in _series_areas(papel, holding, tendencia).items():
        s = s[~s.index.duplicated(keep="last")]
        areas[nombre] = s.reindex(indice.union(s.index)).sort_index().ffill().fillna(0).reindex(indice) if len(s) else pd.Series(0.0, index=indice)
    # el último punto se ajusta a los resultados actuales (incluye la vela en curso)
    ultimo = {"trading": (papel.get("grupos") or {}).get("trading", {}).get("resultado"),
              "scalping": (papel.get("grupos") or {}).get("scalping", {}).get("resultado"),
              "holding": (holding.get("resumen") or {}).get("resultado"),
              "tendencia": (tendencia.get("resumen") or {}).get("resultado")}
    for nombre, v in ultimo.items():
        if v is not None:
            areas[nombre].iloc[-1] = v
    resultado = sum(areas.values())
    aportado, patrimonio, participaciones, vl = _valor_liquidativo(indice, resultado, f["movimientos"])
    vl_s = pd.Series(vl, index=indice)
    medianoche = pd.Timestamp(dt.datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0))
    antes = vl_s[vl_s.index <= medianoche]
    base_hoy = antes.iloc[-1] if len(antes) else vl_s.iloc[0]
    resumen = {
        "inicio": f["inicio"],
        "patrimonio": round(float(patrimonio[-1]), 2),
        "aportado": round(float(aportado[-1]), 2),
        "resultado": round(float(patrimonio[-1] - aportado[-1]), 2),
        "participaciones": round(float(participaciones[-1]), 4),
        "vl": round(float(vl[-1]), 4),
        "vl_inicial": FONDO_VL_INICIAL,
        "rentabilidad_pct": round(float(vl[-1] / FONDO_VL_INICIAL - 1) * 100, 3),
        "hoy_pct": round(float(vl[-1] / base_hoy - 1) * 100, 3),
        "hoy": round(float((vl[-1] - base_hoy) * participaciones[-1]), 2),
        "por_area": {k: round(float(v.iloc[-1]), 2) for k, v in areas.items()},
        "caida_pct": round(float(vl[-1] / max(vl.max(), 1e-9) - 1) * 100, 3),
        "reparto": reparto(f),
    }
    if not completo:
        return {"resumen": resumen}
    en_uso, exposicion, abiertas = _reparto(papel, holding, resumen["patrimonio"], vivo, tendencia)
    resumen["liquidez"] = en_uso["liquidez"]
    objetivo = reparto(f)
    traders = papel.get("estrategias") or {}
    ocupadas = {g: sum(1 for t in traders.values() if t.get("grupo", "trading") == g) for g in ("trading", "scalping")}
    # las operaciones de las estrategias ya retiradas también cuentan: se hicieron con dinero del fondo
    ops_stats, ultimas = _operaciones({**(papel.get("retirados") or {}), **traders})
    btc = _btc(indice)
    # series para las gráficas: hora a hora los últimos 30 días y un punto al día antes
    corte = indice[-1] - pd.Timedelta(days=30)
    mask = (indice >= corte) | (indice.hour == 0) | (np.arange(len(indice)) == 0)
    idx = np.flatnonzero(mask)
    caida = vl_s / vl_s.cummax() - 1
    serie = [[indice[i].isoformat(), round(float(vl[i]), 4), round(float(patrimonio[i]), 2), round(float(aportado[i]), 2),
              round(float(areas["trading"].iloc[i]), 2), round(float(areas["scalping"].iloc[i]), 2),
              round(float(areas["holding"].iloc[i]), 2), round(float(caida.iloc[i]) * 100, 3),
              round(float(btc.iloc[i] / btc.iloc[0] * FONDO_VL_INICIAL), 4) if btc is not None and btc.iloc[0] > 0 and not np.isnan(btc.iloc[i]) else None,
              round(float(areas["tendencia"].iloc[i]), 2)]
             for i in idx]
    ranking = sorted(({"id": i, "simbolo": t["simbolo"], "direccion": t["direccion"], "grupo": t.get("grupo", "trading"),
                       "resultado": t.get("resultado", 0.0), "operaciones": len(t.get("operaciones", []))}
                      for i, t in traders.items()), key=lambda x: -x["resultado"])
    btc_pct = None
    if btc is not None and btc.iloc[0] > 0 and not np.isnan(btc.iloc[-1]):
        btc_pct = round(float(btc.iloc[-1] / btc.iloc[0] - 1) * 100, 3)
    return {
        "resumen": resumen,
        "metricas": _metricas(vl_s),
        "montecarlo": _montecarlo(vl_s),
        "btc_pct": btc_pct,
        "mensual": _mensual(vl_s),
        "serie": serie,
        "columnas": ["t", "vl", "patrimonio", "aportado", "trading", "scalping", "holding", "caida_pct", "btc_vl", "tendencia"],
        "reparto": en_uso,
        "objetivo": {"pct": objetivo, "usd": {a: round(objetivo[a] / 100 * resumen["patrimonio"], 2) for a in (*AREAS, "liquidez")},
                     "capital_mesa": {"trading": capital_mesa("trading"), "scalping": capital_mesa("scalping")},
                     "mesas": MESAS, "ocupadas": ocupadas,
                     "presupuesto_holding": round(sum(p.get("presupuesto_actual", p.get("presupuesto", 0))
                                                      for p in (holding.get("planes") or {}).values()), 2),
                     "presupuesto_tendencia": (tendencia.get("resumen") or {}).get("presupuesto", 0.0)},
        "exposicion": exposicion,
        "abiertas": abiertas,
        "operaciones": ops_stats,
        "ultimas": ultimas,
        "areas": {g: dict((papel.get("grupos") or {}).get(g) or {}) for g in ("trading", "scalping")} | {
            "holding": dict(holding.get("resumen") or {}), "tendencia": dict(tendencia.get("resumen") or {})},
        # la incubadora opera con dinero de prueba: se enseña aparte y NO suma en el fondo
        "incubadora": {g: dict(v) for g, v in (papel.get("grupos_incubadora") or {}).items()},
        "mejores": ranking[:5],
        "peores": [r for r in ranking[::-1][:5] if r["resultado"] < 0],
        "movimientos": [dict(m) for m in f["movimientos"]][::-1],
        "calculado": _ahora(),
    }


_cache_resumen: dict = {"t": 0.0, "datos": None}


def resumen_rapido(papel: dict, holding: dict, tendencia: dict | None = None) -> dict | None:
    """Resumen para la cabecera de la oficina (se recalcula como mucho cada 5 segundos)."""
    if _cache_resumen["datos"] is None or time.time() - _cache_resumen["t"] > 5:
        try:
            _cache_resumen["datos"] = calcular(papel, holding, completo=False, tendencia=tendencia)["resumen"]
        except Exception:  # sin datos todavía: la oficina funciona igual
            _cache_resumen["datos"] = None
        _cache_resumen["t"] = time.time()
    return _cache_resumen["datos"]


def analitica(vivo: dict | None = None) -> dict:
    """Igual que calcular(), con una caché de 10 segundos para no repetir el cálculo en cada petición."""
    if _cache["datos"] is None or time.time() - _cache["t"] > 10:
        _cache["datos"] = calcular(vivo=vivo)
        _cache["t"] = time.time()
    return _cache["datos"]
