"""Gestión de riesgo del paper trading: cuánto se invierte en cada operación y cuándo se veta.

- Tamaño: cada operación arriesga como máximo RIESGO_POR_OPERACION del capital de su trader si
  salta el stop. Con un stop lejano se invierte menos; nunca más del 100 % (sin apalancamiento).
- Límites de la sala: máximo de posiciones abiertas, máximo de posiciones iguales (mismo símbolo
  y misma dirección), freno por pérdida diaria y pausa por caída desde el máximo. La pausa por caída dura
  PAUSA_CAIDA_HORAS; después se vuelve a operar y la caída se mide desde el resultado de ese momento (antes la
  pausa no se levantaba nunca si el resultado total quedaba por debajo del límite: sin entradas no podía recuperarse).
- Tus decisiones (control.py): puedes cambiar esos límites, activar un freno manual o pausar traders.
"""

from __future__ import annotations

import pandas as pd

from . import control
from .config import (LIMITE_PERDIDA_DIARIA, MAX_CAIDA, MAX_MISMA_APUESTA, MAX_POSICIONES,
                     MAX_POSICIONES_SCALPING, PAUSA_CAIDA_HORAS, RIESGO_POR_OPERACION)


def limites() -> dict:
    """Límites vigentes: los de config.py, salvo los que hayas cambiado tú (control.json)."""
    c = control.cargar()
    r = c["riesgo"]
    return {
        "riesgo_por_operacion": r.get("riesgo_por_operacion", RIESGO_POR_OPERACION * 100) / 100,
        "max_posiciones": int(r.get("max_posiciones", MAX_POSICIONES)),
        "max_posiciones_scalping": int(r.get("max_posiciones_scalping", MAX_POSICIONES_SCALPING)),
        "max_misma_apuesta": int(r.get("max_misma_apuesta", MAX_MISMA_APUESTA)),
        "limite_perdida_diaria": r.get("limite_perdida_diaria", LIMITE_PERDIDA_DIARIA * 100) / 100,
        "max_caida": r.get("max_caida", MAX_CAIDA * 100) / 100,
        "freno_manual": c["freno_manual"],
        "pausados": set(c["traders_pausados"]),
    }


def reglas(lim: dict) -> list[dict]:
    return [
        {"nombre": "Riesgo por operación", "valor": f"{lim['riesgo_por_operacion'] * 100:g} %".replace(".", ","),
         "explica": "Si salta el stop, el trader pierde como mucho este porcentaje de su capital."},
        {"nombre": "Posiciones abiertas", "valor": f"máx. {lim['max_posiciones']}",
         "explica": "Límite de posiciones abiertas a la vez en la sala de trading."},
        {"nombre": "Posiciones de scalping", "valor": f"máx. {lim['max_posiciones_scalping']}",
         "explica": "Límite de posiciones abiertas a la vez en la sala de scalping."},
        {"nombre": "Misma apuesta", "valor": f"máx. {lim['max_misma_apuesta']}",
         "explica": "Posiciones en el mismo símbolo y la misma dirección (en cada sala): más sería apostar lo mismo varias veces."},
        {"nombre": "Freno diario", "valor": f"−{lim['limite_perdida_diaria'] * 100:g} %".replace(".", ","),
         "explica": "Si el día va perdiendo este porcentaje del capital, no se abren más posiciones hasta mañana."},
        {"nombre": "Caída máxima", "valor": f"−{lim['max_caida'] * 100:g} %".replace(".", ","),
         "explica": f"Si el resultado cae este porcentaje del capital desde su máximo, se pausan las entradas {PAUSA_CAIDA_HORAS} horas. "
                    "Después se vuelve a operar y la caída se cuenta desde ese momento."},
    ]


def fraccion(stop_atr: float, atr: float, precio: float, riesgo: float | None = None) -> float:
    """Parte del capital del trader que se invierte en una operación."""
    riesgo = limites()["riesgo_por_operacion"] if riesgo is None else riesgo
    distancia = stop_atr * atr / precio
    return float(min(1.0, riesgo / distancia)) if distancia > 0 else 0.0


def _caida(resumen: dict | None, curva: list | None, referencia: dict | None = None) -> float:
    """Caída del resultado desde su máximo, en parte del capital. El máximo es el de la curva (los últimos 30 días)
    y como poco el punto de partida: 0 al empezar o, tras una pausa por caída, el resultado al reanudar."""
    if not resumen or not resumen.get("inicial") or not curva:
        return 0.0
    base, desde = (float(referencia["valor"]), pd.Timestamp(referencia["t"])) if referencia else (0.0, None)
    valores = [v for t, v in curva if desde is None or pd.Timestamp(t) >= desde] or [curva[-1][1]]
    return max(0.0, (max(base, max(valores)) - curva[-1][1]) / resumen["inicial"])


def _hora(t: str) -> str:
    """«05/10 a las 14:30», en tu hora."""
    return pd.Timestamp(t).to_pydatetime().astimezone().strftime("%d/%m a las %H:%M")


