"""Guion del video "Cómo se prueba un bot antes de arriesgar un euro" (parte 2): compartido por la síntesis local y por ElevenLabs."""

TITULO = "Cómo se prueba un bot antes de arriesgar un euro"
GUION = [
    ("hook", ["Que un bot gane en el pasado no significa nada.", "Lo que importa es cómo se ha probado."]),
    ("backtest", ["Primero: backtest.", "Pasas el bot por años de datos reales, vela a vela, como si estuviera operando en directo."]),
    ("costes", ["Segundo: costes reales.", "Comisiones, spread y deslizamiento.", "Un bot que gana sin costes, puede perder con ellos."]),
    ("fuera", ["Tercero: datos que no ha visto.", "Lo ajustas con unos años y lo pruebas con otros.", "Si solo funciona donde lo ajustaste, está sobreoptimizado."]),
    ("estres", ["Cuarto: estrés.", "Barajas sus operaciones mil veces y miras la peor racha.", "Si esa caída no la aguantarías, no está listo."]),
    ("demo", ["Quinto: demo.", "Semanas en tiempo real, con dinero ficticio.", "Y compruebas que hace lo mismo que en el backtest."]),
    ("real", ["Y solo entonces, dinero real.", "Poco.", "Y subiendo poco a poco, si los números lo confirman."]),
    ("cta", ["Sígueme, y en el próximo vídeo te enseño los tres errores que hacen que un backtest mienta."]),
]

# Versión para ElevenLabs v3 con gestos entre corchetes (no se leen); mismas palabras que el guion
GESTOS = {
    "hook": "[inhales] Que un bot gane en el pasado... no significa nada. [short pause] Lo que importa es cómo se ha probado.",
    "backtest": "Primero: backtest. [inhales] Pasas el bot por años de datos reales, vela a vela... como si estuviera operando en directo.",
    "costes": "Segundo: costes reales. Comisiones, spread y deslizamiento. [exhales] Un bot que gana sin costes... puede perder con ellos.",
    "fuera": "[inhales] Tercero: datos que no ha visto. Lo ajustas con unos años... y lo pruebas con otros. [short pause] Si solo funciona donde lo ajustaste... está sobreoptimizado.",
    "estres": "Cuarto: estrés. Barajas sus operaciones mil veces y miras la peor racha. [exhales] Si esa caída no la aguantarías... no está listo.",
    "demo": "[inhales] Quinto: demo. Semanas en tiempo real, con dinero ficticio. [short pause] Y compruebas que hace lo mismo que en el backtest.",
    "real": "[softly] Y solo entonces... dinero real. [short pause] Poco. [exhales] Y subiendo poco a poco, si los números lo confirman.",
    "cta": "[warmly] Sígueme, y en el próximo vídeo te enseño los tres errores que hacen que un backtest mienta. [chuckles]",
}

PANTALLAS = [
    ("hook", "gana en el *pasado*", "curva de capital perfecta hasta el plano AHORA; la rentabilidad se tacha y aparece la lista de pruebas"),
    ("backtest", "vela a *vela*", "cabezal que recorre 2019 → 2024 levantando velas; fecha y contador de operaciones"),
    ("costes", "costes *reales*", "curva bruta y neta separándose: comisiones, spread y deslizamiento restan en tres golpes"),
    ("fuera", "datos que *no ha visto*", "línea temporal partida AJUSTE / PRUEBA: perfecta en una mitad, se desploma en la otra"),
    ("estres", "la *peor* racha", "abanico de curvas barajadas; la peor caída resaltada frente a tu límite"),
    ("demo", "igual que el *backtest*", "curva de la demo dibujándose encima de la del backtest, con la desviación medida"),
    ("real", "poco a *poco*", "bloques de capital que crecen 1 → 2 → 4, cada uno confirmado"),
    ("cta", "los tres *errores*", "backtest con tres marcas de error; botón Siguiendo"),
]
