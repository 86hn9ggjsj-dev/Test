import { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { ALTO, ANCHO, C, entra, pop, SAFE, SANS, SERIF, suave, texto, Y_SUBS } from "./util";

export type Palabra = { w: string; s: number; e: number; hook: boolean };
type Props = {
  t: number;
  palabras: Palabra[];
  // Tiempos en los que un bloque no puede continuar (cambios de escena)
  cortes: number[];
  claves: Record<string, string>;
  duracion: number;
  // Altura del centro del subtítulo (fracción de la pantalla) para un bloque visible entre ini y fin
  y?: (ini: number, fin: number) => number;
  // "impacto": mayúsculas con borde grueso y rebote; "premium": sans fina + serif cursiva en las palabras clave
  estilo?: "impacto" | "premium";
};

export const ORO = "#e8c27a";
const SOMBRA_PREMIUM = "0 2px 4px rgba(0,0,0,0.45), 0 6px 28px rgba(0,0,0,0.55)";

export const limpia = (w: string) => w.toLowerCase().replace(/[.,¿?¡!]/g, "");

// Bloques de 1-3 palabras, una línea, cortando en puntuación, pausas y cambios de escena
const agrupar = (palabras: Palabra[], cortes: number[], claves: Record<string, string>) => {
  const bloques: Palabra[][] = [];
  for (const p of palabras) {
    const actual = bloques[bloques.length - 1];
    const ultima = actual?.[actual.length - 1];
    const chars = actual ? actual.map((w) => w.w).join(" ").length + p.w.length + 1 : 0;
    const nuevo =
      !actual ||
      actual.length >= 3 ||
      chars > 17 ||
      /[.,?]$/.test(ultima!.w) ||
      p.s - ultima!.e > 0.3 ||
      p.hook !== ultima!.hook ||
      cortes.some((c) => c > ultima!.s && c <= p.s) ||
      (claves[limpia(p.w)] === C.rojo && actual.length >= 2);
    if (nuevo) bloques.push([p]);
    else actual.push(p);
  }
  return bloques;
};

const yPorDefecto = () => Y_SUBS / ALTO;

export const Subtitulos: React.FC<Props> = ({ t, palabras, cortes, claves, duracion, y = yPorDefecto, estilo = "impacto" }) => {
  const bloques = useMemo(() => agrupar(palabras, cortes, claves), [palabras, cortes, claves]);
  const intervalo = (k: number) => {
    const b = bloques[k];
    const sig = bloques[k + 1]?.[0].s ?? duracion;
    return [b[0].s - 0.04, Math.min(sig - 0.04, b[b.length - 1].e + 0.6)];
  };
  const idx = bloques.findIndex((_, k) => {
    const [ini, fin] = intervalo(k);
    return t >= ini && t < fin;
  });
  if (idx < 0) return null;
  const b = bloques[idx];
  if (estilo === "premium") return <BloquePremium t={t} b={b} claves={claves} top={y(...(intervalo(idx) as [number, number])) * ALTO} />;
  const chars = b.map((w) => w.w).join(" ").length;
  // Ancho medio de Montserrat Black en mayúsculas ≈ 0.72em; se reserva hueco para el escalado de la palabra activa
  const size = Math.min(104, (ANCHO - 2 * SAFE.lados) / (chars * 0.72 * 1.12 + 0.3 * (b.length - 1)));
  const p = pop(t, b[0].s - 0.04, 260);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: y(...(intervalo(idx) as [number, number])) * ALTO,
          left: SAFE.lados,
          right: SAFE.lados,
          transform: `translateY(-50%) translateY(${(1 - p) * 24}px) scale(${0.7 + 0.3 * p})`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: size * 0.3,
          whiteSpace: "nowrap",
        }}
      >
        {b.map((w, k) => {
          const fin = b[k + 1]?.s ?? w.e + 0.25;
          const activa = t >= w.s - 0.02 && t < fin;
          const color = claves[limpia(w.w)];
          const pw = pop(t, w.s - 0.02, 320);
          const extra = activa ? (color ? 0.16 : 0.08) * pw : 0;
          const escala = 1 + extra;
          // margen para que la palabra ampliada no invada a sus vecinas
          const margen = (w.w.length * 0.72 * size * extra) / 2;
          return (
            <span
              key={k}
              style={{
                ...texto,
                fontSize: size,
                display: "inline-block",
                color: activa ? color ?? C.amarillo : t >= w.s ? (color ?? C.blanco) : C.blanco,
                transform: `scale(${escala})`,
                margin: `0 ${margen}px`,
              }}
            >
              {w.w.replace(/[.,]$/, "")}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const BloquePremium: React.FC<{ t: number; b: Palabra[]; claves: Record<string, string>; top: number }> = ({ t, b, claves, top }) => {
  // Inter Tight 700 ≈ 0.5em por carácter; la serif cursiva va a 1.3x pero es más estrecha
  const ancho = b.reduce((a, w) => a + w.w.length * (claves[limpia(w.w)] ? 0.5 : 0.52), 0);
  const size = Math.min(80, (ANCHO - 2 * SAFE.lados) / (ancho + 0.28 * (b.length - 1)));
  const a = entra(t, b[0].s - 0.06, 0.2);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top,
          left: SAFE.lados,
          right: SAFE.lados,
          transform: `translateY(-50%) translateY(${(1 - a) * 16}px)`,
          opacity: a,
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
          gap: size * 0.26,
          whiteSpace: "nowrap",
        }}
      >
        {b.map((w, k) => {
          const clave = !!claves[limpia(w.w)];
          const dicha = t >= w.s - 0.02;
          const brillo = 0.45 + 0.55 * suave(Math.min(Math.max((t - w.s + 0.02) / 0.12, 0), 1));
          return (
            <span
              key={k}
              style={{
                fontFamily: clave ? SERIF : SANS,
                fontStyle: clave ? "italic" : "normal",
                fontWeight: clave ? 400 : 700,
                fontSize: clave ? size * 1.3 : size,
                letterSpacing: clave ? "0" : "-0.015em",
                color: clave && dicha ? ORO : C.blanco,
                opacity: brillo,
                textShadow: SOMBRA_PREMIUM,
                lineHeight: 1,
              }}
            >
              {w.w.replace(/[.,]$/, "")}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
