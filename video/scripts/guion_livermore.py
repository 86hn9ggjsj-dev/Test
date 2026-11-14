"""Reel de alcance (~36 s) con historia real: Jesse Livermore.

Datos: se puso corto antes del crac de 1929 y ganó unos 100 millones de dólares; era el especulador más famoso de Wall
Street y tenía reglas de operativa conocidas; en 1934 se declaró en bancarrota. Consejo: leer tus reglas antes de cada
operación y ser más estricto cuanto más ganas.
"""

TITULO = 'En 1929 ganó 100 millones con el crac; en 1934 estaba en bancarrota'
GUION = [
    ('hook', ['En 1929, mientras medio mundo se arruinaba, un hombre ganó 100 millones de dólares.']),
    ('uno', ['Jesse Livermore apostó a que la bolsa caería y acertó de lleno.', 'Era el especulador más famoso de Wall Street, y tenía sus propias reglas.']),
    ('dos', ['Pero con tanto dinero, la confianza le creció más que el respeto por esas reglas.']),
    ('sigueme', ['Sígueme, que el final no te lo esperas.']),
    ('tres', ['En 1934, cinco años después, estaba en bancarrota.']),
    ('giro', ['Consejo: tus reglas no sirven en un cuaderno. Léelas antes de cada operación.', 'Y cuanto más ganes, más estricto.']),
    ('pregunta', ['¿Cuál es la regla que más te saltas tú? Mándaselo al que tiene un plan... y nunca lo cumple.']),
]

GESTOS = {
    'hook': '[curious] En mil novecientos veintinueve, mientras medio mundo se arruinaba... [short pause] un hombre ganó cien millones de dólares.',
    'uno': 'Jesse Livermore apostó a que la bolsa caería... y acertó de lleno. [short pause] Era el especulador más famoso de Wall Street, y tenía sus propias reglas.',
    'dos': '[inhales] Pero con tanto dinero... la confianza le creció más que el respeto por esas reglas.',
    'sigueme': '[warmly] Sígueme, que el final no te lo esperas.',
    'tres': '[serious] En mil novecientos treinta y cuatro, cinco años después... [short pause] estaba en bancarrota.',
    'giro': '[serious] Consejo: tus reglas no sirven en un cuaderno. Léelas antes de cada operación. [short pause] Y cuanto más ganes, más estricto.',
    'pregunta': '[curious] ¿Cuál es la regla que más te saltas tú? Mándaselo al que tiene un plan... y nunca lo cumple.',
}

PANTALLAS = [
    ('hook', "", 'Wall Street 1929 en wireframe con la cinta de cotizaciones; gente cayendo en rojo y un stickman con sombrero en el centro con +100.000.000 $'),
    ('uno', "", 'gráfico del Dow de 1929 desplomándose con la flecha CORTO ↓; libreta «MIS REGLAS» bajo el brazo'),
    ('dos', "", 'el stickman crece de tamaño (confianza) mientras la libreta encoge'),
    ('sigueme', "", '«sígueme» grande, botón Seguir y cuenta auditada'),
    ('tres', "", 'calendario que salta de 1929 a 1934; sello BANCARROTA; el stickman vuelve a su tamaño, solo'),
    ('giro', "", 'checklist de reglas que se repasa antes de pulsar COMPRAR; un candado que se aprieta cuando sube el saldo'),
    ('pregunta', "", 'lista de reglas con una casilla sin marcar parpadeando y bocadillo de comentarios'),
]
