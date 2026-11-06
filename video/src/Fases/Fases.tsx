// Reel de alcance "Las cuatro fases de todo el que empieza en trading" (~30 s): escenas 3D en wireframe (blanco y negro
// con toques puntuales de verde y rojo) mezcladas con el stickman 2D metido dentro de la escena: camina por un camino con
// cuatro hitos, salta y se corona junto a tres velas verdes de cristal, un ojo gigante y el sello «manipulado» (sin
// stickman), el «sígueme» a mitad, bloques que se doblan y se derrumban (sin stickman), relajado junto a un escritorio con
// una curva que sube y la pregunta final. Tiempos en src/gen/fases.json (scripts/fases.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/fases.json";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { Arriba, L, mono, muelle, Titular } from "../Bot/piezas";
import { circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, ROJO, suelo, velas, VERDE } from "../Bot/kit";
import { escritorio, monitor } from "../Bot/monigote";
import { cabezaPx, Clave, cuerpoEn, Estado, R_CABEZA } from "../Bot/stick";
import { Ancla, anclaje, BRAZOS_ARRIBA, ENCOGE, Exclama, SiguemeStick, StickMundo } from "../Bot/comun";
import { claves, Destello, golpe, Kicker, Montaje, P, paseo, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const FASES_FPS = datos.fps;
export const FASES_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const SUELO = -0.9;

// ------------------------------------------------------------------ 1. Hook: camino 3D con cuatro hitos y el stickman caminando entre ellos
const HITOS = [-0.3, 0.15, 0.6, 1.05];
const T_PARA = EV.cual - 0.35;
const KH = 0.55;
// Ciclo de paso (en unidades del stickman): cada pie está plantado medio ciclo y el otro medio avanza levantándose
const pie = (X: number, off: number, L0 = 0.3) => {
  const u = (((X / (2 * L0) + off) % 1) + 1) % 1;
  if (u < 0.5) return { rel: L0 / 2 - (u / 0.5) * L0, y: 0, u };
  const v = (u - 0.5) / 0.5;
  return { rel: -L0 / 2 + L0 * v * v * (3 - 2 * v), y: 0.11 * Math.sin(Math.PI * v), u };
};
const HOOK: Clave[] = [
  [T_PARA + 0.05, { mira: 0, ...ENCOGE, boca: 0.4, cejas: 0.9 }],
  [EV.cual + 0.6, { cabeza: -0.12 }],
];
const Hook: React.FC<P> = ({ t, s, e }) => {
  const xw = L(Math.min(t, T_PARA), -0.6, T_PARA, -0.95, 0.38, (u) => u);
  const cam = orbita([xw * 0.6 + 0.1, -0.35, 0], 5.0, L(t, s, e, -0.35, -0.15), 0.1, { apertura: 35, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, SUELO, 0.16, "#fff", 0);
  tr.push({ t: "l", a: [-1.8, SUELO, 0], b: [1.8, SUELO, 0], w: 2, o: 0.8 });
  HITOS.forEach((hx, i) => {
    const g = muelle(t, -0.4 + i * 0.15, 200, 14);
    if (g <= 0) return;
    const pasado = xw > hx;
    tr.push({ t: "l", a: [hx, SUELO, 0], b: [hx, SUELO + 0.75 * Math.min(g, 1.05), 0], w: 2.4, o: 1 });
    tr.push({ t: "p", pts: [[hx - 0.09, SUELO + 0.62, 0], [hx + 0.09, SUELO + 0.62, 0], [hx + 0.09, SUELO + 0.8, 0], [hx - 0.09, SUELO + 0.8, 0], [hx - 0.09, SUELO + 0.62, 0]].map((p) => [p[0], SUELO + (p[1] - SUELO) * Math.min(g, 1.05), p[2]] as V3), w: 2, o: 1, relleno: pasado ? "#fff" : "#000", oRelleno: 0.9, luz: pasado ? 0.4 : 0 });
  });
  // El stickman camina de perfil: la cadera avanza por el mundo y los pies se plantan en el suelo
  const base = cuerpoEn(t, HOOK, { mira: 1, boca: 0.3, cejas: 0.2 });
  const X = (xw + 0.95) / KH;
  const a1 = pie(X, 0);
  const b1 = pie(X, 0.5);
  const k = L(t, T_PARA, T_PARA + 0.3, 0, 1);
  const c: Estado = {
    ...base,
    x: 0,
    y: (1 - k) * (0.77 + 0.022 * Math.cos(4 * Math.PI * a1.u - Math.PI)) + k * base.y,
    pIx: (1 - k) * a1.rel + k * -0.14,
    pIy: (1 - k) * a1.y,
    pDx: (1 - k) * b1.rel + k * 0.14,
    pDy: (1 - k) * b1.y,
    mIx: (1 - k) * (-0.05 - b1.rel * 0.9) + k * base.mIx,
    mIy: (1 - k) * -0.52 + k * base.mIy,
    mDx: (1 - k) * (0.05 - a1.rel * 0.9) + k * base.mDx,
    mDy: (1 - k) * -0.52 + k * base.mDy,
    incl: (1 - k) * 0.04 + k * base.incl,
  };
  const a = anclaje(cam, [xw, SUELO, 0.15], KH);
  const pr = proyector(cam);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {HITOS.map((hx, i) => {
        const q = pr([hx, SUELO + 0.71, 0.01]);
        return (
          <div key={i} style={{ position: "absolute", left: q.x, top: q.y, transform: "translate(-50%, -50%)", opacity: L(t, -0.3 + i * 0.15, i * 0.15, 0, 1), ...mono(40), fontWeight: 700, color: xw > hx ? "#000" : "#fff" }}>
            {i + 1}
          </div>
        );
      })}
      <StickMundo a={a} c={c} t={t} perfil={k < 1 ? 1 : 0} />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.cual - 0.45} texto="las *4 fases*" size={124} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cual - 0.4} texto="¿en cuál *estás*?" size={112} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Fase uno: tres velas verdes de cristal; salta con cada una y se corona
const s1 = datos.escenas.find((x) => x.id === "uno")!.s;
const VELAS_T = [0, 1, 2].map((i) => EV.tres - 0.3 + i * 0.35);
const UNO: Clave[] = [
  [EV.tres - 0.35, { ojos: 1.2, cejas: 0.7, boca: 1, abre: 0.6, ...BRAZOS_ARRIBA, mira: 0.8 }],
  [EV.genio - 0.2, { mIx: -0.13, mIy: -0.42, mDx: 0.13, mDy: -0.42, ojos: 0.8, boca: 1, abre: 0, cejas: 0.5, cabeza: 0.1, incl: -0.05, mira: 0 }],
];
const Corona: React.FC<{ c: Estado; a: Ancla; g: number; brillo: number }> = ({ c, a, g, brillo }) => {
  if (g <= 0.01) return null;
  const [hx, hy] = cabezaPx(c, a.ox, a.oy, a.s);
  const r = R_CABEZA * a.s;
  const w = r * 1.55 * Math.min(g, 1.1);
  const h = r * 0.95 * Math.min(g, 1.1);
  const y0 = hy - r * 0.82 - 30 * (1 - Math.min(g, 1));
  const ang = (-(c.incl + c.cabeza) * 180) / Math.PI;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, filter: brillo > 0.05 ? `drop-shadow(0 0 ${18 * brillo}px rgba(255,255,255,0.8))` : undefined }}>
      <g transform={`rotate(${ang.toFixed(2)} ${hx} ${hy})`}>
        <path d={`M${hx - w / 2},${y0} L${hx - w / 2},${y0 - h} L${hx - w / 4},${y0 - h * 0.55} L${hx},${y0 - h * 1.1} L${hx + w / 4},${y0 - h * 0.55} L${hx + w / 2},${y0 - h} L${hx + w / 2},${y0} Z`} fill="#000" stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
        {[-0.5, 0, 0.5].map((f) => (
          <circle key={f} cx={hx + f * w} cy={y0 - h * (f === 0 ? 1.1 : 1) - 8} r={6} fill="#fff" />
        ))}
      </g>
    </svg>
  );
};
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.25, 0], L(t, s, e, 5.4, 5.0) - 0.3 * golpe(t, EV.genio - 0.05), L(t, s, e, -0.2, 0.15) + sacude(t, EV.genio - 0.05, 0.02), 0.08, { apertura: 35, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, SUELO, 0.16);
  // Tres velas que suben, una detrás de otra, con un verde suave
  VELAS_T.forEach((t0, i) => {
    const g = muelle(t, t0, 200, 13);
    if (g <= 0) return;
    const x = 0.25 + i * 0.24;
    const y0 = -0.5 + i * 0.22;
    tr.push({ t: "l", a: [x, y0 - 0.05, 0], b: [x, y0 + 0.32 * Math.min(g, 1.05) + 0.05, 0], w: 1.6, o: 0.9, color: VERDE });
    cristal(tr, [x - 0.06, y0, -0.06], [x + 0.06, y0 + 0.3 * Math.min(g, 1.05), 0.06], VERDE, 0.9, 0.3 + 0.4 * golpe(t, t0), 0.3);
  });
  const base = cuerpoEn(t, UNO, { mira: 0.8, boca: 0.3 }, s - 0.3);
  // Un salto por cada vela verde
  const h = VELAS_T.reduce((acc, t0) => {
    const u = (t - t0 - 0.08) / 0.34;
    return u > 0 && u < 1 ? acc + 0.22 * Math.sin(Math.PI * u) : acc;
  }, 0);
  const c: Estado = { ...base, y: base.y + h, pIy: base.pIy + h * 1.15, pDy: base.pDy + h * 1.15 };
  const a = anclaje(cam, [-0.5, SUELO, 0.15], 0.6);
  const ganadas = VELAS_T.filter((t0) => t >= t0).length;
  const pr = proyector(cam);
  const qp = pr([0.49, 0.38, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qp.x, top: qp.y, transform: "translate(-50%, -100%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: L(t, VELAS_T[0], VELAS_T[0] + 0.15, 0, 1) }}>
        <div style={mono(22, 0.55)}>P&amp;L</div>
        <div style={{ ...mono(64), color: VERDE, transform: `scale(${1 + 0.15 * golpe(t, VELAS_T[Math.max(0, ganadas - 1)])})` }}>{`+${ganadas * 120} €`}</div>
      </div>
      <StickMundo a={a} c={c} t={t} />
      <Corona c={c} a={a} g={muelle(t, EV.genio - 0.15, 220, 12)} brillo={golpe(t, EV.genio - 0.05)} />
      <Kicker t={t} t0={s1 + 0.02} texto="FASE 1" />
      <Destello t={t} t0={EV.genio - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.genio - 0.45} texto="*3* seguidas" size={124} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.genio - 0.4} texto="te crees un *genio*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Fase dos: pierdes y el mercado está manipulado (sin stickman)
const CAE = paseo(26, 17, 0.5, -0.12);
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 5.2, 4.8), L(t, s, e, 0.15, -0.15) + sacude(t, EV.manipulado - 0.05), 0.05, { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.25)];
  const lo = Math.min(...CAE);
  const hi = Math.max(...CAE);
  const ys = CAE.map((v) => -0.75 + ((v - lo) / (hi - lo)) * 0.6);
  velas(tr, ys, -0.85, 0.85, Math.round(L(t, s, EV.pierdes + 0.4, 8, CAE.length)), 0.026, 1, 0.02, true);
  // Vela grande en rojo suave al perder
  const gv = muelle(t, EV.pierdes, 200, 14);
  if (gv > 0) cristal(tr, [0.9, ys[ys.length - 1] - 0.35 * Math.min(gv, 1.05), -0.03], [0.96, ys[ys.length - 1], 0.03], ROJO, 0.9, 0.4, 0.3);
  // El ojo que lo vigila todo: mira a un lado y a otro y parpadea
  const g = Math.min(muelle(t, s + 0.1, 150, 14), 1.05);
  const c: V3 = [0, 0.35, 0];
  const parpado = (t % 2.4) < 0.12 ? 0.15 : 1;
  const ojo: V3[] = Array.from({ length: 41 }, (_, i) => {
    const a = (i / 40) * Math.PI * 2;
    return [c[0] + Math.cos(a) * 0.55 * g, c[1] + Math.sin(a) * 0.24 * g * parpado * (Math.sin(a) > 0 ? 1 : 1), 0];
  });
  tr.push({ t: "p", pts: ojo, w: 2.6, o: 1, relleno: "#fff", oRelleno: 0.04, luz: 0.25 });
  const mira = 0.22 * Math.sin((t - s) * 2.2);
  if (parpado > 0.5) {
    tr.push({ t: "p", pts: circulo([c[0] + mira * g, c[1], 0.01], 0.13 * g, "z", 30), w: 2.4, o: 1 });
    tr.push({ t: "p", pts: circulo([c[0] + mira * g, c[1], 0.02], 0.06 * g, "z", 20), w: 1, o: 1, relleno: "#fff", oRelleno: 0.9 });
  }
  const sello = muelle(t, EV.manipulado - 0.15, 260, 11);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {sello > 0 && (
        <div style={{ position: "absolute", top: 1180, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
          <span style={{ ...mono(70), padding: "10px 30px", border: "5px solid #fff", borderRadius: 10, transform: `rotate(-8deg) scale(${2 - Math.min(sello, 1.1)})`, opacity: Math.min(sello * 1.5, 1) }}>MANIPULADO</span>
        </div>
      )}
      <Kicker t={t} t0={s + 0.02} texto="FASE 2" />
      <Destello t={t} t0={EV.manipulado - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.manipulado - 0.45} texto="*pierdes*" size={124} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.manipulado - 0.4} texto="está *manipulado*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme a mitad: el stickman señala el botón y salta al pulsarse
const Sigueme: React.FC<P> = (p) => <SiguemeStick {...p} lema="LA CUATRO ES LA BUENA" />;

// ------------------------------------------------------------------ 5. Fase tres: doblas el lote y lo pierdes todo (sin stickman)
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.35, 0], L(t, s, e, 5.0, 4.6), L(t, s, e, -0.2, 0.1) + sacude(t, EV.todo - 0.05), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, SUELO, 0.16);
  const cae = L(t, EV.todo - 0.15, EV.todo + 0.8, 0, 1, (u) => u * u);
  const lotes = [1, 2, 4, 8];
  lotes.forEach((n, i) => {
    const t0 = EV.doblas - 0.2 + i * ((EV.recuperar - EV.doblas + 0.6) / 4);
    const g = muelle(t, t0, 200, 13);
    if (g <= 0) return;
    const x = -0.6 + i * 0.4;
    const h = 0.1 * n * Math.min(g, 1.05);
    const dx = (i - 1.5) * 0.25 * cae;
    const dy = -1.2 * cae * cae;
    cristal(tr, [x - 0.15 + dx, SUELO + dy, -0.15], [x + 0.15 + dx, SUELO + h + dy, 0.15], cae > 0 ? ROJO : "#fff", 1 - 0.5 * cae, 0.25, cae > 0 ? 0.2 : 0.1);
  });
  const pr = proyector(cam);
  const saldo = t < EV.todo - 0.1 ? null : "0 €";
  const k = golpe(t, EV.todo - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {lotes.map((n, i) => {
        const t0 = EV.doblas - 0.2 + i * ((EV.recuperar - EV.doblas + 0.6) / 4);
        const q = pr([-0.6 + i * 0.4, SUELO + 0.1 * n + 0.08, 0.15]);
        return (
          <div key={n} style={{ position: "absolute", left: q.x, top: q.y - 40, transform: "translateX(-50%)", opacity: L(t, t0, t0 + 0.2, 0, 1) * (1 - cae), ...mono(36) }}>
            {`×${n}`}
          </div>
        );
      })}
      {saldo && (
        <div style={{ position: "absolute", top: 1220, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 16, alignItems: "baseline", transform: `scale(${1 + 0.3 * k})` }}>
          <span style={mono(26, 0.6)}>SALDO</span>
          <span style={{ ...mono(120), color: ROJO, opacity: 0.92 }}>{saldo}</span>
        </div>
      )}
      <Kicker t={t} t0={s + 0.02} texto="FASE 3" />
      <Destello t={t} t0={EV.todo - 0.05} o={0.22} />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.todo - 0.45} texto="doblas el *lote*" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.todo - 0.4} texto="lo pierdes *todo*" size={112} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Fase cuatro: escritorio 3D con una curva que sube; deja de buscar y se relaja
