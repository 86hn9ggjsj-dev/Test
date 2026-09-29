"""Minería de estrategias: genera miles de estrategias, se queda con las que superan el embudo.

Mezcla búsqueda al azar con un algoritmo genético: cada generación conserva a las mejores
(sobre el 70 % inicial de los datos), crea hijas con pequeñas mutaciones o cruzándolas, y
añade estrategias nuevas al azar. Las que parecen rentables pasan por las pruebas de robustez.
"""

from __future__ import annotations

import datetime as dt
import threading
import time

import numpy as np

from . import almacen, banco
from .backtest import simular
from .config import DIAS_HISTORICO, INTERVALO, MAX_POR_SIMBOLO, PARTE_EN_MUESTRA
from .datos import velas
from .estrategia import Estrategia, aleatoria, cruzar, mutar
from .mercado import Mercado
from .robustez import ETAPAS, pruebas, rentable_en_muestra

SOLAPE_MAXIMO = 0.5  # si comparte más de la mitad del tiempo en mercado con una del banco, es "la misma"


def _ahora() -> str:
    return dt.datetime.now().astimezone().isoformat(timespec="seconds")


class EstadoMineria:
    """Estado en vivo de la minería, que la web lee de mineria.json."""

    def __init__(self) -> None:
        self.datos = {
            "estado": "parada",
            "embudo": {e: 0 for e in ETAPAS},
            "actividad": [],
            "inicio": _ahora(),
        }
        self._guardado = 0.0

    def empezar(self, simbolo: str, intervalo: str, generaciones: int) -> None:
        self.datos.update(estado="minando", simbolo=simbolo, intervalo=intervalo,
                          generacion=0, generaciones=generaciones)
        self.guardar(forzar=True)

    def contar(self, etapa: str) -> None:
        self.datos["embudo"][etapa] += 1

    def evento(self, texto: str, tipo: str = "info", consola: bool = True, **datos) -> None:
        if consola:
            print(f"[minería {dt.datetime.now():%H:%M:%S}] {texto}", flush=True)
        nuevo = {"t": _ahora(), "texto": texto, "tipo": tipo, **datos}
        self.datos["actividad"] = ([nuevo] + self.datos["actividad"])[:40]
        self.guardar(forzar=consola)

    def guardar(self, forzar: bool = False) -> None:
        if forzar or time.time() - self._guardado > 0.5:
            self.datos["actualizado"] = _ahora()
            almacen.guardar("mineria", self.datos)
            self._guardado = time.time()

    def terminar(self) -> None:
        self.datos["estado"] = "parada"
        self.guardar(forzar=True)


def _aptitud(met: dict) -> float:
    """Nota de una estrategia para el algoritmo genético: rentabilidad / caída máxima,
    penalizando las que operan poco (pocas operaciones = resultado poco fiable)."""
    return met["ret_dd"] * min(1.0, met["operaciones"] / 60)


def _solape(a: np.ndarray, b: np.ndarray) -> float:
    union = np.count_nonzero(a | b)
    return np.count_nonzero(a & b) / union if union else 0.0


def _embudo(est: Estrategia, m: Mercado, corte: int, rng: np.random.Generator, muestra: dict,
            ocupadas: list[np.ndarray], estado: EstadoMineria) -> dict | None:
    informe: dict = {"muestra": muestra}
    superadas: dict[str, str] = {}
    for etapa, ok, detalle, datos in pruebas(est, m, corte, rng):
        informe.update(datos)
        if not ok:
            estado.evento(f"{est.id} descartada en «{etapa}»: {detalle}", "descartada", consola=False,
                          id=est.id, etapa=etapa, detalle=detalle)
            return None
        estado.contar(etapa)
        superadas[etapa] = detalle
        estado.guardar()

    mascara = simular(est, m).en_mercado(len(m))
    if any(_solape(mascara, otra) > SOLAPE_MAXIMO for otra in ocupadas):
        estado.evento(f"{est.id} lo supera todo, pero se parece demasiado a otra del banco", "descartada",
                      consola=False, id=est.id, etapa="Distinta a las del banco")
        return None
    if len(ocupadas) >= MAX_POR_SIMBOLO:
        estado.evento(f"{est.id} lo supera todo, pero el banco de {est.simbolo} ya está lleno", "descartada",
                      consola=False, id=est.id, etapa="Distinta a las del banco")
        return None
    ocupadas.append(mascara)
    estado.contar("Distinta a las del banco")

    entrada = {
        "id": est.id,
        "estrategia": est.a_dict(),
        "descripcion": est.describir(),
        "fecha": _ahora(),
        "pruebas": superadas,
        **informe,
    }
    banco.anadir(entrada)
    estado.evento(f"✓ {est.id} aprobada → banco: {est.describir()}", "aprobada", id=est.id,
                  simbolo=est.simbolo, fuera=superadas["Fuera de muestra"])
    print(f"   fuera de muestra: {superadas['Fuera de muestra']}", flush=True)
    return entrada


