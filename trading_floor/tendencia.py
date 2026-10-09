"""Sala de tendencia: seguir la tendencia de cada moneda con velas diarias (dinero ficticio).

Reglas fijas y clásicas. No salen de la minería, así que no se han ajustado a estos datos:
- El presupuesto se reparte a partes iguales entre las monedas.
- Cada moneda tiene dos mitades:
  · «Media»: está dentro mientras el cierre del día esté por encima de su media de 50 días.
  · «Ruptura»: entra cuando el cierre supera el máximo de los 20 días anteriores y sale cuando baja del mínimo de los
    10 días anteriores (la regla de «las tortugas», simplificada).
  Así cada moneda está invertida al 0 %, al 50 % o al 100 % de su parte. Solo compras: sin cortos ni apalancamiento.
- Se decide con el cierre de cada día (00:00 UTC) y se opera a la apertura del día siguiente, pagando comisión y
  deslizamiento. Lo que no está invertido espera en efectivo.
- Ajustes de capital: cuando cambias el reparto del fondo (o aportas o retiras), la cartera recibe o devuelve dinero
  desde ese momento y cada moneda se reajusta a su nivel de inversión.

Por qué esta sala: con 5 años de velas reales (2021-2026) de las 6 monedas, seguir la tendencia ganó más que comprar y
mantener, con caídas mucho menores, y con cualquier variante razonable de las reglas (media de 50, 100 o 200 días;
rupturas de 20/10, 30/15 o 55/20). La sala de trading, en cambio, apenas tiene ventaja una vez pagadas las comisiones.
No hay garantías: el pasado no asegura el futuro y todo es dinero ficticio.

Se simula con las velas reales de Binance de 1 hora (los días se cierran a las 00:00 UTC) desde que se crea la cartera.
"""

from __future__ import annotations

import datetime as dt
import threading

import numpy as np
import pandas as pd

from . import almacen
from .config import COMISION, DESLIZAMIENTO, SIMBOLOS
from .datos import velas
from .mercado import Mercado

MEDIA_DIAS = 50
RUPTURA_ENTRA = 20   # entra al superar el máximo de los 20 días anteriores...
RUPTURA_SALE = 10    # ...y sale al bajar del mínimo de los 10 días anteriores
HISTORIA_PREVIA = 120   # días de velas antes de crear la cartera, para que las señales ya estén formadas
COSTE = COMISION + DESLIZAMIENTO   # por lado
_cerrojo = threading.RLock()


def _ahora() -> str:
    return dt.datetime.now().astimezone().isoformat(timespec="seconds")


def _precio(x: float) -> str:
    return f"{x:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")


def _moneda(simbolo: str) -> str:
    return simbolo.replace("USDT", "")


def nueva_cartera(presupuesto: float, monedas: list[str] | None = None) -> dict:
    return {"creado": pd.Timestamp.now(tz="UTC").isoformat(), "presupuesto": float(presupuesto),
            "monedas": list(monedas or SIMBOLOS), "ajustes": []}


def _dias_cerrados(m: Mercado, origen: pd.Timestamp | None = None) -> pd.DataFrame:
    """Cierres diarios (00:00 UTC) de los días ya terminados, con las señales de cada mitad y el peso que toca. Con
    `origen`, los cálculos empiezan siempre ese día: así lo ya decidido no cambia al pasar el tiempo."""
    c = pd.Series(m.c, index=m.tiempo).resample("1D").last().dropna()
    if origen is not None:
        c = c[c.index >= origen]
    if len(c) and m.tiempo[-1] < c.index[-1] + pd.Timedelta(hours=23):
        c = c.iloc[:-1]   # el día en curso todavía no ha cerrado
    media = c.rolling(MEDIA_DIAS).mean()
    maximo = c.rolling(RUPTURA_ENTRA).max().shift(1)
    minimo = c.rolling(RUPTURA_SALE).min().shift(1)
    en_media = (c > media).astype(float)
    ruptura, dentro = np.zeros(len(c)), 0.0
    for i in range(len(c)):
        if not dentro and c.iloc[i] > maximo.iloc[i]:
            dentro = 1.0
        elif dentro and c.iloc[i] < minimo.iloc[i]:
            dentro = 0.0
        ruptura[i] = dentro
    d = pd.DataFrame({"cierre": c, "media": media, "maximo": maximo, "minimo": minimo, "en_media": en_media,
                      "en_ruptura": ruptura})
    d["peso"] = (d["en_media"] + d["en_ruptura"]) / 2
    d.loc[media.isna(), "peso"] = np.nan   # sin historia suficiente no se decide nada
    d.index = d.index + pd.Timedelta(days=1)   # se aplica desde la apertura del día siguiente
    return d


