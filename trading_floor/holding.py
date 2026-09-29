"""Sala de holding: comprar y mantener a largo plazo siguiendo un plan de zonas (dinero ficticio).

Un plan tiene una compra inicial, zonas de compra escalonadas por debajo (órdenes límite que se
llenan si el precio baja hasta ellas), zonas de venta por encima para asegurar beneficio y un
stop de catástrofe. Se simula con las velas reales de Binance desde que se crea el plan.
"""

from __future__ import annotations

import datetime as dt

import numpy as np
import pandas as pd

from . import almacen
from .config import CAPITAL_HOLDING, COMISION, DESLIZAMIENTO
from .datos import velas
from .mercado import Mercado

ENTRADA_INICIAL_PCT = 25.0
COMPRAS_DEFECTO = [(-.10, 25.0), (-.20, 25.0), (-.30, 25.0)]  # (distancia al precio inicial, % del presupuesto)
VENTAS_DEFECTO = [(.30, 20.0), (.60, 25.0), (1.00, 25.0)]  # (distancia, % de lo que se tenga en ese momento)
STOP_DEFECTO = -.50
COSTE = COMISION + DESLIZAMIENTO


def _ahora() -> str:
    return dt.datetime.now().astimezone().isoformat(timespec="seconds")


def _redondear(x: float) -> float:
    return round(x, 0) if x >= 1000 else round(x, 2) if x >= 10 else round(x, 4)


def _precio(x: float) -> str:
    return f"{x:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")


def nuevo_plan(simbolo: str, presupuesto: float, precio: float, compras: list[float] | None = None,
               ventas: list[float] | None = None, stop: float | None = None) -> dict:
    """Crea un plan. Sin zonas explícitas usa escalones en −10/−20/−30 % y +30/+60/+100 %."""
    if compras:
        pct = (100 - ENTRADA_INICIAL_PCT) / len(compras)
        zonas_compra = [{"precio": _redondear(p), "pct": pct} for p in sorted(compras, reverse=True)]
    else:
        zonas_compra = [{"precio": _redondear(precio * (1 + d)), "pct": pct} for d, pct in COMPRAS_DEFECTO]
    if ventas:
        pcts = [20.0, 25.0, 25.0, 30.0]
        zonas_venta = [{"precio": _redondear(p), "pct": pcts[min(i, 3)]} for i, p in enumerate(sorted(ventas))]
    else:
        zonas_venta = [{"precio": _redondear(precio * (1 + d)), "pct": pct} for d, pct in VENTAS_DEFECTO]
    return {
        "simbolo": simbolo.upper(),
        "presupuesto": float(presupuesto),
        "creado": _ahora(),
        "precio_inicio": float(precio),
        "entrada_inicial_pct": ENTRADA_INICIAL_PCT,
        "compras": zonas_compra,
        "ventas": zonas_venta,
        "stop": _redondear(stop if stop is not None else precio * (1 + STOP_DEFECTO)),
    }


