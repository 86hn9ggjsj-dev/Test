// Historia 5-30-10 «dopamina» "Un 20 % al año, sin riesgo. En una semana, casi todo perdido" (~38 s). Sin stickman.
// Datos: Terra Luna, mayo de 2022: Anchor pagaba cerca de un 20 % al año por depositar UST (su moneda estable); UST
// perdió el dólar en días, LUNA cayó casi a cero y se evaporaron más de 40.000 millones. Fotograma 0: el letrero de neón
// «20 % AL AÑO · SIN RIESGO» que parpadea y se cae; la tarjeta y la gráfica de UST despegándose de 1 $; el contador
// −40.000 M $ que se evapora y la tubería con «???» al principio; la regla: ¿de dónde sale el dinero? y la diana sobre ti.
// Cierre en el móvil. Tiempos en src/gen/luna.json (scripts/luna.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/luna.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { Sello } from "../Bot/historia";
import { Foco } from "../Bot/ui2d";
import { Rotulito } from "../Bot/v3";
import { CierreMovil, Ficha3D, Prueba, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const LUNA_FPS = datos.fps;
export const LUNA_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);
const neon = (c: string, k = 1) => `0 0 ${8 * k}px ${c}, 0 0 ${22 * k}px ${c}, 0 0 ${48 * k}px ${c}aa`;
const parpadeo = (t: number) => (Math.sin(t * 93.7) * Math.sin(t * 41.3) > 0.25 ? 0.25 : 1);
const miles = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// ------------------------------------------------------------------ 1. Hook: el letrero de neón se enciende… parpadea y se cae
const Hook: React.FC<P> = ({ t }) => {
  const enciende = t < 0.5 ? parpadeo(t * 0.7) : 1;
  const tiembla = t > EV.semana - 0.1 && t < EV.perdido - 0.05 ? parpadeo(t) : 1;
  const cae = L(t, EV.perdido - 0.1, EV.perdido + 0.35, 0, 1, (u) => u * u);
  const apagado = cae > 0.2;
  const sin = L(t, EV.riesgo - 0.15, EV.riesgo, 0, 1);
  const col1 = apagado ? "#3a3a3a" : VERDE;
  const col2 = apagado ? "#3a3a3a" : ORO;
  return (
    <>
      <Foco x={540} y={760} w={1000} h={520} o={apagado ? 0.02 : 0.1 * enciende * tiembla} color="47,224,138" />
      <div style={{ position: "absolute", left: 90, top: 540, width: 900, height: 470, transform: `translateY(${150 * cae}px) rotate(${14 * cae}deg)`, transformOrigin: "10% 0%" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 36, border: `6px solid ${apagado ? "#333" : "#fff"}`, boxShadow: apagado ? "none" : neon("#ffffff", 0.5), opacity: enciende * tiembla }} />
        <div style={{ position: "absolute", left: 0, width: 900, top: 80, textAlign: "center", whiteSpace: "nowrap", fontFamily: SANS, fontWeight: 800, fontSize: 116, color: apagado ? "#2a2a2a" : "#eafff4", textShadow: apagado ? "none" : neon(col1, enciende * tiembla) }}>20 % AL AÑO</div>
        <div style={{ position: "absolute", left: 0, width: 900, top: 290, textAlign: "center", ...mono(84), fontWeight: 800, letterSpacing: "0.12em", color: apagado ? "#2a2a2a" : "#fff6dc", textShadow: apagado ? "none" : neon(col2, sin * tiembla), opacity: 0.25 + 0.75 * sin }}>SIN RIESGO</div>
      </div>
      {cae > 0 && cae < 1 && Array.from({ length: 10 }, (_, i) => {
        const u = L(t, EV.perdido - 0.05 + i * 0.02, EV.perdido + 0.45 + i * 0.02, 0, 1, (v) => v);
        return <div key={i} style={{ position: "absolute", left: 160 + i * 18 + 200 * u * Math.cos(i), top: 560 + 260 * u * u - 120 * u * Math.sin(i + 1), width: 12, height: 12, borderRadius: 6, background: ORO, boxShadow: `0 0 12px ${ORO}`, opacity: 1 - u }} />;
      })}
      <Sello t={t} t0={EV.perdido - 0.05} texto="CASI TODO PERDIDO" top={1180} color={ROJO} size={66} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: la tarjeta (mayo 2022) · UST se despega de 1 $ · LUNA ≈ 0
const UST: [number, number][] = [[0, 1], [0.4, 1], [0.5, 0.97], [0.6, 0.72], [0.67, 0.9], [0.8, 0.45], [0.88, 0.6], [1, 0.12]];
const vUst = (u: number) => {
  for (let i = 1; i < UST.length; i++) if (u <= UST[i][0]) { const [a, va] = UST[i - 1]; const [b, vb] = UST[i]; return va + ((vb - va) * (u - a)) / (b - a); }
  return UST[UST.length - 1][1];
};
const yU = (v: number) => 860 + (1 - v) * 470;
const Uno: React.FC<P> = ({ t }) => {
  const arriba = L(t, EV.estable - 0.4, EV.estable, 0, 1);
  const u = L(t, EV.estable - 0.1, EV.dolar + 0.7, 0, 1, (v) => v);
  const pts: string[] = [];
  for (let k = 0; k <= 200 * u; k++) {
    const v = k / 200;
    pts.push(`${140 + v * 800},${yU(vUst(v)) + (v < 0.4 ? 2 * Math.sin(v * 90) : 6 * Math.sin(v * 70))}`);
  }
  const roto = t > EV.dias;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${-250 * arriba}px) scale(${1 - 0.22 * arriba})`, transformOrigin: "540px 560px" }}>
        <Prueba t={t} t0={EV.mayo - 0.1} x={540} y={760} cabecera="TERRA LUNA · MAYO 2022" titulo="Casi un 20 % al año por guardar su moneda estable" pie="UST: siempre vale 1 $" color={VERDE} />
      </div>
      {u > 0 && (
        <>
          <div style={{ position: "absolute", left: 140, width: 800, top: yU(1) - 3, borderTop: "5px dashed rgba(255,255,255,0.45)" }} />
          <div style={{ position: "absolute", left: 140, top: yU(1) - 56, ...mono(32), fontWeight: 800, color: "rgba(255,255,255,0.8)" }}>UST · 1 $</div>
          <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
            {pts.length > 1 && <polyline points={pts.join(" ")} fill="none" stroke={roto ? ROJO : VERDE} strokeWidth={8} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 12px ${roto ? ROJO : VERDE})` }} />}
          </svg>
          <div style={{ position: "absolute", left: 520, top: 1250, ...mono(40), fontWeight: 800, color: ROJO, opacity: L(t, EV.dolar - 0.2, EV.dolar + 0.1, 0, 1) }}>YA NO VALE 1 $</div>
        </>
      )}
      <Ficha3D t={t} t0={EV.cero - 0.2} texto="LUNA ≈ 0 $" y={1060} size={120} color={ROJO} />
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

