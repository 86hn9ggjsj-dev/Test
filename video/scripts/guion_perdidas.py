"""Guion viral "Pierdes un 50 %: ¿cuánto necesitas para recuperarte?" (la asimetría de las pérdidas)."""

TITULO = "Pierdes un 50 %: ¿cuánto necesitas para recuperarte?"
GUION = [
    ("hook", ["Pierdes un 50%.", "¿Cuánto tienes que ganar para recuperarte?", "Si has pensado un 50%, sigue mirando."]),
    ("ejemplo", ["Tienes 1.000 euros y pierdes la mitad.", "Te quedan 500."]),
    ("recupera", ["Para volver a 1.000, esos 500 tienen que duplicarse.", "Necesitas ganar un 100%."]),
    ("escalera", ["Si pierdes un 20%, necesitas un 25%.", "Si pierdes un 50%, un 100%.", "Y si pierdes un 90%, necesitas ganar un 900%."]),
    ("leccion", ["Las pérdidas pesan más que las ganancias.", "Por eso, en trading, lo primero no es ganar mucho.", "Es no perder mucho."]),
    ("cta", ["Mi bot arriesga poco en cada operación, y tienes su cuenta auditada en la bio.", "Sígueme para más."]),
]

GESTOS = {
    "hook": "[inhales] Pierdes un 50%. ¿Cuánto tienes que ganar para recuperarte? [short pause] Si has pensado un 50%... sigue mirando.",
    "ejemplo": "Tienes 1.000 euros y pierdes la mitad. Te quedan 500.",
    "recupera": "Para volver a 1.000, esos 500 tienen que duplicarse. [exhales] Necesitas ganar un 100%.",
    "escalera": "Si pierdes un 20%, necesitas un 25%. Si pierdes un 50%, un 100%. [short pause] Y si pierdes un 90%... necesitas ganar un 900%.",
    "leccion": "[softly] Las pérdidas pesan más que las ganancias. Por eso, en trading, lo primero no es ganar mucho. [short pause] Es no perder mucho.",
    "cta": "[warmly] Mi bot arriesga poco en cada operación, y tienes su cuenta auditada en la bio. Sígueme para más.",
}

PANTALLAS = [
    ("hook", "−50 % → *¿+50 %?*", "un «−50 %» enorme y un «+50 %» que se tacha; la pregunta en pantalla"),
    ("ejemplo", "*1.000* € → 500 €", "una columna de 10 bloques de 100 € de la que caen 5"),
    ("recupera", "hay que *duplicar*", "los 5 bloques tienen que volver a ser 10: ×2 = +100 %"),
    ("escalera", "la *escalera*", "barras de pérdida (−20, −50, −90) frente a la subida necesaria (+25, +100, +900) que se dispara fuera de pantalla"),
    ("leccion", "no perder *mucho*", "una balanza donde la pérdida pesa más que la ganancia del mismo tamaño"),
    ("cta", "arriesga *poco*", "ficha de promo: cuenta auditada en la bio, Seguir y Mensaje"),
]
