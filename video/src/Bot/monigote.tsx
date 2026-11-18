// Stickman de alambre para los reels: poses por ángulos de las articulaciones que se mezclan entre sí, cara con
// expresión (de alegre a hundido), líneas de agobio y el escritorio con su monitor. Se dibuja con los trazos de tres.tsx.
// Vista «frente»: las extremidades se abren a los lados. Vista «lado»: mira hacia +x y las extremidades van hacia delante.
import { circulo, Trazo, V3 } from "./tres";

// Ángulos en grados. Brazo y pierna: [segmento de arriba desde la vertical hacia abajo, codo/rodilla relativo]
export type Pose = {
  torso: number; // inclinación del tronco (frente: hacia un lado; lado: hacia delante)
  cabeza: number; // inclinación extra de la cabeza
  bI: [number, number];
  bD: [number, number];
  pI: [number, number];
  pD: [number, number];
  cara: number; // −1 hundido … +1 contento
  hombros?: number; // encogimiento de hombros (0-1)
};

export const POSES: Record<string, Pose> = {
  dePie: { torso: 0, cabeza: 0, bI: [12, 8], bD: [12, 8], pI: [5, 0], pD: [5, 0], cara: 0 },
  confiado: { torso: -4, cabeza: -10, bI: [40, -115], bD: [40, -115], pI: [9, 0], pD: [9, 0], cara: 1 },
  senala: { torso: 3, cabeza: -6, bI: [14, 10], bD: [125, -10], pI: [7, 0], pD: [7, 0], cara: 1 },
  celebra: { torso: -6, cabeza: -14, bI: [160, 15], bD: [160, 15], pI: [11, 0], pD: [11, 0], cara: 1 },
  manosCabeza: { torso: 6, cabeza: 12, bI: [145, 140], bD: [145, 140], pI: [7, 0], pD: [7, 0], cara: -1 },
  encoge: { torso: 0, cabeza: 10, bI: [28, 80], bD: [28, 80], pI: [6, 0], pD: [6, 0], cara: -0.3, hombros: 1 },
  hundidoPie: { torso: 10, cabeza: 25, bI: [4, 2], bD: [4, 2], pI: [3, 0], pD: [3, 0], cara: -1 },
  // Vista de lado, sentado ante el escritorio
  sentado: { torso: -6, cabeza: -4, bI: [55, 35], bD: [60, 30], pI: [88, -88], pD: [84, -84], cara: 0 },
  inclinado: { torso: 20, cabeza: 10, bI: [75, 20], bD: [80, 15], pI: [88, -88], pD: [84, -84], cara: 0.2 },
  hundido: { torso: 52, cabeza: 30, bI: [95, 15], bD: [90, 20], pI: [88, -88], pD: [84, -84], cara: -1 },
  cabezaManos: { torso: 30, cabeza: 25, bI: [150, 150], bD: [145, 150], pI: [88, -88], pD: [84, -84], cara: -1 },
  relajado: { torso: -18, cabeza: -8, bI: [165, 150], bD: [160, 150], pI: [88, -88], pD: [84, -84], cara: 1 },
};

// Paso de andar: piernas y brazos alternos (vista de lado, mirando hacia +x)
export const andando = (t: number, vel = 7): Pose => {
  const f = Math.sin(t * vel);
  return { torso: 4, cabeza: -2, bI: [-28 * f, 20], bD: [28 * f, 20], pI: [26 * f, -10 - 18 * Math.max(0, -f)], pD: [-26 * f, -10 - 18 * Math.max(0, f)], cara: 0.3 };
};

