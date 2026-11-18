"""Historia de prueba 5-30-10 «dopamina» (~40 s): el petróleo a −37,63 $ (20 de abril de 2020).

Hechos: el contrato de mayo del WTI (petróleo de Texas) cerró a −37,63 $ el barril el 20-4-2020, primer cierre negativo de
la historia; el contrato vencía al día siguiente y quien lo tuviera al vencer debía recibir los barriles físicos; con el
almacenamiento (Cushing) casi lleno por la pandemia, los que no tenían dónde guardarlo vendían a cualquier precio (el de
junio cerró a 20,43 $). Regla: saber qué se compra; si no sabes explicar en una frase qué pasa cuando vence, no operarlo.
"""

TITULO = 'Un día, el petróleo valió menos que cero'
GANCHO = {'lineas': ['El petróleo', 'valió *menos_que_cero*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Un día, el petróleo valió menos que cero. Te pagaban por llevártelo.']),
    ('uno', ['El 20 de abril de 2020, el barril de Texas cerró a −37 dólares. No había dónde guardarlo.']),
    ('sigueme', ['Sígueme, que el problema no era el precio.']),
    ('dos', ['Era el contrato. Vencía al día siguiente, y quien lo tuviera tenía que recibir los barriles. Sin tanque, vendían a cualquier precio.']),
    ('giro', ['La regla: antes de operar algo, sabe qué compras. Si no sabes explicar en una frase qué pasa cuando vence, no lo operes.']),
    ('cierre', ['Si has llegado hasta aquí, tú sí lo vas a mirar. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Un día, el petróleo valió menos que cero. [short pause] Te pagaban por llevártelo.',
    'uno': 'El veinte de abril de dos mil veinte, el barril de Texas cerró a menos treinta y siete dólares. [short pause] No había dónde guardarlo.',
    'sigueme': '[warmly] Sígueme, que el problema no era el precio.',
    'dos': '[serious] Era el contrato. Vencía al día siguiente, [short pause] y quien lo tuviera tenía que recibir los barriles. Sin tanque, vendían a cualquier precio.',
    'giro': 'La regla: antes de operar algo, sabe qué compras. [short pause] Si no sabes explicar en una frase qué pasa cuando vence, no lo operes.',
    'cierre': '[warmly] Si has llegado hasta aquí, tú sí lo vas a mirar. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: cotización del barril cayendo 18 → 0 → −37 $ mientras un barril de alambre se hunde bajo la línea del cero'),
    ('uno', "", 'tarjeta de prueba (WTI · 20-4-2020 · −37,63 $); tanques de Cushing llenándose hasta FULL'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", 'contrato con el sello VENCE MAÑANA; un camión que trae barriles a la puerta de un stickman que no tiene dónde meterlos'),
    ('giro', "", 'checklist: ¿QUÉ COMPRO? ¿VENCE? ¿QUÉ PASA ESE DÍA?'),
    ('cierre', "", 'móvil: comentario BOT → mensaje directo → cuenta auditada'),
]
