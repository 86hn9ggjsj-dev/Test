// Piezas de los reels de historias reales (solo subtítulos abajo): contador grande, temblor de cámara y la pregunta final
// con dos botones, un cursor que duda, el bocadillo de comentarios y la píldora de «etiqueta / mándaselo».
import React from "react";
import { AbsoluteFill } from "remotion";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { euros, L, mono, muelle } from "./piezas";
import { Escena, orbita, polvo } from "./tres";
import { ROJO, VERDE } from "./kit";
import { golpe, P, sacude } from "../Explica/Montaje";

export const fr = (v: number) => ((v % 1) + 1) % 1;

// Cifra que corre deprisa hasta su valor (cifras de ancho fijo para que no baile)
export const Contador: React.FC<{ valor: number; signo: string; color: string; size: number; sufijo?: string }> = ({ valor, signo, color, size, sufijo = " $" }) => (
  <div style={{ ...mono(size), color, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
    {signo}
    {euros(valor)}
    {sufijo}
  </div>
);

// Contador con su rótulo pequeño encima, que entra con un muelle
export const Marcador: React.FC<{ t: number; t0: number; t1: number; hasta: number; signo: string; color: string; rotulo?: string; top?: number; size?: number; sufijo?: string }> = ({ t, t0, t1, hasta, signo, color, rotulo, top = 360, size = 92, sufijo }) => {
  const g = muelle(t, t0 - 0.05, 170, 14);
  if (g <= 0.01) return null;
  const valor = L(t, t0, t1, 0, hasta, (u) => 1 - Math.pow(1 - u, 3));
  return (
    <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: Math.min(g * 1.5, 1), transform: `scale(${0.6 + 0.4 * Math.min(g, 1.1)})` }}>
      {rotulo && <span style={mono(28, 0.7)}>{rotulo}</span>}
      <Contador valor={valor} signo={signo} color={color} size={size} sufijo={sufijo} />
    </div>
  );
};

export const CamaraTiembla: React.FC<{ t: number; t0: number; a?: number; children: React.ReactNode }> = ({ t, t0, a = 0.04, children }) => (
  <AbsoluteFill style={{ transform: `translateX(${sacude(t, t0, a) * 420}px) scale(${1 + 0.03 * golpe(t, t0)})` }}>{children}</AbsoluteFill>
);

export const FlashVerde: React.FC<{ t: number; t0: number; o?: number }> = ({ t, t0, o = 0.12 }) => {
  const k = t < t0 ? 0 : o * Math.exp(-(t - t0) * 3);
  return k > 0.005 ? <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(47,224,138,${k}))` }} /> : null;
};

// Pregunta final con dos botones (el de la izquierda en verde, el de la derecha en rojo)
type Opcion = { texto: string; sub?: string; t0: number };
const Boton: React.FC<{ x: number; o: Opcion; color: string; activo: number; g: number; giro: number }> = ({ x, o, color, activo, g, giro }) => (
  <div style={{ position: "absolute", left: x, top: 470, width: 420, perspective: 1200, opacity: Math.min(Math.max(g, 0) * 1.5, 1) }}>
    <div style={{ height: 190, borderRadius: 30, border: `4px solid ${color}`, background: `rgba(${color === VERDE ? "47,224,138" : "255,77,94"},${0.06 + 0.25 * activo})`, boxShadow: activo > 0.05 ? `0 0 ${60 * activo}px ${color}66` : undefined, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, transform: `rotateY(${giro}deg) scale(${(0.7 + 0.3 * Math.min(Math.max(g, 0), 1.1)) * (1 + 0.06 * activo)})`, color }}>
      <span style={{ ...mono(o.sub ? 56 : 64), fontWeight: 700, color }}>{o.texto}</span>
      {o.sub && <span style={{ ...mono(28), color, opacity: 0.85 }}>{o.sub}</span>}
    </div>
  </div>
);
export const PreguntaDos: React.FC<P & { izq: Opcion; der: Opcion; pie: string; tPie: number; encima?: React.ReactNode }> = ({ t, s, e, izq, der, pie, tPie, encima }) => {
  const a = L(t, izq.t0 - 0.15, izq.t0 + 0.1, 0, 1) * (1 - L(t, der.t0 - 0.3, der.t0 - 0.1, 0, 1));
  const b = L(t, der.t0 - 0.15, der.t0 + 0.1, 0, 1) * (1 - L(t, tPie + 0.2, tPie + 0.5, 0, 1));
  const ambos = L(t, tPie + 0.2, tPie + 0.5, 0, 1) * (0.5 + 0.5 * Math.sin((t - s) * 5));
  const cx = 540 + 250 * Math.sin((t - s) * 2.4) * (1 - 0.3 * ambos);
  const cy = 690 + 30 * Math.sin((t - s) * 4.1);
  const punto = (i: number) => 0.35 + 0.65 * Math.max(0, Math.sin((t - s) * 7 - i * 0.9));
  return (
    <>
      <Escena cam={orbita([0, 0, 0], 9, L(t, s, e, -0.3, 0.2), 0.2, { apertura: 40 })} trazos={polvo(0.35)} />
      <Boton x={80} o={izq} color={VERDE} activo={Math.max(a, ambos)} g={muelle(t, s + 0.05, 220, 14)} giro={10} />
      <Boton x={580} o={der} color={ROJO} activo={Math.max(b, ambos)} g={muelle(t, s + 0.15, 220, 14)} giro={-10} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={`M${cx},${cy} l0,64 l16,-15 l12,27 l10,-5 l-12,-26 l22,-2 z`} fill="#fff" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", top: 820, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, s + 0.3, s + 0.6, 0, 1) }}>
        <svg width={360} height={216} viewBox="0 0 300 180">
          <path d="M40 10 H260 A30 30 0 0 1 290 40 V100 A30 30 0 0 1 260 130 H110 L70 168 L80 130 H40 A30 30 0 0 1 10 100 V40 A30 30 0 0 1 40 10 Z" fill="none" stroke="#fff" strokeWidth={3} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={110 + i * 40} cy={70} r={11} fill="#fff" opacity={punto(i)} />
          ))}
        </svg>
      </div>
      <div style={{ position: "absolute", top: 1100, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, tPie - 0.1, tPie + 0.2, 0, 1, salida) }}>
        <span style={{ ...mono(30, 0.9), padding: "14px 26px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{`↓ ${pie}`}</span>
      </div>
      {encima}
    </>
  );
};

// Sello que cae girando (VENDIDO, MANIPULADO…)
export const Sello: React.FC<{ t: number; t0: number; texto: string; top: number; color?: string; size?: number; fin?: number }> = ({ t, t0, texto, top, color = ROJO, size = 70, fin }) => {
  const g = muelle(t, t0, 260, 11);
  const fuera = fin === undefined ? 0 : L(t, fin - 0.25, fin, 0, 1);
  if (g <= 0.01 || fuera >= 1) return null;
  return (
    <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: 1 - fuera }}>
      <span style={{ ...mono(size), fontWeight: 700, color, padding: "10px 30px", border: `6px solid ${color}`, borderRadius: 12, background: "rgba(0,0,0,0.75)", transform: `rotate(-8deg) scale(${2 - Math.min(g, 1.1)})`, opacity: Math.min(g * 1.5, 1) }}>{texto}</span>
    </div>
  );
};
