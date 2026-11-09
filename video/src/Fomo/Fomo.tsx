// Reel con historia "Lucía vio una acción subir un 20 % y entró justo arriba" (~37 s). Solo subtítulos abajo y el «sígueme»
// grande en medio. Lucía (stickman con coleta): una vela verde que crece +20 % y ella dando saltitos; se sube a la punta y la
// vela se da la vuelta (−5 % en 10 minutos); detrás de un cristal viendo subir algo sin ella (sin pérdida real); el plan de
// ayer, esperar el retroceso o dejarla ir; los trenes que llegan cada día frente a una cuenta que se vacía; y la pregunta.
// Tiempos en src/gen/fomo.json (scripts/fomo.py).
import React from "react";
import { useCurrentFrame } from "remotion";
import datos from "../gen/fomo.json";
import { ANCHO } from "../Viral/util";
import { euros, L, mono, muelle } from "../Bot/piezas";
import { Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, ROJO, suelo, VERDE } from "../Bot/kit";
import { Clave, cuerpoEn, Estado, Stick } from "../Bot/stick";
import { anclaje, BRAZOS_ARRIBA, CHOQUE, Exclama, FlashRojo, MANOS_CABEZA, SiguemeStick, StickMundo } from "../Bot/comun";
import { CamaraTiembla, fr, PreguntaDos, Sello } from "../Bot/historia";
import { claves, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const FOMO_FPS = datos.fps;
export const FOMO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;

// Saltitos nerviosos (suma a la cadera y a los pies)
const saltitos = (c: Estado, t: number, a: number, vel = 9): Estado => {
  const h = a * Math.max(0, Math.sin(t * vel));
  return { ...c, y: c.y + h, pIy: c.pIy + h * 1.1, pDy: c.pDy + h * 1.1 };
};

// ------------------------------------------------------------------ 1. Hook: la vela verde crece un 20 % y Lucía no puede aguantarse
const HOOK: Clave[] = [
  [0.2, { ojos: 1.3, cejas: 0.8, boca: 0.8, abre: 0.4, mira: 0.9 }],
  [EV["20"] - 0.2, { mDx: 0.25, mDy: 0.45, mIx: -0.25, mIy: 0.45 }],
  [EV.aguantarse - 0.3, { y: 0.6, mIx: -0.3, mIy: -0.35, mDx: 0.3, mDy: -0.35, incl: 0.1 }],
];
const VELA_X = 0.35;
const Hook: React.FC<P> = ({ t, s, e }) => {
  const sube = L(t, 0, EV.manana + 0.3, 0.15, 1.2, (u) => 1 - Math.pow(1 - u, 2));
  const cam = orbita([0.05, -0.3 + 0.3 * sube, 0], L(t, s, e, 4.4, 4.9), L(t, s, e, -0.2, 0.1), 0.12, { apertura: 38, centroY: 920 });
  const tr: Trazo[] = [...polvo(0.3)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.6);
  // Velas pequeñas detrás y la grande que crece
  for (let i = 0; i < 6; i++) {
    const x = -0.85 + i * 0.16;
    const h = 0.08 + 0.05 * fr(Math.sin(i * 3.3) * 77.1);
    cristal(tr, [x - 0.03, -0.6 + 0.02 * i, -0.4], [x + 0.03, -0.6 + 0.02 * i + h, -0.36], "#fff", 0.6, 0.1, 0.1);
  }
  cristal(tr, [VELA_X - 0.12, -1, -0.12], [VELA_X + 0.12, -1 + sube * 1.6, 0.12], VERDE, 1, 0.3 + 0.2 * Math.sin(t * 6), 0.25);
  tr.push({ t: "l", a: [VELA_X, -1 + sube * 1.6, 0], b: [VELA_X, -1 + sube * 1.6 + 0.12, 0], w: 3, o: 1, color: VERDE });
  const pr = proyector(cam);
  const qv = pr([VELA_X, -1 + sube * 1.6 + 0.16, 0]);
  const pct = Math.round(L(t, 0, EV.manana + 0.3, 0, 20));
  const base = cuerpoEn(t, HOOK, { mira: 0.8, boca: 0.3 });
  const c = t < EV.aguantarse - 0.4 ? saltitos(base, t, 0.06) : base;
  const a = anclaje(cam, [-0.55, -1, 0.4], 0.55);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qv.x, top: qv.y, transform: "translate(-50%, -100%)", ...mono(72), fontWeight: 700, color: VERDE, textShadow: "0 0 24px rgba(47,224,138,0.6)" }}>{`+${pct} %`}</div>
      <StickMundo a={a} c={c} t={t} coleta />
      <Exclama t={t} t0={EV.aguantarse - 0.3} c={c} {...a} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: se sube a la punta y la vela se da la vuelta: −5 % en 10 minutos
