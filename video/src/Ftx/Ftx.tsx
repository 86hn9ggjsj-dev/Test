// Historia 5-30-10 «dopamina» "Un millón de personas fueron a sacar su dinero. Y no estaba" (~36 s): FTX, noviembre de 2022.
// Fotograma 0: un móvil con la app del exchange en el que alguien pulsa RETIRAR una y otra vez («Retiradas suspendidas»)
// delante de una pared de móviles en rojo; el saldo se bloquea; el móvil se lanza a cámara; la tarjeta de FTX (32.000 M $);
// la cola de gente que corre a retirar y la puerta que se cierra con candado; el dinero de los clientes que sale por la
// puerta de atrás hacia otra empresa del dueño; el mazo y los 25 años; la regla con el stickman (lo sacas, regulado, solo
// lo justo para operar) y el cierre en el móvil. Tiempos en src/gen/ftx.json (scripts/ftx.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/ftx.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { cuerpoEn, Stick } from "../Bot/stick";
import { BRAZOS_ARRIBA } from "../Bot/comun";
import { CamaraTiembla, Sello } from "../Bot/historia";
import { Foco, Moneda } from "../Bot/ui2d";
import { Rotulito } from "../Bot/v3";
import { CierreMovil, Ficha3D, Movil, MovilACamara, Prueba, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const FTX_FPS = datos.fps;
export const FTX_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);

// ------------------------------------------------------------------ 1. Hook: RETIRAR, RETIRAR, RETIRAR… y el saldo bloqueado
const TOQUE = 0.42;
const PantallaRetirar: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.floor(Math.max(0, t) / TOQUE);
  const u = (Math.max(0, t) % TOQUE) / TOQUE;
  const bloq = L(t, EV.estaba - 0.1, EV.estaba + 0.15, 0, 1);
  return (
    <div style={{ position: "absolute", inset: 0, padding: "100px 30px 0", boxSizing: "border-box", color: "#fff" }}>
      <div style={{ ...mono(28, 0.6), fontWeight: 700 }}>EXCHANGE · TU SALDO</div>
      <div style={{ position: "relative", marginTop: 14 }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 70, letterSpacing: "-0.03em", whiteSpace: "nowrap", opacity: 1 - 0.6 * bloq }}>12.450,00 $</span>
        {bloq > 0 && <div style={{ position: "absolute", left: -10, top: 44, width: `${bloq * 105}%`, height: 10, background: ROJO, boxShadow: `0 0 16px ${ROJO}` }} />}
      </div>
      {bloq > 0.3 && <div style={{ marginTop: 18, ...mono(36), fontWeight: 800, color: ROJO }}>BLOQUEADO</div>}
      <div style={{ position: "absolute", left: 30, right: 30, top: 520, height: 130, borderRadius: 26, background: ROJO, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 52, color: "#000", transform: `scale(${1 - 0.05 * (u < 0.25 ? 1 : 0)})` }}>RETIRAR</div>
      <div style={{ position: "absolute", left: 270 - 50 - 50 * u, top: 585 - 50 - 50 * u, width: 100 + 100 * u, height: 100 + 100 * u, borderRadius: "50%", border: "5px solid #fff", opacity: 1 - u }} />
      {n > 0 && (
        <div style={{ position: "absolute", left: 20, right: 20, top: 700, padding: "20px 22px", borderRadius: 22, background: "rgba(255,77,94,0.15)", border: `3px solid ${ROJO}`, fontFamily: SANS, fontWeight: 700, fontSize: 32, color: ROJO, transform: `translateY(${u < 0.2 ? (1 - u / 0.2) * 20 : 0}px)` }}>
          Retiradas suspendidas ({n})
        </div>
      )}
    </div>
  );
};
const Hook: React.FC<P> = ({ t }) => (
  <CamaraTiembla t={t} t0={EV.estaba} a={0.02}>
    {Array.from({ length: 24 }, (_, i) => {
      const x = 130 + (i % 6) * 164;
      const y = 640 + Math.floor(i / 6) * 200;
      const on = t > 0.1 + ((i * 7) % 24) * 0.09;
      return <div key={i} style={{ position: "absolute", left: x - 50, top: y - 85, width: 100, height: 170, borderRadius: 18, border: `3px solid ${on ? ROJO : "rgba(255,255,255,0.3)"}`, background: on ? "rgba(255,77,94,0.18)" : "#050505", opacity: 0.55, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 22, color: ROJO }}>{on ? "ERROR" : ""}</div>;
    })}
    <Movil x={540} y={1010} s={0.8} rotY={-6} rotX={4}>
      <PantallaRetirar t={t} />
    </Movil>
  </CamaraTiembla>
);

