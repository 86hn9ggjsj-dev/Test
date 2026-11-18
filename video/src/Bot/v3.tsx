// Piezas del formato v3 «dopamina» (cortos de 20-30 s sin personajes): cifras que corren, marcas ✓/✗ que se dibujan,
// tickets, iconos de Instagram (guardar, enviar) y un rótulo pequeño. Estilo limpio: una cosa principal a la vez,
// trazo blanco y toques de verde y rojo.
import React from "react";
import { ANCHO, SANS, SERIF } from "../Viral/util";
import { L, mono, muelle } from "./piezas";

export const pop = (t: number, t0: number) => muelle(t, t0, 260, 13);
export const sal = (u: number) => 1 - Math.pow(1 - u, 3);
const miles = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// Rótulo pequeño arriba (lugar o paso): uno solo a la vez
export const Rotulito: React.FC<{ t: number; t0: number; texto: string; top?: number; color?: string; fin?: number }> = ({ t, t0, texto, top = 330, color = "#fff", fin }) => {
  const o = L(t, t0, t0 + 0.2, 0, 1) * (fin === undefined ? 1 : 1 - L(t, fin - 0.2, fin, 0, 1));
  if (o <= 0.01) return null;
  return <div style={{ position: "absolute", top, left: 0, width: ANCHO, textAlign: "center", ...mono(40), fontWeight: 700, letterSpacing: "0.18em", color, opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>{texto}</div>;
};

// Cifra que corre de «de» a «a» entre t0 y t1 y da un salto al llegar
export const Cifra: React.FC<{ t: number; t0: number; t1: number; de: number; a: number; x?: number; y: number; size?: number; color?: string; pre?: string; suf?: string; o?: number }> = ({ t, t0, t1, de, a, x = ANCHO / 2, y, size = 200, color = "#fff", pre = "", suf = "", o = 1 }) => {
  const v = de + (a - de) * sal(L(t, t0, t1, 0, 1, (u) => u));
  const g = pop(t, t1);
  const salto = 1 + 0.12 * Math.max(0, 1 - Math.abs(g - 1) * 4) * (t > t1 ? Math.exp(-(t - t1) * 5) : 0);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${salto})`, fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: "-0.04em", color, whiteSpace: "nowrap", opacity: o, textShadow: `0 0 40px ${color}55` }}>
      {pre}
      {miles(Math.round(v))}
      {suf}
    </div>
  );
};

// Marca ✓ o ✗ que se dibuja de un trazo
export const Marca: React.FC<{ t: number; t0: number; x: number; y: number; size?: number; color: string; tipo: "ok" | "no"; circulo?: boolean }> = ({ t, t0, x, y, size = 120, color, tipo, circulo = true }) => {
  const u = L(t, t0, t0 + 0.18, 0, 1, (v) => v);
  const g = pop(t, t0);
  if (u <= 0) return null;
  const d = tipo === "ok" ? "M28 52 L44 68 L74 34" : "M32 32 L68 68 M68 32 L32 68";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, overflow: "visible", transform: `scale(${0.6 + 0.4 * Math.min(g, 1.15)})`, filter: `drop-shadow(0 0 14px ${color})` }}>
      {circulo && <circle cx={50} cy={50} r={44} fill="#000" stroke={color} strokeWidth={6} />}
      <path d={d} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - u} />
    </svg>
  );
};

// Ticket con muescas (cuotas, operaciones)
export const Ticket: React.FC<{ x: number; y: number; w?: number; h?: number; rot?: number; s?: number; o?: number; color?: string; children?: React.ReactNode }> = ({ x, y, w = 360, h = 220, rot = 0, s = 1, o = 1, color = "#fff", children }) => {
  const r = 26;
  const d = `M${r} 0 H${w - r} A${r} ${r} 0 0 1 ${w} ${r} V${h / 2 - 22} A22 22 0 0 0 ${w} ${h / 2 + 22} V${h - r} A${r} ${r} 0 0 1 ${w - r} ${h} H${r} A${r} ${r} 0 0 1 0 ${h - r} V${h / 2 + 22} A22 22 0 0 0 0 ${h / 2 - 22} V${r} A${r} ${r} 0 0 1 ${r} 0 Z`;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg) scale(${s})`, opacity: o }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={d} fill="#050505" stroke={color} strokeWidth={4} />
        <line x1={30} x2={w - 30} y1={h / 2} y2={h / 2} stroke={color} strokeWidth={2} strokeDasharray="8 8" opacity={0.25} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>{children}</div>
    </div>
  );
};

