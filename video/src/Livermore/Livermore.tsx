// Reel con historia real "En 1929 ganó 100 millones con el crac; en 1934 estaba en bancarrota" (~39 s). Solo subtítulos
// abajo y el «sígueme» grande en medio. Jesse Livermore (stickman con sombrero de los años 20): Wall Street en 1929 con la
// cinta de cotizaciones y la multitud arruinada; el Dow que se desploma con su corto; la libreta de reglas que encoge
// mientras él crece; 1934 y el sello de bancarrota; las reglas leídas antes de cada operación y el candado que aprieta
// cuanto más gana; y la pregunta. Tiempos en src/gen/livermore.json (scripts/livermore.py).
import React from "react";
import { useCurrentFrame } from "remotion";
import datos from "../gen/livermore.json";
import { ANCHO } from "../Viral/util";
import { euros, L, mono, muelle } from "../Bot/piezas";
import { Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, fichas, ROJO, suelo, VERDE } from "../Bot/kit";
import { Clave, cuerpoEn, Estado, Stick } from "../Bot/stick";
import { anclaje, CHOQUE, FlashRojo, MANOS_CABEZA, sentado, SiguemeStick, StickMundo } from "../Bot/comun";
import { CamaraTiembla, FlashVerde, fr, Marcador, PreguntaDos, Sello } from "../Bot/historia";
import { claves, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const LIVERMORE_FPS = datos.fps;
export const LIVERMORE_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;

// Fachada de la bolsa de Nueva York en wireframe
const fachada = (tr: Trazo[], cx: number, z: number, o = 1) => {
  cristal(tr, [cx - 1.0, -1, z - 0.3], [cx + 1.0, -0.93, z + 0.3], "#fff", 0.8 * o, 0.1, 0.03);
  for (let i = 0; i < 6; i++) {
    const x = cx - 0.75 + i * 0.3;
    cristal(tr, [x - 0.05, -0.93, z + 0.12], [x + 0.05, 0.12, z + 0.22], "#fff", 0.85 * o, 0.12, 0.04);
  }
  tr.push({ t: "p", pts: [[cx - 0.92, 0.12, z + 0.25], [cx + 0.92, 0.12, z + 0.25], [cx + 0.92, 0.28, z + 0.25], [cx - 0.92, 0.28, z + 0.25], [cx - 0.92, 0.12, z + 0.25]], w: 2.2, o, relleno: "#000", oRelleno: 0.85 });
  tr.push({ t: "p", pts: [[cx - 0.95, 0.28, z + 0.25], [cx, 0.58, z + 0.25], [cx + 0.95, 0.28, z + 0.25], [cx - 0.95, 0.28, z + 0.25]], w: 2.2, o, relleno: "#000", oRelleno: 0.85 });
};

// Cinta de cotizaciones: franja que cruza la pantalla con precios que caen
const Cinta: React.FC<{ t: number; top: number; o?: number }> = ({ t, top, o = 1 }) => {
  const items = ["US STEEL ▼ −12 %", "GM ▼ −9 %", "RCA ▼ −15 %", "AT&T ▼ −8 %", "GE ▼ −11 %", "CHRYSLER ▼ −13 %"];
  const ancho = 2600;
  const x = -((t * 380) % ancho);
  return (
    <div style={{ position: "absolute", left: 0, top, width: ANCHO, height: 70, overflow: "hidden", borderTop: "2px solid rgba(255,255,255,0.6)", borderBottom: "2px solid rgba(255,255,255,0.6)", background: "rgba(0,0,0,0.85)", opacity: o, transform: "rotate(-3deg)" }}>
      <div style={{ position: "absolute", left: x, top: 14, display: "flex", gap: 60, whiteSpace: "nowrap", ...mono(36), color: ROJO }}>
        {[...items, ...items, ...items].map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ 1. Hook: 1929, medio mundo arruinado y él gana 100 millones
const MULTITUD: [number, number, number][] = [[-0.95, 0.15, 0.4], [-0.6, -0.2, 0.42], [0.6, 0.0, 0.4], [0.95, -0.3, 0.42], [-0.35, -0.45, 0.38], [0.35, -0.5, 0.38]];
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.25, 0], L(t, s, e, 5.2, 4.6), L(t, s, e, -0.2, 0.12), 0.12, { apertura: 38, centroY: 880 });
  const tr: Trazo[] = [...polvo(0.3)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  fachada(tr, 0, -0.9);
  const pr = proyector(cam);
  const qn = pr([0, 0.2, -0.64]);
  const quiebra = L(t, EV.arruinaba - 0.6, EV.arruinaba, 0, 1);
  const el = muelle(t, EV["100"] - 0.6, 200, 13);
  const cl: Estado = cuerpoEn(t, [[EV["100"] - 0.4, { ...BRAZOS_LIV, boca: 0.9, ojos: 0.85, cejas: 0.4 }]], { mira: 0, boca: 0.3, cejas: 0.2 }, 0);
  const aL = anclaje(cam, [0, -1, 0.5], 0.6);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qn.x, top: qn.y, transform: "translate(-50%, -50%)", ...mono(30), fontWeight: 700, letterSpacing: "0.15em" }}>NYSE · 1929</div>
      <Cinta t={t} top={330} />
      {MULTITUD.map(([x, dx, z], i) => {
        const a = anclaje(cam, [x, -1, z], 0.38);
        const c = cuerpoEn(t, [[EV.arruinaba - 0.5 + i * 0.08, { ...MANOS_CABEZA }]], { mira: dx, boca: -0.2 }, 0);
        return <Stick key={i} c={c} ox={a.ox} oy={a.oy} s={a.s} t={t + i * 0.7} o={0.5 + 0.5 * quiebra} />;
      })}
      {el > 0.01 && <StickMundo a={aL} c={cl} t={t} sombrero o={Math.min(1, el * 1.5)} />}
      <Marcador t={t} t0={EV["100"]} t1={EV.dolares + 0.3} hasta={100000000} signo="+" color={VERDE} top={450} size={86} />
      <FlashVerde t={t} t0={EV["100"]} o={0.1} />
    </>
  );
};
const BRAZOS_LIV = { mIx: -0.13, mIy: -0.42, mDx: 0.13, mDy: -0.42, incl: -0.04 };

