"""Guion del video "Cómo detectar un bot estafa en 30 segundos" (parte 5): compartido por la síntesis local y por ElevenLabs.

El cierre es promo del bot: cuenta auditada en el link de la bio, seguir y escribir por privado.
"""

TITULO = "Cómo detectar un bot estafa en 30 segundos"
GUION = [
    ("hook", ["Hay bots que prometen hacerte rico mientras duermes.", "Así detectas una estafa en treinta segundos."]),
    ("garantia", ["Uno: te garantiza rentabilidad.", "Un diez por ciento al mes, fijo.", "En los mercados nadie puede garantizar nada."]),
    ("capturas", ["Dos: solo enseña capturas.", "Una captura se edita en un minuto.", "Lo que vale es una cuenta auditada por un tercero."]),
    ("martingala", ["Tres: la curva es perfecta, hasta que deja de serlo.", "Muchos doblan la posición cada vez que pierden.",
                    "Ganan meses seguidos, y un día lo pierden todo."]),
    ("prisa", ["Cuatro: te mete prisa.", "Plazas limitadas, oferta que acaba hoy, o que traigas amigos para ganar más.",
               "Eso no es trading: es marketing."]),
    ("cierre", ["Un bot de verdad te enseña sus números.", "Los buenos y los malos."]),
    ("cta", ["Por eso la cuenta de mi bot está auditada, y tienes el link en la bio.", "Sígueme, y escríbeme si quieres más info."]),
]

# Versión para ElevenLabs v3 con gestos entre corchetes (no se leen); mismas palabras que el guion
GESTOS = {
    "hook": "[inhales] Hay bots que prometen hacerte rico mientras duermes. [short pause] Así detectas una estafa... en treinta segundos.",
    "garantia": "Uno: te garantiza rentabilidad. Un diez por ciento al mes, fijo. [exhales] En los mercados... nadie puede garantizar nada.",
    "capturas": "[inhales] Dos: solo enseña capturas. Una captura se edita en un minuto. [short pause] Lo que vale es una cuenta auditada por un tercero.",
    "martingala": "Tres: la curva es perfecta... hasta que deja de serlo. [inhales] Muchos doblan la posición cada vez que pierden. Ganan meses seguidos... [softly] y un día lo pierden todo.",
    "prisa": "Cuatro: te mete prisa. Plazas limitadas, oferta que acaba hoy, o que traigas amigos para ganar más. [chuckles] Eso no es trading: es marketing.",
    "cierre": "[softly] Un bot de verdad te enseña sus números. [short pause] Los buenos... y los malos.",
    "cta": "[warmly] Por eso la cuenta de mi bot está auditada, y tienes el link en la bio. [short pause] Sígueme, y escríbeme si quieres más info.",
}

PANTALLAS = [
    ("hook", "detectar una *estafa*", "un anuncio de «BOT 10 % MENSUAL» que se escanea con una retícula; cronómetro de 30 s en marcha"),
    ("garantia", "rentabilidad *garantizada*", "una recta perfecta de +10 % al mes con el sello GARANTIZADO, que se tacha"),
    ("capturas", "solo *capturas*", "una captura cuyas cifras cambian con un cursor; al lado, la ficha AUDITADA POR UN TERCERO ✓"),
    ("martingala", "perfecta hasta que *no*", "posiciones que se doblan 1 → 2 → 4 → 8 → 16 mientras la curva sube lisa… y cae a cero"),
    ("prisa", "te mete *prisa*", "cuenta atrás, PLAZAS: 3 y una pirámide de referidos que crece"),
    ("cierre", "los buenos y los *malos*", "una curva real con sus caídas marcadas, sin esconder ninguna"),
    ("cta", "cuenta *auditada*", "ficha de perfil con LINK EN LA BIO ↑ y los botones Seguir y Mensaje"),
]
