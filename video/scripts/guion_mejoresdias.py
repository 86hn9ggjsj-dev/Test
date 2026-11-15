"""Reel 5-30-10 «dopamina» (~42 s): los 10 mejores días de la bolsa (J.P. Morgan Asset Management, Guide to Retirement 2024).

S&P 500 del 3-1-2004 al 29-12-2023: invertido todo el tiempo, 9,8 % al año; sin los 10 mejores días, 5,6 % (casi la mitad).
7 de los 10 mejores días llegaron a menos de dos semanas de los 10 peores. Regla: si sales por pánico, deja escrito antes
en qué precio o fecha vuelves a entrar; si no lo sabes, no vendas.
"""

TITULO = 'Diez días en veinte años: si te los pierdes, ganas casi la mitad'
GANCHO = {'lineas': ['10 días en 20 años', 'valen *la_mitad*'], 'color': 'VERDE'}
GUION = [
    ('hook', ['Diez días en veinte años. Si te los pierdes, ganas casi la mitad.']),
    ('uno', ['Bolsa americana, de 2004 a 2023: un 9,8 % al año sin tocar nada.', 'Sin los diez mejores días, un 5,6.']),
    ('sigueme', ['Sígueme, que lo peor es cuándo llegaron esos días.']),
    ('dos', ['Siete de esos diez llegaron a menos de dos semanas de los peores días.', 'O sea: justo cuando vendiste por miedo.']),
    ('giro', ['La regla: si sales por pánico, escribe antes en qué precio o en qué fecha vuelves a entrar. Si no lo sabes, no vendas.']),
    ('cierre', ['Si has llegado hasta aquí, eres de los que aguantan con plan. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Diez días en veinte años. [short pause] Si te los pierdes, ganas casi la mitad.',
    'uno': 'Bolsa americana, de dos mil cuatro a dos mil veintitrés: un nueve coma ocho por ciento al año sin tocar nada. [serious] Sin los diez mejores días, un cinco coma seis.',
    'sigueme': '[warmly] Sígueme, que lo peor es cuándo llegaron esos días.',
    'dos': '[serious] Siete de esos diez llegaron a menos de dos semanas de los peores días. [short pause] [mischievously] O sea: justo cuando vendiste por miedo.',
    'giro': 'La regla: si sales por pánico, escribe antes en qué precio o en qué fecha vuelves a entrar. [short pause] Si no lo sabes, no vendas.',
    'cierre': '[warmly] Si has llegado hasta aquí, eres de los que aguantan con plan. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: calendario de 20 años (5.000 casillas) pasando a toda velocidad; 10 casillas se encienden en verde'),
    ('uno', "", 'dos contadores: 9,8 % y 5,6 %; tarjeta de la fuente (J.P. Morgan, 2004-2023)'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", 'gráfico con las 10 peores velas rojas y, pegadas, las mejores verdes; stickman que vende en la peor y ve pasar la verde'),
    ('giro', "", 'stickman con una nota «VUELVO A ENTRAR EN…» antes de pulsar VENDER'),
    ('cierre', "", 'móvil: comentario BOT → mensaje directo → cuenta auditada'),
]
