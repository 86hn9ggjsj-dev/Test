// Clip de prueba de 5 s del stickman nuevo (src/Bot/stick.tsx), sin audio: mira el gráfico con la mano en la barbilla,
// sale una vela verde, se agacha y salta de alegría, aterriza y celebra; cae una vela roja que rompe la pantalla, se
// queda en shock, se lleva las manos a la cabeza, niega y se desploma sentado en el suelo con la cabeza gacha.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Arriba, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { ROJO, VERDE } from "../Bot/kit";
import { Clave, cuerpoEn, Stick } from "../Bot/stick";
import { golpe, sacude } from "../Explica/Montaje";

export const CLIP_FPS = 30;
export const CLIP_FRAMES = 150;

const VERDE_T = 0.75;
const ROJO_T = 2.55;

const CLAVES: Clave[] = [
  [0.35, { x: 0.025 }],
  [0.85, { ojos: 1.3, cejas: 0.8, boca: 0.8, mDx: 0.3, mDy: -0.28, mira: 0.9 }],
  [1.05, { y: 0.56, incl: 0, mIx: -0.3, mIy: -0.42, mDx: 0.3, mDy: -0.42, ojos: 1.1, boca: 1, abre: 0.3, x: 0 }],
  [1.3, { y: 1.28, mIx: -0.27, mIy: 0.48, mDx: 0.27, mDy: 0.48, abre: 0.75 }],
  [1.36, { pIy: 0.72, pDy: 0.72, pIx: -0.13, pDx: 0.13 }],
  [1.55, { pIy: 0, pDy: 0, pIx: -0.15, pDx: 0.15 }],
  [1.6, { y: 0.55, mIx: -0.32, mIy: -0.15, mDx: 0.32, mDy: -0.15 }],
  [1.85, { y: 0.79, mIx: -0.2, mIy: -0.22, mDx: 0.24, mDy: 0.5, abre: 0.5 }],
  [2.08, { mDy: 0.26, mDx: 0.3 }],
  [2.22, { mDy: 0.54, mDx: 0.22 }],
  [2.6, { ojos: 1.45, cejas: 1, boca: 0, abre: 0.85, incl: -0.07, cabeza: -0.06, mIx: -0.32, mIy: -0.3, mDx: 0.32, mDy: -0.3, mira: 0.9 }],
  [3.05, { mIx: -0.17, mIy: 0.27, mDx: 0.17, mDy: 0.27, cejas: -1, boca: -1, abre: 0.45, agobio: 1, incl: 0, cabeza: 0, ojos: 1.1, mira: 0.3 }],
  [3.3, { cabeza: 0.13 }],
  [3.45, { cabeza: -0.13 }],
  [3.6, { cabeza: 0.12 }],
  [3.75, { cabeza: -0.08 }],
  [3.9, { cabeza: 0, y: 0.62, ojos: 0.8 }],
  [4.12, { y: 0.2, pIx: -0.48, pDx: 0.48, agacha: 1, mIx: -0.36, mIy: -0.27, mDx: 0.36, mDy: -0.27, abre: 0, boca: -1, ojos: 0.6, agobio: 0.5, mira: 0 }],
];
const INICIO = { incl: 0.05, mira: 0.8, mDx: 0.06, mDy: 0.13, x: -0.02, boca: 0.1 };

// Pantalla con velas
const X0 = 600;
const X1 = 1010;
const Y0 = 600;
const Y1 = 1010;
const pY = (p: number) => Y1 - 40 - ((p - 97.5) / (116 - 97.5)) * (Y1 - Y0 - 110);
const CIERRES = [100, 102, 101, 104, 103, 105, 104, 106, 105];
const hueco = (i: number) => X0 + 38 + i * 33.4;

const Vela: React.FC<{ i: number; abre: number; cierra: number; color?: string; sube?: boolean }> = ({ i, abre, cierra, color, sube }) => {
  const x = hueco(i);
  const a = pY(abre);
  const c = pY(cierra);
  const arriba = Math.min(a, c);
  const alto = Math.max(3, Math.abs(c - a));
  const col = color ?? "#fff";
  const llena = color !== undefined || (sube ?? cierra >= abre);
  return (
    <g>
      <line x1={x} x2={x} y1={arriba - 12} y2={arriba + alto + 12} stroke={col} strokeWidth={2.4} />
      <rect x={x - 11} y={arriba} width={22} height={alto} fill={llena ? col : "#000"} stroke={col} strokeWidth={2.4} rx={2} />
    </g>
  );
};

