// Montaje común de los videos de motion graphics con voz en off (Explica, Prueba): pantallas encadenadas con
// fundido, subtítulos y barra de progreso, más las piezas que comparten (kicker, botón de seguir, paseos aleatorios).
import { useMemo } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Progreso, salida } from "../Premium/ui";
import { Palabra, Subtitulos } from "../Viral/Subtitulos";
import { ANCHO, lerp, ruido, SANS } from "../Viral/util";
import { Arriba, L, mono, muelle, Teclea, Titular } from "../Bot/piezas";
import { Escena, io, orbita, polvo } from "../Bot/tres";

export type Datos = { fps: number; duracion: number; palabras: Palabra[]; escenas: { id: string; s: number; e: number }[] };
export type P = { t: number; s: number; e: number };

const norm = (w: string) => w.toLowerCase().replace(/[^\wáéíóúñü%]/g, "");
// Momento en que se dice una palabra (la primera vez a partir de "desde")
export const cuando = (datos: Datos) => (w: string, desde = 0) => datos.palabras.find((p) => p.s >= desde - 0.1 && norm(p.w) === w)?.s ?? desde;

// Paseo aleatorio suave y reproducible
export const paseo = (n: number, semilla: number, paso: number, deriva = 0): number[] => {
  const v = [0];
  for (let i = 1; i < n; i++) v.push(v[i - 1] + deriva + (ruido(semilla * 131 + i * 17) - 0.5) * paso);
  return v;
};

export const Kicker: React.FC<{ t: number; t0: number; texto: string }> = ({ t, t0, texto }) => (
  <div style={{ position: "absolute", top: 228, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
    <Teclea t={t} t0={t0} texto={texto} size={26} o={0.6} />
  </div>
);

export const pct = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(Math.round(v))} %`;
// Reescala una serie al rango [y0, y1]
export const escala = (v: number[], y0: number, y1: number) => {
  const lo = Math.min(...v);
  const hi = Math.max(...v);
  return v.map((x) => y0 + ((x - lo) / (hi - lo)) * (y1 - y0));
};
// Cifra grande en la franja inferior, por encima de los subtítulos
export const Abajo: React.FC<{ o?: number; top?: number; children: React.ReactNode }> = ({ o = 1, top = 1255, children }) => (
  <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 18, alignItems: "baseline", opacity: o }}>{children}</div>
);

// Botón "Seguir" que se pulsa solo y pasa a "Siguiendo ✓"
export const BotonSeguir: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const boton = muelle(t, t0 + 0.05, 200, 16);
  const pulsa = muelle(t, t0 + 0.5, 260, 15);
  const onda = L(t, t0 + 0.5, t0 + 1.1, 0, 1, salida);
  const blanco = pulsa > 0.5;
  return (
    <div style={{ position: "absolute", top: 470, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", opacity: Math.min(boton * 1.6, 1), transform: `scale(${(0.8 + 0.2 * boton) * (1 - 0.06 * Math.sin(Math.min(pulsa, 1) * Math.PI))})` }}>
        {onda > 0 && onda < 1 && <div style={{ position: "absolute", inset: -20 - 40 * onda, borderRadius: 999, border: "2px solid #fff", opacity: 1 - onda }} />}
        <div style={{ padding: "26px 60px", borderRadius: 999, border: "2px solid #fff", background: blanco ? "#fff" : "transparent", color: blanco ? "#000" : "#fff", fontFamily: SANS, fontWeight: 700, fontSize: 52, letterSpacing: "-0.01em" }}>
          {blanco ? "Siguiendo ✓" : "Seguir"}
        </div>
      </div>
    </div>
  );
};

// Cifra gigante en el centro, con su pie
export const Gigante: React.FC<{ t: number; t0: number; fin?: number; texto: string; pie?: string; top?: number; size?: number; tacha?: number }> = ({ t, t0, fin, texto, pie, top = 760, size = 230, tacha }) => {
  const g = muelle(t, t0, 210, 14);
  const fuera = fin === undefined ? 0 : L(t, fin - 0.2, fin, 0, 1);
  if (g <= 0.001 || fuera >= 1) return null;
  const raya = tacha === undefined ? 0 : L(t, tacha, tacha + 0.3, 0, 1, salida);
  return (
    <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: Math.min(g * 1.5, 1) * (1 - fuera) * (1 - 0.55 * raya) }}>
      <div style={{ position: "relative", ...mono(size), letterSpacing: "-0.03em", transform: `scale(${0.75 + 0.25 * Math.min(g, 1.1)})` }}>
        {texto}
        <div style={{ position: "absolute", left: -20, top: "52%", height: 10, width: `calc(${raya * 100}% + ${raya * 40}px)`, background: "#fff" }} />
      </div>
      {pie && <span style={mono(30, 0.6)}>{pie}</span>}
    </div>
  );
};

// Cierre de los reels de alcance: «sígueme» con el botón que se pulsa y la cuenta auditada del bot en la bio
export const CtaSeguir: React.FC<P & { lema: string }> = ({ t, s, e, lema }) => (
  <>
    <Escena cam={orbita([0, 0, 0], 9, L(t, s, e, -0.3, 0.2), 0.2, { apertura: 40 })} trazos={polvo(0.35)} />
    <BotonSeguir t={t} t0={s} />
    <div style={{ position: "absolute", top: 660, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, s + 0.6, s + 0.9, 0, 1, salida) }}>
      <span style={{ ...mono(30, 0.85), padding: "12px 24px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.5)" }}>↗ CUENTA AUDITADA DEL BOT EN LA BIO</span>
    </div>
    <Kicker t={t} t0={s + 0.05} texto={lema} />
    <Arriba>
      <Titular t={t} t0={s + 0.05} texto="*sígueme*" size={110} />
    </Arriba>
  </>
);

const FUNDE = 0.16;

export const Montaje: React.FC<{ t: number; datos: Datos; audio: string; piezas: Record<string, React.FC<P>>; claves: Record<string, string> }> = ({ t, datos, audio, piezas, claves }) => {
  const cortes = useMemo(() => datos.escenas.map((x) => x.s), [datos]);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 50% 45%, #0b0b0c, #000)" }}>
      <Audio src={staticFile(audio)} />
      {datos.escenas
        .filter((p) => t >= p.s - FUNDE && t < p.e + FUNDE)
        .map((p) => {
          const Pieza = piezas[p.id];
          const entra = p.s <= 0.01 ? 1 : lerp(t, p.s - FUNDE, p.s + FUNDE, 0, 1, io);
          const sale = p.e >= datos.duracion - 0.01 ? 0 : lerp(t, p.e - FUNDE, p.e + FUNDE, 0, 1, io);
          return (
            <AbsoluteFill key={p.id} style={{ opacity: entra * (1 - sale), transform: `translateY(${(1 - entra) * 40 - sale * 40}px)` }}>
              <Pieza t={t} s={p.s} e={p.e} />
            </AbsoluteFill>
          );
        })}
      <Subtitulos t={t} palabras={datos.palabras} cortes={cortes} claves={claves} duracion={datos.duracion} y={() => 0.765} estilo="premium" dinamico />
      <Progreso t={t} duracion={datos.duracion} />
    </AbsoluteFill>
  );
};

// Palabras clave de los subtítulos (en blanco, serif cursiva)
export const claves = (palabras: string[]) => {
  const c: Record<string, string> = {};
  for (const w of palabras) c[w] = "#ffffff";
  return c;
};
