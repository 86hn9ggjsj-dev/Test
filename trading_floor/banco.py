"""Banco de estrategias: las que han superado todo el embudo de pruebas.

Cada estrategia nueva pasa primero por la incubadora (dinero de prueba, papel.py) y, si aprueba su examen, la opera un
trader en una mesa con dinero del fondo. Cuando una estrategia sale del banco (suspende el examen, el supervisor la
retira por no ser rentable o la retiras tú) pasa a la lista de descartadas con su post mortem: lo que ganó o perdió
con dinero del fondo sigue contando y la minería no vuelve a buscar esa misma idea.
"""

from __future__ import annotations

import datetime as dt
import threading

from . import almacen

# Se activa al entrar una estrategia nueva: el paper trading le asigna trader al momento, sin esperar
# a su siguiente revisión (cuando la minería y la sala van en el mismo programa).
nueva = threading.Event()
_cerrojo = threading.Lock()  # la minería añade y la oficina retira: que no se pisen al guardar


def cargar() -> list[dict]:
    return almacen.cargar("banco", [])


def anadir(entrada: dict) -> None:
    with _cerrojo:
        items = [b for b in cargar() if b["id"] != entrada["id"]]
        almacen.guardar("banco", items + [entrada])
    nueva.set()


def descartadas() -> list[dict]:
    return almacen.cargar("descartadas", [])


def descartar(id_: str, motivo: str, por: str = "jefe", post_mortem: dict | None = None) -> dict | None:
    """Saca una estrategia del banco y la guarda como descartada (con cuándo, por qué, quién y, si lo hay, su post
    mortem). `por` es «jefe», «supervisor» o «incubadora». Devuelve la entrada."""
    with _cerrojo:
        items = cargar()
        fuera = [b for b in items if b["id"].upper() == id_.upper()]
        if not fuera:
            return None
        almacen.guardar("banco", [b for b in items if b["id"].upper() != id_.upper()])
        entrada = {**fuera[0], "retirada": dt.datetime.now().astimezone().isoformat(timespec="seconds"),
                   "motivo": motivo, "por": por, **({"post_mortem": post_mortem} if post_mortem else {})}
        almacen.guardar("descartadas", [d for d in descartadas() if d["id"] != entrada["id"]] + [entrada])
    return entrada


def anotar(id_: str, **campos) -> None:
    """Añade datos (por ejemplo el post mortem) a una estrategia ya descartada."""
    with _cerrojo:
        lista = descartadas()
        for d in lista:
            if d["id"] == id_:
                d.update(campos)
        almacen.guardar("descartadas", lista)


def borrar(id_: str, motivo: str = "retirada por decisión del jefe") -> bool:
    return descartar(id_, motivo) is not None


def calidad(b: dict) -> float:
    """Cuánto valía en datos no vistos: rentabilidad / caída fuera de muestra (mejor cuanto más alta)."""
    fuera = b.get("fuera") or {}
    return float(fuera.get("ret_dd") or fuera.get("retorno_pct") or 0.0)


def repetidas(items: list[dict] | None = None) -> list[tuple[dict, list[dict]]]:
    """Grupos de estrategias con la misma idea: (la que se queda, las que sobran). Se queda la mejor fuera de muestra."""
    from .estrategia import Estrategia

    grupos: dict[str, list[dict]] = {}
    for b in cargar() if items is None else items:
        grupos.setdefault(Estrategia.de_dict(b["estrategia"]).idea(), []).append(b)
    salida = []
    for lista in grupos.values():
        if len(lista) > 1:
            lista = sorted(lista, key=calidad, reverse=True)
            salida.append((lista[0], lista[1:]))
    return salida


def ocupacion(simbolo: str, intervalo: str) -> int:
    """Estrategias del banco de ese activo y tipo de vela (cada una ocupa una mesa)."""
    return sum(b["estrategia"]["simbolo"] == simbolo.upper() and b["estrategia"]["intervalo"] == intervalo for b in cargar())
