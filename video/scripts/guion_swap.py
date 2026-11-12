"""Reel con historia (5-30-10, ~44 s): Marcos (personaje ficticio, gorra) acierta 3 meses y el swap se come la ganancia.

Idea única: mantener una operación apalancada cada noche cuesta dinero (financiación nocturna o swap; en muchos brókers un
día a la semana se cobra triple). Cifras de ejemplo verosímiles: 30.000 € de posición con 1.000 € de garantía (1:30),
financiación de ~6 % anual sobre el nominal ≈ 450 € en 3 meses. Regla: mirar el swap antes de dejarla abierta días.
"""

TITULO = 'Marcos acertó 3 meses seguidos y casi todo se lo quedó el bróker'
GANCHO = {'lineas': ['Acertó *3_meses*', 'y se lo quedó *el_bróker*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Marcos acertó 3 meses seguidos. Y casi todo se lo quedó el bróker.']),
    ('uno', ['Abrió una operación de 30.000 euros con 1.000 de garantía y la dejó correr.']),
    ('dos', ['Subió. Bajó. Volvió a subir.', 'Tres meses después, cerró con 500 euros de ganancia.']),
    ('sigueme', ['Sígueme, que aquí está la letra pequeña.']),
    ('tres', ['Cada noche con una operación apalancada abierta, el bróker te cobra por prestarte el dinero: el swap.', 'En 3 meses, unos 450 euros.', 'Y en muchos brókers, un día a la semana se cobra triple.']),
    ('giro', ['La solución: antes de dejarla abierta más de unos días, mira el swap en la ficha del activo.', 'Si se come tu objetivo, no entres.']),
    ('cierre', ['Si has llegado hasta aquí, ya te has ahorrado el susto.', 'Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]

GESTOS = {
    'hook': '[curious] Marcos acertó tres meses seguidos. [serious] Y casi todo se lo quedó el bróker.',
    'uno': 'Abrió una operación de treinta mil euros con mil de garantía y la dejó correr.',
    'dos': 'Subió. Bajó. Volvió a subir. [inhales] Tres meses después, cerró con quinientos euros de ganancia.',
    'sigueme': '[warmly] Sígueme, que aquí está la letra pequeña.',
    'tres': '[serious] Cada noche con una operación apalancada abierta, el bróker te cobra por prestarte el dinero: el swap. En tres meses, unos cuatrocientos cincuenta euros. [short pause] Y en muchos brókers, un día a la semana se cobra triple.',
    'giro': 'La solución: antes de dejarla abierta más de unos días, mira el swap en la ficha del activo. Si se come tu objetivo, no entres.',
    'cierre': '[warmly] Si has llegado hasta aquí, ya te has ahorrado el susto. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}

PANTALLAS = [
    ('hook', "", 'fotograma 0: Marcos celebrando +500 € delante del monitor mientras una mano gigante (el bróker, un edificio de banco) se lleva casi todos los billetes'),
    ('uno', "", 'despacho en casa: 1.000 € de garantía que se convierten en una posición de 30.000 € (palanca 1:30)'),
    ('dos', "", 'calendario que pasa 90 días; gráfico que sube, baja y sube; +500 € al cerrar'),
    ('sigueme', "", '«sígueme» encima de la escena, que sigue viva y desenfocada'),
    ('tres', "", 'de noche, cada noche una moneda sale de la cuenta hacia el banco: «SWAP −5 €»; contador hasta −450 €; un día de la semana tres monedas (×3)'),
    ('giro', "", 'ficha del activo en la plataforma con la línea «SWAP COMPRA / VENTA» resaltada; objetivo frente a coste: si el coste se come el objetivo, ✗'),
    ('cierre', "", 'caja de comentario que escribe «BOT», se envía, llega el mensaje directo y la tarjeta «CUENTA AUDITADA ✓»'),
]
