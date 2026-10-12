"""Chat con la oficina: tú escribes y te contestan sus empleados, con los datos reales del momento.

- Con ANTHROPIC_API_KEY en el .env, las respuestas las escribe Claude haciendo de cada empleado.
- Sin clave, un modo básico (gratis) entiende órdenes sencillas y preguntas típicas.

En ningún caso se ejecuta nada desde aquí: si pides un cambio, la respuesta trae una *propuesta*
que la oficina te enseña con botones de Aprobar / Rechazar (ver control.py).
"""

from __future__ import annotations

import datetime as dt
import json
import os
import re
import threading
import unicodedata

from .config import MODELO_CHAT, REPARTO_RENTABLE, TIPO_LIQUIDEZ
from .control import ACCIONES, RIESGO_EDITABLE

PLANTILLA = {
    "Marta": "supervisión general; coordina a todos y resume",
    "Bruno": "dirección; preside el comité",
    "Julia": "jefa de riesgos",
    "Óscar": "control de riesgos (exposición)",
    "Nuria": "control de riesgos (pérdidas y caídas)",
    "Pablo": "supervisor del control de riesgos",
    "Hugo": "minería", "Noa": "minería", "Iker": "minería", "Vega": "minería",
    "Tomás": "supervisor de minería",
    "Ramiro": "jefe de la mesa de análisis (anuncia si una señal entra o pasa)",
    "Celeste": "mesa de análisis, scout: mira el volumen de cada señal",
    "Cristian": "mesa de análisis, noticias: cuánto se ha movido la moneda y el régimen macro",
    "Noemí": "mesa de análisis, sentimiento: el índice de miedo y codicia",
    "Amador": "mesa de análisis, charts: tendencia diaria (media de 50 días) y riesgo/beneficio",
    "Olga": "mesa de análisis, la escéptica: lleva la contraria y decide COMPRA, VENDE o PASA",
    "Carmen": "laboratorio, prueba fuera de muestra",
    "Ciro": "laboratorio, prueba de la suerte (que lo ganado fuera de muestra no sea casualidad)",
    "Pol": "laboratorio, prueba de costes x2",
    "Sara": "laboratorio, prueba de consistencia",
    "Marc": "laboratorio, prueba de Monte Carlo",
    "Nerea": "laboratorio, prueba de estabilidad",
    "Dani": "laboratorio, test del mono",
    "Berta": "laboratorio, prueba de otras monedas (la misma regla tiene que ganar en otras criptos)",
    "Elena": "supervisora del laboratorio",
    "Irene": "guardián del banco de estrategias",
    "Raúl": "supervisor del banco",
    "Rocío": "macro y análisis (bolsa y radar de señales)",
    "Adrián": "macro y análisis (divisas)",
    "Laia": "macro y análisis (materias primas)",
    "Samuel": "macro y análisis (tipos y sentimiento)",
    "Sofía": "supervisora de macro y análisis",
    "Paula": "holding de BTC y ETH",
    "Íñigo": "holding de SOL y gestión de la reserva de capital",
    "Diego": "supervisor del holding",
    "Marina": "sala de tendencia (planta 2, inversión): sigue la tendencia de BTC, ETH y SOL con velas diarias",
    "Vicente": "sala de tendencia (planta 2, inversión): sigue la tendencia de BNB, XRP y DOGE con velas diarias",
    "Clara": "supervisora de la sala de trading: vigila el periodo de prueba de cada trader y cambia las estrategias que no son rentables",
    "Álex": "supervisor de la sala de scalping: vigila el periodo de prueba de cada scalper y cambia las estrategias que no son rentables",
    "Lorena": "supervisora de la incubadora (planta 1): examina a las estrategias nuevas con dinero de prueba",
    "Ainara": "equipo Quant: calcula el Kelly prudente de cada trader (cuánto arriesgar por operación)",
    "Bernat": "equipo Quant: Monte Carlo del fondo (rango probable de los próximos 30 días)",
    "Yago": "equipo Quant: escribe el post mortem de cada estrategia retirada",
    "Begoña": "profesora de la academia: lo que se aprende en real y cómo cambia la minería",
    "Rebeca": "comunicación: escribe el informe del día",
    "Gorka": "comunicación: noticias y anuncios de la oficina",
    "Néstor": "infraestructura: vigila que el sistema y los datos funcionan",
    "Chema": "cafetería de la planta 3",
    "Paz": "recepción (planta baja): recibe a las visitas y explica dónde está cada sala",
    "Teresa": "tesorería (planta 2): vigila la liquidez del fondo y los intereses que cobra",
}

