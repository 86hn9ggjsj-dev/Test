"""Reel de alcance (~37 s, Halloween): tres cifras del trading que dan más miedo que Halloween.
×100: un 1 % en contra = 100 % del margen; −50 % necesita +100 %; ESMA (2018): entre el 74 y el 89 % de las cuentas minoristas pierden con CFD."""

TITULO = "Tres cifras del trading que dan más miedo que Halloween"
GUION = [
    ("hook", ["¿Quieres pasar miedo de verdad esta noche?", "Tres cifras del trading que dan más miedo que Halloween."]),
    ("uno", ["Uno: el 1%.", "Con apalancamiento por 100, un 1% en contra se lleva todo lo que has puesto."]),
    ("dos", ["Dos: el 100%.", "Si pierdes la mitad, necesitas doblar lo que te queda solo para volver a empezar."]),
    ("tres", ["Tres: según el regulador europeo, entre 7 y 9 de cada 10 cuentas minoristas pierden dinero con CFD."]),
    ("cura", ["Las tres tienen la misma cura: arriesgar poco en cada operación."]),
    ("cta", ["Sígueme para más cuentas que nadie te hace."]),
]

GESTOS = {
    "hook": "[whispers] ¿Quieres pasar miedo de verdad esta noche? [short pause] Tres cifras del trading que dan más miedo que Halloween.",
    "uno": "[serious] Uno: el 1%. Con apalancamiento por 100, un 1% en contra se lleva todo lo que has puesto.",
    "dos": "Dos: el 100%. Si pierdes la mitad, necesitas doblar lo que te queda solo para volver a empezar.",
    "tres": "[inhales] Tres: según el regulador europeo, entre 7 y 9 de cada 10 cuentas minoristas pierden dinero con CFD.",
    "cura": "[exhales] Las tres tienen la misma cura: arriesgar poco en cada operación.",
    "cta": "[warmly] Sígueme para más cuentas que nadie te hace.",
}

PANTALLAS = [
    ("hook", "¿quieres pasar *miedo*?", "calabaza de alambre que gira y se enciende"),
    ("uno", "*1 %* en contra", "×100: el bloque de la cuenta se vacía entero"),
    ("dos", "*+100 %* para volver", "el bloque se parte por la mitad y hay que doblarlo"),
    ("tres", "*7-9* de cada *10*", "diez cubos; de 7 a 9 se apagan"),
    ("cura", "arriesgar *poco*", "la calabaza se apaga"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
]
