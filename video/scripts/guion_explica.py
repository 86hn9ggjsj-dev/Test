"""Guion del video "Qué hace de verdad un bot de trading": compartido por la síntesis local y por ElevenLabs."""

TITULO = "Qué hace de verdad un bot de trading"
GUION = [
    ("hook", ["Un bot de trading no adivina el futuro.", "Hace algo mucho más aburrido.", "Y por eso es tan útil."]),
    ("lee", ["Primero: lee el mercado.", "Cada segundo recibe el precio, el volumen y el spread.", "Miles de datos que tú no podrías seguir."]),
    ("decide", ["Segundo: decide con reglas.", "Si el precio rompe este nivel y el volumen acompaña, entra.", "Si no, espera."]),
    ("protege", ["Tercero: se protege.", "Antes de abrir, ya sabe cuánto puede perder.", "El stop y el tamaño de la posición están calculados."]),
    ("ejecuta", ["Cuarto: ejecuta.", "En milisegundos.", "A las tres de la mañana, o en plena noticia."]),
    ("emocion", ["Y lo más importante: no siente miedo ni avaricia.", "Hace lo que se le ha programado.", "Ni más, ni menos."]),
    ("codigo", ["Un bot no es magia.", "Es disciplina convertida en código."]),
    ("cta", ["Sígueme, y en el próximo vídeo te enseño cómo se prueba un bot antes de arriesgar un solo euro."]),
]

# Versión para ElevenLabs v3 con gestos naturales entre corchetes (no se leen): respiraciones antes de las frases
# largas, exhalaciones al cerrar una idea, alguna risita y titubeos con "...". Pocas etiquetas de emoción: con
# demasiadas suena actuado. Las palabras son exactamente las del guion, así que la sincronización no cambia.
# Con Multilingual v2 no sirven: leería las etiquetas.
GESTOS = {
    "hook": "[inhales] Un bot de trading no adivina el futuro. [short pause] Hace algo... mucho más aburrido. [chuckles] Y por eso es tan útil.",
    "lee": "Primero: lee el mercado. Cada segundo recibe el precio, el volumen... y el spread. [exhales] Miles de datos que tú no podrías seguir.",
    "decide": "[inhales] Segundo: decide con reglas. Si el precio rompe este nivel, y el volumen acompaña... entra. [short pause] Si no... espera.",
    "protege": "Tercero: se protege. Antes de abrir, ya sabe cuánto puede perder. [exhales] El stop y el tamaño de la posición... están calculados.",
    "ejecuta": "[inhales] Cuarto: ejecuta. En milisegundos. [short pause] A las tres de la mañana... [softly] o en plena noticia.",
    "emocion": "[sighs] Y lo más importante: [short pause] no siente miedo, ni avaricia. [exhales] Hace lo que se le ha programado. Ni más... ni menos.",
    "codigo": "[softly] Un bot no es magia. [inhales] Es disciplina... convertida en código.",
    "cta": "[warmly] Sígueme, y en el próximo vídeo te enseño cómo se prueba un bot... antes de arriesgar un solo euro. [chuckles]",
}
