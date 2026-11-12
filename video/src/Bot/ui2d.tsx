// Piezas 2D compartidas de los reels 5-30-10: pantalla del monitor del despacho, fichas grandes (cifras), píldoras,
// rótulos anclados a la escena y flechas 3D. Antes estaban copiadas en cada reel.
import React from "react";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "./piezas";
import { Camara, proyector, Trazo, V3 } from "./tres";
import { DESPACHO } from "./decorados";

// Pantalla 2D encima del monitor del despacho (se adapta al rectángulo proyectado)
export const PantallaPC: React.FC<{ cam: Camara; o?: number; fondo?: string; children: (w: number, h: number) => React.ReactNode }> = ({ cam, o = 1, fondo = "#030303", children }) => {
  const pr = proyector(cam);
  const { c, w, h } = DESPACHO.MON;
  const a = pr([c[0] - w / 2 + 0.018, c[1] + h / 2 - 0.018, c[2] + 0.01]);
  const b = pr([c[0] + w / 2 - 0.018, c[1] - h / 2 + 0.018, c[2] + 0.01]);
  return <div style={{ position: "absolute", left: a.x, top: a.y, width: b.x - a.x, height: b.y - a.y, overflow: "hidden", borderRadius: 6, opacity: o, background: fondo }}>{children(b.x - a.x, b.y - a.y)}</div>;
};

// Ficha grande tipo marcador (cifras, multiplicadores)
export const Ficha: React.FC<{ t: number; t0: number; texto: string; color?: string; size?: number; x?: number; y?: number; fin?: number; sub?: string }> = ({ t, t0, texto, color = "#fff", size = 150, x = ANCHO / 2, y = 760, fin: f, sub }) => {
  const g = muelle(t, t0, 260, 13);
  const fuera = f === undefined ? 0 : L(t, f - 0.2, f, 0, 1);
  if (g < 0.01 || fuera >= 1) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${(0.5 + 0.5 * Math.min(g, 1.1)) * (1 - 0.3 * fuera)}) rotate(${-3 + 3 * Math.min(g, 1)}deg)`, opacity: Math.min(g * 1.6, 1) * (1 - fuera), display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", padding: `${size * 0.12}px ${size * 0.22}px`, borderRadius: size * 0.16, background: "linear-gradient(180deg, #1a1a1a 0%, #111 49%, #000 51%, #0a0a0a 100%)", border: `4px solid ${color}`, boxShadow: `0 ${size * 0.08}px 0 #000, 0 0 40px ${color}55` }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1, color, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{texto}</span>
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 3, background: "#000" }} />
      </div>
      {sub && <span style={{ ...mono(size * 0.24), fontWeight: 700, color, whiteSpace: "nowrap" }}>{sub}</span>}
    </div>
  );
};

export const Pildora: React.FC<{ t: number; t0: number; color?: string; size?: number; fin?: number; children: React.ReactNode }> = ({ t, t0, color = "#fff", size = 44, fin: f, children }) => {
  const g = muelle(t, t0, 240, 13);
  const fuera = f === undefined ? 0 : L(t, f - 0.2, f, 0, 1);
  if (g < 0.01 || fuera >= 1) return null;
  return <div style={{ ...mono(size), fontWeight: 700, color, padding: "10px 24px", borderRadius: 14, border: `3px solid ${color}`, background: "rgba(0,0,0,0.9)", opacity: Math.min(g * 1.5, 1) * (1 - fuera), transform: `scale(${0.6 + 0.4 * Math.min(g, 1.1)})`, whiteSpace: "nowrap" }}>{children}</div>;
};

export const Arriba: React.FC<{ top?: number; children: React.ReactNode }> = ({ top = 300, children }) => (
  <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>{children}</div>
);
export const Abajo: React.FC<{ top?: number; children: React.ReactNode }> = ({ top = 1230, children }) => (
  <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 18 }}>{children}</div>
);

export const Rotulo: React.FC<{ x: number; y: number; size?: number; color?: string; o?: number; ancla?: string; caja?: boolean; children: React.ReactNode }> = ({ x, y, size = 34, color = "#fff", o = 1, ancla = "translate(-50%, -50%)", caja, children }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: ancla, ...mono(size), fontWeight: 700, color, opacity: o, textShadow: "0 0 16px rgba(0,0,0,0.95)", ...(caja ? { padding: "6px 16px", borderRadius: 12, border: `3px solid ${color}`, background: "rgba(0,0,0,0.9)" } : {}) }}>{children}</div>
);

// Flecha 3D en el plano x-y
export const flecha3D = (tr: Trazo[], a: V3, b: V3, color: string, w = 4, luz = 0.5) => {
  tr.push({ t: "l", a, b, w, o: 1, color, luz });
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  const p = 0.07;
  tr.push({ t: "p", pts: [[b[0] - ux * p - uy * p * 0.6, b[1] - uy * p + ux * p * 0.6, b[2]], b, [b[0] - ux * p + uy * p * 0.6, b[1] - uy * p - ux * p * 0.6, b[2]]], w, o: 1, color, luz });
};

// Moneda 2D (€) que vuela de a hasta b en arco entre t0 y t1
export const Moneda: React.FC<{ t: number; t0: number; t1: number; a: [number, number]; b: [number, number]; size?: number; color?: string; texto?: string }> = ({ t, t0, t1, a, b, size = 56, color = "#fff", texto = "€" }) => {
  if (t < t0 || t > t1) return null;
  const u = (t - t0) / (t1 - t0);
  const x = a[0] + (b[0] - a[0]) * u;
  const y = a[1] + (b[1] - a[1]) * u - Math.sin(u * Math.PI) * 160;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scaleX(${Math.cos(u * 12)})`, width: size, height: size, borderRadius: size / 2, border: `4px solid ${color}`, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: size * 0.5, color, opacity: 1 - L(t, t1 - 0.1, t1, 0, 1) }}>{texto}</div>
  );
};
