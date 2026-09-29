"""Estrategias: reglas de entrada de un vocabulario fijo que la minería combina al azar.

Una estrategia es "entra en LARGO (o en CORTO) cuando se cumplan estas 1-3 condiciones" más
una salida por stop, por objetivo o por tiempo. Los parámetros solo pueden tomar valores de
unas listas cerradas: así hay menos combinaciones absurdas y menos sobreajuste.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass

import numpy as np

_RSI = [5, 7, 10, 14, 21, 28]
_RAPIDAS = [3, 5, 8, 10, 15, 20, 30]
_LENTAS = [40, 50, 75, 100, 150, 200]
_MEDIAS = [10, 20, 30, 50, 75, 100, 150, 200]
_RUPTURAS = [5, 10, 20, 30, 50, 75, 100]
_BOLLINGER = {"periodo": [10, 14, 20, 30, 50], "desv": [1.0, 1.5, 2.0, 2.5, 3.0]}
_MOMENTO = [3, 5, 10, 20, 30, 50, 100]
_VOLATILIDAD = [20, 50, 100, 200]

# familia -> {tipo de condición: valores permitidos de cada parámetro}.
# Una estrategia usa como mucho una condición de cada familia.
FAMILIAS: dict[str, dict[str, dict[str, list]]] = {
    "rsi": {
        "rsi_bajo": {"periodo": _RSI, "umbral": [10, 15, 20, 25, 30, 35, 40, 45]},
        "rsi_alto": {"periodo": _RSI, "umbral": [55, 60, 65, 70, 75, 80, 85, 90]},
    },
    "media": {"sobre_media": {"periodo": _MEDIAS}, "bajo_media": {"periodo": _MEDIAS}},
    "cruce": {
        "cruce_alcista": {"rapida": _RAPIDAS, "lenta": _LENTAS},
        "cruce_bajista": {"rapida": _RAPIDAS, "lenta": _LENTAS},
    },
    "ruptura": {"ruptura_maximo": {"periodo": _RUPTURAS}, "ruptura_minimo": {"periodo": _RUPTURAS}},
    "bollinger": {"bajo_bollinger": _BOLLINGER, "sobre_bollinger": _BOLLINGER},
    "macd": {"macd_positivo": {}, "macd_negativo": {}},
    "momento": {"momento_positivo": {"periodo": _MOMENTO}, "momento_negativo": {"periodo": _MOMENTO}},
    "volatilidad": {
        "volatilidad_alta": {"ventana": _VOLATILIDAD},
        "volatilidad_baja": {"ventana": _VOLATILIDAD},
    },
}
TIPOS = {tipo: (familia, params) for familia, tipos in FAMILIAS.items() for tipo, params in tipos.items()}

SALIDAS = {
    "stop_atr": [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0],
    "objetivo_atr": [0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 6.0, 8.0],
    "max_velas": [4, 6, 8, 12, 16, 24, 36, 48, 72, 96],
}


def _cruce(m, p, alcista: bool) -> np.ndarray:
    dif = m.ind("ema", p["rapida"]) - m.ind("ema", p["lenta"])
    previa = np.concatenate([[np.nan], dif[:-1]])
    return (dif > 0) & (previa <= 0) if alcista else (dif < 0) & (previa >= 0)


def _bollinger(m, p, arriba: bool) -> np.ndarray:
    media, desv = m.ind("sma", p["periodo"]), m.ind("desv", p["periodo"])
    return m.c > media + p["desv"] * desv if arriba else m.c < media - p["desv"] * desv


_REGLAS = {
    "rsi_bajo": lambda m, p: m.ind("rsi", p["periodo"]) < p["umbral"],
    "rsi_alto": lambda m, p: m.ind("rsi", p["periodo"]) > p["umbral"],
    "sobre_media": lambda m, p: m.c > m.ind("sma", p["periodo"]),
    "bajo_media": lambda m, p: m.c < m.ind("sma", p["periodo"]),
    "cruce_alcista": lambda m, p: _cruce(m, p, True),
    "cruce_bajista": lambda m, p: _cruce(m, p, False),
    "ruptura_maximo": lambda m, p: m.c > m.ind("max", p["periodo"]),
    "ruptura_minimo": lambda m, p: m.c < m.ind("min", p["periodo"]),
    "bajo_bollinger": lambda m, p: _bollinger(m, p, False),
    "sobre_bollinger": lambda m, p: _bollinger(m, p, True),
    "macd_positivo": lambda m, p: m.ind("macd_hist") > 0,
    "macd_negativo": lambda m, p: m.ind("macd_hist") < 0,
    "momento_positivo": lambda m, p: m.ind("roc", p["periodo"]) > 0,
    "momento_negativo": lambda m, p: m.ind("roc", p["periodo"]) < 0,
    "volatilidad_alta": lambda m, p: m.ind("atr", 14) > m.ind("atr_media", p["ventana"]),
    "volatilidad_baja": lambda m, p: m.ind("atr", 14) < m.ind("atr_media", p["ventana"]),
}

_TEXTOS = {
    "rsi_bajo": "RSI({periodo}) < {umbral}",
    "rsi_alto": "RSI({periodo}) > {umbral}",
    "sobre_media": "precio > media({periodo})",
    "bajo_media": "precio < media({periodo})",
    "cruce_alcista": "EMA({rapida}) cruza hacia arriba la EMA({lenta})",
    "cruce_bajista": "EMA({rapida}) cruza hacia abajo la EMA({lenta})",
    "ruptura_maximo": "precio rompe el máximo de {periodo} velas",
    "ruptura_minimo": "precio rompe el mínimo de {periodo} velas",
    "bajo_bollinger": "precio < Bollinger inferior({periodo}, {desv})",
    "sobre_bollinger": "precio > Bollinger superior({periodo}, {desv})",
    "macd_positivo": "histograma MACD > 0",
    "macd_negativo": "histograma MACD < 0",
    "momento_positivo": "precio > hace {periodo} velas",
    "momento_negativo": "precio < hace {periodo} velas",
    "volatilidad_alta": "volatilidad > su media({ventana})",
    "volatilidad_baja": "volatilidad < su media({ventana})",
}


def _num(x: float) -> str:
    return f"{x:g}".replace(".", ",")


@dataclass
class Estrategia:
    simbolo: str
    intervalo: str
    direccion: str  # "largo" (gana si sube) o "corto" (gana si baja)
    condiciones: list[dict]  # [{"tipo": "rsi_bajo", "periodo": 14, "umbral": 30}, ...]
    stop_atr: float  # stop de pérdidas a N veces el ATR (volatilidad media) desde la entrada
    objetivo_atr: float  # recogida de beneficios a N veces el ATR
    max_velas: int  # si no ha tocado ni stop ni objetivo, sale al cierre de esta vela

    def __post_init__(self) -> None:
        self.condiciones = sorted(self.condiciones, key=lambda c: c["tipo"])

    @property
    def id(self) -> str:
        return "E-" + hashlib.sha1(self.firma().encode()).hexdigest()[:6].upper()

    def firma(self) -> str:
        return json.dumps(asdict(self), sort_keys=True)

    def a_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def de_dict(cls, d: dict) -> Estrategia:
        return cls(**d)

    def senal(self, m) -> np.ndarray:
        """True en las velas en cuyo cierre se cumplen todas las condiciones."""
        s = np.ones(len(m), dtype=bool)
        with np.errstate(invalid="ignore"):
            for cond in self.condiciones:
                s &= _REGLAS[cond["tipo"]](m, cond)
        return s

    def describir(self) -> str:
        accion = "COMPRA" if self.direccion == "largo" else "VENDE EN CORTO"
        reglas = " y ".join(
            _TEXTOS[c["tipo"]].format(**{k: _num(v) if isinstance(v, float) else v for k, v in c.items()})
            for c in self.condiciones
        )
        return (
            f"{accion} {self.simbolo} si {reglas} · stop {_num(self.stop_atr)}×ATR · "
            f"objetivo {_num(self.objetivo_atr)}×ATR · máx. {self.max_velas} velas"
        )


# ------------------------------------------------------------ generación --

def _elegir(rng: np.random.Generator, valores: list):
    return valores[int(rng.integers(len(valores)))]


def _vecino(rng: np.random.Generator, valores: list, actual):
    """Valor contiguo (un paso arriba o abajo) dentro de la lista permitida."""
    i = valores.index(actual) if actual in valores else 0
    return valores[min(max(i + int(rng.choice([-1, 1])), 0), len(valores) - 1)]


def _condicion(rng: np.random.Generator, tipo: str) -> dict:
    return {"tipo": tipo, **{p: _elegir(rng, vals) for p, vals in TIPOS[tipo][1].items()}}


def _condicion_de_familia(rng: np.random.Generator, familia: str) -> dict:
    return _condicion(rng, _elegir(rng, list(FAMILIAS[familia])))


def aleatoria(rng: np.random.Generator, simbolo: str, intervalo: str) -> Estrategia:
    n = int(rng.choice([1, 2, 3], p=[0.25, 0.5, 0.25]))
    familias = [list(FAMILIAS)[i] for i in rng.permutation(len(FAMILIAS))[:n]]
    return Estrategia(
        simbolo=simbolo,
        intervalo=intervalo,
        direccion=_elegir(rng, ["largo", "corto"]),
        condiciones=[_condicion_de_familia(rng, f) for f in familias],
        **{k: _elegir(rng, v) for k, v in SALIDAS.items()},
    )


def mutar(e: Estrategia, rng: np.random.Generator) -> Estrategia:
    """Copia de la estrategia con un cambio pequeño (como una mutación genética)."""
    d = e.a_dict()
    conds = [dict(c) for c in d["condiciones"]]
    usadas = {TIPOS[c["tipo"]][0] for c in conds}
    libres = [f for f in FAMILIAS if f not in usadas]
    op = int(rng.integers(6))
    i = int(rng.integers(len(conds)))
    params = [p for p in TIPOS[conds[i]["tipo"]][1]]
    if op == 0 and params:  # ajustar un parámetro
        p = _elegir(rng, params)
        conds[i][p] = _vecino(rng, TIPOS[conds[i]["tipo"]][1][p], conds[i][p])
    elif op == 1:  # cambiar la condición por la contraria de su familia (p. ej. RSI bajo -> RSI alto)
        familia = TIPOS[conds[i]["tipo"]][0]
        otro = [t for t in FAMILIAS[familia] if t != conds[i]["tipo"]][0]
        conds[i] = _condicion(rng, otro)
    elif op == 2 and libres:  # sustituir una condición por otra de otra familia
        conds[i] = _condicion_de_familia(rng, _elegir(rng, libres))
    elif op == 3 and libres and len(conds) < 3:  # añadir una condición
        conds.append(_condicion_de_familia(rng, _elegir(rng, libres)))
    elif op == 4 and len(conds) > 1:  # quitar una condición
        conds.pop(i)
    else:  # tocar la salida
        k = _elegir(rng, list(SALIDAS))
        d[k] = _vecino(rng, SALIDAS[k], d[k])
    d["condiciones"] = conds
    return Estrategia.de_dict(d)


def cruzar(a: Estrategia, b: Estrategia, rng: np.random.Generator) -> Estrategia:
    """Hija con condiciones y salidas mezcladas de dos estrategias."""
    por_familia = {TIPOS[c["tipo"]][0]: dict(c) for c in a.condiciones}
    for c in b.condiciones:
        if rng.random() < 0.5:
            por_familia[TIPOS[c["tipo"]][0]] = dict(c)
    conds = list(por_familia.values())
    if len(conds) > 3:
        conds = [conds[j] for j in rng.permutation(len(conds))[:3]]
    salidas = {k: getattr(a if rng.random() < 0.5 else b, k) for k in SALIDAS}
    return Estrategia(a.simbolo, a.intervalo, a.direccion, conds, **salidas)


def vecina(e: Estrategia, rng: np.random.Generator) -> Estrategia:
    """Misma idea con parámetros ligeramente distintos (para la prueba de estabilidad)."""
    while True:
        d = e.a_dict()
        for c in d["condiciones"]:
            for p, vals in TIPOS[c["tipo"]][1].items():
                if rng.random() < 0.5:
                    c[p] = _vecino(rng, vals, c[p])
        for k, vals in SALIDAS.items():
            if rng.random() < 0.5:
                d[k] = _vecino(rng, vals, d[k])
        otra = Estrategia.de_dict(d)
        if otra.firma() != e.firma():
            return otra