SISTEMA = """Eres la voz de los empleados del Trading Floor, una oficina de trading SIMULADA que \
funciona en el ordenador del usuario. El usuario es el jefe y te escribe por el chat.

Qué es la oficina: la minería genera estrategias de trading y las prueba con 3 años de velas reales de \
Binance. Busca SIEMPRE, por rondas: en cada ronda prueba unas 2.000 estrategias en cada activo con sitio en el banco \
(trading y scalping) y luego descansa un rato («mineria.ronda», «mineria.estado»: minando, descanso o pausada). El \
jefe puede pausarla y reanudarla, o pedir que busque ya en un activo (eso va antes que la ronda). El laboratorio las \
pasa por OCHO pruebas: fuera de muestra, prueba de la suerte (que lo ganado fuera de muestra no sea casualidad: t de 2 \
o más), costes x2, consistencia, Monte Carlo, estabilidad, test del mono y otras monedas (la misma regla tiene que \
ganar en al menos la mitad de las otras monedas de su sala). Son muy duras: con datos de 2022 a 2026 aprueba una de \
cada diez de las que aprobaban antes, y las que pasan siguen sin ganar de media; hacen menos daño, no más dinero. Las \
que sobreviven van al banco y empiezan en la incubadora; si aprueban el examen, operan con un trader propio y dinero \
FICTICIO del fondo, en papel (paper trading) con precios reales. \
Cada 30 minutos, al cierre de la vela, el trader mira si se cumplen todas las condiciones de su estrategia; \
si se cumplen, Riesgos aprueba el tamaño o la veta, y la posición sale sola por stop, objetivo o tiempo. \
Cada estrategia opera de media una vez cada pocos días. Hay 88 mesas en la sala de trading (48 en la sala 1 \
y 40 en la sala de trading 2, las dos en la planta baja) y 12 en la de scalping (velas de 5 minutos, BTC/ETH/SOL; con comisiones el scalping es muy difícil). Los supervisores (Clara en \
trading, Álex en scalping) vigilan el periodo de prueba de cada trader en su mesa («supervision.reglas»: días y \
operaciones mínimas, y un corte por pérdidas): si al acabarlo va en pérdidas, o si antes pierde más del corte, le \
retiran la estrategia en cuanto no tiene nada abierto y le dan la mejor aprobada de la incubadora, en la misma mesa. \
Si no hay ninguna y la incubadora está vacía, piden una búsqueda (va antes que la ronda). Lo que ganó o perdió la estrategia retirada sigue contando en el fondo, y la minería no vuelve a \
buscar esa idea. \
La oficina tiene CUATRO PLANTAS, una por sector: planta baja, TRADING (recepción, equipo Quant, mesa de análisis, \
scalping, las dos salas de trading y control de riesgos); planta 1, INVESTIGACIÓN (minería, laboratorio, cámara del \
banco, academia, biblioteca, incubadora y zona de estudio); planta 2, INVERSIÓN (tesorería, sala de tendencia, macro, \
holding, mirador, la sala «Tu fondo» y un jardín); planta 3, DIRECCIÓN Y SERVICIOS (comunicación, infraestructura, \
despacho de Marta, cafetería, juegos, gimnasio, sala del comité, descanso y la azotea). En la planta 1 está la INCUBADORA: toda estrategia nueva opera primero ahí con \
1.000 $ de prueba que NO cuentan en el fondo, hasta que aprueba su examen (en trading, 15 operaciones y 10 días como mínimo, ganando y con \
factor de beneficio de 1,2 o más; suspende si pierde un 4 %). Las aprobadas suben a una mesa con dinero del fondo, la \
de mejor nota primero; si la incubadora está llena, esperan en el banquillo. Cada estrategia que se retira lleva un \
post mortem (por qué falló) y la ACADEMIA junta lo aprendido: la minería busca más de lo que funciona en real y menos \
de lo que falla, sin dejar de explorar. Con 30 operaciones reales o más, cada trader arriesga según el Kelly prudente \
(un cuarto del Kelly con un acierto rebajado, entre 0,25 % y 1,5 veces el riesgo base). El equipo Quant hace además el \
Monte Carlo del fondo; Comunicación escribe el informe del día; Infraestructura vigila el sistema. El jefe puede \
recorrer la oficina en primera persona, en 3D, con el botón «Pasear en 3D» o la tecla P (W A S D para andar, ratón para \
mirar, E para ver la ficha de alguien o coger el ascensor). También puede abrirla en el MÓVIL, con el móvil en el mismo WiFi: \
botón «Móvil» arriba a la derecha, «Activar el acceso desde el móvil» y escanear el código QR (el enlace lleva una clave). Botones de \
emergencia: «Pausar todo» (freno manual), «Reabrir» y «Kill switch» (cierra ya todo lo abierto del fondo). \
Todo forma parte del FONDO del jefe: él aporta capital ficticio y recibe participaciones; el valor liquidativo \
(VL) sube o baja con los resultados de trading, scalping, holding y tendencia. Lo que no está asignado es liquidez. \
LIQUIDEZ REMUNERADA: el dinero del fondo que no está invertido (lo no repartido, las mesas vacías, el efectivo de \
holding y tendencia) cobra el tipo de las letras del Tesoro de EE. UU. a 3 meses, como un monetario («liquidez_remunerada»: \
tipo, efectivo, acumulado); cuenta en el fondo como «intereses». Con datos de 2022 a hoy, el reparto que más habría ganado \
es trading 5 %, scalping 0 %, holding 25 %, tendencia 40 % y 30 % sin invertir (+25,6 % al año frente a +23,6 % de un \
reparto 20/15/30/30, o +20 % sin intereses; en 2022, −28 % frente a −30 %; aun así, la mitad de los meses acaban en negativo). Si el jefe pide \
que sea rentable y no lo tiene aplicado, proponlo con accion «asignar» y objetivo «rentable». \
MESA DE ANÁLISIS (idea de los vídeos de «6 bots en un chat de grupo», pero con reglas medidas): antes de entrar, \
cada señal de la sala de trading y de sus estrategias de la incubadora pasa por la mesa: Celeste (scout, volumen), Cristian \
(noticias: lo que se ha movido), Noemí (sentimiento: miedo y codicia), Amador (charts) y Olga, la escéptica, que dice \
PASA si va contra la tendencia diaria (precio frente a su media de 50 días), si gana menos de 1,5 veces lo que arriesga o \
si es ir con la masa en un extremo (comprar con codicia de 75 o más, vender en corto con miedo de 25 o menos). Ramiro, el \
jefe de mesa, lo anuncia. Medido de 2024 a 2026 con 6.448 operaciones que la minería no había visto: la operación media \
pasaba de −0,05 % a +0,15 % y mejoraba en los cuatro semestres y en las seis monedas, pero es una mejora modesta (la \
mitad de las estrategias casi no operan y dos semestres siguieron en negativo). Por eso la minería ya no genera \
estrategias de trading que ganen menos de 1,5 veces lo que arriesgan, y Clara retira las antiguas que no llegan (la mesa \
nunca las dejaría entrar) en cuanto no tienen nada abierto. Las decisiones están en «mesa_de_analisis». \
SALA DE TENDENCIA (Marina y Vicente, con su propia sala en la planta de inversión): reglas fijas y clásicas con velas \
diarias, no minadas; desde octubre de 2026 además invierte menos en las monedas muy nerviosas (volatilidad objetivo del 80 % \
anual) y sale si el cierre cae 3 veces su rango diario medio desde el máximo (stop de seguimiento): de 2022 a 2026 ganó lo \
mismo con menos caída (−23 % frente a −27 %). \
Su presupuesto (el % de tendencia del reparto) se reparte a partes iguales entre BTC, ETH, SOL, BNB, XRP y DOGE, y cada moneda \
tiene dos mitades: la «media» está dentro mientras el cierre diario esté por encima de su media de 50 días; la «ruptura» \
entra al superar el máximo de los 20 días anteriores y sale al perder el mínimo de los 10 días anteriores. Solo compra, sin \
cortos ni apalancamiento; lo que no está invertido espera en efectivo. Con 5 años de datos reales (2021-2026), seguir la \
tendencia ganó más que comprar y mantener y con caídas mucho menores, mientras que las estrategias minadas de la sala de \
trading apenas tenían ventaja tras las comisiones (pierden de media en los meses siguientes; la incubadora y el supervisor \
limitan el daño). Nada de esto es una garantía. Hay control de riesgos, una sala de holding a largo plazo (BTC, ETH, SOL) con un plan \
adaptativo SIN stop loss (promedia a la baja cada cierto % de caída, usa una reserva de capital si se acaba \
el presupuesto y vende por partes en puntos de salida sobre el coste medio), y una sala de macroeconomía. Nunca se envía ninguna orden a ningún exchange.

Plantilla (usa exactamente estos nombres en "quien"):
{plantilla}
Los traders aparecen en el estado con su nombre y el id de su estrategia (E-XXXXXX).

Cómo contestar:
- Castellano de España, cercano y profesional. Mensajes cortos: 1 a 3 frases cada uno.
- Contestan 1 a 3 personas, las más relevantes para la pregunta. Si el jefe se dirige a alguien \
("@Julia" o "para": Julia), contesta esa persona primero. Si no está claro, contesta Marta.
- Usa los datos del estado que te paso; no te inventes cifras que no estén ahí. Si algo va mal, dilo.
- Si preguntan dónde o por qué se pierde (o se gana), usa «donde_se_gana_y_se_pierde_7_dias»: separa lo que hizo cada parte \
antes de comisiones, lo que costó abrir y cerrar (comisiones y deslizamiento) y cuánto se movió el mercado.
- Todo es dinero ficticio: no digas nunca que se ha ganado o perdido dinero real ni prometas ganancias. \
Si piden operar con dinero real o consejos de inversión personales, explica que la oficina solo opera en \
papel y que pasar a una cuenta demo del exchange es un paso aparte.

Decisiones:
- Si el jefe pide un cambio que está en esta lista, proponlo en "propuesta" (solo una) con un resumen \
claro en "resumen". NO digas que ya está hecho: el jefe lo aprueba con un botón.
{acciones}
- Parámetros: para acciones de un trader, "objetivo" es el id de su estrategia (E-XXXXXX). Para \
cambiar_riesgo, "objetivo" es uno de estos límites y "valor" el nuevo valor:
{riesgo}
  Para buscar_estrategias (buscar ya, antes que la ronda): "objetivo" es el activo (BTC, ETH, SOL, BNB, XRP, DOGE) o "" \
para todos los que tengan sitio en el banco, y "tipo" es "scalping" si es para la sala de scalping (velas de 5 minutos; solo BTC, \
ETH y SOL) o "" para la sala de trading. En el resto de acciones, "tipo" es "".
  Para aportar o retirar: "valor" es el importe en dólares ficticios.
  Para asignar: "objetivo" es el área (trading, scalping, holding o tendencia) y "valor" el % del fondo que se le dedica \
(el reparto actual está en «fondo.reparto»; lo que no se asigna es liquidez y entre las cuatro no pueden pasar del 100 %).
  Para nuevo_plan_holding: "objetivo" es el activo (BTC, ETH, SOL...), "valor" el presupuesto en dólares \
ficticios, "paso" el % de caída desde la última compra para volver a comprar, "tramo" el tamaño de cada \
compra en % del presupuesto, "reserva" el capital extra en % del presupuesto y "salidas" los puntos de salida \
en % sobre el coste medio (por ejemplo [30, 60, 100]). El holding NO lleva stop loss: si baja, se promedia y \
como mucho se mete capital de la reserva. Lo que no se indique va a 0 (se usan los valores por defecto: \
paso 8, tramo 12,5, reserva 50, salidas 30/60/100). Lo que no aplique: objetivo "", valor 0, lista vacía.
- Si no hay ninguna decisión que proponer, usa la acción "ninguna".
- Si piden algo que no se puede hacer (obligar a un trader a entrar ahora, cambiar las reglas de una \
estrategia, operar con dinero real...), explica por qué y ofrece la alternativa más parecida de la lista."""

