import { AbsoluteFill } from "remotion";
import { ANCHO, C, pop, SAFE, texto, TL, Y_SUBS } from "./util";

type Palabra = (typeof TL.palabras)[number];

const limpia = (w: string) => w.toLowerCase().replace(/[.,¿?¡!]/g, "");
const CLAVE: Record<string, string> = {
  estrategia: C.verde,
  entras: C.verde,
  vuelve: C.verde,
  beneficio: C.verde,
  tranquilo: C.azul,
  problema: C.rojo,
  contra: C.rojo,
  dudas: C.rojo,
  stop: C.rojo,
  emociones: C.rojo,
  mañana: C.amarillo,
  mismo: C.rojo,
};

// Bloques de 1-3 palabras, una línea, cortando en puntuación, pausas y cambios de escena
const cambiaEscena = (a: number, b: number) => TL.escenas.some((e) => e.s > a && e.s <= b);
const bloques: Palabra[][] = [];
for (const p of TL.palabras) {
  const actual = bloques[bloques.length - 1];
  const ultima = actual?.[actual.length - 1];
  const chars = actual ? actual.map((w) => w.w).join(" ").length + p.w.length + 1 : 0;
  const nuevo =
    !actual ||
    actual.length >= 3 ||
    chars > 17 ||
    /[.,]$/.test(ultima!.w) ||
    p.s - ultima!.e > 0.3 ||
    p.hook !== ultima!.hook ||
    cambiaEscena(ultima!.s, p.s) ||
    CLAVE[limpia(p.w)] === C.rojo && actual.length >= 2;
  if (nuevo) bloques.push([p]);
  else actual.push(p);
}

export const Subtitulos: React.FC<{ t: number }> = ({ t }) => {
  const idx = bloques.findIndex((b, k) => {
    const ini = b[0].s - 0.04;
    const sig = bloques[k + 1]?.[0].s ?? TL.duracion;
    const fin = Math.min(sig - 0.04, b[b.length - 1].e + 0.6);
    return t >= ini && t < fin;
  });
  if (idx < 0) return null;
  const b = bloques[idx];
  const chars = b.map((w) => w.w).join(" ").length;
  // Ancho medio de Montserrat Black en mayúsculas ≈ 0.72em; se reserva hueco para el escalado de la palabra activa
  const size = Math.min(104, (ANCHO - 2 * SAFE.lados) / (chars * 0.72 * 1.12 + 0.3 * (b.length - 1)));
  const p = pop(t, b[0].s - 0.04, 260);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: Y_SUBS,
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
          const color = CLAVE[limpia(w.w)];
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