const mezclaN = (a: number, b: number, u: number) => a + (b - a) * u;
const mezclaPar = (a: [number, number], b: [number, number], u: number): [number, number] => [mezclaN(a[0], b[0], u), mezclaN(a[1], b[1], u)];
export const mezclaPose = (a: Pose, b: Pose, u: number): Pose => ({
  torso: mezclaN(a.torso, b.torso, u),
  cabeza: mezclaN(a.cabeza, b.cabeza, u),
  bI: mezclaPar(a.bI, b.bI, u),
  bD: mezclaPar(a.bD, b.bD, u),
  pI: mezclaPar(a.pI, b.pI, u),
  pD: mezclaPar(a.pD, b.pD, u),
  cara: mezclaN(a.cara, b.cara, u),
  hombros: mezclaN(a.hombros ?? 0, b.hombros ?? 0, u),
});
// Secuencia de poses en el tiempo: [[t, pose], …]; entre dos claves se mezcla con una curva suave
export const poseEn = (t: number, claves: [number, Pose][], transicion = 0.35): Pose => {
  let actual = claves[0][1];
  for (let i = 1; i < claves.length; i++) {
    const [ti, p] = claves[i];
    if (t < ti) break;
    const u = Math.min(1, (t - ti) / transicion);
    actual = mezclaPose(actual, p, u * u * (3 - 2 * u));
  }
  return actual;
};

const rad = (g: number) => (g * Math.PI) / 180;
const TORSO = 0.42;
const CUELLO = 0.05;
const R_CABEZA = 0.095;
const BRAZO = [0.2, 0.19];
const PIERNA = [0.25, 0.25];

