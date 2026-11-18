"""Reel de alcance (~28 s): tres frases que dice un trader justo antes de quemar la cuenta (con stickman)."""

TITULO = "Tres frases que dice un trader justo antes de quemar la cuenta"
GUION = [
    ("hook", ["Tres frases que dice un trader justo antes de quemar la cuenta.", "La tercera duele."]),
    ("una", ["Una: «Esta vez es diferente.»"]),
    ("dos", ["Dos: «Ya volverá.»", "Y no vuelve."]),
    ("sigueme", ["Sígueme si alguna te suena."]),
    ("tres", ["Y tres: «Solo una más para recuperar... y lo dejo.»"]),
    ("giro", ["Ninguna es una estrategia.", "Son excusas para no aceptar una pérdida pequeña... hasta que es grande."]),
    ("pregunta", ["¿Cuál has dicho tú? Y envíaselo a quien dice la tercera."]),
]

GESTOS = {
    "hook": "[curious] Tres frases que dice un trader justo antes de quemar la cuenta. [short pause] La tercera duele.",
    "una": "Una: «Esta vez es diferente.»",
    "dos": "Dos: «Ya volverá.» [short pause] Y no vuelve.",
    "sigueme": "[warmly] Sígueme si alguna te suena.",
    "tres": "[inhales] Y tres: «Solo una más para recuperar... y lo dejo.»",
    "giro": "[serious] Ninguna es una estrategia. Son excusas para no aceptar una pérdida pequeña... hasta que es grande.",
    "pregunta": "[curious] ¿Cuál has dicho tú? Y envíaselo a quien dice la tercera.",
}

PANTALLAS = [
    ("hook", "*3 frases*", "stickman ante su monitor mientras el saldo baja"),
    ("una", "«esta vez es *diferente*»", "el stickman, confiado, señala la pantalla; el mismo dibujo de siempre y cae"),
    ("dos", "«ya *volverá*»", "sentado esperando con el reloj girando; el precio no vuelve y se hunde"),
    ("sigueme", "*sígueme*", "botón Seguir que se pulsa; el stickman lo señala"),
    ("tres", "«solo *una más*»", "clica sin parar, el lote se dobla y el saldo llega a 0 €: manos a la cabeza"),
    ("giro", "*excusas*", "una pérdida pequeña que crece como una bola de nieve y aplasta al stickman"),
    ("pregunta", "¿cuál has *dicho*?", "bocadillo de comentario y el stickman encogiéndose de hombros"),
]
