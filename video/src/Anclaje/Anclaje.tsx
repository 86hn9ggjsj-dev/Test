// Corto v3 «dopamina» "Al mercado le da igual a qué precio compraste" (~26 s), sin personajes y en estilo limpio: un
// gráfico en directo con la línea «TU PRECIO · 50 €» y un ancla colgando, el precio que se aleja y no vuelve, las semanas
// que pasan, la palabra ANCLAJE, la pregunta SÍ / NO y el botón CERRAR; al final, el avión de «mándaselo» y los meses
// esperando a «salir en tablas». Golpe de zoom (y color) en cada palabra clave y final en bucle (vuelve al gráfico).
// Tiempos en src/gen/anclaje.json (scripts/anclaje.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/anclaje.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ROJO, VERDE } from "../Bot/kit";
import { Foco } from "../Bot/ui2d";
import { Ancla, Boton, Enviar, Golpe, Marca, pop, pulsa, Rotulito, sal } from "../Bot/v3";
import { claves, CtaSeguir, cuando, Montaje, P } from "../Explica/Montaje";

export const ANCLAJE_FPS = datos.fps;
export const ANCLAJE_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const en = cuando(datos);
const ESPERAS2 = en("esperas", EV.esperas + 0.3);
const NO = en("no", EV.respuesta);
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;

// ------------------------------------------------------------------ el gráfico en directo
const X0 = 140;
const X1 = 900;
const VENTANA = 2.2;
const yv = (p: number) => 1250 - (p - 32) * 30;
const Y_LINEA = yv(50);
const precio = (u: number) => {
  if (u < 0) return 50 + 0.8 * Math.sin(u * 7) + 0.5 * Math.sin(u * 17);
  const ruido = 1.2 * Math.sin(u * 9) + 0.7 * Math.sin(u * 23 + 1) + 0.4 * Math.sin(u * 41);
  return 50 - 13 * (1 - Math.exp(-2.2 * u)) + ruido * (1 - Math.exp(-3 * u));
};
// Tiempo del gráfico: avanza despacio y acelera mientras «esperas» y en los «meses»
const cabeza = (t: number) => 0.9 + 0.35 * t + 2.6 * L(t, 5.3, 6.9, 0, 1) + 3.5 * L(t, EV.meses - 0.15, EV.meses + 1, 0, 1);
const euros2 = (p: number) => p.toFixed(2).replace(".", ",") + " €";

