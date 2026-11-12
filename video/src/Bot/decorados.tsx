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

// ------------------------------------------------------------------ despacho en casa: mesa con monitor, teclado, taza y flexo; ventana (día o
// noche), reloj de pared con la hora y un cuadro. El monitor (DESPACHO.MON) recibe encima la pantalla 2D (PantallaPC).
// Cámara de frente (p. ej. orbita([0.35,−0.42,−0.3], 3.4, −0.12, 0.1)).
export const DESPACHO = { ZW: -0.75, MON: { c: [0.55, -0.25, -0.5] as V3, w: 0.8, h: 0.48 }, RELOJ: [0.2, 0.26, -0.75] as V3 };
export const despachoCasa = (tr: Trazo[], t: number, op: { hora: number; dia?: number; flexo?: number; monitor?: boolean } = { hora: 10 }, o = 1) => {
  const { ZW, MON, RELOJ } = DESPACHO;
  const dia = op.dia ?? 1;
  // Suelo de tarima y rodapié
  for (let z = ZW; z <= 1.2; z += 0.2) tr.push({ t: "l", a: [-1.6, -1, z], b: [1.8, -1, z], w: 1, o: 0.14 * o });
  tr.push({ t: "l", a: [-1.6, -1, ZW], b: [1.8, -1, ZW], w: 1.8, o: 0.6 * o });
  tr.push({ t: "l", a: [-1.6, -0.94, ZW], b: [1.8, -0.94, ZW], w: 1.2, o: 0.35 * o });
  // Ventana (arriba a la derecha) con sol (día) o luna y estrellas (noche)
  const wx0 = 0.62;
  const wx1 = 1.04;
  const wy0 = 0.1;
  const wy1 = 0.56;
  tr.push({ t: "p", pts: rectXY(wx0, wy0, wx1, wy1, ZW), w: 2.4, o, relleno: "#fff", oRelleno: 0.03 + 0.05 * dia });
  tr.push({ t: "l", a: [(wx0 + wx1) / 2, wy0, ZW], b: [(wx0 + wx1) / 2, wy1, ZW], w: 1.6, o: 0.8 * o });
  tr.push({ t: "l", a: [wx0, (wy0 + wy1) / 2, ZW], b: [wx1, (wy0 + wy1) / 2, ZW], w: 1.6, o: 0.8 * o });
  tr.push({ t: "l", a: [wx0 - 0.04, wy0, ZW + 0.03], b: [wx1 + 0.04, wy0, ZW + 0.03], w: 2.6, o: 0.9 * o });
  if (dia > 0.01) {
    const sol: V3 = [0.93, 0.44 - 0.2 * (1 - dia), ZW - 0.01];
    tr.push({ t: "p", pts: circulo(sol, 0.045, "z", 24), w: 2, o: dia * o, relleno: "#fff", oRelleno: 0.4 * dia, luz: 0.8 });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + t * 0.4;
      tr.push({ t: "l", a: [sol[0] + Math.cos(a) * 0.065, sol[1] + Math.sin(a) * 0.065, sol[2]], b: [sol[0] + Math.cos(a) * 0.09, sol[1] + Math.sin(a) * 0.09, sol[2]], w: 1.6, o: dia * o });
    }
  }
  if (dia < 0.99) {
    tr.push({ t: "p", pts: circulo([0.72, 0.46, ZW - 0.01], 0.04, "z", 20), w: 1.8, o: (1 - dia) * o, relleno: "#fff", oRelleno: 0.6 * (1 - dia), luz: 0.6 });
    for (let k = 0; k < 6; k++) tr.push({ t: "e", c: [0.68 + k * 0.065, 0.18 + 0.07 * ((k * 7) % 3), ZW - 0.01], r: 0.008, tipo: "punto", o: (1 - dia) * o, luz: 0.6 });
  }
  // Cuadro
  tr.push({ t: "p", pts: rectXY(-0.32, 0.02, -0.02, 0.26, ZW), w: 1.8, o: 0.8 * o });
  tr.push({ t: "p", pts: [[-0.29, 0.05, ZW], [-0.21, 0.18, ZW], [-0.15, 0.11, ZW], [-0.1, 0.2, ZW], [-0.05, 0.05, ZW]], w: 1.4, o: 0.7 * o });
  // Reloj de pared con la hora
  tr.push({ t: "p", pts: circulo(RELOJ, 0.12, "z", 40), w: 2.4, o, relleno: "#fff", oRelleno: 0.05, luz: 0.2 });
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    tr.push({ t: "l", a: [RELOJ[0] + Math.sin(a) * 0.1, RELOJ[1] + Math.cos(a) * 0.1, ZW + 0.002], b: [RELOJ[0] + Math.sin(a) * 0.115, RELOJ[1] + Math.cos(a) * 0.115, ZW + 0.002], w: k % 3 ? 1 : 2, o });
  }
  const am = (op.hora % 1) * Math.PI * 2;
  const ah = ((op.hora % 12) / 12) * Math.PI * 2;
  tr.push({ t: "l", a: [RELOJ[0], RELOJ[1], ZW + 0.004], b: [RELOJ[0] + Math.sin(ah) * 0.06, RELOJ[1] + Math.cos(ah) * 0.06, ZW + 0.004], w: 3.2, o });
  tr.push({ t: "l", a: [RELOJ[0], RELOJ[1], ZW + 0.004], b: [RELOJ[0] + Math.sin(am) * 0.095, RELOJ[1] + Math.cos(am) * 0.095, ZW + 0.004], w: 2, o });
  // Mesa
  const y = -0.6;
  cristal(tr, [0.0, y - 0.03, -0.64], [1.1, y, -0.1], "#fff", 0.9 * o, 0.15, 0.06);
  for (const [x, z] of [[0.03, -0.13], [1.07, -0.13], [0.03, -0.61], [1.07, -0.61]] as [number, number][]) tr.push({ t: "l", a: [x, y - 0.03, z], b: [x, -1, z], w: 2.2, o: 0.8 * o });
  cristal(tr, [0.8, -0.88, -0.6], [1.05, y - 0.03, -0.16], "#fff", 0.6 * o, 0.1, 0.03);
  // Monitor con peana (la pantalla la pinta PantallaPC)
  if (op.monitor !== false) {
    const { c, w, h } = MON;
    tr.push({ t: "p", pts: rrXY(c[0], c[1], w, h, 0.025, c[2]), w: 2.8, o, relleno: "#000", oRelleno: 0.9, luz: 0.25 });
    tr.push({ t: "l", a: [c[0], c[1] - h / 2, c[2]], b: [c[0], y, c[2]], w: 3, o });
    tr.push({ t: "p", pts: elipse([c[0], y + 0.002, c[2]], 0.1, 0.05, 20), w: 2, o });
  }
  // Teclado y ratón
  tr.push({ t: "p", pts: [[0.33, y + 0.005, -0.32], [0.77, y + 0.005, -0.32], [0.77, y + 0.005, -0.21], [0.33, y + 0.005, -0.21], [0.33, y + 0.005, -0.32]], w: 1.8, o, relleno: "#fff", oRelleno: 0.08 });
  for (let k = 1; k < 4; k++) tr.push({ t: "l", a: [0.35, y + 0.006, -0.32 + k * 0.027], b: [0.75, y + 0.006, -0.32 + k * 0.027], w: 0.8, o: 0.5 * o });
  tr.push({ t: "p", pts: elipse([0.87, y + 0.005, -0.27], 0.025, 0.04, 14), w: 1.6, o });
  // Taza
  tr.push({ t: "p", pts: elipse([1.0, y + 0.1, -0.4], 0.04, 0.03, 16), w: 1.6, o });
  tr.push({ t: "p", pts: elipse([1.0, y, -0.4], 0.04, 0.03, 16, 0, Math.PI), w: 1.6, o });
  for (const s of [-1, 1]) tr.push({ t: "l", a: [1.0 + s * 0.04, y, -0.4], b: [1.0 + s * 0.04, y + 0.1, -0.4], w: 1.6, o });
  tr.push({ t: "p", pts: circulo([0.955, y + 0.05, -0.4], 0.025, "z", 12, Math.PI / 2, Math.PI * 1.5), w: 1.6, o });
  // Flexo
  const fl = op.flexo ?? 1;
  tr.push({ t: "p", pts: elipse([0.1, y + 0.003, -0.5], 0.06, 0.04, 16), w: 1.8, o });
  tr.push({ t: "l", a: [0.1, y, -0.5], b: [0.04, y + 0.3, -0.5], w: 2.2, o });
  tr.push({ t: "l", a: [0.04, y + 0.3, -0.5], b: [0.16, y + 0.36, -0.5], w: 2.2, o });
  tr.push({ t: "p", pts: [[0.12, y + 0.4, -0.5], [0.22, y + 0.38, -0.5], [0.24, y + 0.28, -0.5], [0.13, y + 0.31, -0.5], [0.12, y + 0.4, -0.5]], w: 2, o, relleno: "#fff", oRelleno: 0.1 });
  if (fl > 0.01) tr.push({ t: "e", c: [0.19, y + 0.29, -0.5], r: 0.025, tipo: "punto", o: fl * o, luz: 1, color: "#ffd27a" });
};

