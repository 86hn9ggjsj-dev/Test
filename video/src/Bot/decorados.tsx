// Decorados de alambre para que se entienda en un segundo DÓNDE pasa cada escena, con el mismo estilo (trazo blanco,
// toques de verde y rojo): vagón de metro por dentro, baño, comedor con mesa de cena y pantalla con velas.
// Medidas del mundo: suelo en y = −1; un stickman con k = 0,5 mide ~0,88 de alto.
import { circulo, Trazo, V3 } from "./tres";
import { cristal, ROJO, vela, velas } from "./kit";

// ------------------------------------------------------------------ geometría
// Rectángulo de esquinas redondeadas en vertical (plano x-y) a la profundidad z
export const rrXY = (cx: number, cy: number, w: number, h: number, r: number, z: number, n = 5): V3[] => {
  const pts: V3[] = [];
  const esq: [number, number, number][] = [
    [cx + w / 2 - r, cy + h / 2 - r, 0],
    [cx - w / 2 + r, cy + h / 2 - r, Math.PI / 2],
    [cx - w / 2 + r, cy - h / 2 + r, Math.PI],
    [cx + w / 2 - r, cy - h / 2 + r, Math.PI * 1.5],
  ];
  for (const [x, y, a0] of esq)
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((i / n) * Math.PI) / 2;
      pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r, z]);
    }
  pts.push(pts[0]);
  return pts;
};
// Elipse horizontal (plano x-z)
export const elipse = (c: V3, rx: number, rz: number, n = 40, a0 = 0, a1 = Math.PI * 2): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [c[0] + Math.cos(a) * rx, c[1], c[2] + Math.sin(a) * rz];
  });
