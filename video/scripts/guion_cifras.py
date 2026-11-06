"""Guion del video "Las tres cifras que miro antes de fiarme de un bot" (parte 4): compartido por la síntesis local y por ElevenLabs.

Desde esta parte, el cierre es promo del bot: cuenta auditada en el link de la bio, seguir y escribir por privado.
"""

TITULO = "Las tres cifras que miro antes de fiarme de un bot"
GUION = [
    ("hook", ["Antes de fiarme de un bot, no miro cuánto gana.", "Miro tres cifras.", "Y casi nadie te las enseña."]),
    ("caida", ["Una: la máxima caída.", "Lo que llegó a perder desde su mejor momento.",
               "Si cae un treinta por ciento, la pregunta es: ¿lo aguantarías sin apagarlo?"]),
    ("factor", ["Dos: el factor de beneficio.", "Lo que gana, dividido entre lo que pierde.",
                "Por debajo de uno pierde dinero; muy cerca de uno, cualquier coste lo tumba."]),
    ("operaciones", ["Tres: el número de operaciones.", "Con veinte operaciones, cualquiera tiene suerte.",
                     "Con cientos, empiezas a ver si la ventaja es real."]),
    ("juntas", ["Y míralas juntas: poca caída, buen factor y muchas operaciones.", "Si una falla, desconfía."]),
    ("cierre", ["Un bot serio te enseña estas cifras sin que se las pidas."]),
    ("cta", ["Las del mío están en la cuenta auditada, en el link de la bio.", "Sígueme, y escríbeme si quieres más info."]),
]

# Versión para ElevenLabs v3 con gestos entre corchetes (no se leen); mismas palabras que el guion
GESTOS = {
    "hook": "[inhales] Antes de fiarme de un bot, no miro cuánto gana. [short pause] Miro tres cifras. [softly] Y casi nadie te las enseña.",
    "caida": "Una: la máxima caída. Lo que llegó a perder... desde su mejor momento. [inhales] Si cae un treinta por ciento, la pregunta es: ¿lo aguantarías sin apagarlo?",
    "factor": "Dos: el factor de beneficio. Lo que gana, dividido entre lo que pierde. [exhales] Por debajo de uno pierde dinero; muy cerca de uno... cualquier coste lo tumba.",
    "operaciones": "[inhales] Tres: el número de operaciones. Con veinte operaciones, cualquiera tiene suerte. [short pause] Con cientos... empiezas a ver si la ventaja es real.",
    "juntas": "Y míralas juntas: poca caída, buen factor y muchas operaciones. [short pause] Si una falla... desconfía.",
    "cierre": "[softly] Un bot serio te enseña estas cifras... sin que se las pidas.",
    "cta": "[warmly] Las del mío están en la cuenta auditada, en el link de la bio. [short pause] Sígueme, y escríbeme si quieres más info.",
}

PANTALLAS = [
    ("hook", "no miro cuánto *gana*", "un «+212 %» enorme que se desenfoca; aparecen las tres casillas veladas de la parte 3 y se desvelan"),
    ("caida", "la máxima *caída*", "curva con su pico y su valle; corchete −30 % y un botón APAGAR que tienta y parpadea"),
    ("factor", "factor de *beneficio*", "barras de ganancias frente a barras de pérdidas; la división da 1,8; regla con la zona de 1 donde los costes lo empujan"),
    ("operaciones", "número de *operaciones*", "con 20 puntos la banda de la estimación es enorme; con cientos se estrecha y se ve la ventaja"),
    ("juntas", "míralas *juntas*", "las tres casillas en fila con ✓ ✓ ✓; una pasa a ✕ y todo el panel se apaga"),
    ("cierre", "sin que se las *pidas*", "un informe que se abre solo con las tres cifras"),
    ("cta", "cuenta *auditada*", "ficha de perfil con LINK EN LA BIO ↑ y los botones Seguir y Mensaje"),
]