const ESTABLE = Array.from({ length: 30 }, (_, i) => i * 0.11 + 0.25 * Math.sin(i * 1.3) * (i % 7 === 3 ? 1.6 : 0.6));
const s4 = datos.escenas.find((x) => x.id === "cuatro")!.s;
const CUATRO: Clave[] = [
  [s4 + 0.1, { mDx: 0.14, mDy: 0.33, mira: -0.9, cabeza: -0.06, cejas: 0.3, boca: 0 }],
  [s4 + 0.85, { mira: 0.9, cabeza: 0.08 }],
  [s4 + 1.6, { mira: -0.9, cabeza: -0.08 }],
  [EV.perfecta - 0.1, { mira: 0.6, cabeza: 0, cejas: -0.2, boca: -0.2 }],
  [EV.controlar - 0.2, { mIx: -0.12, mIy: 0.3, mDx: 0.12, mDy: 0.3, ojos: 0.8, boca: 0.7, cejas: 0.2, incl: -0.04, mira: 0.7, x: 0.02 }],
  [EV.quedan - 0.3, { cabeza: 0.1, boca: 1, abre: 0.3 }],
  [EV.quedan, { cabeza: 0, abre: 0 }],
];
const Cuatro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.2, 0], L(t, s, e, 5.6, 5.2) - 0.15 * golpe(t, EV.quedan - 0.05), L(t, s, e, -0.15, 0.15) + sacude(t, EV.quedan - 0.05, 0.015), L(t, s, e, 0.05, 0.1), { apertura: 35, centroY: 850 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.16, "#fff", 0.2);
  escritorio(tr, -0.05, 0.85, -0.32);
  const n = Math.round(L(t, s, EV.quedan, 4, ESTABLE.length, (u) => u));
  monitor(tr, [0.42, 0.05, 0], 0.7, 0.5, (p) => {
    const lo = Math.min(...ESTABLE);
    const hi = Math.max(...ESTABLE);
    const pts = ESTABLE.slice(0, n).map((v, i) => p(i / (ESTABLE.length - 1), 0.1 + ((v - lo) / (hi - lo)) * 0.8));
    tr.push({ t: "p", pts, w: 2.4, o: 1, luz: 0.4 });
    tr.push({ t: "e", c: pts[pts.length - 1], r: 0.015, tipo: "punto", o: 1, luz: 1 });
  });
  const c = cuerpoEn(t, CUATRO, { mira: 0.8 }, s - 0.3);
  const a = anclaje(cam, [-0.36, -1.0, 0.28], 0.6);
  const pr = proyector(cam);
  const qm = pr([0.42, 0.36, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qm.x, top: qm.y, transform: "translate(-50%, -100%)", opacity: L(t, EV.controlar - 0.2, EV.controlar + 0.1, 0, 1), ...mono(52) }}>
        RIESGO <span style={{ color: VERDE }}>1 %</span>
      </div>
      <StickMundo a={a} c={c} t={t} />
      <Exclama t={t} t0={s + 0.25} c={c} {...a} signo="?" dura={1.6} />
      <Kicker t={t} t0={s + 0.02} texto="FASE 4" />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.controlar - 0.45} texto="ni *perfecta*" size={124} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.controlar - 0.4} fin={EV.quedan - 0.8} texto="controlas lo que *pierdes*" size={84} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.quedan - 0.75} texto="y *te quedas*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta final: ¿en qué fase estás? (sin stickman)
