// Historia 5-30-10 «dopamina» "Pagó 27 millones por un seguro. Un mes después, cobró 2.600" (~38 s). Sin stickman.
// Datos: Bill Ackman (Pershing Square), 2020: unos 27 M $ en protección de crédito que vendió por unos 2.600 M $ el
// 23 de marzo (×96); el S&P 500 cayó un 34 % del 19 de febrero al 23 de marzo. Fotograma 0: la póliza de 27 M $
// que da la vuelta y es un cheque de 2.600 M $; la tarjeta y la bolsa hundiéndose; ×96; lo que haces tú: COMPRA y
// VENTA abiertas a la vez, la pérdida congelada y dos comisiones; la regla con el paraguas (antes ✓, ya mojado ✗) y
// CERRAR. Cierre en el móvil. Tiempos en src/gen/ackman.json (scripts/ackman.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/ackman.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { AZUL, ORO, ROJO, VERDE } from "../Bot/kit";
import { Sello } from "../Bot/historia";
import { Foco, Moneda } from "../Bot/ui2d";
import { Boton, Marca, pulsa, Rotulito, Ticket } from "../Bot/v3";
import { CierreMovil, Ficha3D, Prueba, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const ACKMAN_FPS = datos.fps;
export const ACKMAN_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);
const miles = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// ------------------------------------------------------------------ 1. Hook: la póliza de 27 M $ da la vuelta y es un cheque de 2.600 M $
const Hook: React.FC<P> = ({ t }) => {
  const ang = L(t, EV.cobro - 0.35, EV.cobro + 0.05, 0, 180, (u) => u * u * (3 - 2 * u));
  const dorso = ang > 90;
  const sx = Math.abs(Math.cos((ang * Math.PI) / 180));
  const cuenta = L(t, 0, EV["27"] + 0.5, 4000000, 27000000, (u) => 1 - Math.pow(1 - u, 3));
  const cheque = L(t, EV.cobro - 0.1, EV["2600"] + 0.6, 27, 2600, (u) => 1 - Math.pow(1 - u, 3));
  const color = dorso ? VERDE : ORO;
  const mes = muelle(t, EV.mes - 0.15, 230, 12);
  return (
    <>
      <Foco x={540} y={880} w={1000} h={600} o={dorso ? 0.12 : 0.06} color={dorso ? "47,224,138" : "245,196,81"} />
      <div style={{ position: "absolute", left: 110, top: 640, width: 860, height: 460, transform: `rotate(-3deg) scaleX(${0.02 + 0.98 * sx})`, borderRadius: 30, border: `5px solid ${color}`, background: dorso ? "#03140b" : "#120e04", boxShadow: `0 0 50px ${color}44, 0 30px 80px rgba(0,0,0,0.8)` }}>
        {!dorso ? (
          <>
            <div style={{ position: "absolute", left: 40, top: 34, ...mono(34), fontWeight: 800, color: ORO, letterSpacing: "0.1em" }}>PÓLIZA · PROTECCIÓN</div>
            <div style={{ position: "absolute", left: 40, top: 92, ...mono(26), fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>contra una caída del mercado</div>
            <div style={{ position: "absolute", left: 0, width: 860, top: 170, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 104, color: "#fff" }}>{miles(cuenta)} $</div>
            <div style={{ position: "absolute", left: 40, top: 330, ...mono(40), fontWeight: 800, color: ROJO, padding: "6px 18px", border: `4px solid ${ROJO}`, borderRadius: 10, transform: "rotate(-6deg)", opacity: L(t, EV.seguro - 0.2, EV.seguro, 0, 1) }}>PAGADO</div>
          </>
        ) : (
          <>
            <div style={{ position: "absolute", left: 40, top: 34, ...mono(34), fontWeight: 800, color: VERDE, letterSpacing: "0.1em" }}>COBRADO</div>
            <div style={{ position: "absolute", left: 0, width: 860, top: 150, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 92, color: VERDE, textShadow: `0 0 30px ${VERDE}88` }}>{miles(cheque * 1000000)} $</div>
            <div style={{ position: "absolute", left: 0, width: 860, top: 300, textAlign: "center", ...mono(34), fontWeight: 800, color: "#fff" }}>2.600 MILLONES</div>
          </>
        )}
      </div>
      {mes > 0.01 && (
        <div style={{ position: "absolute", left: 700, top: 500, width: 220, height: 130, borderRadius: 20, background: "#fff", color: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `rotate(6deg) scale(${0.4 + 0.6 * min1(mes, 1.1)})`, opacity: min1(mes * 2), boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
          <div style={{ ...mono(24), fontWeight: 800, color: ROJO }}>CALENDARIO</div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 54 }}>+1 MES</div>
        </div>
      )}
      {dorso && Array.from({ length: 8 }, (_, i) => (
        <Moneda key={i} t={t} t0={EV.cobro + i * 0.1} t1={EV.cobro + i * 0.1 + 0.8} a={[540, 1090]} b={[120 + i * 120, 1330]} size={64} color={VERDE} texto="$" />
      ))}
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: la tarjeta (marzo de 2020) · la bolsa se hunde · ×96
const BOLSA: [number, number][] = [[0, 0], [0.2, -2], [0.3, 1], [0.45, -6], [0.55, -4], [0.7, -18], [0.8, -14], [1, -34]];
const Uno: React.FC<P> = ({ t }) => {
  const arriba = L(t, EV.caida - 0.4, EV.caida, 0, 1);
  const u = L(t, EV.caida - 0.1, EV.hundio + 0.5, 0, 1, (v) => v);
  const pts: string[] = [];
  let yy = 0;
  for (let k = 0; k <= 100 * u; k++) {
    const v = k / 100;
    let val = 0;
    for (let i = 1; i < BOLSA.length; i++) if (v <= BOLSA[i][0]) { const [a, va] = BOLSA[i - 1]; const [b, vb] = BOLSA[i]; val = va + ((vb - va) * (v - a)) / (b - a); break; }
    yy = 860 + -val * 11 + 6 * Math.sin(v * 60);
    pts.push(`${130 + v * 820},${yy}`);
  }
  const dim = 1 - 0.7 * L(t, EV.cien - 0.4, EV.cien - 0.1, 0, 1);
  const rojo = t > EV.hundio - 0.1;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${-230 * arriba}px) scale(${1 - 0.22 * arriba})`, transformOrigin: "540px 600px" }}>
        <Prueba t={t} t0={EV.ackman - 0.15} x={540} y={720} cabecera="BILL ACKMAN · MARZO 2020" titulo="Compró protección contra una caída de la bolsa" pie="coste: 27 millones $" color={ORO} />
      </div>
      {u > 0 && (
        <div style={{ opacity: dim }}>
          <div style={{ position: "absolute", left: 130, top: 790, ...mono(32), fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>LA BOLSA</div>
          <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
            {pts.length > 1 && <polyline points={pts.join(" ")} fill="none" stroke={rojo ? ROJO : "#fff"} strokeWidth={8} strokeLinejoin="round" style={{ filter: rojo ? `drop-shadow(0 0 12px ${ROJO})` : undefined }} />}
          </svg>
          {t > EV.hundio && <div style={{ position: "absolute", left: 640, top: 1280, ...mono(48), fontWeight: 800, color: ROJO, opacity: L(t, EV.hundio, EV.hundio + 0.2, 0, 1) }}>−34 %</div>}
        </div>
      )}
      <Ficha3D t={t} t0={EV.cien - 0.15} texto="×96" y={1020} size={190} color={VERDE} sub="LO QUE PASÓ A VALER" />
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

// ------------------------------------------------------------------ 4. Dos: COMPRA y VENTA a la vez · la pérdida congelada · dos comisiones
const Dos: React.FC<P> = ({ t, s }) => {
  const venta = muelle(t, EV.contraria - 0.15, 220, 12);
  const hielo = L(t, EV.congelar - 0.2, EV.congelar + 0.3, 0, 1);
  const boton = L(t, EV.cerrar - 0.4, EV.cerrar - 0.15, 0, 1) * (1 - L(t, EV.seguro2 - 0.3, EV.seguro2 - 0.1, 0, 1));
  const pnl = -300 * L(t, s, EV.perdiendo, 0.4, 1);
  const comision = (k: number) => muelle(t, EV.dos - 0.25 + k * 0.15, 240, 12);
  return (
    <>
      <div style={{ position: "absolute", left: 170, width: 740, top: 450, height: 170, borderRadius: 28, border: `5px solid ${hielo > 0.5 ? AZUL : ROJO}`, background: hielo > 0 ? `rgba(80,150,255,${0.18 * hielo})` : "#0a0303", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${30 + 30 * hielo}px ${hielo > 0.5 ? AZUL : ROJO}55`, overflow: "hidden" }}>
        <div style={{ ...mono(30), fontWeight: 800, color: hielo > 0.5 ? AZUL : "rgba(255,255,255,0.7)" }}>{hielo > 0.5 ? "PÉRDIDA CONGELADA" : "TU OPERACIÓN"}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 92, color: hielo > 0.5 ? "#cfe3ff" : ROJO, lineHeight: 1.1 }}>{Math.round(pnl)} €</div>
        {hielo > 0 && <AbsoluteFill style={{ background: "repeating-linear-gradient(120deg, rgba(255,255,255,0.12) 0 4px, transparent 4px 40px), repeating-linear-gradient(60deg, rgba(255,255,255,0.08) 0 3px, transparent 3px 52px)", opacity: hielo }} />}
      </div>
      <Ticket x={300} y={830} w={380} h={200} rot={-3} color={VERDE} s={0.6 + 0.4 * min1(muelle(t, s, 220, 12), 1.06)}>
        <div style={{ ...mono(30), fontWeight: 800, color: VERDE }}>COMPRA</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: ROJO, marginTop: 6 }}>{Math.round(pnl)} €</div>
      </Ticket>
      {venta > 0.01 && (
        <Ticket x={780} y={830} w={380} h={200} rot={3} color={ROJO} s={0.4 + 0.6 * min1(venta, 1.08)} o={min1(venta * 2)}>
          <div style={{ ...mono(30), fontWeight: 800, color: ROJO }}>VENTA</div>
          <div style={{ ...mono(28), fontWeight: 800, color: "#fff", marginTop: 6 }}>«la contraria»</div>
        </Ticket>
      )}
      {venta > 0.5 && <div style={{ position: "absolute", left: 0, width: ANCHO, top: 790, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 80, color: "#fff" }}>+</div>}
      {[0, 1].map((k) => {
        const g = comision(k);
        return g > 0.01 ? <div key={k} style={{ position: "absolute", left: (k === 0 ? 300 : 780) - 150, width: 300, top: 960, textAlign: "center", ...mono(32), fontWeight: 800, color: ORO, padding: "8px 0", border: `3px solid ${ORO}`, borderRadius: 12, background: "#000", transform: `scale(${0.5 + 0.5 * min1(g, 1.1)})`, opacity: min1(g * 2) }}>− COMISIÓN</div> : null;
      })}
      {boton > 0.01 && (
        <>
          <Boton x={540} y={1180} w={460} h={130} texto="CERRAR" color="#fff" o={boton} />
          <Marca t={t} t0={EV.cerrar - 0.05} x={780} y={1180} size={120} color={ROJO} tipo="no" />
        </>
      )}
      <Sello t={t} t0={EV.seguro2 - 0.1} texto="NO ES UN SEGURO" top={1130} color={ROJO} size={66} fin={EV.dos - 0.2} />
      <Sello t={t} t0={EV.dos - 0.05} texto="PAGAS POR DOS" top={1130} color={ORO} size={66} />
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: el paraguas antes de la lluvia ✓ / con la ropa ya mojada ✗ · CERRAR
const Paraguas: React.FC<{ x: number; y: number; abre: number; color: string }> = ({ x, y, abre, color }) => (
  <svg width={300} height={320} viewBox="0 0 300 320" style={{ position: "absolute", left: x - 150, top: y - 120, overflow: "visible" }}>
    <g transform={`translate(150 120) scale(${0.35 + 0.65 * abre} 1) translate(-150 -120)`}>
      <path d="M20 120 C20 40 280 40 280 120 C255 105 235 105 215 120 C195 105 170 105 150 120 C130 105 105 105 85 120 C65 105 45 105 20 120 Z" fill={`${color}33`} stroke={color} strokeWidth={6} strokeLinejoin="round" />
    </g>
    <path d="M150 50 V270 C150 300 115 300 115 275" fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" />
  </svg>
);
const Lluvia: React.FC<{ t: number; x0: number; x1: number; y0: number; y1: number; o: number }> = ({ t, x0, x1, y0, y1, o }) => (
  <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
    {Array.from({ length: 26 }, (_, i) => {
      const x = x0 + ((i * 97) % (x1 - x0));
      const y = y0 + ((((t * 900 + i * 173) % (y1 - y0)) + (y1 - y0)) % (y1 - y0));
      return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 34} stroke="#8fb8ff" strokeWidth={4} strokeLinecap="round" />;
    })}
  </svg>
);
const Giro: React.FC<P> = ({ t, s }) => {
  const izq = muelle(t, s + 0.1, 220, 13);
  const der = muelle(t, EV.pierdes - 0.25, 220, 13);
  const chip = (txt: string, t0: number, y: number) => <div style={{ position: "absolute", left: 70, width: 450, top: y, textAlign: "center", ...mono(28), fontWeight: 800, color: VERDE, opacity: L(t, t0 - 0.2, t0, 0, 1), transform: `translateY(${(1 - L(t, t0 - 0.2, t0, 0, 1)) * 20}px)` }}>{txt}</div>;
  const k = pulsa(t, EV.cierra - 0.05);
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={360} />
      <div style={{ opacity: min1(izq * 2) }}>
        <div style={{ position: "absolute", left: 70, top: 450, width: 450, height: 640, borderRadius: 30, border: `4px solid ${VERDE}`, background: "#03100a" }} />
        <svg width={200} height={90} style={{ position: "absolute", left: 340, top: 470 }}><path d="M30 70 C10 70 10 40 35 40 C40 15 80 10 92 32 C110 20 140 30 135 52 C160 52 160 70 140 70 Z" fill="rgba(160,170,190,0.5)" stroke="#aab" strokeWidth={3} /></svg>
        <Paraguas x={295} y={730} abre={L(t, EV.antes - 0.3, EV.antes + 0.1, 0, 1)} color={VERDE} />
        {chip("ANTES", EV.antes, 920)}
        {chip("CUANDO ES BARATA", EV.barata, 970)}
        {chip("POR UN RIESGO CONCRETO", EV.concreto, 1020)}
      </div>
      {der > 0.01 && (
        <div style={{ opacity: min1(der * 2) }}>
          <div style={{ position: "absolute", left: 560, top: 450, width: 450, height: 640, borderRadius: 30, border: `4px solid ${ROJO}`, background: "#100303", overflow: "hidden" }} />
          <Lluvia t={t} x0={585} x1={990} y0={470} y1={1070} o={1} />
          <Paraguas x={785} y={730} abre={L(t, EV.pierdes, EV.pierdes + 0.8, 0, 0.6)} color={ROJO} />
          <div style={{ position: "absolute", left: 560, width: 450, top: 950, textAlign: "center", ...mono(30), fontWeight: 800, color: ROJO }}>YA TE HAS MOJADO</div>
          <Marca t={t} t0={EV.pierdes + 0.2} x={785} y={530} size={110} color={ROJO} tipo="no" />
        </div>
      )}
      <Marca t={t} t0={EV.antes + 0.1} x={295} y={530} size={110} color={VERDE} tipo="ok" />
      <Boton x={540} y={1240} w={480} h={140} texto="CERRAR" color={ROJO} k={k} lleno={L(t, EV.cierra - 0.1, EV.cierra + 0.1, 0, 1)} o={L(t, EV.cierra - 0.6, EV.cierra - 0.35, 0, 1)} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["27", ORO], ["seguro", ORO], ["2600", VERDE], "ackman", "2020", "protección", ["hundió", ROJO], ["cien", VERDE], "sígueme", "cobertura", "contraria", ["perdiendo", ROJO], "cerrar", ["congelar", AZUL], ["dos", ORO], "regla", ["antes", VERDE], ["barata", VERDE], "concreto", ["pierdes", ROJO], ["cierra", ROJO], "llegado", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV["27"], ORO], [EV.seguro, ORO], [EV.mes], [EV.cobro, VERDE], [EV["2600"], VERDE], [EV.ackman], [EV.compro], [EV.hundio, ROJO], [EV.cien, VERDE], [EV.contraria, ROJO], [EV.perdiendo, ROJO], [EV.cerrar], [EV.seguro2, ROJO], [EV.congelar, AZUL], [EV.dos, ORO], [EV.regla], [EV.antes, VERDE], [EV.barata, VERDE], [EV.concreto], [EV.pierdes, ROJO], [EV.cierra, ROJO], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["Pagó 27 millones por un seguro", "y cobró *2.600_millones*"], hasta: inicio("uno") - 0.05, color: VERDE };
export const Ackman: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/ackman_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
