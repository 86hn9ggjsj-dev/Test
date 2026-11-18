"""Reel de alcance (~40 s): una tragaperras y un gráfico de un minuto enganchan con el mismo truco (recompensa variable).
Fiorillo, Tobler y Schultz (2003): la actividad sostenida de las neuronas de dopamina es máxima con un premio incierto (p = 0,5)."""

TITULO = "Una tragaperras y un gráfico de un minuto tienen el mismo truco"
GUION = [
    ("hook", ["Una tragaperras y un gráfico de un minuto tienen el mismo truco.", "Y te está enganchando."]),
    ("dopamina", ["Tu cerebro suelta dopamina cuando espera un premio.", "Y suelta más cuando no sabe si llegará."]),
    ("sigueme", ["Guarda este vídeo y sígueme para más cuentas que nadie te hace."]),
    ("patron", ["Una tragaperras no paga siempre: paga a veces, sin patrón. Eso es lo que más engancha.",
                "Y en un gráfico de un minuto pasa igual: velas que a veces te dan y a veces te quitan."]),
    ("operas", ["Por eso operas de más. No buscas oportunidades: buscas el subidón."]),
    ("reglas", ["La solución no es fuerza de voluntad, son reglas.", "Por eso yo uso un bot: no necesita dopamina."]),
    ("pregunta", ["Sé sincero: ¿cuántas veces has mirado el gráfico hoy?"]),
]

GESTOS = {
    "hook": "[curious] Una tragaperras y un gráfico de un minuto tienen el mismo truco. [short pause] Y te está enganchando.",
    "dopamina": "Tu cerebro suelta dopamina cuando espera un premio. Y suelta más cuando no sabe si llegará.",
    "sigueme": "[warmly] Guarda este vídeo y sígueme para más cuentas que nadie te hace.",
    "patron": "[inhales] Una tragaperras no paga siempre: paga a veces, sin patrón. Eso es lo que más engancha. [short pause] Y en un gráfico de un minuto pasa igual: velas que a veces te dan y a veces te quitan.",
    "operas": "[serious] Por eso operas de más. No buscas oportunidades: buscas el subidón.",
    "reglas": "[exhales] La solución no es fuerza de voluntad, son reglas. Por eso yo uso un bot: no necesita dopamina.",
    "pregunta": "[curious] Sé sincero: ¿cuántas veces has mirado el gráfico hoy?",
}

PANTALLAS = [
    ("hook", "el mismo *truco*", "tragaperras de alambre con los rodillos girando sobre un gráfico de velas"),
    ("dopamina", "*dopamina*", "curva de dopamina según la probabilidad del premio: máxima en el 50 %"),
    ("sigueme", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
    ("patron", "*sin patrón*", "los rodillos paran al azar y a veces dan premio; luego velas que dan y quitan"),
    ("operas", "el *subidón*", "contador de operaciones del día que se dispara sobre el gráfico"),
    ("reglas", "*reglas*", "reglas que se escriben solas y un robot de alambre: dopamina 0"),
    ("pregunta", "¿cuántas *veces*?", "bocadillo de comentario escribiendo"),
]
