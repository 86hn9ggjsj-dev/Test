"""Reel con historia real (~32 s, formato nuevo): Bill Hwang y Archegos Capital (marzo de 2021).

Datos: el family office de Bill Hwang tenía posiciones muy concentradas en unas pocas acciones (ViacomCBS, Discovery,
Baidu…) y muy apalancadas con derivados; cuando una cayó, los bancos pidieron garantías, no pudo cubrirlas y liquidaron
sus posiciones; su fortuna, unos 20.000 millones de dólares, desapareció en dos días; los bancos perdieron más de 10.000
millones (Credit Suisse unos 5.500, Nomura unos 2.900); en noviembre de 2024 fue condenado a 18 años de cárcel por fraude
y manipulación de mercado.
"""

TITULO = 'Perdió 20.000 millones de dólares en dos días'
# Titular escrito del primer fotograma (formato nuevo): líneas con *palabras clave*
GANCHO = {'lineas': ['Perdió *20.000_millones*', 'en *2_días*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Este hombre perdió 20.000 millones de dólares en 2 días.', 'Y casi nadie sabía ni cómo se llamaba.']),
    ('uno', ['Bill Hwang, 2021. Su fondo apostó casi todo a un puñado de acciones... con dinero prestado. Mucho.']),
    ('dos', ['Mientras subían, era un genio.']),
    ('sigueme', ['Sígueme, que ahora viene la caída.']),
    ('tres', ['Una cae. Los bancos le piden más garantías. No las tiene. Y lo venden todo de golpe.']),
    ('giro', ['Acabó condenado a 18 años de cárcel.', 'Muy concentrado y muy apalancado: no hace falta equivocarte mucho. Basta una vez.']),
    ('pregunta', ['¿Cuánto metes tú en una sola operación? Mándaselo al del todo o nada.']),
]

GESTOS = {
    'hook': '[curious] Este hombre perdió veinte mil millones de dólares en dos días. [whispers] Y casi nadie sabía ni cómo se llamaba.',
    'uno': 'Bill Hwang, dos mil veintiuno. Su fondo apostó casi todo a un puñado de acciones... con dinero prestado. [serious] Mucho.',
    'dos': '[mischievously] Mientras subían, era un genio.',
    'sigueme': '[warmly] Sígueme, que ahora viene la caída.',
    'tres': '[inhales] Una cae. Los bancos le piden más garantías. No las tiene. [serious] Y lo venden todo de golpe.',
    'giro': 'Acabó condenado a dieciocho años de cárcel. [short pause] Muy concentrado y muy apalancado: no hace falta equivocarte mucho. Basta una vez.',
    'pregunta': '[curious] ¿Cuánto metes tú en una sola operación? Mándaselo al del todo o nada.',
}

PANTALLAS = [
    ('hook', "", 'fotograma 0: contador gigante −20.000.000.000 $ cayendo y un stickman con traje (corbata) de espaldas; reloj «48 H»; silueta con «?» por nombre'),
    ('uno', "", 'cinco torres de acciones altísimas sobre una base diminuta («SUYO») y un bloque enorme translúcido («PRESTADO») debajo'),
    ('dos', "", 'las torres suben y él crece con corona; todo verde puntual'),
    ('sigueme', "", '«sígueme» encima de la escena, que sigue viva y desenfocada'),
    ('tres', "", 'una torre se agrieta y cae; teléfonos de los bancos sonando («MÁS GARANTÍAS»); manos que retiran todas las torres a la vez'),
    ('giro', "", 'barrotes que bajan con «18 AÑOS»; luego regla visual: una sola columna enorme frente a muchas pequeñas'),
    ('pregunta', "", 'barra «% DE TU CUENTA EN UNA OPERACIÓN» que se desliza de 1 % a 100 % y bocadillo de comentarios'),
]