// Dibuja el stickman con la cadera en «cadera». Devuelve la posición de la cabeza (para bocadillos y marcas)
export const monigote = (tr: Trazo[], cadera: V3, pose: Pose, vista: "frente" | "lado" = "frente", o = 1, escala = 1, t = 0): V3 => {
  const s = escala;
  // Ejes del plano de la figura: «adelante» (o lateral en frente), «arriba» y la profundidad para separar izquierda y derecha
  const ax: V3 = [1, 0, 0];
  const prof: V3 = vista === "lado" ? [0, 0, 1] : [0, 0, 0];
  const punto = (base: V3, ang: number, largo: number, lado: number): V3 => {
    // ang desde la vertical hacia abajo; en frente el lado izquierdo se refleja
    const sx = vista === "frente" ? lado : 1;
    return [base[0] + ax[0] * Math.sin(rad(ang)) * largo * s * sx, base[1] - Math.cos(rad(ang)) * largo * s, base[2] + prof[2] * 0];
  };
  // Vida: respira, cabecea y balancea un poco los brazos aunque esté quieto
  const resp = Math.sin(t * 2.6);
  const balanceo = 3 * Math.sin(t * 2.1);
  pose = { ...pose, cabeza: pose.cabeza + 3 * Math.sin(t * 1.9 + 1), bI: [pose.bI[0] + balanceo, pose.bI[1]], bD: [pose.bD[0] - balanceo, pose.bD[1]] };
  const inc = rad(pose.torso);
  const arriba: V3 = [Math.sin(inc), Math.cos(inc), 0];
  const largoTorso = TORSO * (1 + 0.015 * resp);
  const cuello: V3 = [cadera[0] + arriba[0] * largoTorso * s, cadera[1] + arriba[1] * largoTorso * s, cadera[2]];
  const encogido = (pose.hombros ?? 0) * 0.05 * s;
  const hombro: V3 = [cuello[0] - arriba[0] * 0.03 * s, cuello[1] - arriba[1] * 0.03 * s + encogido, cuello[2]];
  const incC = inc + rad(pose.cabeza);
  const cabeza: V3 = [cuello[0] + Math.sin(incC) * (CUELLO + R_CABEZA) * s, cuello[1] + Math.cos(incC) * (CUELLO + R_CABEZA) * s - encogido * 0.5, cuello[2]];
  const lw = 3.6;
  const linea = (a: V3, b: V3, z = 0) => tr.push({ t: "l", a: [a[0], a[1], a[2] + z], b: [b[0], b[1], b[2] + z], w: lw, o, luz: 0.15 });
  // Tronco y cuello
  linea(cadera, cuello);
  // Piernas (en lado, la izquierda un poco más al fondo)
  for (const [lado, [a1, a2], z] of [[-1, pose.pI, -0.04], [1, pose.pD, 0.04]] as [number, [number, number], number][]) {
    const rodilla = punto(cadera, a1, PIERNA[0], lado);
    const pie = punto(rodilla, a1 + a2, PIERNA[1], lado);
    const zz = vista === "lado" ? z : 0;
    linea(cadera, rodilla, zz);
    linea(rodilla, pie, zz);
  }
  // Brazos
  for (const [lado, [a1, a2], z] of [[-1, pose.bI, -0.04], [1, pose.bD, 0.04]] as [number, [number, number], number][]) {
    const codo = punto(hombro, a1, BRAZO[0], lado);
    const mano = punto(codo, a1 + a2, BRAZO[1], lado);
    const zz = vista === "lado" ? z : 0;
    linea(hombro, codo, zz);
    linea(codo, mano, zz);
  }
  // Cabeza con su cara
  tr.push({ t: "p", pts: circulo(cabeza, R_CABEZA * s, "z", 28), w: lw, o, relleno: "#000", oRelleno: 0.85 * o, luz: 0.15 });
  const c = pose.cara;
  const parpadea = (t + cadera[0] * 7) % 3.1 < 0.12;
  if (vista === "frente") {
    for (const d of [-1, 1]) {
      const ojo: V3 = [cabeza[0] + d * 0.032 * s, cabeza[1] + 0.02 * s, cabeza[2] + 0.01];
      if (parpadea) tr.push({ t: "l", a: [ojo[0] - 0.012 * s, ojo[1], ojo[2]], b: [ojo[0] + 0.012 * s, ojo[1], ojo[2]], w: 2, o });
      else tr.push({ t: "e", c: ojo, r: 0.011 * s, tipo: "punto", o });
      // Cejas: caídas hacia fuera si está hundido, arriba si está contento
      if (Math.abs(c) > 0.3) {
        const y = ojo[1] + 0.03 * s + (c > 0 ? 0.008 * s : 0);
        const dy = c < 0 ? 0.012 * s : -0.004 * s;
        tr.push({ t: "l", a: [ojo[0] - d * 0.016 * s, y + dy, ojo[2]], b: [ojo[0] + d * 0.016 * s, y - dy * 0.3, ojo[2]], w: 2, o });
      }
    }
    const boca: V3[] = Array.from({ length: 9 }, (_, i) => {
      const x = -0.04 + (0.08 * i) / 8;
      return [cabeza[0] + x * s, cabeza[1] - 0.035 * s - c * 0.02 * s * (1 - (x / 0.04) ** 2), cabeza[2] + 0.01];
    });
    tr.push({ t: "p", pts: boca, w: 2, o });
  } else {
    if (parpadea) tr.push({ t: "l", a: [cabeza[0] + 0.035 * s, cabeza[1] + 0.02 * s, cabeza[2] + 0.01], b: [cabeza[0] + 0.058 * s, cabeza[1] + 0.02 * s, cabeza[2] + 0.01], w: 2, o });
    else tr.push({ t: "e", c: [cabeza[0] + 0.045 * s, cabeza[1] + 0.02 * s, cabeza[2] + 0.01], r: 0.011 * s, tipo: "punto", o });
    tr.push({ t: "l", a: [cabeza[0] + 0.03 * s, cabeza[1] - 0.035 * s - c * 0.008 * s, cabeza[2] + 0.01], b: [cabeza[0] + 0.07 * s, cabeza[1] - 0.03 * s + c * 0.008 * s, cabeza[2] + 0.01], w: 2, o });
  }
  // Agobio: rayitas que tiemblan alrededor de la cabeza
  if (c < -0.5) {
    const k = (-c - 0.5) * 2;
    for (let i = 0; i < 3; i++) {
      const a = rad(60 + i * 30) + 0.08 * Math.sin(t * 25 + i);
      const r0 = R_CABEZA * s * 1.35;
      const r1 = R_CABEZA * s * 1.8;
      tr.push({ t: "l", a: [cabeza[0] + Math.cos(a) * r0, cabeza[1] + Math.sin(a) * r0, cabeza[2]], b: [cabeza[0] + Math.cos(a) * r1, cabeza[1] + Math.sin(a) * r1, cabeza[2]], w: 2, o: o * k });
    }
  }
  return cabeza;
};

