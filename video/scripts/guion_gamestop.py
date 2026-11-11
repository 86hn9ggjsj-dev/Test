"""Reel con historia real (5-30-10, ~43 s): GameStop y Melvin Capital (enero de 2021).

Datos: Melvin Capital gestionaba unos 12.500 millones de dólares a principios de 2021 y estaba corto en GameStop; la
acción cerró 2020 en 18,84 $ y llegó a 483 $ intradía el 28 de enero de 2021 (precios antes del desdoblamiento de 2022),
empujada en parte por pequeños inversores de Reddit (r/wallstreetbets); Melvin perdió un 53 % en enero, recibió una
inyección de 2.750 millones de Citadel y Point72 el 25 de enero y anunció su cierre en mayo de 2022.
Idea única: comprando, como mucho pierdes lo que pusiste; vendiendo en corto, la pérdida no tiene techo.
"""

TITULO = 'Un fondo de 12.000 millones perdió la mitad en un mes'
GANCHO = {'lineas': ['Un fondo de *12.000_millones*', 'perdió *la_mitad* en un mes'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Un fondo de 12.000 millones perdió la mitad en un mes.', 'Contra una tienda de videojuegos.']),
    ('uno', ['En enero de 2021, Melvin Capital vendía GameStop en corto: ganaba si la acción caía.']),
    ('dos', ['Pero miles de pequeños inversores de Reddit empezaron a comprar.', 'Y la acción pasó de unos 20 dólares a más de 400.']),
    ('sigueme', ['Sígueme, que aquí está la trampa.']),
    ('tres', ['Si compras, como mucho pierdes lo que pusiste.', 'Si vendes en corto, la pérdida no tiene techo.', 'Necesitaron una inyección de 2.750 millones. Al año siguiente, cerraron.']),
    ('giro', ['La solución: si vendes en corto, el stop va puesto antes de entrar. Sin excepciones.']),
    ('cierre', ['Si sigues aquí, te interesa de verdad.', 'Comenta BOT y te explico por privado cómo gestiono yo el riesgo, y te paso la cuenta auditada de mi bot.']),
]

GESTOS = {
    'hook': '[curious] Un fondo de doce mil millones perdió la mitad en un mes. [mischievously] Contra una tienda de videojuegos.',
    'uno': 'En enero de dos mil veintiuno, Melvin Capital vendía GameStop en corto: ganaba si la acción caía.',
    'dos': '[inhales] Pero miles de pequeños inversores de Reddit empezaron a comprar. [excited] Y la acción pasó de unos veinte dólares a más de cuatrocientos.',
    'sigueme': '[warmly] Sígueme, que aquí está la trampa.',
    'tres': '[serious] Si compras, como mucho pierdes lo que pusiste. Si vendes en corto, la pérdida no tiene techo. [short pause] Necesitaron una inyección de dos mil setecientos cincuenta millones. Al año siguiente, cerraron.',
    'giro': 'La solución: si vendes en corto, el stop va puesto antes de entrar. [serious] Sin excepciones.',
    'cierre': '[warmly] Si sigues aquí, te interesa de verdad. Comenta BOT y te explico por privado cómo gestiono yo el riesgo, y te paso la cuenta auditada de mi bot.',
}

PANTALLAS = [
    ('hook', "", 'fotograma 0: rascacielos de cristal de un fondo con un contador que se desploma −53 %; al lado, una tienda de videojuegos con su escaparate y mandos'),
    ('uno', "", 'despacho del fondo con pantallas; flecha hacia abajo sobre la acción GME: «GANA SI CAE»'),
    ('dos', "", 'avalancha de móviles con el icono del alien de Reddit pulsando COMPRAR; vela verde gigante 20 $ → 400 $+ que atraviesa el techo del despacho'),
    ('sigueme', "", '«sígueme» encima de la escena, que sigue viva y desenfocada'),
    ('tres', "", 'dos ascensores: COMPRAR con suelo (−100 % como mucho) y CORTO sin techo (+∞); maletín «2.750 M» entrando; cartel «CERRADO»'),
    ('giro', "", 'stop rojo como un tope en el hueco del ascensor que no deja subir más'),
    ('cierre', "", 'caja de comentario que escribe «BOT», se envía, llega el mensaje directo y la tarjeta «CUENTA AUDITADA ✓»'),
]