// ------------------------------------------------------------------ 2. Uno: apuesta a la caída, acierta; el especulador más famoso con sus reglas
const s1 = inicio("uno");
const DOW = [0.42, 0.45, 0.47, 0.5, 0.49, 0.52, 0.5, 0.35, 0.15, 0.2, 0.05, -0.1, -0.05, -0.2, -0.3];
const UNO: Clave[] = [
  [s1 + 0.1, { mDx: 0.5, mDy: -0.3, mira: 0.8, boca: 0.2, cejas: 0.5 }],
  [EV.lleno - 0.1, { mDx: 0.25, mDy: 0.5, boca: 0.9, abre: 0.4, ojos: 1.1 }],
  [EV.famoso - 0.2, { ...BRAZOS_LIV, abre: 0, boca: 0.8, ojos: 0.85, mira: 0 }],
  [EV.reglas1 - 0.4, { mDx: 0.3, mDy: -0.05, mira: 0.7 }],
];
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.3, -0.2, 0], L(t, s, e, 4.6, 4.1), L(t, s, e, -0.15, 0.15) + sacude(t, EV.lleno - 0.1, 0.02), 0.1, { apertura: 38, centroY: 860 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  const n = Math.max(2, Math.round(L(t, EV.caeria - 0.3, EV.lleno + 0.1, 6, DOW.length, (u) => u)));
  const pts: V3[] = DOW.slice(0, n).map((v, i) => [-0.25 + i * 0.1, v, -0.3]);
  tr.push({ t: "p", pts: pts.slice(0, 7), w: 2.8, o: 1, luz: 0.3 });
  if (pts.length > 7) tr.push({ t: "p", pts: pts.slice(6), w: 3.4, o: 1, color: ROJO, luz: 0.5 });
  // Flecha del corto
  const corto = L(t, EV.caeria - 0.2, EV.caeria + 0.3, 0, 1);
  if (corto > 0) {
    const a0: V3 = [0.5, 0.55, -0.25];
    const a1: V3 = [0.5 + 0.55 * corto, 0.55 - 0.6 * corto, -0.25];
    tr.push({ t: "l", a: a0, b: a1, w: 4, o: 1, color: VERDE, luz: 0.6 });
    if (corto >= 1) {
      tr.push({ t: "l", a: a1, b: [a1[0] - 0.1, a1[1] + 0.02, a1[2]], w: 4, o: 1, color: VERDE });
      tr.push({ t: "l", a: a1, b: [a1[0] - 0.03, a1[1] + 0.1, a1[2]], w: 4, o: 1, color: VERDE });
    }
  }
  const pr = proyector(cam);
  const qd = pr([-0.25, 0.62, -0.3]);
  const qc = pr([0.78, 0.35, -0.25]);
  const c = cuerpoEn(t, UNO, { mira: 0.8 }, s - 0.3);
  const a = anclaje(cam, [-0.12, -1, 0.5], 0.55);
  const periodico = muelle(t, EV.famoso - 0.4, 200, 14);
  const libreta = muelle(t, EV.reglas1 - 0.6, 220, 14);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: Math.max(qd.x, 60), top: qd.y, transform: "translateY(-100%)", ...mono(28, 0.8), letterSpacing: "0.1em", opacity: periodico > 0.5 ? 0 : 1 }}>DOW JONES · 1929</div>
      {corto > 0.5 && periodico < 0.5 && <div style={{ position: "absolute", left: Math.min(qc.x, 900), top: qc.y, ...mono(34), fontWeight: 700, color: VERDE }}>{t > EV.lleno ? "CORTO ✓" : "CORTO ↓"}</div>}
      {periodico > 0.01 && libreta < 0.3 && (
        <div style={{ position: "absolute", left: 140, top: 290, width: 800, perspective: 1400, opacity: Math.min(periodico * 1.5, 1) }}>
          <div style={{ background: "#f2efe6", color: "#111", borderRadius: 6, padding: "20px 28px", transform: `rotate(-3deg) rotateX(${(1 - Math.min(periodico, 1)) * 60}deg)`, boxShadow: "0 0 50px rgba(255,255,255,0.15)" }}>
            <div style={{ ...mono(22), color: "#111", borderBottom: "2px solid #111", paddingBottom: 8 }}>PRENSA · OCTUBRE DE 1929</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 54, fontWeight: 700, lineHeight: 1.1, marginTop: 12 }}>EL GRAN OSO DE WALL STREET</div>
            <div style={{ ...mono(22), color: "#333", marginTop: 10 }}>J. LIVERMORE GANA CON LA CAÍDA</div>
          </div>
        </div>
      )}
      {libreta > 0.01 && (
        <div style={{ position: "absolute", left: 200, top: 300, width: 680, opacity: Math.min(libreta * 1.5, 1), transform: `scale(${0.7 + 0.3 * Math.min(libreta, 1.05)}) rotate(2deg)` }}>
          <div style={{ borderRadius: 16, border: "3px solid #fff", background: "rgba(5,5,5,0.94)", padding: "20px 28px 24px 64px", position: "relative" }}>
            <div style={{ position: "absolute", left: 36, top: 0, bottom: 0, width: 2, background: ROJO, opacity: 0.6 }} />
            <div style={{ ...mono(28), fontWeight: 700, marginBottom: 12 }}>MIS REGLAS</div>
            {["1. CORTA LAS PÉRDIDAS", "2. NUNCA PROMEDIES A LA BAJA", "3. ESPERA TU MOMENTO"].map((r, i) => (
              <div key={r} style={{ ...mono(28), opacity: L(t, EV.reglas1 - 0.3 + i * 0.15, EV.reglas1 + i * 0.15, 0, 1), whiteSpace: "nowrap", lineHeight: 1.6 }}>{r}</div>
            ))}
          </div>
        </div>
      )}
      <StickMundo a={a} c={c} t={t} sombrero />
      <FlashVerde t={t} t0={EV.lleno - 0.1} o={0.12} />
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: con tanto dinero, la confianza crece y las reglas encogen
const s2 = inicio("dos");
const DOS: Clave[] = [
  [s2 + 0.1, { ...BRAZOS_LIV, boca: 0.9, ojos: 0.8, cejas: 0.5, cabeza: 0.1, incl: -0.08 }],
  [EV.respeto - 0.2, { mDx: 0.5, mDy: 0.05, mira: 0.9, boca: 0.6 }],
];
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.3, 0], L(t, s, e, 4.8, 4.4), L(t, s, e, 0.15, -0.15), 0.12, { apertura: 38, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  // Montones de dinero que crecen a su alrededor
  const crece = L(t, EV.dinero - 0.3, EV.confianza + 0.8, 0, 1);
  [[-0.75, 0.2], [0.75, 0.2], [-0.55, -0.25], [0.55, -0.25]].forEach(([x, z], i) => {
    const n = Math.round(4 + 14 * crece * (0.7 + 0.3 * fr(Math.sin(i * 5.1) * 99.1)));
    fichas(tr, [x, -1, z], n, 0.08, 1, true);
  });
  const conf = L(t, EV.confianza - 0.3, EV.respeto + 0.5, 0, 1);
  const c = cuerpoEn(t, DOS, { mira: 0.5 }, s - 0.3);
  const a = anclaje(cam, [0, -1, 0.35], 0.55 * (1 + 0.45 * conf));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 270, left: 90, width: 900, display: "flex", flexDirection: "column", gap: 20, opacity: L(t, EV.confianza - 0.5, EV.confianza - 0.2, 0, 1) }}>
        {[
          ["CONFIANZA", 0.3 + 0.7 * conf, VERDE],
          ["RESPETO POR SUS REGLAS", 1 - 0.85 * L(t, EV.respeto - 0.4, EV.respeto + 0.6, 0, 1), ROJO],
        ].map(([n, v, col]) => (
          <div key={n as string} style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ ...mono(26), width: 420, whiteSpace: "nowrap" }}>{n}</span>
            <div style={{ flex: 1, height: 26, borderRadius: 13, border: "2px solid rgba(255,255,255,0.6)", overflow: "hidden" }}>
              <div style={{ width: `${(v as number) * 100}%`, height: "100%", background: col as string, opacity: 0.85 }} />
            </div>
          </div>
        ))}
      </div>
      <StickMundo a={a} c={c} t={t} sombrero />
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme (con su sombrero)
const Sigueme: React.FC<P> = (p) => <SiguemeStick {...p} lema="" sombrero />;

