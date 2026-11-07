// Piezas compartidas de los reels con stickman 2D: bocadillo, «!», fogonazo rojo, polvo de fondo, cámara de escena,
// poses que se repiten y el «sígueme» con el stickman señalando el botón y saltando al pulsarse.
import React from "react";
import { AbsoluteFill } from "remotion";
import { L, mono, muelle } from "./piezas";
import { Camara as Cam, Escena, orbita, polvo, proyector, V3 } from "./tres";
import { cabezaPx, Clave, Cuerpo, cuerpoEn, Estado, R_CABEZA, Stick } from "./stick";
import { PANT, Suelo, SUELO_Y } from "./plato";
import { CtaSeguir, golpe, P, sacude } from "../Explica/Montaje";

export const OX = 330;
export const ESC = 370;

// Bocadillo de cómic encima de la cabeza, sin pisar la pantalla de la derecha
export const Bocadillo: React.FC<{ t: number; t0: number; c: Cuerpo; ox?: number; oy?: number; s?: number; texto: string; fin?: number; limite?: number }> = ({ t, t0, c, ox = OX, oy = SUELO_Y, s = ESC, texto, fin, limite = PANT.x0 - 12 }) => {
  const g = muelle(t, t0, 260, 14);
  const fuera = fin === undefined ? 0 : L(t, fin - 0.2, fin, 0, 1);
  if (g <= 0.001 || fuera >= 1) return null;
  const [hx, hy] = cabezaPx(c, ox, oy, s);
  const medio = (texto.length * 20.4 + 64) / 2;
  const x = Math.min(Math.max(hx, medio + 30), limite - medio);
  return (
    <div style={{ position: "absolute", left: x, top: hy - R_CABEZA * s - 26, transform: `translate(-50%, -100%) scale(${0.6 + 0.4 * Math.min(g, 1.1)})`, transformOrigin: "50% 100%", opacity: Math.min(g * 1.5, 1) * (1 - fuera) }}>
      <div style={{ position: "relative", padding: "16px 32px", borderRadius: 26, border: "3px solid #fff", background: "#000", whiteSpace: "nowrap", ...mono(34) }}>
        {texto}
        <div style={{ position: "absolute", left: `calc(50% + ${hx - x}px)`, bottom: -17, width: 28, height: 28, marginLeft: -14, background: "#000", borderRight: "3px solid #fff", borderBottom: "3px solid #fff", transform: "rotate(45deg)" }} />
      </div>
    </div>
  );
};

export const Polvo: React.FC<P> = ({ t, s, e }) => <Escena cam={orbita([0, 0, 0], 9, L(t, s, e, -0.3, 0.2), 0.2, { apertura: 40 })} trazos={polvo(0.25)} />;

