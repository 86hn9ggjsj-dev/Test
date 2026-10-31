"""Reel de alcance (~40 s): la regla del 72 para saber cuánto tardas en duplicar tu dinero.
Pacioli ya la cita en 1494. 72/10 = 7,2 (1,1^7,2 = 1,99); 72/2 = 36 (1,02^36 = 2,04; 1,1^36 = 30,9); 72/3 = 24 (1/1,03^24 = 0,49)."""

TITULO = "La regla del 72: en cuántos años duplicas tu dinero"
GUION = [
    ("hook", ["Hay una cuenta de hace más de 500 años que te dice en cuántos años duplicas tu dinero.", "Y se hace en tres segundos."]),
    ("regla", ["La regla del 72.", "Divides 72 entre lo que ganas al año."]),
    ("ejemplo", ["¿Un 10%? 72 entre 10: en unos 7 años, el doble.", "¿Un depósito al 2%? 72 entre 2: 36 años."]),
    ("compuesto", ["Y fíjate: en esos mismos 36 años, al 10% tu dinero no se duplica.", "Se multiplica por más de 30."]),
    ("giro", ["Y funciona al revés.", "Con un 3% de inflación, 72 entre 3: en 24 años, tu dinero parado vale la mitad."]),
    ("cta", ["Guárdalo, y sígueme para más cuentas que nadie te hace."]),
]

GESTOS = {
    "hook": "[curious] Hay una cuenta de hace más de 500 años que te dice en cuántos años duplicas tu dinero. [short pause] Y se hace en tres segundos.",
    "regla": "La regla del 72. [short pause] Divides 72 entre lo que ganas al año.",
    "ejemplo": "¿Un 10%? 72 entre 10: en unos 7 años, el doble. [short pause] ¿Un depósito al 2%? 72 entre 2: 36 años.",
    "compuesto": "[inhales] Y fíjate: en esos mismos 36 años, al 10% tu dinero no se duplica. Se multiplica por más de 30.",
    "giro": "[serious] Y funciona al revés. Con un 3% de inflación, 72 entre 3: en 24 años, tu dinero parado vale la mitad.",
    "cta": "[warmly] Guárdalo, y sígueme para más cuentas que nadie te hace.",
}

PANTALLAS = [
    ("hook", "¿cuándo se *duplica*?", "reloj de años que gira con un ×2 dentro; «una cuenta de hace 500 años»"),
    ("regla", "la regla del *72*", "el 72 cae de golpe con destello; «÷ % al año»"),
    ("ejemplo", "10 % → *7 años* / 2 % → *36 años*", "dos líneas de tiempo de 40 años: una llega de un salto, la otra se arrastra"),
    ("compuesto", "*más de ×30*", "en los mismos 36 años, la columna del 2 % llega a ×2 y la del 10 % se dispara a ×30,9"),
    ("giro", "vale la *mitad*", "un billete de 100 € que la inflación deshace en polvo hasta 49 €"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
]