def simular_plan(plan: dict, m: Mercado) -> dict:
    """Ejecuta el plan sobre las velas desde su creación. Devuelve el estado de la cartera."""
    inicio = int(np.searchsorted(m.tiempo, pd.Timestamp(plan["creado"]), side="right"))
    fills = []  # (vela, orden, tipo, índice de zona, precio)
    for i, z in enumerate(plan["compras"]):
        toca = np.flatnonzero(m.l[inicio:] <= z["precio"])
        if len(toca):
            k = inicio + int(toca[0])
            fills.append((k, 0, "compra", i, min(m.o[k], z["precio"])))
    for i, z in enumerate(plan["ventas"]):
        toca = np.flatnonzero(m.h[inicio:] >= z["precio"])
        if len(toca):
            k = inicio + int(toca[0])
            fills.append((k, 2, "venta", i, max(m.o[k], z["precio"])))
    toca = np.flatnonzero(m.l[inicio:] <= plan["stop"])
    if len(toca):
        k = inicio + int(toca[0])
        fills.append((k, 1, "stop", 0, min(m.o[k], plan["stop"])))

    efectivo, unidades, coste_base, realizado = plan["presupuesto"], 0.0, 0.0, 0.0
    operaciones = []

    def comprar(importe: float, precio: float, k: int, texto: str) -> None:
        nonlocal efectivo, unidades, coste_base
        importe = min(importe, efectivo)
        if importe <= 0:
            return
        u = importe * (1 - COSTE) / precio
        efectivo -= importe; unidades += u; coste_base += importe
        operaciones.append({"t": m.tiempo[min(k, len(m) - 1)].isoformat(), "tipo": "compra", "zona": texto,
                            "precio": float(precio), "unidades": u, "importe": round(importe, 2)})

    def vender(u: float, precio: float, k: int, tipo: str, texto: str) -> None:
        nonlocal efectivo, unidades, coste_base, realizado
        if u <= 0:
            return
        medio = coste_base / unidades
        ingreso = u * precio * (1 - COSTE)
        realizado += ingreso - u * medio
        efectivo += ingreso; coste_base -= u * medio; unidades -= u
        operaciones.append({"t": m.tiempo[k].isoformat(), "tipo": tipo, "zona": texto, "precio": float(precio),
                            "unidades": u, "importe": round(ingreso, 2)})

    comprar(plan["presupuesto"] * plan["entrada_inicial_pct"] / 100, plan["precio_inicio"], inicio - 1, "entrada inicial")
    cerrado = False
    valores = np.full(len(m) - inicio + 1, np.nan)
    ultimo = inicio - 1
    for k, _, tipo, i, precio in sorted(fills):
        valores[ultimo - inicio + 1 : k - inicio + 1] = efectivo + unidades * m.c[ultimo:k]
        ultimo = k
        if tipo == "compra":
            comprar(plan["presupuesto"] * plan["compras"][i]["pct"] / 100, precio, k, f"zona de compra {i + 1}")
        elif tipo == "venta":
            vender(unidades * plan["ventas"][i]["pct"] / 100, precio, k, "venta", f"zona de venta {i + 1}")
        else:
            vender(unidades, precio, k, "stop", "stop de catástrofe")
            cerrado = True
            break
    valores[ultimo - inicio + 1 :] = efectivo + unidades * m.c[ultimo:]
    precio = float(m.c[-1])
    valor = efectivo + unidades * precio
    serie = pd.Series(valores, index=m.tiempo[inicio - 1 :]).dropna()
    cada = max(1, 240 // m.minutos)  # un punto cada 4 horas para las gráficas
    llenas = {(o["zona"]) for o in operaciones}
    return {
        **plan,
        "cerrado": cerrado,
        "precio": precio,
        "efectivo": round(efectivo, 2),
        "unidades": unidades,
        "coste_medio": round(coste_base / unidades, 6) if unidades else None,
        "invertido": round(coste_base, 2),
        "valor": round(valor, 2),
        "resultado": round(valor - plan["presupuesto"], 2),
        "resultado_pct": round((valor / plan["presupuesto"] - 1) * 100, 3),
        "realizado": round(realizado, 2),
        "operaciones": operaciones,
        "compras": [{**z, "llena": f"zona de compra {i + 1}" in llenas} for i, z in enumerate(plan["compras"])],
        "ventas": [{**z, "llena": f"zona de venta {i + 1}" in llenas} for i, z in enumerate(plan["ventas"])],
        "precios": [float(x) for x in m.c[-30 * 1440 // m.minutos :: cada]],
        "valores": [round(float(x), 2) for x in serie.iloc[::cada]],
    }


def ciclo(estado: dict) -> list[dict]:
    """Actualiza la sala de holding. Crea los planes de ejemplo la primera vez."""
    planes = estado.setdefault("planes", {})
    eventos: list[dict] = []
    if not estado.get("iniciado"):
        estado["iniciado"] = True
        for simbolo, presupuesto in CAPITAL_HOLDING.items():
            if simbolo not in planes:
                m = Mercado(velas(simbolo, "1h"), simbolo, "1h")
                planes[simbolo] = nuevo_plan(simbolo, presupuesto, float(m.c[-1]))
    for simbolo, plan in list(planes.items()):
        base = {k: plan[k] for k in ("simbolo", "presupuesto", "creado", "precio_inicio", "entrada_inicial_pct", "stop")}
        base["compras"] = [{"precio": z["precio"], "pct": z["pct"]} for z in plan["compras"]]
        base["ventas"] = [{"precio": z["precio"], "pct": z["pct"]} for z in plan["ventas"]]
        m = Mercado(velas(simbolo, "1h"), simbolo, "1h")
        nuevo = simular_plan(base, m)
        moneda = simbolo.replace("USDT", "")
        if not plan.get("operaciones"):
            eventos.append({"t": _ahora(), "tipo": "plan", "simbolo": simbolo, "texto":
                            f"Plan de holding de {moneda}: {_precio(base['presupuesto'])} $ ficticios. Compro el "
                            f"{base['entrada_inicial_pct']:g} % a {_precio(base['precio_inicio'])} y dejo órdenes en "
                            + " / ".join(_precio(z["precio"]) for z in base["compras"]) + "."})
        for op in nuevo["operaciones"][len(plan.get("operaciones", [])):]:
            if op["zona"] == "entrada inicial":
                continue
            verbo = {"compra": "compro", "venta": "vendo", "stop": "salta el stop y vendo todo"}[op["tipo"]]
            eventos.append({"t": _ahora(), "tipo": op["tipo"], "simbolo": simbolo, "zona": op["zona"], "texto":
                            f"{moneda}: {op['zona']} tocada, {verbo} a {_precio(op['precio'])} ({_precio(op['importe'])} $)."})
        planes[simbolo] = nuevo
    total = sum(p["presupuesto"] for p in planes.values())
    valor = sum(p["valor"] for p in planes.values())
    estado["resumen"] = {"presupuesto": total, "valor": round(float(valor), 2), "resultado": round(float(valor - total), 2),
                         "resultado_pct": round(float(valor / total - 1) * 100, 3) if total else 0.0}
    estado["actividad"] = (eventos[::-1] + estado.get("actividad", []))[:40]
    estado["actualizado"] = _ahora()
    return eventos


def actualizar() -> list[dict]:
    estado = almacen.cargar("holding", {})
    eventos = ciclo(estado)
    almacen.guardar("holding", estado)
    return eventos


def crear(simbolo: str, presupuesto: float, compras: list[float] | None, ventas: list[float] | None,
          stop: float | None) -> dict:
    estado = almacen.cargar("holding", {})
    estado["iniciado"] = True
    m = Mercado(velas(simbolo, "1h"), simbolo.upper(), "1h")
    plan = nuevo_plan(simbolo, presupuesto, float(m.c[-1]), compras, ventas, stop)
    estado.setdefault("planes", {})[plan["simbolo"]] = plan
    ciclo(estado)
    almacen.guardar("holding", estado)
    return estado["planes"][plan["simbolo"]]


def borrar(simbolo: str) -> bool:
    estado = almacen.cargar("holding", {})
    estado["iniciado"] = True
    borrado = estado.get("planes", {}).pop(simbolo.upper(), None) is not None
    almacen.guardar("holding", estado)
    return borrado