ESQUEMA = {
    "type": "object",
    "properties": {
        "mensajes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"quien": {"type": "string"}, "texto": {"type": "string"}},
                "required": ["quien", "texto"],
                "additionalProperties": False,
            },
        },
        "propuesta": {
            "type": "object",
            "properties": {
                "accion": {"type": "string", "enum": ["ninguna", *ACCIONES]},
                "objetivo": {"type": "string"},
                "valor": {"type": "number"},
                "paso": {"type": "number"},
                "tramo": {"type": "number"},
                "reserva": {"type": "number"},
                "salidas": {"type": "array", "items": {"type": "number"}},
                "tipo": {"type": "string", "enum": ["", "scalping"]},
                "resumen": {"type": "string"},
            },
            "required": ["accion", "objetivo", "valor", "paso", "tramo", "reserva", "salidas", "tipo", "resumen"],
            "additionalProperties": False,
        },
    },
    "required": ["mensajes", "propuesta"],
    "additionalProperties": False,
}

# Modelos que aceptan el parámetro de respaldo automático ante un rechazo.
_CON_RESPALDO = {"claude-opus-5-5", "claude-opus-5", "claude-fable-5-1", "claude-sonnet-5-5"}
_historial: list[dict] = []
_cerrojo = threading.Lock()


def hay_clave() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY", "").strip())


def _sistema() -> str:
    return SISTEMA.format(
        plantilla="\n".join(f"- {n}: {r}" for n, r in PLANTILLA.items()),
        acciones="\n".join(f"  · {k}: {v}" for k, v in ACCIONES.items()),
        riesgo="\n".join(f"  · {k}: {t} (entre {mi:g} y {ma:g}{' ' + u if u else ''})" for k, (t, mi, ma, u) in RIESGO_EDITABLE.items()),
    )


def contexto(E: dict, nombres: dict[str, str]) -> dict:
    """Resumen del estado de la oficina para el modelo (solo lo necesario, en poco espacio)."""
    papel, ctrl = E.get("papel", {}), E.get("control", {})
    pausados = set(ctrl.get("traders_pausados", []))
    traders = []
    for id_, t in papel.get("estrategias", {}).items():
        pos, radar = t.get("posicion"), t.get("radar") or {}
        traders.append({
            "nombre": nombres.get(id_, id_), "id": id_, "activo": t["simbolo"], "lado": t["direccion"],
            "resultado_$": round(t.get("resultado", 0), 2), "hoy_$": round(t.get("hoy", 0), 2),
            "operaciones_cerradas": len(t.get("operaciones", [])),
            "posicion": {"entrada": pos["entrada"], "stop": pos["stop"], "objetivo": pos["objetivo"],
                         "retorno_pct": round(pos["retorno_pct"], 2)} if pos else None,
            "radar": f"{radar.get('cumplidas', 0)}/{radar.get('total', 0)} condiciones" if radar else None,
            "le_falta": radar.get("faltan", [])[:2],
            "pausado_por_el_jefe": id_ in pausados,
            "estrategia": t.get("descripcion", ""),
            "sala": t.get("grupo", "trading"), "mesa": (t["mesa"] + 1) if t.get("mesa") is not None else None,
            "periodo_de_prueba": {k: v for k, v in (t.get("prueba") or {}).items() if k != "motivo"} or None,
            "examen_de_incubadora": {k: (t.get("examen") or {}).get(k) for k in ("operaciones", "resultado_pct", "factor", "nota")} if t.get("examen") else None,
            "kelly": t.get("kelly"),
        })
    m = E.get("mineria", {})
    riesgo = {k: v for k, v in (papel.get("riesgo") or {}).items() if k not in ("reglas", "apuestas")}
    riesgo["vetos"] = (riesgo.get("vetos") or [])[:5]
    hold = [{k: p.get(k) for k in ("simbolo", "presupuesto", "reserva", "reserva_usada", "aportado", "valor", "resultado",
                                   "resultado_pct", "realizado", "precio", "coste_medio", "paso_pct", "tramo_pct")}
            | {"proximas_compras": [z["precio"] for z in p.get("compras", []) if not z.get("sin_dinero")],
               "puntos_de_salida": [{"sobre_coste_pct": z.get("sobre_coste_pct"), "precio": z["precio"], "vende_pct": z["pct"],
                                     "ya_vendido": z["llena"]} for z in p.get("ventas", [])]}
            for p in (E.get("holding") or {}).get("planes", {}).values()]
    mac = E.get("macro") or {}
    return {
        "hora_local": dt.datetime.now().astimezone().strftime("%d/%m/%Y %H:%M"),
        "resumen_papel": papel.get("resumen"),
        "traders": traders,
        "mineria": {**{k: m.get(k) for k in ("estado", "modo", "ronda", "proxima", "simbolo", "generacion", "generaciones", "embudo")},
                    "pausada": bool((E.get("control") or {}).get("mineria_pausada"))},
        "banco": [{"id": b["id"], "activo": b["estrategia"]["simbolo"]} for b in E.get("banco", [])],
        "mesa_de_analisis": {"resumen": papel.get("mesa_resumen"),
                             "ultimas": [{k: d.get(k) for k in ("t", "id", "simbolo", "direccion", "donde", "entra", "motivos")}
                                         for d in (papel.get("mesa_analisis") or [])[:8]]},
        "riesgo": riesgo,
        "holding": hold,
        "tendencia": {"resumen": (E.get("tendencia") or {}).get("resumen"),
                      "monedas": [{k: p.get(k) for k in ("simbolo", "peso", "precio", "media", "maximo", "minimo", "en_media", "en_ruptura",
                                                         "invertido", "efectivo", "resultado", "resultado_pct")}
                                  for p in ((E.get("tendencia") or {}).get("monedas") or {}).values()],
                      "ultimas_operaciones": [{"moneda": s.replace("USDT", ""), **{k: o.get(k) for k in ("t", "tipo", "precio", "importe", "motivo")}}
                                              for s, p in ((E.get("tendencia") or {}).get("monedas") or {}).items()
                                              for o in (p.get("operaciones") or [])[-2:]]},
        "macro": {"regimen": mac.get("regimen"), "explicacion": mac.get("explicacion"), "fear_greed": mac.get("fear_greed", {}) and
                  {k: mac["fear_greed"][k] for k in ("valor", "clase")},
                  "indicadores": {i["nombre"]: [i["valor"], i["dia_pct"]] for i in (mac.get("indicadores") or {}).values()}},
        "precios_en_vivo": E.get("vivo", {}),
        "fondo": E.get("fondo"),
        "liquidez_remunerada": E.get("liquidez"),
        "donde_se_gana_y_se_pierde_7_dias": _desglose(E),
        "salas": (papel.get("grupos") or {}),
        "estrategias_repetidas": E.get("repetidas", []),
        "incubadora": [{"id": i, "activo": t["simbolo"], "lado": t["direccion"], "sala": t.get("grupo"),
                        "examen": {k: (t.get("examen") or {}).get(k) for k in ("estado", "operaciones", "operaciones_min", "dias",
                                                                               "resultado_pct", "factor", "nota", "motivo")}}
                       for i, t in (papel.get("incubadora") or {}).items()],
        "banquillo": len(papel.get("banquillo") or []),
        "ultimas_suspendidas": [{k: x.get(k) for k in ("id", "simbolo", "motivo", "resultado")} for x in (papel.get("suspendidas") or [])[:5]],
        "academia": {k: (E.get("academia") or {}).get(k) for k in ("juzgadas", "funcionan", "fallan", "textos", "causas")},
        "informe_del_dia": E.get("informe"),
        "sistema": {k: {kk: v.get(kk) for kk in ("ok", "ciclo_s", "errores_seguidos", "ultimo_error")}
                    for k, v in (E.get("sistema") or {}).items() if isinstance(v, dict)},
        "supervision": {"reglas": E.get("prueba"), "mesas": E.get("mesas"),
                        "aprobadas_esperando_mesa": [i for i, t in (papel.get("incubadora") or {}).items()
                                                     if (t.get("examen") or {}).get("estado") == "aprobada"],
                        "ultimas_retiradas": [{k: r.get(k) for k in ("id", "grupo", "simbolo", "mesa", "fin", "motivo", "por", "resultado")}
                                              for r in (papel.get("retirados") or [])[:6]]},
        "decisiones_del_jefe": {"busqueda_de_estrategias_en_marcha": ctrl.get("busqueda"), "freno_manual": ctrl.get("freno_manual"),
                                "traders_pausados": sorted(pausados), "ultimas": ctrl.get("decisiones", [])[:5]},
    }


