"""Decisiones del jefe (tú): pausar la minería, freno manual, pausar traders, límites de riesgo...

Se guardan en control.json y las leen la minería, el paper trading y la gestión de riesgo.
Cada decisión se valida aquí antes de aplicarse: solo se aceptan acciones de esta lista y
valores dentro de un rango razonable. Nada de esto toca dinero real.
"""

from __future__ import annotations

import datetime as dt

from . import almacen, banco

# límites de riesgo que se pueden cambiar: nombre -> (texto, mínimo, máximo, unidad)
RIESGO_EDITABLE = {
    "riesgo_por_operacion": ("riesgo por operación", 0.1, 3.0, "%"),
    "max_posiciones": ("posiciones abiertas a la vez", 1, 24, ""),
    "max_misma_apuesta": ("posiciones iguales (mismo activo y dirección)", 1, 10, ""),
    "limite_perdida_diaria": ("freno por pérdida diaria", 0.5, 10.0, "%"),
    "max_caida": ("pausa por caída desde el máximo", 1.0, 30.0, "%"),
}

ACCIONES = {
    "pausar_mineria": "Pausar la minería",
    "reanudar_mineria": "Reanudar la minería",
    "activar_freno": "Activar el freno manual (no se abren posiciones nuevas)",
    "quitar_freno": "Quitar el freno manual",
    "pausar_trader": "Pausar a un trader (no abrirá posiciones nuevas)",
    "reanudar_trader": "Reanudar a un trader",
    "retirar_estrategia": "Retirar una estrategia del banco (su trader deja la sala)",
    "cambiar_riesgo": "Cambiar un límite de riesgo",
    "nuevo_plan_holding": "Rehacer un plan de holding con zonas nuevas",
    "convocar_comite": "Convocar el comité ahora",
}


def cargar() -> dict:
    c = almacen.cargar("control", {})
    c.setdefault("mineria_pausada", False)
    c.setdefault("freno_manual", False)
    c.setdefault("traders_pausados", [])
    c.setdefault("riesgo", {})
    c.setdefault("decisiones", [])
    return c


def _num(x: float) -> str:
    return f"{x:g}".replace(".", ",")


def aplicar(propuesta: dict) -> str:
    """Ejecuta una decisión ya aprobada. Devuelve un texto con lo que se ha hecho."""
    accion = propuesta.get("accion")
    objetivo = str(propuesta.get("objetivo") or "").strip()
    valor = propuesta.get("valor")
    if accion not in ACCIONES:
        raise ValueError(f"Acción desconocida: {accion}")
    c = cargar()
    if accion == "pausar_mineria":
        c["mineria_pausada"], hecho = True, "Minería pausada."
    elif accion == "reanudar_mineria":
        c["mineria_pausada"], hecho = False, "Minería reanudada."
    elif accion == "activar_freno":
        c["freno_manual"], hecho = True, "Freno manual activado: no se abren posiciones nuevas."
    elif accion == "quitar_freno":
        c["freno_manual"], hecho = False, "Freno manual quitado."
    elif accion in ("pausar_trader", "reanudar_trader", "retirar_estrategia"):
        ids = {b["id"] for b in banco.cargar()}
        objetivo = objetivo.upper()
        if objetivo not in ids:
            raise ValueError(f"No hay ninguna estrategia {objetivo} en el banco.")
        if accion == "pausar_trader":
            c["traders_pausados"] = sorted(set(c["traders_pausados"]) | {objetivo})
            hecho = f"{objetivo} pausado: no abrirá posiciones nuevas."
        elif accion == "reanudar_trader":
            c["traders_pausados"] = [i for i in c["traders_pausados"] if i != objetivo]
            hecho = f"{objetivo} vuelve a operar."
        else:
            banco.borrar(objetivo)
            c["traders_pausados"] = [i for i in c["traders_pausados"] if i != objetivo]
            hecho = f"{objetivo} retirada del banco: su trader deja la sala."
    elif accion == "cambiar_riesgo":
        if objetivo not in RIESGO_EDITABLE:
            raise ValueError(f"Ese límite no se puede cambiar: {objetivo}")
        texto, minimo, maximo, unidad = RIESGO_EDITABLE[objetivo]
        v = float(valor)
        if not minimo <= v <= maximo:
            raise ValueError(f"El valor de «{texto}» tiene que estar entre {_num(minimo)} y {_num(maximo)}{unidad}.")
        if not unidad:
            v = int(round(v))
        c["riesgo"][objetivo] = v
        hecho = f"Nuevo límite: {texto} = {_num(v)}{' ' + unidad if unidad else ''}. Vale para las entradas nuevas."
    elif accion == "nuevo_plan_holding":
        from .holding import crear

        simbolo = objetivo.upper()
        if not simbolo.endswith("USDT"):
            simbolo += "USDT"
        presupuesto = float(valor or 0)
        if not 100 <= presupuesto <= 100_000:
            raise ValueError("El presupuesto del plan tiene que estar entre 100 y 100.000 $ ficticios.")
        compras = [float(x) for x in propuesta.get("compras") or [] if float(x) > 0]
        ventas = [float(x) for x in propuesta.get("ventas") or [] if float(x) > 0]
        stop = float(propuesta["stop"]) if propuesta.get("stop") else None
        crear(simbolo, presupuesto, compras or None, ventas or None, stop)
        hecho = f"Nuevo plan de holding para {simbolo.replace('USDT', '')} con {_num(presupuesto)} $ ficticios."
    else:  # convocar_comite: lo hace la oficina al recibir la decisión
        hecho = "Comité convocado."
    c["decisiones"] = ([{"t": dt.datetime.now().astimezone().isoformat(timespec="seconds"), "accion": accion,
                         "texto": hecho}] + c["decisiones"])[:30]
    almacen.guardar("control", c)
    return hecho
