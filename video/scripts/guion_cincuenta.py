"""Reel de alcance (~20 s, sin promo hablada): pierdes un 50 % y necesitas un 100 % para recuperarte."""

TITULO = "Pierdes un 50 %: no necesitas un 50 % para recuperarte"
GUION = [
    ("hook", ["Pierdes un 50%.", "¿Cuánto necesitas ganar para recuperarte?"]),
    ("respuesta", ["No es un 50%.", "Es un 100%."]),
    ("ejemplo", ["Tenías 1.000 euros, te quedan 500, y esos 500 tienen que duplicarse."]),
    ("escala", ["Si pierdes un 90%, necesitas ganar un 900%."]),
    ("leccion", ["Por eso, en trading, lo primero no es ganar mucho.", "Es no perder mucho."]),
]

GESTOS = {
    "hook": "[inhales] Pierdes un 50%. ¿Cuánto necesitas ganar para recuperarte?",
    "respuesta": "[short pause] No es un 50%. [short pause] Es un 100%.",
    "ejemplo": "Tenías 1.000 euros, te quedan 500... y esos 500 tienen que duplicarse.",
    "escala": "[exhales] Si pierdes un 90%... necesitas ganar un 900%.",
    "leccion": "Por eso, en trading, lo primero no es ganar mucho. [short pause] Es no perder mucho.",
}

PANTALLAS = [
    ("hook", "−50 % → *¿?*", "un «−50 %» gigante en el centro desde el primer fotograma; una cuenta que se parte por la mitad"),
    ("respuesta", "*+100 %*", "un «+50 %» que se tacha y salta a «+100 %»"),
    ("ejemplo", "1.000 → 500 → *×2*", "diez bloques de 100 €; caen cinco; los cinco que quedan tienen que duplicarse"),
    ("escala", "−90 % → *+900 %*", "barra de pérdida corta frente a una barra de subida que se sale de la pantalla"),
    ("leccion", "no perder *mucho*", "frase final en grande; corta en seco para que el reel se repita"),
]
