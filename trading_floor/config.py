"""Configuración del Trading Floor."""

from __future__ import annotations

import os
from pathlib import Path

DATA_DIR = Path(os.environ.get("TRADING_FLOOR_DIR", Path.home() / ".trading_floor"))
DATA_DIR.mkdir(parents=True, exist_ok=True)

SIMBOLOS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"]
INTERVALO = "1h"
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

# En la minería continua, un símbolo deja de minarse cuando ya tiene tantas estrategias en el banco.
MAX_POR_SIMBOLO = 8
