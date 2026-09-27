#!/usr/bin/env bash
# Arranca Jarvis. Ejemplos: ./iniciar.sh   ./iniciar.sh --voz   ./iniciar.sh --vigilar
cd "$(dirname "$0")"
if [ ! -x .venv/bin/python ]; then
  echo "Primero ejecuta el instalador: bash instalar.sh"
  exit 1
fi
exec .venv/bin/python -m jarvis "$@"
