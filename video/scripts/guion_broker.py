"""Reel de alcance (~18 s): el aviso de riesgo que tu bróker está obligado a enseñarte (ESMA)."""

TITULO = "Tu bróker está obligado a decirte esto"
GUION = [
    ("hook", ["Tu bróker está obligado a decirte esto, y casi nadie lo lee."]),
    ("dato", ["Entre 6 y 9 de cada 10 cuentas de sus clientes pierden dinero con CFD.", "Lo pone en su propia web."]),
    ("giro", ["¿Y los que ganan?", "No aciertan más.", "Pierden menos cuando fallan."]),
    ("cta", ["Sígueme si quieres estar en el otro grupo."]),
]

GESTOS = {
    "hook": "[inhales] Tu bróker está obligado a decirte esto... y casi nadie lo lee.",
    "dato": "Entre 6 y 9 de cada 10 cuentas de sus clientes pierden dinero con CFD. [short pause] Lo pone en su propia web.",
    "giro": "[short pause] ¿Y los que ganan? No aciertan más. [short pause] Pierden menos cuando fallan.",
    "cta": "[warmly] Sígueme si quieres estar en el otro grupo.",
}

PANTALLAS = [
    ("hook", "la *letra pequeña*", "una web de bróker con el aviso en letra diminuta que una lupa agranda"),
    ("dato", "*6-9 de 10* pierden", "diez figuras de alambre: entre seis y nueve se apagan; «PIERDEN DINERO»"),
    ("giro", "pierden *menos*", "las que quedan: barras de pérdida cortas frente a ganancias normales"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
]