const s1 = inicio("uno");
const UNO: Clave[] = [
  [s1, { ...BRAZOS_ARRIBA, boca: 1, abre: 0.6, ojos: 1.2 }],
  [EV["10"] - 0.4, { ...CHOQUE }],
  [EV["5"] - 0.1, { ...MANOS_CABEZA }],
];
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.2, 0.2, 0], L(t, s, e, 5.4, 5.0) - 0.2 * golpe(t, EV["5"]), L(t, s, e, -0.1, 0.12) + sacude(t, EV["5"] - 0.05, 0.03), 0.12, { apertura: 38, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.3)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  const alto = 1.25;
  cristal(tr, [VELA_X - 0.12, -1, -0.12], [VELA_X + 0.12, -1 + alto, 0.12], VERDE, 1, 0.3, 0.25);
  // La vela roja que baja desde la punta
  const baja = L(t, EV.arriba + 0.2, EV["5"] + 0.3, 0, 1, (u) => u * u);
  const xr = VELA_X + 0.32;
  if (baja > 0) cristal(tr, [xr - 0.12, -1 + alto - 0.75 * baja, -0.12], [xr + 0.12, -1 + alto, 0.12], ROJO, 1, 0.3 + 0.5 * golpe(t, EV["5"]), 0.3);
  // Lucía en la punta; cuando la vela se da la vuelta, resbala hacia abajo
  const salto = L(t, s - 0.1, EV.entro + 0.3, 0, 1, (u) => u * u * (3 - 2 * u));
  const resbala = L(t, EV["5"] - 0.2, EV["5"] + 0.5, 0, 1, (u) => u * u);
  const pieY = -1 + (alto) * salto - 0.75 * resbala;
  const pieX = -0.5 + (VELA_X + 0.5) * salto + 0.32 * resbala;
  const a = anclaje(cam, [pieX, pieY, 0.0], 0.45);
  const c = cuerpoEn(t, UNO, { mira: 0.8 }, s - 0.3);
  const pr = proyector(cam);
  const qc = pr([xr + 0.18, -1 + alto - 0.3, 0.1]);
  const reloj = muelle(t, EV["10"] - 0.3, 240, 13);
  const menos = muelle(t, EV["5"] - 0.15, 260, 12);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <CamaraTiembla t={t} t0={EV["5"] - 0.05} a={0.02}>
        <div style={{ position: "absolute", top: 260, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 26, alignItems: "center" }}>
          {reloj > 0.01 && <span style={{ padding: "10px 20px", borderRadius: 14, border: "2px solid #fff", background: "#000", ...mono(36), transform: `scale(${Math.min(reloj, 1.08)})` }}>⏱ 10 MIN</span>}
          {menos > 0.01 && <span style={{ ...mono(92), fontWeight: 700, color: ROJO, transform: `scale(${Math.min(menos, 1.1)})` }}>−5 %</span>}
        </div>
        {salto > 0.9 && resbala < 0.2 && <div style={{ position: "absolute", left: Math.min(qc.x, 880), top: qc.y, ...mono(30), fontWeight: 700 }}>← ENTRADA</div>}
        <StickMundo a={a} c={c} t={t} coleta />
      </CamaraTiembla>
      <FlashRojo t={t} t0={EV["5"] - 0.05} o={0.16} />
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: FOMO — verlo subir sin ti duele como perder (aunque no pierdes nada)
const s2 = inicio("dos");
const DOS: Clave[] = [
  [s2 + 0.1, { mDx: 0.32, mDy: 0.12, mIx: -0.05, mIy: 0.1, mira: 0.9, boca: -0.4, cejas: -0.6, ojos: 1.15 }],
  [EV.nada - 0.4, { mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52, boca: 0.2, cejas: 0.5, ojos: 1, mira: 0 }],
];
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.2, -0.25, 0], L(t, s, e, 4.6, 4.2), L(t, s, e, 0.15, -0.12), 0.1, { apertura: 38, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  // Cristal entre Lucía y la vela que sube
  tr.push({ t: "p", pts: [[0.0, -1, -0.6], [0.0, 0.55, -0.6], [0.0, 0.55, 0.6], [0.0, -1, 0.6], [0.0, -1, -0.6]], w: 2.4, o: 0.9, relleno: "#fff", oRelleno: 0.05, luz: 0.2 });
  for (let k = 0; k < 3; k++) tr.push({ t: "l", a: [0.001, 0.3 - k * 0.12, -0.45 + k * 0.1], b: [0.001, 0.15 - k * 0.12, -0.25 + k * 0.1], w: 1.4, o: 0.5 });
  const sube = L(t, s, EV.perder, 0.2, 1.3);
  cristal(tr, [0.55 - 0.1, -1, -0.1], [0.55 + 0.1, -1 + sube * 1.3, 0.1], VERDE, 1, 0.3, 0.25);
  const c = cuerpoEn(t, DOS, { mira: 0.9 }, s - 0.3);
  const a = anclaje(cam, [-0.45, -1, 0.3], 0.55);
  const pierdes = Math.round(L(t, EV.fuera, EV.perder + 0.4, 0, 1250));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 260, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, EV.fomo - 0.3, EV.fomo, 0, 1) }}>
        <span style={{ padding: "12px 26px", borderRadius: 16, border: "3px solid #fff", background: "#000", ...mono(36), fontWeight: 700 }}>FOMO = MIEDO A QUEDARTE FUERA</span>
      </div>
      <div style={{ position: "absolute", top: 380, left: 90, width: 900, display: "flex", justifyContent: "space-between", opacity: L(t, EV.fuera - 0.2, EV.fuera + 0.1, 0, 1) }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={mono(24, 0.6)}>LO QUE SIENTES</span>
          <span style={{ ...mono(60), fontWeight: 700, color: ROJO }}>{`−${euros(pierdes)} €`}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", opacity: L(t, EV.nada - 0.6, EV.nada - 0.3, 0, 1) }}>
          <span style={mono(24, 0.6)}>LO QUE PIERDES</span>
          <span style={{ ...mono(60), fontWeight: 700 }}>0 €</span>
        </div>
      </div>
      <StickMundo a={a} c={c} t={t} coleta />
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme (Lucía)
const Sigueme: React.FC<P> = (p) => <SiguemeStick {...p} lema="" coleta />;

// ------------------------------------------------------------------ 5. Tres: no estaba en tu plan de ayer; espera el retroceso o déjala ir
const s3 = inicio("tres");
const TRES: Clave[] = [
  [s3 + 0.1, { mDx: 0.06, mDy: 0.13, mira: 0.7, cejas: 0.3, boca: 0 }],
  [EV.retroceda - 0.4, { mDx: 0.5, mDy: -0.05, mira: 0.9, boca: 0.4 }],
  [EV.dejala - 0.3, { mDx: 0.25, mDy: 0.55, boca: 0.6, ojos: 0.9, mira: 0.9 }],
];
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.3, -0.3, 0], L(t, s, e, 4.5, 4.1), L(t, s, e, -0.1, 0.12), 0.1, { apertura: 38, centroY: 920 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  const zona = L(t, EV.retroceda - 0.6, EV.retroceda - 0.2, 0, 1);
  // Gráfico: sube, retrocede a la zona marcada (camino A) o se va sin volver (camino B)
  const subida: V3[] = Array.from({ length: 8 }, (_, i) => [-0.05 + i * 0.09, -0.55 + i * 0.1 + 0.03 * Math.sin(i * 2), -0.3]);
  tr.push({ t: "p", pts: subida, w: 2.8, o: 1, luz: 0.3 });
  const yz = -0.3;
  if (zona > 0) tr.push({ t: "p", pts: [[0.25, yz - 0.06, -0.31], [0.25 + 1.0 * zona, yz - 0.06, -0.31], [0.25 + 1.0 * zona, yz + 0.06, -0.31], [0.25, yz + 0.06, -0.31], [0.25, yz - 0.06, -0.31]], w: 1.8, o: 1, color: VERDE, relleno: VERDE, oRelleno: 0.15, luz: 0.3 });
  const kA = L(t, EV.retroceda - 0.2, EV.retroceda + 0.8, 0, 1);
  if (kA > 0) {
    const a: V3[] = [[0.58, 0.15, -0.3], [0.7, 0.0, -0.3], [0.82, -0.18, -0.3], [0.94, -0.3, -0.3], [1.06, -0.1, -0.3]];
    tr.push({ t: "p", pts: a.slice(0, Math.max(2, Math.ceil(a.length * kA))), w: 2.6, o: t > EV.dejala - 0.4 ? 0.35 : 1, dash: "8 6", color: VERDE });
  }
  const kB = L(t, EV.dejala - 0.4, EV.dejala + 0.6, 0, 1);
  if (kB > 0) {
    const b: V3[] = [[0.58, 0.15, -0.3], [0.7, 0.3, -0.3], [0.82, 0.42, -0.3], [0.94, 0.58, -0.3], [1.06, 0.7, -0.3]];
    tr.push({ t: "p", pts: b.slice(0, Math.max(2, Math.ceil(b.length * kB))), w: 2.6, o: 1, dash: "8 6" });
  }
  const pr = proyector(cam);
  const qz = pr([1.25, yz, -0.31]);
  const qa = pr([1.06, -0.1, -0.3]);
  const qb = pr([1.06, 0.7, -0.3]);
  const plan = muelle(t, EV.plan - 0.5, 200, 14);
  const c = cuerpoEn(t, TRES, { mira: 0.7 }, s - 0.3);
  const ag = anclaje(cam, [-0.22, -1, 0.5], 0.5);
  const tacha = L(t, EV.operacion - 0.4, EV.operacion - 0.1, 0, 1);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {plan > 0.01 && (
        <div style={{ position: "absolute", left: 110, top: 260, width: 520, opacity: Math.min(plan * 1.5, 1) * (1 - L(t, EV.retroceda - 0.6, EV.retroceda - 0.3, 0, 0.6)), transform: `scale(${0.8 + 0.2 * Math.min(plan, 1.05)}) rotate(-2deg)`, transformOrigin: "0% 0%" }}>
          <div style={{ borderRadius: 16, border: "3px solid #fff", background: "rgba(5,5,5,0.94)", padding: "16px 22px" }}>
            <div style={{ ...mono(24, 0.6), marginBottom: 8 }}>PLAN (ESCRITO AYER)</div>
            {["EUR/USD", "ORO", "NASDAQ"].map((n) => (
              <div key={n} style={{ ...mono(30), lineHeight: 1.5 }}>{`· ${n}`}</div>
            ))}
            <div style={{ position: "relative", ...mono(30), lineHeight: 1.5, color: ROJO, opacity: L(t, EV.plan + 0.3, EV.plan + 0.6, 0, 1) }}>
              {"· ACCIÓN +20 % ?"}
              <div style={{ position: "absolute", left: 0, top: "52%", height: 5, width: `${tacha * 100}%`, background: ROJO }} />
            </div>
          </div>
          {tacha > 0.9 && <div style={{ marginTop: 10, ...mono(30), fontWeight: 700, color: ROJO }}>✗ NO ES TU OPERACIÓN</div>}
        </div>
      )}
      {zona > 0.5 && <div style={{ position: "absolute", left: Math.min(qz.x, 1040), top: qz.y, transform: "translate(-100%, 40%)", ...mono(24), fontWeight: 700, color: VERDE }}>ESPERA AQUÍ</div>}
      {kA >= 1 && t < EV.dejala - 0.4 && <div style={{ position: "absolute", left: Math.min(qa.x, 1000), top: qa.y, transform: "translate(-100%, -150%)", ...mono(26), fontWeight: 700, color: VERDE }}>✓ ENTRADA CON PLAN</div>}
      {kB >= 1 && <div style={{ position: "absolute", left: Math.min(qb.x, 1000), top: qb.y, transform: "translate(-100%, -150%)", ...mono(26), fontWeight: 700 }}>NO VUELVE → DÉJALA IR</div>}
      <StickMundo a={ag} c={c} t={t} coleta />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: los trenes llegan cada día; tu cuenta no se rellena
const sG = inicio("giro");
const DIAS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "LUN", "MAR", "MIÉ"];
const GIRO: Clave[] = [
  [sG + 0.1, { mira: 0.9, boca: 0.4, cejas: 0.2, mIx: -0.13, mIy: -0.42, mDx: 0.13, mDy: -0.42 }],
  [EV.si - 0.3, { mira: 0, boca: 0, cejas: -0.2 }],
];
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.2, -0.45, 0], L(t, s, e, 4.4, 4.0), L(t, s, e, -0.3, -0.05), 0.15, { apertura: 38, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.12, "#fff", 0.2);
  // Andén y vías
  cristal(tr, [-1.4, -1, 0.1], [1.6, -0.9, 0.7], "#fff", 0.7, 0.1, 0.03);
  for (const z of [-0.2, -0.05]) tr.push({ t: "l", a: [-3, -0.99, z], b: [3, -0.99, z], w: 2, o: 0.6 });
  // Trenes que pasan uno tras otro (cada uno, un día)
  const pr = proyector(cam);
  const rotulos: { x: number; d: string }[] = [];
  const periodo = 1.0;
  for (let k = 0; k < 8; k++) {
    const x = 3.2 - ((t - s) - k * periodo) * 3.2;
    if (x < -3.4 || x > 3.4) continue;
    cristal(tr, [x - 0.55, -0.95, -0.28], [x + 0.55, -0.45, 0.03], "#fff", 0.9, 0.15, 0.06);
    for (let w = 0; w < 4; w++) tr.push({ t: "p", pts: [[x - 0.45 + w * 0.25, -0.75, 0.031], [x - 0.3 + w * 0.25, -0.75, 0.031], [x - 0.3 + w * 0.25, -0.6, 0.031], [x - 0.45 + w * 0.25, -0.6, 0.031], [x - 0.45 + w * 0.25, -0.75, 0.031]], w: 1.2, o: 0.8, relleno: "#fff", oRelleno: 0.15 });
    rotulos.push({ x, d: DIAS[k] });
  }
  const c = cuerpoEn(t, GIRO, { mira: 0.9 }, s - 0.3);
  const a = anclaje(cam, [-0.25, -0.9, 0.5], 0.5);
  const vacia = L(t, EV.cuenta - 0.2, EV.si + 0.2, 0, 1);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {rotulos.map(({ x, d }, i) => {
        const q = pr([x, -0.38, -0.12]);
        return q.x > -100 && q.x < 1180 ? <div key={i} style={{ position: "absolute", left: q.x, top: q.y, transform: "translate(-50%, -100%)", ...mono(26), fontWeight: 700 }}>{d}</div> : null;
      })}
      <div style={{ position: "absolute", top: 270, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 40, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: L(t, EV.dias - 0.4, EV.dias, 0, 1) }}>
          <span style={mono(24, 0.6)}>OPORTUNIDADES</span>
          <span style={{ ...mono(64), fontWeight: 700, color: VERDE }}>∞</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: L(t, EV.cuenta - 0.4, EV.cuenta - 0.1, 0, 1) }}>
          <span style={mono(24, 0.6)}>TU CUENTA</span>
          <div style={{ width: 300, height: 40, borderRadius: 10, border: "3px solid #fff", padding: 4 }}>
            <div style={{ width: `${(1 - 0.85 * vacia) * 100}%`, height: "100%", borderRadius: 5, background: vacia > 0.6 ? ROJO : "#fff" }} />
          </div>
        </div>
      </div>
      <StickMundo a={a} c={c} t={t} coleta />
      <FlashRojo t={t} t0={EV.si} o={0.12} />
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta: ¿cuál fue la última vela que perseguiste?
const Pregunta: React.FC<P> = (p) => <PreguntaDos {...p} izq={{ texto: "NUNCA", sub: "NO PERSIGO", t0: EV.ultima }} der={{ texto: "HOY MISMO", t0: EV.ultima + 0.6 }} pie="ETIQUETA A LA LUCÍA DE TU GRUPO" tPie={EV.etiqueta} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves(["lucía", ["20", VERDE], "aguantarse", "arriba", ["5", ROJO], "fomo", "fuera", "perder", "nada", "sígueme", "plan", "operación", ["retroceda", VERDE], "déjala", "días", "acaban", ["sí", ROJO], "última", "etiqueta"]);

export const Fomo: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/fomo_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
