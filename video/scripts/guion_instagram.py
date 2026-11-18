"""Reel de alcance (~40 s): por qué los traders de Instagram parecen ganar siempre (sesgo de supervivencia).
P(10 caras seguidas) = 1/1.024; entre 1.000 personas, P(al menos una) = 1 − (1023/1024)^1000 ≈ 0,62."""

TITULO = "¿Por qué todos los traders de Instagram parecen ganar siempre?"
GUION = [
    ("hook", ["¿Por qué todos los traders de Instagram parecen ganar siempre?", "Estadística."]),
    ("monedas", ["Pon a mil personas a lanzar una moneda diez veces.", "Lo más probable es que una saque diez caras seguidas."]),
    ("pregunta", ["Antes de seguir, sé sincero: ¿cuántos cursos de trading has comprado?", "Te leo en comentarios."]),
    ("suerte", ["Ese no es un genio. Es suerte.", "Pero es el único que ves, porque los otros 999 no suben vídeos."]),
    ("giro", ["Diez aciertos seguidos no demuestran nada. Lo que demuestra algo es una cuenta auditada."]),
    ("cierre", ["Antes de fiarte de alguien, pídele la suya.", "La de mi bot está en la bio."]),
    ("cta", ["Sígueme para más cuentas que nadie te hace."]),
]

GESTOS = {
    "hook": "[curious] ¿Por qué todos los traders de Instagram parecen ganar siempre? [short pause] Estadística.",
    "monedas": "Pon a mil personas a lanzar una moneda diez veces. [short pause] Lo más probable es que una saque diez caras seguidas.",
    "pregunta": "[curious] Antes de seguir, sé sincero: ¿cuántos cursos de trading has comprado? Te leo en comentarios.",
    "suerte": "[inhales] Ese no es un genio. Es suerte. Pero es el único que ves, porque los otros 999 no suben vídeos.",
    "giro": "[serious] Diez aciertos seguidos no demuestran nada. Lo que demuestra algo es una cuenta auditada.",
    "cierre": "[exhales] Antes de fiarte de alguien, pídele la suya. [short pause] La de mi bot está en la bio.",
    "cta": "[warmly] Sígueme para más cuentas que nadie te hace.",
}

PANTALLAS = [
    ("hook", "¿por qué *siempre* ganan?", "móvil de alambre con una curva que solo sube"),
    ("monedas", "*1* de *1.000*", "mil puntos; en cada tirada se apagan los que sacan cruz hasta que queda uno"),
    ("pregunta", "¿cuántos *cursos*?", "bocadillo de comentario escribiendo"),
    ("suerte", "es *suerte*", "el punto que queda brilla; los otros 999 se apagan"),
    ("giro", "cuenta *auditada*", "diez ✓ tachados y un certificado con sello"),
    ("cierre", "en la *bio*", "«cuenta auditada del bot en la bio»"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
]
