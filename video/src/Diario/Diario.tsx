// Reel 5-30-10 "Lucía dejó de perder 300 € al mes cambiando una sola cosa" (~39 s). Lucía (coleta) en su despacho con
// los meses en rojo en el monitor y el cuaderno en la mano desde el fotograma 0; el cuaderno con HORA · MOTIVO · EMOCIÓN
// que se va llenando; 30 operaciones y la bombilla; el «sígueme» encima de la escena; de día (sol, con plan) gana y de
// noche (luna, 22:30, cansada y aburrida) pierde; las filas de la noche tachadas; quita la noche y apaga; la página nueva
// con sus 30 operaciones; y el cierre de conversión. Tiempos en src/gen/diario.json (scripts/diario.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/diario.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { Camara, Escena, orbita, polvo, proyector, Trazo } from "../Bot/tres";
import { ROJO, VERDE } from "../Bot/kit";
import { cabezaPx, Clave, cuerpoEn, Cuerpo, Estado, R_CABEZA } from "../Bot/stick";
import { Ancla, anclaje, BRAZOS_ARRIBA, Exclama, FlashRojo, StickMundo } from "../Bot/comun";
import { FlashVerde } from "../Bot/historia";
import { DESPACHO, despachoCasa } from "../Bot/decorados";
import { CierreComenta } from "../Bot/conversion";
import { claves, CtaSeguir, cuando, golpe, Montaje, P } from "../Explica/Montaje";

export const DIARIO_FPS = datos.fps;
export const DIARIO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const cu = cuando(datos);