def vigilar_caida(pausa: dict, resumen: dict | None, curva: list | None, ahora: pd.Timestamp | None = None) -> str | None:
    """Pausa por caída: empieza si la caída llega al límite y termina a las PAUSA_CAIDA_HORAS; al terminar, la caída se
    vuelve a medir desde el resultado de ese momento. Modifica `pausa` y devuelve «pausa», «reanuda» o None."""
    ahora = ahora or pd.Timestamp.now(tz="UTC")
    if pausa.get("hasta"):
        if ahora < pd.Timestamp(pausa["hasta"]):
            return None
        valor = float(curva[-1][1]) if curva else 0.0
        pausa.clear()
        pausa["referencia"] = {"t": ahora.isoformat(), "valor": valor}
        return "reanuda"
    caida = _caida(resumen, curva, pausa.get("referencia"))
    if caida >= limites()["max_caida"]:
        pausa.update(desde=ahora.isoformat(), hasta=(ahora + pd.Timedelta(hours=PAUSA_CAIDA_HORAS)).isoformat(),
                     caida_pct=round(caida * 100, 2))
        return "pausa"
    return None


def bloqueo_general(resumen: dict | None, curva: list | None, pausa: dict | None = None,
                    ahora: pd.Timestamp | None = None) -> str | None:
    """Motivo por el que ahora mismo no se puede abrir ninguna posición (o None)."""
    lim = limites()
    pausa = pausa or {}
    if lim["freno_manual"]:
        return "freno manual activado por el jefe"
    if resumen and resumen.get("inicial"):
        perdida_hoy = -resumen["hoy"] / resumen["inicial"]
        if perdida_hoy >= lim["limite_perdida_diaria"]:
            return f"freno diario: hoy se pierde un {perdida_hoy * 100:.1f} % del capital".replace(".", ",")
    if pausa.get("hasta") and (ahora or pd.Timestamp.now(tz="UTC")) < pd.Timestamp(pausa["hasta"]):
        return (f"pausa por caída hasta el {_hora(pausa['hasta'])}: el resultado bajó un {pausa.get('caida_pct', 0):.1f} % "
                "del capital desde su máximo").replace(".", ",")
    caida = _caida(resumen, curva, pausa.get("referencia"))
    if caida >= lim["max_caida"]:
        return f"pausa por caída: el resultado ha bajado un {caida * 100:.1f} % del capital desde su máximo".replace(".", ",")
    return None


def evaluar_entrada(id_: str, simbolo: str, direccion: str, abiertas: list[tuple[str, str]],
                    bloqueo: str | None, scalping: bool = False, lim: dict | None = None) -> str | None:
    """Devuelve el motivo del veto, o None si la entrada se permite. `abiertas` son las posiciones de su
    misma sala que estaban abiertas en el momento de la entrada."""
    lim = lim or limites()
    if id_ in lim["pausados"]:
        return "este trader está pausado por el jefe"
    if bloqueo:
        return bloqueo
    maximo = lim["max_posiciones_scalping" if scalping else "max_posiciones"]
    if len(abiertas) >= maximo:
        return f"ya hay {len(abiertas)} posiciones abiertas en {'scalping' if scalping else 'la sala'} (máximo {maximo})"
    iguales = sum(1 for s, d in abiertas if s == simbolo and d == direccion)
    if iguales >= lim["max_misma_apuesta"]:
        lado = "largas" if direccion == "largo" else "cortas"
        return f"ya hay {iguales} posiciones {lado} en {simbolo} (máximo {lim['max_misma_apuesta']})"
    return None


def _apuestas(abiertas: list[tuple[str, str]]) -> dict[str, int]:
    apuestas: dict[str, int] = {}
    for s, d in abiertas:
        clave = f"{s} {'largo' if d == 'largo' else 'corto'}"
        apuestas[clave] = apuestas.get(clave, 0) + 1
    return apuestas


def estado(resumen: dict | None, curva: list | None, abiertas: list[tuple[str, str]], bloqueo: str | None,
           vetos: list[dict], abiertas_scalping: list[tuple[str, str]] | None = None, pausa: dict | None = None) -> dict:
    """Resumen para la sala de control de riesgos (las posiciones de trading y de scalping, por separado)."""
    lim = limites()
    inicial = (resumen or {}).get("inicial") or 0
    apuestas = _apuestas(abiertas)
    apuestas_scalping = _apuestas(abiertas_scalping or [])
    return {
        "reglas": reglas(lim),
        "bloqueo": bloqueo,
        "freno_manual": lim["freno_manual"],
        "pausados": sorted(lim["pausados"]),
        "posiciones": len(abiertas),
        "max_posiciones": lim["max_posiciones"],
        "max_posiciones_scalping": lim["max_posiciones_scalping"],
        "posiciones_scalping": len(abiertas_scalping or []),
        "mayor_apuesta_scalping": max(apuestas_scalping.values(), default=0),
        "apuestas_scalping": apuestas_scalping,
        "max_misma_apuesta": lim["max_misma_apuesta"],
        "mayor_apuesta": max(apuestas.values(), default=0),
        "apuestas": apuestas,
        "perdida_hoy_pct": round(max(0.0, -(resumen or {}).get("hoy", 0) / inicial * 100), 3) if inicial else 0.0,
        "limite_diario_pct": lim["limite_perdida_diaria"] * 100,
        "caida_pct": round(_caida(resumen, curva, (pausa or {}).get("referencia")) * 100, 3),
        "pausa_caida_hasta": (pausa or {}).get("hasta"),
        "max_caida_pct": lim["max_caida"] * 100,
        "riesgo_por_operacion_pct": lim["riesgo_por_operacion"] * 100,
        "vetos": vetos[:20],
    }
