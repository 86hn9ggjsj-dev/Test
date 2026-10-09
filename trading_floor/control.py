"""Decisiones del jefe (tú): buscar estrategias, pausar todo, reabrir, kill switch, pausar traders, límites de riesgo...

Se guardan en control.json y las leen la minería, el paper trading y la gestión de riesgo.
Cada decisión se valida aquí antes de aplicarse: solo se aceptan acciones de esta lista y
valores dentro de un rango razonable. Nada de esto toca dinero real.
"""

from __future__ import annotations

import datetime as dt
import threading

from . import almacen, banco
from .config import REPARTO_RENTABLE, SCALPING_SIMBOLOS, SIMBOLOS

# límites de riesgo que se pueden cambiar: nombre -> (texto, mínimo, máximo, unidad)
RIESGO_EDITABLE = {
    "riesgo_por_operacion": ("riesgo por operación", 0.1, 3.0, "%"),
    "max_posiciones": ("posiciones abiertas a la vez en la sala de trading", 1, 48, ""),
    "max_posiciones_scalping": ("posiciones abiertas a la vez en scalping", 1, 12, ""),
    "max_misma_apuesta": ("posiciones iguales (mismo activo y dirección)", 1, 10, ""),
    "limite_perdida_diaria": ("freno por pérdida diaria", 0.5, 10.0, "%"),
    "max_caida": ("pausa por caída desde el máximo", 1.0, 30.0, "%"),
}

ACCIONES = {
    "buscar_estrategias": "Buscar estrategias nuevas ahora: un ciclo de búsqueda en todos los activos con mesas libres o en el que se diga; con tipo «scalping», para la sala de scalping (velas de 5 minutos)",
    "limpiar_repetidas": "Retirar las estrategias repetidas del banco (misma idea con otros números): se queda la mejor de cada grupo",
    "parar_busqueda": "Parar la búsqueda de estrategias en curso",
    "activar_freno": "Pausar todo: activar el freno manual (no se abren posiciones nuevas; las abiertas siguen con su stop)",
    "quitar_freno": "Reabrir: quitar el freno manual",
    "kill_switch": "Kill switch: cerrar ya todas las posiciones abiertas del fondo al último precio y activar el freno manual",
    "pausar_trader": "Pausar a un trader (no abrirá posiciones nuevas)",
    "reanudar_trader": "Reanudar a un trader",
    "retirar_estrategia": "Retirar una estrategia del banco (de su mesa o de la incubadora): su mesa pasa a la mejor aprobada de la incubadora y lo que ganó o perdió con dinero del fondo sigue contando",
    "cambiar_riesgo": "Cambiar un límite de riesgo",
    "nuevo_plan_holding": "Rehacer un plan de holding (presupuesto, caída para promediar, reserva y puntos de salida)",
    "convocar_comite": "Convocar el comité ahora",
    "asignar": "Cambiar el reparto del fondo: «objetivo» es el área (trading, scalping, holding o tendencia) y «valor» el % del fondo que se le dedica; lo que queda es liquidez. Con «objetivo» «rentable» aplica el reparto rentable entero (trading 5, scalping 0, holding 25, tendencia 40)",
    "aportar": "Aportar dinero (ficticio) a tu fondo: «valor» es el importe en dólares",
    "retirar": "Retirar dinero (ficticio) de tu fondo: «valor» es el importe; como mucho la liquidez disponible",
}


_cerrojo = threading.RLock()  # la oficina y la minería escriben aquí desde hilos distintos


def terminar_busqueda(pedido: dict) -> None:
    """La minería quita el pedido al acabar (si no lo ha cambiado nadie mientras tanto)."""
    with _cerrojo:
        c = cargar()
        if c["busqueda"] == pedido:
            c["busqueda"] = None
            almacen.guardar("control", c)


