"""Sala de holding: comprar y mantener a largo plazo con un plan adaptativo (dinero ficticio).

Reglas del plan (sin stop loss: nunca se vende por miedo):
- Compra inicial de una parte del presupuesto.
- Promediar a la baja: cada vez que el precio cae un `paso_pct` desde la última compra (o desde la
  última salida), se compra otro tramo. Si se acaba el presupuesto, entra capital de la reserva.
- Puntos de salida sobre el coste medio: al subir un +X % por encima del coste medio se vende una
  parte de la posición. Como dependen del coste medio, se mueven solos cuando se promedia.
- Si el precio vuelve por debajo del coste medio, los puntos de salida se rearman para la
  siguiente subida. Siempre queda una parte de la posición (el núcleo).

Se simula con las velas reales de Binance (1 hora) desde que se crea el plan.
"""

from __future__ import annotations

import datetime as dt
import threading

import numpy as np
import pandas as pd

from . import almacen
from .config import CAPITAL_HOLDING, COMISION, DESLIZAMIENTO
from .datos import velas
from .mercado import Mercado

ENTRADA_INICIAL_PCT = 25.0
PASO_PCT = 8.0  # caída desde la última compra que dispara otra compra
TRAMO_PCT = 12.5  # tamaño de cada compra de promedio, en % del presupuesto
RESERVA_PCT = 50.0  # capital extra (en % del presupuesto) que se puede añadir si se acaba el dinero
SALIDAS = [(30.0, 20.0), (60.0, 25.0), (100.0, 25.0)]  # (+% sobre el coste medio, % de la posición que se vende)
COSTE = COMISION + DESLIZAMIENTO
_cerrojo = threading.RLock()  # el ciclo de holding y los planes que pides desde el chat no deben pisarse


def _ahora() -> str:
    return dt.datetime.now().astimezone().isoformat(timespec="seconds")


def _precio(x: float) -> str:
    return f"{x:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")


def _pct(x: float) -> str:
    return f"{x:g}".replace(".", ",")


def nuevo_plan(simbolo: str, presupuesto: float, precio: float, paso_pct: float | None = None,
               tramo_pct: float | None = None, reserva_pct: float | None = None,
               salidas_pct: list[float] | None = None) -> dict:
    """Crea un plan adaptativo. Lo que no se indique usa los valores por defecto."""
    if salidas_pct:
        partes = [20.0, 25.0, 25.0, 15.0]
        salidas = [{"sobre_coste_pct": float(g), "vende_pct": partes[min(i, 3)]} for i, g in enumerate(sorted(salidas_pct))]
    else:
        salidas = [{"sobre_coste_pct": g, "vende_pct": v} for g, v in SALIDAS]
    return {
        "tipo": "adaptativo",
        "simbolo": simbolo.upper(),
        "presupuesto": float(presupuesto),
        "creado": _ahora(),
        "precio_inicio": float(precio),
        "entrada_inicial_pct": ENTRADA_INICIAL_PCT,
        "paso_pct": float(paso_pct or PASO_PCT),
        "tramo_pct": float(tramo_pct or TRAMO_PCT),
        "reserva_pct": float(RESERVA_PCT if reserva_pct is None else reserva_pct),
        "salidas": salidas,
    }


def _desde_plan_antiguo(plan: dict) -> dict:
    """Los planes de zonas fijas con stop se convierten al plan adaptativo (misma fecha y presupuesto)."""
    nuevo = nuevo_plan(plan["simbolo"], plan["presupuesto"], plan["precio_inicio"])
    nuevo["creado"] = plan["creado"]
    return nuevo