// ------------------------------------------------------------------ cruce de calles: la carretera se parte en dos con dos señales encima
// (los rótulos los pone la escena en 2D sobre CRUCE.izq / CRUCE.der). Cámara de frente (p. ej. orbita([0,−0.35,−1.3], 3.6, 0, 0.12)).
export const CRUCE = { izq: [-0.33, 0.03, -2.2] as V3, der: [0.33, -0.17, -2.2] as V3 };
export const cruce = (tr: Trazo[], t: number, o = 1) => {
  const y = -1;
  // Bordes de la carretera y la «Y»
  tr.push({ t: "p", pts: [[-0.65, y, 2], [-0.65, y, -1.6], [-2.8, y, -6]], w: 3, o, luz: 0.2 });
  tr.push({ t: "p", pts: [[0.65, y, 2], [0.65, y, -1.6], [2.8, y, -6]], w: 3, o, luz: 0.2 });
  tr.push({ t: "p", pts: [[-1.4, y, -6], [0, y, -2.6], [1.4, y, -6]], w: 3, o, luz: 0.2 });
  // Marcas discontinuas del centro y de cada ramal
  tr.push({ t: "l", a: [0, y, 2], b: [0, y, -1.8], w: 2.2, o: 0.8 * o, dash: "18 14" });
  tr.push({ t: "l", a: [-0.35, y, -2.2], b: [-2.1, y, -6], w: 2, o: 0.7 * o, dash: "18 14" });
  tr.push({ t: "l", a: [0.35, y, -2.2], b: [2.1, y, -6], w: 2, o: 0.7 * o, dash: "18 14" });
  // Aceras
  tr.push({ t: "p", pts: [[-0.9, y + 0.03, 2], [-0.9, y + 0.03, -1.4], [-3.2, y + 0.03, -6]], w: 1.4, o: 0.5 * o });
  tr.push({ t: "p", pts: [[0.9, y + 0.03, 2], [0.9, y + 0.03, -1.4], [3.2, y + 0.03, -6]], w: 1.4, o: 0.5 * o });
  // Farolas y árboles a los lados
  for (const [x, z] of [[-1.05, 0.6], [1.05, 0.6], [-1.15, -0.9], [1.15, -0.9]] as [number, number][]) {
    tr.push({ t: "l", a: [x, y, z], b: [x, 0.35, z], w: 2.2, o: 0.8 * o });
    tr.push({ t: "l", a: [x, 0.35, z], b: [x - Math.sign(x) * 0.2, 0.35, z], w: 2.2, o: 0.8 * o });
    tr.push({ t: "e", c: [x - Math.sign(x) * 0.2, 0.31, z], r: 0.03, tipo: "punto", o: 0.9 * o, luz: 0.8 });
  }
  for (const [x, z] of [[-1.5, -2.6], [1.5, -2.6], [-1.8, -3.8], [1.8, -3.8]] as [number, number][]) {
    tr.push({ t: "l", a: [x, y, z], b: [x, -0.55, z], w: 2.2, o: 0.7 * o });
    tr.push({ t: "p", pts: circulo([x, -0.35, z], 0.22, "z", 24), w: 1.8, o: 0.7 * o, relleno: "#fff", oRelleno: 0.04 });
  }
  // Edificios al fondo
  for (let k = 0; k < 7; k++) {
    const x = -2.4 + k * 0.8;
    const h = 0.6 + 0.5 * ((k * 37) % 5) / 5;
    tr.push({ t: "p", pts: rectXY(x - 0.3, y, x + 0.3, y + h + 0.6, -7), w: 1.4, o: 0.35 * o, relleno: "#fff", oRelleno: 0.02 });
  }
  // Poste y dos señales con flecha (izquierda y derecha)
  tr.push({ t: "l", a: [0, y, -2.25], b: [0, 0.16, -2.25], w: 3, o, luz: 0.2 });
  const flecha = (x0: number, x1: number, yc: number, z: number, dir: number): V3[] => {
    const h = 0.09;
    const punta = dir > 0 ? x1 + 0.08 : x0 - 0.08;
    return dir > 0
      ? [[x0, yc - h, z], [x1, yc - h, z], [punta, yc, z], [x1, yc + h, z], [x0, yc + h, z], [x0, yc - h, z]]
      : [[x1, yc - h, z], [x0, yc - h, z], [punta, yc, z], [x0, yc + h, z], [x1, yc + h, z], [x1, yc - h, z]];
  };
  tr.push({ t: "p", pts: flecha(-0.62, -0.03, CRUCE.izq[1], -2.2, -1), w: 2.4, o, relleno: "#fff", oRelleno: 0.08 });
  tr.push({ t: "p", pts: flecha(0.03, 0.62, CRUCE.der[1], -2.2, 1), w: 2.4, o, color: ROJO, relleno: ROJO, oRelleno: 0.12 + 0.06 * Math.sin(t * 6), luz: 0.4 });
};