// Botón grande que se hunde al pulsarlo (k = 0..1)
export const Boton: React.FC<{ x: number; y: number; w?: number; h?: number; texto: string; color: string; k?: number; o?: number; lleno?: number }> = ({ x, y, w = 520, h = 170, texto, color, k = 0, o = 1, lleno = 0 }) => (
  <div style={{ left: x - w / 2, top: y - h / 2 + 12 * k, width: w, height: h, borderRadius: h / 2, border: `5px solid ${color}`, background: "#000", overflow: "hidden", position: "absolute", boxShadow: `0 ${16 - 12 * k}px 0 ${color}55, 0 0 ${30 + 40 * k}px ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: h * 0.42, letterSpacing: "0.02em", color: lleno > 0.5 ? "#000" : color, opacity: o }}>
    <div style={{ position: "absolute", inset: 0, background: color, opacity: lleno }} />
    <span style={{ position: "relative" }}>{texto}</span>
  </div>
);
// Pulsación: 0 → 1 → 0 en 0,22 s
export const pulsa = (t: number, t0: number) => (t < t0 ? 0 : t - t0 < 0.08 ? (t - t0) / 0.08 : Math.max(0, 1 - (t - t0 - 0.08) / 0.14));

// Palabra enorme en serif cursiva que cae de golpe
export const Golpe: React.FC<{ t: number; t0: number; texto: string; y: number; size?: number; color?: string; fin?: number }> = ({ t, t0, texto, y, size = 260, color = "#fff", fin }) => {
  const g = pop(t, t0);
  const fuera = fin === undefined ? 0 : L(t, fin - 0.2, fin, 0, 1);
  if (g <= 0.01 || fuera >= 1) return null;
  return (
    <div style={{ position: "absolute", left: 0, width: ANCHO, top: y, transform: `translateY(-50%) scale(${2.2 - 1.2 * Math.min(g, 1.05)})`, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: size, lineHeight: 1, color, opacity: Math.min(g * 2, 1) * (1 - fuera), textShadow: `0 0 50px ${color}66` }}>
      {texto}
    </div>
  );
};

// Iconos de Instagram en trazo
export const Guardar: React.FC<{ x: number; y: number; size?: number; lleno?: number; s?: number }> = ({ x, y, size = 300, lleno = 0, s = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, overflow: "visible", transform: `scale(${s})`, filter: lleno > 0.5 ? "drop-shadow(0 0 30px rgba(255,255,255,0.6))" : undefined }}>
    <path d="M24 10 H76 V90 L50 68 L24 90 Z" fill={`rgba(255,255,255,${lleno})`} stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
  </svg>
);
export const Enviar: React.FC<{ x: number; y: number; size?: number; rot?: number; o?: number }> = ({ x, y, size = 260, rot = 0, o = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, overflow: "visible", transform: `rotate(${rot}deg)`, opacity: o, filter: "drop-shadow(0 0 24px rgba(255,255,255,0.45))" }}>
    <path d="M92 8 L8 40 L42 54 Z M92 8 L42 54 L56 92 Z" fill="none" stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
  </svg>
);
export const Ancla: React.FC<{ x: number; y: number; size?: number; color?: string; rot?: number; o?: number }> = ({ x, y, size = 200, color = "#fff", rot = 0, o = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, overflow: "visible", transform: `rotate(${rot}deg)`, transformOrigin: "50% 0%", opacity: o, filter: `drop-shadow(0 0 16px ${color}88)` }}>
    <circle cx={50} cy={14} r={9} fill="none" stroke={color} strokeWidth={6} />
    <line x1={50} y1={23} x2={50} y2={90} stroke={color} strokeWidth={7} strokeLinecap="round" />
    <line x1={32} y1={36} x2={68} y2={36} stroke={color} strokeWidth={7} strokeLinecap="round" />
    <path d="M14 60 Q22 90 50 90 Q78 90 86 60" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />
    <path d="M8 66 L14 56 L22 64 M92 66 L86 56 L78 64" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
