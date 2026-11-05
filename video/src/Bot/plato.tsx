// Decorado 2D para las escenas del stickman (src/Bot/stick.tsx): suelo, pantalla de velas sobre su pie, saldo encima de
// la pantalla, reloj y cámara (zoom lento, golpe y temblor) que envuelve la escena.
import React from "react";
import { AbsoluteFill } from "remotion";
import { euros, mono } from "./piezas";
import { ROJO } from "./kit";

export const SUELO_Y = 1380;
export const PANT = { x0: 600, y0: 600, x1: 1010, y1: 1010 };

export const Suelo: React.FC<{ y?: number }> = ({ y = SUELO_Y }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <line x1={60} x2={1020} y1={y} y2={y} stroke="#fff" strokeWidth={2} opacity={0.55} />
    {[0, 1, 2, 3].map((i) => (
      <line key={i} x1={60 + i * 40} x2={1020 - i * 40} y1={y + 34 + i * 30} y2={y + 34 + i * 30} stroke="#fff" strokeWidth={1.4} opacity={0.14 - i * 0.03} />
    ))}
  </svg>
);

// Pantalla con velas de una serie de cierres: sube = vela llena, baja = hueca; la última puede ir en color
export const Pantalla: React.FC<{
  serie: number[];
  n?: number;
  ultima?: string;
  k?: number; // 0…1 intensidad del color de la última
  etiqueta?: string;
  entrada?: number;
  hijos?: React.ReactNode;
  caja?: { x0: number; y0: number; x1: number; y1: number };
  suelo?: number;
}> = ({ serie: original, n: nOriginal = original.length, ultima, k = 1, etiqueta = "BTC / USD · 5M", entrada, hijos, caja = PANT, suelo = SUELO_Y }) => {
  const { x0, y0, x1, y1 } = caja;
  // Como mucho 14 velas, para que se lean gruesas (se queda siempre con la última)
  const cada = Math.ceil(original.length / 14);
  const serie = original.filter((_, i) => (original.length - 1 - i) % cada === 0);
  const n = Math.ceil((nOriginal - ((original.length - 1) % cada)) / cada);
  const lo = Math.min(...serie);
  const hi = Math.max(...serie);
  const y = (v: number) => y1 - 40 - ((v - lo) / Math.max(hi - lo, 1e-6)) * (y1 - y0 - 120);
  const paso = (x1 - x0 - 60) / Math.max(serie.length - 1, 1);
  const ancho = Math.min(22, paso * 0.62);
  const vis = Math.max(1, Math.min(n, serie.length));
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={(x0 + x1) / 2} x2={(x0 + x1) / 2} y1={y1} y2={suelo} stroke="#fff" strokeWidth={3} opacity={0.8} />
        <line x1={(x0 + x1) / 2 - 70} x2={(x0 + x1) / 2 + 70} y1={suelo} y2={suelo} stroke="#fff" strokeWidth={5} strokeLinecap="round" />
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={18} fill="#050505" stroke="#fff" strokeWidth={3} />
        {[1, 2, 3].map((i) => (
          <line key={i} x1={x0 + 14} x2={x1 - 14} y1={y0 + 60 + i * 80} y2={y0 + 60 + i * 80} stroke="#fff" strokeWidth={1} opacity={0.1} />
        ))}
        {entrada !== undefined && <line x1={x0 + 20} x2={x1 - 20} y1={y(entrada)} y2={y(entrada)} stroke="#fff" strokeWidth={1.6} strokeDasharray="8 8" opacity={0.45} />}
        {serie.slice(0, vis).map((cierra, i) => {
          const abre = i === 0 ? cierra - (serie[1] - serie[0]) * 0.5 : serie[i - 1];
          const x = x0 + 30 + i * paso;
          const a = y(abre);
          const c = y(cierra);
          const arriba = Math.min(a, c);
          const alto = Math.max(3, Math.abs(c - a));
          const esUltima = ultima !== undefined && k > 0.02 && i === vis - 1 && vis === serie.length;
          const col = esUltima ? ultima : "#fff";
          const llena = esUltima || cierra >= abre;
          const o = esUltima ? 0.35 + 0.65 * k : 1;
          return (
            <g key={i} opacity={o}>
              <line x1={x} x2={x} y1={arriba - 10} y2={arriba + alto + 10} stroke={col} strokeWidth={2.2} />
              <rect x={x - ancho / 2} y={arriba} width={ancho} height={alto} fill={llena ? col : "#050505"} stroke={col} strokeWidth={2.2} rx={2} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: x0 + 26, top: y0 + 22, ...mono(22, 0.55) }}>{etiqueta}</div>
      {hijos}
    </>
  );
};

// Saldo (o P&L) encima de la pantalla: blanco mientras aguanta y rojo cuando se hunde
export const SaldoPantalla: React.FC<{ valor: number; rojoBajo?: number; k?: number; titulo?: string; signo?: boolean; caja?: typeof PANT }> = ({ valor, rojoBajo = 6000, k = 0, titulo = "SALDO", signo = false, caja = PANT }) => {
  const rojo = valor < rojoBajo;
  return (
    <div style={{ position: "absolute", left: caja.x0, width: caja.x1 - caja.x0, top: caja.y0 - 118, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={mono(22, 0.55)}>{titulo}</div>
      <div style={{ ...mono(64), color: rojo ? ROJO : "#fff", transform: `scale(${1 + 0.2 * k})` }}>
        {signo ? (valor >= 0 ? "+" : "−") : valor < 0 ? "−" : ""}
        {euros(Math.abs(valor))} €
      </div>
    </div>
  );
};

// Reloj que gira deprisa
export const Reloj: React.FC<{ x: number; y: number; r: number; t: number; vel?: number }> = ({ x, y, r, t, vel = 9 }) => {
  const a = t * vel;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <circle cx={x} cy={y} r={r} fill="#000" stroke="#fff" strokeWidth={3} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={x + Math.sin((i * Math.PI) / 2) * r * 0.78} y1={y - Math.cos((i * Math.PI) / 2) * r * 0.78} x2={x + Math.sin((i * Math.PI) / 2) * r * 0.92} y2={y - Math.cos((i * Math.PI) / 2) * r * 0.92} stroke="#fff" strokeWidth={2} />
      ))}
      <line x1={x} y1={y} x2={x + Math.sin(a) * r * 0.75} y2={y - Math.cos(a) * r * 0.75} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      <line x1={x} y1={y} x2={x + Math.sin(a / 12) * r * 0.5} y2={y - Math.cos(a / 12) * r * 0.5} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
};

// Cámara 2D: zoom alrededor de un punto, desplazamiento y temblor
export const Camara: React.FC<{ zoom?: number; dx?: number; dy?: number; origen?: string; children: React.ReactNode }> = ({ zoom = 1, dx = 0, dy = 0, origen = "50% 60%", children }) => (
  <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${zoom})`, transformOrigin: origen }}>{children}</AbsoluteFill>
);