export const rectXY = (x0: number, y0: number, x1: number, y1: number, z: number): V3[] => [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [x0, y0, z]];
const rectZY = (x: number, z0: number, y0: number, z1: number, y1: number): V3[] => [[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [x, y0, z0]];

// ------------------------------------------------------------------ vagón de metro por dentro (mirando hacia el fondo)
// Pasillo con bancos a los lados, ventanas, puertas dobles, barras con asas que se balancean, tubos de luz en el techo,
// plano de la línea y luces del túnel que pasan por fuera. Cámara dentro del vagón, hacia −z (p. ej. orbita([0,−0.3,−1], 3.2, 0.08, 0.05)).
export const VAGON = { X: 0.75, TECHO: 0.3, Z0: -6.5, Z1: 1.4 };
export const vagon = (tr: Trazo[], t: number, o = 1) => {
  const { X, TECHO, Z0, Z1 } = VAGON;
  for (const x of [-X, X]) {
    tr.push({ t: "l", a: [x, -1, Z0], b: [x, -1, Z1], w: 2, o: 0.7 * o });
    tr.push({ t: "l", a: [x, TECHO, Z0], b: [x, TECHO, Z1], w: 2, o: 0.7 * o });
  }
  for (let z = Z0; z <= Z1; z += 0.5) tr.push({ t: "l", a: [-X + 0.25, -1, z], b: [X - 0.25, -1, z], w: 1, o: 0.16 * o });
  // Fondo: puerta de paso al vagón siguiente
  tr.push({ t: "p", pts: rectXY(-X, -1, X, TECHO, Z0), w: 2, o: 0.8 * o });
  tr.push({ t: "p", pts: rectXY(-0.25, -1, 0.25, 0.08, Z0), w: 2, o: 0.8 * o, relleno: "#fff", oRelleno: 0.04 });
  tr.push({ t: "p", pts: rectXY(-0.14, -0.42, 0.14, -0.05, Z0), w: 1.6, o: 0.7 * o });
  // Tubos de luz del techo
  for (const x of [-0.26, 0.26]) for (let z = Z0 + 0.3; z < Z1 - 0.5; z += 1.25) tr.push({ t: "l", a: [x, TECHO - 0.01, z], b: [x, TECHO - 0.01, z + 0.85], w: 3, o: 0.9 * o, luz: 0.8 });
  // Barras del techo con asas
  for (const x of [-0.4, 0.4]) {
    tr.push({ t: "l", a: [x, 0.17, Z0], b: [x, 0.17, Z1], w: 2.4, o: 0.9 * o });
    for (let z = Z0 + 0.3; z < Z1; z += 0.45) {
      const bal = 0.035 * Math.sin(t * 3.2 + z * 1.7);
      tr.push({ t: "l", a: [x, 0.17, z], b: [x, -0.02, z + bal], w: 1.6, o: 0.8 * o });
      tr.push({ t: "p", pts: circulo([x, -0.07, z + bal], 0.05, "z", 16), w: 1.8, o: 0.9 * o });
    }
  }
  const puertas = [-4.3, -1.5];
  for (const lado of [-1, 1]) {
    const x = lado * X;
    for (const zp of puertas) {
      tr.push({ t: "p", pts: rectZY(x, zp - 0.36, -1, zp + 0.36, 0.12), w: 2.2, o: 0.9 * o, relleno: "#fff", oRelleno: 0.05 });
      tr.push({ t: "l", a: [x, -1, zp], b: [x, 0.12, zp], w: 1.6, o: 0.8 * o });
      for (const s of [-1, 1]) tr.push({ t: "p", pts: rectZY(x, zp + s * 0.07, -0.45, zp + s * 0.29, -0.05), w: 1.4, o: 0.7 * o });
      tr.push({ t: "l", a: [lado * 0.45, -1, zp + 0.5], b: [lado * 0.45, TECHO, zp + 0.5], w: 2.6, o: 0.9 * o, luz: 0.2 });
    }
    const tramos: [number, number][] = [[Z0 + 0.1, puertas[0] - 0.45], [puertas[0] + 0.45, puertas[1] - 0.45], [puertas[1] + 0.45, Z1]];
    for (const [za, zb] of tramos) {
      for (let z = za + 0.08; z + 0.6 <= zb; z += 0.76) tr.push({ t: "p", pts: rectZY(x, z, -0.48, z + 0.64, -0.03), w: 2, o: 0.85 * o, relleno: "#fff", oRelleno: 0.05 });
      // Banco corrido: asiento, frente y respaldo
      const xi = lado * (X - 0.24);
      tr.push({ t: "p", pts: [[xi, -0.76, za], [xi, -0.76, zb], [x, -0.76, zb], [x, -0.76, za], [xi, -0.76, za]], w: 1.8, o: 0.85 * o, relleno: "#fff", oRelleno: 0.07 });
      tr.push({ t: "l", a: [xi, -0.9, za], b: [xi, -0.9, zb], w: 1.4, o: 0.5 * o });
      tr.push({ t: "l", a: [x - lado * 0.04, -0.53, za], b: [x - lado * 0.04, -0.53, zb], w: 1.8, o: 0.65 * o });
    }
    // Plano de la línea encima de las ventanas (en rojo, con estaciones)
    tr.push({ t: "l", a: [x, 0.04, Z0 + 0.3], b: [x, 0.04, puertas[0] - 0.5], w: 2, o: 0.8 * o, color: ROJO });
    for (let k = 0; k < 5; k++) tr.push({ t: "e", c: [x, 0.04, Z0 + 0.4 + k * 0.42], r: 0.018, tipo: "nodo", o: 0.9 * o, color: ROJO });
    // Luces del túnel que pasan por fuera
    for (let k = 0; k < 6; k++) {
      const z = Z0 + ((t * 7 + k * 1.37) % (Z1 - Z0));
      tr.push({ t: "l", a: [lado * (X + 0.3), -0.25, z], b: [lado * (X + 0.3), -0.25, z + 0.3], w: 3, o: 0.8 * o, luz: 0.9 });
    }
  }
};

// ------------------------------------------------------------------ baño: váter de cisterna alta con cadena, papel, lavabo, espejo, puerta «WC»
// Cámara de frente, un poco desde arriba (p. ej. orbita([0,−0.45,−0.2], 3.6, 0.12, 0.1)). El váter queda en x = 0.
export const BANO = { ZW: -0.6, ZC: -0.3, WC: [-0.53, 0.05, -0.6] as V3 };
export const bano = (tr: Trazo[], t: number, o = 1) => {
  const { ZW, ZC } = BANO;
  const XL = -1.2;
  const XR = 1.3;
  for (let x = XL; x <= XR + 0.01; x += 0.25) tr.push({ t: "l", a: [x, -1, ZW], b: [x, -1, 1.0], w: 1, o: 0.2 * o });
  for (let z = ZW; z <= 1.0; z += 0.25) tr.push({ t: "l", a: [XL, -1, z], b: [XR, -1, z], w: 1, o: 0.2 * o });
  // Azulejos hasta media altura y moldura
  for (let x = XL; x <= XR + 0.01; x += 0.2) tr.push({ t: "l", a: [x, -1, ZW], b: [x, -0.3, ZW], w: 1, o: 0.22 * o });
  for (let y = -1; y <= -0.29; y += 0.175) tr.push({ t: "l", a: [XL, y, ZW], b: [XR, y, ZW], w: 1, o: 0.22 * o });
  tr.push({ t: "l", a: [XL, -0.28, ZW], b: [XR, -0.28, ZW], w: 2.2, o: 0.7 * o });
  // Taza: asiento, pie y tapa levantada
  tr.push({ t: "p", pts: elipse([0, -0.77, ZC], 0.18, 0.22), w: 2.6, o, relleno: "#fff", oRelleno: 0.08, luz: 0.2 });
  tr.push({ t: "p", pts: elipse([0, -0.77, ZC], 0.11, 0.14), w: 1.4, o: 0.7 * o });
  tr.push({ t: "p", pts: [[-0.16, -0.79, ZC + 0.06], [-0.09, -1, ZC + 0.03], [0.09, -1, ZC + 0.03], [0.16, -0.79, ZC + 0.06]], w: 2.2, o });
  tr.push({ t: "p", pts: rrXY(0, -0.56, 0.32, 0.4, 0.13, ZW + 0.1), w: 2.4, o, relleno: "#fff", oRelleno: 0.05 });
  // Cisterna alta, tubo y cadena con tirador
  cristal(tr, [-0.22, -0.04, ZW], [0.22, 0.16, ZW + 0.16], "#fff", o, 0.2, 0.06);
  tr.push({ t: "l", a: [0.0, -0.04, ZW + 0.07], b: [0.0, -0.37, ZW + 0.07], w: 3, o });
  const bal = 0.025 * Math.sin(t * 2.5);
  tr.push({ t: "l", a: [0.19, -0.04, ZW + 0.15], b: [0.19 + bal, -0.22, ZW + 0.15], w: 1.4, o, dash: "3 4" });
  tr.push({ t: "e", c: [0.19 + bal, -0.25, ZW + 0.15], r: 0.026, tipo: "nodo", o });
  // Papel higiénico
  tr.push({ t: "l", a: [0.36, -0.45, ZW], b: [0.36, -0.45, ZW + 0.1], w: 2, o });
  tr.push({ t: "p", pts: circulo([0.36, -0.5, ZW + 0.08], 0.065, "x", 20), w: 2.2, o, relleno: "#fff", oRelleno: 0.18 });
  tr.push({ t: "l", a: [0.36, -0.56, ZW + 0.145], b: [0.36, -0.74, ZW + 0.145], w: 2, o: 0.85 * o });
  // Lavabo con grifo y espejo
  const xl = 0.68;
  tr.push({ t: "p", pts: elipse([xl, -0.42, ZW + 0.18], 0.19, 0.13), w: 2.2, o, relleno: "#fff", oRelleno: 0.06 });
  tr.push({ t: "p", pts: [[xl - 0.06, -0.45, ZW + 0.12], [xl - 0.04, -1, ZW + 0.1], [xl + 0.04, -1, ZW + 0.1], [xl + 0.06, -0.45, ZW + 0.12]], w: 2, o: 0.8 * o });
  tr.push({ t: "l", a: [xl, -0.42, ZW + 0.03], b: [xl, -0.31, ZW + 0.03], w: 2.4, o });
  tr.push({ t: "l", a: [xl, -0.31, ZW + 0.03], b: [xl, -0.31, ZW + 0.11], w: 2.4, o });
  tr.push({ t: "p", pts: rrXY(xl, 0.06, 0.4, 0.5, 0.05, ZW + 0.01), w: 2.2, o, relleno: "#fff", oRelleno: 0.06, luz: 0.3 });
  // Puerta
  tr.push({ t: "p", pts: rectXY(-0.76, -1, -0.3, 0.28, ZW + 0.005), w: 2.2, o: 0.9 * o, relleno: "#fff", oRelleno: 0.03 });
  tr.push({ t: "e", c: [-0.37, -0.4, ZW + 0.02], r: 0.022, tipo: "nodo", o });
  // Bombilla
  tr.push({ t: "l", a: [0.05, 1.0, 0.0], b: [0.05, 0.62, 0.0], w: 1.4, o: 0.7 * o });
  tr.push({ t: "e", c: [0.05, 0.58, 0.0], r: 0.04, tipo: "punto", o, luz: 1 });
};

// ------------------------------------------------------------------ comedor de noche: ventana con luna y ciudad, cortinas, lámpara y sillas
// Los personajes se sientan DETRÁS de la mesa (x ≈ ±0.28, z = −0.5) y la mesa se dibuja ENCIMA (mesaCena) para que el
// mantel tape las piernas. Cámara de frente (p. ej. orbita([0,−0.4,−0.2], 3.4, 0, 0.12)).
export const comedor = (tr: Trazo[], t: number, o = 1) => {
  const ZW = -1.15;
  for (let x = -1.8; x <= 1.81; x += 0.36) tr.push({ t: "l", a: [x, -1, ZW], b: [x, -1, 1.0], w: 1, o: 0.14 * o });
  tr.push({ t: "l", a: [-1.8, -1, ZW], b: [1.8, -1, ZW], w: 1.8, o: 0.6 * o });
  tr.push({ t: "l", a: [-1.8, -0.75, ZW], b: [1.8, -0.75, ZW], w: 1.2, o: 0.35 * o });
  // Ventana: marco, cruz, luna y siluetas de edificios
  tr.push({ t: "p", pts: rectXY(-0.6, -0.2, 0.6, 0.55, ZW), w: 2.4, o, relleno: "#fff", oRelleno: 0.03 });
  tr.push({ t: "l", a: [0, -0.2, ZW], b: [0, 0.55, ZW], w: 1.6, o: 0.8 * o });
  tr.push({ t: "l", a: [-0.6, 0.18, ZW], b: [0.6, 0.18, ZW], w: 1.6, o: 0.8 * o });
  tr.push({ t: "p", pts: circulo([0.36, 0.38, ZW - 0.01], 0.07, "z", 24), w: 1.8, o, relleno: "#fff", oRelleno: 0.55, luz: 0.7 });
  const alturas = [0.12, 0.22, 0.08, 0.3, 0.16, 0.26, 0.1, 0.2, 0.14];
  const ciudad: V3[] = [[-0.6, -0.2, ZW - 0.01]];
  alturas.forEach((h, i) => {
    const x0 = -0.6 + (1.2 * i) / alturas.length;
    const x1 = -0.6 + (1.2 * (i + 1)) / alturas.length;
    ciudad.push([x0, -0.2 + h, ZW - 0.01], [x1, -0.2 + h, ZW - 0.01]);
  });
  ciudad.push([0.6, -0.2, ZW - 0.01]);
  tr.push({ t: "p", pts: ciudad, w: 1.4, o: 0.5 * o });
  // Ventanitas encendidas en los edificios
  for (let k = 0; k < 7; k++) tr.push({ t: "e", c: [-0.5 + k * 0.16, -0.12 + 0.05 * (k % 3), ZW - 0.01], r: 0.01, tipo: "punto", o: 0.6 * o, luz: 0.5 });
  // Cortinas onduladas
  for (const lado of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const xc = lado * (0.66 + k * 0.05);
      const pts: V3[] = Array.from({ length: 12 }, (_, i) => [xc + 0.015 * Math.sin(i * 1.4 + k + t), 0.6 - i * 0.12, ZW + 0.02]);
      tr.push({ t: "p", pts, w: 1.4, o: 0.55 * o });
    }
  }
  // Lámpara colgante sobre la mesa
  tr.push({ t: "l", a: [0, 1.1, -0.05], b: [0, 0.32, -0.05], w: 1.4, o: 0.7 * o });
  tr.push({ t: "p", pts: [[-0.15, 0.16, -0.05], [-0.05, 0.32, -0.05], [0.05, 0.32, -0.05], [0.15, 0.16, -0.05], [-0.15, 0.16, -0.05]], w: 2.2, o, relleno: "#fff", oRelleno: 0.1, luz: 0.4 });
  tr.push({ t: "e", c: [0, 0.14, -0.05], r: 0.035, tipo: "punto", o, luz: 1 });
  // Respaldos de las sillas (detrás de cada comensal)
  for (const x of [-0.3, 0.3]) {
    const z = -0.62;
    for (const dx of [-0.14, 0.14]) tr.push({ t: "l", a: [x + dx, -1, z], b: [x + dx, -0.12, z], w: 2.2, o: 0.85 * o });
    tr.push({ t: "l", a: [x - 0.16, -0.12, z], b: [x + 0.16, -0.12, z], w: 2.6, o: 0.9 * o });
    for (const y of [-0.28, -0.42]) tr.push({ t: "l", a: [x - 0.14, y, z], b: [x + 0.14, y, z], w: 1.4, o: 0.6 * o });
  }
};
// Mesa con mantel opaco, platos, copas de vino (con vino en rojo) y vela
export const mesaCena = (tr: Trazo[], t: number, o = 1) => {
  const y = -0.58;
  const x0 = -0.66;
  const x1 = 0.66;
  const z0 = -0.36;
  const z1 = 0.3;
  tr.push({ t: "p", pts: [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [x0, y, z0]], w: 2.2, o, relleno: "#000", oRelleno: 0.96 });
  const borde: V3[] = Array.from({ length: 25 }, (_, i) => [x1 - ((x1 - x0) * i) / 24, -0.82 + 0.022 * Math.sin(i * 1.3), z1 + 0.01]);
  tr.push({ t: "p", pts: [[x0, y, z1 + 0.01], [x1, y, z1 + 0.01], ...borde, [x0, y, z1 + 0.01]], w: 2.2, o, relleno: "#000", oRelleno: 0.97 });
  for (const x of [x0 + 0.1, x1 - 0.1]) tr.push({ t: "l", a: [x, -0.82, z1 - 0.06], b: [x, -1, z1 - 0.06], w: 2.4, o: 0.8 * o });
  // Platos con comida
  for (const x of [-0.3, 0.3]) {
    tr.push({ t: "p", pts: elipse([x, y + 0.005, 0.1], 0.14, 0.1), w: 2, o });
    tr.push({ t: "p", pts: elipse([x, y + 0.005, 0.1], 0.085, 0.06), w: 1.2, o: 0.6 * o });
    tr.push({ t: "p", pts: [[x - 0.06, y + 0.01, 0.1], [x - 0.025, y + 0.06, 0.1], [x + 0.03, y + 0.05, 0.1], [x + 0.06, y + 0.01, 0.1]], w: 1.8, o: 0.9 * o });
  }
  // Copas de vino
  for (const x of [-0.11, 0.11]) {
    const z = -0.08;
    tr.push({ t: "p", pts: elipse([x, y, z], 0.035, 0.025, 12), w: 1.2, o: 0.8 * o });
    tr.push({ t: "l", a: [x, y, z], b: [x, y + 0.1, z], w: 1.6, o });
    const copa: V3[] = Array.from({ length: 13 }, (_, i) => {
      const a = Math.PI + (Math.PI * i) / 12;
      return [x + Math.cos(a) * 0.05, y + 0.19 + Math.sin(a) * 0.09, z];
    });
    tr.push({ t: "p", pts: copa, w: 1.8, o });
    const vino: V3[] = Array.from({ length: 9 }, (_, i) => {
      const a = Math.PI * 1.22 + (Math.PI * 0.56 * i) / 8;
      return [x + Math.cos(a) * 0.05, y + 0.19 + Math.sin(a) * 0.09, z + 0.001];
    });
    tr.push({ t: "p", pts: [...vino, vino[0]], w: 1, o, color: ROJO, relleno: ROJO, oRelleno: 0.55 * o });
  }
  // Vela con llama
  tr.push({ t: "l", a: [0, y, 0.0], b: [0, y + 0.16, 0.0], w: 4, o });
  tr.push({ t: "e", c: [0, y + 0.2 + 0.006 * Math.sin(t * 13), 0.0], r: 0.026, tipo: "punto", o, luz: 1, color: "#ffd27a" });
};

