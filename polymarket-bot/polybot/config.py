"""Configuración del bot.

Todo se lee de variables de entorno (o de un fichero .env). Las REGLAS DURAS
viven en `HARD_LIMITS` y no se pueden aflojar desde fuera: si una variable de
entorno intenta relajarlas, el bot se niega a arrancar.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - dotenv es opcional
    load_dotenv = None


# Reglas duras del enunciado. Un valor configurado solo puede ser IGUAL o MÁS
# ESTRICTO que estos.
HARD_LIMITS = {
    "max_position_pct": 0.06,       # máx. 6% del bankroll actual por posición
    "max_open_positions": 5,        # máx. 5 posiciones a la vez
    "min_edge": 0.08,               # solo entrar con edge > 8 pp
    "kelly_fraction": 0.25,         # 1/4 Kelly
    "min_liquidity": 5000.0,        # liquidez > $5.000
    "min_hours_to_resolution": 2.0, # ignorar mercados que resuelven en < 2 h
    "max_drawdown": 0.40,           # parar todo al 40% de drawdown desde el pico
}

# Precios por millón de tokens (input, output) en USD, para llevar la cuenta
# de lo que cuesta el "cerebro". Fuente: tabla de precios de Anthropic.
MODEL_PRICES = {
    "claude-opus-5-5": (4.00, 20.00),
    "claude-sonnet-5-5": (2.00, 10.00),
    "claude-haiku-5-5": (0.10, 0.50),
}
WEB_SEARCH_PRICE_PER_REQUEST = 10.00 / 1000  # $10 por cada 1.000 búsquedas


def _env(name: str, default: str) -> str:
    value = os.environ.get(name)
    return default if value is None or value.strip() == "" else value.strip()


def _float(name: str, default: float) -> float:
    return float(_env(name, str(default)))


def _int(name: str, default: int) -> int:
    return int(_env(name, str(default)))


@dataclass(frozen=True)
class Config:
    # --- Modo ---
    mode: str = "paper"                      # "paper" (por defecto) o "live"
    initial_bankroll: float = 50.0

    # --- Reglas duras (ver HARD_LIMITS) ---
    max_position_pct: float = 0.06
    max_open_positions: int = 5
    min_edge: float = 0.08
    kelly_fraction: float = 0.25
    min_liquidity: float = 5000.0
    min_hours_to_resolution: float = 2.0
    max_drawdown: float = 0.40

    # --- Filtros adicionales (más estrictos que el enunciado, ajustables) ---
    min_volume_24h: float = 1000.0
    max_spread: float = 0.05                 # descarta libros con spread > 5 pp
    min_price: float = 0.03                  # evita colas extremas (0-3% / 97-100%)
    max_price: float = 0.97
    max_days_to_resolution: float = 60.0     # capital atado demasiado tiempo = coste de oportunidad
    min_confidence: str = "medium"           # "low" | "medium" | "high"
    taker_fee: float = 0.0                   # comisión por $ apostado (se resta del edge)

    # --- Salidas ---
    exit_edge: float = 0.02                  # el edge "desaparece" si cae por debajo de 2 pp
    fv_move_exit: float = 0.05               # salir si el fair value se mueve > 5 pp en contra
    exit_hours_before_resolution: float = 2.0

    # --- Loop ---
    loop_minutes: float = 10.0
    max_markets_scan: int = 1000
    max_evaluations_per_cycle: int = 4       # llamadas a Claude para candidatos nuevos por ciclo
    reevaluate_after_minutes: float = 240.0  # no re-evaluar un candidato sin posición antes de esto
    position_reeval_minutes: float = 60.0    # re-estimar posiciones abiertas cada X minutos
    reeval_price_move: float = 0.03          # ...o antes si el precio se movió > 3 pp

    # --- Cerebro (Claude) ---
    model: str = "claude-opus-5-5"
    effort: str = "high"
    max_web_searches: int = 5
    daily_api_budget_usd: float = 3.00       # tope de gasto diario en la API de Claude
    vps_monthly_usd: float = 6.00            # para el contador de supervivencia

    # --- Live ---
    live_confirm: bool = False
    private_key: str = field(default="", repr=False)
    funder: str = ""
    signature_type: int = 1
    max_slippage: float = 0.02               # precio límite = precio esperado ± 2 pp

    # --- Rutas ---
    data_dir: Path = Path("data")
    log_dir: Path = Path("logs")

    def validate(self) -> None:
        errors = []
        if self.mode not in ("paper", "live"):
            errors.append(f"TRADING_MODE debe ser 'paper' o 'live', no {self.mode!r}")
        if self.max_position_pct > HARD_LIMITS["max_position_pct"]:
            errors.append("MAX_POSITION_PCT no puede superar 0.06")
        if self.max_open_positions > HARD_LIMITS["max_open_positions"]:
            errors.append("MAX_OPEN_POSITIONS no puede superar 5")
        if self.min_edge < HARD_LIMITS["min_edge"]:
            errors.append("MIN_EDGE no puede ser menor que 0.08")
        if self.kelly_fraction > HARD_LIMITS["kelly_fraction"]:
            errors.append("KELLY_FRACTION no puede superar 0.25")
        if self.min_liquidity < HARD_LIMITS["min_liquidity"]:
            errors.append("MIN_LIQUIDITY no puede ser menor que 5000")
        if self.min_hours_to_resolution < HARD_LIMITS["min_hours_to_resolution"]:
            errors.append("MIN_HOURS_TO_RESOLUTION no puede ser menor que 2")
        if self.max_drawdown > HARD_LIMITS["max_drawdown"]:
            errors.append("MAX_DRAWDOWN no puede superar 0.40")
        if self.min_confidence not in ("low", "medium", "high"):
            errors.append("MIN_CONFIDENCE debe ser low, medium o high")
        if self.mode == "live":
            if not self.live_confirm:
                errors.append("Live Trading requiere LIVE_TRADING_CONFIRM=yes")
            if not self.private_key:
                errors.append("Live Trading requiere POLYMARKET_PRIVATE_KEY")
            if self.signature_type in (1, 2) and not self.funder:
                errors.append("Con POLYMARKET_SIGNATURE_TYPE 1 o 2 hace falta POLYMARKET_FUNDER")
        if errors:
            raise ValueError("Configuración inválida:\n  - " + "\n  - ".join(errors))

    @property
    def state_path(self) -> Path:
        return self.data_dir / f"state_{self.mode}.json"


def load_config(env_file: str | None = ".env") -> Config:
    if load_dotenv and env_file and Path(env_file).exists():
        load_dotenv(env_file)
    cfg = Config(
        mode=_env("TRADING_MODE", "paper").lower(),
        initial_bankroll=_float("INITIAL_BANKROLL", 50.0),
        max_position_pct=_float("MAX_POSITION_PCT", 0.06),
        max_open_positions=_int("MAX_OPEN_POSITIONS", 5),
        min_edge=_float("MIN_EDGE", 0.08),
        kelly_fraction=_float("KELLY_FRACTION", 0.25),
        min_liquidity=_float("MIN_LIQUIDITY", 5000.0),
        min_hours_to_resolution=_float("MIN_HOURS_TO_RESOLUTION", 2.0),
        max_drawdown=_float("MAX_DRAWDOWN", 0.40),
        min_volume_24h=_float("MIN_VOLUME_24H", 1000.0),
        max_spread=_float("MAX_SPREAD", 0.05),
        min_price=_float("MIN_PRICE", 0.03),
        max_price=_float("MAX_PRICE", 0.97),
        max_days_to_resolution=_float("MAX_DAYS_TO_RESOLUTION", 60.0),
        min_confidence=_env("MIN_CONFIDENCE", "medium").lower(),
        taker_fee=_float("TAKER_FEE", 0.0),
        exit_edge=_float("EXIT_EDGE", 0.02),
        fv_move_exit=_float("FV_MOVE_EXIT", 0.05),
        exit_hours_before_resolution=_float("EXIT_HOURS_BEFORE_RESOLUTION", 2.0),
        loop_minutes=_float("LOOP_MINUTES", 10.0),
        max_markets_scan=_int("MAX_MARKETS_SCAN", 1000),
        max_evaluations_per_cycle=_int("MAX_EVALUATIONS_PER_CYCLE", 4),
        reevaluate_after_minutes=_float("REEVALUATE_AFTER_MINUTES", 240.0),
        position_reeval_minutes=_float("POSITION_REEVAL_MINUTES", 60.0),
        reeval_price_move=_float("REEVAL_PRICE_MOVE", 0.03),
        model=_env("CLAUDE_MODEL", "claude-opus-5-5"),
        effort=_env("CLAUDE_EFFORT", "high"),
        max_web_searches=_int("MAX_WEB_SEARCHES", 5),
        daily_api_budget_usd=_float("DAILY_API_BUDGET_USD", 3.00),
        vps_monthly_usd=_float("VPS_MONTHLY_USD", 6.00),
        live_confirm=_env("LIVE_TRADING_CONFIRM", "no").lower() == "yes",
        private_key=_env("POLYMARKET_PRIVATE_KEY", ""),
        funder=_env("POLYMARKET_FUNDER", ""),
        signature_type=_int("POLYMARKET_SIGNATURE_TYPE", 1),
        max_slippage=_float("MAX_SLIPPAGE", 0.02),
        data_dir=Path(_env("DATA_DIR", "data")),
        log_dir=Path(_env("LOG_DIR", "logs")),
    )
    cfg.validate()
    return cfg
