"""Decisiones del jefe (tú): buscar estrategias, freno manual, pausar traders, límites de riesgo...

Se guardan en control.json y las leen la minería, el paper trading y la gestión de riesgo.
Cada decisión se valida aquí antes de aplicarse: solo se aceptan acciones de esta lista y
valores dentro de un rango razonable. Nada de esto toca dinero real.
"""

from __future__ import annotations

import datetime as dt

from . import almacen, banco
from .config import SIMBOLOS

# límites de riesgo que se pueden cambiar: nombre -> (texto, mínimo, máximo, unidad)
RIESGO_EDITABLE = {
    "riesgo_por_operacion": ("riesgo por operación", 0.1, 3.0, "%"),
    "max_posiciones": ("posiciones abiertas a la vez", 1, 24, ""),
    "max_misma_apuesta": ("posiciones iguales (mismo activo y dirección)", 1, 10, ""),
    "limite_perdida_diaria": ("freno por pérdida diaria", 0.5, 10.0, "%"),
    "max_caida": ("pausa por caída desde el máximo", 1.0, 30.0, "%"),
}

ACCIONES = {
    "buscar_estrategias": "Buscar estrategias nuevas ahora (una búsqueda en todos los activos con mesas libres, o en el que se diga)",
    "parar_busqueda": "Parar la búsqueda de estrategias en curso",
    "activar_freno": "Activar el freno manual (no se abren posiciones nuevas)",
    "quitar_freno": "Quitar el freno manual",
    "pausar_trader": "Pausar a un trader (no abrirá posiciones nuevas)",
    "reanudar_trader": "Reanudar a un trader",
    "retirar_estrategia": "Retirar una estrategia del banco (su trader deja la sala)",
    "cambiar_riesgo": "Cambiar un límite de riesgo",
    "nuevo_plan_holding": "Rehacer un plan de holding (presupuesto, caída para promediar, reserva y puntos de salida)",
    "convocar_comite": "Convocar el comité ahora",
}


def terminar_busqueda(pedido: dict) -> None:
    """La minería quita el pedido al acabar (si no lo ha cambiado nadie mientras tanto)."""
    c = cargar()
    if c["busqueda"] == pedido:
        c["busqueda"] = None
        almacen.guardar("control", c)


def cargar() -> dict:
    c = almacen.cargar("control", {})
    c.setdefault("mineria_pausada", False)  # solo para la minería continua de la terminal (minar --siempre)
    c.setdefault("busqueda", None)  # búsqueda de estrategias pedida con el botón: {"pedida", "simbolos"}
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
    if accion == "buscar_estrategias":
        simbolo = objetivo.upper()
        if simbolo and not simbolo.endswith("USDT"):
            simbolo += "USDT"
        if simbolo and simbolo not in SIMBOLOS:
            raise ValueError(f"Solo se buscan estrategias de {', '.join(x.replace('USDT', '') for x in SIMBOLOS)}.")
        if c["busqueda"]:
            raise ValueError("Ya hay una búsqueda en marcha. Espera a que termine o párala.")
        c["busqueda"] = {"pedida": dt.datetime.now().astimezone().isoformat(timespec="seconds"),
                         "simbolos": [simbolo] if simbolo else []}
        c["mineria_pausada"] = False
        hecho = f"Buscando estrategias nuevas de {simbolo.replace('USDT', '') if simbolo else 'todos los activos con mesas libres'}."
    elif accion == "parar_busqueda":
        if not c["busqueda"]:
            raise ValueError("No hay ninguna búsqueda en marcha.")
        c["busqueda"], hecho = None, "Búsqueda parada: la minería termina la generación en curso y se queda en espera."
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

        def rango(clave: str, texto: str, minimo: float, maximo: float) -> float | None:
            v = float(propuesta.get(clave) or 0)
            if v and not minimo <= v <= maximo:
                raise ValueError(f"{texto} tiene que estar entre {_num(minimo)} y {_num(maximo)} %.")
            return v or None

        paso = rango("paso", "La caída para volver a comprar", 2, 30)
        tramo = rango("tramo", "El tamaño de cada compra", 2, 50)
        reserva = rango("reserva", "La reserva de capital", 0, 200)
        salidas = sorted({float(x) for x in propuesta.get("salidas") or [] if float(x) > 0})
        if salidas and not (len(salidas) <= 4 and 5 <= salidas[0] and salidas[-1] <= 500):
            raise ValueError("Pon de 1 a 4 puntos de salida entre +5 % y +500 % sobre el coste medio.")
        plan = crear(simbolo, presupuesto, paso, tramo, reserva, salidas or None)
        hecho = (f"Nuevo plan de holding para {simbolo.replace('USDT', '')}: {_num(presupuesto)} $ ficticios, "
                 f"promedia cada −{_num(plan['paso_pct'])} %, reserva de {_num(plan['reserva'])} $ y salidas a "
                 + "/".join(f"+{_num(s['sobre_coste_pct'])}" for s in plan["salidas"]) + " % sobre el coste medio. Sin stop.")
    else:  # convocar_comite: lo hace la oficina al recibir la decisión
        hecho = "Comité convocado."
    c["decisiones"] = ([{"t": dt.datetime.now().astimezone().isoformat(timespec="seconds"), "accion": accion,
                         "texto": hecho}] + c["decisiones"])[:30]
    almacen.guardar("control", c)
    return hecho
