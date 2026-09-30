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

# Mesas de cada sala: 6 activos x 8 = las 48 mesas de trading (las mesas no son de un activo: se reparten según llegan).
MAX_POR_SIMBOLO = 8
# Además de lo que cabe en las mesas, cada activo puede tener estrategias de reserva en el banco: cuando el supervisor
# retira una estrategia que no funciona, su trader recibe la mejor de la reserva.
RESERVA_POR_SIMBOLO = 2

# Sala de scalping: operaciones cortas con velas de 5 minutos, en los activos más líquidos.
SCALPING_INTERVALO = "5m"
SCALPING_DIAS = 120  # historia para minar scalping: 120 días de velas de 5 minutos
SCALPING_SIMBOLOS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"]
MAX_SCALPERS_POR_SIMBOLO = 4  # 3 activos x 4 = las 12 mesas de la sala de scalping
RESERVA_SCALPING_POR_SIMBOLO = 1
# Los scalpers trabajan con órdenes límite: pagan comisión de «maker» (0,02 % en Binance Futures) en vez de la de
# «taker» (0,05 %). Se añade un poco de deslizamiento para no ser optimistas: 0,06 % ida y vuelta, frente al 0,14 %.
COMISION_SCALPING = 0.0002
DESLIZAMIENTO_SCALPING = 0.0001
COSTE_SCALPING = 2 * (COMISION_SCALPING + DESLIZAMIENTO_SCALPING)


def es_scalping(intervalo: str) -> bool:
    return intervalo == SCALPING_INTERVALO


def coste_de(intervalo: str) -> float:
    """Coste de ida y vuelta (comisiones + deslizamiento) según la sala."""
    return COSTE_SCALPING if es_scalping(intervalo) else COSTE_IDA_VUELTA


def dias_de(intervalo: str) -> int:
    """Historia que se descarga para cada tipo de vela."""
    return SCALPING_DIAS if es_scalping(intervalo) else DIAS_HISTORICO


MESAS = {"trading": MAX_POR_SIMBOLO * len(SIMBOLOS), "scalping": MAX_SCALPERS_POR_SIMBOLO * len(SCALPING_SIMBOLOS)}


def cupo_banco(intervalo: str) -> int:
    """Cuántas estrategias de un mismo activo caben en el banco (las de las mesas más la reserva)."""
    if es_scalping(intervalo):
        return MAX_SCALPERS_POR_SIMBOLO + RESERVA_SCALPING_POR_SIMBOLO
    return MAX_POR_SIMBOLO + RESERVA_POR_SIMBOLO


# Supervisor de cada sala (papel.py): cada trader tiene un periodo de prueba con su estrategia. Si al acabarlo va en
# pérdidas (o si antes pierde demasiado), el supervisor le retira la estrategia, cuando no tiene nada abierto, y le da
# la mejor de la reserva del banco. Después sigue vigilando: si vuelve a pérdidas, se repite.
PRUEBA = {
    "trading": {"dias": 14, "operaciones": 6, "corte_pct": 5.0},   # 2 semanas y 6 operaciones; fuera si pierde un 5 %
    "scalping": {"dias": 3, "operaciones": 20, "corte_pct": 4.0},  # 3 días y 20 operaciones; fuera si pierde un 4 %
}


# Gestión de riesgo del paper trading (ver riesgo.py).
RIESGO_POR_OPERACION = 0.01  # cada operación arriesga como máximo el 1 % del capital de su trader
MAX_POSICIONES = 16  # posiciones abiertas a la vez en toda la sala
MAX_POSICIONES_SCALPING = 12  # posiciones abiertas a la vez en la sala de scalping (una por mesa: son operaciones cortas)
MAX_MISMA_APUESTA = 3  # posiciones abiertas en el mismo símbolo y la misma dirección (en cada sala)
LIMITE_PERDIDA_DIARIA = 0.02  # si el día pierde un 2 % del capital, no se abren más posiciones hoy
MAX_CAIDA = 0.06  # si el resultado cae un 6 % del capital desde su máximo, se pausan las entradas

# Tu fondo (fondo.py): capital ficticio que aportas al empezar y valor inicial de cada participación.
FONDO_CAPITAL_INICIAL = 100_000.0
FONDO_VL_INICIAL = 10.0

# Sala de holding: carteras de largo plazo sin stop, que promedian a la baja (ver holding.py).
CAPITAL_HOLDING = {"BTCUSDT": 5_000.0, "ETHUSDT": 3_000.0, "SOLUSDT": 2_000.0}

# Chat con la oficina: modelo de Claude si hay ANTHROPIC_API_KEY en el .env (si no, modo básico gratis).
MODELO_CHAT = os.environ.get("TRADING_FLOOR_MODELO", "claude-opus-5-5")