// ------------------------------------------------------------------ piezas
const PantallaPC: React.FC<{ cam: Camara; o?: number; children: (w: number, h: number) => React.ReactNode }> = ({ cam, o = 1, children }) => {
  const pr = proyector(cam);
  const { c, w, h } = DESPACHO.MON;
  const a = pr([c[0] - w / 2 + 0.018, c[1] + h / 2 - 0.018, c[2] + 0.01]);
  const b = pr([c[0] + w / 2 - 0.018, c[1] - h / 2 + 0.018, c[2] + 0.01]);
  return <div style={{ position: "absolute", left: a.x, top: a.y, width: b.x - a.x, height: b.y - a.y, overflow: "hidden", borderRadius: 6, opacity: o, background: "#030303" }}>{children(b.x - a.x, b.y - a.y)}</div>;
};
// Resultado de cada mes en barras (rojo = pérdida)
const MESES: [string, number][] = [["ENE", -300], ["FEB", -300], ["MAR", -300], ["ABR", 0]];
const Meses: React.FC<{ w: number; h: number; ultimo: number }> = ({ w, h, ultimo }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <div style={{ position: "absolute", left: w * 0.05, top: h * 0.05, ...mono(h * 0.08, 0.7) }}>RESULTADO POR MES</div>
    <div style={{ position: "absolute", left: w * 0.06, right: w * 0.06, top: h * 0.3, height: 2, background: "rgba(255,255,255,0.5)" }} />
    <div style={{ position: "absolute", left: w * 0.06, right: w * 0.06, top: h * 0.3, display: "flex", justifyContent: "space-around" }}>
      {MESES.map(([m, v], i) => {
        const esUlt = i === MESES.length - 1;
        const alto = esUlt ? 0 : h * 0.42;
        return (
          <div key={m} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: w * 0.18, opacity: esUlt ? ultimo : 1 }}>
            {esUlt ? (
              <div style={{ ...mono(h * 0.12), fontWeight: 800, color: VERDE, marginTop: h * 0.08 }}>0 € ✓</div>
            ) : (
              <>
                <div style={{ width: w * 0.12, height: alto, background: ROJO, opacity: 0.85, boxShadow: `0 0 16px ${ROJO}` }} />
                <div style={{ ...mono(h * 0.07), color: ROJO, marginTop: 4 }}>{`${v} €`}</div>
              </>
            )}
            <div style={{ ...mono(h * 0.07, 0.7), position: "absolute", top: -h * 0.12 }}>{m}</div>
          </div>
        );
      })}
    </div>
  </div>
);
// Lista de operaciones en la pantalla (verdes de día, rojas de noche)
const Operaciones: React.FC<{ w: number; h: number; filas: [string, string, boolean][]; n: number }> = ({ w, h, filas, n }) => (
  <div style={{ position: "absolute", inset: 0, padding: `${h * 0.06}px ${w * 0.06}px`, display: "flex", flexDirection: "column", gap: h * 0.035 }}>
    {filas.slice(0, n).map(([hora, r, gana], i) => (
      <div key={i} style={{ display: "flex", justifyContent: "space-between", ...mono(h * 0.1), fontWeight: 700 }}>
        <span style={{ opacity: 0.7 }}>{hora}</span>
        <span style={{ color: gana ? VERDE : ROJO }}>{r}</span>
      </div>
    ))}
  </div>
);
const Cara: React.FC<{ v: number; size: number }> = ({ v, size }) => {
  const col = v > 0 ? VERDE : v < 0 ? ROJO : "#fff";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx={20} cy={20} r={17} fill="none" stroke={col} strokeWidth={3} />
      <circle cx={14} cy={16} r={2.4} fill={col} />
      <circle cx={26} cy={16} r={2.4} fill={col} />
      <path d={v > 0 ? "M12 24 Q20 31 28 24" : v < 0 ? "M12 29 Q20 22 28 29" : "M12 26 L28 26"} fill="none" stroke={col} strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
};
// Cuaderno: HORA · MOTIVO · EMOCIÓN. filas: cuántas se ven; marca: tiempos en que se ilumina cada cabecera; tacha: tachar las de la noche
type Fila = [string, string, number, boolean]; // hora, motivo, emoción (−1…1), noche
const FILAS: Fila[] = [
  ["09:15", "RUPTURA", 1, false],
  ["10:40", "PLAN", 1, false],
  ["22:30", "ABURRIDA", -1, true],
  ["11:05", "PLAN", 0, false],
  ["23:10", "RECUPERAR", -1, true],
  ["22:50", "CANSADA", -1, true],
  ["09:50", "PLAN", 1, false],
];
const Cuaderno: React.FC<{ t: number; filas: number; cabeceras: number[]; tacha?: number; resalta?: number; titulo?: string; contador?: string; o?: number; datos?: Fila[] }> = ({ t, filas, cabeceras, tacha = 0, resalta = 0, titulo, contador, o = 1, datos: dat = FILAS }) => {
  const cab = ["HORA", "MOTIVO", "EMOCIÓN"];
  return (
    <div style={{ position: "absolute", left: 140, top: 330, width: 800, height: 860, opacity: o, color: "#fff" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 26, border: "4px solid #fff", background: "rgba(5,5,5,0.95)", boxShadow: "0 0 50px rgba(255,255,255,0.12)" }} />
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} style={{ position: "absolute", top: -22, left: 70 + i * 82, width: 26, height: 44, borderRadius: 13, border: "4px solid #fff", background: "#000" }} />
      ))}
      <div style={{ position: "absolute", left: 40, right: 40, top: 46, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46 }}>{titulo ?? "MI DIARIO"}</span>
        {contador && <span style={{ ...mono(40), fontWeight: 700, color: VERDE }}>{contador}</span>}
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 126, display: "grid", gridTemplateColumns: "1fr 1.6fr 1fr", gap: 10 }}>
        {cab.map((c, i) => {
          const g = muelle(t, cabeceras[i], 240, 12);
          return (
            <div key={c} style={{ ...mono(34), fontWeight: 700, textAlign: "center", padding: "10px 0", borderRadius: 10, border: `3px solid ${g > 0.01 ? "#fff" : "rgba(255,255,255,0.3)"}`, background: g > 0.5 && t < cabeceras[i] + 0.8 ? "#fff" : "transparent", color: g > 0.5 && t < cabeceras[i] + 0.8 ? "#000" : "#fff", transform: `scale(${1 + 0.12 * Math.max(0, Math.sin(Math.min(g, 1) * Math.PI))})` }}>{c}</div>
          );
        })}
      </div>
      {dat.slice(0, filas).map(([hora, motivo, emo, noche], i) => {
        const roja = noche && resalta > 0.5;
        return (
          <div key={i} style={{ position: "absolute", left: 40, right: 40, top: 210 + i * 88, height: 76, display: "grid", gridTemplateColumns: "1fr 1.6fr 1fr", alignItems: "center", gap: 10, borderBottom: "2px solid rgba(255,255,255,0.2)", background: roja ? "rgba(255,77,94,0.14)" : "transparent" }}>
            <span style={{ ...mono(36), textAlign: "center", color: roja ? ROJO : "#fff" }}>{hora}</span>
            <span style={{ ...mono(34), textAlign: "center", color: roja ? ROJO : "#fff" }}>{motivo}</span>
            <span style={{ display: "flex", justifyContent: "center" }}><Cara v={emo} size={54} /></span>
            {noche && tacha > 0 && <div style={{ position: "absolute", left: -10, top: "50%", height: 7, width: `calc(${tacha * 100}% + 20px)`, background: ROJO, boxShadow: `0 0 14px ${ROJO}` }} />}
          </div>
        );
      })}
    </div>
  );
};
const Pildora: React.FC<{ t: number; t0: number; color?: string; size?: number; fin?: number; children: React.ReactNode }> = ({ t, t0, color = "#fff", size = 44, fin: f, children }) => {
  const g = muelle(t, t0, 240, 13);
  const fuera = f === undefined ? 0 : L(t, f - 0.2, f, 0, 1);
  if (g < 0.01 || fuera >= 1) return null;
  return <div style={{ ...mono(size), fontWeight: 700, color, padding: "10px 24px", borderRadius: 14, border: `3px solid ${color}`, background: "rgba(0,0,0,0.9)", opacity: Math.min(g * 1.5, 1) * (1 - fuera), transform: `scale(${0.6 + 0.4 * Math.min(g, 1.1)})`, whiteSpace: "nowrap" }}>{children}</div>;
};
const Arriba: React.FC<{ top?: number; children: React.ReactNode }> = ({ top = 300, children }) => (
  <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>{children}</div>
);
const Ficha: React.FC<{ t: number; t0: number; texto: string; color?: string; size?: number; x?: number; y?: number; fin?: number }> = ({ t, t0, texto, color = "#fff", size = 150, x = ANCHO / 2, y = 760, fin: f }) => {
  const g = muelle(t, t0, 260, 13);
  const fuera = f === undefined ? 0 : L(t, f - 0.2, f, 0, 1);
  if (g < 0.01 || fuera >= 1) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${(0.5 + 0.5 * Math.min(g, 1.1)) * (1 - 0.3 * fuera)}) rotate(${-3 + 3 * Math.min(g, 1)}deg)`, opacity: Math.min(g * 1.6, 1) * (1 - fuera) }}>
      <div style={{ position: "relative", padding: `${size * 0.12}px ${size * 0.22}px`, borderRadius: size * 0.16, background: "linear-gradient(180deg, #1a1a1a 0%, #111 49%, #000 51%, #0a0a0a 100%)", border: `4px solid ${color}`, boxShadow: `0 ${size * 0.08}px 0 #000, 0 0 40px ${color}55` }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1, color, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{texto}</span>
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 3, background: "#000" }} />
      </div>
    </div>
  );
};
// Cuaderno pequeño en las manos (2D), a la derecha de la cabeza
const CuadernoMano: React.FC<{ c: Estado; a: Ancla }> = ({ c, a }) => {
  const x = a.ox + (c.x + 0.34) * a.s;
  const y = a.oy - (c.y + 0.5) * a.s;
  const w = 0.3 * a.s;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - w * 0.65, width: w, height: w * 1.3, borderRadius: 8, border: "4px solid #fff", background: "#050505", transform: "rotate(6deg)", boxShadow: "0 0 30px rgba(255,255,255,0.25)" }}>
      {[0.3, 0.45, 0.6, 0.75].map((f) => (
        <div key={f} style={{ position: "absolute", left: "15%", right: "15%", top: `${f * 100}%`, height: 3, background: "rgba(255,255,255,0.6)" }} />
      ))}
      <div style={{ position: "absolute", left: "15%", top: "8%", ...mono(w * 0.14), fontWeight: 700 }}>DIARIO</div>
    </div>
  );
};
const MANO_CUADERNO: Partial<Cuerpo> = { mDx: 0.3, mDy: -0.06, mIx: 0.2, mIy: -0.12, mira: 0.8 };
const camDesp = (t: number, s: number, e: number, d0: number, d1: number, az0: number, az1: number) =>
  orbita([0.42, -0.35, -0.35], L(t, s, e, d0, d1), L(t, s, e, az0, az1), 0.1, { apertura: 6, centroY: 980 });
