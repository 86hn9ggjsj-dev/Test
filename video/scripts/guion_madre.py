"""Reel de promo del bot (~32 s), formato POV de humor: le cuento a mi madre que tengo un bot de trading.

Afirmaciones sobre el bot (verdaderas y ya usadas): cuenta auditada por un tercero; sabe cuánto puede perder antes de
entrar; la cuenta está en el link de la bio. El cierre pide mirar la cuenta antes de nada (sin prometer rentabilidad).
"""

TITULO = "Le conté a mi madre que tengo un bot de trading"
GUION = [
    ("hook", ["Le conté a mi madre que tengo un bot de trading.", "Primera pregunta: «¿Eso no es una estafa?»"]),
    ("uno", ["Mamá, las estafas enseñan capturas.", "Mi bot tiene la cuenta auditada por un tercero."]),
    ("dos", ["Segunda: «¿Y si pierde?»", "Pierde, mamá. Pero sabe cuánto antes de entrar."]),
    ("sigueme", ["Sígueme, que la tercera no me la esperaba."]),
    ("tres", ["Tercera: «¿Y me lo puedes poner a mí?»"]),
    ("giro", ["Primero mira la cuenta, mamá. Como todo el mundo.", "Está en el link de la bio."]),
    ("pregunta", ["¿Qué te dijo tu familia cuando empezaste en esto? Y etiqueta a tu madre."]),
]

GESTOS = {
    "hook": "[mischievously] Le conté a mi madre que tengo un bot de trading. [short pause] Primera pregunta: [suspicious] «¿Eso no es una estafa?»",
    "uno": "[sighs] Mamá, las estafas enseñan capturas. [short pause] Mi bot tiene la cuenta auditada por un tercero.",
    "dos": "Segunda: [worried] «¿Y si pierde?» [short pause] Pierde, mamá. Pero sabe cuánto antes de entrar.",
    "sigueme": "[warmly] Sígueme, que la tercera no me la esperaba.",
    "tres": "[laughs] Tercera: [excited] «¿Y me lo puedes poner a mí?»",
    "giro": "[chuckles] Primero mira la cuenta, mamá. Como todo el mundo. [short pause] Está en el link de la bio.",
    "pregunta": "[curious] ¿Qué te dijo tu familia cuando empezaste en esto? Y etiqueta a tu madre.",
}

PANTALLAS = [
    ("hook", "", "salón 3D: sofá y tele; la madre (stickman con moño) y el hijo; bocadillo «¿ESTAFA?» con lupa"),
    ("uno", "", "el hijo enseña en el móvil una captura que se deforma (falsa) y luego la ficha AUDITADA ✓"),
    ("dos", "", "la madre con cara de susto; en la tele, una vela roja que choca contra una línea de stop y se para"),
    ("sigueme", "", "«sígueme» grande, botón Seguir y la cuenta auditada"),
    ("tres", "", "la madre con el bolso y la cartera abierta, ojos brillantes; el hijo se lleva la mano a la cara"),
    ("giro", "", "el hijo le pasa el móvil con la cuenta auditada; flecha ↑ LINK EN LA BIO"),
    ("pregunta", "", "bocadillo de comentarios y etiqueta «@mamá»"),
]
