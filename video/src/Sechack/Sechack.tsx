// Reel 5-30-10 «dopamina» "Una noticia falsa movió bitcoin mil dólares en minutos" (~37 s): la cuenta de la SEC en X
// hackeada (9-1-2024). Fotograma 0: el tuit con el ✓ oficial y el gráfico de bitcoin disparándose (+1.000 $); el tuit
// grande con la fecha; los stickmen que corren a COMPRAR y la vela verde; el tuit que se rompe con HACKEADO, el desmentido,
// la vela que se da la vuelta y los stickmen que COMPRARON ARRIBA; la regla (antes de operar un titular, la web oficial:
// si no está, no ha pasado) y el cierre en el móvil. Tiempos en src/gen/sechack.json (scripts/sechack.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/sechack.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { cuerpoEn, Stick } from "../Bot/stick";
import { CamaraTiembla, Sello } from "../Bot/historia";
import { Foco } from "../Bot/ui2d";
import { Marca, Rotulito } from "../Bot/v3";
import { CierreMovil, Ficha3D, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const SECHACK_FPS = datos.fps;
export const SECHACK_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);

// ------------------------------------------------------------------ piezas: el tuit y el gráfico de bitcoin
const Tuit: React.FC<{ x: number; y: number; w?: number; s?: number; rot?: number; roto?: number; texto: string; nombre?: string; color?: string }> = ({ x, y, w = 860, s = 1, rot = 0, roto = 0, texto, nombre = "SEC (cuenta oficial)", color = "#fff" }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, transform: `rotate(${rot}deg) scale(${s})`, transformOrigin: "50% 0%" }}>
    <div style={{ position: "relative", borderRadius: 28, border: `3px solid ${color}`, background: "#0b0b0d", padding: "26px 30px", color: "#fff", boxShadow: "0 30px 80px rgba(0,0,0,0.8)", clipPath: roto > 0 ? `polygon(0 0, ${100 - 40 * roto}% 0, ${60}% 45%, ${100 - 30 * roto}% 100%, 0 100%)` : undefined }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 70, height: 70, borderRadius: 35, background: "#1d2a44", border: "3px solid #6aa0ff" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36 }}>{nombre} <span style={{ color: "#6aa0ff" }}>✓</span></span>
          <span style={{ ...mono(24, 0.55) }}>9 ene. 2024</span>
        </div>
        <span style={{ marginLeft: "auto", fontFamily: SANS, fontWeight: 800, fontSize: 44 }}>X</span>
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, lineHeight: 1.2, marginTop: 20 }}>{texto}</div>
    </div>
  </div>
);
const serie = (u: number, cae: number) => {
  const pts: string[] = [];
  const X0 = 140;
  const X1 = 940;
  for (let k = 0; k <= 80 * u; k++) {
    const v = k / 80;
    const pico = v < 0.55 ? 0 : v < 0.7 ? (v - 0.55) / 0.15 : 1;
    const baja = v < 0.75 ? 0 : Math.min(1, (v - 0.75) / 0.2) * cae;
    const y = 1180 - pico * 330 + baja * 380 + Math.sin(k * 1.7) * 10;
    pts.push(`${X0 + v * (X1 - X0)},${y}`);
  }
  return pts.join(" ");
};

