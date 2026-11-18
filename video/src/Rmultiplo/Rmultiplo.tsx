// Reel 5-30-10 «dopamina» "Si mides tus operaciones en euros, no sabes si eres buen trader" (~38 s), sin personajes:
// fotograma 0 con tres rodillos de resultados en euros girando como una tragaperras que se paran y se tachan; la R que
// cae del cielo con onda expansiva; la cuenta 50 € → 150 € = +3 R y el stop = −1 R; las 50 fichas en R que caen en el
// sumatorio ÷ 50; la ventaja +0,2 R (una quinta parte de lo que arriesgas); el dial de tamaño que no arregla un número
// negativo; la escalera de la regla (1 positivo ✓ → 2 sube el tamaño, el candado se abre) y el cierre en el móvil.
// Tiempos en src/gen/rmultiplo.json (scripts/rmultiplo.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/rmultiplo.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { CamaraTiembla } from "../Bot/historia";
import { Foco } from "../Bot/ui2d";
import { Marca, Rotulito, Ticket } from "../Bot/v3";
import { CierreMovil, Ficha3D, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const RMULTIPLO_FPS = datos.fps;
export const RMULTIPLO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);
const sal = (u: number) => 1 - Math.pow(1 - u, 3);

// ------------------------------------------------------------------ 1. Hook: rodillos de euros que giran y se tachan
const EUROS = ["+300 €", "−120 €", "+80 €", "−45 €", "+15 €", "−210 €", "+95 €", "−60 €", "+140 €", "−30 €"];
const Rodillo: React.FC<{ t: number; x: number; k: number; para: number }> = ({ t, x, k, para }) => {
  const H = 150;
  const v = t < para ? t * (14 + k * 3) : para * (14 + k * 3) + sal(L(t, para, para + 0.35, 0, 1, (u) => u)) * 0.6;
  const base = Math.floor(v);
  const frac = v - base;
  return (
    <div style={{ position: "absolute", left: x - 140, top: 760, width: 280, height: H * 3, overflow: "hidden", borderRadius: 26, border: "4px solid rgba(255,255,255,0.8)", background: "linear-gradient(180deg, #000 0%, #121212 50%, #000 100%)" }}>
      {[-1, 0, 1, 2].map((j) => {
        const s = EUROS[(base + j + k * 3 + 100) % EUROS.length];
        return (
          <div key={j} style={{ position: "absolute", left: 0, width: 280, top: (j + 1 - frac) * H, height: H, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 70, color: s.startsWith("+") ? VERDE : ROJO, filter: t < para ? "blur(2px)" : undefined }}>
            {s}
          </div>
        );
      })}
    </div>
  );
};
const Hook: React.FC<P> = ({ t }) => {
  const tacha = L(t, EV.sabes - 0.05, EV.sabes + 0.25, 0, 1, (u) => u);
  return (
    <CamaraTiembla t={t} t0={EV.sabes} a={0.025}>
      <Foco x={540} y={1260} w={900} h={140} o={0.1} />
      {[0, 1, 2].map((k) => <Rodillo key={k} t={t} x={225 + k * 315} k={k} para={EV.euros + 0.25 + k * 0.18} />)}
      {tacha > 0 && (
        <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
          <line x1={90} y1={1220} x2={90 + 900 * tacha} y2={1220 - 460 * tacha} stroke={ROJO} strokeWidth={18} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 16px ${ROJO})` }} />
        </svg>
      )}
    </CamaraTiembla>
  );
};

// ------------------------------------------------------------------ 2. Uno: la R cae del cielo · 50 € → 150 € = +3 R · el stop = −1 R
const Onda: React.FC<{ t: number; t0: number; y: number; color?: string }> = ({ t, t0, y, color = "#fff" }) => {
  const u = L(t, t0, t0 + 0.6, 0, 1, (v) => v);
  if (u <= 0 || u >= 1) return null;
  return <div style={{ position: "absolute", left: 540 - 600 * u, top: y - 220 * u, width: 1200 * u, height: 440 * u, borderRadius: "50%", border: `${10 * (1 - u)}px solid ${color}`, opacity: 1 - u }} />;
};
const Uno: React.FC<P> = ({ t }) => {
  const rFuera = L(t, EV["50"] - 0.45, EV["50"] - 0.2, 0, 1);
  const cae = L(t, EV.midelas - 0.25, EV.midelas, 0, 1, (u) => u * u);
  const cuenta = L(t, EV["50"] - 0.3, EV["50"] - 0.05, 0, 1) * (1 - L(t, EV.salta - 0.45, EV.salta - 0.2, 0, 1));
  const stop = L(t, EV.salta - 0.3, EV.salta - 0.05, 0, 1);
  const precio = L(t, EV.salta - 0.3, EV.stop + 0.1, 0, 1, (u) => u);
  const tres = EV["150"] + 0.75;
  return (
    <>
      {rFuera < 1 && (
        <AbsoluteFill style={{ opacity: 1 - rFuera }}>
          <Onda t={t} t0={EV.midelas} y={900} />
          <div style={{ position: "absolute", left: 0, width: ANCHO, top: 900, transform: `translateY(-50%) translateY(${-900 * (1 - cae)}px) scale(${1 + 1.5 * (1 - cae)})`, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 520, lineHeight: 1, color: "#fff", textShadow: "0 0 60px rgba(255,255,255,0.4), 0 30px 0 #1c1c1c, 0 34px 60px #000", opacity: min1(cae * 3) }}>R</div>
          {t > EV.arriesgas - 0.1 && <div style={{ position: "absolute", left: 0, width: ANCHO, top: 1210, textAlign: "center", ...mono(54), fontWeight: 800, letterSpacing: "0.12em", color: ORO, transform: `scale(${0.6 + 0.4 * min1(muelle(t, EV.arriesgas - 0.1, 240, 13), 1.1)})` }}>= LO QUE ARRIESGAS</div>}
        </AbsoluteFill>
      )}
      {cuenta > 0.01 && (
        <AbsoluteFill style={{ opacity: cuenta }}>
          {t > EV["50"] - 0.1 && (
            <Ticket x={300} y={680} w={380} h={220} rot={-4} s={0.6 + 0.4 * min1(muelle(t, EV["50"] - 0.1, 240, 13), 1.1)} color={ROJO}>
              <span style={{ ...mono(30, 0.75), fontWeight: 800 }}>ARRIESGAS</span>
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 96, color: ROJO }}>50 €</span>
            </Ticket>
          )}
          {t > EV["150"] - 0.1 && (
            <Ticket x={780} y={680} w={380} h={220} rot={4} s={0.6 + 0.4 * min1(muelle(t, EV["150"] - 0.1, 240, 13), 1.1)} color={VERDE}>
              <span style={{ ...mono(30, 0.75), fontWeight: 800 }}>GANAS</span>
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 96, color: VERDE }}>150 €</span>
            </Ticket>
          )}
          <Ficha3D t={t} t0={tres} texto="+3 R" y={1080} size={230} color={VERDE} sub="150 ÷ 50" />
        </AbsoluteFill>
      )}
      {stop > 0.01 && (
        <AbsoluteFill style={{ opacity: stop }}>
          <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
            <line x1={120} x2={960} y1={900} y2={900} stroke={ROJO} strokeWidth={6} strokeDasharray="20 12" />
            <polyline points={Array.from({ length: 30 }, (_, i) => `${120 + i * 28 * min1(precio * 1.1)},${640 + i * 9 * min1(precio * 1.1) + Math.sin(i * 1.7) * 30}`).join(" ")} fill="none" stroke="#fff" strokeWidth={7} strokeLinejoin="round" />
          </svg>
          <div style={{ position: "absolute", left: 120, top: 920, ...mono(40), fontWeight: 800, color: ROJO }}>STOP</div>
          <Onda t={t} t0={EV.stop - 0.05} y={900} color={ROJO} />
          <Ficha3D t={t} t0={EV.stop + 0.4} texto="−1 R" y={1160} size={230} color={ROJO} sub="PIERDES LO QUE ARRIESGABAS" />
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

// ------------------------------------------------------------------ 4. Dos: 50 fichas en R → Σ ÷ 50 = +0,2 R · un quinto · si es negativo, ningún tamaño
const FICHAS = Array.from({ length: 50 }, (_, i) => {
  const r = [2, -1, -1, 0.5, -1, 2, -1, 1, -1, 1.5][i % 10]; // suma 2 cada 10 → media +0,2 R
  return { r, x: 150 + ((i * 137) % 780), d: (i * 0.053) % 1 };
});
const Dos: React.FC<P> = ({ t, s }) => {
  const lluvia = 1 - L(t, EV.numero - 0.35, EV.numero - 0.1, 0, 1);
  const cae = (i: number) => L(t, s + 0.1 + FICHAS[i].d * 1.6, s + 0.6 + FICHAS[i].d * 1.6, 0, 1, (u) => u * u);
  const dentro = FICHAS.filter((_, i) => cae(i) >= 1).length;
  const suma = FICHAS.filter((_, i) => cae(i) >= 1).reduce((a, f) => a + f.r, 0);
  const media = L(t, EV.numero - 0.2, EV.negativo - 0.35, 0, 1) * (1 - L(t, EV.negativo - 0.35, EV.negativo - 0.1, 0, 1));
  const quinta = L(t, EV.quinta - 0.3, EV.quinta + 0.2, 0, 1, sal);
  const neg = L(t, EV.negativo - 0.25, EV.negativo, 0, 1);
  const dial = L(t, EV.negativo + 0.3, EV.arregla, 1, 5, (u) => u);
  return (
    <>
      {lluvia > 0.01 && (
        <AbsoluteFill style={{ opacity: lluvia }}>
          {FICHAS.map((f, i) => {
            const u = cae(i);
            if (u <= 0 || u >= 1) return null;
            return (
              <div key={i} style={{ position: "absolute", left: f.x + (540 - f.x) * u - 70, top: 300 + 760 * u - 30, width: 140, height: 60, borderRadius: 30, border: `3px solid ${f.r > 0 ? VERDE : ROJO}`, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 34, color: f.r > 0 ? VERDE : ROJO, transform: `scale(${1 - 0.5 * u})` }}>
                {f.r > 0 ? "+" : "−"}{String(Math.abs(f.r)).replace(".", ",")} R
              </div>
            );
          })}
          <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
            <path d="M330 1000 L750 1000 L600 1180 L480 1180 Z" fill="#050505" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
          </svg>
          <div style={{ position: "absolute", left: 0, width: ANCHO, top: 1040, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 90, color: "#fff" }}>Σ</div>
          <div style={{ position: "absolute", left: 0, width: ANCHO, top: 1210, textAlign: "center", ...mono(50), fontWeight: 800 }}>{dentro} OPERACIONES · {suma >= 0 ? "+" : "−"}{Math.abs(suma).toFixed(1).replace(".", ",")} R</div>
          <Ficha3D t={t} t0={EV.divide - 0.05} texto="÷ 50" x={810} y={1090} size={96} color={ORO} />
        </AbsoluteFill>
      )}
      {media > 0.01 && (
        <AbsoluteFill style={{ opacity: media }}>
          <Ficha3D t={t} t0={EV.numero - 0.1} texto="+0,2 R" y={640} size={220} color={VERDE} sub={t > EV.ventaja - 0.1 ? "TU VENTAJA" : "TU NÚMERO"} />
          {t > EV.mas && (
            <div style={{ position: "absolute", left: 140, top: 960, width: 800 }}>
              <div style={{ ...mono(38), fontWeight: 800, marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
                <span>ARRIESGAS 50 €</span>
                <span style={{ color: VERDE, opacity: quinta }}>GANAS 10 € DE MEDIA</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[0, 1, 2, 3, 4].map((k) => (
                  <div key={k} style={{ flex: 1, height: 110, borderRadius: 16, border: "4px solid #fff", background: k === 0 && quinta > 0 ? `rgba(47,224,138,${0.85 * quinta})` : "#000", boxShadow: k === 0 && quinta > 0.5 ? `0 0 30px ${VERDE}` : undefined }} />
                ))}
              </div>
              <div style={{ ...mono(40), fontWeight: 800, color: VERDE, marginTop: 14, opacity: quinta }}>1 / 5</div>
            </div>
          )}
        </AbsoluteFill>
      )}
      {neg > 0.01 && (
        <AbsoluteFill style={{ opacity: neg }}>
          <Ficha3D t={t} t0={EV.negativo - 0.1} texto="−0,1 R" y={600} size={200} color={ROJO} />
          <div style={{ position: "absolute", left: 140, top: 860, width: 360, height: 360, borderRadius: 180, border: "6px solid #fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#050505" }}>
            <span style={{ ...mono(34, 0.7), fontWeight: 800 }}>TAMAÑO</span>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 130, color: ORO }}>×{Math.round(dial)}</span>
          </div>
          <div style={{ position: "absolute", left: 560, top: 920, width: 400, display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ ...mono(34, 0.7), fontWeight: 800 }}>PIERDES POR OPERACIÓN</span>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 110, color: ROJO }}>−{Math.round(5 * dial)} €</span>
          </div>
          <Marca t={t} t0={EV.arregla} x={760} y={1250} size={120} color={ROJO} tipo="no" />
        </AbsoluteFill>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: escalera de la regla (1 positivo ✓ → 2 sube el tamaño 🔓)
const Candado: React.FC<{ abierto: number; color: string }> = ({ abierto, color }) => (
  <svg width={90} height={104} viewBox="0 0 100 115" style={{ overflow: "visible" }}>
    <path d={`M28 52 L28 34 A22 22 0 0 1 72 34 L72 ${52 - 22 * abierto}`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" transform={`rotate(${-20 * abierto} 28 52)`} />
    <rect x={14} y={50} width={72} height={58} rx={10} fill="#000" stroke={color} strokeWidth={7} />
  </svg>
);
const Paso: React.FC<{ t: number; t0: number; y: number; n: string; texto: string; hecho: boolean; extra?: React.ReactNode }> = ({ t, t0, y, n, texto, hecho, extra }) => {
  const g = muelle(t, t0, 220, 13);
  if (g <= 0.01) return null;
  const c = hecho ? VERDE : "#fff";
  return (
    <div style={{ position: "absolute", left: 120, top: y, width: 840, height: 220, borderRadius: 34, border: `5px solid ${c}`, background: hecho ? "rgba(47,224,138,0.1)" : "#050505", boxShadow: hecho ? `0 0 40px ${VERDE}55` : undefined, display: "flex", alignItems: "center", gap: 34, padding: "0 40px", boxSizing: "border-box", opacity: min1(g * 2), transform: `translateX(${(1 - min1(g)) * -120}px)` }}>
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 130, color: c, lineHeight: 1 }}>{n}</span>
      <span style={{ flex: 1, fontFamily: SANS, fontWeight: 800, fontSize: 58, lineHeight: 1.05, color: "#fff" }}>{texto}</span>
      {extra}
    </div>
  );
};
const Giro: React.FC<P> = ({ t }) => (
  <>
    <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={380} />
    <Paso t={t} t0={EV.regla + 0.3} y={560} n="1" texto="Tu media en R, positiva" hecho={t >= EV.positivo} extra={<div style={{ position: "relative", width: 110, height: 110 }}><Marca t={t} t0={EV.positivo} x={55} y={55} size={110} color={VERDE} tipo="ok" /></div>} />
    <Paso t={t} t0={EV.despues - 0.1} y={860} n="2" texto="Sube el tamaño" hecho={t >= EV.tamano} extra={<Candado abierto={L(t, EV.tamano - 0.1, EV.tamano + 0.2, 0, 1)} color={t >= EV.tamano ? VERDE : ROJO} />} />
  </>
);

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["euros", ROJO], ["sabes", ROJO], ["r", ORO], "arriesgas", ["50", ROJO], ["150", VERDE], ["+3", VERDE], ["stop", ROJO], ["−1", ROJO], "sígueme", "suma", "50", "divide", ["ventaja", VERDE], ["02", VERDE], "quinta", ["negativo", ROJO], "positivo", "tamaño", "llegado", "número", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV.euros], [EV.sabes, ROJO], [EV.midelas, ORO], [EV.arriesgas], [EV["50"], ROJO], [EV["150"], VERDE], [EV["150"] + 0.75, VERDE], [EV.salta], [EV.stop, ROJO], [EV.suma], [EV.divide], [EV.numero, VERDE], [EV.ventaja, VERDE], [EV.quinta, VERDE], [EV.negativo, ROJO], [EV.arregla, ROJO], [EV.regla], [EV.positivo, VERDE], [EV.tamano, VERDE], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["¿Lo mides *en_euros*?", "Así *no_lo_sabes*"], hasta: inicio("uno") - 0.05, color: ROJO };
export const Rmultiplo: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/rmultiplo_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
