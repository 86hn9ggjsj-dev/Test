"""Reel de alcance (~39 s): la bolsa sube por la escalera y baja en ascensor (caída de 2020).
S&P 500: 3.386 el 19-2-2020 → 2.237 el 23-3-2020 (−33,9 % en 33 días, la caída del 30 % más rápida de su historia);
nuevo máximo de cierre el 18-8-2020 (≈ 148 días después del mínimo)."""

TITULO = "La bolsa sube por la escalera y baja en ascensor"
GUION = [
    ("hook", ["La bolsa sube por la escalera... y baja en ascensor."]),
    ("caida", ["Febrero de 2020. El S&P 500 en máximos.", "En poco más de un mes cae un 34%. La caída de ese tamaño más rápida de su historia."]),
    ("sigueme", ["Si te gusta entender cómo funciona esto de verdad, sígueme."]),
    ("recupera", ["¿Y cuánto tardó en recuperarlo? Casi cinco meses.", "Bajar fue más de cuatro veces más rápido que subir."]),
    ("miedo", ["El miedo vende más rápido de lo que la codicia compra.", "Y en el ascensor es donde la gente vende en el peor momento."]),
    ("plan", ["Si tu plan no está escrito antes de la caída, la caída lo escribe por ti."]),
    ("pregunta", ["¿Tú eres de vender rápido o de aguantar? Cuéntamelo."]),
]

GESTOS = {
    "hook": "[curious] La bolsa sube por la escalera... [short pause] y baja en ascensor.",
    "caida": "Febrero de 2020. El S&P 500 en máximos. En poco más de un mes cae un 34%. La caída de ese tamaño más rápida de su historia.",
    "sigueme": "[warmly] Si te gusta entender cómo funciona esto de verdad, sígueme.",
    "recupera": "[inhales] ¿Y cuánto tardó en recuperarlo? Casi cinco meses. [short pause] Bajar fue más de cuatro veces más rápido que subir.",
    "miedo": "[serious] El miedo vende más rápido de lo que la codicia compra. Y en el ascensor es donde la gente vende en el peor momento.",
    "plan": "[exhales] Si tu plan no está escrito antes de la caída, la caída lo escribe por ti.",
    "pregunta": "[curious] ¿Tú eres de vender rápido o de aguantar? Cuéntamelo.",
}

PANTALLAS = [
    ("hook", "escalera y *ascensor*", "el precio sube escalón a escalón y la cabina del ascensor cae de golpe"),
    ("caida", "*−34 %* en un mes", "el S&P 500 de 2020 hasta el mínimo del 23 de marzo"),
    ("sigueme", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
    ("recupera", "*×4* más rápido", "33 días para caer frente a casi 5 meses para volver"),
    ("miedo", "el *miedo* corre más", "dos relojes: miedo a tope y codicia a medias; ventas amontonadas en el mínimo"),
    ("plan", "escríbelo *antes*", "un plan que se escribe solo en una hoja de alambre"),
    ("pregunta", "¿vender o *aguantar*?", "bocadillo de comentario escribiendo"),
]
