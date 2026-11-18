// Historia 5-30-10 «dopamina» "Antes de entrar, imagina que la operación ya ha salido mal" (~35 s), con stickmen.
// Fotograma 0: el stickman («tú») con el dedo yendo a COMPRAR y una bola de cristal que enseña la operación en rojo;
// el equipo frente a la pizarra «¿POR QUÉ HA FALLADO?» y PREMORTEM; la niebla rosa de la ilusión que se levanta; las
// gafas de color de rosa (solo flechas verdes) y el dial del tamaño que se dispara; la regla: la nota «ha salido mal
// porque…», vacía → DEMASIADO SEGURO → el dial baja. Cierre en el móvil. Tiempos en src/gen/premortem.json.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/premortem.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { cuerpoEn, Stick } from "../Bot/stick";
import { CHOQUE, ENCOGE } from "../Bot/comun";
import { Sello } from "../Bot/historia";
import { Foco } from "../Bot/ui2d";
import { Boton, Rotulito } from "../Bot/v3";
import { CierreMovil, Ficha3D, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const PREMORTEM_FPS = datos.fps;
export const PREMORTEM_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);
const ROSA = "#ff6fb5";

// ------------------------------------------------------------------ 1. Hook: el dedo va a COMPRAR · la bola de cristal: YA HA SALIDO MAL
const BX = 700;
const BY = 720;
const BR = 190;
const Bola: React.FC<{ t: number }> = ({ t }) => {
  const u = L(t, EV.imagina - 0.1, EV.mal + 0.2, 0, 1, (v) => v);
  const pts: string[] = [];
  for (let k = 0; k <= 60 * u; k++) {
    const v = k / 60;
    const val = v < 0.35 ? v * 0.5 : 0.175 - (v - 0.35) * 1.4;
    pts.push(`${BX - 150 + v * 300},${BY + 20 - val * 260 + 8 * Math.sin(v * 30)}`);
  }
  const mal = L(t, EV.mal - 0.15, EV.mal + 0.05, 0, 1);
  const halo = 0.5 + 0.5 * Math.sin(t * 5);
  return (
    <>
      <div style={{ position: "absolute", left: BX - BR - 40, top: BY - BR - 40, width: 2 * BR + 80, height: 2 * BR + 80, borderRadius: "50%", background: `radial-gradient(circle, ${mal > 0.5 ? "rgba(255,70,70,0.35)" : "rgba(140,110,255,0.3)"} 0%, rgba(0,0,0,0) 68%)`, opacity: 0.7 + 0.3 * halo }} />
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="cristal" cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#3b2f6e" /><stop offset="70%" stopColor="#120d26" /><stop offset="100%" stopColor="#05040c" /></radialGradient>
          <clipPath id="dentro"><circle cx={BX} cy={BY} r={BR - 8} /></clipPath>
        </defs>
        <path d={`M${BX - 130} ${BY + BR + 50} L${BX - 90} ${BY + BR - 10} H${BX + 90} L${BX + 130} ${BY + BR + 50} Z`} fill="#1a1408" stroke={ORO} strokeWidth={5} />
        <circle cx={BX} cy={BY} r={BR} fill="url(#cristal)" stroke={mal > 0.5 ? ROJO : "#b9a8ff"} strokeWidth={6} />
        <g clipPath="url(#dentro)">
          {[0, 1, 2].map((i) => <ellipse key={i} cx={BX + 60 * Math.sin(t * 1.3 + i * 2)} cy={BY + 50 * Math.cos(t * 1.1 + i * 2)} rx={110} ry={50} fill="rgba(185,168,255,0.12)" />)}
          {pts.length > 1 && <polyline points={pts.join(" ")} fill="none" stroke={ROJO} strokeWidth={8} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${ROJO})` }} />}
        </g>
        <ellipse cx={BX - 70} cy={BY - 90} rx={50} ry={26} fill="rgba(255,255,255,0.18)" transform={`rotate(-30 ${BX - 70} ${BY - 90})`} />
      </svg>
      <div style={{ position: "absolute", left: BX - 260, width: 520, top: BY + BR + 70, textAlign: "center", ...mono(40), fontWeight: 800, color: ROJO, opacity: mal, transform: `scale(${0.7 + 0.3 * mal})` }}>YA HA SALIDO MAL</div>
    </>
  );
};
const Hook: React.FC<P> = ({ t, s }) => {
  const c = cuerpoEn(t, [[s, { mDx: 0.62, mDy: 0.08, mira: 0.8, boca: 0.7 }], [EV.mal - 0.15, { ...CHOQUE, mDx: 0.32, mira: 0.6 }]], { mDx: 0.5, mDy: -0.05, mira: 0.8, boca: 0.7 }, s - 0.4);
  return (
    <>
      <Bola t={t} />
      <Boton x={470} y={1190} w={320} h={115} texto="COMPRAR" color={VERDE} o={0.95} />
      <Foco x={180} y={1430} w={320} h={60} o={0.15} />
      <Stick c={c} ox={180} oy={1430} s={230} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: ¿raro? · el equipo y la pizarra · PREMORTEM · la niebla de la ilusión se levanta
const ITEMS = ["SALIÓ UNA NOTICIA", "ENTRÉ CON DEMASIADO", "NO PUSE EL STOP"];
const Uno: React.FC<P> = ({ t, s }) => {
  const pizarra = muelle(t, EV.equipos - 0.3, 200, 14);
  const niebla = t < EV.obliga - 0.1 ? L(t, EV.premortem - 0.4, EV.premortem, 0, 1) : 1 - L(t, EV.obliga - 0.1, EV.ilusion + 0.5, 0, 1);
  const yo = cuerpoEn(t, [[EV.raro - 0.1, { ...ENCOGE }], [EV.equipos - 0.2, { mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52, cejas: 0.4, boca: 0.2, cabeza: 0 }]], {}, s - 0.3);
  const quien = (i: number) =>
    cuerpoEn(t, i === 1 ? [[EV.equipos, { mDx: 0.3, mDy: 0.5, mira: 0.2, boca: -0.2, cejas: 0.5 }], [EV.obliga, { mDx: 0.35, mDy: 0.55, mira: 0, boca: 0, cejas: 0.8 }]] : [[EV.equipos + i * 0.1, { mDx: 0.1, mDy: 0.12, mira: i === 0 ? 0.4 : -0.4, cejas: -0.3, boca: -0.3, cabeza: i === 0 ? 0.1 : -0.1 }]], {}, EV.equipos - 0.6);
  return (
    <>
      {t < EV.equipos - 0.1 && (
        <>
          <div style={{ position: "absolute", left: 0, width: ANCHO, top: 620, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 220, color: ORO, opacity: L(t, EV.raro - 0.2, EV.raro, 0, 1) * (1 - L(t, EV.equipos - 0.3, EV.equipos - 0.1, 0, 1)), transform: `rotate(${8 * Math.sin(t * 6)}deg)` }}>?</div>
          <Stick c={yo} ox={540} oy={1360} s={200} t={t} />
        </>
      )}
      {pizarra > 0.01 && (
        <div style={{ position: "absolute", inset: 0, opacity: min1(pizarra * 2) }}>
          <div style={{ position: "absolute", left: 130, top: 450, width: 820, height: 420, borderRadius: 22, background: "#f2f2ee", border: "10px solid #3a3a3a", transform: `scale(${0.7 + 0.3 * min1(pizarra, 1.05)})`, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, width: 800, top: 28, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 58, color: ROJO }}>¿POR QUÉ HA FALLADO?</div>
            {ITEMS.map((txt, i) => {
              const o = L(t, EV.obliga - 0.2 + i * 0.3, EV.obliga + 0.1 + i * 0.3, 0, 1);
              return <div key={i} style={{ position: "absolute", left: 60, top: 130 + i * 82, ...mono(42), fontWeight: 800, color: "#1a1a1a", opacity: o, transform: `translateX(${(1 - o) * 40}px)` }}>· {txt}</div>;
            })}
            {niebla > 0.01 && (
              <AbsoluteFill style={{ top: 110, background: `radial-gradient(ellipse at center, ${ROSA}ee 0%, ${ROSA}bb 60%, ${ROSA}55 100%)`, opacity: niebla, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ ...mono(46), fontWeight: 800, color: "#fff", letterSpacing: "0.1em" }}>TU ILUSIÓN</span>
              </AbsoluteFill>
            )}
          </div>
          {[0, 1, 2].map((i) => <Stick key={i} c={quien(i)} ox={260 + i * 280} oy={1380} s={150} t={t + i} />)}
          <Ficha3D t={t} t0={EV.premortem - 0.15} texto="PREMORTEM" y={990} size={110} color={ORO} fin={EV.obliga + 0.1} />
        </div>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 3. Sígueme encima de la escena
const s1 = inicio("uno");
const Sigueme: React.FC<P> = (p) => (
  <>
    <AbsoluteFill style={{ filter: "blur(9px)" }}>
      <Uno t={p.t} s={s1} e={fin("uno")} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "rgba(0,0,0,0.6)" }} />
    <CtaSeguir {...p} lema="" sinFondo />
  </>
);

// ------------------------------------------------------------------ el dial del tamaño (×1 … ×5)
const Dial: React.FC<{ v: number; y: number; o?: number; tiembla?: number; t: number }> = ({ v, y, o = 1, tiembla = 0, t }) => {
  const R = 230;
  const cx = 540;
  const ang = -90 + ((v - 1) / 4) * 180 + tiembla * 6 * Math.sin(t * 40);
  const arco = (a0: number, a1: number) => {
    const p = (a: number) => [cx + R * Math.sin((a * Math.PI) / 180), y - R * Math.cos((a * Math.PI) / 180)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}`;
  };
  const col = v < 2.6 ? VERDE : v < 3.8 ? ORO : ROJO;
  return (
    <div style={{ opacity: o }}>
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={arco(-90, -18)} stroke={VERDE} strokeWidth={34} fill="none" />
        <path d={arco(-14, 34)} stroke={ORO} strokeWidth={34} fill="none" />
        <path d={arco(38, 90)} stroke={ROJO} strokeWidth={34} fill="none" />
        <line x1={cx} y1={y} x2={cx + (R - 40) * Math.sin((ang * Math.PI) / 180)} y2={y - (R - 40) * Math.cos((ang * Math.PI) / 180)} stroke="#fff" strokeWidth={12} strokeLinecap="round" />
        <circle cx={cx} cy={y} r={22} fill="#fff" />
      </svg>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: y + 30, textAlign: "center", ...mono(34), fontWeight: 800, color: "rgba(255,255,255,0.75)" }}>TAMAÑO</div>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: y - 140, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 84, color: col }}>×{Math.round(v)}</div>
    </div>
  );
};

