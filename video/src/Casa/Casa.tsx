// Reel 5-30-10 «dopamina» "Tu día más peligroso es cuando ganas mucho" (~36 s): el efecto dinero de la casa (Thaler y
// Johnson, 1990). Fotograma 0 en plena acción: el saldo del día subiendo como un cohete con una luz de alarma roja girando;
// el móvil que se lanza a cámara; notificaciones de operaciones cerradas en verde y la ficha 3D de +400 €; la cabeza que
// deja de sentirlo suyo; la ruleta del casino y las fichas que se apuestan; la tarjeta del estudio; ×2, la vela mala y el
// saldo que se da la vuelta; la regla (objetivo del día → cerrar; si sigues, ×½, nunca ×2) y el cierre en el móvil.
// Tiempos en src/gen/casa.json (scripts/casa.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/casa.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { CamaraTiembla } from "../Bot/historia";
import { Foco } from "../Bot/ui2d";
import { Boton, Marca, pulsa, Rotulito } from "../Bot/v3";
import { AppBroker, CierreMovil, Ficha3D, Movil, MovilACamara, Notis, Prueba, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const CASA_FPS = datos.fps;
export const CASA_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);
const sal = (u: number) => 1 - Math.pow(1 - u, 3);

// ------------------------------------------------------------------ 1. Hook: el saldo sube como un cohete y suena la alarma
const sube = (t: number) => {
  const n = Math.max(3, Math.min(42, Math.floor(5 + t * 12)));
  return Array.from({ length: n }, (_, i) => i * 4 + Math.sin(i * 1.3) * 5 + (i > 20 ? (i - 20) * 3 : 0));
};
const PantallaSube: React.FC<{ t: number }> = ({ t }) => {
  const v = 400 * sal(L(t, -0.4, EV.mucho, 0, 1, (u) => u));
  return <AppBroker t={t} pnl={v} serie={sube(t)} color={VERDE} />;
};
const Alarma: React.FC<{ t: number; o?: number }> = ({ t, o = 1 }) => (
  <div style={{ position: "absolute", left: 540 - 1100, top: 900 - 1100, width: 2200, height: 2200, borderRadius: "50%", background: `conic-gradient(from ${t * 260}deg, rgba(255,77,94,0.32) 0deg, rgba(255,77,94,0) 40deg, rgba(255,77,94,0) 180deg, rgba(255,77,94,0.32) 180deg, rgba(255,77,94,0) 220deg, rgba(255,77,94,0) 360deg)`, opacity: o }} />
);
const Hook: React.FC<P> = ({ t }) => {
  const golpe = muelle(t, EV.mucho - 0.05, 240, 12);
  return (
    <>
      <Alarma t={t} o={0.8 + 0.2 * Math.sin(t * 12)} />
      <Movil x={540} y={1010} s={0.84 * (1 + 0.04 * Math.max(0, 1 - Math.abs(golpe - 1) * 3))} rotY={6 * Math.sin(t * 1.6)} rotX={4}>
        <PantallaSube t={t} />
      </Movil>
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: +400 € · la cabeza deja de sentirlo suyo · la ruleta del casino
const Cabeza: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const vuela = L(t, EV.tuyo - 0.7, EV.tuyo + 0.3, 0, 1);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={560} height={640} viewBox="0 0 230 260" style={{ position: "absolute", left: 250, top: 560, overflow: "visible", filter: "drop-shadow(0 0 20px rgba(255,255,255,0.25))" }}>
        <path d="M70 255 V205 C35 195 22 160 24 125 C27 60 75 18 128 20 C180 22 212 68 207 118 L224 156 L205 163 C207 184 197 200 172 202 L154 204 V255" fill="#050505" stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left: 360 + 380 * sal(vuela), top: 820 - 260 * sal(vuela), fontFamily: SANS, fontWeight: 800, fontSize: 110, letterSpacing: "-0.03em", color: vuela > 0.4 ? "rgba(255,255,255,0.55)" : VERDE, transform: `rotate(${20 * vuela}deg) scale(${1 - 0.3 * vuela})`, textShadow: vuela < 0.4 ? `0 0 30px ${VERDE}88` : undefined }}>400 €</div>
    </div>
  );
};
const Ruleta: React.FC<{ t: number; x: number; y: number; r: number }> = ({ t, x, y, r }) => {
  const n = 37;
  const giro = t * 70;
  return (
    <svg width={r * 2 + 40} height={r * 2 + 40} style={{ position: "absolute", left: x - r - 20, top: y - r - 20, overflow: "visible", transform: "perspective(1400px) rotateX(55deg)" }}>
      <g transform={`translate(${r + 20} ${r + 20})`}>
        <circle r={r} fill="#060606" stroke="#fff" strokeWidth={6} />
        <g transform={`rotate(${giro})`}>
          {Array.from({ length: n }, (_, i) => {
            const a0 = (i / n) * Math.PI * 2;
            const a1 = ((i + 1) / n) * Math.PI * 2;
            const r0 = r * 0.62;
            const r1 = r * 0.92;
            const d = `M${r0 * Math.cos(a0)} ${r0 * Math.sin(a0)} L${r1 * Math.cos(a0)} ${r1 * Math.sin(a0)} A${r1} ${r1} 0 0 1 ${r1 * Math.cos(a1)} ${r1 * Math.sin(a1)} L${r0 * Math.cos(a1)} ${r0 * Math.sin(a1)} Z`;
            return <path key={i} d={d} fill={i === 0 ? VERDE : i % 2 ? ROJO : "#000"} fillOpacity={i % 2 || i === 0 ? 0.75 : 1} stroke="#fff" strokeWidth={1.5} />;
          })}
          <circle r={r * 0.6} fill="#0a0a0a" stroke="#fff" strokeWidth={4} />
          {[0, 1, 2, 3].map((k) => (
            <line key={k} x1={0} y1={0} x2={r * 0.5 * Math.cos((k * Math.PI) / 2)} y2={r * 0.5 * Math.sin((k * Math.PI) / 2)} stroke={ORO} strokeWidth={6} strokeLinecap="round" />
          ))}
        </g>
        <circle cx={r * 0.97 * Math.cos(-t * 4)} cy={r * 0.97 * Math.sin(-t * 4)} r={12} fill="#fff" style={{ filter: "drop-shadow(0 0 8px #fff)" }} />
      </g>
    </svg>
  );
};
const Fichas: React.FC<{ x: number; y: number; n: number; color: string }> = ({ x, y, n, color }) => (
  <svg width={220} height={80 + n * 16} style={{ position: "absolute", left: x - 110, top: y - n * 16, overflow: "visible" }}>
    {Array.from({ length: n }, (_, i) => (
      <g key={i} transform={`translate(110 ${40 + (n - 1 - i) * 16})`}>
        <ellipse rx={92} ry={32} fill="#000" stroke={color} strokeWidth={5} />
        <ellipse rx={92} ry={32} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="18 22" opacity={0.7} />
      </g>
    ))}
  </svg>
);
const Uno: React.FC<P> = ({ t }) => {
  const notis = [
    { t0: inicio("uno") + 0.05, titulo: "Operación cerrada", texto: "+120,00 €" },
    { t0: inicio("uno") + 0.3, titulo: "Operación cerrada", texto: "+95,00 €" },
    { t0: EV["400"] - 0.1, titulo: "Operación cerrada", texto: "+185,00 €" },
  ];
  const fase1 = 1 - L(t, EV.cabeza - 0.3, EV.cabeza - 0.05, 0, 1);
  const cabeza = L(t, EV.cabeza - 0.2, EV.cabeza + 0.05, 0, 1) * (1 - L(t, EV.casino - 0.35, EV.casino - 0.1, 0, 1));
  const casino = L(t, EV.casino - 0.25, EV.casino, 0, 1);
  const apuesta = L(t, EV.apuesta - 0.1, EV.apuesta + 0.4, 0, 1, sal);
  return (
    <>
      {fase1 > 0.01 && (
        <AbsoluteFill style={{ opacity: fase1 }}>
          <Notis t={t} items={notis} top={380} />
          <Ficha3D t={t} t0={EV["400"] - 0.05} texto="+400 €" y={1110} size={190} color={VERDE} sub="HOY POR LA MAÑANA" />
        </AbsoluteFill>
      )}
      {cabeza > 0.01 && <Cabeza t={t} o={cabeza} />}
      {casino > 0.01 && (
        <AbsoluteFill style={{ opacity: casino }}>
          <Foco x={540} y={980} w={1000} h={500} o={0.1} color="245,196,81" />
          <Ruleta t={t} x={540} y={820} r={360} />
          <Fichas x={540 - 300 * apuesta + 0} y={1250 - 330 * apuesta} n={5} color={VERDE} />
          <Fichas x={540 + 260 * (1 - apuesta)} y={1250 - 330 * apuesta} n={7} color={VERDE} />
          <div style={{ position: "absolute", left: 0, width: ANCHO, top: 1290, textAlign: "center", ...mono(46), fontWeight: 800, color: ORO, letterSpacing: "0.16em", opacity: L(t, EV.apuesta - 0.1, EV.apuesta + 0.1, 0, 1) }}>TODO AL ROJO</div>
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

// ------------------------------------------------------------------ 4. Dos: el estudio · ×2 · la operación mala · devuelves los 400 y algo más
const serieDos = (t: number) => {
  const base = Array.from({ length: 30 }, (_, i) => i * 4 + Math.sin(i * 1.3) * 5);
  const cae = L(t, EV.mala - 0.1, EV.algo + 0.3, 0, 1, (u) => u);
  const extra = Math.floor(cae * 14);
  for (let k = 1; k <= extra; k++) base.push(base[29] - k * 11 + Math.sin(k) * 4);
  return base;
};
const Dos: React.FC<P> = ({ t }) => {
  const movil = L(t, EV.doblas - 0.45, EV.doblas - 0.15, 0, 1);
  const pnl = 400 - 460 * sal(L(t, EV.devuelves - 0.1, EV.algo + 0.35, 0, 1, (u) => u));
  return (
    <>
      <Prueba t={t} t0={EV.efecto - 0.2} x={540} y={820} cabecera="MANAGEMENT SCIENCE · 1990" titulo="«Gambling with the House Money and Trying to Break Even»" pie="Thaler y Johnson" fin={EV.doblas - 0.3} />
      <Ficha3D t={t} t0={EV["1990"] - 0.05} texto="1990" y={1230} size={150} fin={EV.doblas - 0.3} />
      {movil > 0.01 && (
        <CamaraTiembla t={t} t0={EV.mala - 0.05} a={0.03}>
          <AbsoluteFill style={{ opacity: movil }}>
            <Movil x={540} y={1030} s={0.8} rotY={-6} rotX={4}>
              <AppBroker t={t} pnl={pnl} serie={serieDos(t)} color={pnl >= 0 ? VERDE : ROJO} titulo="Hoy · tamaño ×2" />
            </Movil>
          </AbsoluteFill>
          <Ficha3D t={t} t0={EV.doblas - 0.05} texto="×2" x={860} y={560} size={150} color={ROJO} sub="TAMAÑO" />
        </CamaraTiembla>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: objetivo del día → cerrar · si sigues, ×½, nunca ×2
const Giro: React.FC<P> = ({ t }) => {
  const llena = L(t, EV.regla, EV.objetivo + 0.3, 0.1, 1, sal);
  const objetivo = 1 - L(t, EV.sigues - 0.35, EV.sigues - 0.1, 0, 1);
  const W = 840;
  const colorBarra = llena < 0.4 ? ROJO : llena < 0.85 ? ORO : VERDE;
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={360} fin={EV.sigues - 0.1} />
      {objetivo > 0.01 && (
        <AbsoluteFill style={{ opacity: objetivo }}>
          <div style={{ position: "absolute", left: 120, top: 640, ...mono(44), fontWeight: 800, letterSpacing: "0.12em" }}>OBJETIVO DEL DÍA</div>
          <div style={{ position: "absolute", left: 120, top: 720, width: W, height: 70, borderRadius: 35, background: "rgba(255,255,255,0.12)", overflow: "hidden", border: "3px solid rgba(255,255,255,0.4)" }}>
            <div style={{ width: `${llena * 100}%`, height: "100%", borderRadius: 35, background: colorBarra, boxShadow: `0 0 40px ${colorBarra}` }} />
          </div>
          <Marca t={t} t0={EV.objetivo + 0.25} x={120 + W} y={755} size={130} color={VERDE} tipo="ok" />
          {t > EV.cierras - 0.4 && <Boton x={540} y={1060} w={560} h={180} texto="CERRAR" color={VERDE} lleno={0.9} k={pulsa(t, EV.cierras)} o={L(t, EV.cierras - 0.4, EV.cierras - 0.2, 0, 1)} />}
        </AbsoluteFill>
      )}
      <Rotulito t={t} t0={EV.sigues - 0.1} texto="SI SIGUES…" top={360} />
      <Ficha3D t={t} t0={EV.mitad - 0.05} texto="×½" x={330} y={850} size={210} color={VERDE} sub="SÍ" />
      <Marca t={t} t0={EV.mitad + 0.15} x={330} y={1080} size={120} color={VERDE} tipo="ok" />
      <Ficha3D t={t} t0={EV.doble - 0.05} texto="×2" x={750} y={850} size={210} color={ROJO} sub="NUNCA" giro={-1} />
      <Marca t={t} t0={EV.doble + 0.1} x={750} y={1080} size={120} color={ROJO} tipo="no" />
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["peligroso", ROJO], ["pierdes", ROJO], ["ganas", VERDE], ["mucho", VERDE], ["400", VERDE], "cabeza", "tuyo", ["casino", ORO], ["apuesta", ROJO], "sígueme", "efecto", "casa", "1990", ["doblas", ROJO], ["mala", ROJO], ["devuelves", ROJO], "regla", "objetivo", ["cierras", VERDE], ["mitad", VERDE], ["doble", ROJO], "llegado", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02, ROJO], [EV.pierdes], [EV.mucho, VERDE], [EV["400"], VERDE], [EV.manana], [EV.cabeza], [EV.tuyo], [EV.casino, ORO], [EV.apuesta, ROJO], [EV.efecto], [EV["1990"]], [EV.doblas, ROJO], [EV.mala, ROJO], [EV.devuelves, ROJO], [EV.algo, ROJO], [EV.regla], [EV.objetivo, VERDE], [EV.cierras, VERDE], [EV.sigues], [EV.mitad, VERDE], [EV.doble, ROJO], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];
const Encima: React.FC<{ t: number }> = ({ t }) => (
  <MovilACamara t={t} t0={inicio("uno") - 0.42} dura={0.45}>
    <PantallaSube t={t} />
  </MovilACamara>
);

const GANCHO = { lineas: ["Tu día más peligroso:", "cuando *ganas_mucho*"], hasta: inicio("uno") - 0.05, color: VERDE };
export const Casa: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/casa_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} encima={Encima} />
);
