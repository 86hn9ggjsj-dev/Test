#!/usr/bin/env bash
# Trading Floor: minería de estrategias + paper trading (dinero ficticio) + oficina isométrica.
# Ejemplos: ./trading.sh            (todo, y abre la oficina en el navegador)
#           ./trading.sh minar      (una ronda de minería)
#           ./trading.sh banco      (ver las estrategias aprobadas)
cd "$(dirname "$0")"
if [ ! -x .venv/bin/python ]; then
  if ! command -v python3 >/dev/null 2>&1; then
    echo "Necesitas Python 3. Descárgalo de https://www.python.org/downloads/ y vuelve a probar."
    exit 1
  fi
  echo "Preparando el Trading Floor (solo la primera vez)…"
  python3 -m venv .venv && .venv/bin/python -m pip install --quiet --upgrade pip \
    && .venv/bin/python -m pip install --quiet -r requirements.txt || exit 1
fi
exec .venv/bin/python -m trading_floor "$@"
