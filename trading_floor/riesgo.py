"""Gestión de riesgo del paper trading: cuánto se invierte en cada operación y cuándo se veta.

- Tamaño: cada operación arriesga como máximo RIESGO_POR_OPERACION del capital de su trader si
  salta el stop. Con un stop lejano se invierte menos; nunca más del 100 % (sin apalancamiento).
- Límites de la sala: máximo de posiciones abiertas, máximo de posiciones iguales (mismo símbolo
  y misma dirección), freno por pérdida diaria y pausa por caída desde el máximo.
- Tus decisiones (control.py): puedes cambiar esos límites, activar un freno manual o pausar traders.
"""

from __future__ import annotations

from . import control
from .config import (LIMITE_PERDIDA_DIARIA, MAX_CAIDA, MAX_MISMA_APUESTA, MAX_POSICIONES,
                     RIESGO_POR_OPERACION)


def limites() -> dict:
    """Límites vigentes: los de config.py, salvo los que hayas cambiado tú (control.json)."""
    c = control.cargar()
    r = c["riesgo"]
    return {
        "riesgo_por_operacion": r.get("riesgo_por_operacion", RIESGO_POR_OPERACION * 100) / 100,
        "max_posiciones": int(r.get("max_posiciones", MAX_POSICIONES)),
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
         "explica": "Límite de posiciones abiertas a la vez en toda la sala."},
        {"nombre": "Misma apuesta", "valor": f"máx. {lim['max_misma_apuesta']}",
         "explica": "Posiciones en el mismo símbolo y la misma dirección: más sería apostar lo mismo varias veces."},
        {"nombre": "Freno diario", "valor": f"−{lim['limite_perdida_diaria'] * 100:g} %".replace(".", ","),
         "explica": "Si el día va perdiendo este porcentaje del capital, no se abren más posiciones hasta mañana."},
        {"nombre": "Caída máxima", "valor": f"−{lim['max_caida'] * 100:g} %".replace(".", ","),
         "explica": "Si el resultado cae este porcentaje del capital desde su máximo, se pausan las entradas."},
    ]


def fraccion(stop_atr: float, atr: float, precio: float, riesgo: float | None = None) -> float:
    """Parte del capital del trader que se invierte en una operación."""
    riesgo = limites()["riesgo_por_operacion"] if riesgo is None else riesgo
    distancia = stop_atr * atr / precio
    return float(min(1.0, riesgo / distancia)) if distancia > 0 else 0.0


def _caida(resumen: dict | None, curva: list | None) -> float:
    if not resumen or not resumen.get("inicial") or not curva:
        return 0.0
    valores = [v for _, v in curva]
    return max(0.0, (max(0.0, max(valores)) - valores[-1]) / resumen["inicial"])


def bloqueo_general(resumen: dict | None, curva: list | None) -> str | None:
    """Motivo por el que ahora mismo no se puede abrir ninguna posición (o None)."""
    lim = limites()
    if lim["freno_manual"]:
        return "freno manual activado por el jefe"
    if resumen and resumen.get("inicial"):
        perdida_hoy = -resumen["hoy"] / resumen["inicial"]
        if perdida_hoy >= lim["limite_perdida_diaria"]:
            return f"freno diario: hoy se pierde un {perdida_hoy * 100:.1f} % del capital".replace(".", ",")
    caida = _caida(resumen, curva)
    if caida >= lim["max_caida"]:
        return f"pausa por caída: el resultado ha bajado un {caida * 100:.1f} % del capital desde su máximo".replace(".", ",")
    return None


def evaluar_entrada(id_: str, simbolo: str, direccion: str, abiertas: list[tuple[str, str]],
                    bloqueo: str | None) -> str | None:
    """Devuelve el motivo del veto, o None si la entrada se permite."""
    lim = limites()
    if id_ in lim["pausados"]:
        return "este trader está pausado por el jefe"
    if bloqueo:
        return bloqueo
    if len(abiertas) >= lim["max_posiciones"]:
        return f"ya hay {len(abiertas)} posiciones abiertas (máximo {lim['max_posiciones']})"
    iguales = sum(1 for s, d in abiertas if s == simbolo and d == direccion)
    if iguales >= lim["max_misma_apuesta"]:
        lado = "largas" if direccion == "largo" else "cortas"
        return f"ya hay {iguales} posiciones {lado} en {simbolo} (máximo {lim['max_misma_apuesta']})"
    return None


def estado(resumen: dict | None, curva: list | None, abiertas: list[tuple[str, str]], bloqueo: str | None,
           vetos: list[dict]) -> dict:
    """Resumen para la sala de control de riesgos."""
    lim = limites()
    inicial = (resumen or {}).get("inicial") or 0
    apuestas: dict[str, int] = {}
    for s, d in abiertas:
        clave = f"{s} {'largo' if d == 'largo' else 'corto'}"
        apuestas[clave] = apuestas.get(clave, 0) + 1
    return {
        "reglas": reglas(lim),
        "bloqueo": bloqueo,
        "freno_manual": lim["freno_manual"],
        "pausados": sorted(lim["pausados"]),
        "posiciones": len(abiertas),
        "max_posiciones": lim["max_posiciones"],
        "max_misma_apuesta": lim["max_misma_apuesta"],
        "mayor_apuesta": max(apuestas.values(), default=0),
        "apuestas": apuestas,
        "perdida_hoy_pct": round(max(0.0, -(resumen or {}).get("hoy", 0) / inicial * 100), 3) if inicial else 0.0,
        "limite_diario_pct": lim["limite_perdida_diaria"] * 100,
        "caida_pct": round(_caida(resumen, curva) * 100, 3),
        "max_caida_pct": lim["max_caida"] * 100,
        "riesgo_por_operacion_pct": lim["riesgo_por_operacion"] * 100,
        "vetos": vetos[:20],
    }