// ------------------------------------------------------------------ 4. Dos: las gafas de color de rosa (solo flechas verdes) · el tamaño se dispara
const Dos: React.FC<P> = ({ t, s }) => {
  const gafas = muelle(t, s + 0.05, 200, 13);
  const dial = L(t, EV.tamano - 0.4, EV.tamano - 0.1, 0, 1);
  const v = L(t, EV.tamano - 0.1, EV.manos, 1, 5, (u) => u * u);
  const lente = (x: number) => (
    <div style={{ position: "absolute", left: x, top: 500, width: 360, height: 270, borderRadius: 90, border: "16px solid #111", outline: `6px solid ${ROSA}`, background: `${ROSA}40`, overflow: "hidden", boxShadow: `0 0 50px ${ROSA}66` }}>
      {[0, 1, 2].map((i) => {
        const o = L(t, EV.seguro + 0.2 + i * 0.35 + (x > 500 ? 0.15 : 0), EV.seguro + 0.45 + i * 0.35 + (x > 500 ? 0.15 : 0), 0, 1);
        return (
          <svg key={i} width={70} height={110} style={{ position: "absolute", left: 40 + i * 100, top: 70 - 20 * Math.sin(t * 4 + i), opacity: o }}>
            <path d="M35 0 L68 45 L48 45 L48 110 L22 110 L22 45 L2 45 Z" fill={VERDE} />
          </svg>
        );
      })}
    </div>
  );
  return (
    <>
      <div style={{ position: "absolute", inset: 0, opacity: min1(gafas * 2), transform: `scale(${0.7 + 0.3 * min1(gafas, 1.05)})`, transformOrigin: "540px 640px" }}>
        {lente(150)}
        {lente(570)}
        <div style={{ position: "absolute", left: 500, top: 590, width: 80, height: 26, borderRadius: 13, background: "#111", border: `5px solid ${ROSA}` }} />
      </div>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: 410, textAlign: "center", ...mono(36), fontWeight: 800, color: ROSA, opacity: L(t, EV.seguro - 0.1, EV.seguro + 0.15, 0, 1) }}>MODO «ESTOY SEGURO»</div>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: 820, textAlign: "center", ...mono(38), fontWeight: 800, color: VERDE, opacity: L(t, EV.bien - 0.25, EV.bien, 0, 1) }}>SOLO VES POR QUÉ SALE BIEN</div>
      {dial > 0 && <Dial v={v} y={1240} o={dial} tiembla={L(t, EV.manos - 0.3, EV.manos, 0, 1)} t={t} />}
      {t > EV.manos - 0.1 && <AbsoluteFill style={{ background: ROJO, opacity: 0.1 + 0.06 * Math.sin(t * 30) }} />}
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: escribe «ha salido mal porque…» · si no se te ocurre nada, baja el tamaño
const FRASE = "Esta operación ha salido mal porque…";
const Giro: React.FC<P> = ({ t }) => {
  const nota = muelle(t, EV.escribe - 0.2, 200, 14);
  const n = Math.floor(L(t, EV.frase - 0.1, EV.porque + 0.3, 0, FRASE.length, (u) => u));
  const cursor = Math.floor(t * 3) % 2 === 0;
  const nada = L(t, EV.ocurre - 0.2, EV.ocurre + 0.1, 0, 1);
  const dial = L(t, EV.demasiado - 0.3, EV.demasiado, 0, 1);
  const v = t < EV.baja - 0.1 ? 5 : L(t, EV.baja - 0.1, EV.baja + 0.5, 5, 1, (u) => 1 - Math.pow(1 - u, 3));
  const dedo = L(t, EV.regla - 0.1, EV.regla + 0.15, 0, 1) * (1 - L(t, EV.escribe - 0.2, EV.escribe, 0, 1));
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={360} />
      {dedo > 0 && (
        <>
          <Boton x={540} y={800} w={460} h={150} texto="COMPRAR" color={VERDE} o={dedo} />
          <div style={{ position: "absolute", left: 0, width: ANCHO, top: 920, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 64, color: ORO, opacity: dedo * L(t, EV.pulsar - 0.2, EV.pulsar, 0, 1) }}>ESPERA</div>
        </>
      )}
      {nota > 0.01 && (
        <div style={{ position: "absolute", left: 120, top: 460, width: 840, height: 420, background: "#ffe98a", borderRadius: 10, transform: `rotate(-2deg) scale(${0.6 + 0.4 * min1(nota, 1.05)})`, opacity: min1(nota * 2), boxShadow: "0 30px 70px rgba(0,0,0,0.75)" }}>
          <div style={{ position: "absolute", left: 50, top: 40, right: 50, fontFamily: SANS, fontWeight: 800, fontSize: 60, lineHeight: 1.2, color: "#1b1b1b" }}>
            {FRASE.slice(0, n)}
            {(n < FRASE.length || cursor) && <span style={{ color: ROJO }}>|</span>}
          </div>
          <div style={{ position: "absolute", left: 50, top: 300, ...mono(40), fontWeight: 800, color: "rgba(0,0,0,0.35)", opacity: nada }}>(…nada)</div>
        </div>
      )}
      <Sello t={t} t0={EV.demasiado - 0.1} texto="DEMASIADO SEGURO" top={930} color={ROJO} size={62} fin={EV.baja - 0.15} />
      {dial > 0 && <Dial v={v} y={1300} o={dial} t={t} tiembla={0} />}
      {t > EV.baja && <div style={{ position: "absolute", left: 0, width: ANCHO, top: 960, textAlign: "center", ...mono(40), fontWeight: 800, color: VERDE, opacity: L(t, EV.baja, EV.baja + 0.3, 0, 1) }}>BAJA EL TAMAÑO</div>}
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["imagina", ORO], ["mal", ROJO], "raro", "equipos", "profesionales", ["premortem", ORO], "obliga", ["ilusión", ROSA], "sígueme", ["diez", ORO], ["seguro", ROSA], ["bien", VERDE], ["tamaño", ROJO], ["manos", ROJO], "regla", "pulsar", ["escribe", ORO], "frase", ["nada", ROJO], ["demasiado", ROJO], ["baja", VERDE], "llegado", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV.imagina, ORO], [EV.mal, ROJO], [EV.raro, ORO], [EV.equipos], [EV.premortem, ORO], [EV.obliga], [EV.ilusion, ROSA], [EV.seguro, ROSA], [EV.bien, VERDE], [EV.tamano, ORO], [EV.manos, ROJO], [EV.regla], [EV.pulsar], [EV.escribe, ORO], [EV.porque], [EV.ocurre], [EV.demasiado, ROJO], [EV.baja, VERDE], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["Imagina que tu operación", "ya ha *salido_mal*"], hasta: inicio("uno") - 0.05, color: ROJO };
export const Premortem: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/premortem_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