const Grafico: React.FC<{ t: number; linea?: number; tachado?: number; etiqueta?: string; brillo?: number; o?: number }> = ({ t, linea = 1, tachado = 0, etiqueta = "TU PRECIO · 50 €", brillo = 0, o = 1 }) => {
  const h = cabeza(t);
  const x = (u: number) => X1 - ((h - u) / VENTANA) * (X1 - X0);
  const antes: string[] = [];
  const despues: string[] = [];
  for (let u = h - VENTANA; u <= h + 1e-6; u += 0.01) (u < 0 ? antes : despues).push(`${x(u).toFixed(1)},${yv(precio(u)).toFixed(1)}`);
  if (antes.length && despues.length) despues.unshift(antes[antes.length - 1]);
  const yH = yv(precio(h));
  const xE = x(0);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={X0 - 20} x2={X1 + 20} y1={Y_LINEA} y2={Y_LINEA} stroke="#fff" strokeWidth={4 + 4 * brillo} strokeDasharray="18 12" opacity={0.85 * linea} style={brillo > 0.01 ? { filter: `drop-shadow(0 0 ${20 * brillo}px #fff)` } : undefined} />
        {antes.length > 1 && <polyline points={antes.join(" ")} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={6} strokeLinejoin="round" />}
        {despues.length > 1 && <polyline points={despues.join(" ")} fill="none" stroke={ROJO} strokeWidth={7} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${ROJO}88)` }} />}
        {xE > X0 && <circle cx={xE} cy={Y_LINEA} r={13} fill="#fff" />}
        <circle cx={X1} cy={yH} r={16} fill={ROJO} style={{ filter: `drop-shadow(0 0 14px ${ROJO})` }} />
        <circle cx={X1} cy={yH} r={16 + 22 * ((t * 1.6) % 1)} fill="none" stroke={ROJO} strokeWidth={3} opacity={1 - ((t * 1.6) % 1)} />
      </svg>
      <div style={{ position: "absolute", left: X0, top: Y_LINEA - 70, ...mono(40), fontWeight: 800, color: "#fff", opacity: linea }}>
        <span style={{ position: "relative" }}>
          {etiqueta}
          {tachado > 0 && <span style={{ position: "absolute", left: -8, top: "50%", width: `calc(${tachado * 100}% + 16px)`, height: 8, borderRadius: 4, background: ROJO, boxShadow: `0 0 14px ${ROJO}` }} />}
        </span>
      </div>
      <div style={{ position: "absolute", left: X1 - 290, top: yH + 40, ...mono(46), fontWeight: 800, color: ROJO, padding: "8px 18px", borderRadius: 12, border: `3px solid ${ROJO}`, background: "#000" }}>{euros2(precio(h))}</div>
    </AbsoluteFill>
  );
};

// Ancla colgando de la línea (cae en «compraste»)
const AnclaLinea: React.FC<{ t: number; o?: number }> = ({ t, o = 1 }) => {
  const g = muelle(t, EV.compraste - 0.25, 200, 10);
  if (g <= 0.01) return null;
  return (
    <>
      <div style={{ position: "absolute", left: 268, top: Y_LINEA, width: 4, height: 40, background: "#fff", opacity: o * Math.min(g, 1) }} />
      <Ancla x={270} y={Y_LINEA + 130 - (1 - Math.min(g, 1.2)) * 300} size={190} rot={Math.sin(t * 2.4) * 8} o={o * Math.min(g * 1.5, 1)} />
    </>
  );
};

// ------------------------------------------------------------------ 1. Hook: el precio se aleja de tu línea
const Hook: React.FC<P> = ({ t }) => (
  <>
    <Grafico t={t} />
    <AnclaLinea t={t} />
  </>
);

// ------------------------------------------------------------------ 2. Uno: no cierras hasta recuperar · y esperas
const Uno: React.FC<P> = ({ t }) => {
  const sale = 1 - L(t, EV.esperas - 0.35, EV.esperas - 0.1, 0, 1);
  const boton = pop(t, EV.cierras - 0.1);
  const flecha = L(t, EV.recuperar - 0.05, EV.recuperar + 0.6, 0, 1, (u) => u);
  const yH = yv(precio(cabeza(t)));
  const semana = Math.max(1, Math.round(L(t, EV.esperas - 0.1, ESPERAS2 + 0.5, 1, 12, (u) => u)));
  return (
    <>
      <Grafico t={t} />
      <AnclaLinea t={t} />
      {flecha > 0 && sale > 0.01 && (
        <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0, opacity: sale }}>
          <line x1={X1 - 60} x2={X1 - 60} y1={yH - 30} y2={yH - 30 - (yH - 30 - Y_LINEA - 20) * flecha} stroke="#fff" strokeWidth={6} strokeDasharray="14 10" />
          {flecha > 0.95 && <path d={`M${X1 - 84} ${Y_LINEA + 44} L${X1 - 60} ${Y_LINEA + 16} L${X1 - 36} ${Y_LINEA + 44}`} fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" />}
        </svg>
      )}
      {boton > 0.01 && sale > 0.01 && (
        <>
          <Boton x={330} y={1330} w={400} h={130} texto="CERRAR" color="#fff" o={0.45 * Math.min(boton * 1.5, 1) * sale} k={0} />
          {sale > 0.5 && <Marca t={t} t0={EV.cierras + 0.1} x={530} y={1275} size={110} color={ROJO} tipo="no" />}
        </>
      )}
      {t >= EV.esperas - 0.1 && <Rotulito t={t} t0={EV.esperas - 0.1} texto={`SEMANA ${semana}`} top={340} color={ROJO} />}
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

// ------------------------------------------------------------------ 4. Dos: ANCLAJE · tu precio de entrada como referencia · no significa nada
const Dos: React.FC<P> = ({ t }) => {
  const graf = L(t, EV.cabeza - 0.15, EV.cabeza + 0.1, 0, 1);
  const pulso = Math.max(0, 1 - Math.abs(t - EV.entrada - 0.15) * 3);
  const ref = pop(t, EV.referencia - 0.05);
  const nada = L(t, EV.nada - 0.05, EV.nada + 0.25, 0, 1);
  return (
    <>
      <Golpe t={t} t0={EV.anclaje - 0.05} texto="anclaje" y={680} size={230} color={ROJO} fin={EV.cabeza - 0.05} />
      {t < EV.cabeza && <Ancla x={540} y={1020} size={280} rot={Math.sin(t * 3) * 12} o={Math.min(pop(t, EV.anclaje - 0.1) * 1.5, 1) * (1 - L(t, EV.cabeza - 0.25, EV.cabeza - 0.05, 0, 1))} />}
      {graf > 0 && (
        <AbsoluteFill style={{ opacity: graf }}>
          <Grafico t={t} brillo={pulso + 0.6 * ref * (1 - nada)} linea={1 - 0.7 * nada} tachado={nada} />
          {ref > 0.01 && nada < 1 && (
            <div style={{ position: "absolute", left: 0, width: ANCHO, top: Y_LINEA + 40, display: "flex", justifyContent: "center", opacity: Math.min(ref * 1.5, 1) * (1 - nada) }}>
              <span style={{ ...mono(48), fontWeight: 800, color: "#000", background: "#fff", padding: "10px 26px", borderRadius: 14, transform: `scale(${0.6 + 0.4 * Math.min(ref, 1.1)})` }}>REFERENCIA</span>
            </div>
          )}
        </AbsoluteFill>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: ¿la abrirías hoy a este precio? SÍ / NO → CERRAR
const Giro: React.FC<P> = ({ t }) => {
  const hoy = pop(t, EV.hoy - 0.05);
  const botones = pop(t, EV.abririas - 0.1);
  const dice = L(t, NO - 0.05, NO + 0.15, 0, 1);
  const cierra = pop(t, EV["ciérrala"] - 0.1);
  const fuera = L(t, EV["ciérrala"] - 0.2, EV["ciérrala"], 0, 1);
  const latido = 1 + 0.06 * Math.max(0, 1 - Math.abs(t - EV.precio2 - 0.1) * 4);
  return (
    <>
      <Golpe t={t} t0={EV.pregunta2 - 0.05} texto="?" y={800} size={460} fin={EV.hoy - 0.05} />
      {hoy > 0.01 && (
        <>
          <Rotulito t={t} t0={EV.hoy - 0.05} texto="PRECIO DE HOY" top={420} />
          <div style={{ position: "absolute", left: 0, width: ANCHO, top: 620, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 170, lineHeight: 1, letterSpacing: "-0.04em", color: "#fff", transform: `scale(${(0.6 + 0.4 * Math.min(hoy, 1.05)) * latido})`, opacity: Math.min(hoy * 1.5, 1) }}>
            {euros2(precio(cabeza(t)))}
          </div>
        </>
      )}
      {botones > 0.01 && fuera < 1 && (
        <AbsoluteFill style={{ opacity: Math.min(botones * 1.5, 1) * (1 - fuera), transform: `translateY(${(1 - Math.min(botones, 1)) * 60}px)` }}>
          <Boton x={320} y={1060} w={340} h={170} texto="SÍ" color="#fff" o={1 - 0.6 * dice} />
          <Boton x={760} y={1060} w={340} h={170} texto="NO" color={dice > 0 ? ROJO : "#fff"} lleno={dice} k={pulsa(t, NO)} />
        </AbsoluteFill>
      )}
      {cierra > 0.01 && (
        <>
          <Boton x={540} y={1060} w={560} h={180} texto="CERRAR" color={VERDE} lleno={0.9} k={pulsa(t, EV["ciérrala"] + 0.05)} o={Math.min(cierra * 1.5, 1)} />
          <Marca t={t} t0={EV["ciérrala"] + 0.15} x={540} y={1250} size={120} color={VERDE} tipo="ok" />
        </>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: mándaselo · meses esperando a «salir en tablas»
const Cierre: React.FC<P> = ({ t }) => {
  const vuela = L(t, EV.mandaselo - 0.1, EV.mandaselo + 0.75, 0, 1, (u) => u);
  const g = pop(t, EV.mandaselo - 0.1);
  const graf = L(t, EV.meses - 0.2, EV.meses + 0.05, 0, 1);
  const mes = Math.max(1, Math.round(L(t, EV.meses - 0.1, EV.meses + 1, 1, 9, (u) => u)));
  const tablas = L(t, EV.tablas - 0.1, EV.tablas + 0.1, 0, 1);
  const brillo = Math.max(0, 1 - Math.abs(t - EV.tablas - 0.1) * 2.5);
  return (
    <>
      {graf < 1 && (
        <Enviar x={300 + 480 * sal(vuela)} y={1060 - 420 * sal(vuela)} size={260 * (0.6 + 0.4 * Math.min(g, 1.1))} rot={-10 + 20 * vuela} o={Math.min(g * 1.5, 1) * (1 - graf)} />
      )}
      {graf > 0 && (
        <AbsoluteFill style={{ opacity: graf }}>
          <Grafico t={t} etiqueta={tablas > 0.5 ? "TABLAS · 50 €" : "TU PRECIO · 50 €"} brillo={brillo} />
          <AnclaLinea t={t} />
          <Rotulito t={t} t0={EV.meses - 0.1} texto={`MES ${mes}`} top={340} color={ROJO} />
        </AbsoluteFill>
      )}
      {graf > 0 && <Foco x={ANCHO / 2} y={Y_LINEA} w={900} h={160} o={0.1 * brillo} />}
    </>
  );
};

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["igual", ROJO], ["compraste", ROJO], "cierras", "recuperar", ["esperas", ROJO], "sígueme", ["anclaje", ROJO], "cabeza", "entrada", "referencia", ["nada", ROJO], "pregunta", "hoy", "abrirías", ["no", ROJO], ["ciérrala", VERDE], "mándaselo", ["meses", ROJO], "tablas"]);
const GOLPES: [number, string?][] = [[0.02], [EV.igual], [EV.compraste, ROJO], [EV.cierras], [EV.recuperar], [EV.pagaste], [EV.esperas], [ESPERAS2], [EV.anclaje, ROJO], [EV.cabeza], [EV.entrada], [EV.referencia], [EV.nada, ROJO], [EV.pregunta2], [EV.hoy], [EV.abririas], [NO, ROJO], [EV["ciérrala"], VERDE], [EV.mandaselo], [EV.meses], [EV.tablas, ROJO]];

const GANCHO = { lineas: ["Al mercado le da igual", "a qué precio *compraste*"], hasta: inicio("uno") - 0.05, color: ROJO };
export const Anclaje: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/anclaje_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.1} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