// ------------------------------------------------------------------ rascacielos de cristal (sede de un fondo o un banco) con ventanas y antena
// rojo: 0…1 tiñe las ventanas de rojo (pérdidas)
export const rascacielos = (tr: Trazo[], x: number, z: number, w: number, h: number, t: number, rojo = 0, o = 1) => {
  const y0 = -1;
  const d = w * 0.6;
  const color = rojo > 0.5 ? ROJO : "#fff";
  cristal(tr, [x - w / 2, y0, z - d / 2], [x + w / 2, y0 + h, z + d / 2], color, o, 0.25, 0.05);
  for (let yy = y0 + 0.12; yy < y0 + h - 0.05; yy += 0.11)
    for (let xx = x - w / 2 + 0.06; xx < x + w / 2 - 0.04; xx += 0.09) {
      const parpa = rojo > 0 && ((Math.floor(t * 6) + Math.round(xx * 37 + yy * 53)) % 5 === 0);
      tr.push({ t: "l", a: [xx, yy, z + d / 2 + 0.002], b: [xx + 0.05, yy, z + d / 2 + 0.002], w: 2.4, o: (parpa ? 1 : 0.45) * o, color: parpa ? ROJO : color, luz: parpa ? 0.6 : 0 });
    }
  tr.push({ t: "l", a: [x, y0 + h, z], b: [x, y0 + h + 0.25, z], w: 2, o });
  tr.push({ t: "e", c: [x, y0 + h + 0.26, z], r: 0.02, tipo: "punto", o, luz: 1, color: Math.floor(t * 2) % 2 ? ROJO : "#fff" });
};

