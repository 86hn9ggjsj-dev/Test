"""Guion del video "Los tres errores que hacen que un backtest mienta" (parte 3): compartido por la síntesis local y por ElevenLabs."""

TITULO = "Los tres errores que hacen que un backtest mienta"
GUION = [
    ("hook", ["Tu backtest gana dinero todos los años.", "Y casi seguro, te está mintiendo."]),
    ("futuro", ["Error uno: mirar el futuro.", "El bot decide con el cierre de la vela, pero entra antes de que cierre.",
                "En el backtest acierta siempre; en real, nunca podría."]),
    ("supervivencia", ["Error dos: probar solo lo que sobrevivió.", "Usas las acciones que hoy siguen en bolsa, y te olvidas de las que quebraron.",
                       "Así, cualquier estrategia parece buena."]),
    ("suerte", ["Error tres: probar mil versiones.", "Si cambias los ajustes hasta que sale bien, alguna gana por pura suerte.",
                "Eso no es una estrategia: es una lotería."]),
    ("alarma", ["La señal de alarma: una curva demasiado perfecta.", "En los mercados, lo perfecto casi nunca es real."]),
    ("cierre", ["Un buen backtest no te dice cuánto vas a ganar.", "Te dice si tu idea sobrevive a la realidad."]),
    ("cta", ["Sígueme, y en el próximo vídeo te enseño las tres cifras que miro antes de fiarme de un bot."]),
]

# Versión para ElevenLabs v3 con gestos entre corchetes (no se leen); mismas palabras que el guion
GESTOS = {
    "hook": "[inhales] Tu backtest gana dinero todos los años. [short pause] Y casi seguro... te está mintiendo.",
    "futuro": "Error uno: mirar el futuro. [inhales] El bot decide con el cierre de la vela... pero entra antes de que cierre. [exhales] En el backtest acierta siempre; en real, nunca podría.",
    "supervivencia": "[inhales] Error dos: probar solo lo que sobrevivió. Usas las acciones que hoy siguen en bolsa... y te olvidas de las que quebraron. [short pause] Así, cualquier estrategia parece buena.",
    "suerte": "Error tres: probar mil versiones. [inhales] Si cambias los ajustes hasta que sale bien, alguna gana... por pura suerte. [chuckles] Eso no es una estrategia: es una lotería.",
    "alarma": "[softly] La señal de alarma: una curva demasiado perfecta. [short pause] En los mercados, lo perfecto... casi nunca es real.",
    "cierre": "[inhales] Un buen backtest no te dice cuánto vas a ganar. [short pause] Te dice si tu idea... sobrevive a la realidad.",
    "cta": "[warmly] Sígueme, y en el próximo vídeo te enseño las tres cifras que miro antes de fiarme de un bot. [chuckles]",
}

PANTALLAS = [
    ("hook", "te está *mintiendo*", "barras anuales todas en positivo y una curva impecable; al decir «mintiendo» se agrieta y asoma la curva real debajo"),
    ("futuro", "mirar el *futuro*", "vela que aún se está formando con su reloj; la decisión usa un cierre que todavía no existe; ENTRADA antes del cierre → IMPOSIBLE ✕"),
    ("supervivencia", "solo lo que *sobrevivió*", "rejilla de 40 empresas; la mitad se apaga y cae (quebraron); la curva con las vivas sube, la de todas baja"),
    ("suerte", "*mil* versiones", "abanico de 1.000 curvas de puro azar; una sube sola y se resalta: LA MEJOR DE 1.000 → LOTERÍA"),
    ("alarma", "demasiado *perfecta*", "curva casi recta con su ajuste R² 0,99 y un aviso que parpadea"),
    ("cierre", "¿*sobrevive* a la realidad?", "la idea atraviesa tres planos (futuro, supervivencia, suerte) y solo sale lo que aguanta"),
    ("cta", "las tres *cifras*", "botón Siguiendo y tres casillas de métricas veladas que se insinúan sin revelarse"),
]