def _motivo(antes: dict | None, ahora: dict) -> str:
    """Por qué cambia el peso: qué mitad entra o sale."""
    partes = []
    a_media, a_rup = (antes or {}).get("en_media", 0.0), (antes or {}).get("en_ruptura", 0.0)
    if ahora["en_media"] != a_media:
        partes.append(f"el precio {'sube por encima' if ahora['en_media'] else 'cae por debajo'} de su media de {MEDIA_DIAS} días")
    if ahora["en_ruptura"] != a_rup:
        partes.append(f"rompe el máximo de {RUPTURA_ENTRA} días" if ahora["en_ruptura"]
                      else f"pierde el mínimo de {RUPTURA_SALE} días")
    return " y ".join(partes) or "reajuste"


def simular_moneda(simbolo: str, presupuesto: float, creado: pd.Timestamp, ajustes: list[dict], m: Mercado) -> dict:
    """Una moneda de la cartera, hora a hora desde la creación."""
    dias = _dias_cerrados(m, (creado - pd.Timedelta(days=HISTORIA_PREVIA)).floor("D"))
    efectivo, unidades, aportado = float(presupuesto), 0.0, float(presupuesto)
    operaciones: list[dict] = []
    serie: list[list] = []
    peso, senal = 0.0, None

    def reajustar(objetivo: float, precio: float, t: str, motivo: str, tipo: str | None = None) -> None:
        nonlocal efectivo, unidades
        valor = efectivo + unidades * precio
        quiero = max(0.0, objetivo * valor)
        tengo = unidades * precio
        if quiero > tengo + 1:
            importe = min(quiero - tengo, efectivo)
            if importe > 1:
                unidades += importe * (1 - COSTE) / precio
                efectivo -= importe
                operaciones.append({"t": t, "tipo": tipo or "compra", "precio": float(precio), "importe": round(importe, 2),
                                    "peso": objetivo, "motivo": motivo})
        elif tengo > quiero + 1 or efectivo < 0:
            u = min(unidades, max((tengo - quiero) / precio, -efectivo / (precio * (1 - COSTE)) if efectivo < 0 else 0.0))
            if u > 0:
                ingreso = u * precio * (1 - COSTE)
                unidades -= u
                efectivo += ingreso
                operaciones.append({"t": t, "tipo": tipo or "venta", "precio": float(precio), "importe": round(ingreso, 2),
                                    "peso": objetivo, "motivo": motivo})

    vigentes = dias[dias.index <= creado].dropna(subset=["peso"])
    if len(vigentes):
        senal = vigentes.iloc[-1].to_dict()
        peso = float(senal["peso"])
    inicio = int(np.searchsorted(m.tiempo, creado, side="right"))
    precio0 = float(m.c[inicio - 1]) if inicio > 0 else float(m.o[0])
    if peso > 0:
        reajustar(peso, precio0, creado.isoformat(), "entrada inicial: " + (
            "las dos mitades están dentro" if peso == 1 else "una de las dos mitades está dentro"))
    aplicables = dias[dias.index > creado]
    j = 0
    ajustes = sorted(ajustes or [], key=lambda a: a["t"])
    pendiente = 0
    for k in range(inicio, len(m)):
        t = m.tiempo[k]
        while pendiente < len(ajustes) and pd.Timestamp(ajustes[pendiente]["t"]) <= t:
            importe = float(ajustes[pendiente]["importe"])
            efectivo += importe
            aportado += importe
            reajustar(peso, float(m.o[k]), ajustes[pendiente]["t"], "nuevo reparto del fondo", "ajuste")
            pendiente += 1
        while j < len(aplicables) and aplicables.index[j] <= t:
            fila = aplicables.iloc[j].to_dict()
            j += 1
            if np.isnan(fila["peso"]):
                continue
            if fila["peso"] != peso:
                reajustar(float(fila["peso"]), float(m.o[k]), t.isoformat(), _motivo(senal, fila))
            peso, senal = float(fila["peso"]), fila
        if (k - inicio) % 4 == 0 or k == len(m) - 1:
            serie.append([(t + pd.Timedelta(hours=1)).isoformat(), round(float(efectivo + unidades * m.c[k] - aportado), 2)])
    for aj in ajustes[pendiente:]:   # ajustes de ahora mismo (dentro de la hora en curso): al último precio
        efectivo += float(aj["importe"])
        aportado += float(aj["importe"])
        reajustar(peso, float(m.c[-1]), aj["t"], "nuevo reparto del fondo", "ajuste")
    precio = float(m.c[-1])
    valor = efectivo + unidades * precio
    ultimo = dias.iloc[-1] if len(dias) else None
    return {
        "simbolo": simbolo, "precio": precio, "peso": peso, "unidades": unidades, "efectivo": round(efectivo, 2),
        "invertido": round(unidades * precio, 2), "valor": round(valor, 2), "aportado": round(aportado, 2),
        "resultado": round(valor - aportado, 2), "resultado_pct": round((valor / aportado - 1) * 100, 3) if aportado > 0 else 0.0,
        "en_media": bool(senal and senal["en_media"]), "en_ruptura": bool(senal and senal["en_ruptura"]),
        "media": round(float(ultimo["media"]), 6) if ultimo is not None and not np.isnan(ultimo["media"]) else None,
        "maximo": round(float(ultimo["maximo"]), 6) if ultimo is not None and not np.isnan(ultimo["maximo"]) else None,
        "minimo": round(float(ultimo["minimo"]), 6) if ultimo is not None and not np.isnan(ultimo["minimo"]) else None,
        "cierre": round(float(ultimo["cierre"]), 6) if ultimo is not None else None,
        "proxima_decision": (dias.index[-1] + pd.Timedelta(days=1)).isoformat() if len(dias) else None,
        "precios": [float(x) for x in pd.Series(m.c, index=m.tiempo).resample("1D").last().dropna().iloc[-90:]],
        "medias": [None if np.isnan(x) else round(float(x), 6) for x in dias["media"].iloc[-90:]] if len(dias) else [],
        "operaciones": operaciones,
        "serie": serie,
    }


