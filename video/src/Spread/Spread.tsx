// Reel de alcance "Te saltó el stop y el precio nunca llegó ahí" (~33 s). Solo subtítulos abajo y el «sígueme» grande en
// medio. El mismo gráfico 3D de velas recorre todo el vídeo y la cámara se va acercando: el stop salta sin que las velas
// lo toquen; el gráfico solo enseña el precio de venta (BID); aparece la línea fantasma del precio de compra (ASK) y el
// spread; con noticias y a medianoche el spread se dispara; y en primer plano: lo tocó el spread, no el gráfico.
// Tiempos en src/gen/spread.json (scripts/spread.py).
import React from "react";
import { useCurrentFrame } from "remotion";
import datos from "../gen/spread.json";
import { ANCHO } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { Camara as Cam, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { ROJO, suelo, VERDE } from "../Bot/kit";
import { Clave, cuerpoEn } from "../Bot/stick";
import { anclaje, Exclama, FlashRojo, SiguemeStick, StickMundo } from "../Bot/comun";
import { CamaraTiembla, PreguntaDos } from "../Bot/historia";
import { claves, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const SPREAD_FPS = datos.fps;
export const SPREAD_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;

// ------------------------------------------------------------------ el gráfico común (un corto con el stop por encima)
const CIERRES = [1.0842, 1.0845, 1.0843, 1.0848, 1.0851, 1.0849, 1.0853, 1.0856, 1.0854, 1.0857, 1.0859, 1.0858, 1.0861, 1.086, 1.0862, 1.0863, 1.0861, 1.0862, 1.0864, 1.0862, 1.0863, 1.0861, 1.0862, 1.086];
const STOP = 1.087;
const yP = (p: number) => -0.7 + ((p - 1.0835) / 0.004) * 1.2;
const xI = (i: number) => -0.9 + (i / (CIERRES.length - 1)) * 1.8;
const ALTO_MAX = 1.0866;
// spread en precio; ask: 0 oculto … 1 visible
const grafico = (tr: Trazo[], spread: number, ask: number, bidLuz = 0, o = 1) => {
  const bid: V3[] = [];
  CIERRES.forEach((c, i) => {
    const a = i === 0 ? c - 0.0002 : CIERRES[i - 1];
    const hi = Math.min(ALTO_MAX, Math.max(a, c) + 0.0002 + 0.0001 * (i % 3));
    const lo = Math.min(a, c) - 0.0002 - 0.0001 * ((i + 1) % 2);
    const x = xI(i);
    const sube = c >= a;
    tr.push({ t: "l", a: [x, yP(lo), 0], b: [x, yP(hi), 0], w: 1.6, o: 0.85 * o });
    const y0 = yP(Math.min(a, c));
    const y1 = Math.max(yP(Math.max(a, c)), y0 + 0.008);
    tr.push({ t: "p", pts: [[x - 0.03, y0, 0], [x + 0.03, y0, 0], [x + 0.03, y1, 0], [x - 0.03, y1, 0], [x - 0.03, y0, 0]], w: 1.8, o, relleno: sube ? "#fff" : "#000", oRelleno: sube ? 0.75 * o : 0.9 * o });
    bid.push([x, yP(c), 0.01]);
  });
  tr.push({ t: "p", pts: bid, w: 2.4, o: (0.35 + 0.65 * bidLuz) * o, luz: 0.6 * bidLuz });
  if (ask > 0.01) {
    const pts = bid.map((p): V3 => [p[0], yP(CIERRES[bid.indexOf(p)] + spread), 0.02]);
    tr.push({ t: "p", pts, w: 2.4, o: ask * o, dash: "10 8", color: ROJO, luz: 0.4 });
  }
  // El stop (por encima: es un corto)
  tr.push({ t: "l", a: [-1.0, yP(STOP), 0], b: [1.05, yP(STOP), 0], w: 2.4, o: o, dash: "14 10", color: ROJO });
};
const camGrafico = (mira: V3, dist: number, azim: number, elev = 0.1, extra?: Partial<Cam>) => orbita(mira, dist, azim, elev, { apertura: 38, centroY: 880, ...extra });

// ------------------------------------------------------------------ 1. Hook: «stop ejecutado»… y las velas no llegaron
const HOOK: Clave[] = [
  [0.25, { ojos: 1.3, cejas: 0.9, abre: 0.6, mira: 0.8 }],
  [EV.nunca - 0.4, { mDx: 0.12, mDy: 0.3, abre: 0, boca: -0.2, cejas: -0.4, ojos: 1.1, cabeza: 0.12 }],
];
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = camGrafico([0.15, -0.35, 0], L(t, s, e, 4.8, 4.4), L(t, s, e, -0.15, 0.08));
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  grafico(tr, 0.0002, 0);
  // Corchete «no llegó» entre el máximo de las velas y el stop
  const k = L(t, EV.nunca - 0.2, EV.nunca + 0.3, 0, 1);
  const xm = xI(18) + 0.12;
  if (k > 0) {
    tr.push({ t: "l", a: [xm, yP(ALTO_MAX), 0.03], b: [xm, yP(ALTO_MAX) + (yP(STOP) - yP(ALTO_MAX)) * k, 0.03], w: 2.4, o: 1 });
    tr.push({ t: "l", a: [xm - 0.04, yP(ALTO_MAX), 0.03], b: [xm + 0.04, yP(ALTO_MAX), 0.03], w: 2.4, o: 1 });
    if (k >= 1) tr.push({ t: "l", a: [xm - 0.04, yP(STOP), 0.03], b: [xm + 0.04, yP(STOP), 0.03], w: 2.4, o: 1 });
  }
  const pr = proyector(cam);
  const qs = pr([-0.45, yP(STOP), 0]);
  const qm = pr([xm + 0.05, (yP(ALTO_MAX) + yP(STOP)) / 2, 0.03]);
  const aviso = muelle(t, 0.1, 240, 13);
  const c = cuerpoEn(t, HOOK, { mira: 0.8 });
  const a = anclaje(cam, [-0.36, -1, 0.45], 0.42);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <CamaraTiembla t={t} t0={0.15} a={0.03}>
        <div style={{ position: "absolute", left: Math.max(qs.x, 40), top: qs.y - 12, transform: "translateY(-100%)", ...mono(26), color: ROJO }}>{`STOP ${STOP.toFixed(4)}`}</div>
        {k > 0 && <div style={{ position: "absolute", left: Math.min(qm.x + 10, 820), top: qm.y, transform: "translateY(-50%)", ...mono(28), fontWeight: 700, opacity: k }}>NO LLEGÓ</div>}
        <div style={{ position: "absolute", top: 250, left: 110, width: 860, opacity: Math.min(Math.max(aviso, 0) * 1.5, 1), transform: `translateY(${(1 - Math.min(Math.max(aviso, 0), 1)) * -60}px)` }}>
          <div style={{ borderRadius: 26, border: `3px solid ${ROJO}`, background: "rgba(0,0,0,0.92)", padding: "20px 28px", display: "flex", alignItems: "center", gap: 22, boxShadow: "0 0 40px rgba(255,77,94,0.35)" }}>
            <span style={{ ...mono(64), color: ROJO, fontWeight: 700 }}>!</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ ...mono(38), color: ROJO, fontWeight: 700 }}>STOP EJECUTADO</span>
              <span style={mono(26, 0.65)}>{`EUR/USD · CORTO · ${STOP.toFixed(4)}`}</span>
            </div>
          </div>
        </div>
        <StickMundo a={a} c={c} t={t} />
        <Exclama t={t} t0={EV.nunca} c={c} {...a} signo="?" dura={1.2} />
      </CamaraTiembla>
      <FlashRojo t={t} t0={0.15} o={0.16} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: el gráfico solo enseña el precio de venta (BID)
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = camGrafico([L(t, s, e, 0.2, 0.55), -0.05, 0], L(t, s, e, 3.7, 3.1), L(t, s, e, 0.12, -0.08));
  const tr: Trazo[] = [...polvo(0.25)];
  grafico(tr, 0.0002, 0, L(t, EV.venta - 0.6, EV.venta, 0, 1));
  const pr = proyector(cam);
  const qb = pr([xI(CIERRES.length - 1) + 0.06, yP(CIERRES[CIERRES.length - 1]), 0]);
  const panel = muelle(t, s + 0.2, 200, 14);
  const venta = L(t, EV.venta - 0.4, EV.venta, 0, 1);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 300, left: 120, width: 840, opacity: Math.min(Math.max(panel, 0) * 1.5, 1), transform: `scale(${0.8 + 0.2 * Math.min(Math.max(panel, 0), 1.05)})` }}>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            ["VENTA", "1.0860", venta],
            ["COMPRA", "1.0862", 0],
          ].map(([n, v, k]) => (
            <div key={n as string} style={{ flex: 1, borderRadius: 18, border: `3px solid rgba(255,255,255,${0.35 + 0.65 * (k as number)})`, padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, boxShadow: (k as number) > 0.1 ? "0 0 30px rgba(255,255,255,0.3)" : undefined }}>
              <span style={mono(26, 0.6)}>{n}</span>
              <span style={{ ...mono(52), fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, textAlign: "center", ...mono(30), opacity: venta }}>EL GRÁFICO = SOLO EL PRECIO DE VENTA</div>
      </div>
      <div style={{ position: "absolute", left: Math.min(qb.x + 10, 900), top: qb.y, transform: "translate(-100%, -150%)", ...mono(26), fontWeight: 700, opacity: venta, whiteSpace: "nowrap" }}>VENTA (BID)</div>
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: si vas corto, cierras con el precio de compra (ASK): el spread
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = camGrafico([0.7, 0.0, 0], L(t, s, e, 3.0, 2.6), L(t, s, e, -0.1, 0.12));
  const tr: Trazo[] = [...polvo(0.25)];
  const ask = L(t, EV.compra - 0.5, EV.compra, 0, 1);
  grafico(tr, 0.0002, ask, 1);
  const xl = xI(CIERRES.length - 1) + 0.1;
  const yb = yP(CIERRES[CIERRES.length - 1]);
  const ya = yP(CIERRES[CIERRES.length - 1] + 0.0002);
  const k = L(t, EV.arriba - 0.2, EV.arriba + 0.2, 0, 1);
  if (k > 0) {
    tr.push({ t: "l", a: [xl, yb, 0.03], b: [xl, yb + (ya - yb) * k, 0.03], w: 3, o: 1, color: ROJO, luz: 0.6 });
    tr.push({ t: "l", a: [xl - 0.03, yb, 0.03], b: [xl + 0.03, yb, 0.03], w: 3, o: 1, color: ROJO });
    tr.push({ t: "l", a: [xl - 0.03, ya, 0.03], b: [xl + 0.03, ya, 0.03], w: 3, o: k, color: ROJO });
  }
  const pr = proyector(cam);
  const qa = pr([xI(CIERRES.length - 6), yP(CIERRES[CIERRES.length - 6] + 0.0002), 0.02]);
  const qb = pr([xI(CIERRES.length - 6), yP(CIERRES[CIERRES.length - 6]), 0.01]);
  const qm = pr([xl + 0.05, (yb + ya) / 2, 0.03]);
  const corto = muelle(t, EV.corto - 0.15, 240, 13);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {corto > 0.01 && (
        <div style={{ position: "absolute", top: 300, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
          <span style={{ padding: "12px 26px", borderRadius: 999, border: "2px solid #fff", background: "#000", ...mono(34), transform: `scale(${Math.min(corto, 1.08)})` }}>TU OPERACIÓN: CORTO ↓</span>
        </div>
      )}
      <div style={{ position: "absolute", left: qa.x, top: qa.y - 14, transform: "translate(-50%, -100%)", ...mono(28), fontWeight: 700, color: ROJO, opacity: ask, whiteSpace: "nowrap" }}>COMPRA (ASK) → CIERRA TU CORTO</div>
      <div style={{ position: "absolute", left: qb.x, top: qb.y + 16, transform: "translateX(-50%)", ...mono(24, 0.7), whiteSpace: "nowrap" }}>VENTA (BID) = LO QUE VES</div>
      {k > 0 && <div style={{ position: "absolute", left: Math.min(qm.x + 12, 900), top: qm.y, transform: "translate(-100%, -50%) translateX(-40px)", ...mono(32), fontWeight: 700, color: ROJO, opacity: k }}>SPREAD</div>}
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme
const Sigueme: React.FC<P> = (p) => <SiguemeStick {...p} lema="" />;

// ------------------------------------------------------------------ 5. Tres: con noticias y a medianoche el spread se dispara y toca el stop
const s3 = inicio("tres");
const TRES: Clave[] = [
  [s3 + 0.1, { mira: 0.8, ojos: 0.9 }],
  [EV.medianoche - 0.2, { ojos: 0.45, boca: -0.2, agacha: 0.3 }],
  [EV.liquidez - 0.1, { ojos: 1.4, cejas: 1, abre: 0.7, agacha: 0, mIx: -0.32, mIy: -0.3, mDx: 0.32, mDy: -0.3 }],
];
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = camGrafico([0.45, -0.3, 0], L(t, s, e, 4.1, 3.8) - 0.2 * golpe(t, EV.liquidez), L(t, s, e, 0.12, -0.1) + sacude(t, EV.liquidez - 0.05, 0.03));
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.1);
  // Spread: 2 pips → se dispara a 10 (ejemplo) y toca el stop
  const ens = L(t, EV.dispara - 0.3, EV.liquidez - 0.1, 0, 1, (u) => u * u);
  const spread = 0.0002 + 0.0008 * ens + 0.00006 * ens * Math.sin(t * 25);
  grafico(tr, spread, 1, 1);
  const pr = proyector(cam);
  const toca = t >= EV.liquidez - 0.15;
  const qt = pr([xI(CIERRES.length - 1), yP(STOP), 0.02]);
  const c = cuerpoEn(t, TRES, { mira: 0.8 }, s - 0.3);
  const a = anclaje(cam, [-0.08, -1, 0.5], 0.4);
  const pips = Math.round((spread / 0.0001) * 10) / 10;
  const noticia = muelle(t, EV.noticias - 0.2, 240, 12);
  const noche = muelle(t, EV.medianoche - 0.2, 240, 12);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <CamaraTiembla t={t} t0={EV.liquidez - 0.05} a={0.03}>
        <div style={{ position: "absolute", top: 270, left: 70, display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={mono(24, 0.6)}>SPREAD (EJEMPLO)</span>
          <span style={{ ...mono(64), fontWeight: 700, fontVariantNumeric: "tabular-nums", color: ens > 0.3 ? ROJO : "#fff" }}>{`${pips.toFixed(1).replace(".", ",")} PIPS`}</span>
        </div>
        <div style={{ position: "absolute", top: 270, right: 70, display: "flex", gap: 18 }}>
          {noticia > 0.01 && <span style={{ padding: "10px 18px", borderRadius: 14, border: "2px solid #fff", background: "#000", ...mono(30), transform: `scale(${Math.min(noticia, 1.08)})` }}>⚡ NOTICIA</span>}
          {noche > 0.01 && <span style={{ padding: "10px 18px", borderRadius: 14, border: "2px solid #fff", background: "#000", ...mono(30), transform: `scale(${Math.min(noche, 1.08)})` }}>☾ 00:00</span>}
        </div>
        {toca && <div style={{ position: "absolute", left: Math.min(qt.x, 900), top: qt.y - 16, transform: "translate(-100%, -100%)", ...mono(30), fontWeight: 700, color: ROJO, textShadow: "0 0 18px rgba(255,77,94,0.8)" }}>STOP EJECUTADO</div>}
        <StickMundo a={a} c={c} t={t} />
      </CamaraTiembla>
      <FlashRojo t={t} t0={EV.liquidez - 0.1} o={0.18} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: primer plano del punto de contacto; el gráfico no llegó, el spread sí
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = camGrafico([0.85, 0.2, 0], L(t, s, e, 2.4, 1.9), L(t, s, e, -0.2, 0.15), 0.08, { centroY: 900 });
  const tr: Trazo[] = [...polvo(0.25)];
  grafico(tr, 0.001, 1, 1);
  const xc = xI(CIERRES.length - 1);
  const vela = L(t, EV.grafico - 0.4, EV.grafico, 0, 1);
  const spr = L(t, EV.spread2 - 0.4, EV.spread2, 0, 1);
  if (spr > 0) tr.push({ t: "e", c: [xc, yP(STOP), 0.03], r: 0.03 * spr, tipo: "aro", o: 1, color: ROJO, luz: 1 });
  const pr = proyector(cam);
  const qv = pr([xI(18), yP(ALTO_MAX), 0]);
  const qc = pr([xc, yP(STOP), 0.03]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {vela > 0.01 && (
        <div style={{ position: "absolute", left: Math.max(qv.x, 230), top: qv.y + 20, transform: "translateX(-50%)", padding: "10px 18px", borderRadius: 12, border: "2px solid #fff", background: "#000", ...mono(30), opacity: vela, whiteSpace: "nowrap" }}>✗ EL GRÁFICO NO TOCA</div>
      )}
      {spr > 0.01 && (
        <div style={{ position: "absolute", left: Math.min(qc.x, 880), top: qc.y - 40, transform: `translate(-50%, -100%) scale(${1 + 0.15 * golpe(t, EV.spread2 - 0.05)})`, padding: "10px 18px", borderRadius: 12, border: `2px solid ${ROJO}`, background: "#000", ...mono(32), fontWeight: 700, color: ROJO, opacity: spr, whiteSpace: "nowrap" }}>✓ EL SPREAD SÍ</div>
      )}
      <FlashRojo t={t} t0={EV.spread2 - 0.05} o={0.14} />
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta: ¿te ha pasado?
const Pregunta: React.FC<P> = (p) => <PreguntaDos {...p} izq={{ texto: "NO", t0: EV.pasado + 0.35 }} der={{ texto: "SÍ", sub: "ME SALTÓ", t0: EV.pasado + 0.8 }} pie="ETIQUETA AL QUE PONE EL STOP PEGADO AL PRECIO" tPie={EV.etiqueta} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves([["saltó", ROJO], "nunca", "magia", "venta", "corto", "compra", ["spread", ROJO], "sígueme", "peligrosa", ["dispara", ROJO], "noticias", "medianoche", "gráfico", "pasado", "pegado"]);

export const Spread: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/spread_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
