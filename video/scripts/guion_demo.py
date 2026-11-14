"""Reel con historia (~30 s, formato nuevo): Marcos (personaje ficticio, gorra) pasa de la cuenta demo a la real.

Consejo: pasar a real con una cantidad ridícula (20 €) para aprender a perder dinero de verdad; subir solo cuando perderla
no te cambie el pulso. Sin cifras ni afirmaciones sobre el bot.
"""

TITULO = 'En demo hizo un 300 %; con dinero real duró 11 días'
# Titular escrito del primer fotograma (formato nuevo): líneas con *palabras clave*
GANCHO = {'lineas': ['En demo: *+300_%*', 'En real: *11_días*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['En demo, Marcos hizo un 300 %.', 'Con dinero real duró 11 días.']),
    ('uno', ['Misma estrategia. Mismo gráfico. Mismo Marcos.']),
    ('dos', ['¿Qué cambió? Que en demo perder no duele.', 'Con dinero real le temblaba el dedo: cerraba pronto lo que ganaba y aguantaba lo que perdía.']),
    ('sigueme', ['Sígueme, que esto tiene arreglo.']),
    ('tres', ['Pasa a real con una cantidad ridícula: 20 euros.', 'No es para ganar: es para aprender a perder dinero de verdad.']),
    ('giro', ['Cuando perder 20 no te cambie el pulso, sube.']),
    ('pregunta', ['¿Tú también eras millonario en demo? Etiqueta a ese amigo.']),
]

GESTOS = {
    'hook': '[excited] En demo, Marcos hizo un trescientos por ciento. [serious] Con dinero real duró once días.',
    'uno': 'Misma estrategia. Mismo gráfico. Mismo Marcos.',
    'dos': '[curious] ¿Qué cambió? Que en demo perder no duele. [inhales] Con dinero real le temblaba el dedo: cerraba pronto lo que ganaba y aguantaba lo que perdía.',
    'sigueme': '[warmly] Sígueme, que esto tiene arreglo.',
    'tres': 'Pasa a real con una cantidad ridícula: veinte euros. [serious] No es para ganar: es para aprender a perder dinero de verdad.',
    'giro': 'Cuando perder veinte no te cambie el pulso... sube.',
    'pregunta': '[mischievously] ¿Tú también eras millonario en demo? Etiqueta a ese amigo.',
}

PANTALLAS = [
    ('hook', "", 'fotograma 0: Marcos con corona y lluvia de billetes de mentira (DEMO +300 %) partido en dos con Marcos hundido (REAL, día 11, saldo 0)'),
    ('uno', "", 'dos pantallas idénticas lado a lado: mismas velas, misma entrada; solo cambia el rótulo DEMO / REAL'),
    ('dos', "", 'en DEMO una pérdida rebota en Marcos sin tocarle; en REAL su dedo tiembla sobre el botón: cierra una verde enana y deja crecer una roja'),
    ('sigueme', "", '«sígueme» encima de la escena, que sigue viva y desenfocada'),
    ('tres', "", 'un billete de 20 € enorme sobre la mesa; Marcos lo mete en la cuenta REAL con cara de «¿solo esto?»'),
    ('giro', "", 'medidor de pulso: con −20 € se dispara las primeras veces y luego se calma; entonces la cifra sube a 50, 100'),
    ('pregunta', "", 'corona de la demo en el suelo y bocadillo de comentarios'),
]