def minar(simbolo: str, intervalo: str = INTERVALO, estrategias: int = 2000, generaciones: int = 10,
          dias: int = DIAS_HISTORICO, semilla: int | None = None,
          estado: EstadoMineria | None = None) -> list[dict]:
    """Una ronda de minería sobre un símbolo. Devuelve las estrategias aprobadas."""
    rng = np.random.default_rng(semilla)
    estado = estado or EstadoMineria()
    simbolo = simbolo.upper()
    estado.empezar(simbolo, intervalo, generaciones)
    estado.evento(f"Descargando velas de {simbolo} ({intervalo}, {dias} días)…", "descarga", simbolo=simbolo)
    m = Mercado(velas(simbolo, intervalo, dias), simbolo, intervalo)
    corte = int(len(m) * PARTE_EN_MUESTRA)
    estado.evento(
        f"{len(m)} velas. Mino con las de {m.tiempo[0]:%d/%m/%Y} a {m.tiempo[corte]:%d/%m/%Y}; "
        f"de ahí a hoy las guardo para validar."
    )

    ocupadas = [
        simular(Estrategia.de_dict(b["estrategia"]), m).en_mercado(len(m))
        for b in banco.cargar()
        if b["estrategia"]["simbolo"] == simbolo and b["estrategia"]["intervalo"] == intervalo
    ]
    tam = max(20, estrategias // generaciones)
    vistas: set[str] = set()
    puntuadas: list[tuple[float, Estrategia]] = []
    aprobadas: list[dict] = []
    poblacion = [aleatoria(rng, simbolo, intervalo) for _ in range(tam)]

    for g in range(1, generaciones + 1):
        estado.datos["generacion"] = g
        for est in poblacion:
            vistas.add(est.id)
            met = simular(est, m, fin=corte).metricas
            puntuadas.append((_aptitud(met), est))
            estado.contar("Generadas")
            if rentable_en_muestra(met):
                estado.contar("Rentables en muestra")
                if entrada := _embudo(est, m, corte, rng, met, ocupadas, estado):
                    aprobadas.append(entrada)
            estado.guardar()

        embudo = estado.datos["embudo"]
        estado.evento(
            f"{simbolo} · generación {g}/{generaciones}: {embudo['Generadas']} evaluadas, "
            f"{embudo['Rentables en muestra']} rentables en muestra, {len(aprobadas)} aprobadas",
            "generacion", simbolo=simbolo, generacion=g, generaciones=generaciones,
        )

        # Siguiente generación: hijas de las mejores + sangre nueva al azar.
        puntuadas.sort(key=lambda x: x[0], reverse=True)
        elite = [e for _, e in puntuadas[: max(5, tam // 5)]]
        poblacion, nuevas = [], set()
        for _ in range(tam * 20):
            if len(poblacion) >= tam:
                break
            x = rng.random()
            if x < 0.5:
                hija = mutar(elite[int(rng.integers(len(elite)))], rng)
            elif x < 0.65:
                a, b = (elite[int(i)] for i in rng.choice(len(elite), 2, replace=False))
                hija = cruzar(a, b, rng)
            else:
                hija = aleatoria(rng, simbolo, intervalo)
            if hija.id not in vistas and hija.id not in nuevas:
                nuevas.add(hija.id)
                poblacion.append(hija)

    estado.terminar()
    return aprobadas


def minar_continuo(simbolos: list[str], intervalo: str = INTERVALO, estrategias: int = 2000,
                   generaciones: int = 10, dias: int = DIAS_HISTORICO, pausa_min: float = 15,
                   parar: threading.Event | None = None) -> None:
    """Mina los símbolos por rondas, sin fin, con un descanso entre ronda y ronda."""
    parar = parar or threading.Event()
    estado = EstadoMineria()
    ronda = 0
    while not parar.is_set():
        ronda += 1
        for simbolo in simbolos:
            if parar.is_set():
                break
            en_banco = sum(b["estrategia"]["simbolo"] == simbolo.upper() for b in banco.cargar())
            if en_banco >= MAX_POR_SIMBOLO:
                estado.evento(f"{simbolo.upper()} ya tiene {en_banco} estrategias en el banco; me lo salto.")
                continue
            try:
                minar(simbolo, intervalo, estrategias, generaciones, dias, estado=estado)
            except (OSError, ValueError) as e:  # sin conexión, símbolo raro...
                estado.terminar()
                estado.evento(f"No he podido minar {simbolo.upper()}: {e}", "error")
        proxima = dt.datetime.now().astimezone() + dt.timedelta(minutes=pausa_min)
        estado.datos.update(estado="descanso", proxima=proxima.isoformat(timespec="seconds"))
        estado.evento(f"Ronda {ronda} terminada. Descanso hasta las {proxima:%H:%M}.", "descanso")
        parar.wait(pausa_min * 60)
    estado.terminar()
