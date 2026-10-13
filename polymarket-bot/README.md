# Polybot — agente autónomo de trading en Polymarket

Agente que corre 24/7, escanea Polymarket cada 10 minutos, usa **Claude** (`claude-opus-5-5`, con búsqueda web)
para estimar el *fair value* de cada mercado y opera solo cuando el edge supera 8 puntos, con
**1/4 Kelly** y reglas de riesgo que no se pueden saltar.

- **Modo por defecto: Paper Trading con $50.** Simula cada orden contra el libro de órdenes real del CLOB.
- **Live Trading** solo si lo activas a propósito (dos llaves: `TRADING_MODE=live` + `LIVE_TRADING_CONFIRM=yes`).
- Todo queda registrado: cada mercado evaluado, cada edge, cada trade, cada balance.

> ⚠️ **Antes de usarlo.** Polymarket no está permitido en todas las jurisdicciones y bloquea operar desde
> algunos países. Comprueba que es legal donde vives y que el VPS está en una región permitida; no uses VPN
> para saltarte un bloqueo. Esto no es asesoramiento financiero: con $50 puedes perderlo todo.

---

## Cómo funciona

```
cada 10 min
 ┌──────────────────────────────────────────────────────────────────────┐
 │ 1. Sincroniza caja · liquida mercados resueltos · valora posiciones  │
 │ 2. ¿Drawdown ≥ 40% desde el pico? → PARA, escribe post-mortem, espera │
 │ 3. Gamma API: hasta 1.000 mercados activos                           │
 │ 4. Filtro: liquidez > $5k, volumen, resuelve en > 2 h, fuente oficial │
 │ 5. Revisa posiciones: sale si edge < 2 pp, FV −5 pp, o resuelve ya   │
 │ 6. Mejores candidatos → libro CLOB → Claude estima fair value        │
 │       edge = fair value − precio de compra (ask)                     │
 │       edge > 8 pp → 1/4 Kelly (tope 6%) → reglas → orden             │
 │ 7. Guarda estado, logs, status.md                                    │
 └──────────────────────────────────────────────────────────────────────┘
```

**Claude es el cerebro, pero no tiene las manos.** Claude solo devuelve una probabilidad (a través de una
herramienta con esquema estricto). El tamaño, el permiso para entrar y la orden los decide código
determinista en `risk.py`. Así ninguna respuesta del modelo puede romper una regla dura.

### Estructura

```
polymarket-bot/
├── polybot/
│   ├── __main__.py    CLI: run / once / status / scan / approve / reset
│   ├── agent.py       el ciclo de 10 minutos
│   ├── brain.py       Claude + web search → fair value
│   ├── risk.py        Kelly fraccional, edge, reglas duras, drawdown
│   ├── filters.py     filtro de mercados elegibles
│   ├── polymarket.py  Gamma API + libros del CLOB (lectura)
│   ├── executor.py    Paper (simulado contra el libro real) y Live (py-clob-client)
│   ├── state.py       estado persistente (escritura atómica)
│   ├── journal.py     logs, diarios JSONL y status.md
│   ├── postmortem.py  informe automático al llegar al 40% de drawdown
│   └── config.py      configuración + límites duros
├── tests/             38 tests (reglas, Kelly, filtros, ciclo completo, cerebro)
├── deploy/            servicio systemd + instalador para VPS
├── Dockerfile, docker-compose.yml
└── .env.example
```

---

## Reglas duras (y dónde se aplican)