// ------------------------------------------------------------------ 1. Hook: el tuit oficial y bitcoin disparado
const Hook: React.FC<P> = ({ t }) => {
  const u = L(t, -0.6, EV.mil + 0.4, 0.45, 0.78, (v) => v);
  return (
    <CamaraTiembla t={t} t0={EV.mil} a={0.015}>
      <Tuit x={540} y={530} w={900} s={0.95} rot={-2} texto="La SEC aprueba los ETF de bitcoin." />
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polyline points={serie(u, 0)} fill="none" stroke={VERDE} strokeWidth={8} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 12px ${VERDE})` }} />
      </svg>
      <Ficha3D t={t} t0={EV.mil - 0.05} texto="+1.000 $" x={760} y={1300} size={110} color={VERDE} />
    </CamaraTiembla>
  );
};

// ------------------------------------------------------------------ 2. Uno: el tuit en grande · todos corren a COMPRAR · la vela verde
const N = 5;
const Uno: React.FC<P> = ({ t, s }) => {
  const tuit = 1 - L(t, EV.aprueba - 0.2, EV.aprueba + 0.1, 0, 1);
  const compra = L(t, EV.aprueba - 0.1, EV.aprueba + 0.2, 0, 1);
  const vela = L(t, EV.sube - 0.1, EV.sube + 0.5, 0, 1, (u) => 1 - Math.pow(1 - u, 3));
  const g = muelle(t, s, 200, 14);
  return (
    <>
      {tuit > 0.01 && (
        <AbsoluteFill style={{ opacity: tuit }}>
          <Tuit x={540} y={620} s={0.85 + 0.15 * min1(g, 1.05)} texto="Hoy la SEC aprueba los ETF de bitcoin para cotizar en todas las bolsas." />
          {t > EV.sec - 0.2 && <div style={{ position: "absolute", left: 140, top: 560, ...mono(36), fontWeight: 800, color: "#6aa0ff", transform: `scale(${0.6 + 0.4 * min1(muelle(t, EV.sec - 0.2, 240, 12), 1.1)})`, transformOrigin: "0% 50%" }}>EL REGULADOR DE LA BOLSA DE EE. UU. ↓</div>}
        </AbsoluteFill>
      )}
      {compra > 0.01 && (
        <AbsoluteFill style={{ opacity: compra }}>
          <div style={{ position: "absolute", left: 640, top: 1150 - 600 * vela, width: 150, height: 600 * vela + 6, borderRadius: 12, background: VERDE, boxShadow: `0 0 40px ${VERDE}` }} />
          {Array.from({ length: N }, (_, i) => {
            const x = 130 + i * 110;
            const c = cuerpoEn(t, [[EV.aprueba + i * 0.12, { mDx: 0.35, mDy: 0.3, boca: 0.9, abre: 0.4, mira: 0.8, incl: 0.12 }]], {}, s);
            return (
              <React.Fragment key={i}>
                <Stick c={c} ox={x + 40 * L(t, EV.aprueba + i * 0.12, EV.sube, 0, 1)} oy={1340} s={140} t={t + i} />
                <div style={{ position: "absolute", left: x - 55, width: 110, top: 1110, textAlign: "center", ...mono(24), fontWeight: 800, color: VERDE, border: `2px solid ${VERDE}`, borderRadius: 8, background: "#000", opacity: L(t, EV.aprueba + i * 0.12, EV.aprueba + i * 0.12 + 0.15, 0, 1) }}>COMPRA</div>
              </React.Fragment>
            );
          })}
          <Ficha3D t={t} t0={EV.mil2 - 0.1} texto="+1.000 $" x={710} y={420} size={120} color={VERDE} sub="EN MINUTOS" />
        </AbsoluteFill>
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

// ------------------------------------------------------------------ 4. Dos: HACKEADO · el desmentido · la vuelta · compraron arriba
const Dos: React.FC<P> = ({ t, s }) => {
  const roto = L(t, EV.hackeado - 0.1, EV.hackeado + 0.3, 0, 1);
  const tuits = 1 - L(t, EV.vuelta - 0.6, EV.vuelta - 0.35, 0, 1);
  const grafico = L(t, EV.vuelta - 0.5, EV.vuelta - 0.25, 0, 1);
  const cae = L(t, EV.vuelta - 0.3, EV.vuelta + 0.8, 0, 1);
  return (
    <>
      {tuits > 0.01 && (
        <AbsoluteFill style={{ opacity: tuits }}>
          <Tuit x={540} y={470} s={0.85} rot={-2} roto={roto} texto="Hoy la SEC aprueba los ETF de bitcoin para cotizar en todas las bolsas." color={roto > 0.5 ? ROJO : "#fff"} />
          <Sello t={t} t0={EV.hackeado - 0.05} texto="HACKEADO" top={600} color={ROJO} size={100} />
          {t > EV.desmintieron - 0.3 && <Tuit x={540} y={930} s={0.8 * (0.6 + 0.4 * min1(muelle(t, EV.desmintieron - 0.3, 220, 13), 1.08))} rot={2} nombre="Gary Gensler, presidente de la SEC" texto="La SEC no ha aprobado los ETF de bitcoin." color={VERDE} />}
        </AbsoluteFill>
      )}
      {grafico > 0.01 && (
        <AbsoluteFill style={{ opacity: grafico }}>
          <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
            <polyline points={serie(1, cae)} fill="none" stroke={cae > 0.1 ? ROJO : VERDE} strokeWidth={8} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 12px ${cae > 0.1 ? ROJO : VERDE})` }} />
          </svg>
          {t > EV.titular - 0.3 && [0, 1, 2].map((i) => {
            const c = cuerpoEn(t, [[EV.titular, { mIx: -0.2, mIy: 0.25, mDx: 0.2, mDy: 0.25, agobio: 1, boca: -0.8, cejas: -1 }]], {}, s);
            return (
              <React.Fragment key={i}>
                <Stick c={c} ox={600 + i * 90} oy={830} s={110} t={t + i} o={L(t, EV.titular - 0.3, EV.titular, 0, 1)} />
              </React.Fragment>
            );
          })}
          {t > EV.arriba - 0.2 && <div style={{ position: "absolute", left: 480, width: 460, top: 470, textAlign: "center", ...mono(40), fontWeight: 800, color: ROJO, transform: `scale(${0.6 + 0.4 * min1(muelle(t, EV.arriba - 0.2, 240, 12), 1.1)})` }}>COMPRARON AQUÍ ↓</div>}
        </AbsoluteFill>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: antes de operar un titular, la web oficial
