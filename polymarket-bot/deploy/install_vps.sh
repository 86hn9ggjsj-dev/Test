#!/usr/bin/env bash
# Instala Polybot como servicio systemd en un VPS Ubuntu/Debian.
# Uso (desde la carpeta polymarket-bot):  sudo bash deploy/install_vps.sh
set -euo pipefail

APP_DIR=/opt/polybot
SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)"

apt-get update -y
apt-get install -y python3 python3-venv python3-pip rsync

id -u polybot >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin polybot
mkdir -p "$APP_DIR"
rsync -a --exclude .venv --exclude data --exclude logs "$SRC_DIR"/ "$APP_DIR"/
mkdir -p "$APP_DIR/data" "$APP_DIR/logs"

python3 -m venv "$APP_DIR/.venv"
"$APP_DIR/.venv/bin/pip" install --upgrade pip
"$APP_DIR/.venv/bin/pip" install -r "$APP_DIR/requirements.txt"

if [ ! -f "$APP_DIR/.env" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  echo ">> Edita $APP_DIR/.env y pon tu ANTHROPIC_API_KEY antes de arrancar."
fi
chmod 600 "$APP_DIR/.env"
chown -R polybot:polybot "$APP_DIR"

cp "$APP_DIR/deploy/polybot.service" /etc/systemd/system/polybot.service
systemctl daemon-reload
systemctl enable polybot

echo
echo "Listo. Comandos útiles:"
echo "  sudo systemctl start polybot        # arrancar"
echo "  sudo journalctl -u polybot -f       # ver logs en directo"
echo "  cd $APP_DIR && sudo -u polybot .venv/bin/python -m polybot status"
