// Pantallas de motion graphics del video "bot". Lenguaje visual: monocromo, alambre 3D con cámara en movimiento,
// profundidad de campo y cifras en monoespaciada; los motivos salen del propio mensaje (gráficos, órdenes, curvas
// de capital, bloques de capital) y la tipografía es la de la casa: sans con la palabra clave en serif cursiva.
import { AbsoluteFill, Easing, spring } from "remotion";
import datos from "../gen/bot.json";
import { recogida, salida } from "../Premium/ui";
import { ANCHO, FPS, lerp, MONO, ruido, SANS, SERIF } from "../Viral/util";
import { caja, circulo, clave, Escena, io, mezcla, orbita, polvo, proyector, Trazo, V3 } from "./tres";

const EV = datos.eventos;

type Tramo = { id: string; s: number; e: number };
export const PANTALLAS: Tramo[] = ["intro", "reloj", "auto", "noventa", "gestion", "prop", "cta"].map((id) => ({
  id,
  s: EV[`p_${id}_s` as keyof typeof EV] as number,
  e: EV[`p_${id}_e` as keyof typeof EV] as number,
}));

// Tramos contiguos (< 0.2 s de separación) comparten fondo: no se ve el video "parpadear" entre ellos
const BLOQUES: { s: number; e: number }[] = [];
for (const p of PANTALLAS) {
  const ult = BLOQUES[BLOQUES.length - 1];
  if (ult && p.s - ult.e < 0.2) ult.e = p.e;
  else BLOQUES.push({ s: p.s, e: p.e });
}

export const fondoEn = (t: number) => {
  const b = BLOQUES.find((x) => t >= x.s && t < x.e);
  if (!b) return 0;
  const entrada = b.s <= 0.01 ? 1 : lerp(t, b.s, b.s + 0.3, 0, 1, salida);
  const fin = b.e >= datos.duracion - 0.01 ? 0 : lerp(t, b.e - 0.25, b.e, 0, 1, recogida);
  return entrada * (1 - fin);
};

// ------------------------------------------------------------------ primitivas
const muelle = (t: number, t0: number, rigidez = 140, amort = 15, masa = 0.9) =>
  t < t0 ? 0 : spring({ frame: (t - t0) * FPS, fps: FPS, config: { stiffness: rigidez, damping: amort, mass: masa } });
const L = (t: number, a: number, b: number, va: number, vb: number, e = io) => lerp(t, a, b, va, vb, e);
const dos = (n: number) => (n < 10 ? "0" : "") + n;
const euros = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const SOMBRA = "0 2px 12px rgba(0,0,0,0.7)";
const mono = (size: number, o = 1): React.CSSProperties => ({
  fontFamily: MONO,
  fontWeight: 500,
  fontSize: size,
  lineHeight: 1.1,
  color: `rgba(255,255,255,${o})`,
  letterSpacing: "0.02em",
  whiteSpace: "nowrap",
});

