"""Informe del día (departamento de Comunicación): un resumen escrito con los datos reales del momento.

No inventa nada: toma el estado de la oficina (el mismo que ve la web) y lo cuenta en frases cortas. Las
operaciones, aprobados, suspensos y relevos de hoy salen de la actividad del paper trading.
"""

from __future__ import annotations

import datetime as dt


def _d(x: float) -> str:
    return f"{x:+,.2f} $".replace(",", "_").replace(".", ",").replace("_", ".")


def _p(x: float) -> str:
    return f"{x:+.2f} %".replace(".", ",")


def _quien(id_: str, nombres: dict[str, str]) -> str:
    return f"{nombres[id_]} ({id_}" if id_ in nombres else f"{id_} ("


def generar(E: dict, nombres: dict[str, str] | None = None) -> dict:
    """{fecha, titular, puntos: [{tema, texto, tono}]} con lo más importante de hoy."""
    nombres = nombres or {}
    papel, fondo, hold = E.get("papel") or {}, E.get("fondo") or {}, (E.get("holding") or {}).get("resumen") or {}
    hoy = dt.datetime.now().astimezone().date().isoformat()
    actividad = [e for e in papel.get("actividad", []) if str(e.get("t", "")).startswith(hoy)]
    cuenta = {}
    for e in actividad:
        cuenta[e["tipo"]] = cuenta.get(e["tipo"], 0) + 1
    puntos = []

    def punto(tema: str, texto: str, tono: str = "") -> None:
        puntos.append({"tema": tema, "texto": texto, "tono": tono})

    if fondo:
        tono = "bueno" if fondo.get("hoy_pct", 0) > 0 else "malo" if fondo.get("hoy_pct", 0) < 0 else ""
        punto("Fondo", f"El valor liquidativo va {_p(fondo.get('hoy_pct', 0))} hoy ({_d(fondo.get('hoy', 0))}) y "
                       f"{_p(fondo.get('rentabilidad_pct', 0))} desde el inicio. Patrimonio: {_d(fondo.get('patrimonio', 0))[1:]}."
                       + (f" Caída desde el máximo: {_p(fondo['caida_pct'])}." if fondo.get("caida_pct") else ""), tono)
    for g, nombre in (("trading", "Trading"), ("scalping", "Scalping")):
        x = (papel.get("grupos") or {}).get(g) or {}
        if x.get("traders") or x.get("operaciones"):
            punto(nombre, f"{x.get('traders', 0)} traders en sus mesas, {x.get('operaciones_hoy', 0)} operaciones cerradas hoy y "
                          f"{_d(x.get('hoy', 0))} en el día ({_d(x.get('resultado', 0))} en total"
                          + (f", contando {_d(x['resultado_retiradas'])} de estrategias ya retiradas" if x.get("retiradas") else "")
                          + ").", "bueno" if x.get("hoy", 0) > 0 else "malo" if x.get("hoy", 0) < 0 else "")
    ts = list((papel.get("estrategias") or {}).items())
    if ts:
        mejor = max(ts, key=lambda kv: kv[1].get("hoy", 0))
        peor = min(ts, key=lambda kv: kv[1].get("hoy", 0))
        if mejor[1].get("hoy", 0) > 0:
            punto("Destacado", f"El mejor del día es {_quien(mejor[0], nombres)}{', ' if mejor[0] in nombres else ''}{mejor[1]['simbolo'].replace('USDT', '')}): "
                               f"{_d(mejor[1]['hoy'])}.", "bueno")
        if peor[1].get("hoy", 0) < 0:
            punto("A vigilar", f"El peor del día es {_quien(peor[0], nombres)}{', ' if peor[0] in nombres else ''}{peor[1]['simbolo'].replace('USDT', '')}): "
                               f"{_d(peor[1]['hoy'])}.", "malo")
    inc = papel.get("grupos_incubadora") or {}
    en_examen = sum(v.get("traders", 0) for v in inc.values())
    if en_examen or cuenta.get("aprueba") or cuenta.get("suspende"):
        punto("Incubadora", f"{en_examen} estrategias de examen con dinero de prueba (no cuenta en el fondo). Hoy: "
                            f"{cuenta.get('aprueba', 0)} aprobadas, {cuenta.get('suspende', 0)} suspendidas y "
                            f"{sum(1 for e in actividad if e['tipo'] == 'alta' and e.get('graduada'))} subidas a una mesa.")
    if cuenta.get("relevo"):
        punto("Supervisión", f"Hoy se han cambiado {cuenta['relevo']} estrategias que no eran rentables. Cada una tiene su post mortem en la academia.", "malo")
    if cuenta.get("veto") or cuenta.get("freno") or cuenta.get("kill"):
        partes = []
        if cuenta.get("veto"):
            partes.append(f"{cuenta['veto']} entradas vetadas por los límites de riesgo")
        if cuenta.get("freno"):
            partes.append("se ha activado el freno de riesgo")
        if cuenta.get("kill"):
            partes.append("se ha pulsado el kill switch")
        punto("Riesgos", "Hoy " + ", ".join(partes) + ".", "malo" if cuenta.get("freno") or cuenta.get("kill") else "")
    if hold:
        punto("Holding", f"Las carteras de largo plazo valen {_d(hold.get('valor', 0))[1:]} ({_p(hold.get('resultado_pct', 0))}).",
              "bueno" if hold.get("resultado", 0) > 0 else "malo" if hold.get("resultado", 0) < 0 else "")
    tend = (E.get("tendencia") or {}).get("resumen") or {}
    if tend:
        punto("Tendencia", f"La sala de tendencia vale {_d(tend.get('valor', 0))[1:]} ({_p(tend.get('resultado_pct', 0))}). Hay tendencia en "
                           f"{tend.get('dentro', 0)} de {tend.get('monedas', 0)} monedas y está invertido el {tend.get('invertido_pct', 0):.0f} %; "
                           "el resto espera en efectivo.", "bueno" if tend.get("resultado", 0) > 0 else "malo" if tend.get("resultado", 0) < 0 else "")
    lq = E.get("liquidez") or {}
    if lq.get("tipo_pct") is not None:
        tipo = f"{lq['tipo_pct']:.2f}".replace(".", ",")
        punto("Liquidez", f"{_d(lq.get('efectivo', 0))[1:]} fuera del mercado cobran un {tipo} % al año (unos "
                          f"{_d(lq.get('al_dia', 0))[1:]} al día). Llevan {_d(lq.get('acumulado', 0))[1:]} de intereses.", "bueno")
    lecc = (E.get("academia") or {}).get("textos") or []
    if lecc:
        punto("Academia", lecc[0])
    if not puntos:
        punto("Fondo", "Todavía no hay actividad que contar: pulsa «Buscar estrategias» para empezar.")
    hoy_pct = fondo.get("hoy_pct", 0) if fondo else 0
    titular = ("Día en verde para el fondo" if hoy_pct > 0.05 else "Día en rojo para el fondo" if hoy_pct < -0.05
               else "Día tranquilo en el fondo")
    if cuenta.get("kill") and (E.get("control") or {}).get("freno_manual"):
        titular = "Kill switch pulsado: el fondo, en pausa"
    elif cuenta.get("kill"):
        titular += ": hoy se ha pulsado el kill switch (ya reabierto)"
    elif cuenta.get("relevo"):
        titular += f": {cuenta['relevo']} {'relevo' if cuenta['relevo'] == 1 else 'relevos'} en las mesas"
    elif cuenta.get("aprueba"):
        titular += f": {cuenta['aprueba']} {'estrategia aprueba' if cuenta['aprueba'] == 1 else 'estrategias aprueban'} en la incubadora"
    return {"fecha": hoy, "hora": dt.datetime.now().astimezone().strftime("%H:%M"), "titular": titular, "puntos": puntos}