// ------------------------------------------------------------------ 2. Uno: FTX, 32.000 M $ · todos corren a retirar · cierran las retiradas
const Persona: React.FC<{ x: number; y: number; color?: string; o?: number }> = ({ x, y, color = "#fff", o = 1 }) => (
  <svg width={60} height={70} viewBox="0 0 60 70" style={{ position: "absolute", left: x - 30, top: y - 70, opacity: o, overflow: "visible" }}>
    <circle cx={30} cy={15} r={12} fill={color} />
    <path d="M8 66 V48 C8 36 16 31 30 31 C44 31 52 36 52 48 V66 Z" fill={color} />
  </svg>
);
const Uno: React.FC<P> = ({ t }) => {
  const tarjeta = 1 - L(t, EV.dias - 0.4, EV.dias - 0.15, 0, 1);
  const cola = L(t, EV.dias - 0.3, EV.dias - 0.05, 0, 1);
  const cierra = L(t, EV.cerraron - 0.1, EV.cerraron + 0.15, 0, 1);
  const vel = t > EV.quisieron ? 2.4 : 1;
  const avance = (t - EV.dias) * 110 * (t > EV.quisieron ? 1 : 1) + Math.max(0, t - EV.quisieron) * 160 * (vel - 1);
  return (
    <>
      {tarjeta > 0.01 && (
        <AbsoluteFill style={{ opacity: tarjeta }}>
          <Prueba t={t} t0={EV.ftx - 0.2} x={540} y={820} cabecera="FTX · EXCHANGE DE CRIPTO" cifra="32.000 M $" pie="valoración en enero de 2022 · quiebra en noviembre de 2022" color={ORO} />
        </AbsoluteFill>
      )}
      {cola > 0.01 && (
        <CamaraTiembla t={t} t0={EV.cerraron} a={0.025}>
          <AbsoluteFill style={{ opacity: cola }}>
            <Foco x={540} y={1200} w={1000} h={120} o={0.1} />
            {Array.from({ length: 22 }, (_, i) => {
              const fila = i % 2;
              const x = 60 + ((i * 70 + avance) % 760) - 40;
              const parada = cierra > 0.5 ? Math.min(x, 760 - fila * 20) : x;
              return <Persona key={i} x={parada} y={1150 + fila * 70} color={cierra > 0.5 ? "rgba(255,255,255,0.6)" : "#fff"} />;
            })}
            {/* la puerta de las retiradas */}
            <div style={{ position: "absolute", left: 820, top: 820, width: 180, height: 420, border: "6px solid #fff", borderBottom: "none", borderRadius: "16px 16px 0 0", background: "#050505" }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: 180 * (1 - 0.92 * (1 - cierra)), height: 420, background: cierra > 0 ? "#141414" : "transparent", borderRight: cierra > 0 ? `6px solid ${ROJO}` : undefined, transformOrigin: "0% 50%" }} />
            </div>
            <div style={{ position: "absolute", left: 790, width: 240, top: 760, textAlign: "center", ...mono(34), fontWeight: 800 }}>RETIRADAS</div>
            {cierra > 0.3 && (
              <>
                <svg width={110} height={126} viewBox="0 0 100 115" style={{ position: "absolute", left: 855, top: 960, transform: `scale(${0.5 + 0.5 * min1(muelle(t, EV.cerraron, 260, 11), 1.15)})`, filter: `drop-shadow(0 0 20px ${ROJO})` }}>
                  <path d="M28 52 L28 34 A22 22 0 0 1 72 34 L72 52" fill="none" stroke={ROJO} strokeWidth={9} strokeLinecap="round" />
                  <rect x={12} y={50} width={76} height={60} rx={10} fill="#000" stroke={ROJO} strokeWidth={7} />
                </svg>
                <Sello t={t} t0={EV.cerraron} texto="CERRADO" top={620} color={ROJO} size={100} />
              </>
            )}
          </AbsoluteFill>
        </CamaraTiembla>
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

// ------------------------------------------------------------------ 4. Dos: el dinero sale por detrás hacia otra empresa del dueño · 25 años
const Caja: React.FC<{ x: number; y: number; titulo: string; color: string; g: number; children?: React.ReactNode }> = ({ x, y, titulo, color, g, children }) => (
  <div style={{ position: "absolute", left: x - 180, top: y - 170, width: 360, height: 340, borderRadius: 30, border: `5px solid ${color}`, background: "#060606", boxShadow: `0 0 40px ${color}44`, opacity: min1(g * 2), transform: `scale(${0.6 + 0.4 * min1(g, 1.08)})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 20, boxSizing: "border-box" }}>
    {children}
    <span style={{ ...mono(34), fontWeight: 800, color, textAlign: "center", whiteSpace: "normal", lineHeight: 1.2 }}>{titulo}</span>
  </div>
);
const Mazo: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const g = muelle(t, t0 - 0.35, 160, 10);
  const golpe = L(t, t0 - 0.35, t0, -50, 0, (u) => u * u);
  return (
    <svg width={420} height={360} viewBox="0 0 140 120" style={{ position: "absolute", left: 330, top: 520, opacity: min1(g * 2), overflow: "visible" }}>
      <g transform={`rotate(${golpe} 100 100)`}>
        <rect x={20} y={20} width={60} height={30} rx={6} fill="#000" stroke="#fff" strokeWidth={4} transform="rotate(-30 50 35)" />
        <line x1={55} y1={45} x2={100} y2={100} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
      </g>
      <rect x={70} y={104} width={60} height={12} rx={3} fill="#fff" />
    </svg>
  );
};
const Dos: React.FC<P> = ({ t }) => {
  const diagrama = 1 - L(t, EV.fundador - 0.35, EV.fundador - 0.1, 0, 1);
  const juicio = L(t, EV.fundador - 0.25, EV.fundador, 0, 1);
  return (
    <>
      {diagrama > 0.01 && (
        <AbsoluteFill style={{ opacity: diagrama }}>
          <Caja x={290} y={760} titulo="DINERO DE LOS CLIENTES" color="#fff" g={muelle(t, EV.clientes - 0.3, 220, 13)}>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 90, color: VERDE }}>$$$</span>
          </Caja>
          <Caja x={790} y={760} titulo="OTRA EMPRESA DEL DUEÑO" color={ROJO} g={muelle(t, EV.empresa - 0.25, 220, 13)}>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 70, color: ROJO }}>APUESTAS</span>
          </Caja>
          {Array.from({ length: 8 }, (_, i) => (
            <Moneda key={i} t={t} t0={EV.apostar - 0.6 + i * 0.22} t1={EV.apostar - 0.6 + i * 0.22 + 0.7} a={[360, 900]} b={[720, 900]} size={64} color={ORO} texto="$" />
          ))}
          <div style={{ position: "absolute", left: 360, width: 360, top: 1010, textAlign: "center", ...mono(32), fontWeight: 800, color: ORO, opacity: L(t, EV.apostar - 0.5, EV.apostar - 0.2, 0, 1) }}>POR LA PUERTA DE ATRÁS</div>
        </AbsoluteFill>
      )}
      {juicio > 0.01 && (
        <AbsoluteFill style={{ opacity: juicio }}>
          <Mazo t={t} t0={EV.condenado} />
          <Ficha3D t={t} t0={EV["25"] - 0.05} texto="25 AÑOS" y={1060} size={170} color={ROJO} sub="DE CÁRCEL" />
        </AbsoluteFill>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: lo sacas · regulado · solo lo justo para operar
const Giro: React.FC<P> = ({ t, s }) => {
  const c = cuerpoEn(t, [[EV.sacas, { ...BRAZOS_ARRIBA, boca: 1, abre: 0.4 }], [EV.regulado + 0.2, { mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52, boca: 0.6, abre: 0 }]], {}, s - 0.3);
  const queda = L(t, EV.dejes - 0.1, EV.operar, 1, 0.25);
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={360} />
      <Caja x={760} y={780} titulo="TU BRÓKER" color="#fff" g={muelle(t, EV.regla, 220, 13)}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
          {[0, 1, 2, 3].map((k) => <div key={k} style={{ width: 52, height: 120 * queda * (0.6 + 0.1 * k), borderRadius: 8, background: ORO, opacity: 0.9 }} />)}
        </div>
      </Caja>
      {Array.from({ length: 6 }, (_, i) => (
        <Moneda key={i} t={t} t0={EV.tuyo + i * 0.18} t1={EV.tuyo + i * 0.18 + 0.6} a={[720, 760]} b={[300, 1000]} size={60} color={ORO} texto="$" />
      ))}
      <Sello t={t} t0={EV.regulado - 0.1} texto="REGULADO ✓" top={570} color={VERDE} size={64} />
      {t > EV.dejes - 0.1 && <div style={{ position: "absolute", left: 590, width: 340, top: 990, textAlign: "center", ...mono(34), fontWeight: 800, color: VERDE, whiteSpace: "normal", lineHeight: 1.2, opacity: L(t, EV.dejes - 0.1, EV.dejes + 0.2, 0, 1) }}>SOLO LO JUSTO PARA OPERAR</div>}
      <Foco x={300} y={1290} w={380} h={80} o={0.15} />
      <Stick c={c} ox={300} oy={1290} s={280} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["millón", ORO], ["estaba", ROJO], ["ftx", ORO], ["32000", ORO], "días", ["cerraron", ROJO], ["retiradas", ROJO], "sígueme", "dentro", "clientes", ["apostar", ROJO], ["dueño", ROJO], ["condenado", ROJO], ["25", ROJO], "regla", ["tuyo", VERDE], ["sacas", VERDE], ["regulado", VERDE], "operar", "llegado", "mirar", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02, ROJO], [EV.sacar], [EV.estaba, ROJO], [EV.ftx, ORO], [EV["32000"], ORO], [EV.dias], [EV.quisieron], [EV.cerraron, ROJO], [EV.clientes], [EV.apostar, ROJO], [EV.empresa], [EV.condenado, ROJO], [EV["25"], ROJO], [EV.regla], [EV.sacas, VERDE], [EV.regulado, VERDE], [EV.operar, VERDE], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];
const Encima: React.FC<{ t: number }> = ({ t }) => (
  <MovilACamara t={t} t0={inicio("uno") - 0.45} dura={0.45}>
    <PantallaRetirar t={t} />
  </MovilACamara>
);

const GANCHO = { lineas: ["Fueron a sacar", "su dinero… *y_no_estaba*"], hasta: inicio("uno") - 0.05, color: ROJO };
export const Ftx: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/ftx_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} encima={Encima} />
);
