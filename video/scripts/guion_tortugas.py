"""Guion viral "El experimento que convirtió a novatos en traders millonarios" (las tortugas de Richard Dennis, 1983)."""

TITULO = "El experimento que convirtió a novatos en traders millonarios"
GUION = [
    ("hook", ["En 1983, un trader millonario apostó con su socio que podía convertir a gente normal en traders."]),
    ("anuncio", ["Puso un anuncio en el periódico.", "Eligió a un grupo de novatos, y les enseñó un sistema de reglas en dos semanas."]),
    ("reglas", ["Cuándo entrar, cuándo salir, y cuánto arriesgar.", "Nada de intuición."]),
    ("resultado", ["En cinco años, según se cuenta, ganaron más de 175 millones de dólares."]),
    ("tortugas", ["Los llamó las tortugas.", "Y demostraron algo incómodo: el talento importa menos que la disciplina."]),
    ("cta", ["Mi bot hace lo mismo: reglas, sin emociones.", "Tienes su cuenta auditada en la bio.", "Sígueme."]),
]

GESTOS = {
    "hook": "[inhales] En 1983, un trader millonario apostó con su socio que podía convertir a gente normal en traders.",
    "anuncio": "Puso un anuncio en el periódico. [short pause] Eligió a un grupo de novatos, y les enseñó un sistema de reglas en dos semanas.",
    "reglas": "Cuándo entrar, cuándo salir, y cuánto arriesgar. [exhales] Nada de intuición.",
    "resultado": "[short pause] En cinco años, según se cuenta... ganaron más de 175 millones de dólares.",
    "tortugas": "Los llamó las tortugas. [softly] Y demostraron algo incómodo: el talento importa menos que la disciplina.",
    "cta": "[warmly] Mi bot hace lo mismo: reglas, sin emociones. Tienes su cuenta auditada en la bio. Sígueme.",
}

PANTALLAS = [
    ("hook", "gente *normal*", "dos siluetas de alambre que se dan la mano: LA APUESTA, 1983"),
    ("anuncio", "un *anuncio*", "recorte de periódico que se teclea: «SE BUSCAN TRADERS. SIN EXPERIENCIA»; cuadrícula de novatos"),
    ("reglas", "solo *reglas*", "tres reglas que se escriben como código: ENTRAR, SALIR, ARRIESGAR"),
    ("resultado", "*175* millones", "contador que sube a $175.000.000 y curva de 5 años"),
    ("tortugas", "las *tortugas*", "caparazón hexagonal de alambre; TALENTO < DISCIPLINA"),
    ("cta", "reglas, sin *emociones*", "ficha de promo: cuenta auditada en la bio, Seguir y Mensaje"),
]