// ------------------------------------------------------------------ 4. Dos: −40.000 M $ evaporándose · la tubería: ¿de dónde salía el 20 %?
const Dos: React.FC<P> = ({ t, s }) => {
  const n = L(t, EV["40000"] - 0.3, EV.evaporados + 0.2, 0, 40000, (u) => 1 - Math.pow(1 - u, 3));
  const tubo = muelle(t, EV.nadie - 0.25, 200, 14);
  const gota = (k: number) => ((t - EV.nadie) * 1.3 + k / 3) % 1;
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: 470, textAlign: "center", ...mono(34), fontWeight: 800, color: "rgba(255,255,255,0.7)", opacity: L(t, s, s + 0.2, 0, 1) }}>MÁS DE</div>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: 520, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 124, color: ROJO, textShadow: `0 0 40px ${ROJO}66` }}>−{miles(n)} M $</div>
      {t > EV.evaporados - 0.4 && Array.from({ length: 22 }, (_, i) => {
        const u = (((t - EV.evaporados + 0.4) * 0.8 + i / 22) % 1 + 1) % 1;
        return <div key={i} style={{ position: "absolute", left: 160 + ((i * 137) % 760) + 20 * Math.sin(t * 3 + i), top: 520 - 260 * u, ...mono(34), fontWeight: 800, color: ROJO, opacity: (1 - u) * 0.8 }}>$</div>;
      })}
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: 680, textAlign: "center", ...mono(40), fontWeight: 800, color: "#fff", opacity: L(t, EV.evaporados - 0.2, EV.evaporados, 0, 1) }}>EVAPORADOS</div>
      {tubo > 0.01 && (
        <div style={{ position: "absolute", inset: 0, opacity: min1(tubo * 2), transform: `translateY(${(1 - min1(tubo)) * 60}px)` }}>
          <div style={{ position: "absolute", left: 90, top: 840, width: 250, height: 190, borderRadius: 24, border: "5px dashed rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 96, color: "#fff", transform: `scale(${1 + 0.05 * Math.sin(t * 8)})` }}>???</div>
          <div style={{ position: "absolute", left: 340, top: 910, width: 480, height: 50, background: "linear-gradient(180deg, #8a8a92, #4a4a52)", borderTop: "4px solid #bbb" }} />
          <div style={{ position: "absolute", left: 780, top: 910, width: 50, height: 170, background: "linear-gradient(90deg, #8a8a92, #4a4a52)" }} />
          {[0, 1, 2].map((k) => <div key={k} style={{ position: "absolute", left: 782, top: 1080 + 150 * gota(k), ...mono(34), fontWeight: 800, color: VERDE, opacity: 1 - gota(k) }}>%</div>)}
          <div style={{ position: "absolute", left: 0, width: ANCHO, top: 1190, textAlign: "center", ...mono(40), fontWeight: 800, color: ORO, opacity: L(t, EV.explicar - 0.2, EV.explicar, 0, 1) }}>¿DE DÓNDE SALÍA EL 20 %?</div>
        </div>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: mucho + sin riesgo → ¿de dónde sale el dinero? → el riesgo eres tú
const Giro: React.FC<P> = ({ t }) => {
  const cartel = muelle(t, EV.regla + 0.35, 220, 13);
  const preg = muelle(t, EV.pregunta - 0.2, 200, 12);
  const flujo = L(t, EV.sale - 0.2, EV.sale + 0.4, 0, 1);
  const diana = muelle(t, EV.eres - 0.2, 220, 11);
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={360} />
      {cartel > 0.01 && (
        <div style={{ position: "absolute", left: 0, width: ANCHO, top: 450, textAlign: "center", opacity: min1(cartel * 2), transform: `scale(${0.6 + 0.4 * min1(cartel, 1.06)})` }}>
          <span style={{ ...mono(50), fontWeight: 800, color: "#fff6dc", textShadow: neon(ORO, 0.8), padding: "10px 26px", border: "4px solid #fff", borderRadius: 18, boxShadow: neon("#ffffff", 0.3) }}>MUCHO + SIN RIESGO</span>
        </div>
      )}
      {preg > 0.01 && (
        <div style={{ position: "absolute", left: 110, top: 600, width: 860, height: 230, borderRadius: 30, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 76, lineHeight: 1.1, color: "#111", transform: `rotate(-2deg) scale(${0.5 + 0.5 * min1(preg, 1.08)})`, opacity: min1(preg * 2) }}>¿De dónde sale<br />el dinero?</div>
      )}
      {flujo > 0 && (
        <div style={{ position: "absolute", left: 0, width: ANCHO, top: 900, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, opacity: flujo }}>
          <span style={{ ...mono(40), fontWeight: 800, color: "#fff", padding: "12px 18px", border: "3px solid #fff", borderRadius: 14 }}>TU DINERO</span>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 50 }}>→</span>
          <span style={{ ...mono(48), fontWeight: 800, color: ROJO, padding: "10px 18px", border: `3px dashed ${ROJO}`, borderRadius: 14, transform: `scale(${1 + 0.08 * Math.sin(t * 9)})` }}>???</span>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 50 }}>→</span>
          <span style={{ ...mono(40), fontWeight: 800, color: VERDE, padding: "12px 18px", border: `3px solid ${VERDE}`, borderRadius: 14 }}>20 %</span>
        </div>
      )}
      {diana > 0.01 && (
        <div style={{ position: "absolute", left: 540 - 150, top: 1030, width: 300, height: 300, transform: `scale(${2.2 - 1.2 * min1(diana, 1.05)}) rotate(${(1 - min1(diana)) * 90}deg)`, opacity: min1(diana * 2) }}>
          <svg width={300} height={300} viewBox="0 0 300 300">
            <circle cx={150} cy={150} r={130} fill="none" stroke={ROJO} strokeWidth={8} />
            <circle cx={150} cy={150} r={80} fill="none" stroke={ROJO} strokeWidth={6} />
            <line x1={150} y1={0} x2={150} y2={300} stroke={ROJO} strokeWidth={5} />
            <line x1={0} y1={150} x2={300} y2={150} stroke={ROJO} strokeWidth={5} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 90, color: "#fff", textShadow: "0 0 20px #000" }}>TÚ</div>
        </div>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["20", VERDE], ["riesgo", ORO], ["semana", ROJO], ["perdido", ROJO], "mayo", "2022", "terra", "luna", ["estable", VERDE], "días", ["dólar", ROJO], ["cero", ROJO], "sígueme", "clave", ["40000", ROJO], ["evaporados", ROJO], "nadie", "explicar", "regla", "paga", ["pregunta", ORO], "sale", ["tú", ROJO], "llegado", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV["20"], VERDE], [EV.riesgo, ORO], [EV.semana], [EV.perdido, ROJO], [EV.mayo], [EV.ofrecia, VERDE], [EV.estable], [EV.dias, ROJO], [EV.dolar, ROJO], [EV.cero, ROJO], [EV["40000"], ROJO], [EV.evaporados, ROJO], [EV.nadie], [EV.explicar, ORO], [EV.regla], [EV.paga, ORO], [EV.pregunta], [EV.sale], [EV.eres, ROJO], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["Un 20 % al año, sin riesgo", "y en una semana, *casi_todo_perdido*"], hasta: inicio("uno") - 0.05, color: ROJO };
export const Luna: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/luna_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