| Regla | Implementación |
|---|---|
| Máx. 6% del bankroll actual por posición | `risk.position_size_usd` — tope sobre la **equity** actual (caja + posiciones) |
| Máx. 5 posiciones abiertas | `risk.entry_blockers` + el agente deja de buscar entradas |
| Solo entrar con edge > 8 pp | Se comprueba **dos veces**: contra el mejor ask y contra el precio medio real de ejecución tras barrer el libro |
| 1/4 Kelly con tope del 6% | `f* = (p − precio)/(1 − precio)`, se usa `f*/4`, nunca más del 6% |
| Liquidez > $5.000 y fuente de resolución clara y oficial | Filtro determinista (`filters.py`) **y** Claude debe confirmar `resolution_source_clear=true` |
| Ignorar mercados que resuelven en < 2 h | `filters.py`; además las posiciones se cierran al quedar < 2 h |
| Drawdown 40% → parar, post-mortem, esperar aprobación | `agent._halt` + `postmortem.py`; solo `python -m polybot approve --yes` reanuda |
| Nunca añadir capital externo | El bankroll es contabilidad interna que arranca en $50. En live, la caja del bot **solo puede bajar** al saldo real de la wallet, nunca subir: si depositas más, el bot no lo usa |
| Loguear todo | Ver [Logs](#logs-y-estado) |

Los límites viven en `config.HARD_LIMITS`. Puedes hacerlos **más estrictos** por `.env`; si intentas
aflojarlos (p. ej. `MAX_POSITION_PCT=0.10`), el bot se niega a arrancar.

Filtros extra (más estrictos que el enunciado, ajustables): volumen 24 h ≥ $1.000, spread ≤ 5 pp, precio entre
3% y 97%, resolución en ≤ 60 días, confianza de Claude ≥ `medium`, tamaño ≥ mínimo del mercado (5 shares / $1).

---

## Arranque rápido (Paper Trading con $50)

Requisitos: Python 3.10+ y una API key de Claude (https://console.anthropic.com).

```bash
cd polymarket-bot
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # y pon tu ANTHROPIC_API_KEY
python -m polybot scan        # comprueba que llega a Polymarket (no gasta en Claude, no opera)
python -m polybot once        # un ciclo completo
python -m polybot run         # loop 24/7, un ciclo cada 10 minutos
```

Tests: `pip install -r requirements-dev.txt && pytest`

### Comandos

| Comando | Qué hace |
|---|---|
| `python -m polybot run` | Loop continuo. `Ctrl+C`/`SIGTERM` termina al acabar el ciclo |
| `python -m polybot once` | Un solo ciclo |
| `python -m polybot status` | Balance, pico, drawdown, posiciones, win rate, costes |
| `python -m polybot scan` | Lista los mercados que pasan el filtro |
| `python -m polybot approve --yes --note "..."` | Reanuda tras una parada por drawdown (el pico pasa a ser la equity actual) |
| `python -m polybot reset --yes` | Solo paper: reinicia con el bankroll inicial |

---

## Logs y estado

| Fichero | Contenido |
|---|---|
| `data/status.md` | Resumen legible: caja, equity, pico, drawdown, win rate, posiciones, últimos trades, contador de supervivencia |
| `data/decisions.jsonl` | **Cada** mercado evaluado: fair value, asks, lado, edge, edge al precio de ejecución, Kelly, tamaño, TRADE/SKIP y motivos, razonamiento y evidencias de Claude, coste de la llamada. También cada revisión de posición (HOLD/EXIT) |
| `data/trades.jsonl` | Cada apertura, cierre y liquidación |
| `data/equity.jsonl` | Balance por ciclo (para graficar la curva) |
| `data/events.jsonl` | Resumen del escaneo (rechazos por motivo), presupuesto agotado, paradas, aprobaciones |
| `data/state_paper.json` / `state_live.json` | Estado completo (paper y live nunca se mezclan) |
| `data/postmortem_*.md` | Informe al llegar al 40% de drawdown |
| `logs/polybot.log` | Log de texto rotativo (5 MB × 10) |

---

## Modo Survival: ¿se paga solo?

`status.md` muestra **Neto supervivencia = PnL trading − coste API Claude − coste VPS prorrateado**.
El bot calcula el coste real de cada llamada a partir de los tokens y búsquedas que devuelve la API.

Las cuentas son duras, y conviene verlas antes de empezar:

- Una evaluación con Opus 5.5, esfuerzo `high` y hasta 5 búsquedas web cuesta del orden de **$0,15–0,40**.
- Con $50 y un tope del 6%, cada posición es de **~$3**. Una apuesta con 10 pp de edge real gana de media
  unos **$0,30–0,60**.
- Con el presupuesto por defecto (`DAILY_API_BUDGET_USD=3`) gastas hasta ~$90/mes en Claude + $6 de VPS. Cubrir eso
  con $50 exigiría casi duplicar el capital cada mes. **No es realista.**

Para que tenga alguna opción de pagarse solo:

1. Baja el coste por evaluación: `CLAUDE_MODEL=claude-sonnet-5-5` (la mitad) o `claude-haiku-5-5` (mucho más barato,
   peor en investigación), `CLAUDE_EFFORT=medium`, `MAX_WEB_SEARCHES=3`.
2. Baja `DAILY_API_BUDGET_USD` (p. ej. 0,50) y `MAX_EVALUATIONS_PER_CYCLE` (p. ej. 2).
3. Usa un VPS de $4–5/mes.
4. Sube `MIN_CONFIDENCE=high` para operar menos y solo con convicción.

Aun así, lo más probable es que con $50 no cubra costes. Usa el paper trading para medirlo con números reales
antes de arriesgar dinero.

---

## Pasar a Live Trading

> Hazlo solo después de semanas de paper trading con resultados positivos **netos de costes**.

1. **Cuenta y fondos.** Crea una cuenta en polymarket.com, deposita **exactamente** el capital que quieres arriesgar
   (USDC en Polygon) y haz una operación manual pequeña desde la web: así se activan las aprobaciones (allowances)
   de tus tokens.
2. **Claves.**
   - `POLYMARKET_PRIVATE_KEY`: la clave privada de la wallet que firma. Cuenta con email/Magic: exporta la clave desde
     los ajustes de Polymarket. MetaMask: la clave de esa cuenta.
   - `POLYMARKET_FUNDER`: la dirección de tu wallet proxy de Polymarket (la que aparece en tu perfil/depósitos).
   - `POLYMARKET_SIGNATURE_TYPE`: `1` cuenta de email/Magic, `2` wallet de navegador, `0` EOA sin proxy.
   - **Usa una wallet dedicada solo al bot**, con solo el capital del bot. Nunca la clave de tu wallet principal.
3. **Activa las dos llaves** en `.env`:
   ```
   TRADING_MODE=live
   LIVE_TRADING_CONFIRM=yes
   INITIAL_BANKROLL=50
   ```
4. Ejecuta `python -m polybot once` y revisa el log. Debe decir `LIVE TRADING ACTIVO`.
5. Arranca el servicio.

Cómo opera en live:

- Órdenes **FOK** (todo o nada) con **precio límite** = precio esperado ± `MAX_SLIPPAGE` (2 pp), con el tick del mercado.
  Si el libro se mueve más que eso, la orden no se ejecuta.
- Estado separado (`state_live.json`), así que el historial de paper no contamina el de live.
- **Cobrar ganancias de mercados resueltos (redeem):** el bot las contabiliza, pero el cobro on-chain tienes que hacerlo
  tú desde polymarket.com. El log te avisa con `reclama (redeem)`.
- Para volver a paper basta con `TRADING_MODE=paper`.

---

## Subirlo a un VPS

Cualquier VPS Linux pequeño (1 vCPU, 1 GB RAM) sirve: el bot pasa casi todo el tiempo esperando.

### Opción A — systemd (recomendada)

```bash
# en tu ordenador
scp -r polymarket-bot usuario@IP_DEL_VPS:~/
# en el VPS
cd ~/polymarket-bot
sudo bash deploy/install_vps.sh          # instala en /opt/polybot con su propio usuario
sudo nano /opt/polybot/.env              # pon ANTHROPIC_API_KEY (y lo de live si aplica)
sudo systemctl start polybot
sudo journalctl -u polybot -f            # logs en directo
cd /opt/polybot && sudo -u polybot .venv/bin/python -m polybot status
```

Arranca solo al reiniciar el VPS y se reinicia si cae (`Restart=always`). `systemctl stop polybot` espera a que
termine el ciclo en curso.

### Opción B — Docker

```bash
cd polymarket-bot
cp .env.example .env && nano .env
docker compose up -d --build
docker compose logs -f
docker compose exec polybot python -m polybot status
```

`data/` y `logs/` quedan montados en el host, así que el estado sobrevive a reinicios y actualizaciones.

### Tras una parada por drawdown

```bash
cat /opt/polybot/data/postmortem_*.md                                   # léelo
cd /opt/polybot && sudo -u polybot .venv/bin/python -m polybot approve --yes --note "revisado, sigo"
```

---

## ¿Y los MCP servers de Polymarket?

He mirado `polymarket-agent-mcp` (demwick). Es un servidor MCP local (npx/stdio) con ~48 herramientas, y
**algunas colocan órdenes reales**. Lo he dejado fuera de la ruta de decisión a propósito: si Claude pudiera
operar a través de un MCP, se saltaría `risk.py` y las reglas duras dejarían de estar garantizadas por código.

Por eso el bot habla directamente con las APIs oficiales: Gamma para mercados, CLOB para libros y
`py-clob-client`, la librería oficial de Polymarket, para firmar órdenes. Si quieres usar ese MCP para investigar
a mano (smart money, backtests) desde Claude Code o Claude Desktop, adelante, pero en modo *preview* y fuera de
este bot.

---

## Decisiones de diseño a tener en cuenta

- **Edge contra el precio ejecutable.** `edge = fair value − ask` del lado que compraríamos (incluye comisión si
  configuras `TAKER_FEE`). Antes de operar se recalcula contra el precio medio real tras barrer el libro.
- **El fair value se mueve > 5 pp → salir** solo cuando el movimiento es **en contra** de la posición. Si se mueve a
  favor, el edge crece y no tiene sentido vender.
- **Re-estimación de posiciones:** el precio se revisa cada 10 min. Claude re-estima cada 60 min
  (`POSITION_REEVAL_MINUTES`) o antes si el precio se mueve ≥ 3 pp. Ponlo a 10 si quieres re-estimar en cada ciclo,
  pero el coste se multiplica por 6.
- **Parada por drawdown:** deja de abrir y cerrar posiciones ("parar todo trading"). Las abiertas se siguen valorando
  y se liquidan si el mercado resuelve. Si prefieres que liquide todo al parar, es un cambio pequeño en `agent._halt`.
- **Fallos de red o de la API:** se registran y el ciclo continúa. Un ciclo que falla nunca deja el estado corrupto
  (escritura atómica).
- **Rechazos de seguridad de Claude:** las peticiones usan el *fallback* del servidor (`fallbacks: "default"`), que
  repite la petición en otro modelo si un clasificador la rechaza. Si aun así no hay estimación, el mercado se salta.