// Titular de la casa: palabras que suben desde detrás de una máscara; las marcadas con * van en serif cursiva
const Titular: React.FC<{ t: number; t0: number; texto: string; size: number; fin?: number; paso?: number }> = ({ t, t0, texto, size, fin, paso = 0.07 }) => {
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
const Teclea: React.FC<{ t: number; t0: number; texto: string; size?: number; o?: number; cps?: number }> = ({ t, t0, texto, size = 28, o = 0.7, cps = 40 }) => {
  const n = Math.max(0, Math.min(texto.length, Math.floor((t - t0) * cps)));
  if (n === 0) return null;
  return <span style={mono(size, o)}>{texto.slice(0, n)}</span>;
};

const Arriba: React.FC<{ top?: number; children: React.ReactNode }> = ({ top = 280, children }) => (
  <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>{children}</div>
);

// Retícula de mira (esquinas) sobre un punto de pantalla
const Reticula: React.FC<{ q: { x: number; y: number }; r: number; k: number; o?: number }> = ({ q, r, k, o = 1 }) => {
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
const Etiqueta: React.FC<{ t: number; t0: number; x: number; y: number; size?: number; o?: number; alinea?: "izq" | "der" | "centro"; children: React.ReactNode }> = ({
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

// ------------------------------------------------------------------ contenedor
export const Pantallas: React.FC<{ t: number }> = ({ t }) => {
  const f = fondoEn(t);
  if (f <= 0) return null;
  const actual = PANTALLAS.find((p) => t >= p.s && t < p.e);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 50% 45%, #0b0b0c, #000)", opacity: f }} />
      {actual && <Contenido t={t} p={actual} />}
    </AbsoluteFill>
  );
};

const Contenido: React.FC<{ t: number; p: Tramo }> = ({ t, p }) => {
  const entra = p.s <= 0.01 ? 1 : lerp(t, p.s, p.s + 0.3, 0, 1, salida);
  const sale = p.e >= datos.duracion - 0.01 ? 0 : lerp(t, p.e - 0.28, p.e, 0, 1, recogida);
  const Pieza = { intro: Intro, reloj: Reloj, auto: Auto, noventa: Noventa, gestion: Gestion, prop: Prop, cta: Cta }[p.id]!;
  return (
    <AbsoluteFill style={{ opacity: entra * (1 - sale), transform: `translateY(${-sale * 60}px)` }}>
      <Pieza t={t} s={p.s} e={p.e} />
    </AbsoluteFill>
  );
};

type P = { t: number; s: number; e: number };

// ------------------------------------------------------------------ 1. Intro: la cámara recorre un gráfico 3D y marca tres puntos
// Precio como paseo aleatorio con tendencia, con "cortina" de líneas hasta el suelo
const RUTA: V3[] = (() => {
  const pts: V3[] = [];
  let y = -0.55;
  for (let i = 0; i <= 60; i++) {
    y += 0.024 + (ruido(i * 19 + 7) - 0.5) * 0.17;
    pts.push([-4.2 + i * 0.14, y, 0]);
  }
  return pts;
})();
const MARCAS = [30, 40, 50];
const Intro: React.FC<P> = ({ t, s, e }) => {
  const dib = L(t, s + 0.02, s + 1.05, 0, 1, Easing.bezier(0.3, 0, 0.2, 1));
  const i0 = Math.min(Math.floor(dib * 60), 59);
  const cabeza = mezcla(RUTA[i0], RUTA[i0 + 1], dib * 60 - i0);
  const cam = orbita(
    [clave(t, [[s, cabeza[0] - 1.2], [s + 1.05, 1.9], [e, 1.4]]), clave(t, [[s, -0.2], [s + 1.05, 0.45], [e, 0.3]]), 0],
    clave(t, [[s, 4.6], [s + 1.05, 6.4], [e, 8.2]]),
    clave(t, [[s, 1.05], [e, 0.72]]),
    clave(t, [[s, 0.05], [e, 0.2]]),
    { apertura: 22, centroY: 980 },
  );
  const tr: Trazo[] = [...polvo(0.35)];
  for (let i = -6; i <= 6; i++) tr.push({ t: "l", a: [i * 0.7, -1.3, -2.5], b: [i * 0.7, -1.3, 2.5], w: 1, o: 0.09 });
  for (let j = -3; j <= 3; j++) tr.push({ t: "l", a: [-4.6, -1.3, j * 0.7], b: [4.6, -1.3, j * 0.7], w: 1, o: 0.09 });
  tr.push({ t: "p", pts: RUTA, w: 3, o: 1, prog: dib, luz: 0.5 });
  RUTA.forEach((p, i) => {
    if (i / 60 > dib) return;
    tr.push({ t: "l", a: p, b: [p[0], -1.3, 0], w: 1, o: MARCAS.indexOf(i) >= 0 ? 0.55 : 0.13 });
  });
  if (dib < 1) tr.push({ t: "e", c: cabeza, r: 0.045, tipo: "punto", luz: 1 });
  const pr = proyector(cam);
  return (
    <>
      <Escena
        cam={cam}
        trazos={tr}
        encima={(p) => MARCAS.map((m, i) => <Reticula key={m} q={p(RUTA[m])} r={34} k={muelle(t, EV.tres + i * 0.12, 220, 14)} />)}
      />
      {MARCAS.map((m, i) => {
        const q = pr(RUTA[m]);
        return (
          <Etiqueta key={m} t={t} t0={EV.tres + i * 0.12 + 0.05} x={q.x} y={q.y - 66} alinea="centro">
            {`0${i + 1}`}
          </Etiqueta>
        );
      })}
      <Arriba>
        <Titular t={t} t0={EV.tres - 0.08} texto="3 *ventajas*" size={118} />
        <div style={{ height: 34, display: "flex", alignItems: "center" }}>
          <Teclea t={t} t0={EV.tres + 0.35} texto="DE TENER UN BOT DE TRADING" size={26} />
        </div>
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Reloj: pasan las horas y el bot va operando solo
const OPS = [0.06, 0.14, 0.23, 0.31, 0.4, 0.47, 0.58, 0.66, 0.74, 0.83, 0.91];
const Reloj: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 9.4, 8.1), L(t, s, e, 0.4, -0.45), L(t, s, e, 0.86, 0.6), { apertura: 45, centroY: 980 });
  const R = 1.25;
  const pos = (th: number, r: number, y = 0): V3 => [r * Math.sin(th), y, -r * Math.cos(th)];
  const tr: Trazo[] = [...polvo(0.3)];
  const dib = L(t, s + 0.05, s + 0.9, 0, 1, salida);
  tr.push({ t: "p", pts: circulo([0, 0, 0], R, "y", 120, -Math.PI / 2, Math.PI * 1.5), w: 1.8, o: 0.9, prog: dib });
  tr.push({ t: "p", pts: circulo([0, 0, 0], R * 1.16, "y", 120), w: 1, o: 0.3 * dib, dash: "2 9" });
  for (let i = 0; i < 60; i++) {
    if (dib < i / 60) break;
    const th = (i / 60) * Math.PI * 2;
    if (i % 5 === 0) tr.push({ t: "l", a: pos(th, R * 0.8), b: pos(th, R * 0.93), w: 2.4, o: 0.95 });
    else tr.push({ t: "e", c: pos(th, R * 0.89), r: 0.016, tipo: "punto", o: 0.55 });
  }
  // De las 08:00 a las 20:00: arranca despacio, vuela y frena (el horario da una vuelta completa)
  const curva = Easing.bezier(0.55, 0, 0.3, 1);
  const avance = (x: number) => L(x, s + 0.3, e - 0.15, 0, 1, curva);
  const u = avance(t);
  const m = 8 * 60 + u * 12 * 60;
  const thM = ((m % 60) / 60) * Math.PI * 2;
  const thH = (m / 720) * Math.PI * 2;
  const paso = (((avance(t) - avance(t - 1 / 30)) * 12 * 60) / 60) * Math.PI * 2;
  const kH = muelle(t, s + 0.45, 150, 15);
  const estela = Math.min(paso * 5, 2.4);
  for (let j = 0; j < 10 && estela > 0.02; j++) {
    const a1 = thM - (estela * j) / 10;
    const a0 = thM - (estela * (j + 1)) / 10;
    tr.push({ t: "p", pts: Array.from({ length: 6 }, (_, q) => pos(a0 + ((a1 - a0) * q) / 5, R * 0.74)), w: 3, o: 0.5 * (1 - j / 10) * kH });
  }
  tr.push({ t: "l", a: [0, 0, 0], b: pos(thH, R * 0.48 * kH), w: 4.2, o: 0.9 });
  tr.push({ t: "l", a: [0, 0, 0], b: pos(thM, R * 0.74 * kH), w: 2.6, o: 1 });
  tr.push({ t: "p", pts: circulo([0, 0, 0], 0.07, "y", 20), w: 2, o: kH });
  // Cada vez que el horario pasa por una operación, el bot la ejecuta: marca en el anillo exterior
  let hechas = 0;
  OPS.forEach((op, i) => {
    if (u < op) return;
    hechas++;
    const th = op * Math.PI * 2;
    const k = muelle(t, s + 0.3 + op * (e - s - 0.45), 220, 13);
    const largo = 0.12 + 0.1 * ruido(i * 5);
    tr.push({ t: "l", a: pos(th, R * 1.16), b: pos(th, R * 1.16, largo * Math.min(k, 1.3)), w: 2.4, o: 1, luz: Math.max(0, 1 - (u - op) * 8) });
    tr.push({ t: "e", c: pos(th, R * 1.16, largo * Math.min(k, 1.3)), r: 0.025, tipo: "punto", o: 1 });
  });
  const hm = Math.floor(m);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 1290, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 46, opacity: dib }}>
        <span style={mono(40)}>{`${dos(Math.floor(hm / 60) % 24)}:${dos(hm % 60)}`}</span>
        <span style={mono(40, 0.55)}>{`OPS ${dos(hechas)}`}</span>
      </div>
      <div style={{ position: "absolute", top: 230, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
        <Teclea t={t} t0={s + 0.15} texto="LIBERTAD DE TIEMPO" size={26} o={0.6} />
      </div>
      <Arriba>
        <Titular t={t} t0={EV.grafico - 0.1} texto="sin mirar el *gráfico*" size={78} />
        <Titular t={t} t0={EV.pendiente - 0.1} texto="ni estar *pendiente*" size={78} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Automático: registro de órdenes que se ejecutan solas, en un panel 3D
const ORDENES = [
  ["08:14:02", "BUY ", "0.10", "+0,42%"],
  ["09:31:47", "SELL", "0.10", "+0,18%"],
  ["10:05:13", "BUY ", "0.12", "-0,09%"],
  ["11:48:30", "BUY ", "0.10", "+0,37%"],
  ["13:02:55", "SELL", "0.15", "+0,51%"],
  ["14:27:09", "BUY ", "0.10", "+0,22%"],
  ["15:40:41", "SELL", "0.10", "+0,30%"],
  ["16:59:18", "BUY ", "0.12", "+0,14%"],
  ["18:12:06", "SELL", "0.10", "+0,46%"],
  ["19:33:52", "BUY ", "0.10", "+0,27%"],
];
const Auto: React.FC<P> = ({ t, s, e }) => {
  const pct = L(t, EV.auto1 - 0.2, EV.auto1 + 0.6, 0, 1, salida);
  const FILA = 66;
  const tf = (i: number) => s + 0.08 + i * 0.1;
  const subido = ORDENES.reduce((a, _, i) => a + Math.min(muelle(t, tf(i), 200, 20), 1), 0);
  const scroll = Math.max(0, subido - 6) * FILA;
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.3, 0.3), 0.3, { apertura: 40 });
  const mascara = "linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent)";
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <div style={{ position: "absolute", top: 600, left: 0, width: ANCHO, height: 700, perspective: 1300, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: 860,
            height: 600,
            borderRadius: 22,
            border: "1.5px solid rgba(255,255,255,0.45)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
            transform: `rotateX(${L(t, s, e, 30, 18)}deg) rotateY(${L(t, s, e, -24, -8)}deg) translateZ(${L(t, s, e, -40, 90)}px)`,
            overflow: "hidden",
            boxShadow: "0 0 60px rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", padding: "22px 32px", borderBottom: "1px solid rgba(255,255,255,0.18)" }}>
            <span style={mono(24, 0.6)}>XAUUSD · EJECUCIÓN</span>
            <span style={mono(24)}>
              <span style={{ opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 6)) }}>●</span> AUTO
            </span>
          </div>
          <div style={{ position: "relative", height: 520, overflow: "hidden", maskImage: mascara, WebkitMaskImage: mascara }}>
            <div style={{ transform: `translateY(${-scroll + 30}px)` }}>
              {ORDENES.map(([hora, lado, lote, res], i) => {
                const k = muelle(t, tf(i), 200, 20);
                return (
                  <div key={i} style={{ height: FILA, display: "flex", alignItems: "center", gap: 34, padding: "0 32px", opacity: Math.min(k * 1.6, 1), transform: `translateX(${(1 - Math.min(k, 1)) * 60}px)` }}>
                    <span style={mono(28, 0.45)}>{hora}</span>
                    <span style={mono(28)}>{lado}</span>
                    <span style={mono(28, 0.7)}>{lote}</span>
                    <span style={{ ...mono(28, 0.9), marginLeft: "auto" }}>{res}</span>
                    <span style={mono(28)}>✓</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Arriba top={250}>
        <span style={{ ...mono(116), opacity: pct > 0 ? 1 : 0 }}>{`${Math.round(pct * 100)}%`}</span>
        <Titular t={t} t0={EV.auto1 + 0.4} texto="en *automático*" size={84} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. 99 %: cien curvas de capital; 99 se hunden, una sigue subiendo
const SUPERVIVIENTE = 61;
const CURVAS: V3[][] = Array.from({ length: 100 }, (_, c) => {
  const gana = c === SUPERVIVIENTE;
  const z = (c / 99 - 0.5) * 2.6;
  const deriva = gana ? 0.028 : -0.006 - 0.03 * ruido(c * 7 + 1);
  let y = 0;
  const pts: V3[] = [[-1.5, 0, z]];
  for (let i = 1; i <= 40; i++) {
    // Al principio todas suben un poco; luego las emociones mandan
    y += (i < 10 ? 0.012 : deriva) + (ruido(c * 101 + i * 17) - 0.5) * 0.11;
    pts.push([-1.5 + i * 0.075, y * 0.6, z]);
  }
  return pts;
});
const Noventa: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.15, 0], L(t, s, e, 8.6, 7.6), L(t, s, e, 0.75, 0.3), L(t, s, e, 0.28, 0.14), { apertura: 45, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const dib = L(t, s + 0.1, EV.n99 + 0.6, 0, 1, Easing.bezier(0.35, 0, 0.25, 1));
  const destaca = L(t, EV.n99 + 0.85, EV.n99 + 1.3, 0, 1, salida);
  // Plano del 0 %
  tr.push({ t: "p", pts: [[-1.5, 0, -1.4], [1.5, 0, -1.4], [1.5, 0, 1.4], [-1.5, 0, 1.4], [-1.5, 0, -1.4]], w: 1, o: 0.25, dash: "6 10" });
  CURVAS.forEach((pts, c) => {
    const gana = c === SUPERVIVIENTE;
    tr.push({ t: "p", pts, w: gana ? 1.4 + 1.8 * destaca : 1, o: gana ? 0.5 + 0.5 * destaca : 0.32 * (1 - 0.55 * destaca), prog: dib, luz: gana ? destaca : 0 });
    if (dib >= 1) tr.push({ t: "e", c: pts[40], r: gana ? 0.035 : 0.014, tipo: "punto", o: gana ? 1 : 0.45 * (1 - 0.5 * destaca) });
  });
  const pr = proyector(cam);
  const fin = pr(CURVAS[SUPERVIVIENTE][40]);
  const cero = pr([1.5, 0, 1.4]);
  const cuenta = Math.round(L(t, EV.n99 - 0.05, EV.n99 + 0.6, 0, 99, salida));
  return (
    <>
      <Escena cam={cam} trazos={tr} encima={() => <Reticula q={fin} r={30} k={muelle(t, EV.n99 + 0.85, 220, 14)} />} />
      <Etiqueta t={t} t0={s + 0.3} x={cero.x + 14} y={cero.y} size={24} o={0.55}>
        0%
      </Etiqueta>
      <Arriba top={250}>
        <span style={{ ...mono(120), opacity: t >= EV.n99 - 0.05 ? 1 : 0 }}>{`${cuenta}%`}</span>
        <div style={{ position: "relative", height: 110, width: ANCHO, display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute" }}>
            <Titular t={t} t0={EV.n99 + 0.9} fin={EV.psicologica - 0.05} texto="de los *traders*" size={70} />
          </div>
          <div style={{ position: "absolute" }}>
            <Titular t={t} t0={EV.psicologica - 0.05} texto="gestión *psicológica*" size={70} />
          </div>
        </div>
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Gestión: velas 3D, entrada, stop a breakeven y TP
const CIERRES = [-0.95, -0.8, -0.9, -0.7, -0.78, -0.55, -0.62, -0.42, -0.5, -0.28, -0.35, -0.1, 0.05, -0.02, 0.25, 0.42, 0.33, 0.7].map((c) => c * 1.2);
const XV = (i: number) => (i - 8.5) * 0.3;
const ENTRADA = 4;
const NIV = { entrada: CIERRES[ENTRADA], sl: -1.35, tp: 0.76 };
const Gestion: React.FC<P> = ({ t, s, e }) => {
  const tv = (i: number) => s + 0.25 + i * 0.34;
  // La cámara sigue a la última vela con un ligero retraso
  const cam = orbita(
    [clave(t, [[s, XV(1)], [tv(4), XV(3)], [tv(17), XV(15.3)], [e, XV(15.6)]]), clave(t, [[s, -0.85], [EV.operacion + 0.3, -0.4], [EV.mueves, -0.35], [e, -0.12]]), 0],
    L(t, s, e, 7.4, 6.7),
    L(t, s, e, -0.42, 0.3),
    L(t, s, e, 0.2, 0.08),
    { apertura: 50, centroY: 910 },
  );
  const tr: Trazo[] = [...polvo(0.3)];
  const suelo = L(t, s, s + 0.6, 0, 1, salida);
  for (const z of [-0.45, 0, 0.45]) tr.push({ t: "l", a: [XV(-1), -1.6, z], b: [XV(18), -1.6, z], w: 1, o: 0.16 * suelo });
  for (let i = -1; i <= 18; i++) tr.push({ t: "l", a: [XV(i), -1.6, -0.45], b: [XV(i), -1.6, 0.45], w: 1, o: 0.1 * suelo });
  let ultima = -1;
  let cierreAct = CIERRES[0];
  CIERRES.forEach((c, i) => {
    if (t < tv(i)) return;
    ultima = i;
    const g = muelle(t, tv(i), 160, 16);
    const ab = i ? CIERRES[i - 1] : -1.25;
    const ci = ab + (c - ab) * g;
    cierreAct = ci;
    const alto = Math.max(ab, c) + 0.06 + 0.08 * ruido(i);
    const bajo = Math.min(ab, c) - 0.06 - 0.08 * ruido(i + 50);
    const sube = c > ab;
    const w = 0.075;
    for (const [a, b] of caja([XV(i) - w, Math.min(ab, ci), -w], [XV(i) + w, Math.max(ab, ci) + 0.004, w])) {
      tr.push({ t: "l", a, b, w: sube ? 1.6 : 1.2, o: (sube ? 0.95 : 0.45) * Math.min(g * 2, 1) });
    }
    tr.push({ t: "l", a: [XV(i), ab + (bajo - ab) * g, 0], b: [XV(i), ab + (alto - ab) * g, 0], w: 1.1, o: 0.55 });
  });
  const xFin = XV(Math.max(ultima, ENTRADA)) + 0.45;
  const niv = L(t, EV.operacion, EV.operacion + 0.6, 0, 1, salida);
  const be = muelle(t, EV.mueves, 120, 14);
  const ySL = NIV.sl + (NIV.entrada - NIV.sl) * be;
  const tocaTP = cierreAct >= NIV.tp;
  const tTP = tv(17) + 0.12;
  const flash = tocaTP ? 1 - L(t, tTP, tTP + 0.8, 0, 1, salida) : 0;
  const linea = (y: number, o: number, dash?: string, luz?: number): Trazo => ({ t: "p", pts: [[XV(ENTRADA) - 0.4, y, 0], [xFin, y, 0]], w: 1.6, o, prog: niv, dash, luz });
  if (niv > 0) {
    tr.push(linea(NIV.entrada, 0.85));
    tr.push(linea(ySL, 0.75, "8 10"));
    tr.push(linea(NIV.tp, 0.75, "8 10", flash));
  }
  if (ultima >= 0) tr.push({ t: "e", c: [XV(ultima), cierreAct, 0], r: 0.05, tipo: "punto", luz: 1 });
  const pr = proyector(cam);
  // Etiquetas sobre cada nivel, pegadas a su extremo derecho sin salirse de pantalla
  const et = (y: number) => {
    const q = pr([xFin, y, 0]);
    return { x: Math.min(q.x, 1030), y: q.y - 24 };
  };
  const slTxt = be < 0.02 ? "SL" : be < 0.98 ? "SL → BE" : "BE";
  return (
    <>
      <Escena cam={cam} trazos={tr} encima={(p) => <Reticula q={p([XV(ENTRADA), NIV.entrada, 0])} r={24} k={muelle(t, EV.operacion, 220, 14)} />} />
      {niv > 0 && (
        <>
          <Etiqueta t={t} t0={EV.operacion + 0.2} x={et(NIV.entrada).x} y={et(NIV.entrada).y - (be > 0.5 ? 34 : 0)} size={28} alinea="der">
            ENTRADA
          </Etiqueta>
          <Etiqueta t={t} t0={EV.operacion + 0.3} x={et(ySL).x} y={et(ySL).y} size={28} o={0.85} alinea="der">
            {slTxt}
          </Etiqueta>
          <Etiqueta t={t} t0={EV.operacion + 0.4} x={et(NIV.tp).x} y={et(NIV.tp).y} size={28} o={0.85} alinea="der">
            {tocaTP ? "TP ✓" : "TP"}
          </Etiqueta>
        </>
      )}
      <Arriba>
        <Titular t={t} t0={EV.gestiona + 0.05} fin={EV.cierras - 0.1} texto="gestiona cada *operación*" size={72} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cierras} texto="sin que tú hagas *nada*" size={72} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Proporcional: 1 bloque → 10 → 100, la ganancia crece en la misma proporción
const NIVELES: [number, number][] = [
  [1000, 505],
  [10000, 5052],
  [100000, 50520],
];
const Prop: React.FC<P> = ({ t, s, e }) => {
  const paso = 0.4;
  const lado = 0.34;
  const cap = lado * 0.505; // la ganancia: +50,5 % sobre cada bloque
  const t1 = s + 0.1;
  const t2 = s + 0.8;
  const t3 = s + 1.4;
  const nivel = t < t2 ? 0 : t < t3 ? 1 : 2;
  const cam = orbita(
    [clave(t, [[t2, -0.2], [t2 + 0.5, 0]]), clave(t, [[s, 0.22], [e, 0.1]]), clave(t, [[t3, -0.2], [t3 + 0.6, 0]])],
    clave(t, [[s, 2.4], [t2, 2.9], [t2 + 0.45, 6.2], [t3, 6.6], [t3 + 0.7, 12.6], [e, 13.4]]),
    clave(t, [[s, 0.8], [e, 0.38]]),
    clave(t, [[s, 0.32], [t3, 0.42], [e, 0.66]]),
    { apertura: 45, centroY: 1010 },
  );
  const tr: Trazo[] = [...polvo(0.3)];
  const crece = muelle(t, t1 + 0.25, 140, 15);
  for (let j = 0; j < 10; j++) {
    for (let i = 0; i < 10; i++) {
      // El bloque inicial es el (4, 4); la fila 4 entra en el segundo paso y el resto de filas en el tercero
      let k = 1;
      let dx = 0;
      let dz = 0;
      if (i === 4 && j === 4) k = muelle(t, t1, 170, 15);
      else if (j === 4) {
        k = muelle(t, t2 + Math.abs(i - 4) * 0.035, 170, 15);
        dx = Math.sign(i - 4) * (1 - k) * 1.4;
      } else {
        k = muelle(t, t3 + Math.abs(j - 4) * 0.045 + ruido(i) * 0.05, 170, 15);
        dz = Math.sign(j - 4) * (1 - k) * 1.8;
      }
      if (k <= 0.001) continue;
      const o = Math.min(k * 1.6, 1);
      const x = (i - 4) * paso - paso / 2 + dx;
      const z = (j - 4) * paso - paso / 2 + dz;
      const h = lado * 0.5;
      for (const [a, b] of caja([x - h, 0, z - h], [x + h, lado, z + h])) tr.push({ t: "l", a, b, w: 1.2, o: 0.55 * o });
      // Capa de ganancia encima de cada bloque
      const hc = cap * crece;
      if (hc > 0.002) {
        for (const [a, b] of caja([x - h, lado, z - h], [x + h, lado + hc, z + h])) tr.push({ t: "l", a, b, w: 1.6, o, luz: nivel === 0 ? 0.5 : 0.25 });
      }
    }
  }
  const [capital, ben] = NIVELES[nivel];
  const tCambio = [t1, t2, t3][nivel];
  const cuenta = L(t, tCambio + 0.1, tCambio + 0.55, nivel ? NIVELES[nivel - 1][1] : 0, ben, Easing.bezier(0.2, 0, 0.1, 1));
  const golpe = muelle(t, tCambio, 260, 14);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Arriba top={250}>
        <Titular t={t} t0={EV.proporcional - 0.05} texto="directamente *proporcional*" size={66} paso={0.09} />
      </Arriba>
      <div style={{ position: "absolute", top: 420, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: Math.min(muelle(t, t1, 200, 18) * 1.5, 1) }}>
        <div style={{ display: "flex", gap: 22, alignItems: "baseline" }}>
          <span style={mono(30, 0.55)}>{`${euros(capital)} €`}</span>
          {nivel > 0 && <span style={{ ...mono(30), display: "inline-block", transform: `scale(${0.6 + 0.4 * golpe})` }}>×10</span>}
        </div>
        <span style={mono(76)}>{`+${euros(cuenta)} €`}</span>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 7. CTA: el mensaje se escribe y sale volando hacia el privado
const MENSAJE = "Info del bot";
const Cta: React.FC<P> = ({ t, s, e }) => {
  const tEscribe = EV.informacion + 0.1;
  const tEnvia = tEscribe + MENSAJE.length / 16 + 0.15;
  const n = Math.max(0, Math.min(MENSAJE.length, Math.floor((t - tEscribe) * 16)));
  const envio = muelle(t, tEnvia, 200, 16);
  const vuelo = L(t, tEnvia, tEnvia + 0.75, 0, 1, Easing.bezier(0.5, 0, 0.75, 0.4));
  const visto = muelle(t, EV.privado, 220, 15);
  const panel = muelle(t, s + 0.05, 140, 17);
  const cam = orbita([0, 0, 0], 9, L(t, s, e, 0.25, -0.2), 0.25, { apertura: 40 });
  const cursor = Math.floor(t * 2.4) % 2 === 0;
  // El avión de papel sale del botón de enviar y se aleja describiendo una curva
  const ax = vuelo * 420;
  const ay = -Math.sin(vuelo * Math.PI * 0.9) * 360 - vuelo * 120;
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <div style={{ position: "absolute", top: 560, left: 0, width: ANCHO, height: 640, perspective: 1300, display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
        <div
          style={{
            width: 840,
            position: "relative",
            transform: `rotateX(${L(t, s, e, 26, 12)}deg) rotateY(${L(t, s, e, 20, 6)}deg) translateY(${(1 - panel) * 140}px)`,
            opacity: Math.min(panel * 1.6, 1),
            display: "flex",
            flexDirection: "column",
            gap: 26,
          }}
        >
          {/* Burbuja del mensaje enviado */}
          <div style={{ alignSelf: "flex-end", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, opacity: Math.min(envio * 1.6, 1), transform: `translateY(${(1 - Math.min(envio, 1)) * 80}px) scale(${0.85 + 0.15 * envio})`, transformOrigin: "100% 100%" }}>
            <div style={{ padding: "26px 42px", borderRadius: "42px 42px 10px 42px", background: "#fff", color: "#000", fontFamily: SANS, fontWeight: 600, fontSize: 62, letterSpacing: "-0.015em" }}>{MENSAJE}</div>
            <span style={{ ...mono(28, 0.75), opacity: Math.min(visto * 1.5, 1) }}>ENVIADO ✓✓</span>
          </div>
          {/* Campo de texto */}
          <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "0 18px 0 40px", height: 128, borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.03)" }}>
            <span style={{ flex: 1, ...mono(46) }}>
              {envio > 0.05 || n === 0 ? <span style={{ opacity: 0.35 }}>Mensaje…</span> : MENSAJE.slice(0, n)}
              {cursor && n > 0 && envio < 0.05 && <span style={{ opacity: 0.9 }}>▍</span>}
            </span>
            <div style={{ width: 94, height: 94, borderRadius: 47, border: "1.5px solid rgba(255,255,255,0.7)", position: "relative" }}>
              {vuelo < 1 && (
                <svg width={50} height={50} viewBox="0 0 24 24" style={{ position: "absolute", left: 21, top: 22, overflow: "visible", transform: `translate(${ax}px, ${ay}px) rotate(${-vuelo * 25}deg) scale(${1 - vuelo * 0.5})`, opacity: 1 - Math.max(0, vuelo - 0.7) / 0.3 }}>
                  <path d="M22 2L11 13" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
      <Arriba top={260}>
        <Titular t={t} t0={EV.informacion - 0.15} fin={EV.privado - 0.95} texto="¿más *información?*" size={84} />
      </Arriba>
      <Arriba top={260}>
        <Titular t={t} t0={EV.privado - 0.9} texto="escríbeme por *privado*" size={80} />
      </Arriba>
    </>
  );
};