def pedir_busqueda(tipo: str = "trading", simbolos: list[str] | None = None, por: str = "jefe") -> bool:
    """Deja pedida una búsqueda de estrategias (un solo ciclo). No hace nada si ya hay una en marcha."""
    with _cerrojo:
        c = cargar()
        if c["busqueda"]:
            return False
        c["busqueda"] = {"pedida": dt.datetime.now().astimezone().isoformat(timespec="seconds"),
                         "simbolos": list(simbolos or []), "tipo": "scalping" if tipo == "scalping" else "trading", "por": por}
        c["mineria_pausada"] = False
        almacen.guardar("control", c)
        return True


def cargar() -> dict:
    c = almacen.cargar("control", {})
    c.setdefault("mineria_pausada", False)  # solo para la minería continua de la terminal (minar --siempre)
    c.setdefault("busqueda", None)  # búsqueda de estrategias pedida con el botón: {"pedida", "simbolos"}
    c.setdefault("freno_manual", False)
    c.setdefault("kill_switch", None)   # cuándo se pulsó por última vez el kill switch
    c.setdefault("traders_pausados", [])
    c.setdefault("riesgo", {})
    c.setdefault("decisiones", [])
    return c


def _repartir(nuevo: dict) -> str:
    """Aplica un reparto en % (trading, scalping, holding, tendencia): capital por mesa desde ahora y presupuesto del
    holding y de la sala de tendencia."""
    from . import fondo, holding, tendencia

    patrimonio = fondo.calcular(completo=False)["resumen"]["patrimonio"]
    info = fondo.asignar(nuevo, patrimonio)
    holding.ajustar_total(info["holding"])
    tendencia.ajustar_total(info["tendencia"])
    aviso = ""
    if info["liquidez"] < info["holding_pct"] * 0.5:
        aviso = " Ojo: la reserva del holding (hasta un 50 % más) sale de la liquidez, y queda poca."
    return (f"Nuevo reparto del fondo: trading {_num(info['trading'])} % ({_dinero(info['trader'])} $ por trader), "
            f"scalping {_num(info['scalping'])} % ({_dinero(info['scalper'])} $ por scalper), holding {_num(info['holding_pct'])} % "
            f"({_dinero(info['holding'])} $ de presupuesto), tendencia {_num(info['tendencia_pct'])} % "
            f"({_dinero(info['tendencia'])} $) y liquidez {_num(info['liquidez'])} %. Se aplica desde ahora; "
            f"lo ganado hasta hoy se conserva.{aviso}")


def _dinero(x: float, decimales: int = 2) -> str:
    return f"{x:,.{decimales}f}".replace(",", "_").replace(".", ",").replace("_", ".")


def _num(x: float) -> str:
    return f"{x:g}".replace(".", ",")


def aplicar(propuesta: dict) -> str:
    """Ejecuta una decisión ya aprobada. Devuelve un texto con lo que se ha hecho."""
    with _cerrojo:
        return _aplicar(propuesta)


