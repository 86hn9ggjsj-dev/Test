"""Configuración del Trading Floor."""

from __future__ import annotations

import os
from pathlib import Path

# Claves opcionales (por ejemplo la de Claude para el chat) en el .env de la raíz del proyecto.
try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass

DATA_DIR = Path(os.environ.get("TRADING_FLOOR_DIR", Path.home() / ".trading_floor"))
DATA_DIR.mkdir(parents=True, exist_ok=True)

SIMBOLOS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "DOGEUSDT"]
INTERVALO = "30m"  # los traders deciden al cierre de cada vela de media hora
DIAS_HISTORICO = 3 * 365

# Costes por lado (al entrar y al salir): comisión "taker" típica de un exchange de cripto
# más deslizamiento (el precio al que te ejecutan siempre es algo peor que el que ves).
COMISION = 0.0005
DESLIZAMIENTO = 0.0002
COSTE_IDA_VUELTA = 2 * (COMISION + DESLIZAMIENTO)

CAPITAL_BACKTEST = 10_000.0
CAPITAL_POR_ESTRATEGIA = 1_000.0  # dinero ficticio que recibe cada estrategia en el paper trading

# La minería solo ve el 70 % inicial de los datos; el 30 % final se reserva para validar.
PARTE_EN_MUESTRA = 0.7

# La sala de trading tiene 88 mesas: 48 en la planta baja y 40 más en la planta 1 («sala de trading 2»). Las mesas no son
# de un activo: se reparten según llegan, y cada activo puede tener como mucho MAX_POR_SIMBOLO estrategias en ellas.
MESAS_TRADING = 88
MAX_POR_SIMBOLO = 15
# Además de lo que cabe en las mesas, cada activo puede tener en el banco estrategias que aún están en la incubadora o
# esperando plaza en ella (el banquillo).
RESERVA_POR_SIMBOLO = 6

# Sala de scalping: operaciones cortas con velas de 5 minutos, en los activos más líquidos.
SCALPING_INTERVALO = "5m"
SCALPING_DIAS = 120  # historia para minar scalping: 120 días de velas de 5 minutos
SCALPING_SIMBOLOS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"]
MAX_SCALPERS_POR_SIMBOLO = 4  # 3 activos x 4 = las 12 mesas de la sala de scalping
RESERVA_SCALPING_POR_SIMBOLO = 3
# Los scalpers trabajan con órdenes límite: pagan comisión de «maker» (0,02 % en Binance Futures) en vez de la de
# «taker» (0,05 %). Se añade un poco de deslizamiento para no ser optimistas: 0,06 % ida y vuelta, frente al 0,14 %.
COMISION_SCALPING = 0.0002
DESLIZAMIENTO_SCALPING = 0.0001
COSTE_SCALPING = 2 * (COMISION_SCALPING + DESLIZAMIENTO_SCALPING)

# Mesa de análisis (mesa.py): en la sala de trading solo entra lo que gana al menos 1,5 veces lo que arriesga
# (objetivo frente a stop). La minería ya no genera estrategias de trading por debajo: la mesa nunca las dejaría entrar.
RB_MINIMO = 1.5


def es_scalping(intervalo: str) -> bool:
    return intervalo == SCALPING_INTERVALO


def coste_de(intervalo: str) -> float:
    """Coste de ida y vuelta (comisiones + deslizamiento) según la sala."""
    return COSTE_SCALPING if es_scalping(intervalo) else COSTE_IDA_VUELTA


def dias_de(intervalo: str) -> int:
    """Historia que se descarga para cada tipo de vela."""
    return SCALPING_DIAS if es_scalping(intervalo) else DIAS_HISTORICO


MESAS = {"trading": MESAS_TRADING, "scalping": MAX_SCALPERS_POR_SIMBOLO * len(SCALPING_SIMBOLOS)}
MESAS_INICIALES = {"trading": 48, "scalping": 12}   # las que había al estrenar el fondo (el reparto inicial: 1.000 $ por mesa)


def cupo_banco(intervalo: str) -> int:
    """Cuántas estrategias de un mismo activo caben en el banco (las de las mesas más la reserva)."""
    if es_scalping(intervalo):
        return MAX_SCALPERS_POR_SIMBOLO + RESERVA_SCALPING_POR_SIMBOLO
    return MAX_POR_SIMBOLO + RESERVA_POR_SIMBOLO


