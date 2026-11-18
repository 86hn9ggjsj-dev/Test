// Reel 5-30-10 «dopamina» "Operar más te hace ganar menos" (~36 s), con los recursos de la referencia: fotograma 0 en
// plena acción (un móvil con el bróker en el que alguien no para de pulsar), la ficha 3D de «60.000» con miniaturas que
// saltan alrededor, el móvil que se lanza a cámara, la tarjeta del estudio (Barber y Odean, 2000), un barrio en 3D visto
// desde un dron, la carrera de barras 18,5 % frente a 11,4 %, las notificaciones de comisiones apiladas, la bombilla con
// iconos en órbita y el cierre en el móvil (comenta BOT → mensaje directo). Tiempos en src/gen/operarmas.json.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/operarmas.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ROJO, VERDE } from "../Bot/kit";
import { Escena, orbita, Trazo } from "../Bot/tres";
import { casa, horizonte } from "../Bot/decorados";
import { Sello } from "../Bot/historia";
import { Foco } from "../Bot/ui2d";
import { Cifra, Marca, Rotulito } from "../Bot/v3";
import { AppBroker, Bombilla, CierreMovil, Ficha3D, Movil, MovilACamara, Notis, Orbita, Prueba, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const OPERARMAS_FPS = datos.fps;
export const OPERARMAS_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);