def _desglose(E: dict) -> dict | None:
    """Últimos 7 días por parte del fondo: resultado, antes de comisiones, comisiones (abrir y cerrar) y operaciones, y cuánto
    se movió cada moneda. Así se puede explicar de dónde salen las pérdidas o las ganancias."""
    from . import fondo

    try:
        return fondo.desglose(fondo.analitica(E.get("vivo")), 7)
    except Exception:   # el fondo aún sin calcular: el chat funciona igual
        return None


def _limpiar(respuesta: dict, nombres: dict[str, str]) -> dict:
    validos = set(PLANTILLA) | set(nombres.values())
    mensajes = [{"quien": m["quien"] if m.get("quien") in validos else "Marta", "texto": str(m.get("texto", "")).strip()}
                for m in respuesta.get("mensajes", []) if str(m.get("texto", "")).strip()][:4]
    p = respuesta.get("propuesta") or {}
    propuesta = p if p.get("accion") in ACCIONES else None
    return {"mensajes": mensajes or [{"quien": "Marta", "texto": "Perdona, no te he entendido. ¿Me lo repites?"}],
            "propuesta": propuesta}


def _con_claude(texto: str, para: str | None, E: dict, nombres: dict[str, str]) -> dict:
    import anthropic

    contenido = json.dumps({"estado_de_la_oficina": contexto(E, nombres)}, ensure_ascii=False, default=str)
    pregunta = f"{'(Para ' + para + ') ' if para else ''}{texto}"
    with _cerrojo:
        historial = list(_historial)
    extra = {"betas": ["server-side-fallback-2026-07-01"], "fallbacks": "default"} if MODELO_CHAT in _CON_RESPALDO else {}
    try:
        resp = anthropic.Anthropic().beta.messages.create(
            model=MODELO_CHAT,
            max_tokens=4000,
            system=_sistema(),
            messages=historial + [{"role": "user", "content": f"{contenido}\n\nMensaje del jefe: {pregunta}"}],
            output_config={"effort": "low", "format": {"type": "json_schema", "schema": ESQUEMA}},
            **extra,
        )
    except anthropic.AuthenticationError:
        return {"mensajes": [{"quien": "Marta", "texto": "La clave de Claude del archivo .env no es válida. Revísala y reinicia el Trading Floor."}], "propuesta": None}
    except anthropic.RateLimitError:
        return {"mensajes": [{"quien": "Marta", "texto": "Claude está saturado ahora mismo. Pruébalo otra vez en unos segundos."}], "propuesta": None}
    except anthropic.APIConnectionError:
        return {"mensajes": [{"quien": "Marta", "texto": "No consigo conectar con Claude. ¿Hay internet?"}], "propuesta": None}
    except anthropic.APIStatusError as e:
        return {"mensajes": [{"quien": "Marta", "texto": f"Claude ha devuelto un error ({e.status_code}). Pruébalo otra vez."}], "propuesta": None}
    if resp.stop_reason == "refusal":
        return {"mensajes": [{"quien": "Marta", "texto": "Con eso no te puedo ayudar."}], "propuesta": None}
    bruto = next((b.text for b in resp.content if b.type == "text"), "{}")
    try:
        respuesta = _limpiar(json.loads(bruto), nombres)
    except (ValueError, TypeError, AttributeError):
        respuesta = {"mensajes": [{"quien": "Marta", "texto": "Se me ha cortado la respuesta. ¿Me lo repites?"}], "propuesta": None}
    with _cerrojo:
        _historial.extend([{"role": "user", "content": pregunta},
                           {"role": "assistant", "content": json.dumps(respuesta, ensure_ascii=False)}])
        del _historial[:-12]
    return respuesta


# ---------------------------------------------------------------- modo básico --

def _normal(texto: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", texto.lower()) if unicodedata.category(c) != "Mn")


def _es(x: float, signo: bool = True) -> str:
    return (f"{x:+.2f}" if signo else f"{x:g}").replace(".", ",")


def _precio(x: float) -> str:
    return f"{x:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")