def _serie_total(monedas) -> pd.Series:
    series = [pd.Series([v for _, v in p["serie"]], index=pd.to_datetime([t for t, _ in p["serie"]], utc=True))
              for p in monedas if p.get("serie")]
    if not series:
        return pd.Series(dtype=float)
    return pd.concat(series, axis=1).sort_index().ffill().fillna(0).sum(axis=1)


def _texto(moneda: str, op: dict) -> str:
    nivel = {0.0: "nada", 0.5: "la mitad", 1.0: "todo"}.get(op["peso"], f"{op['peso']:.0%}")
    if op["tipo"] == "ajuste":
        return f"{moneda}: entra o sale dinero por el nuevo reparto del fondo; sigue invertido {nivel} de su parte."
    verbo = "Compro" if op["tipo"] == "compra" else "Vendo"
    return (f"{moneda}: {op['motivo']}. {verbo} {_precio(op['importe'])} $ a {_precio(op['precio'])}: ahora tengo invertido "
            f"{nivel} de su parte.")


def ciclo(estado: dict) -> list[dict]:
    """Actualiza la sala de tendencia. Sin cartera (presupuesto 0 en tu reparto) no hace nada."""
    cartera = estado.get("cartera")
    eventos: list[dict] = []
    if not cartera:
        estado.update(monedas={}, serie=estado.get("serie") or [], resumen=None, actualizado=_ahora())
        return eventos
    creado = pd.Timestamp(cartera["creado"])
    n = len(cartera["monedas"])
    dias_hist = (pd.Timestamp.now(tz="UTC") - creado).days + HISTORIA_PREVIA + 3
    anteriores = estado.get("monedas") or {}
    monedas = {}
    for simbolo in cartera["monedas"]:
        m = Mercado(velas(simbolo, "1h", dias_hist), simbolo, "1h")
        ajustes = [{"t": a["t"], "importe": float(a["importe"]) / n} for a in cartera.get("ajustes", [])]
        nuevo = simular_moneda(simbolo, cartera["presupuesto"] / n, creado, ajustes, m)
        previas = len((anteriores.get(simbolo) or {}).get("operaciones", []))
        if simbolo in anteriores:
            for op in nuevo["operaciones"][previas:]:
                eventos.append({"t": _ahora(), "tipo": op["tipo"], "simbolo": simbolo, "texto": _texto(_moneda(simbolo), op)})
        monedas[simbolo] = nuevo
    if not anteriores:
        dentro = [_moneda(s) for s, p in monedas.items() if p["peso"] > 0]
        eventos.append({"t": _ahora(), "tipo": "plan", "simbolo": "", "texto": (
            f"Sala de tendencia en marcha con {_precio(cartera['presupuesto'])} $ ficticios repartidos entre "
            f"{', '.join(_moneda(s) for s in cartera['monedas'])}. Ahora hay tendencia en "
            f"{', '.join(dentro) if dentro else 'ninguna'}: compro solo ahí; el resto espera en efectivo.")})
    total = _serie_total(monedas.values())
    medianoche = pd.Timestamp(dt.datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0))
    antes = total[total.index <= medianoche] if len(total) else total
    aportado = sum(p["aportado"] for p in monedas.values())
    valor = sum(p["valor"] for p in monedas.values())
    invertido = sum(p["invertido"] for p in monedas.values())
    estado["monedas"] = monedas
    estado["serie"] = [[t.isoformat(), round(float(v), 2)] for t, v in total.items()]
    estado["resumen"] = {
        "presupuesto": round(cartera["presupuesto"] + sum(float(a["importe"]) for a in cartera.get("ajustes", [])), 2),
        "aportado": round(aportado, 2), "valor": round(valor, 2), "resultado": round(valor - aportado, 2),
        "resultado_pct": round((valor / aportado - 1) * 100, 3) if aportado > 0 else 0.0,
        "hoy": round(float(total.iloc[-1] - antes.iloc[-1]), 2) if len(antes) else 0.0,
        "invertido": round(invertido, 2), "invertido_pct": round(invertido / valor * 100, 1) if valor > 0 else 0.0,
        "dentro": sum(p["peso"] > 0 for p in monedas.values()), "monedas": len(monedas)}
    estado["actividad"] = (eventos[::-1] + estado.get("actividad", []))[:40]
    estado["actualizado"] = _ahora()
    return eventos


