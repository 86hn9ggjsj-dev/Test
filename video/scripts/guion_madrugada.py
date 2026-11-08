"""Reel de promo del bot (~38 s): las tres de la mañana, una noticia mueve el precio y tú duermes (o decides con miedo).

Escenario hipotético (no un hecho concreto). Afirmaciones sobre el bot (verdaderas y ya usadas): opera igual a las tres
de la mañana o en plena noticia; el stop y el tamaño se deciden antes de entrar; no siente miedo; cuenta auditada en la bio.
"""

TITULO = "Tres de la mañana: sale una noticia y tú estás dormido"
GUION = [
    ("hook", ["Tres de la mañana.", "Sale una noticia y el precio se mueve un dos por ciento en un minuto."]),
    ("uno", ["Tú estás dormido. Te despiertas, miras el móvil... y ya es tarde."]),
    ("dos", ["O peor: estás despierto y decides con sueño y con miedo."]),
    ("sigueme", ["Sígueme, y mira lo que hace un bot a esa hora."]),
    ("tres", ["Lo mismo que a mediodía: el stop y el tamaño ya estaban decididos antes de entrar."]),
    ("giro", ["No es más listo que tú: no duerme y no tiene miedo.", "El mío opera así, y su cuenta auditada está en la bio."]),
    ("pregunta", ["¿Te ha pillado alguna noticia durmiendo? Pásaselo al que duerme con el móvil en la mano."]),
]

GESTOS = {
    "hook": "[whispers] Tres de la mañana. [short pause] [curious] Sale una noticia y el precio se mueve un dos por ciento en un minuto.",
    "uno": "Tú estás dormido. Te despiertas, miras el móvil... [short pause] y ya es tarde.",
    "dos": "[serious] O peor: estás despierto y decides con sueño y con miedo.",
    "sigueme": "[warmly] Sígueme, y mira lo que hace un bot a esa hora.",
    "tres": "[inhales] Lo mismo que a mediodía: el stop y el tamaño ya estaban decididos antes de entrar.",
    "giro": "[serious] No es más listo que tú: no duerme y no tiene miedo. [short pause] [warmly] El mío opera así, y su cuenta auditada está en la bio.",
    "pregunta": "[curious] ¿Te ha pillado alguna noticia durmiendo? Pásaselo al que duerme con el móvil en la mano.",
}

PANTALLAS = [
    ("hook", "", "dormitorio 3D de noche, reloj digital 03:00 y luna en la ventana; el móvil vibra con «ÚLTIMA HORA» y una vela enorme"),
    ("uno", "", "el stickman duerme (zzz); se despierta, coge el móvil y la cara se le ilumina en rojo"),
    ("dos", "", "el stickman despierto con ojeras, el dedo temblando encima de VENDER"),
    ("sigueme", "", "«sígueme» grande, botón Seguir y la cuenta auditada; el robot señala"),
    ("tres", "", "el robot en su mesa; línea de stop y tamaño ya dibujados; el precio llega, toca y se cierra con calma; reloj 03:00 = 12:00"),
    ("giro", "", "a la izquierda el stickman dormido, a la derecha el robot despierto; ficha AUDITADA ✓ y flecha ↑ LINK EN LA BIO"),
    ("pregunta", "", "móvil en la mano del que duerme y bocadillo de comentarios"),
]