def _aplicar(propuesta: dict) -> str:
    accion = propuesta.get("accion")
    objetivo = str(propuesta.get("objetivo") or "").strip()
    valor = propuesta.get("valor")
    if accion not in ACCIONES:
        raise ValueError(f"Acción desconocida: {accion}")
    c = cargar()
    if accion == "buscar_estrategias":
        scalping = str(propuesta.get("tipo") or "").lower() == "scalping"
        validos = SCALPING_SIMBOLOS if scalping else SIMBOLOS
        simbolo = objetivo.upper()
        if simbolo and not simbolo.endswith("USDT"):
            simbolo += "USDT"
        if simbolo and simbolo not in validos:
            raise ValueError(f"Solo se buscan estrategias {'de scalping ' if scalping else ''}de "
                             f"{', '.join(x.replace('USDT', '') for x in validos)}.")
        if not pedir_busqueda("scalping" if scalping else "trading", [simbolo] if simbolo else []):
            raise ValueError("Ya hay una búsqueda en marcha. Espera a que termine o párala.")
        c = cargar()
        hecho = (f"Buscando estrategias {'de scalping ' if scalping else ''}nuevas de "
                 f"{simbolo.replace('USDT', '') if simbolo else 'todos los activos con sitio en el banco'}.")
    elif accion == "limpiar_repetidas":
        grupos = banco.repetidas()
        if not grupos:
            raise ValueError("No hay estrategias repetidas en el banco.")
        sobran = [b for _, resto in grupos for b in resto]
        for queda, resto in grupos:
            for b in resto:
                banco.descartar(b["id"], f"repetida: la misma idea que {queda['id']}, que lo hizo mejor fuera de muestra")
        ids = {b["id"] for b in sobran}
        c["traders_pausados"] = [i for i in c["traders_pausados"] if i not in ids]
        hecho = (f"Retiradas {len(sobran)} estrategias repetidas ({', '.join(sorted(ids))}); de cada idea se queda "
                 "la que mejor lo hizo fuera de muestra.")
    elif accion == "parar_busqueda":
        if not c["busqueda"]:
            raise ValueError("No hay ninguna búsqueda en marcha.")
        c["busqueda"], hecho = None, "Búsqueda parada: la minería termina la generación en curso y se queda en espera."
    elif accion == "activar_freno":
        c["freno_manual"], hecho = True, "Freno manual activado: no se abren posiciones nuevas."
    elif accion == "quitar_freno":
        c["freno_manual"], hecho = False, ("Reabierto: se quita el freno manual (y la pausa por caída, si la había) y se "
                                           "vuelven a permitir entradas.")
        c["reabierto"] = dt.datetime.now().astimezone().isoformat(timespec="seconds")
    elif accion == "kill_switch":
        c["freno_manual"] = True
        c["kill_switch"] = dt.datetime.now().astimezone().isoformat(timespec="seconds")
        hecho = ("Kill switch pulsado: en el próximo ciclo se cierran todas las posiciones abiertas del fondo al último precio "
                 "y no se abre nada nuevo hasta que pulses «Reabrir». La incubadora sigue (no usa dinero del fondo).")
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
            banco.descartar(objetivo, "retirada por decisión del jefe")
            c["traders_pausados"] = [i for i in c["traders_pausados"] if i != objetivo]
            hecho = (f"{objetivo} retirada del banco, con su post mortem. Lo que ganó o perdió con dinero del fondo sigue "
                     "contando; si tenía mesa, pasa a la mejor aprobada de la incubadora (si hay).")
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
    elif accion == "asignar":
        from . import fondo

        nuevo = {a: v for a, v in fondo.reparto().items() if a in fondo.AREAS}
        cambios_ = dict(propuesta.get("reparto") or {})
        if objetivo.lower().strip() == "rentable":   # el reparto rentable de config.py
            cambios_ = dict(REPARTO_RENTABLE)
        elif objetivo:
            area = objetivo.lower().strip()
            if area not in fondo.AREAS:
                raise ValueError("El área tiene que ser trading, scalping, holding o tendencia.")
            cambios_[area] = valor
        if not cambios_:
            raise ValueError("Dime qué % quieres dedicar a cada área.")
        for area, pct in cambios_.items():
            if area in fondo.AREAS:
                nuevo[area] = float(pct)
        hecho = _repartir(nuevo)
    elif accion in ("aportar", "retirar"):
        from . import fondo

        importe = float(valor or 0)
        liquidez = fondo.calcular()["reparto"]["liquidez"] if accion == "retirar" else 0.0
        fondo.mover("aportacion" if accion == "aportar" else "reembolso", importe, liquidez)
        m = fondo.calcular(completo=False)["resumen"]
        _repartir({a: v for a, v in fondo.reparto().items() if a in fondo.AREAS})   # se mantiene tu reparto en %
        hecho = (f"{'Has metido' if accion == 'aportar' else 'Has sacado'} {_dinero(importe)} $ ficticios. Ahora el fondo "
                 f"tiene {_dinero(m['patrimonio'])} $; lo que habías ganado no cambia. Cada área se ha reajustado "
                 "para mantener tu reparto.")
    else:  # convocar_comite: lo hace la oficina al recibir la decisión
        hecho = "Comité convocado."
    c["decisiones"] = ([{"t": dt.datetime.now().astimezone().isoformat(timespec="seconds"), "accion": accion,
                         "texto": hecho}] + c["decisiones"])[:30]
    almacen.guardar("control", c)
    return hecho