const Giro: React.FC<P> = ({ t, s }) => {
  const web = muelle(t, EV.buscalo - 0.2, 220, 13);
  const c = cuerpoEn(t, [[EV.redes, { mDx: 0.38, mDy: 0.0, mira: 0.7, cejas: 0.5 }], [EV.pasado - 0.1, { mDx: 0.15, mDy: -0.52, boca: 0.7, mira: 0.3 }]], {}, s - 0.3);
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={360} />
      <Tuit x={560} y={470} w={820} s={0.9 * (0.6 + 0.4 * min1(muelle(t, EV.redes - 0.4, 220, 13), 1.08))} texto="Titular en redes: «¡Aprobado!»" nombre="Una cuenta cualquiera" />
      {web > 0.01 && (
        <div style={{ position: "absolute", left: 420, top: 760, width: 560, height: 380, borderRadius: 22, border: "4px solid #fff", background: "#060606", overflow: "hidden", opacity: min1(web * 2), transform: `scale(${0.6 + 0.4 * min1(web, 1.08)})` }}>
          <div style={{ height: 64, background: "#1b1b1b", display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
            {[ROJO, ORO, VERDE].map((c2) => <div key={c2} style={{ width: 16, height: 16, borderRadius: 8, background: c2 }} />)}
            <div style={{ flex: 1, marginLeft: 12, padding: "8px 14px", borderRadius: 10, background: "#000", ...mono(26), fontWeight: 700 }}>web oficial</div>
          </div>
          <div style={{ padding: "30px 28px", color: "#fff", display: "flex", flexDirection: "column", gap: 18 }}>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40 }}>Comunicados</span>
            <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, opacity: 0.8 }}>Sin resultados para «aprobado»</span>
          </div>
        </div>
      )}
      <Sello t={t} t0={EV.pasado - 0.1} texto="NO HA PASADO" top={1180} color={ROJO} size={84} />
      <Marca t={t} t0={EV.pasado + 0.1} x={880} y={1300} size={100} color={VERDE} tipo="ok" />
      <Foco x={240} y={1400} w={340} h={70} o={0.15} />
      <Stick c={c} ox={240} oy={1400} s={210} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["falsa", ROJO], ["mil", VERDE], "minutos", "enero", "oficial", "sec", ["aprueba", VERDE], "etf", ["sube", VERDE], "sígueme", ["falso", ROJO], ["hackeado", ROJO], "desmintieron", ["vuelta", ROJO], "titular", ["arriba", ROJO], "regla", "redes", "web", ["pasado", ROJO], "llegado", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV.falsa, ROJO], [EV.mil, VERDE], [EV.enero], [EV.sec], [EV.aprueba, VERDE], [EV.sube, VERDE], [EV.mil2, VERDE], [EV.falso, ROJO], [EV.hackeado, ROJO], [EV.desmintieron], [EV.vuelta, ROJO], [EV.arriba, ROJO], [EV.regla], [EV.redes], [EV.buscalo], [EV.pasado, ROJO], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["Una noticia *falsa*", "movió bitcoin *1.000_$*"], hasta: inicio("uno") - 0.05, color: ROJO, colores: [ROJO, VERDE] };
export const Sechack: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/sechack_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