def simular_plan(plan: dict, m: Mercado) -> dict:
    """Ejecuta el plan vela a vela desde su creación. Devuelve el estado de la cartera."""
    inicio = int(np.searchsorted(m.tiempo, pd.Timestamp(plan["creado"]), side="right"))
    presupuesto, paso = plan["presupuesto"], plan["paso_pct"] / 100
    reserva = presupuesto * plan["reserva_pct"] / 100
    tramo = presupuesto * plan["tramo_pct"] / 100
    efectivo, reserva_usada, unidades, coste_base, realizado = presupuesto, 0.0, 0.0, 0.0, 0.0
    operaciones: list[dict] = []
    hechas: set[int] = set()

    def t(k: int) -> str:
        return m.tiempo[min(max(k, 0), len(m) - 1)].isoformat()

    def comprar(importe: float, precio: float, k: int, motivo: str) -> None:
        nonlocal efectivo, reserva_usada, unidades, coste_base
        if importe > efectivo:
            extra = min(importe - efectivo, reserva - reserva_usada)
            if extra > 1:
                reserva_usada += extra
                efectivo += extra
                operaciones.append({"t": t(k), "tipo": "aportacion", "motivo": "reserva", "importe": round(extra, 2),
                                    "reserva_usada": round(reserva_usada, 2), "reserva": round(reserva, 2)})
        importe = min(importe, efectivo)
        if importe <= 1:
            return
        u = importe * (1 - COSTE) / precio
        efectivo -= importe
        unidades += u
        coste_base += importe
        operaciones.append({"t": t(k), "tipo": "compra", "motivo": motivo, "precio": float(precio), "unidades": u,
                            "importe": round(importe, 2), "coste_medio": coste_base / unidades})

    def vender(parte: float, precio: float, k: int, motivo: str) -> None:
        nonlocal efectivo, unidades, coste_base, realizado
        u = unidades * parte
        if u <= 0:
            return
        medio = coste_base / unidades
        ingreso = u * precio * (1 - COSTE)
        realizado += ingreso - u * medio
        efectivo += ingreso
        coste_base -= u * medio
        unidades -= u
        operaciones.append({"t": t(k), "tipo": "venta", "motivo": motivo, "precio": float(precio), "unidades": u,
                            "importe": round(ingreso, 2), "coste_medio": medio})

    comprar(presupuesto * plan["entrada_inicial_pct"] / 100, plan["precio_inicio"], inicio - 1, "entrada inicial")
    referencia = plan["precio_inicio"]  # última compra o última salida: de ahí se mide la caída
    valores = [efectivo + unidades * plan["precio_inicio"]]
    cada = max(1, 240 // m.minutos)  # un punto cada 4 horas para las gráficas
    serie = []  # resultado (valor − dinero aportado) con su hora, para el fondo
    for k in range(inicio, len(m)):
        # 1) Promediar a la baja (puede saltar varios escalones si el precio cae de golpe).
        while efectivo + (reserva - reserva_usada) > 1:
            objetivo = referencia * (1 - paso)
            if m.l[k] > objetivo:
                break
            comprar(tramo, min(m.o[k], objetivo), k, "promedio")
            referencia = objetivo
            hechas.clear()
        # 2) Puntos de salida sobre el coste medio.
        if unidades > 0:
            medio = coste_base / unidades
            for i, s in enumerate(plan["salidas"]):
                nivel = medio * (1 + s["sobre_coste_pct"] / 100)
                if i not in hechas and m.h[k] >= nivel:
                    vender(s["vende_pct"] / 100, max(m.o[k], nivel), k, f"salida {i + 1}")
                    hechas.add(i)
                    referencia = nivel
            # 3) Si vuelve por debajo del coste medio, se rearman las salidas.
            if hechas and m.c[k] < medio:
                hechas.clear()
        valores.append(efectivo + unidades * m.c[k])
        if (k - inicio) % cada == 0 or k == len(m) - 1:
            serie.append([(m.tiempo[k] + pd.Timedelta(minutes=m.minutos)).isoformat(),
                          round(float(valores[-1] - presupuesto - reserva_usada), 2)])

    precio = float(m.c[-1])
    aportado = presupuesto + reserva_usada
    valor = efectivo + unidades * precio
    medio = coste_base / unidades if unidades else None
    queda = efectivo + (reserva - reserva_usada)
    siguiente = referencia * (1 - paso)
    return {
        **plan,
        "precio": precio,
        "efectivo": round(efectivo, 2),
        "unidades": unidades,
        "coste_medio": round(medio, 6) if medio else None,
        "invertido": round(coste_base, 2),
        "aportado": round(aportado, 2),
        "reserva": round(reserva, 2),
        "reserva_usada": round(reserva_usada, 2),
        "valor": round(valor, 2),
        "resultado": round(valor - aportado, 2),
        "resultado_pct": round((valor / aportado - 1) * 100, 3),
        "realizado": round(realizado, 2),
        "operaciones": operaciones,
        "stop": None,
        "compras": [{"precio": round(siguiente * (1 - paso) ** j, 6), "pct": plan["tramo_pct"],
                     "llena": False, "sin_dinero": queda < tramo * (j + 1) * .99} for j in range(3)],
        "ventas": [{"precio": round(medio * (1 + s["sobre_coste_pct"] / 100), 6) if medio else None,
                    "pct": s["vende_pct"], "sobre_coste_pct": s["sobre_coste_pct"], "llena": i in hechas}
                   for i, s in enumerate(plan["salidas"])],
        "precios": [float(x) for x in m.c[-30 * 1440 // m.minutos :: cada]],
        "precios_desde": m.tiempo[max(0, len(m) - 30 * 1440 // m.minutos)].isoformat(),
        "precios_paso_min": cada * m.minutos,
        "valores": [round(float(x), 2) for x in valores[::cada]],
        "serie": serie,
    }


def _texto(moneda: str, op: dict, plan: dict) -> str:
    if op["tipo"] == "aportacion":
        return (f"{moneda}: se acabó el presupuesto, meto {_precio(op['importe'])} $ de la reserva "
                f"({_precio(op['reserva_usada'])} de {_precio(op['reserva'])} $ usados).")
    if op["tipo"] == "compra":
        return (f"{moneda}: baja un {_pct(plan['paso_pct'])} % desde la última compra, promedio con "
                f"{_precio(op['importe'])} $ a {_precio(op['precio'])}. Coste medio ahora: {_precio(op['coste_medio'])}.")
    i = int(op["motivo"].split()[-1]) - 1
    s = plan["salidas"][i]
    return (f"{moneda}: punto de salida {i + 1} (+{_pct(s['sobre_coste_pct'])} % sobre el coste medio), vendo el "
            f"{_pct(s['vende_pct'])} % de la posición a {_precio(op['precio'])} ({_precio(op['importe'])} $).")


def _serie_total(planes) -> pd.Series:
    """Resultado de todas las carteras de holding juntas, cada 4 horas."""
    series = [pd.Series([v for _, v in p["serie"]], index=pd.to_datetime([t for t, _ in p["serie"]], utc=True))
              for p in planes if p.get("serie")]
    if not series:
        return pd.Series(dtype=float)
    return pd.concat(series, axis=1).sort_index().ffill().fillna(0).sum(axis=1)


def _base(plan: dict) -> dict:
    claves = ("tipo", "simbolo", "presupuesto", "creado", "precio_inicio", "entrada_inicial_pct",
              "paso_pct", "tramo_pct", "reserva_pct", "salidas")
    return {k: plan[k] for k in claves}


def ciclo(estado: dict) -> list[dict]:
    """Actualiza la sala de holding. Crea los planes de ejemplo la primera vez."""
    planes = estado.setdefault("planes", {})
    eventos: list[dict] = []

    def evento(tipo: str, simbolo: str, texto: str) -> None:
        eventos.append({"t": _ahora(), "tipo": tipo, "simbolo": simbolo, "texto": texto})

    if not estado.get("iniciado"):
        estado["iniciado"] = True
        for simbolo, presupuesto in CAPITAL_HOLDING.items():
            if simbolo not in planes:
                m = Mercado(velas(simbolo, "1h"), simbolo, "1h")
                planes[simbolo] = nuevo_plan(simbolo, presupuesto, float(m.c[-1]))
    for simbolo, plan in list(planes.items()):
        moneda = simbolo.replace("USDT", "")
        if plan.get("tipo") != "adaptativo":
            plan = {"operaciones": plan.get("operaciones", []), **_desde_plan_antiguo(plan), "migrado": True}
            evento("plan", simbolo, f"Plan de {moneda} actualizado: ya no tiene stop. Promedia a la baja cada "
                                    f"{_pct(PASO_PCT)} % y sale por partes sobre el coste medio (recalculado desde su inicio).")
        base = _base(plan)
        nuevo = simular_plan(base, Mercado(velas(simbolo, "1h"), simbolo, "1h"))
        anteriores = [] if plan.get("migrado") else plan.get("operaciones", [])
        if not plan.get("operaciones") and not plan.get("migrado"):
            salidas = "/".join(f"+{_pct(s['sobre_coste_pct'])}" for s in base["salidas"])
            evento("plan", simbolo, f"Plan de holding de {moneda}: {_precio(base['presupuesto'])} $ ficticios y "
                                    f"{_precio(nuevo['reserva'])} $ de reserva. Compro el {_pct(base['entrada_inicial_pct'])} % "
                                    f"a {_precio(base['precio_inicio'])}; promediaré cada −{_pct(base['paso_pct'])} % y "
                                    f"saldré por partes a {salidas} % sobre el coste medio. Sin stop.")
        if not plan.get("migrado"):
            for op in nuevo["operaciones"][len(anteriores):]:
                if op.get("motivo") != "entrada inicial":
                    evento(op["tipo"], simbolo, _texto(moneda, op, base))
        planes[simbolo] = nuevo
    aportado = sum(p["aportado"] for p in planes.values())
    valor = sum(p["valor"] for p in planes.values())
    total = _serie_total(planes.values())
    medianoche = pd.Timestamp(dt.datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0))
    antes = total[total.index <= medianoche] if len(total) else total
    hoy = float(total.iloc[-1] - antes.iloc[-1]) if len(antes) else 0.0
    estado["serie"] = [[t.isoformat(), round(float(v), 2)] for t, v in total.items()]
    estado["resumen"] = {"presupuesto": round(float(sum(p["presupuesto"] for p in planes.values())), 2),
                         "aportado": round(float(aportado), 2), "valor": round(float(valor), 2),
                         "resultado": round(float(valor - aportado), 2),
                         "resultado_pct": round(float(valor / aportado - 1) * 100, 3) if aportado else 0.0,
                         "hoy": round(hoy, 2)}
    estado["actividad"] = (eventos[::-1] + estado.get("actividad", []))[:40]
    estado["actualizado"] = _ahora()
    return eventos


def actualizar() -> list[dict]:
    with _cerrojo:
        estado = almacen.cargar("holding", {})
        eventos = ciclo(estado)
        almacen.guardar("holding", estado)
    return eventos


def crear(simbolo: str, presupuesto: float, paso_pct: float | None = None, tramo_pct: float | None = None,
          reserva_pct: float | None = None, salidas_pct: list[float] | None = None) -> dict:
    simbolo = simbolo.upper()
    m = Mercado(velas(simbolo, "1h"), simbolo, "1h")
    with _cerrojo:
        estado = almacen.cargar("holding", {})
        estado["iniciado"] = True
        estado.setdefault("planes", {})[simbolo] = nuevo_plan(simbolo, presupuesto, float(m.c[-1]), paso_pct, tramo_pct,
                                                              reserva_pct, salidas_pct)
        ciclo(estado)
        almacen.guardar("holding", estado)
    return estado["planes"][simbolo]


def borrar(simbolo: str) -> bool:
    with _cerrojo:
        estado = almacen.cargar("holding", {})
        estado["iniciado"] = True
        borrado = estado.get("planes", {}).pop(simbolo.upper(), None) is not None
        almacen.guardar("holding", estado)
    return borrado