// Corona de «genio» encima de la cabeza
export const corona = (tr: Trazo[], cabeza: V3, s = 1, o = 1, luz = 0.5) => {
  const y0 = cabeza[1] + R_CABEZA * s * 1.05;
  const pts: V3[] = [[-0.08, 0], [-0.08, 0.07], [-0.04, 0.035], [0, 0.085], [0.04, 0.035], [0.08, 0.07], [0.08, 0], [-0.08, 0]].map(([x, y]) => [cabeza[0] + x * s, y0 + y * s, cabeza[2]]);
  tr.push({ t: "p", pts, w: 2.4, o, luz, relleno: "#fff", oRelleno: 0.15 * o });
};

// Escritorio, silla y monitor (vista de lado: el monitor queda delante del stickman, hacia +x)
export const escritorio = (tr: Trazo[], x0: number, x1: number, y: number, o = 1) => {
  tr.push({ t: "l", a: [x0, y, 0], b: [x1, y, 0], w: 3, o });
  tr.push({ t: "l", a: [x0, y, 0.2], b: [x1, y, 0.2], w: 1.4, o: 0.5 * o });
  for (const x of [x0 + 0.03, x1 - 0.03]) tr.push({ t: "l", a: [x, y, 0], b: [x, -1.0, 0], w: 2, o: 0.8 * o });
};
export const silla = (tr: Trazo[], x: number, y: number, o = 1) => {
  tr.push({ t: "l", a: [x - 0.15, y, 0], b: [x + 0.15, y, 0], w: 3, o });
  tr.push({ t: "l", a: [x - 0.15, y, 0], b: [x - 0.18, y + 0.42, 0], w: 3, o });
  tr.push({ t: "l", a: [x, y, 0], b: [x, -1.0, 0], w: 2, o: 0.8 * o });
  tr.push({ t: "l", a: [x - 0.14, -1.0, 0], b: [x + 0.14, -1.0, 0], w: 2, o: 0.8 * o });
};
// Monitor: marco, peana y la pantalla, en la que «pinta» dibuja con coordenadas locales (u, v) de 0 a 1
export const monitor = (tr: Trazo[], c: V3, ancho: number, alto: number, pinta?: (aPunto: (u: number, v: number) => V3) => void, o = 1) => {
  const [cx, cy, cz] = c;
  const esq: V3[] = [[cx - ancho / 2, cy - alto / 2, cz], [cx + ancho / 2, cy - alto / 2, cz], [cx + ancho / 2, cy + alto / 2, cz], [cx - ancho / 2, cy + alto / 2, cz]];
  tr.push({ t: "p", pts: [...esq, esq[0]], w: 2.6, o, relleno: "#fff", oRelleno: 0.04 * o, luz: 0.2 });
  tr.push({ t: "l", a: [cx, cy - alto / 2, cz], b: [cx, cy - alto / 2 - 0.12, cz], w: 2.6, o });
  tr.push({ t: "l", a: [cx - 0.1, cy - alto / 2 - 0.12, cz], b: [cx + 0.1, cy - alto / 2 - 0.12, cz], w: 2.6, o });
  pinta?.((u, v) => [cx - ancho / 2 + 0.03 + (ancho - 0.06) * u, cy - alto / 2 + 0.03 + (alto - 0.06) * v, cz + 0.005]);
};
