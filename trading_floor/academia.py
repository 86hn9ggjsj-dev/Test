"""Academia: lo que la oficina aprende de sus estrategias en real.

Aprender aquí NO es que una estrategia se cambie sola según sus últimos resultados: eso sería adaptarse a la
casualidad, justo lo que el laboratorio intenta filtrar. Lo que se aprende es a nivel de fábrica:
- Qué tipos de condición (RSI bajo, ruptura de máximos...) y qué dirección (largo o corto) tienen las estrategias
  que funcionan en real (aprobadas en la incubadora o rentables en su mesa) y las que fallan (suspendidas o
  retiradas por el supervisor).
- Con eso, la minería genera más a menudo lo que funciona y menos lo que falla (pesos), pero sigue explorando todo
  y cada estrategia nueva tiene que pasar igualmente las seis pruebas y el examen de la incubadora.
- Los post mortem (postmortem.py) se resumen en lecciones: las causas de fallo más frecuentes.
"""

from __future__ import annotations

from collections import Counter

from . import almacen, banco
from .estrategia import TIPOS

EXPLORACION = 0.3   # parte de la minería que sigue siendo al azar, aprenda lo que aprenda
PESO_MIN, PESO_MAX = 0.4, 2.5
CAUSAS = {
    "muestra_corta": "pocas operaciones para juzgar", "comisiones": "las comisiones se comen la ventaja",
    "mercado_en_contra": "el mercado fue en contra", "acierta_menos": "acierta mucho menos que en el backtest",
    "stops": "casi todo acaba en stop", "volatilidad": "volatilidad muy distinta a la del backtest",
    "frecuencia": "opera mucho más o mucho menos de lo previsto", "azar": "sin causa clara (azar)",
}


NOMBRES = {
    "rsi_bajo": "RSI bajo", "rsi_alto": "RSI alto", "sobre_media": "precio sobre su media", "bajo_media": "precio bajo su media",
    "cruce_alcista": "cruce de medias al alza", "cruce_bajista": "cruce de medias a la baja",
    "ruptura_maximo": "ruptura de máximos", "ruptura_minimo": "ruptura de mínimos",
    "bajo_bollinger": "precio bajo la banda de Bollinger", "sobre_bollinger": "precio sobre la banda de Bollinger",
    "macd_positivo": "MACD positivo", "macd_negativo": "MACD negativo", "momento_positivo": "impulso al alza",
    "momento_negativo": "impulso a la baja", "volatilidad_alta": "volatilidad alta", "volatilidad_baja": "volatilidad baja",
}


def evidencias(papel: dict | None = None) -> list[dict]:
    """Una fila por estrategia con veredicto en real: {estrategia, funciona, fase}."""
    papel = almacen.cargar("papel", {}) if papel is None else papel
    en_banco = {b["id"]: b for b in banco.cargar()}
    filas, vistos = [], set()
    for d in banco.descartadas():
        if d.get("por") in ("supervisor", "incubadora"):
            filas.append({"estrategia": d["estrategia"], "funciona": False, "fase": d.get("por"), "id": d["id"]})
            vistos.add(d["id"])
    for id_, t in (papel.get("estrategias") or {}).items():
        b = en_banco.get(id_)
        if not b or id_ in vistos:
            continue
        aprobada = (t.get("examen") or {}).get("estado") == "aprobada"
        rentable = (t.get("prueba") or {}).get("estado") == "rentable"
        if aprobada or rentable:
            filas.append({"estrategia": b["estrategia"], "funciona": True, "fase": "mesa", "id": id_})
            vistos.add(id_)
    for id_, t in (papel.get("incubadora") or {}).items():
        b = en_banco.get(id_)
        if b and id_ not in vistos and (t.get("examen") or {}).get("estado") == "aprobada":
            filas.append({"estrategia": b["estrategia"], "funciona": True, "fase": "incubadora", "id": id_})
    return filas


def pesos(papel: dict | None = None) -> dict | None:
    """Pesos para la minería: {"tipos": {tipo: peso}, "direcciones": {"largo": peso, "corto": peso}}.
    None si todavía no hay ninguna estrategia juzgada en real (la minería sigue al azar)."""
    filas = evidencias(papel)
    if not filas:
        return None
    cuenta: dict[str, list[int]] = {}
    direcciones: dict[str, list[int]] = {"largo": [0, 0], "corto": [0, 0]}
    for f in filas:
        k = 0 if f["funciona"] else 1
        for c in f["estrategia"]["condiciones"]:
            cuenta.setdefault(c["tipo"], [0, 0])[k] += 1
        direcciones[f["estrategia"]["direccion"]][k] += 1

    def peso(bien: int, mal: int) -> float:
        return round(min(PESO_MAX, max(PESO_MIN, (1 + bien) / (1 + mal))), 3)

    return {"tipos": {t: peso(*cuenta.get(t, [0, 0])) for t in TIPOS},
            "direcciones": {d: peso(*v) for d, v in direcciones.items()}, "exploracion": EXPLORACION}


def lecciones(papel: dict | None = None) -> dict:
    """Lo que enseña la academia: cuántas estrategias se han juzgado, qué tipos de condición funcionan y cuáles
    fallan, y las causas de fallo más frecuentes según los post mortem."""
    filas = evidencias(papel)
    p = pesos(papel) or {"tipos": {}, "direcciones": {}}
    cuenta: dict[str, list[int]] = {}
    for f in filas:
        for c in f["estrategia"]["condiciones"]:
            cuenta.setdefault(c["tipo"], [0, 0])[0 if f["funciona"] else 1] += 1
    tipos = sorted(({"tipo": t, "nombre": NOMBRES.get(t, t), "funcionan": b, "fallan": m, "peso": p["tipos"].get(t, 1.0)}
                    for t, (b, m) in cuenta.items()), key=lambda x: (-x["peso"], -(x["funcionan"] + x["fallan"])))
    causas = Counter()
    for d in banco.descartadas():
        pm = d.get("post_mortem") or {}
        for c in pm.get("causas", []):
            causas[c["clave"]] += 1
    textos = []
    for x in tipos:
        n = x["funcionan"] + x["fallan"]
        if n >= 2 and x["peso"] >= 1.5:
            textos.append(f"Las estrategias con «{x['nombre']}» van bien en real ({x['funcionan']} de {n}): la minería las busca más.")
        elif n >= 2 and x["peso"] <= .67:
            textos.append(f"Las estrategias con «{x['nombre']}» fallan en real ({x['fallan']} de {n}): la minería las busca menos.")
    if causas:
        clave, veces = causas.most_common(1)[0]
        textos.append(f"La causa de fallo más repetida es que {CAUSAS.get(clave, clave)} ({veces} {'vez' if veces == 1 else 'veces'}).")
    if not filas:
        textos.append("Todavía no hay ninguna estrategia juzgada en real: la minería busca al azar, sin preferencias.")
    return {"juzgadas": len(filas), "funcionan": sum(f["funciona"] for f in filas), "fallan": sum(not f["funciona"] for f in filas),
            "tipos": tipos[:16], "direcciones": p.get("direcciones", {}),
            "causas": [{"clave": k, "texto": CAUSAS.get(k, k), "veces": v} for k, v in causas.most_common(6)],
            "textos": textos[:6], "exploracion_pct": int(EXPLORACION * 100)}
