// Historia 5-30-10 «dopamina» "En el gráfico de ayer todo era obvio" (~36 s). Sin stickman: todo pasa en un gráfico de velas.
// Fotograma 0: la vela verde gigante creciendo y un círculo rojo que la marca; «¡ESTABA CLARÍSIMO!» / «¿CÓMO NO ENTRÉ?»;
// rebobinado a ayer: la vela a medias, niebla a la derecha y «NADIE LO VEÍA»; sesgo retrospectivo: el papel donde
// «NO LO SABÍA» se reescribe solo en «LO SABÍA»; la regla: una cartulina tapa la derecha, decides (ENTRO, STOP),
// lo apuntas y destapas. Cierre en el móvil. Tiempos en src/gen/ayer.json (scripts/ayer.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/ayer.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { Sello } from "../Bot/historia";
import { Foco } from "../Bot/ui2d";
import { Marca, Rotulito } from "../Bot/v3";
import { CierreMovil, Ficha3D, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const AYER_FPS = datos.fps;
export const AYER_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);

// ------------------------------------------------------------------ el gráfico de velas
const CIERRES = [100, 102, 99, 101, 98, 100, 97, 99, 98, 100, 99, 101, 100, 118, 121, 119, 124, 127, 125, 130];
const GRANDE = 13;
const X0 = 110;
const PASO = 45;
const xv = (i: number) => X0 + i * PASO;
const yv = (v: number) => 1260 - (v - 92) * 17;
type V = { o: number; c: number; h: number; l: number };
const VELAS: V[] = CIERRES.map((c, i) => {
  const o = i === 0 ? 99 : CIERRES[i - 1];
  const r = ((i * 7919) % 13) / 13;
  return { o, c, h: Math.max(o, c) + 0.8 + r * 1.6, l: Math.min(o, c) - 0.8 - (1 - r) * 1.6 };
});
const Vela: React.FC<{ i: number; v: V; k?: number; brillo?: number }> = ({ i, v, k = 1, brillo = 0 }) => {
  const c = v.o + (v.c - v.o) * k;
  const sube = c >= v.o;
  const col = sube ? VERDE : ROJO;
  const top = yv(Math.max(v.o, c));
  const alto = Math.max(4, Math.abs(yv(v.o) - yv(c)));
  const h = v.o + (v.h - v.o) * k;
  const l = v.o + (v.l - v.o) * k;
  return (
    <g style={{ filter: brillo > 0 ? `drop-shadow(0 0 ${18 * brillo}px ${col})` : undefined }}>
      <line x1={xv(i)} x2={xv(i)} y1={yv(Math.max(h, c, v.o))} y2={yv(Math.min(l, c, v.o))} stroke={col} strokeWidth={4} />
      <rect x={xv(i) - 14} y={top} width={28} height={alto} rx={3} fill={col} />
    </g>
  );
};
// Velas hasta «hasta» (la última, a medias si k < 1)
const Grafico: React.FC<{ hasta: number; k?: number; brillo?: number; o?: number }> = ({ hasta, k = 1, brillo = 0, o = 1 }) => (
  <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
    {[0, 1, 2, 3].map((j) => <line key={j} x1={80} x2={1000} y1={640 + j * 200} y2={640 + j * 200} stroke="rgba(255,255,255,0.07)" strokeWidth={2} />)}
    {VELAS.slice(0, hasta + 1).map((v, i) => <Vela key={i} i={i} v={v} k={i === hasta ? k : 1} brillo={i === GRANDE ? brillo : 0} />)}
  </svg>
);
// Círculo rojo dibujado a mano alrededor de la vela grande
const Circulo: React.FC<{ u: number }> = ({ u }) => (
  <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <ellipse cx={xv(GRANDE)} cy={(yv(118) + yv(100)) / 2} rx={60} ry={190} fill="none" stroke={ROJO} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - u} transform={`rotate(-8 ${xv(GRANDE)} ${(yv(118) + yv(100)) / 2})`} style={{ filter: `drop-shadow(0 0 10px ${ROJO})` }} />
  </svg>
);
const Bocata: React.FC<{ t: number; t0: number; x: number; y: number; texto: string; color: string; fin?: number }> = ({ t, t0, x, y, texto, color, fin }) => {
  const g = muelle(t, t0, 240, 13);
  const fuera = fin === undefined ? 0 : L(t, fin - 0.15, fin, 0, 1);
  if (g <= 0.01 || fuera >= 1) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${0.4 + 0.6 * min1(g, 1.1)})`, transformOrigin: "20% 100%", opacity: min1(g * 2) * (1 - fuera) }}>
      <div style={{ ...mono(42), fontWeight: 800, color, padding: "18px 28px", borderRadius: 26, border: `4px solid ${color}`, background: "#000", whiteSpace: "nowrap", boxShadow: `0 0 30px ${color}44` }}>{texto}</div>
      <svg width={60} height={40} style={{ position: "absolute", left: 60, top: "100%", marginTop: -4 }}><path d="M0 0 L20 36 L44 0" fill="#000" stroke={color} strokeWidth={4} /></svg>
    </div>
  );
};

// ------------------------------------------------------------------ 1. Hook: la vela gigante crece y el círculo rojo la marca
const Hook: React.FC<P> = ({ t }) => {
  const k = L(t, 0, 0.7, 0.15, 1, (u) => 1 - Math.pow(1 - u, 3));
  const brillo = 0.6 + 0.4 * Math.sin(t * 6);
  const apaga = L(t, EV.aprendes - 0.2, EV.aprendes + 0.1, 1, 0.35);
  return (
    <>
      <AbsoluteFill style={{ opacity: apaga }}>
        <Grafico hasta={GRANDE} k={k} brillo={brillo} />
        <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
          {VELAS.slice(GRANDE + 1).map((v, j) => <Vela key={j} i={GRANDE + 1 + j} v={v} k={L(t, 0.4 + j * 0.06, 0.6 + j * 0.06, 0, 1)} />)}
        </svg>
        <Circulo u={L(t, EV.obvio - 0.35, EV.obvio + 0.1, 0, 1, (u) => u)} />
      </AbsoluteFill>
      <Sello t={t} t0={EV.aprendes - 0.1} texto="NO APRENDES NADA" top={820} color={ROJO} size={66} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: «¡clarísimo!» · rebobinado a ayer: la vela a medias y niebla · NADIE LO VEÍA
const Uno: React.FC<P> = ({ t, s }) => {
  const rebob = t >= EV.pero - 0.05;
  const scan = L(t, EV.pero - 0.05, EV.pero + 0.35, 1, 0);
  const k = rebob ? 0.45 + 0.35 * Math.sin((t - EV.pero) * 4.2) : 1;
  const niebla = L(t, EV.pero + 0.1, EV.medias - 0.2, 0, 1);
  const anillo = muelle(t, EV.vela - 0.15, 200, 12);
  return (
    <>
      {!rebob ? (
        <>
          <Grafico hasta={19} brillo={0.8 + 0.2 * Math.sin(t * 6)} />
          <Foco x={xv(GRANDE)} y={(yv(118) + yv(100)) / 2} w={300} h={520} o={0.12 * min1(anillo)} />
          <Circulo u={1} />
          <svg width={140} height={180} style={{ position: "absolute", left: xv(GRANDE) + 60, top: yv(118) - 40 - 40 * L(t, EV.subio - 0.1, EV.subio + 0.4, 0, 1), opacity: L(t, EV.subio - 0.1, EV.subio + 0.2, 0, 1) }}>
            <path d="M70 10 L120 80 L88 80 L88 170 L52 170 L52 80 L20 80 Z" fill={VERDE} style={{ filter: `drop-shadow(0 0 14px ${VERDE})` }} />
          </svg>
          <Bocata t={t} t0={EV.clarisimo - 0.25} x={80} y={420} texto="«¡ESTABA CLARÍSIMO!»" color={ORO} fin={EV.pero - 0.05} />
          <Bocata t={t} t0={EV.entre - 0.35} x={160} y={1275} texto="«¿CÓMO NO ENTRÉ?»" color="#fff" fin={EV.pero - 0.05} />
        </>
      ) : (
        <>
          <Grafico hasta={GRANDE} k={k} />
          <div style={{ position: "absolute", left: xv(GRANDE) + 34, top: 460, width: ANCHO - xv(GRANDE) - 34, height: 820, background: "linear-gradient(90deg, rgba(20,20,26,0) 0%, rgba(40,40,52,0.95) 22%, rgba(40,40,52,0.98) 100%)", opacity: niebla, backdropFilter: "blur(10px)" }} />
          <div style={{ position: "absolute", left: xv(GRANDE) + 60, width: ANCHO - xv(GRANDE) - 80, top: 640, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 260, color: "rgba(255,255,255,0.85)", opacity: niebla, transform: `scale(${1 + 0.06 * Math.sin(t * 5)})` }}>?</div>
          <div style={{ position: "absolute", left: 90, top: 470, ...mono(40), fontWeight: 800, color: "#fff", padding: "8px 18px", border: "3px solid #fff", borderRadius: 10, background: "#000", opacity: L(t, EV.pero - 0.05, EV.pero + 0.1, 0, 1) }}>◀◀ AYER · 10:42</div>
          <div style={{ position: "absolute", left: 90, top: 560, ...mono(32), fontWeight: 800, color: ORO, opacity: L(t, EV.medias - 0.3, EV.medias, 0, 1) }}>¿SUBE O BAJA?</div>
          <Marca t={t} t0={EV.veias - 0.15} x={xv(GRANDE) - 150} y={760} size={130} color={ROJO} tipo="no" />
          <Sello t={t} t0={EV.nadie - 0.1} texto="NADIE LO VEÍA" top={1250} color={ROJO} size={72} />
          {scan > 0 && <AbsoluteFill style={{ background: `repeating-linear-gradient(0deg, rgba(255,255,255,${0.12 * scan}) 0px, rgba(255,255,255,${0.12 * scan}) 3px, transparent 3px, transparent 9px)`, transform: `translateX(${(1 - scan) * -40}px)` }} />}
        </>
      )}
      {t < s + 0.3 && <Circulo u={1} />}
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

// ------------------------------------------------------------------ 4. Dos: SESGO RETROSPECTIVO · el papel que se reescribe solo · ENTRENAS CON TRAMPAS
const Dos: React.FC<P> = ({ t, s }) => {
  const papel = muelle(t, EV.final - 0.2, 200, 14);
  const raya = L(t, EV.reescribe - 0.05, EV.reescribe + 0.35, 0, 1, (u) => u);
  const no = 1 - L(t, EV.reescribe + 0.35, EV.reescribe + 0.6, 0, 1);
  const sabia = L(t, EV.sabias - 0.2, EV.sabias + 0.1, 0, 1);
  const lapizX = 300 + 140 * raya;
  return (
    <>
      <Rotulito t={t} t0={s + 0.02} texto="SE LLAMA" top={360} fin={EV.final - 0.1} />
      <Ficha3D t={t} t0={EV.sesgo - 0.1} texto="SESGO" y={600} size={150} color={ORO} fin={EV.final - 0.1} />
      <Ficha3D t={t} t0={EV.sesgo + 0.3} texto="RETROSPECTIVO" y={790} size={84} color={ORO} fin={EV.final - 0.1} />
      {papel > 0.01 && (
        <div style={{ position: "absolute", left: 140, top: 470, width: 800, height: 700, borderRadius: 18, background: "#f4efe3", transform: `rotate(-2deg) scale(${0.6 + 0.4 * min1(papel, 1.06)})`, opacity: min1(papel * 2), boxShadow: "0 30px 80px rgba(0,0,0,0.8)", overflow: "hidden" }}>
          {Array.from({ length: 11 }, (_, j) => <div key={j} style={{ position: "absolute", left: 0, right: 0, top: 120 + j * 54, height: 2, background: "rgba(60,100,200,0.25)" }} />)}
          <div style={{ position: "absolute", left: 90, top: 0, bottom: 0, width: 3, background: "rgba(220,60,60,0.45)" }} />
          <div style={{ position: "absolute", left: 120, top: 50, ...mono(30), fontWeight: 800, color: "#333" }}>AYER, ANTES DE LA VELA:</div>
          <div style={{ position: "absolute", left: 120, top: 210, display: "flex", gap: 26, fontFamily: SANS, fontWeight: 800, fontSize: 104, color: "#111" }}>
            <span style={{ opacity: no, position: "relative" }}>
              NO
              <span style={{ position: "absolute", left: -10, top: "52%", height: 12, width: `${120 * raya}%`, background: ROJO, borderRadius: 6, transform: "rotate(-6deg)" }} />
            </span>
            <span>LO SABÍA</span>
          </div>
          <div style={{ position: "absolute", left: 120, top: 400, ...mono(34), fontWeight: 800, color: ROJO, opacity: L(t, EV.reescribe - 0.2, EV.reescribe, 0, 1) }}>TU CABEZA LO REESCRIBE</div>
          <div style={{ position: "absolute", left: 120, top: 470, display: "flex", alignItems: "center", gap: 20, opacity: sabia }}>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, color: "#0a8a4a" }}>«YO LO SABÍA»</span>
          </div>
          {raya > 0 && raya < 1 && (
            <svg width={60} height={200} style={{ position: "absolute", left: lapizX, top: 150, transform: "rotate(35deg)" }}>
              <rect x={18} y={0} width={24} height={150} rx={4} fill={ORO} stroke="#000" strokeWidth={3} />
              <path d="M18 150 L30 190 L42 150 Z" fill="#e8c79a" stroke="#000" strokeWidth={3} />
            </svg>
          )}
        </div>
      )}
      <Sello t={t} t0={EV.trampas - 0.1} texto="ENTRENAS CON TRAMPAS" top={1250} color={ROJO} size={62} />
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: la cartulina tapa la derecha · decides · lo apuntas · destapas
const CARTA_X = xv(10) - 22;
const STOP_V = 95.5;
const Giro: React.FC<P> = ({ t }) => {
  const entra = L(t, EV.tapa - 0.15, EV.tapa + 0.25, 0, 1, (u) => 1 - Math.pow(1 - u, 3));
  const sale = L(t, EV.destapa - 0.1, EV.destapa + 0.2, 0, 1, (u) => u * u);
  const x = CARTA_X + (1 - entra) * 700 + sale * 700;
  const stop = L(t, EV.stop - 0.35, EV.stop, 0, 1, (u) => u);
  const linea = (txt: string, t0: number, top: number, color = "#fff") => (
    <div style={{ position: "absolute", left: 34, top, ...mono(48), fontWeight: 800, color, opacity: L(t, t0 - 0.15, t0 + 0.05, 0, 1), transform: `translateX(${(1 - L(t, t0 - 0.15, t0 + 0.05, 0, 1)) * 30}px)` }}>{txt}</div>
  );
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={360} />
      <Grafico hasta={19} />
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={X0 - 30} x2={X0 - 30 + (1010 - X0) * stop} y1={yv(STOP_V)} y2={yv(STOP_V)} stroke={ROJO} strokeWidth={6} strokeDasharray="18 12" style={{ filter: `drop-shadow(0 0 8px ${ROJO})` }} />
      </svg>
      {stop > 0.5 && <div style={{ position: "absolute", left: X0 - 20, top: yv(STOP_V) + 14, ...mono(30), fontWeight: 800, color: ROJO }}>STOP</div>}
      {sale < 1 && (
        <div style={{ position: "absolute", left: x, top: 470, width: ANCHO - CARTA_X + 10, height: 780, borderRadius: "22px 0 0 22px", background: "#0b0b0b", border: `5px solid ${ORO}`, borderRight: "none", boxShadow: "-30px 0 60px rgba(0,0,0,0.9)", overflow: "hidden" }}>
          <AbsoluteFill style={{ background: `repeating-linear-gradient(45deg, rgba(245,196,81,0.07) 0px, rgba(245,196,81,0.07) 22px, transparent 22px, transparent 44px)` }} />
          <div style={{ position: "absolute", left: 34, top: 40, ...mono(46), fontWeight: 800, color: ORO, letterSpacing: "0.1em" }}>TAPADO</div>
          {linea("DECIDE:", EV.decide, 200)}
          {linea("ENTRO → SÍ", EV.entro, 300, VERDE)}
          {linea("STOP → AHÍ", EV.stop - 0.1, 400, ROJO)}
          {t > EV.apuntalo - 0.1 && (
            <div style={{ position: "absolute", left: 30, top: 540, ...mono(48), fontWeight: 800, color: "#fff", padding: "8px 22px", border: "5px solid #fff", borderRadius: 10, transform: `rotate(-7deg) scale(${2 - min1(muelle(t, EV.apuntalo - 0.1, 260, 11), 1.1)})`, opacity: min1(muelle(t, EV.apuntalo - 0.1, 260, 11) * 1.5) }}>APUNTADO</div>
          )}
        </div>
      )}
      <Marca t={t} t0={EV.destapa + 0.05} x={xv(17)} y={yv(130) - 90} size={110} color={VERDE} tipo="ok" />
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["obvio", ORO], ["nada", ROJO], "vela", ["clarísimo", ORO], "entré", "medias", ["veías", ROJO], ["nadie", ROJO], "sígueme", ["sesgo", ORO], ["retrospectivo", ORO], "final", ["reescribe", ROJO], ["sabías", VERDE], ["trampas", ROJO], "regla", ["tapa", ORO], "derecha", "decide", ["stop", ROJO], "apúntalo", ["destapa", VERDE], "llegado", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV.obvio, ORO], [EV.aprendes, ROJO], [EV.vela, VERDE], [EV.clarisimo, ORO], [EV.entre], [EV.pero], [EV.medias], [EV.veias, ROJO], [EV.nadie, ROJO], [EV.sesgo, ORO], [EV.final], [EV.reescribe, ROJO], [EV.sabias, VERDE], [EV.trampas, ROJO], [EV.regla], [EV.tapa, ORO], [EV.decide], [EV.entro, VERDE], [EV.stop, ROJO], [EV.apuntalo], [EV.destapa, VERDE], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["En el gráfico de ayer", "todo era *obvio*"], hasta: inicio("uno") - 0.05, color: ORO };
export const Ayer: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/ayer_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
