// Piezas compartidas de los motion graphics: muelles, tipografía de la casa (titular con máscara, texto
// monoespaciado que se teclea), etiquetas ancladas a puntos de pantalla y retículas de mira.
import { spring } from "remotion";
import { recogida } from "../Premium/ui";
import { ANCHO, FPS, lerp, MONO, SANS, SERIF } from "../Viral/util";
import { io } from "./tres";

export const muelle = (t: number, t0: number, rigidez = 140, amort = 15, masa = 0.9) =>
  t < t0 ? 0 : spring({ frame: (t - t0) * FPS, fps: FPS, config: { stiffness: rigidez, damping: amort, mass: masa } });
export const L = (t: number, a: number, b: number, va: number, vb: number, e = io) => lerp(t, a, b, va, vb, e);
export const dos = (n: number) => (n < 10 ? "0" : "") + n;
export const euros = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export const SOMBRA = "0 2px 12px rgba(0,0,0,0.7)";
export const mono = (size: number, o = 1): React.CSSProperties => ({
  fontFamily: MONO,
  fontWeight: 500,
  fontSize: size,
  lineHeight: 1.1,
  color: `rgba(255,255,255,${o})`,
  letterSpacing: "0.02em",
  whiteSpace: "nowrap",
});

// Titular de la casa: palabras que suben desde detrás de una máscara; las marcadas con * van en serif cursiva
export const Titular: React.FC<{ t: number; t0: number; texto: string; size: number; fin?: number; paso?: number }> = ({ t, t0, texto, size, fin, paso = 0.07 }) => {
  const fuera = fin === undefined ? 0 : lerp(t, fin - 0.25, fin, 0, 1, recogida);
  if (t < t0 - 0.05 || fuera >= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: size * 0.26 }}>
      {texto.split(" ").map((p, i) => {
        const k = muelle(t, t0 + i * paso, 170, 17);
        const serif = p.startsWith("*");
        const estilo: React.CSSProperties = serif
          ? { fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: size * 1.22, letterSpacing: 0 }
          : { fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: "-0.025em" };
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.16em", marginBottom: "-0.16em" }}>
            <span style={{ display: "inline-block", ...estilo, color: "#fff", lineHeight: 1.04, whiteSpace: "nowrap", textShadow: SOMBRA, transform: `translateY(${(1 - k) * 112 + fuera * 112}%)` }}>
              {p.replace(/\*/g, "")}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// Texto monoespaciado que se escribe carácter a carácter
export const Teclea: React.FC<{ t: number; t0: number; texto: string; size?: number; o?: number; cps?: number }> = ({ t, t0, texto, size = 28, o = 0.7, cps = 40 }) => {
  const n = Math.max(0, Math.min(texto.length, Math.floor((t - t0) * cps)));
  if (n === 0) return null;
  return <span style={mono(size, o)}>{texto.slice(0, n)}</span>;
};

export const Arriba: React.FC<{ top?: number; children: React.ReactNode }> = ({ top = 280, children }) => (
  <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>{children}</div>
);

// Retícula de mira (esquinas) sobre un punto de pantalla
export const Reticula: React.FC<{ q: { x: number; y: number }; r: number; k: number; o?: number }> = ({ q, r, k, o = 1 }) => {
  if (k <= 0.001) return null;
  const R = r * (1.7 - 0.7 * Math.min(k, 1.2));
  const a = R * 0.45;
  const esquinas = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  return (
    <g opacity={Math.min(k * 1.5, 1) * o} stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="square">
      {esquinas.map(([sx, sy], i) => (
        <path key={i} d={`M${q.x + sx * R},${q.y + sy * (R - a)} L${q.x + sx * R},${q.y + sy * R} L${q.x + sx * (R - a)},${q.y + sy * R}`} />
      ))}
      <circle cx={q.x} cy={q.y} r={3} fill="#fff" stroke="none" />
    </g>
  );
};

// Etiqueta monoespaciada anclada a un punto de pantalla: sube desde detrás de una máscara
export const Etiqueta: React.FC<{ t: number; t0: number; x: number; y: number; size?: number; o?: number; alinea?: "izq" | "der" | "centro"; children: React.ReactNode }> = ({
  t,
  t0,
  x,
  y,
  size = 30,
  o = 1,
  alinea = "izq",
  children,
}) => {
  const k = muelle(t, t0, 200, 18);
  if (k <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(${alinea === "izq" ? 0 : alinea === "der" ? -100 : -50}%, -50%)`, overflow: "hidden" }}>
      <div style={{ ...mono(size, o), transform: `translateY(${(1 - Math.min(k, 1)) * 100}%)` }}>{children}</div>
    </div>
  );
};