export const Clip: React.FC = () => {
  const t = useCurrentFrame() / CLIP_FPS;
  const c = cuerpoEn(t, CLAVES, INICIO);
  const verde = muelle(t, VERDE_T, 170, 14);
  const rojo = muelle(t, ROJO_T, 120, 11);
  const cierreVerde = 105 + 9 * verde;
  const cierreRojo = 114 - 26 * rojo;
  const pnl = t < ROJO_T ? L(t, VERDE_T, VERDE_T + 0.45, 0, 240) : L(t, ROJO_T, ROJO_T + 0.5, 240, -1870);
  const colorPnl = t < VERDE_T ? "#fff" : pnl >= 0 ? VERDE : ROJO;
  const zoom = 1 + 0.035 * (t / 5) + 0.04 * golpe(t, ROJO_T);
  const dx = sacude(t, ROJO_T, 0.04) * 420;
  const flash = t < ROJO_T ? 0 : 0.16 * Math.exp(-(t - ROJO_T) * 3);
  // Polvo al aterrizar y al caer sentado
  const polvo = (t0: number, xs: number[], y: number) => {
    const k = (t - t0) / 0.45;
    if (k < 0 || k > 1) return null;
    return xs.map((x, j) => (
      <ellipse key={`${t0}-${j}`} cx={330 + x * 370 + Math.sign(x) * k * 60} cy={1380 - 8 - k * 18 - y} rx={12 + k * 26} ry={6 + k * 10} fill="none" stroke="#fff" strokeWidth={3} opacity={(1 - k) * 0.7} />
    ));
  };
  const exclama = t < ROJO_T + 0.05 ? 0 : muelle(t, ROJO_T + 0.05, 260, 12) * (1 - L(t, 3.0, 3.2, 0, 1));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 50% 45%, #0d0d0e, #000)" }}>
      <AbsoluteFill style={{ transform: `translateX(${dx}px) scale(${zoom})`, transformOrigin: "50% 60%" }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {/* Suelo */}
          <line x1={60} x2={1020} y1={1380} y2={1380} stroke="#fff" strokeWidth={2} opacity={0.55} />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={60 + i * 40} x2={1020 - i * 40} y1={1380 + 34 + i * 30} y2={1380 + 34 + i * 30} stroke="#fff" strokeWidth={1.4} opacity={0.14 - i * 0.03} />
          ))}
          {/* Pantalla en su pie */}
          <line x1={(X0 + X1) / 2} x2={(X0 + X1) / 2} y1={Y1} y2={1380} stroke="#fff" strokeWidth={3} opacity={0.8} />
          <line x1={(X0 + X1) / 2 - 70} x2={(X0 + X1) / 2 + 70} y1={1380} y2={1380} stroke="#fff" strokeWidth={5} strokeLinecap="round" />
          <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} rx={18} fill="#050505" stroke="#fff" strokeWidth={3} />
          {[1, 2, 3].map((i) => (
            <line key={i} x1={X0 + 14} x2={X1 - 14} y1={Y0 + 60 + i * 80} y2={Y0 + 60 + i * 80} stroke="#fff" strokeWidth={1} opacity={0.1} />
          ))}
          <line x1={X0 + 20} x2={X1 - 20} y1={pY(105)} y2={pY(105)} stroke="#fff" strokeWidth={1.6} strokeDasharray="8 8" opacity={0.45} />
          {CIERRES.map((cierra, i) => (
            <Vela key={i} i={i} abre={i === 0 ? 99 : CIERRES[i - 1]} cierra={cierra} />
          ))}
          {t >= VERDE_T && <Vela i={9} abre={105} cierra={cierreVerde} color={VERDE} />}
          {t >= ROJO_T && <Vela i={10} abre={cierreVerde} cierra={cierreRojo} color={ROJO} />}
          {polvo(1.62, [-0.17, 0.17], 0)}
          {polvo(4.2, [-0.5, 0.5], 0)}
        </svg>
        <div style={{ position: "absolute", left: X0 + 26, top: Y0 + 22, ...mono(22, 0.55) }}>BTC / USD · 5M</div>
        {/* P&L encima de la pantalla */}
        <div style={{ position: "absolute", left: X0, width: X1 - X0, top: Y0 - 118, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={mono(22, 0.55)}>P&amp;L HOY</div>
          <div style={{ ...mono(64), color: colorPnl, transform: `scale(${1 + 0.18 * golpe(t, ROJO_T) + 0.12 * golpe(t, VERDE_T)})` }}>
            {pnl >= 0 ? "+" : "−"}
            {euros(Math.abs(pnl))} €
          </div>
        </div>
        <Stick c={c} ox={330} oy={1380} s={370} t={t} />
        {exclama > 0.01 && (
          <div style={{ position: "absolute", left: 330 + c.x * 370 + 90, top: 1380 - 1.75 * 370 - 40, ...mono(120), fontWeight: 700, transform: `scale(${exclama}) rotate(12deg)`, transformOrigin: "50% 100%" }}>!</div>
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(255,77,94,${flash}))` }} />
      <Arriba top={250}>
        <Titular t={t} t0={0.1} texto="un día *normal* de trader" size={92} />
      </Arriba>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 60% at 50% 45%, transparent 55%, rgba(0,0,0,0.6))" }} />
    </AbsoluteFill>
  );
};