// ------------------------------------------------------------------ 1. Hook: no para de pulsar · 60.000 cuentas reales
const TOQUE = 0.17;
const serieHook = (t: number) => {
  const n = Math.max(3, Math.min(40, Math.floor(4 + t * 13)));
  return Array.from({ length: n }, (_, i) => -i * 4 + Math.sin(i * 1.7) * 6);
};
const PantallaPulsa: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.floor(Math.max(0, t) / TOQUE);
  const u = (Math.max(0, t) % TOQUE) / TOQUE;
  const serie = serieHook(t);
  const x = n % 2 ? 398 : 142;
  return (
    <>
      <AppBroker t={t} pnl={-12 - 7 * n} serie={serie} color={ROJO} titulo={`Operaciones hoy: ${23 + n}`} />
      <div style={{ position: "absolute", left: x - 50 - 40 * u, top: 735 - 50 - 40 * u, width: 100 + 80 * u, height: 100 + 80 * u, borderRadius: "50%", border: "5px solid #fff", opacity: 1 - u }} />
      <div style={{ position: "absolute", left: x - 34, top: 735 - 34, width: 68, height: 68, borderRadius: "50%", background: "rgba(255,255,255,0.85)", opacity: u < 0.4 ? 1 : 0 }} />
    </>
  );
};
const MINIS: [number, number, number][] = [[-330, -260, -8], [330, -230, 7], [-360, 60, 6], [360, 90, -6], [-250, 330, -4], [270, 340, 5]];
const Hook: React.FC<P> = ({ t }) => {
  const atras = L(t, EV["60000"] - 0.3, EV["60000"], 0, 1);
  return (
    <>
      <Foco x={ANCHO / 2} y={1400} w={800} h={140} o={0.1} />
      <AbsoluteFill style={{ opacity: 1 - 0.7 * atras, filter: atras > 0.01 ? `blur(${8 * atras}px)` : undefined }}>
        <Movil x={540} y={1010} s={0.84} rotY={-8 + 4 * Math.sin(t * 2)} rotX={4}>
          <PantallaPulsa t={t} />
        </Movil>
      </AbsoluteFill>
      {MINIS.map(([dx, dy, r], i) => {
        const g = muelle(t, EV["60000"] + 0.1 + i * 0.09, 240, 13);
        if (g <= 0.01) return null;
        const verde = i % 3 === 1;
        return (
          <div key={i} style={{ position: "absolute", left: 540 + dx * min1(g) - 90, top: 1000 + dy * min1(g) - 120, width: 180, height: 240, borderRadius: 22, border: `3px solid ${verde ? VERDE : "#fff"}`, background: "#0a0a0a", transform: `rotate(${r}deg) scale(${0.4 + 0.6 * min1(g, 1.1)})`, opacity: min1(g * 2), overflow: "hidden" }}>
            <svg width={180} height={150} style={{ position: "absolute", top: 20 }}>
              <polyline points={verde ? "10,120 50,90 90,100 130,50 170,30" : "10,40 50,70 90,60 130,110 170,130"} fill="none" stroke={verde ? VERDE : ROJO} strokeWidth={5} />
            </svg>
            <div style={{ position: "absolute", left: 14, bottom: 12, ...mono(24), fontWeight: 800, color: "#fff" }}>CUENTA {(i * 9137 + 4211) % 60000}</div>
          </div>
        );
      })}
      <Ficha3D t={t} t0={EV["60000"] - 0.05} texto="60.000" y={1010} size={210} sub="CUENTAS REALES" />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: el estudio · el barrio desde el dron · +18,5 % los que no tocaban nada
const Barrio: React.FC<{ t: number; s: number; e: number }> = ({ t, s, e }) => {
  const tr: Trazo[] = [];
  horizonte(tr, -4.5, 0.3);
  let k = 0;
  const enciende = L(t, EV.familias - 0.2, EV.anos, 0, 1, (u) => u);
  for (let z = -4; z <= 1.2; z += 1.05)
    for (let x = -3; x <= 3.01; x += 0.95) {
      const on = ((k * 37) % 35) / 35 < enciende;
      casa(tr, x, z, 1, on ? 0.95 : 0.45, on ? VERDE : "#fff", 0.6);
      k++;
    }
  const cam = orbita([0, -0.7, -1.4], L(t, s, e, 6.2, 5.0), L(t, s, e, -0.55, 0.15), 0.62, { apertura: 7, centroY: 1080 });
  return <Escena cam={cam} trazos={tr} />;
};
const s1 = inicio("uno");
const Uno: React.FC<P> = ({ t, s, e }) => {
  const barrio = L(t, EV.familias - 0.25, EV.familias, 0, 1) * (1 - L(t, EV.tocaban - 0.3, EV.tocaban - 0.05, 0, 1));
  const quieto = L(t, EV.tocaban - 0.2, EV.tocaban + 0.1, 0, 1);
  return (
    <>
      <Prueba t={t} t0={EV.estudio - 0.25} x={540} y={900} cabecera="THE JOURNAL OF FINANCE · 2000" titulo="«Trading Is Hazardous to Your Wealth»" pie="Barber y Odean · 66.465 hogares · 1991-1996" fin={EV.familias - 0.05} />
      {barrio > 0.01 && (
        <AbsoluteFill style={{ opacity: barrio }}>
          <Barrio t={t} s={s} e={e} />
          {t < EV.anos - 0.05 ? (
            <>
              <Cifra t={t} t0={EV.familias - 0.1} t1={EV.anos - 0.2} de={0} a={66465} y={470} size={150} />
              <div style={{ position: "absolute", left: 0, width: ANCHO, top: 560, textAlign: "center", ...mono(44), fontWeight: 800, letterSpacing: "0.2em" }}>HOGARES</div>
            </>
          ) : (
            <Ficha3D t={t} t0={EV.anos - 0.05} texto="1991 → 1996" y={500} size={120} sub="6 AÑOS" />
          )}
        </AbsoluteFill>
      )}
      {quieto > 0.01 && (
        <AbsoluteFill style={{ opacity: quieto }}>
          <Foco x={540} y={1300} w={700} h={140} o={0.12} />
          <Movil x={540} y={1080} w={540} h={1000} s={0.62} rotX={52} rot={-8}>
            <AppBroker t={t} pnl={0} serie={[0, 1, 0.5, 1.5, 1.2, 2]} color="rgba(255,255,255,0.5)" titulo="Operaciones hoy: 0" />
          </Movil>
          <svg width={150} height={150} viewBox="0 0 100 100" style={{ position: "absolute", left: 465, top: 860 - 30 * Math.sin(t * 2), opacity: L(t, EV.tocaban, EV.tocaban + 0.3, 0, 1) * (1 - L(t, EV["18"] - 0.2, EV["18"], 0, 1)) }}>
            <circle cx={50} cy={50} r={44} fill="#000" stroke="#fff" strokeWidth={5} />
            <rect x={34} y={30} width={10} height={40} rx={3} fill="#fff" />
            <rect x={56} y={30} width={10} height={40} rx={3} fill="#fff" />
          </svg>
          <Ficha3D t={t} t0={EV["18"] - 0.05} texto="+18,5 %" y={640} size={190} color={VERDE} sub="AL AÑO" />
        </AbsoluteFill>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 3. Sígueme encima de la escena
const Sigueme: React.FC<P> = (p) => (
  <>
    <AbsoluteFill style={{ filter: "blur(9px)" }}>
      <Uno t={p.t} s={s1} e={fin("uno")} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "rgba(0,0,0,0.6)" }} />
    <CtaSeguir {...p} lema="" sinFondo />
  </>
);

// ------------------------------------------------------------------ 4. Dos: carrera de barras · antes de comisiones casi igual · las comisiones
const BASE = 1230;
const ESC = 32; // px por punto
const Columna: React.FC<{ x: number; v: number; color: string; etiqueta: string; o?: number }> = ({ x, v, color, etiqueta, o = 1 }) => (
  <div style={{ opacity: o }}>
    <div style={{ position: "absolute", left: x - 130, top: BASE - v * ESC, width: 260, height: v * ESC, borderRadius: "22px 22px 6px 6px", background: `linear-gradient(180deg, ${color} 0%, ${color}55 100%)`, border: `4px solid ${color}`, boxShadow: `0 0 40px ${color}55` }} />
    <div style={{ position: "absolute", left: x - 200, width: 400, top: BASE - v * ESC - 110, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 90, letterSpacing: "-0.03em", color }}>{v.toFixed(1).replace(".", ",")} %</div>
    <div style={{ position: "absolute", left: x - 200, width: 400, top: BASE + 22, textAlign: "center", ...mono(30), fontWeight: 800, color, whiteSpace: "normal", lineHeight: 1.2 }}>{etiqueta}</div>
  </div>
);
const Dos: React.FC<P> = ({ t, s }) => {
  const rojo = L(t, EV["114"] - 0.15, EV["114"] + 0.4, 0, 11.4);
  const antes = L(t, EV.comisiones - 0.2, EV.comisiones + 0.4, 0, 1);
  const vRojo = antes > 0 ? 11.4 + (17.6 - 11.4) * antes : rojo;
  const comis = L(t, EV.perdieron - 0.3, EV.perdieron, 0, 1);
  const bracket = muelle(t, EV.siete - 0.05, 220, 13) * (1 - antes);
  const casi = muelle(t, EV.mismo - 0.1, 220, 12);
  const x1 = 330;
  const x2 = 750;
  const notis = [0, 1, 2, 3, 4, 5].map((i) => ({ t0: EV.perdieron + i * 0.32, titulo: `Operación nº ${38 + i * 7}`, texto: "Comisión cobrada", color: ROJO, letra: "−" }));
  return (
    <>
      <AbsoluteFill style={{ opacity: 1 - 0.8 * comis, filter: comis > 0.01 ? `blur(${10 * comis}px)` : undefined }}>
        <Foco x={540} y={BASE + 10} w={900} h={120} o={0.1} />
        <div style={{ position: "absolute", left: 120, right: 120, top: BASE, height: 4, background: "rgba(255,255,255,0.6)" }} />
        <Columna x={x1} v={18.5} color={VERDE} etiqueta="CASI NO OPERABAN" o={L(t, s - 0.1, s + 0.2, 0, 1)} />
        {t >= EV["114"] - 0.15 && <Columna x={x2} v={vRojo} color={antes > 0.5 ? "#fff" : ROJO} etiqueta="LOS QUE MÁS OPERABAN" />}
        {bracket > 0.01 && (
          <div style={{ position: "absolute", left: x2 - 90, top: BASE - 18.5 * ESC - 6, transform: `scale(${0.5 + 0.5 * min1(bracket, 1.1)})`, opacity: min1(bracket * 2), transformOrigin: "50% 0%" }}>
            <div style={{ width: 180, height: (18.5 - 11.4) * ESC - 110, borderTop: `4px dashed ${ROJO}`, borderBottom: `4px dashed ${ROJO}` }} />
            <div style={{ position: "absolute", left: -10, top: 10, ...mono(40), fontWeight: 800, color: ROJO, textAlign: "center", width: 200 }}>−7<br />{t > EV.cada - 0.1 ? "CADA AÑO" : "PUNTOS"}</div>
          </div>
        )}
        <Rotulito t={t} t0={EV.comisiones - 0.15} texto="ANTES DE COMISIONES" top={350} fin={EV.perdieron - 0.3} />
        {casi > 0.01 && <div style={{ position: "absolute", left: 0, width: ANCHO, top: 560, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 200, color: "#fff", transform: `scale(${0.5 + 0.5 * min1(casi, 1.1)})`, opacity: min1(casi * 2) * (1 - comis) }}>≈</div>}
      </AbsoluteFill>
      {comis > 0 && <Notis t={t} items={notis} top={380} />}
      <Sello t={t} t0={EV.listos - 0.1} texto="EXCESO DE CONFIANZA" top={1190} color={ROJO} size={66} />
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: la regla · máximo de operaciones · y cierra
const Giro: React.FC<P> = ({ t }) => {
  const luz = L(t, EV.regla - 0.05, EV.regla + 0.2, 0, 1);
  const huecos = L(t, EV.maximo - 0.3, EV.maximo, 0, 1);
  const apaga = L(t, EV.cierra - 0.05, EV.cierra + 0.2, 0, 1, (u) => u);
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={360} />
      <AbsoluteFill style={{ transform: `scaleY(${1 - 0.985 * apaga}) scaleX(${1 - 0.3 * Math.max(0, apaga - 0.6)})`, filter: apaga > 0.01 ? `brightness(${1 + 3 * apaga})` : undefined, opacity: 1 - L(t, EV.cierra + 0.2, EV.cierra + 0.3, 0, 1) }}>
        <AbsoluteFill style={{ opacity: 1 - 0.85 * huecos }}>
          <Bombilla x={540} y={830} luz={luz} />
          <Orbita t={t} t0={EV.regla + 0.05} x={540} y={830} r={330} simbolos={["1", "2", "3", "✓", "×", "€"]} colores={["#fff", "#fff", "#fff", VERDE, ROJO, "#fff"]} />
        </AbsoluteFill>
        {huecos > 0.01 && (
          <>
            <div style={{ position: "absolute", left: 0, width: ANCHO, top: 560, textAlign: "center", ...mono(48), fontWeight: 800, letterSpacing: "0.14em", opacity: huecos }}>MÁXIMO DEL DÍA</div>
            {[0, 1, 2].map((i) => {
              const t0 = EV.dia - 0.1 + i * 0.22;
              const lleno = t >= t0;
              return (
                <div key={i} style={{ position: "absolute", left: 160 + i * 270 - 10, top: 700, width: 220, height: 260, borderRadius: 30, border: `5px solid ${lleno ? VERDE : "rgba(255,255,255,0.5)"}`, background: lleno ? "rgba(47,224,138,0.12)" : "#000", boxShadow: lleno ? `0 0 30px ${VERDE}66` : undefined, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 130, color: lleno ? VERDE : "rgba(255,255,255,0.4)", opacity: huecos }}>
                  {i + 1}
                  <Marca t={t} t0={t0} x={190} y={30} size={90} color={VERDE} tipo="ok" />
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 270, top: 1060, width: 540, height: 130, borderRadius: 65, border: `5px solid ${ROJO}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 60, color: ROJO, opacity: L(t, EV.llegues - 0.2, EV.llegues, 0, 1), boxShadow: `0 0 40px ${ROJO}55` }}>CERRAR APP</div>
          </>
        )}
      </AbsoluteFill>
      {apaga > 0 && apaga < 1 && <div style={{ position: "absolute", left: 0, right: 0, top: 958, height: 6, background: "#fff", boxShadow: "0 0 40px #fff", opacity: 1 - apaga * 0.5 }} />}
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["menos", ROJO], ["60000", VERDE], "reales", "estudio", "familias", "años", ["nada", VERDE], ["18", VERDE], "sígueme", ["operaban", ROJO], ["114", ROJO], ["siete", ROJO], "comisiones", "mismo", ["perdieron", ROJO], "listos", "regla", "máximo", ["cierra", VERDE], "llegado", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV.menos, ROJO], [EV["60000"]], [EV.estudio], [EV.familias], [EV.anos], [EV.tocaban], [EV["18"], VERDE], [EV["114"], ROJO], [EV.siete, ROJO], [EV.comisiones], [EV.mismo], [EV.perdieron, ROJO], [EV.listos, ROJO], [EV.regla], [EV.maximo], [EV.dia, VERDE], [EV.cierra, VERDE], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];
const Encima: React.FC<{ t: number }> = ({ t }) => (
  <MovilACamara t={t} t0={inicio("uno") - 0.5}>
    <PantallaPulsa t={t} />
  </MovilACamara>
);

const GANCHO = { lineas: ["Operar más", "te hace *ganar_menos*"], hasta: inicio("uno") - 0.05, color: ROJO };
export const Operarmas: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/operarmas_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} encima={Encima} />
);
