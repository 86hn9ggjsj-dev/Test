import { continueRender, delayRender, Easing, interpolate, spring, staticFile } from "remotion";
import timeline from "../gen/timeline.json";

export const FPS = 60;
export const ANCHO = 1080;
export const ALTO = 1920;
export const TL = timeline;

// Zonas seguras 9:16 (UI de TikTok/Reels)
export const SAFE = { arriba: 0.12 * ALTO, abajo: 0.2 * ALTO, lados: 0.13 * ANCHO };
export const Y_SUBS = 0.65 * ALTO;

export const C = {
  fondo: "#060a14",
  blanco: "#ffffff",
  amarillo: "#ffe14d",
  verde: "#39ff88",
  rojo: "#ff4d5e",
  azul: "#4fd1ff",
};

export const FUENTE = "Montserrat, sans-serif";

const cargando = delayRender("fuentes");
Promise.all(
  [800, 900].map((w) =>
    new FontFace("Montserrat", `url(${staticFile(`fonts/montserrat-latin-${w}-normal.woff2`)}) format('woff2')`, {
      weight: String(w),
    })
      .load()
      .then((f) => document.fonts.add(f)),
  ),
).then(() => continueRender(cargando));

export const palabra = (i: number, hook = false) => {
  const p = TL.palabras.find((w) => w.i === i && w.hook === hook);
  if (!p) throw new Error(`palabra ${i}`);
  return p;
};
export const escena = (id: string) => {
  const e = TL.escenas.find((x) => x.id === id);
  if (!e) throw new Error(`escena ${id}`);
  return e;
};

export const suave = Easing.bezier(0.45, 0, 0.55, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const lerp = (t: number, a: number, b: number, va: number, vb: number, easing = suave) =>
  interpolate(t, [a, b], [va, vb], { ...clamp, easing });

// Pop-in con leve overshoot (rebote)
export const pop = (t: number, t0: number, rigidez = 190) =>
  t < t0 ? 0 : spring({ frame: (t - t0) * FPS, fps: FPS, config: { damping: 11, stiffness: rigidez, mass: 0.6 } });

// Entrada suave 0→1 (≈220 ms) y salida 1→0 al final del plano (≈160 ms)
export const entra = (t: number, t0: number, d = 0.22) => lerp(t, t0, t0 + d, 0, 1);
export const sale = (t: number, t1: number, d = 0.16) => lerp(t, t1 - d, t1, 1, 0);

// Punch-in: sube con easing, mantiene y vuelve
export const golpeZoom = (t: number, t0: number, amt: number, sube = 0.22, mantiene = 0.35, baja = 0.5) => {
  if (t < t0) return 0;
  if (t < t0 + sube) return amt * suave((t - t0) / sube);
  if (t < t0 + sube + mantiene) return amt;
  return amt * (1 - suave(Math.min((t - t0 - sube - mantiene) / baja, 1)));
};

export const temblor = (t: number, t0: number, a = 18) => {
  const d = t - t0;
  if (d < 0 || d > 0.5) return { x: 0, y: 0 };
  const k = a * Math.exp(-d * 9);
  return { x: k * Math.sin(d * 71), y: k * Math.cos(d * 53) };
};

export const ruido = (k: number) => {
  const x = Math.sin(k * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const texto = {
  fontFamily: FUENTE,
  fontWeight: 900,
  color: C.blanco,
  textTransform: "uppercase",
  WebkitTextStroke: "10px #000",
  paintOrder: "stroke fill",
  textShadow: "0 8px 0 rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.5)",
} as const;
