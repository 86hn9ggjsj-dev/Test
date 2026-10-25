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

# Versión para ElevenLabs v3 con gestos naturales entre corchetes (no se leen: el modelo los interpreta como
# entonación, risas, suspiros, susurros o pausas). Las palabras son exactamente las del guion, así que los
# subtítulos y las animaciones se sincronizan igual. Con Multilingual v2 no sirven: leería las etiquetas.
GESTOS = {
    "hook": "[warmly] Un bot de trading no adivina el futuro. [short pause] Hace algo mucho más aburrido... [chuckles] Y por eso es tan útil.",
    "lee": "[curious] Primero: lee el mercado. Cada segundo recibe el precio, el volumen y el spread. [exhales] Miles de datos que tú no podrías seguir.",
    "decide": "[thoughtful] Segundo: decide con reglas. Si el precio rompe este nivel y el volumen acompaña... entra. [short pause] Si no, espera.",
    "protege": "[calm] Tercero: se protege. Antes de abrir, ya sabe cuánto puede perder. [softly] El stop y el tamaño de la posición están calculados.",
    "ejecuta": "[excited] Cuarto: ejecuta. En milisegundos. [whispers] A las tres de la mañana... [confident] o en plena noticia.",
    "emocion": "[sighs] Y lo más importante: no siente miedo ni avaricia. [short pause] Hace lo que se le ha programado. Ni más, ni menos.",
    "codigo": "[softly] Un bot no es magia. [short pause] Es disciplina convertida en código.",
    "cta": "[warmly] Sígueme, y en el próximo vídeo te enseño cómo se prueba un bot antes de arriesgar un solo euro. [chuckles]",
}