// ------------------------------------------------------------------ 5. Tres: 1934, cinco años después: bancarrota
const s3 = inicio("tres");
const TRES: Clave[] = [
  [s3 + 0.1, { mira: 0.3, boca: 0, cejas: 0 }],
  [EV.bancarrota - 0.3, { ...CHOQUE }],
  [EV.bancarrota + 0.25, { ...sentado(0), agobio: 0.4 }],
];
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.4, 0], L(t, s, e, 4.4, 4.0) - 0.25 * golpe(t, EV.bancarrota), L(t, s, e, -0.1, 0.1) + sacude(t, EV.bancarrota - 0.05, 0.03), 0.12, { apertura: 38, centroY: 920 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  // Los montones de dinero se desploman
  const cae = L(t, EV.bancarrota - 0.4, EV.bancarrota + 0.6, 0, 1);
  [[-0.75, 0.2], [0.75, 0.2], [-0.55, -0.25], [0.55, -0.25]].forEach(([x, z], i) => {
    const n = Math.max(0, Math.round((16 - 15 * cae) * (0.7 + 0.3 * fr(Math.sin(i * 5.1) * 99.1))));
    if (n > 0) fichas(tr, [x, -1, z], n, 0.08, 1 - 0.5 * cae, true);
  });
  const anio = t < EV["1934"] - 0.3 ? 1929 : Math.min(1934, 1929 + Math.floor((t - (EV["1934"] - 0.3)) / 0.18));
  const c = cuerpoEn(t, TRES, { mira: 0.3 }, s - 0.3);
  const a = anclaje(cam, [0, -1, 0.35], 0.55);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <CamaraTiembla t={t} t0={EV.bancarrota - 0.05} a={0.02}>
        <div style={{ position: "absolute", top: 280, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
          <span style={{ ...mono(150), fontWeight: 700, fontVariantNumeric: "tabular-nums", color: anio === 1934 ? ROJO : "#fff", padding: "0 40px", border: "4px solid #fff", borderRadius: 20, background: "#000" }}>{anio}</span>
        </div>
        <Sello t={t} t0={EV.bancarrota - 0.15} texto="BANCARROTA" top={560} size={86} />
        <StickMundo a={a} c={c} t={t} sombrero />
      </CamaraTiembla>
      <FlashRojo t={t} t0={EV.bancarrota - 0.05} o={0.2} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: reglas leídas antes de cada operación; cuanto más ganas, más estricto
const sG = inicio("giro");
const GIRO: Clave[] = [
  [sG + 0.1, { mira: 0.8, boca: 0.2, cejas: 0.2 }],
  [EV.leelas - 0.2, { mDx: 0.06, mDy: 0.13, mira: 0.8, cejas: 0.4 }],
  [EV.ganes - 0.3, { mDx: 0.5, mDy: -0.1, boca: 0.5, ojos: 0.9 }],
];
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cuaderno = L(t, EV.cuaderno - 0.4, EV.cuaderno, 0, 1);
  const lista = muelle(t, EV.leelas - 0.2, 200, 14);
  const candado = muelle(t, EV.ganes - 0.4, 200, 14);
  const aprieta = L(t, EV.ganes, EV.estricto + 0.3, 0, 1);
  const c = cuerpoEn(t, GIRO, { mira: 0.8 }, s - 0.3);
  const ganancia = Math.round(L(t, EV.ganes - 0.3, EV.estricto + 0.4, 10000, 60000));
  return (
    <>
      <Escena cam={orbita([0, -0.3, 0], 6, L(t, s, e, -0.25, 0.2), 0.15, { apertura: 40, centroY: 900 })} trazos={[...polvo(0.3)]} />
      {/* El cuaderno guardado en un cajón: no sirve */}
      {lista < 0.3 && (
        <div style={{ position: "absolute", left: 300, top: 360, width: 480, height: 300, border: "3px solid #fff", borderRadius: 16, background: "#050505", opacity: 1 - lista * 3 }}>
          <div style={{ position: "absolute", left: 30, right: 30, top: 40, height: 150, border: "2px solid rgba(255,255,255,0.5)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", ...mono(30, 0.6) }}>MIS REGLAS</div>
          <div style={{ position: "absolute", left: "50%", bottom: 30, width: 80, height: 16, marginLeft: -40, borderRadius: 8, background: "#fff" }} />
          {cuaderno > 0 && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...mono(220), color: ROJO, fontWeight: 700, opacity: cuaderno }}>✗</span>}
        </div>
      )}
      {/* La lista, delante del botón de comprar: cada regla se marca antes de pulsar */}
      {lista > 0.01 && (
        <div style={{ position: "absolute", left: 120, top: 300, width: 840, display: "flex", gap: 30, alignItems: "flex-start", opacity: Math.min(lista * 1.5, 1), transform: `scale(${0.8 + 0.2 * Math.min(lista, 1.05)})` }}>
          <div style={{ flex: 1, borderRadius: 18, border: "3px solid #fff", background: "rgba(5,5,5,0.94)", padding: "18px 22px" }}>
            <div style={{ ...mono(24, 0.6), marginBottom: 10 }}>ANTES DE CADA OPERACIÓN</div>
            {["CORTA LAS PÉRDIDAS", "NO PROMEDIES A LA BAJA", "ESPERA TU MOMENTO"].map((r, i) => {
              const ok = t > EV.leelas + 0.3 + i * 0.35;
              return (
                <div key={r} style={{ display: "flex", alignItems: "center", gap: 14, ...mono(28), lineHeight: 1.7, whiteSpace: "nowrap" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 8, border: `2px solid ${ok ? VERDE : "#fff"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: VERDE }}>{ok ? "✓" : ""}</span>
                  {r}
                </div>
              );
            })}
          </div>
          {candado > 0.01 && (
            <div style={{ width: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: Math.min(candado * 1.5, 1) }}>
              <svg width={150} height={170} viewBox="-75 -95 150 170">
                <path d={`M-38,-10 L-38,${-48 + 18 * aprieta} A38,38 0 0 1 38,${-48 + 18 * aprieta} L38,-10`} fill="none" stroke="#fff" strokeWidth={10} />
                <rect x={-58} y={-12} width={116} height={86} rx={14} fill="#000" stroke={aprieta > 0.5 ? VERDE : "#fff"} strokeWidth={6} />
                <circle cx={0} cy={26} r={10} fill="#fff" />
              </svg>
              <span style={{ ...mono(24), color: VERDE }}>{`+${euros(ganancia)} €`}</span>
              <span style={{ ...mono(24), whiteSpace: "nowrap" }}>{t > EV.estricto - 0.2 ? "MÁS ESTRICTO" : "GANAS MÁS"}</span>
            </div>
          )}
        </div>
      )}
      <Stick c={c} ox={280} oy={1380} s={290} t={t} sombrero />
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta: ¿qué regla te saltas más?
const Pregunta: React.FC<P> = (p) => <PreguntaDos {...p} izq={{ texto: "EL STOP", t0: EV.saltas - 0.2 }} der={{ texto: "EL TAMAÑO", t0: EV.saltas + 0.4 }} pie="MÁNDASELO AL QUE TIENE UN PLAN Y NUNCA LO CUMPLE" tPie={EV.mandaselo} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves(["1929", "arruinaba", ["100", VERDE], "livermore", "caería", "famoso", "reglas", "dinero", "confianza", "sígueme", ["1934", ROJO], ["bancarrota", ROJO], "consejo", "cuaderno", "léelas", "estricto", "saltas", "mándaselo"]);

export const Livermore: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/livermore_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