# Incubadora (papel.py): toda estrategia nueva opera primero aquí, con dinero de prueba que NO es del fondo, hasta que
# aprueba su examen. Solo entonces pasa a una mesa con capital del fondo. Si suspende, se descarta sin haberte costado nada.
CAPITAL_INCUBADORA = 1_000.0
INCUBADORA = {
    # trading: aprueba con 15 operaciones y 10 días como mínimo, ganando y con un factor de beneficio de 1,2 o más;
    # si en 90 días no llega a 15 operaciones, se le examina con 8. Suspende si pierde un 4 % del dinero de prueba.
    # (Antes bastaban 10 operaciones, 7 días y un factor de 1,1: ahora el examen es más largo y más exigente.)
    "trading": {"plazas": 24, "operaciones": 15, "dias_min": 10, "dias_max": 90, "operaciones_al_final": 8,
                "factor_min": 1.2, "corte_pct": 4.0},
    "scalping": {"plazas": 8, "operaciones": 40, "dias_min": 3, "dias_max": 21, "operaciones_al_final": 16,
                 "factor_min": 1.2, "corte_pct": 3.0},
}

# Supervisor de cada sala (papel.py): ya en su mesa, cada trader tiene un periodo de prueba con su estrategia. Si al
# acabarlo va en pérdidas (o si antes pierde demasiado), el supervisor le retira la estrategia, cuando no tiene nada
# abierto, y le da la mejor aprobada de la incubadora. Después sigue vigilando: si vuelve a pérdidas, se repite.
PRUEBA = {
    "trading": {"dias": 14, "operaciones": 6, "corte_pct": 5.0},   # 2 semanas y 6 operaciones; fuera si pierde un 5 %
    "scalping": {"dias": 3, "operaciones": 20, "corte_pct": 4.0},  # 3 días y 20 operaciones; fuera si pierde un 4 %
}


# Gestión de riesgo del paper trading (ver riesgo.py).
RIESGO_POR_OPERACION = 0.01  # cada operación arriesga como máximo el 1 % del capital de su trader
MAX_POSICIONES = 28  # posiciones abiertas a la vez en toda la sala de trading (eran 16 con 48 mesas)
MAX_POSICIONES_SCALPING = 12  # posiciones abiertas a la vez en la sala de scalping (una por mesa: son operaciones cortas)
MAX_MISMA_APUESTA = 3  # posiciones abiertas en el mismo símbolo y la misma dirección (en cada sala)
LIMITE_PERDIDA_DIARIA = 0.02  # si el día pierde un 2 % del capital, no se abren más posiciones hoy
MAX_CAIDA = 0.06  # si el resultado cae un 6 % del capital desde su máximo, se pausan las entradas...
PAUSA_CAIDA_HORAS = 24  # ...durante 24 horas; después se reanuda y la caída se mide desde ese momento

# Kelly prudente (papel.py): con suficientes operaciones reales, el riesgo de cada operación sale de la fórmula de
# Kelly con una estimación conservadora del acierto, y se usa solo una cuarta parte, entre un mínimo y un tope.
KELLY_MIN_OPERACIONES = 30
KELLY_FRACCION = 0.25
KELLY_TOPE = 1.5        # como mucho 1,5 veces el riesgo por operación que tengas puesto
KELLY_MINIMO = 0.0025   # y como poco un 0,25 % del capital

# Liquidez remunerada (liquidez.py): el dinero sin invertir cobra el tipo de las letras del Tesoro de EE. UU. a 3 meses
# (lo descarga la sala de macro); si no hay dato, este tipo anual en %.
TIPO_LIQUIDEZ = 4.0
# Reparto que más habría ganado con datos reales de 2022 a hoy (README, «Lo que dicen los datos»); lo que falta hasta el
# 100 % (un 30 %) queda sin invertir cobrando intereses. Es una propuesta: solo se aplica si tú la apruebas.
# Con el freno lento del holding (octubre de 2026): el holding arriesga mucho menos, así que se puede invertir más.
REPARTO_RENTABLE = {"trading": 5.0, "scalping": 0.0, "holding": 40.0, "tendencia": 45.0}

# Tu fondo (fondo.py): capital ficticio que aportas al empezar y valor inicial de cada participación.
FONDO_CAPITAL_INICIAL = 100_000.0
FONDO_VL_INICIAL = 10.0

# Sala de holding: carteras de largo plazo sin stop, que promedian a la baja (ver holding.py).
CAPITAL_HOLDING = {"BTCUSDT": 5_000.0, "ETHUSDT": 3_000.0, "SOLUSDT": 2_000.0}

# Chat con la oficina: modelo de Claude si hay ANTHROPIC_API_KEY en el .env (si no, modo básico gratis).
MODELO_CHAT = os.environ.get("TRADING_FLOOR_MODELO", "claude-opus-5-5")
