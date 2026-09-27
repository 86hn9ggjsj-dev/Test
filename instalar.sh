#!/usr/bin/env bash
# Instalador de Jarvis para macOS y Linux. Uso: doble clic o "bash instalar.sh"
set -e
cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Necesitas Python 3. Descárgalo de https://www.python.org/downloads/ y vuelve a ejecutar este instalador."
  exit 1
fi

echo "Instalando Jarvis…"
python3 -m venv .venv
.venv/bin/python -m pip install --quiet --upgrade pip
.venv/bin/python -m pip install --quiet -r requirements.txt
chmod +x iniciar.sh

.venv/bin/python -m jarvis --configurar
echo
echo "Para abrir Jarvis cuando quieras:  ./iniciar.sh"