export const FlashRojo: React.FC<{ t: number; t0: number; o?: number }> = ({ t, t0, o = 0.16 }) => {
  const k = t < t0 ? 0 : o * Math.exp(-(t - t0) * 3);
  return k > 0.005 ? <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(255,77,94,${k}))` }} /> : null;
};

// Signo que salta junto a la cabeza («!» de susto, «?» de duda)
export const Exclama: React.FC<{ t: number; t0: number; c: Cuerpo; ox?: number; oy?: number; s?: number; signo?: string; dura?: number }> = ({ t, t0, c, ox = OX, oy = SUELO_Y, s = ESC, signo = "!", dura = 0.45 }) => {
  const g = t < t0 ? 0 : muelle(t, t0, 260, 12) * (1 - L(t, t0 + dura, t0 + dura + 0.2, 0, 1));
  if (g < 0.01) return null;
  const [hx, hy] = cabezaPx(c, ox, oy, s);
  return <div style={{ position: "absolute", left: hx + R_CABEZA * s + 10, top: hy - R_CABEZA * s - 110, ...mono(120 * (s / ESC)), fontWeight: 700, transform: `scale(${g}) rotate(12deg)`, transformOrigin: "50% 100%" }}>{signo}</div>;
};

// Cámara de escena: acercamiento lento, golpe y temblor en el momento clave
export const camara = (t: number, s: number, e: number, t0 = -9) => ({ zoom: L(t, s, e, 1, 1.05) + 0.04 * golpe(t, t0), dx: sacude(t, t0, 0.04) * 420 });

// Poses que se repiten
export const CHOQUE: Partial<Cuerpo> = { ojos: 1.45, cejas: 1, abre: 0.85, boca: 0, mIx: -0.32, mIy: -0.3, mDx: 0.32, mDy: -0.3 };
export const MANOS_CABEZA: Partial<Cuerpo> = { mIx: -0.17, mIy: 0.27, mDx: 0.17, mDy: 0.27, cejas: -1, boca: -1, abre: 0.4, agobio: 1, incl: 0, ojos: 1.1 };
export const HUNDIDO: Partial<Cuerpo> = { y: 0.73, agacha: 0.5, boca: -1, abre: 0, cejas: -1, ojos: 0.75, mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52, incl: 0 };
export const ENCOGE: Partial<Cuerpo> = { mIx: -0.42, mIy: -0.08, mDx: 0.42, mDy: -0.08, cejas: 0.8, boca: -0.3, cabeza: 0.14 };
export const BRAZOS_ARRIBA: Partial<Cuerpo> = { mIx: -0.27, mIy: 0.48, mDx: 0.27, mDy: 0.48 };
export const sentado = (x: number): Partial<Cuerpo> => ({ x, y: 0.2, pIx: x - 0.48, pDx: x + 0.48, agacha: 1, mIx: -0.36, mIy: -0.27, mDx: 0.36, mDy: -0.27, abre: 0, boca: -1, ojos: 0.6, agobio: 0.5, mira: 0, incl: 0 });

// «Sígueme» a mitad: el stickman señala el botón y da un saltito cuando pasa a «Siguiendo»
const clavesSigue = (s: number): Clave[] => [
  [s - 0.05, { mDx: 0.5, mDy: 0.4, mira: 0.6, boca: 0.6, cejas: 0.5, incl: 0.05 }],
  [s + 0.5, { y: 0.6, mDx: 0.3, mDy: -0.3, mIx: -0.3, mIy: -0.3, incl: 0 }],
  [s + 0.68, { y: 0.95, ...BRAZOS_ARRIBA, boca: 1, abre: 0.7, ojos: 1.2 }],
  [s + 0.74, { pIy: 0.28, pDy: 0.28 }],
  [s + 0.92, { pIy: 0, pDy: 0, y: 0.79 }],
];
export const SiguemeStick: React.FC<P & { lema: string }> = (p) => {
  const { t, s } = p;
  const c = cuerpoEn(t, clavesSigue(s), {}, s - 0.3);
  return (
    <>
      <CtaSeguir {...p} />
      <Suelo />
      <Stick c={c} ox={250} oy={SUELO_Y} s={330} t={t} />
    </>
  );
};

// Stickman dentro de una escena 3D: el punto del suelo bajo sus pies se proyecta con la cámara y su escala sale de la
// profundidad (k = unidades del mundo por unidad del stickman). Se dibuja de frente, como un recortable, encima de la escena.
export type Ancla = { ox: number; oy: number; s: number };
export const anclaje = (cam: Cam, pie: V3, k: number): Ancla => {
  const g = proyector(cam)(pie);
  return { ox: g.x, oy: g.y, s: g.k * k };
};
export const StickMundo: React.FC<{ a: Ancla; c: Estado; t: number; perfil?: number; o?: number; gorra?: boolean }> = ({ a, c, t, perfil, o, gorra }) => <Stick c={c} ox={a.ox} oy={a.oy} s={a.s} t={t} perfil={perfil} o={o} gorra={gorra} />;