def _propuesta(accion: str, resumen: str, objetivo: str = "", valor: float = 0, tipo: str = "") -> dict:
    return {"accion": accion, "objetivo": objetivo, "valor": valor, "paso": 0, "tramo": 0, "reserva": 0, "salidas": [],
            "tipo": tipo, "resumen": resumen}


def _basico(texto: str, para: str | None, E: dict, nombres: dict[str, str]) -> dict:
    t = _normal(texto)
    papel, ctrl = E.get("papel", {}), E.get("control", {})
    por_nombre = {_normal(n): i for i, n in nombres.items()}
    ident = next((x.upper() for x in re.findall(r"e-[0-9a-f]{6}", t)), None) or next((i for n, i in por_nombre.items() if re.search(rf"\b{re.escape(n)}\b", t)), None)
    nombre = nombres.get(ident, ident) if ident else None
    numero = next((float(x.replace(",", ".")) for x in re.findall(r"\d+(?:[.,]\d+)?", t)), None)
    r = papel.get("resumen") or {}

    def dice(quien, txt, propuesta=None):
        return {"mensajes": [{"quien": quien, "texto": txt}], "propuesta": propuesta}

    if re.search(r"miner|busqueda|mina\b|buscar", t) and re.search(r"reanud|sigue|continu|vuelve a buscar|arranca", t):
        if not ctrl.get("mineria_pausada"):
            return dice("Tomás", "La búsqueda ya está en marcha: buscamos siempre, por rondas, con un descanso entre ronda y ronda.")
        return dice("Tomás", "Si lo apruebas, vuelvo a buscar estrategias por rondas, sin parar.", _propuesta("reanudar_busqueda", "Reanudar la búsqueda de estrategias"))
    if re.search(r"mesa de analisis|esceptic|la mesa\b|que dice la mesa", t):
        res = papel.get("mesa_resumen") or {}
        ult = [d for d in (papel.get("mesa_analisis") or []) if not d.get("repetida")][:3]
        if not ult:
            return dice("Olga", "Todavía no ha llegado ninguna señal a la mesa. Cuando un trader de la sala de trading (o una estrategia de "
                                "la incubadora) quiera entrar, la miramos entre los seis y yo digo si entra o pasa: a favor de la tendencia "
                                "diaria, ganando al menos 1,5 veces lo que arriesga y sin la masa en contra en un extremo.")
        lineas = "; ".join(f"{d['id']} ({'largo' if d['direccion'] == 'largo' else 'corto'} en {d['simbolo'].replace('USDT', '')}): "
                           + ("entra" if d["entra"] else "pasa, " + ", ".join(d["motivos"])) for d in ult)
        return dice("Olga", f"Hoy la mesa ha visto {res.get('hoy', 0)} señales y ha dejado pasar {res.get('entran_hoy', 0)}. Las últimas: {lineas}. "
                            "Con datos de 2024 a 2026, lo que dejamos pasar ganaba de media un 0,15 % por operación y lo que vetamos perdía un 0,10 %.")
    if re.search(r"miner|busqueda|laboratorio|probador", t) and re.search(r"como va|que tal|estado|cuantas|ronda", t):
        m = E.get("mineria", {})
        e = m.get("embudo") or {}
        estado = ("en pausa (la has pausado tú)" if ctrl.get("mineria_pausada") else
                  f"minando {str(m.get('simbolo') or '').replace('USDT', '')}, generación {m.get('generacion', 0)} de {m.get('generaciones', 0)}"
                  if m.get("estado") == "minando" else
                  "descansando hasta la siguiente ronda" if m.get("estado") == "descanso" else "en espera")
        ronda = f"Vamos por la ronda {m['ronda']} y estamos {estado}." if m.get("ronda") else f"Ahora estamos {estado}."
        return dice("Tomás", f"{ronda} En esta ronda: {e.get('Generadas', 0)} estrategias evaluadas, {e.get('Rentables en muestra', 0)} "
                             f"parecían rentables y {e.get('Distinta a las del banco', 0)} han superado las ocho pruebas. Las pruebas son muy "
                             "duras a propósito: aprueba una de cada diez de las que aprobaban antes.")
    if re.search(r"miner|busqueda|mina\b", t) and re.search(r"paus|para|deten|cancel", t):
        return dice("Tomás", "Entendido. Si lo apruebas, pauso la búsqueda al terminar la generación en curso y no vuelvo a buscar "
                             "hasta que me digas «reanuda la búsqueda».", _propuesta("parar_busqueda", "Pausar la búsqueda de estrategias"))
    area = next((a for a in ("tendencia", "holding", "scalping", "trading") if a in t), None)
    if numero is not None and area and ("%" in texto or re.search(r"\bdedic|\basign|\bpon\b|\bsube|\bbaja|\bporcentaje|\bpor ciento", t)):
        f = E.get("fondo") or {}
        actual = (f.get("reparto") or {}).get(area)
        return dice("Marta", f"¿Dedico un {_es(numero, False)} % del fondo {'a la sala de tendencia' if area == 'tendencia' else 'al ' + area}"
                             + (f" (ahora tiene un {_es(actual, False)} %)" if actual is not None else "")
                             + "? Se aplica desde ahora y lo ganado hasta hoy se conserva; lo que no se asigna queda como liquidez.",
                    _propuesta("asignar", f"Dedicar un {_es(numero, False)} % del fondo {'a la sala de tendencia' if area == 'tendencia' else 'al ' + area}",
                               area, numero))
    if numero is not None and re.search(r"\baport|\bmete|\bingres|\bdeposit", t):
        return dice("Marta", f"¿Meto {_es(numero, False)} $ ficticios en tu fondo? Lo que ya has ganado no cambia: solo tendrás más dinero invertido.",
                    _propuesta("aportar", f"Aportar {_es(numero, False)} $ al fondo", valor=numero))
    if numero is not None and re.search(r"\bretir|\bsaca|\breembols", t) and "repetid" not in t:
        return dice("Marta", f"¿Saco {_es(numero, False)} $ ficticios del fondo? Solo se puede sacar el dinero que no está invertido.",
                    _propuesta("retirar", f"Retirar {_es(numero, False)} $ del fondo", valor=numero))
    if re.search(r"donde (perdemos|se pierde|ganamos|se gana|se va)|por ?que (perdemos|pierde|se pierde|vamos perdiendo)|de donde (sale|vienen?) (la|las) perdida|"
                 r"en que (perdemos|se pierde)|abrir y cerrar|comisiones", t):
        from . import fondo as fondo_

        try:
            d = fondo_.desglose(fondo_.analitica(E.get("vivo")), 7)
        except Exception:
            return dice("Marta", "El fondo todavía se está calculando. Pregúntamelo en un momento.")
        nombre = {"trading": "trading", "scalping": "scalping", "holding": "holding", "tendencia": "tendencia",
                  "intereses": "intereses de la liquidez"}
        partes = sorted(d["areas"].items(), key=lambda kv: kv[1]["resultado"])
        detalle = "; ".join(f"{nombre[a]} {_es(x['resultado'])} $" + ("" if a == "intereses" else
                            f" ({_es(x['comisiones'], False)} $ de comisiones en {x['operaciones']} "
                            f"{'operación' if x['operaciones'] == 1 else 'operaciones'})") for a, x in partes)
        merc = ", ".join(f"{s_.replace('USDT', '')} {_es(v)} %" for s_, v in d["mercado"].items())
        total, com = d["resultado"], d["comisiones"]
        txt = (f"En los últimos 7 días el fondo va {_es(total)} $. Por partes: {detalle}. Abrir y cerrar ha costado "
               f"{_es(com, False)} $ en total")
        if total < 0:
            txt += (f", un {abs(com / total) * 100:.0f} % de lo perdido: " + ("lo demás es que el mercado ha bajado" if abs(com) < abs(total) / 4
                                                                            else "pesa bastante, sobre todo en el scalping"))
        txt += f". El mercado en esos días: {merc}. Todo el detalle está en «Mi fondo» → «Dónde se gana y dónde se pierde»."
        sc = d["areas"].get("scalping") or {}
        if sc.get("antes_de_comisiones", 0) < 0 and ((E.get("fondo") or {}).get("reparto") or {}).get("scalping", 0) > 0:
            txt += (f" El scalping pierde incluso antes de comisiones y abre y cierra mucho ({sc['operaciones']} operaciones): "
                    "si quieres, lo dejo a 0 % y ese dinero queda sin invertir hasta que decidas otra cosa.")
            return dice("Marta", txt, _propuesta("asignar", "Dejar el scalping a 0 % del fondo", "scalping", 0))
        return dice("Marta", txt)
    if re.search(r"reparto (rentable|recomendad|bueno|mejor)|que reparto|hazlo rentable|sea rentable|ser rentable|como ganamos|ganar dinero", t):
        rep = REPARTO_RENTABLE
        tipo = _precio(float((E.get("liquidez") or {}).get("tipo_pct") or TIPO_LIQUIDEZ))
        txt = ("Con datos reales de 2022 a hoy, el reparto que más habría ganado es: sin scalping (pierde incluso antes de "
               "comisiones), casi sin trading (las estrategias minadas no ganan a las comisiones), holding 25 %, tendencia 40 % y "
               f"un 30 % sin invertir, que cobra intereses como un monetario (ahora un {tipo} % al año). Habría dado un +25,6 % al año "
               "frente a un +23,6 % con un reparto 20/15/30/30 (y un +20 % sin los intereses), con caídas algo menores (en 2022, "
               "−28 % frente a −30 %). No hay garantías: con cripto dentro, la mitad de los meses salen en rojo.")
        actual = (E.get("fondo") or {}).get("reparto") or {}
        if all(abs(float(actual.get(a, -1)) - v) < 0.5 for a, v in rep.items()):
            return dice("Marta", txt + " Ya lo tienes aplicado: ahora toca paciencia, porque se juzga en meses, no en días.")
        return dice("Marta", txt + " ¿Lo aplico?",
                    _propuesta("asignar", "Reparto rentable: trading 5 %, scalping 0 %, holding 25 %, tendencia 40 % y un 30 % sin "
                                          "invertir que cobra intereses", "rentable"))
    if re.search(r"interes|monetario|letras del tesoro|dinero (parado|quieto|sin invertir)", t):
        lq = E.get("liquidez") or {}
        if lq.get("tipo_pct") is None:
            return dice("Marta", "Los intereses empiezan a contar cuando el paper trading da su primera vuelta. Pregúntamelo en un momento.")
        return dice("Marta", f"Todo lo que no está dentro del mercado ({_precio(lq.get('efectivo', 0))} $ ahora: lo que no repartes y el "
                             f"efectivo que guardan las salas) cobra un {_precio(lq['tipo_pct'])} % al año, el tipo de las letras del "
                             f"Tesoro de EE. UU. a 3 meses, como en un monetario. Son unos {_precio(lq.get('al_dia', 0))} $ al día, y "
                             f"llevamos {_precio(lq.get('acumulado', 0))} $ cobrados. Cuentan en tu fondo como «Intereses».")
    if "fondo" in t or "rentabilidad" in t or "valor liquidativo" in t:
        f = E.get("fondo") or {}
        if not f:
            return dice("Marta", "El fondo todavía se está calculando. Dame un momento.")
        return dice("Marta", f"Has puesto {_precio(f['aportado'])} $ y tu fondo vale {_precio(f['patrimonio'])} $: "
                             f"{_es(f['rentabilidad_pct'])} % desde el inicio y {_es(f['hoy_pct'])} % hoy. Lo tienes todo, explicado, "
                             "en «📊 Mi fondo».")
    if re.search(r"repetid|duplicad", t) and re.search(r"quit|limpi|elimin|borr|retir|fuera", t):
        return dice("Irene", "Propongo retirar las estrategias repetidas (misma idea con otros números). De cada grupo me quedo "
                             "con la que mejor lo hizo fuera de muestra.", _propuesta("limpiar_repetidas", "Retirar las estrategias repetidas"))
    if re.search(r"\bbusc|reanud|arranc|lanza|empie[zc]|\bmina\b|\bminar\b", t) and re.search(r"estrateg|miner|minar|\bmina\b|scalp", t):
        activo = next((a for a in ("btc", "eth", "sol", "bnb", "xrp", "doge") if re.search(rf"\b{a}\b", t)), "")
        scalp = "scalp" in t
        que = (activo.upper() or "todos los activos con mesas libres") + (" (scalping, velas de 5 minutos)" if scalp else "")
        return dice("Tomás", f"¿Busco ya estrategias nuevas de {que}? Ya buscamos siempre, por rondas; esto va antes que la ronda en "
                             "curso y luego seguimos donde íbamos. Si alguna supera las ocho pruebas, entra al banco y empieza en la incubadora.",
                    _propuesta("buscar_estrategias", f"Buscar estrategias de {que}", activo.upper(), tipo="scalping" if scalp else ""))
    if re.search(r"\bm[oó]vil\b|\bcelular\b|\btel[eé]fono\b|\biphone\b|\bandroid\b|\btablet", t) and not re.search(r"estrateg|trader|\be-[0-9a-f]", t):
        return dice("Néstor", "En el ordenador, pulsa «Móvil» arriba a la derecha y luego «Activar el acceso desde el móvil». Sale un código QR: "
                              "con el móvil conectado al mismo WiFi, ábrelo con la cámara y toca el enlace. La primera vez Windows puede "
                              "preguntar por el cortafuegos: pulsa «Permitir acceso» (redes privadas). El enlace lleva una clave, así que "
                              "nadie más de tu red puede entrar, y se queda activado para la próxima vez. Funciona mientras el programa esté "
                              "abierto en el ordenador; para cortarlo, «Dejar de compartir».")
    if re.search(r"\bpase(o|a|ar|arme)\b|primera persona|\b3d\b|recorrer la oficina|\bcaminar\b", t) and not re.search(r"estrateg|trader|\be-[0-9a-f]", t):
        return dice("Chema", "¡Ven a vernos! Pulsa «Pasear en 3D» (debajo de los botones de las plantas) o la tecla P. Haz clic y anda con "
                             "W A S D, mira con el ratón, corre con Mayús y pulsa E delante de alguien para ver su ficha. El ascensor "
                             "está al fondo del pasillo, a la izquierda: con E subes una planta (desde la 3 vuelves a la baja). Esc suelta el ratón y P te devuelve "
                             "a la vista de siempre. Te invito a un cortado sin apalancamiento.")
    if re.search(r"kill|cierra todo|cerrar todo|emergencia|vende todo", t):
        return dice("Julia", "¿Pulso el kill switch? Se cierran ya todas las posiciones abiertas del fondo al último precio y no se "
                             "abre nada nuevo hasta que pulses «Reabrir». La incubadora sigue, porque no usa dinero del fondo.",
                    _propuesta("kill_switch", "Kill switch: cerrar todo lo abierto del fondo"))
    if re.search(r"reabr|reanuda todo|vuelve a abrir", t):
        return dice("Julia", "Si lo apruebas, quito el freno manual y se vuelven a permitir entradas.", _propuesta("quitar_freno", "Reabrir"))
    if re.search(r"pausa todo|pausar todo|para todo", t):
        return dice("Julia", "¿Pauso todo? Nadie abre posiciones nuevas; las abiertas siguen con su stop y su objetivo.",
                    _propuesta("activar_freno", "Pausar todo (freno manual)"))
    if re.search(r"incubador|banquillo|examen", t):
        inc = list((papel.get("incubadora") or {}).items())
        if not inc:
            return dice("Lorena", "La incubadora está vacía. Cuando la minería apruebe estrategias nuevas, empezarán aquí con dinero de prueba.")
        aprob = [i for i, x in inc if (x.get("examen") or {}).get("estado") == "aprobada"]
        mejor = max(inc, key=lambda kv: (kv[1].get("examen") or {}).get("nota", 0))
        ex = mejor[1].get("examen") or {}
        return dice("Lorena", f"Tengo {len(inc)} estrategias de examen con dinero de prueba (no cuenta en tu fondo) y "
                              f"{len(papel.get('banquillo') or [])} en el banquillo. Aprobadas esperando mesa: {len(aprob)}. La que mejor va es "
                              f"{mejor[0]}: {ex.get('operaciones', 0)} de {ex.get('operaciones_min', 10)} operaciones, "
                              f"{_es(ex.get('resultado_pct', 0))} %.")
    if re.search(r"informe|resumen del dia|noticias", t):
        inf = E.get("informe") or {}
        return dice("Rebeca", f"{inf.get('titular', 'Sin informe todavía')}. " + " ".join(f"{x['tema']}: {x['texto']}" for x in (inf.get("puntos") or [])[:3]))
    if re.search(r"academia|aprendid|leccion|post ?mortem", t):
        ac = E.get("academia") or {}
        textos = ac.get("textos") or ["Todavía no hay lecciones."]
        n = ac.get("juzgadas", 0)
        return dice("Begoña", f"Hemos juzgado {n} {'estrategia' if n == 1 else 'estrategias'} en real: {ac.get('funcionan', 0)} "
                              f"{'funciona' if ac.get('funcionan', 0) == 1 else 'funcionan'} y {ac.get('fallan', 0)} "
                              f"{'falla' if ac.get('fallan', 0) == 1 else 'fallan'}. {' '.join(textos[:2])}")
    if "kelly" in t:
        return dice("Ainara", "Con 30 operaciones reales o más, cada trader arriesga según el Kelly prudente: uso un acierto rebajado "
                              "por si ha tenido suerte y solo una cuarta parte del resultado, entre un 0,25 % y 1,5 veces tu riesgo "
                              "por operación. Antes de las 30, el riesgo de siempre.")
    if "freno" in t and re.search(r"quit|levant|desactiv|suelt", t):
        return dice("Julia", "Si lo apruebas, quito el freno manual y se vuelven a permitir entradas.", _propuesta("quitar_freno", "Quitar el freno manual"))
    if "freno" in t or "para todo" in t:
        return dice("Julia", "Propongo activar el freno manual: nadie abre posiciones nuevas hasta que lo quites.", _propuesta("activar_freno", "Activar el freno manual"))
    if ident and re.search(r"retir|elimin|borr|echa|despid|cambia|otra estrategia|relev", t):
        de = f" de {nombre}" if nombre and nombre != ident else ""
        return dice("Clara", f"¿Retiro la estrategia {ident}{de}? Lo que ganó o perdió sigue contando en el fondo, y su mesa "
                             "pasa a la mejor aprobada de la incubadora (si hay).",
                    _propuesta("retirar_estrategia", f"Retirar {ident} del banco", ident))
    if ident and re.search(r"reanud|activ|vuelv|despaus", t):
        return dice("Clara", f"Si lo apruebas, {nombre} vuelve a operar con normalidad.", _propuesta("reanudar_trader", f"Reanudar a {nombre} ({ident})", ident))
    if ident and re.search(r"paus|para|deten|frena", t):
        return dice("Clara", f"Si lo apruebas, {nombre} no abrirá posiciones nuevas (las que tenga abiertas siguen su curso).", _propuesta("pausar_trader", f"Pausar a {nombre} ({ident})", ident))
    if "riesgo" in t and numero is not None:
        return dice("Julia", f"Propongo fijar el riesgo por operación en un {_es(numero, False)} % del capital de cada trader. "
                             "Solo afecta a las entradas nuevas.",
                    _propuesta("cambiar_riesgo", f"Riesgo por operación = {_es(numero, False)} %", "riesgo_por_operacion", numero))
    if "comite" in t:
        return dice("Bruno", "¿Convoco el comité ahora mismo?", _propuesta("convocar_comite", "Convocar el comité"))
    if re.search(r"supervis|relev|\bprueba\b|no (es |son )?rentable|reserva del banco|en reserva", t):
        ts = list(papel.get("estrategias", {}).values())
        reglas = E.get("prueba") or {}
        pt = reglas.get("trading", {})
        prueba = [x for x in ts if (x.get("prueba") or {}).get("estado") == "en_prueba"]
        vigilados = [x for x in ts if (x.get("prueba") or {}).get("estado") == "espera_cierre"]
        ret = papel.get("retirados") or []
        txt = (f"Cada trader tiene un periodo de prueba ({pt.get('dias', 14)} días y {pt.get('operaciones', 6)} operaciones en trading). "
               f"Si al acabarlo va en pérdidas, o si antes pierde un {_es(pt.get('corte_pct', 5), False)} %, le cambio la estrategia por la "
               f"mejor aprobada de la incubadora. Ahora: {len(prueba)} en prueba, {len(ts) - len(prueba) - len(vigilados)} con la prueba superada"
               + (f", {len(vigilados)} a los que cambiaré en cuanto cierren su posición" if vigilados else "")
               + f"; {sum((t.get('examen') or {}).get('estado') == 'aprobada' for t in (papel.get('incubadora') or {}).values())} "
               f"aprobadas en la incubadora esperando mesa y {len(ret)} retiradas hasta hoy.")
        if ret:
            txt += f" La última: {ret[0]['id']} ({ret[0].get('motivo', '')})."
        return dice("Clara", txt)
    if "tendencia" in t:
        td = E.get("tendencia") or {}
        if not td.get("monedas"):
            return dice("Marina", "La sala de tendencia aún no tiene dinero. Ponle un % en «Mi fondo» (o dime «pon un 20 % en tendencia»): "
                                  "compramos solo las monedas que suben (por encima de su media de 50 días o rompiendo su máximo de 20 días) "
                                  "y nos apartamos cuando caen.")
        rs = td.get("resumen") or {}
        partes = [f"{p['simbolo'].replace('USDT', '')} {'todo dentro' if p['peso'] >= 1 else 'medio dentro' if p['peso'] > 0 else 'fuera'}"
                  for p in td["monedas"].values()]
        return dice("Marina", f"Tendencia: {_es(rs.get('resultado', 0))} $ ({_es(rs.get('resultado_pct', 0))} %). Ahora "
                              + ", ".join(partes) + f". Invertido el {_es(rs.get('invertido_pct', 0), False)} %; el resto espera en efectivo.")
    if "holding" in t or "promedi" in t or "reserva" in t:
        planes = (E.get("holding") or {}).get("planes", {})
        if not planes:
            return dice("Diego", "La sala de holding todavía no tiene planes en marcha.")
        partes = []
        for p in planes.values():
            moneda = p["simbolo"].replace("USDT", "")
            prox = next((z["precio"] for z in p.get("compras", []) if not z.get("sin_dinero")), None)
            salida = next((z for z in p.get("ventas", []) if not z.get("llena") and z.get("precio")), None)
            partes.append(f"{moneda} {_es(p.get('resultado_pct', 0))} %"
                          + (f", próxima compra a {_precio(prox)}" if prox else ", sin dinero para más compras")
                          + (f", próxima salida a {_precio(salida['precio'])} (+{_es(salida['sobre_coste_pct'], False)} % sobre coste)"
                             if salida else ""))
        return dice("Diego", "Holding sin stop: " + "; ".join(partes) + ".")
    if not ident and re.search(r"abiert|trades? abierto|posicion(es)? abierta|operaciones (en curso|abiertas)|dentro del mercado", t):
        vivo, abiertas = E.get("vivo") or {}, []
        for i, x in (papel.get("estrategias") or {}).items():
            pos = x.get("posicion")
            if not pos or not pos.get("entrada"):
                continue
            lado = 1 if x["direccion"] == "largo" else -1
            precio = vivo.get(x["simbolo"]) or pos.get("salida") or pos["entrada"]
            coste = E.get("coste_scalping", 0) if x.get("grupo") == "scalping" else E.get("coste_ida_vuelta", 0)
            capital = x.get("patrimonio", 1000) / (1 + pos.get("retorno_pct", 0) / 100)
            usd = capital * pos.get("fraccion", 1) * (lado * (precio / pos["entrada"] - 1) - coste)
            abiertas.append((usd, nombres.get(i, i), x["simbolo"].replace("USDT", ""), "a que sube" if lado > 0 else "a que baja"))
        if not abiertas:
            return dice("Julia", "Ahora mismo no hay ninguna operación abierta con dinero del fondo: los traders esperan a que el mercado "
                                 "cumpla sus condiciones. Las verás en la pestaña «Abiertas» en cuanto entren.")
        abiertas.sort(reverse=True)
        total = sum(a[0] for a in abiertas)
        lista = "; ".join(f"{n} ({sim}, {lado}): {_es(u)} $" for u, n, sim, lado in abiertas[:5])
        return dice("Julia", f"Hay {len(abiertas)} {'operación abierta' if len(abiertas) == 1 else 'operaciones abiertas'} y en conjunto van "
                             f"{_es(total)} $. {lista}{' y más' if len(abiertas) > 5 else ''}. Tienes el detalle, con lo que le falta a cada una "
                             "para su objetivo y su stop, en la pestaña «Abiertas».")
    if re.search(r"mejor|ranking|lider|quien gana", t):
        ts = sorted(papel.get("estrategias", {}).items(), key=lambda x: -x[1].get("resultado", 0))
        if ts and ts[0][1].get("resultado", 0) > 0:
            i, x = ts[0]
            return dice("Clara", f"Ahora mismo lidera {nombres.get(i, i)} ({i}, {x['simbolo'].replace('USDT', '')}) con {_es(x['resultado'])} $ ficticios.")
        return dice("Clara", "Todavía nadie ha ganado nada: los traders acaban de empezar y esperan su señal.")
    if ident and ident in (papel.get("incubadora") or {}):
        ex = (papel["incubadora"][ident].get("examen") or {})
        estado = {"aprobada": "ha aprobado y espera mesa", "suspendida": "va a suspender", "espera_cierre": "se decide al cerrar su posición"}.get(
            ex.get("estado"), "sigue de examen")
        return dice("Lorena", f"{ident} está en la incubadora (dinero de prueba): {ex.get('operaciones', 0)} de {ex.get('operaciones_min', 10)} "
                              f"operaciones, {_es(ex.get('resultado_pct', 0))} % y {estado}.")
    if ident:
        x = papel.get("estrategias", {}).get(ident, {})
        rd = x.get("radar") or {}
        falta = f" Le falta: {', '.join(rd.get('faltan', [])[:2])}." if rd.get("faltan") else ""
        estado = "tiene una posición abierta" if x.get("posicion") else f"espera su señal ({rd.get('cumplidas', 0)} de {rd.get('total', 0)} condiciones)"
        pr = x.get("prueba") or {}
        prueba = (f" Periodo de prueba: día {int(pr['dias'])} de {pr['dias_min']} y {pr['operaciones']} de {pr['operaciones_min']} operaciones."
                  if pr.get("estado") == "en_prueba" else " Prueba superada." if pr.get("estado") == "rentable"
                  else " Voy en pérdidas: en cuanto cierre esta posición, el supervisor me cambia la estrategia." if pr.get("estado") == "espera_cierre"
                  else "")
        return dice(nombre or "Clara", f"Llevo {_es(x.get('resultado', 0))} $ ficticios y ahora {estado}.{falta}{prueba}")
    if re.search(r"como va|como vamos|resumen|estado|que tal|informe", t):
        m = E.get("mineria", {})
        return dice("Marta", f"Resultado en papel: {_es(r.get('resultado', 0))} $ (hoy {_es(r.get('hoy', 0))} $). "
                             f"{len(papel.get('estrategias', {}))} traders, minería {m.get('estado', 'parada')}"
                             f"{', freno manual activado' if ctrl.get('freno_manual') else ''}.")
    return dice("Marta", "Sin la clave de Claude solo entiendo órdenes sencillas: «busca estrategias», «busca estrategias de SOL», «busca scalping de BTC», «pausa la búsqueda», «reanuda la búsqueda», «¿cómo va la búsqueda?», «¿qué dice la mesa?», «quita las repetidas», "
                         "«pausa todo», «reabre», «kill switch», «pausa a E-XXXXXX», «cambia la estrategia de E-XXXXXX», «¿cómo va la supervisión?», «¿cómo va la incubadora?», «informe del día», «¿qué ha aprendido la academia?», «riesgo 0,5», «convoca el comité», «¿cómo van las operaciones abiertas?», «¿cómo paseo por la oficina?», «¿cómo lo abro en el móvil?», "
                         "«¿cómo va el holding?», «¿cómo va la tendencia?», «pon un 20 % en tendencia», «¿dónde perdemos?», «reparto rentable», «¿cuánto cobramos de intereses?», «¿cómo vamos?» o «¿quién es el mejor?». Para conversar de verdad, añade ANTHROPIC_API_KEY al .env.")


def responder(texto: str, para: str | None, E: dict, nombres: dict[str, str]) -> dict:
    texto = (texto or "").strip()[:1000]
    if not texto:
        return {"mensajes": [], "propuesta": None, "modo": "basico"}
    if hay_clave():
        return {**_con_claude(texto, para, E, nombres), "modo": "claude"}
    return {**_basico(texto, para, E, nombres), "modo": "basico"}