// ------------------------------------------------------------------ tienda de videojuegos: fachada, toldo, escaparate con mandos y puerta.
// TIENDA(x, z).cartel es el punto donde la escena pone el rótulo 2D.
export const tiendaVideojuegos = (tr: Trazo[], x: number, z: number, t: number, o = 1) => {
  const y0 = -1;
  const w = 0.8;
  const h = 0.62;
  cristal(tr, [x - w / 2, y0, z - 0.2], [x + w / 2, y0 + h, z + 0.2], "#fff", o, 0.2, 0.04);
  // Cartel y toldo de rayas
  tr.push({ t: "p", pts: rectXY(x - w / 2 + 0.03, y0 + h - 0.15, x + w / 2 - 0.03, y0 + h - 0.02, z + 0.205), w: 2.4, o, relleno: "#fff", oRelleno: 0.12, luz: 0.3 + 0.2 * Math.sin(t * 5) });
  const toldo: V3[] = [];
  for (let k = 0; k <= 8; k++) toldo.push([x - w / 2 + (w * k) / 8, y0 + h - 0.17 - (k % 2) * 0.05, z + 0.3]);
  tr.push({ t: "p", pts: toldo, w: 2, o });
  tr.push({ t: "l", a: [x - w / 2, y0 + h - 0.17, z + 0.205], b: [x - w / 2, y0 + h - 0.17, z + 0.3], w: 1.6, o });
  tr.push({ t: "l", a: [x + w / 2, y0 + h - 0.17, z + 0.205], b: [x + w / 2, y0 + h - 0.17, z + 0.3], w: 1.6, o });
  // Escaparate con dos mandos y puerta
  tr.push({ t: "p", pts: rectXY(x - w / 2 + 0.05, y0 + 0.12, x + 0.08, y0 + h - 0.25, z + 0.205), w: 2.2, o, relleno: "#fff", oRelleno: 0.05 });
  for (const [cx, cy] of [[x - 0.2, y0 + 0.24], [x - 0.02, y0 + 0.3]] as [number, number][]) {
    tr.push({ t: "p", pts: rrXY(cx, cy, 0.13, 0.065, 0.03, z + 0.21), w: 1.8, o, relleno: "#fff", oRelleno: 0.15 });
    tr.push({ t: "l", a: [cx - 0.045, cy, z + 0.212], b: [cx - 0.02, cy, z + 0.212], w: 1.6, o });
    tr.push({ t: "l", a: [cx - 0.0325, cy - 0.0125, z + 0.212], b: [cx - 0.0325, cy + 0.0125, z + 0.212], w: 1.6, o });
    tr.push({ t: "e", c: [cx + 0.035, cy + 0.008, z + 0.212], r: 0.008, tipo: "punto", o });
  }
  tr.push({ t: "p", pts: rectXY(x + 0.16, y0, x + 0.34, y0 + h - 0.25, z + 0.205), w: 2.2, o });
  tr.push({ t: "e", c: [x + 0.19, y0 + 0.18, z + 0.21], r: 0.01, tipo: "nodo", o });
};
export const cartelTienda = (x: number, z: number): V3 => [x, -1 + 0.62 - 0.085, z + 0.21];

