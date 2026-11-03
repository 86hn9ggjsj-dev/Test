// Kit visual de los reels con color: paleta de trading (verde sube, rojo cae), bloques de cristal, suelo en perspectiva,
// velas japonesas en 3D y fichas de casino. Todo se dibuja con los trazos de tres.tsx.
import { caja, circulo, Trazo, V3 } from "./tres";

export const VERDE = "#2fe08a";
export const ROJO = "#ff4d5e";
export const ORO = "#f5c451";
export const AZUL = "#4da3ff";

// Fondos por reel: un tinte de color en el centro que se va a negro
export const fondoTinte = (color: string) => `radial-gradient(ellipse 90% 70% at 50% 42%, ${color}, #000 78%)`;

// Bloque de cristal: aristas de color y caras translúcidas (delantera, superior y lateral)
export const cristal = (tr: Trazo[], min: V3, max: V3, color = "#fff", o = 1, luz = 0.25, relleno = 0.12) => {
  const [x0, y0, z0] = min;
  const [x1, y1, z1] = max;
  const cara = (pts: V3[], k: number) => tr.push({ t: "p", pts: [...pts, pts[0]], w: 0, o, relleno: color, oRelleno: relleno * k * o });
  cara([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], 1);
  cara([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], 1.6);
  cara([[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], 0.7);
  for (const [a, b] of caja(min, max)) tr.push({ t: "l", a, b, w: 1.8, o, luz, color });
};

// Suelo en cuadrícula que avanza hacia la cámara
export const suelo = (tr: Trazo[], t: number, y = -1, o = 0.35, color = "#fff", vel = 0.6) => {
  const desp = (t * vel) % 0.5;
  for (let i = -8; i <= 8; i++) tr.push({ t: "l", a: [i * 0.5, y, -6], b: [i * 0.5, y, 3], w: 1, o: o * (1 - Math.abs(i) / 9), color });
  for (let j = 0; j < 18; j++) {
    const z = -6 + j * 0.5 + desp;
    tr.push({ t: "l", a: [-4, y, z], b: [4, y, z], w: 1, o: o * Math.min(1, (z + 6) / 4) * Math.min(1, (3 - z) / 1.5), color });
  }
};

// Vela japonesa: cuerpo de cristal entre apertura y cierre, mecha entre mínimo y máximo
export const vela = (tr: Trazo[], x: number, abre: number, cierra: number, alto: number, bajo: number, ancho = 0.035, o = 1, luz = 0.3) => {
  const color = cierra >= abre ? VERDE : ROJO;
  tr.push({ t: "l", a: [x, bajo, 0], b: [x, alto, 0], w: 1.4, o, color });
  const y0 = Math.min(abre, cierra);
  const y1 = Math.max(abre, cierra, y0 + 0.008);
  cristal(tr, [x - ancho / 2, y0, -ancho / 2], [x + ancho / 2, y1, ancho / 2], color, o, luz, 0.35);
};

// Velas a partir de una serie de cierres ya escalada a coordenadas del mundo
export const velas = (tr: Trazo[], cierres: number[], x0: number, x1: number, hasta = cierres.length, ancho = 0.035, o = 1, mecha = 0.02) => {
  for (let i = 1; i < Math.min(hasta, cierres.length); i++) {
    const x = x0 + ((x1 - x0) * i) / (cierres.length - 1);
    const a = cierres[i - 1];
    const c = cierres[i];
    vela(tr, x, a, c, Math.max(a, c) + mecha * (0.6 + ((i * 37) % 10) / 10), Math.min(a, c) - mecha * (0.6 + ((i * 53) % 10) / 10), ancho, o);
  }
};

// Pila de fichas de casino: discos de colores con el canto marcado
export const fichas = (tr: Trazo[], c: V3, n: number, r = 0.16, o = 1) => {
  const colores = [ROJO, VERDE, ORO, AZUL];
  for (let i = 0; i < n; i++) {
    const y = c[1] + i * 0.045;
    const color = colores[i % colores.length];
    tr.push({ t: "p", pts: circulo([c[0], y, c[2]], r, "y", 32), w: 1.6, o, color, relleno: color, oRelleno: 0.18 * o });
    tr.push({ t: "p", pts: circulo([c[0], y + 0.035, c[2]], r, "y", 32), w: 1, o: 0.7 * o, color });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      tr.push({ t: "l", a: [c[0] + Math.cos(a) * r, y, c[2] + Math.sin(a) * r], b: [c[0] + Math.cos(a) * r, y + 0.035, c[2] + Math.sin(a) * r], w: 2.4, o: 0.8 * o, color: "#fff" });
    }
  }
};