const ANCLA_L: [number, number, number] = [0.02, -1, -0.15];

// ------------------------------------------------------------------ 1. Hook: meses en rojo y el cuaderno en la mano
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = camDesp(t, s, e, 4.3, 4.1, -0.1, -0.04);
  const tr: Trazo[] = [...polvo(0.1)];
  despachoCasa(tr, t, { hora: 9.5 });
  const c = cuerpoEn(t, [[0, { ...MANO_CUADERNO, boca: 0.8, cejas: 0.6, ojos: 1.15 }]], { ...MANO_CUADERNO, boca: 0.8 }, -0.5);
  const a = anclaje(cam, ANCLA_L, 0.48);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <PantallaPC cam={cam}>{(w, h) => <Meses w={w} h={h} ultimo={L(t, EV["300"], EV["300"] + 0.4, 0, 1)} />}</PantallaPC>
      <StickMundo a={a} c={c} t={t} coleta />
      <CuadernoMano c={c} a={a} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: no era la estrategia · el cuaderno se llena (hora, motivo, emoción)
const s1 = inicio("uno");
const corte1 = EV.apunto - 0.4;
const Uno: React.FC<P> = (p) => {
  const { t, s } = p;
  if (t < corte1) {
    const cam = camDesp(t, s, corte1, 3.9, 3.7, 0.08, 0.02);
    const tr: Trazo[] = [...polvo(0.1)];
    despachoCasa(tr, t, { hora: 9.6 });
    const c = cuerpoEn(t, [[s, { mira: 0.8, cejas: 0.4, boca: 0.3, mDx: 0.4, mDy: 0.2 }]], { ...MANO_CUADERNO }, s - 0.4);
    const a = anclaje(cam, ANCLA_L, 0.48);
    return (
      <>
        <Escena cam={cam} trazos={tr} />
        <PantallaPC cam={cam}>
          {(w, h) => (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: h * 0.05 }}>
              <span style={mono(h * 0.08, 0.7)}>ESTRATEGIA</span>
              <span style={{ ...mono(h * 0.13), fontWeight: 800 }}>LA MISMA ✓</span>
            </div>
          )}
        </PantallaPC>
        <StickMundo a={a} c={c} t={t} coleta />
      </>
    );
  }
  const filas = Math.min(FILAS.length, Math.floor(L(t, EV.apunto - 0.2, EV.sentia + 0.4, 1, FILAS.length + 0.99, (u) => u)));
  return (
    <>
      <Escena cam={orbita([0, 0, 0], 9, L(t, corte1, fin("uno"), -0.3, 0.2), 0.2, { apertura: 40 })} trazos={polvo(0.3)} />
      <Cuaderno t={t} filas={filas} cabeceras={[EV.hora - 0.25, EV.motivo - 0.25, EV.sentia - 0.5]} contador={`${Math.round(L(t, corte1, fin("uno"), 1, 24))}/30`} />
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: al llegar a 30, lo vio (bombilla)
const s2 = inicio("dos");
const Dos: React.FC<P> = ({ t }) => {
  const g = muelle(t, EV.vio - 0.25, 220, 12);
  return (
    <>
      <Escena cam={orbita([0, 0, 0], 9, L(t, s2, fin("dos"), 0.2, 0.4), 0.2, { apertura: 40 })} trazos={polvo(0.3)} />
      <Cuaderno t={t} filas={FILAS.length} cabeceras={[-9, -9, -9]} resalta={g} contador="30/30" />
      <Ficha t={t} t0={EV["30"] - 0.25} texto="30" color={VERDE} x={850} y={360} size={110} />
      {g > 0.01 && (
        <div style={{ position: "absolute", left: 200, top: 300, transform: `translate(-50%, -50%) scale(${Math.min(g, 1.1)})`, filter: `drop-shadow(0 0 ${30 * g}px rgba(255,255,255,0.8))` }}>
          <svg width={150} height={190} viewBox="0 0 60 76">
            <path d="M30 4 C15 4 6 15 6 27 C6 37 13 42 17 49 L17 56 L43 56 L43 49 C47 42 54 37 54 27 C54 15 45 4 30 4 Z" fill="#000" stroke="#fff" strokeWidth={3.5} />
            <line x1={20} x2={40} y1={62} y2={62} stroke="#fff" strokeWidth={3.5} strokeLinecap="round" />
            <line x1={23} x2={37} y1={69} y2={69} stroke="#fff" strokeWidth={3.5} strokeLinecap="round" />
            <path d="M23 40 L27 30 L33 36 L37 26" fill="none" stroke="#fff" strokeWidth={3} />
          </svg>
        </div>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme encima de la escena
const Sigueme: React.FC<P> = (p) => (
  <>
    <AbsoluteFill style={{ filter: "blur(9px)" }}>
      <Dos t={p.t} s={s2} e={fin("dos")} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "rgba(0,0,0,0.6)" }} />
    <CtaSeguir {...p} lema="" sinFondo />
  </>
);

// ------------------------------------------------------------------ 5. Tres: de día gana con plan · de noche, cansada y aburrida, pierde · sobran las de la noche
const s3 = inicio("tres");
const cNoche = EV.noche - 0.6;
const cTacha = EV.indicador - 0.6;
const DIA: [string, string, boolean][] = [["09:15", "+ 42 €", true], ["10:40", "+ 18 €", true], ["11:05", "− 12 €", false], ["11:50", "+ 25 €", true]];
const NOCHE: [string, string, boolean][] = [["22:10", "− 35 €", false], ["22:30", "− 48 €", false], ["23:10", "− 60 €", false], ["23:40", "− 22 €", false]];
const Tres: React.FC<P> = (p) => {
  const { t, s, e } = p;
  if (t < cTacha) {
    const noche = t >= cNoche;
    const cam = noche ? camDesp(t, cNoche, cTacha, 3.9, 3.6, 0.06, -0.02) : camDesp(t, s, cNoche, 4.2, 3.9, -0.08, 0.0);
    const tr: Trazo[] = [...polvo(0.1)];
    despachoCasa(tr, t, { hora: noche ? 22.5 : 10, dia: noche ? 0 : 1, flexo: noche ? 1 : 0 });
    const c = noche
      ? cuerpoEn(t, [[cNoche, { mira: 0.7, ojos: 0.55, agacha: 0.3, boca: -0.3, cejas: -0.5, mDx: 0.35, mDy: -0.1 }], [EV.aburrimiento - 0.3, { abre: 0.8, mIx: -0.05, mIy: 0.15 }], [EV.aburrimiento + 0.4, { abre: 0, mIx: -0.15, mIy: -0.52 }]], { mira: 0.7 }, cNoche - 0.4)
      : cuerpoEn(t, [[s, { mira: 0.8, boca: 0.8, cejas: 0.4, ojos: 1.1, mDx: 0.35, mDy: -0.1 }], [EV.ganaba - 0.2, { ...BRAZOS_ARRIBA, boca: 1, abre: 0.4 }]], { mira: 0.8 }, s - 0.4);
    const a = anclaje(cam, ANCLA_L, 0.48);
    const n = noche ? Math.floor(L(t, EV.noche - 0.3, EV.aburrimiento, 1, 4.99, (u) => u)) : Math.floor(L(t, s + 0.1, EV.ganaba, 1, 4.99, (u) => u));
    const [hx, hy] = cabezaPx(c, a.ox, a.oy, a.s);
    return (
      <>
        <Escena cam={cam} trazos={tr} />
        <PantallaPC cam={cam}>{(w, h) => <Operaciones w={w} h={h} filas={noche ? NOCHE : DIA} n={n} />}</PantallaPC>
        <StickMundo a={a} c={c} t={t} coleta />
        {noche && <div style={{ position: "absolute", left: hx - 10, top: hy - R_CABEZA * a.s - 110 - 10 * Math.sin(t * 3), transform: "translateX(-100%)", ...mono(54), fontWeight: 700, opacity: 0.8 }}>Zzz</div>}
        <Arriba>
          {!noche && <Pildora t={t} t0={EV.manana - 0.3} size={42} color={VERDE}>POR LA MAÑANA · CON PLAN ✓</Pildora>}
          {noche && <Pildora t={t} t0={EV["10"] - 0.3} size={42} color={ROJO}>DESPUÉS DE LAS 22:00</Pildora>}
          {noche && (
            <div style={{ display: "flex", gap: 16 }}>
              <Pildora t={t} t0={EV.cansada - 0.2} size={40}>CANSADA</Pildora>
              <Pildora t={t} t0={EV.aburrimiento - 0.2} size={40}>ABURRIDA</Pildora>
            </div>
          )}
        </Arriba>
        {!noche && <FlashVerde t={t} t0={EV.ganaba - 0.1} o={0.1} />}
        {noche && <FlashRojo t={t} t0={EV.noche - 0.1} o={0.12} />}
      </>
    );
  }
  return (
    <>
      <Escena cam={orbita([0, 0, 0], 9, L(t, cTacha, e, -0.2, 0.2), 0.2, { apertura: 40 })} trazos={polvo(0.3)} />
      <Cuaderno t={t} filas={FILAS.length} cabeceras={[-9, -9, -9]} resalta={1} tacha={L(t, EV.sobraban - 0.2, EV.sobraban + 0.4, 0, 1)} contador="30/30" />
      <div style={{ position: "absolute", top: 1240, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 18 }}>
        <Pildora t={t} t0={EV.indicador - 0.4} size={36}>+1 INDICADOR ✗</Pildora>
        <Pildora t={t} t0={EV.sobraban - 0.2} size={36} color={ROJO}>SOBRA LA NOCHE</Pildora>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: quita la noche y apaga · la página nueva: 30 operaciones, hora, motivo y emoción
const sG = inicio("giro");
const cGiro = EV.solucion - 0.35;
const tHora = cu("hora", EV["30b"]);
const tMotivo = cu("motivo", EV["30b"]);
const NUEVA: Fila[] = [["10:05", "PLAN", 1, false], ["15:30", "NOTICIA", 0, false], ["21:45", "ABURRIDA", -1, true]];
const Giro: React.FC<P> = (p) => {
  const { t, s, e } = p;
  if (t < cGiro) {
    const cam = camDesp(t, s, cGiro, 4.1, 3.9, -0.06, 0.02);
    const tr: Trazo[] = [...polvo(0.1)];
    despachoCasa(tr, t, { hora: 22.2, dia: 0, flexo: 1 - L(t, EV.quito, EV.quito + 0.3, 0, 1) });
    const c = cuerpoEn(t, [[s, { mDx: 0.4, mDy: 0.05, mira: 0.7, boca: 0.4 }], [EV.quito + 0.4, { ...BRAZOS_ARRIBA, boca: 1, abre: 0.3, mira: 0 }]], { mira: 0.7 }, s - 0.4);
    const a = anclaje(cam, ANCLA_L, 0.48);
    const apaga = L(t, EV.quito, EV.quito + 0.25, 0, 1);
    return (
      <>
        <Escena cam={cam} trazos={tr} />
        <PantallaPC cam={cam}>{(w, h) => <div style={{ position: "absolute", inset: 0, background: "#000", opacity: apaga }}><div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...mono(h * 0.12, 0.5) }}>OFF</div></div>}</PantallaPC>
        <StickMundo a={a} c={c} t={t} coleta />
        <Arriba>
          <Pildora t={t} t0={EV.quito - 0.2} size={44} color={ROJO}>NOCHE: FUERA ✗</Pildora>
          <Pildora t={t} t0={EV.quito + 0.6} size={44} color={VERDE}>DEJÓ DE PERDER ✓</Pildora>
        </Arriba>
      </>
    );
  }
  const filas = Math.floor(L(t, EV.emocion + 0.2, EV.quitar - 0.3, 0, NUEVA.length + 0.99, (u) => u));
  return (
    <>
      <Escena cam={orbita([0, 0, 0], 9, L(t, cGiro, e, 0.2, -0.2), 0.2, { apertura: 40 })} trazos={polvo(0.3)} />
      <Cuaderno t={t} filas={filas} cabeceras={[tHora - 0.2, tMotivo - 0.2, EV.emocion - 0.4]} titulo="MIS PRÓXIMAS 30" datos={NUEVA} tacha={L(t, EV.quitar - 0.3, EV.quitar + 0.2, 0, 1)} />
      <Ficha t={t} t0={EV["30b"] - 0.25} texto="30" color={VERDE} x={860} y={380} size={100} />
      <div style={{ position: "absolute", top: 1240, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
        <Pildora t={t} t0={EV.solucion - 0.2} size={42} color={VERDE} fin={EV.quitar - 0.6}>LA SOLUCIÓN</Pildora>
        <Pildora t={t} t0={EV.quitar - 0.4} size={42} color={ROJO}>TUS NÚMEROS TE DICEN QUÉ QUITAR</Pildora>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 7. Cierre de conversión
const Cierre: React.FC<P> = (p) => <CierreComenta {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tCuenta={EV.auditada} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["300", ROJO], "estrategia", "hora", "motivo", "sentía", ["30", VERDE], "vio", "sígueme", ["ganaba", VERDE], ["noche", ROJO], "cansada", "aburrimiento", "indicador", ["sobraban", ROJO], ["quitó", VERDE], ["solución", VERDE], "emoción", "quitar", "llegado", "bot", "privado", ["auditada", VERDE]]);

const GANCHO = { lineas: ["Dejó de perder *300_€*", "con *una_sola_cosa*"], hasta: EV.cosa + 0.2, colores: [ROJO, VERDE] };
export const Diario: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/diario_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.1} empujes={0.05} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} />
);