// ------------------------------------------------------------------ sala de operaciones de un fondo: pared de pantallas, mesa larga con monitores
// Las pantallas grandes (OFICINA.pantallas) las rellena la escena en 2D si quiere. Cámara de frente (orbita([0,−0.3,−0.6], 3.6, 0, 0.1)).
export const OFICINA = { ZW: -1.0, pantallas: [[-0.62, 0.25], [0, 0.25], [0.62, 0.25]] as [number, number][], PW: 0.56, PH: 0.36 };
export const oficinaFondo = (tr: Trazo[], t: number, linea: (u: number) => number, o = 1, color = "#fff") => {
  const { ZW, pantallas, PW, PH } = OFICINA;
  for (let x = -1.8; x <= 1.81; x += 0.3) tr.push({ t: "l", a: [x, -1, ZW], b: [x, -1, 1.0], w: 1, o: 0.12 * o });
  tr.push({ t: "l", a: [-1.8, -1, ZW], b: [1.8, -1, ZW], w: 1.8, o: 0.6 * o });
  // Pared de pantallas con la misma gráfica
  for (const [cx, cy] of pantallas) {
    tr.push({ t: "p", pts: rectXY(cx - PW / 2, cy - PH / 2, cx + PW / 2, cy + PH / 2, ZW), w: 2.4, o, relleno: "#000", oRelleno: 0.85, luz: 0.2 });
    const pts: V3[] = Array.from({ length: 24 }, (_, i) => [cx - PW / 2 + 0.04 + ((PW - 0.08) * i) / 23, cy - PH / 2 + 0.05 + (PH - 0.1) * linea(i / 23), ZW + 0.005]);
    tr.push({ t: "p", pts, w: 2.6, o, color, luz: 0.4 });
  }
  // Mesa larga con tres monitores y sillas
  cristal(tr, [-1.0, -0.62, -0.55], [1.0, -0.58, -0.15], "#fff", 0.9 * o, 0.15, 0.06);
  for (const x of [-0.97, 0.97]) tr.push({ t: "l", a: [x, -0.62, -0.35], b: [x, -1, -0.35], w: 2.2, o: 0.8 * o });
  for (const x of [-0.6, 0, 0.6]) {
    tr.push({ t: "p", pts: rrXY(x, -0.42, 0.34, 0.22, 0.02, -0.48), w: 2.2, o, relleno: "#000", oRelleno: 0.85 });
    tr.push({ t: "l", a: [x, -0.53, -0.48], b: [x, -0.58, -0.48], w: 2.4, o });
    const pts: V3[] = Array.from({ length: 12 }, (_, i) => [x - 0.14 + (0.28 * i) / 11, -0.5 + 0.15 * linea(i / 11), -0.475]);
    tr.push({ t: "p", pts, w: 1.8, o: 0.9 * o, color });
  }
};