def actualizar() -> list[dict]:
    """Una vuelta de la sala. El cálculo (que la primera vez descarga velas) va sin cerrojo para no hacer esperar a un
    cambio de reparto; si la cartera ha cambiado mientras tanto, no se guarda y se recalcula en la siguiente vuelta."""
    estado = almacen.cargar("tendencia", {})
    eventos = ciclo(estado)
    with _cerrojo:
        if almacen.cargar("tendencia", {}).get("cartera") != estado.get("cartera"):
            return []
        almacen.guardar("tendencia", estado)
    return eventos


PARTE_INICIAL = 25.0   # % del fondo que pasa de la sala de trading a la de tendencia al estrenarla


def estrenar() -> str | None:
    """Se hace una sola vez, al arrancar la primera versión con sala de tendencia: si tu reparto no le dedica nada, pasa
    a ella la mitad del % de la sala de trading (como mucho PARTE_INICIAL puntos). La sala de trading, medida con datos
    que la minería no había visto, apenas tiene ventaja tras las comisiones y deja parada buena parte de su dinero en
    mesas vacías. Después decides tú: el reparto se cambia en «Mi fondo» o por el chat."""
    from . import control, fondo

    if almacen.cargar("fondo", {}).get("tendencia_estrenada"):
        return None
    r = fondo.reparto()
    texto = None
    if r.get("tendencia", 0) <= 0 and r.get("trading", 0) > 0:
        nuevo = {a: r[a] for a in fondo.AREAS}
        pasa = round(min(PARTE_INICIAL, nuevo["trading"] / 2), 2)
        nuevo["trading"] = round(nuevo["trading"] - pasa, 2)
        nuevo["tendencia"] = pasa
        texto = control.aplicar({"accion": "asignar", "reparto": nuevo})
        with _cerrojo:
            estado = almacen.cargar("tendencia", {})
            num = lambda x: f"{x:g}".replace(".", ",")  # noqa: E731
            aviso = (f"¡Estrenamos la sala de tendencia! Pasa a ella un {num(pasa)} % del fondo que tenía la sala de trading "
                     f"(que se queda con un {num(nuevo['trading'])} %). Al medir con datos que la minería no había visto, las "
                     "estrategias de 30 minutos apenas ganan una vez pagadas las comisiones, y seguir la tendencia en velas "
                     "diarias ganó más que comprar y mantener, con caídas mucho menores. Si prefieres otro reparto, cámbialo "
                     "en «Mi fondo».")
            estado["actividad"] = [{"t": _ahora(), "tipo": "estreno", "simbolo": "", "texto": aviso}] + estado.get("actividad", [])
            almacen.guardar("tendencia", estado)
    with fondo._cerrojo:
        f = almacen.cargar("fondo", {})
        f["tendencia_estrenada"] = _ahora()
        almacen.guardar("fondo", f)
    return texto


def ajustar_total(objetivo: float) -> float:
    """Lleva el presupuesto de la sala a `objetivo` $ (lo pide el reparto del fondo). Devuelve el cambio. Solo lo
    apunta: el bucle del paper trading lo aplica en su siguiente vuelta (así tu decisión no espera a las descargas)."""
    with _cerrojo:
        estado = almacen.cargar("tendencia", {})
        cartera = estado.get("cartera")
        if not cartera:
            if objetivo < 1:
                return 0.0
            estado["cartera"] = nueva_cartera(objetivo)
            almacen.guardar("tendencia", estado)
            return float(objetivo)
        actual = cartera["presupuesto"] + sum(float(a["importe"]) for a in cartera.get("ajustes", []))
        diferencia = objetivo - actual
        if abs(diferencia) < 1:
            return 0.0
        cartera.setdefault("ajustes", []).append({"t": pd.Timestamp.now(tz="UTC").isoformat(), "importe": round(diferencia, 2)})
        almacen.guardar("tendencia", estado)
    return float(diferencia)