// ------------------------------------------------------------------ pantalla grande con velas (gráfico que se entiende)
// serie: cierres ya en coordenadas del mundo; hasta: cuántas velas se ven; roja: índice de una vela que se pinta en rojo
export const pantallaVelas = (tr: Trazo[], c: V3, w: number, h: number, serie: number[], hasta: number, roja = -1, o = 1) => {
  tr.push({ t: "p", pts: rrXY(c[0], c[1], w, h, 0.07, c[2]), w: 2.8, o, relleno: "#000", oRelleno: 0.85 * o, luz: 0.25 });
  for (let k = 1; k < 4; k++) tr.push({ t: "l", a: [c[0] - w / 2 + 0.05, c[1] - h / 2 + (h * k) / 4, c[2] + 0.005], b: [c[0] + w / 2 - 0.05, c[1] - h / 2 + (h * k) / 4, c[2] + 0.005], w: 1, o: 0.12 * o });
  const x0 = c[0] - w / 2 + 0.08;
  const x1 = c[0] + w / 2 - 0.08;
  const ancho = Math.min(0.06, ((x1 - x0) / serie.length) * 0.6);
  velas(tr, serie, x0, x1, hasta, ancho, o, 0.02, true);
  if (roja > 0 && roja < hasta) {
    const x = x0 + ((x1 - x0) * roja) / (serie.length - 1);
    const a = serie[roja - 1];
    const b = serie[roja];
    vela(tr, x, a, b, Math.max(a, b) + 0.02, Math.min(a, b) - 0.02, ancho, o, 0.6, false);
  }
  return { x: (i: number) => x0 + ((x1 - x0) * i) / (serie.length - 1) };
};