// ------------------------------------------------------------------ casa con o sin tejado (para «la pérdida no tiene techo»)
export const casa = (tr: Trazo[], x: number, z: number, techo: number, o = 1, color = "#fff", w = 0.62) => {
  const h = 0.5;
  const y0 = -1;
  cristal(tr, [x - w / 2, y0, z - 0.25], [x + w / 2, y0 + h, z + 0.25], color, o, 0.2, 0.04);
  tr.push({ t: "p", pts: rectXY(x - 0.07, y0, x + 0.07, y0 + 0.24, z + 0.252), w: 2, o });
  tr.push({ t: "p", pts: rectXY(x - w * 0.39, y0 + 0.28, x - w * 0.19, y0 + 0.4, z + 0.252), w: 1.8, o });
  tr.push({ t: "p", pts: rectXY(x + w * 0.19, y0 + 0.28, x + w * 0.39, y0 + 0.4, z + 0.252), w: 1.8, o });
  if (techo > 0.01) {
    const yt = y0 + h;
    const cima = yt + 0.3 * techo;
    tr.push({ t: "p", pts: [[x - w / 2 - 0.05, yt, z + 0.27], [x, cima, z + 0.27], [x + w / 2 + 0.05, yt, z + 0.27], [x - w / 2 - 0.05, yt, z + 0.27]], w: 2.4, o, relleno: color, oRelleno: 0.12 * o, luz: 0.2 });
    tr.push({ t: "l", a: [x, cima, z + 0.27], b: [x, cima, z - 0.27], w: 2, o: 0.8 * o });
    tr.push({ t: "l", a: [x - w / 2 - 0.05, yt, z - 0.27], b: [x, cima, z - 0.27], w: 1.6, o: 0.6 * o });
    tr.push({ t: "l", a: [x + w / 2 + 0.05, yt, z - 0.27], b: [x, cima, z - 0.27], w: 1.6, o: 0.6 * o });
  }
};

// ------------------------------------------------------------------ pizarra en la pared (marco, bandeja y tiza). PIZARRA(c).texto: el centro donde la
// escena escribe en 2D. Cámara de frente.
export const pizarra = (tr: Trazo[], c: V3, w: number, h: number, o = 1) => {
  tr.push({ t: "p", pts: rectXY(c[0] - w / 2, c[1] - h / 2, c[0] + w / 2, c[1] + h / 2, c[2]), w: 3, o, relleno: "#000", oRelleno: 0.9, luz: 0.2 });
  tr.push({ t: "p", pts: rectXY(c[0] - w / 2 + 0.03, c[1] - h / 2 + 0.03, c[0] + w / 2 - 0.03, c[1] + h / 2 - 0.03, c[2] + 0.002), w: 1.2, o: 0.5 * o });
  cristal(tr, [c[0] - w / 2, c[1] - h / 2 - 0.04, c[2]], [c[0] + w / 2, c[1] - h / 2, c[2] + 0.08], "#fff", 0.8 * o, 0.1, 0.05);
  cristal(tr, [c[0] - w * 0.3, c[1] - h / 2, c[2] + 0.02], [c[0] - w * 0.3 + 0.08, c[1] - h / 2 + 0.02, c[2] + 0.05], "#fff", o, 0.3, 0.4);
};

// ------------------------------------------------------------------ edificio de banco (escalones, columnas y frontón)
export const bancoEdificio = (tr: Trazo[], x: number, z: number, g: number, o = 1, escala = 1) => {
  if (g <= 0.01) return;
  const k = Math.min(g, 1.05) * escala;
  const w = 0.26 * k;
  const y0 = -1;
  cristal(tr, [x - w, y0, z - 0.1 * k], [x + w, y0 + 0.05 * k, z + 0.1 * k], "#fff", 0.9 * o, 0.1, 0.05);
  for (let c = 0; c < 4; c++) {
    const cx = x - w * 0.75 + (c * w * 1.5) / 3;
    tr.push({ t: "l", a: [cx, y0 + 0.05 * k, z + 0.06 * k], b: [cx, y0 + 0.4 * k, z + 0.06 * k], w: 2.2, o: 0.9 * o });
  }
  tr.push({ t: "p", pts: [[x - w * 1.05, y0 + 0.4 * k, z + 0.08 * k], [x + w * 1.05, y0 + 0.4 * k, z + 0.08 * k], [x, y0 + 0.58 * k, z + 0.08 * k], [x - w * 1.05, y0 + 0.4 * k, z + 0.08 * k]], w: 2.4, o, relleno: "#fff", oRelleno: 0.08, luz: 0.3 });
};