const Pregunta: React.FC<P> = (p) => {
  const { t, s } = p;
  return (
    <>
      <PreguntaComentarios {...p} lineas={["¿en qué fase", "*estás*?"]} kicker="DIME" pie="ETIQUETA A QUIEN SIGUE EN LA 2" size={104} />
      <div style={{ position: "absolute", top: 1090, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 34 }}>
        {[1, 2, 3, 4].map((n, i) => {
          const g = muelle(t, s + 0.6 + i * 0.1, 220, 14);
          const late = n === 2 ? 1 + 0.08 * Math.sin((t - s) * 8) : 1;
          return (
            <div key={n} style={{ width: 96, height: 96, borderRadius: 48, border: `3px solid #fff`, display: "flex", alignItems: "center", justifyContent: "center", opacity: Math.min(Math.max(g, 0) * 1.5, 1), transform: `scale(${(0.6 + 0.4 * Math.min(Math.max(g, 0), 1.1)) * late})`, background: n === 2 ? "rgba(255,255,255,0.12)" : "transparent", ...mono(48) }}>
              {n}
            </div>
          );
        })}
      </div>
    </>
  );
};

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, cuatro: Cuatro, pregunta: Pregunta };
export const CLAVES = claves(["cuatro", "fases", "cuál", "tres", "genio", "pierdes", "manipulado", "Sígueme", "buena", "doblas", ["todo", ROJO], "perfecta", "controlar", "quedan", "fase", "etiqueta"]);

// El «todo» del gancho no va en rojo (solo el de «lo pierdes todo»): se marca con un carácter invisible para que no coincida
const DATOS = { ...datos, palabras: datos.palabras.map((p) => (p.s < datos.escenas[1].s && p.w.toLowerCase().startsWith("todo") ? { ...p, w: p.w + "\u2060" } : p)) };
export const Fases: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={DATOS} audio="gen/fases_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
