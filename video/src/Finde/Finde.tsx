// Reel 5-30-10 "Tu stop no te protege el fin de semana" (~40 s), en ESTILO LIMPIO: un elemento principal y un solo texto a
// la vez. Un candado abierto sobre la línea del stop; el viernes por la noche Marcos (gorra) deja la operación abierta con
// el stop a −30 €; duerme y el domingo vibra el móvil con la noticia; el «sígueme» encima; el lunes el gráfico abre con un
// hueco por debajo del stop y la pérdida es −140 €; el viernes, antes del cierre: cerrar o tamaño pequeño; y el cierre de
// conversión. Tiempos en src/gen/finde.json (scripts/finde.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/finde.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { Escena, orbita, Trazo } from "../Bot/tres";
import { cristal, ROJO, VERDE } from "../Bot/kit";
import { cuerpoEn } from "../Bot/stick";
import { anclaje, FlashRojo, StickMundo } from "../Bot/comun";
import { CamaraTiembla } from "../Bot/historia";
import { escritorioLimpio, horizonte } from "../Bot/decorados";
import { Ficha, Foco, PantallaPC } from "../Bot/ui2d";
import { CierreComenta } from "../Bot/conversion";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const FINDE_FPS = datos.fps;
export const FINDE_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;

// ------------------------------------------------------------------ piezas
const Titulo: React.FC<{ t: number; t0: number; texto: string; top?: number; color?: string; fin?: number }> = ({ t, t0, texto, top = 400, color = "#fff", fin: f }) => {
  const o = L(t, t0, t0 + 0.3, 0, 0.9) * (f === undefined ? 1 : 1 - L(t, f - 0.25, f, 0, 1));
  return <div style={{ position: "absolute", top, left: 0, width: ANCHO, textAlign: "center", ...mono(40), fontWeight: 700, letterSpacing: "0.16em", color, opacity: o }}>{texto}</div>;
};
const Candado: React.FC<{ x: number; y: number; abierto: number; color: string; size?: number }> = ({ x, y, abierto, color, size = 220 }) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 100 115" style={{ position: "absolute", left: x - size / 2, top: y - size * 0.575, overflow: "visible", filter: `drop-shadow(0 0 18px ${color}88)` }}>
    <path d={`M28 52 L28 34 A22 22 0 0 1 72 34 L72 ${52 - 22 * abierto}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" transform={`rotate(${-18 * abierto} 28 52)`} />
    <rect x={14} y={50} width={72} height={58} rx={10} fill="#000" stroke={color} strokeWidth={6} />
    <circle cx={50} cy={74} r={7} fill={color} />
    <line x1={50} x2={50} y1={78} y2={92} stroke={color} strokeWidth={6} strokeLinecap="round" />
  </svg>
);
const camDesp = (t: number, s: number, e: number) => orbita([0.42, -0.35, -0.35], L(t, s, e, 4.4, 4.2), -0.06, 0.1, { apertura: 4, centroY: 980 });

// ------------------------------------------------------------------ 1. Hook: el candado del stop, abierto
const Hook: React.FC<P> = ({ t }) => (
  <>
    <Foco x={ANCHO / 2} y={1150} w={700} h={130} o={0.12} />
    <Candado x={ANCHO / 2} y={860} abierto={1} color={ROJO} size={260} />
    <div style={{ position: "absolute", left: 160, top: 1080, width: 760, height: 6, background: ROJO, boxShadow: `0 0 20px ${ROJO}`, opacity: L(t, -1, 0.3, 0.6, 1) }} />
    <div style={{ position: "absolute", left: 160, top: 1100, ...mono(34), fontWeight: 800, color: ROJO }}>STOP</div>
  </>
);

// ------------------------------------------------------------------ 2. Uno: viernes por la noche, operación abierta con el stop a −30 €
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = camDesp(t, s, e);
  const tr: Trazo[] = [];
  escritorioLimpio(tr, t, { ventana: "noche" });
  const c = cuerpoEn(t, [[s, { mDx: 0.38, mDy: -0.1, mira: 0.7, boca: 0.3 }], [EV["30"] - 0.4, { mira: 0, boca: 0.6, cejas: 0.3, mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52 }]], { mira: 0.7 }, s - 0.4);
  const a = anclaje(cam, [0.02, -1, -0.15], 0.48);
  const stop = L(t, EV.stop1 - 0.2, EV.stop1 + 0.3, 0, 1);
  return (
    <>
      <Foco x={a.ox + 120} y={a.oy} w={760} h={150} />
      <Escena cam={cam} trazos={tr} />
      <PantallaPC cam={cam}>
        {(w, h) => (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: h * 0.06 }}>
            <span style={{ ...mono(h * 0.09, 0.7) }}>OPERACIÓN ABIERTA</span>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: h * 0.22, color: ROJO, opacity: stop }}>STOP −30 €</span>
          </div>
        )}
      </PantallaPC>
      <StickMundo a={a} c={c} t={t} gorra />
      <Titulo t={t} t0={EV.viernes - 0.2} texto="VIERNES · NOCHE" top={310} />
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: duerme tranquilo · el domingo vibra el móvil con la noticia
const s2 = inicio("dos");
const Dos: React.FC<P> = ({ t }) => {
  const tr: Trazo[] = [];
  horizonte(tr, -0.6, 0.4);
  // Cama: somier, cabecero y almohada
  cristal(tr, [-0.75, -0.82, -0.45], [0.55, -0.7, 0.25], "#fff", 0.95, 0.15, 0.05);
  for (const x of [-0.73, 0.53]) tr.push({ t: "l", a: [x, -0.82, 0.22], b: [x, -1, 0.22], w: 2.4, o: 0.8 });
  tr.push({ t: "p", pts: [[-0.75, -0.7, -0.45], [-0.75, -0.3, -0.45], [-0.75, -0.3, 0.25], [-0.75, -0.7, 0.25]], w: 2.6, o: 1, relleno: "#fff", oRelleno: 0.05 });
  cristal(tr, [-0.68, -0.7, -0.3], [-0.45, -0.62, 0.15], "#fff", 0.9, 0.1, 0.1);
  // Mesita con el móvil
  cristal(tr, [0.68, -1, -0.2], [0.95, -0.72, 0.1], "#fff", 0.8, 0.1, 0.04);
  const cam = orbita([0.05, -0.6, 0], 4.6, 0, 0.18, { apertura: 4, centroY: 1040 });
  const a = anclaje(cam, [0.05, -0.7, -0.05], 0.4);
  const c = cuerpoEn(t, [[s2, { ojos: 0.15, boca: 0.2, mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52, mira: 0 }]], { ojos: 0.15 }, s2 - 0.4);
  const vibra = t > EV.domingo - 0.1 ? Math.sin(t * 60) * 4 : 0;
  const g = muelle(t, EV.domingo - 0.1, 240, 12);
  const qm = { x: 845, y: 1060 };
  return (
    <>
      <Foco x={540} y={1180} w={900} h={150} o={0.1} />
      <Escena cam={cam} trazos={tr} />
      {/* Marcos tumbado: el stickman girado sobre la cama */}
      <AbsoluteFill style={{ transform: `translate(0px, ${0.68 * a.s}px) rotate(-90deg)`, transformOrigin: `${a.ox}px ${a.oy - 0.79 * a.s}px` }}>
        <StickMundo a={a} c={c} t={t} gorra />
      </AbsoluteFill>
      {t < EV.domingo + 0.3 && <div style={{ position: "absolute", left: a.ox - 0.9 * a.s, top: a.oy - 0.75 * a.s - 10 * Math.sin(t * 3), ...mono(54), fontWeight: 700, opacity: 0.8 }}>Zzz</div>}
      {g > 0.01 && (
        <div style={{ position: "absolute", left: qm.x + vibra, top: qm.y, transform: `translate(-50%, -100%) scale(${Math.min(g, 1.05)})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ padding: "10px 18px", borderRadius: 14, background: ROJO, color: "#000", ...mono(28), fontWeight: 800, opacity: L(t, EV.noticia - 0.3, EV.noticia, 0, 1) }}>NOTICIA</div>
          <div style={{ width: 90, height: 160, borderRadius: 18, border: "4px solid #fff", background: "#050505", boxShadow: `0 0 ${20 + 10 * Math.abs(Math.sin(t * 20))}px rgba(255,77,94,0.6)` }} />
        </div>
      )}
      <Titulo t={t} t0={EV.domingo - 0.3} texto="DOMINGO" />
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme encima de la escena
const Sigueme: React.FC<P> = (p) => (
  <>
    <AbsoluteFill style={{ filter: "blur(9px)" }}>
      <Dos t={p.t} s={s2} e={fin("dos")} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "rgba(0,0,0,0.6)" }} />
    <CtaSeguir {...p} lema="" sinFondo />
  </>
);

// ------------------------------------------------------------------ 5. Tres: el lunes abre con un hueco por debajo del stop · −140 € en vez de −30 €
const VIERNES = [0.62, 0.66, 0.6, 0.64, 0.58, 0.62];
const Tres: React.FC<P> = ({ t }) => {
  const x0 = 130;
  const x1 = 950;
  const yv = (v: number) => 560 + (0.75 - v) * 900;
  const paso = 90;
  const cierre = VIERNES[VIERNES.length - 1];
  const yCierre = yv(cierre);
  const yStop = yv(0.56);
  const yLunes = yv(0.3);
  const gap = L(t, EV.hueco - 0.6, EV.hueco - 0.2, 0, 1);
  const lunes = L(t, EV.abajo - 0.6, EV.abajo - 0.1, 0, 1);
  const salta = L(t, EV.salta - 0.1, EV.precio + 0.1, 0, 1);
  const xLunes = x0 + paso * 8.6;
  const yPunto = yStop + (yLunes - yStop) * salta;
  return (
    <>
      <CamaraTiembla t={t} t0={EV.abajo - 0.1} a={0.015}>
        <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
          {VIERNES.map((v, i) => {
            const a = i ? VIERNES[i - 1] : v - 0.03;
            const x = x0 + paso * (i + 0.5);
            return <rect key={i} x={x - 26} y={Math.min(yv(a), yv(v))} width={52} height={Math.max(5, Math.abs(yv(v) - yv(a)))} fill={v >= a ? "#fff" : "#000"} stroke="#fff" strokeWidth={4} />;
          })}
          <line x1={x0} x2={x1} y1={yCierre} y2={yCierre} stroke="#fff" strokeWidth={3} strokeDasharray="14 10" opacity={0.7} />
          <text x={x1} y={yCierre - 16} textAnchor="end" fontFamily="monospace" fontWeight={700} fontSize={28} fill="#fff" opacity={0.8}>CIERRE DEL VIERNES</text>
          <line x1={x0} x2={x1} y1={yStop} y2={yStop} stroke={ROJO} strokeWidth={5} />
          <text x={x0} y={yStop + 40} fontFamily="monospace" fontWeight={800} fontSize={30} fill={ROJO}>STOP −30 €</text>
          {gap > 0 && <rect x={x0 + paso * 6.3} y={yCierre} width={paso * 1.7} height={(yLunes - yCierre) * gap} fill={ROJO} opacity={0.12} />}
          {lunes > 0 && <rect x={xLunes - 26} y={yLunes - 30 * lunes} width={52} height={60 * lunes + 4} fill={ROJO} stroke={ROJO} strokeWidth={4} />}
          {salta > 0 && (
            <>
              <line x1={xLunes} x2={xLunes} y1={yStop} y2={yPunto} stroke={ROJO} strokeWidth={4} strokeDasharray="8 6" />
              <circle cx={xLunes} cy={yPunto} r={14} fill={ROJO} style={{ filter: `drop-shadow(0 0 12px ${ROJO})` }} />
            </>
          )}
        </svg>
      </CamaraTiembla>
      <Titulo t={t} t0={EV.lunes - 0.2} texto="LUNES · APERTURA" top={390} />
      <Ficha t={t} t0={EV["140"] - 0.3} texto="−140 €" color={ROJO} size={130} x={ANCHO / 2} y={1330} sub="NO 30" />
      <FlashRojo t={t} t0={EV.abajo - 0.1} o={0.14} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: el viernes, antes del cierre: cerrar o tamaño pequeño
const Opcion: React.FC<{ t: number; t0: number; x: number; titulo: string; pie: string; icono: React.ReactNode }> = ({ t, t0, x, titulo, pie, icono }) => {
  const g = muelle(t, t0, 220, 14);
  if (g < 0.01) return null;
  return (
    <div style={{ position: "absolute", left: x, top: 520, width: 400, height: 500, borderRadius: 30, border: `3px solid ${VERDE}`, background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, color: "#fff", opacity: Math.min(g * 1.5, 1), transform: `translateY(${(1 - Math.min(g, 1)) * 80}px)` }}>
      {icono}
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 60, color: VERDE, textAlign: "center", lineHeight: 1.05, whiteSpace: "pre-line" }}>{titulo}</span>
      <span style={{ ...mono(28), fontWeight: 700, textAlign: "center", whiteSpace: "normal", lineHeight: 1.25, padding: "0 30px", opacity: 0.8 }}>{pie}</span>
    </div>
  );
};
const Giro: React.FC<P> = ({ t }) => {
  const cierra = L(t, EV.controlas - 0.5, EV.controlas, 0, 1);
  return (
    <>
      <Foco x={ANCHO / 2} y={1100} w={900} h={130} o={0.08} />
      <Titulo t={t} t0={EV.cierre - 0.6} texto="VIERNES, ANTES DEL CIERRE" top={400} fin={EV.controlas - 0.4} />
      {cierra > 0 ? (
        <>
          <Candado x={ANCHO / 2} y={760} abierto={1 - cierra} color={VERDE} size={240} />
          <Titulo t={t} t0={EV.controlas - 0.3} texto="EL FIN DE SEMANA NO LO CONTROLAS" top={1000} color={VERDE} />
        </>
      ) : (
        <>
          <Opcion t={t} t0={EV.cierras - 0.4} x={110} titulo="CERRAR" pie="LA OPERACIÓN ANTES DEL CIERRE"
            icono={<svg width={110} height={110} viewBox="0 0 50 50"><rect x={6} y={6} width={38} height={38} rx={6} fill="none" stroke="#fff" strokeWidth={3.5} /><path d="M16 16 L34 34 M34 16 L16 34" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" /></svg>} />
          <Opcion t={t} t0={EV.tamano - 0.4} x={570} titulo={"TAMAÑO\nPEQUEÑO"} pie="QUE AGUANTE UN HUECO"
            icono={<svg width={110} height={110} viewBox="0 0 50 50"><rect x={4} y={4} width={42} height={42} rx={6} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="4 4" opacity={0.6} /><rect x={16} y={16} width={18} height={18} rx={4} fill="none" stroke={VERDE} strokeWidth={4} /></svg>} />
        </>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 7. Cierre de conversión
const Cierre: React.FC<P> = (p) => <CierreComenta {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tCuenta={EV.auditada} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["semana", ROJO], "viernes", ["30", ROJO], "domingo", "noticia", "sígueme", "lunes", ["hueco", ROJO], ["140", ROJO], ["solución", VERDE], "cierras", "tamaño", "controlas", "bot", ["auditada", VERDE]]);

const GANCHO = { lineas: ["Tu stop *no_te_protege*", "el *fin_de_semana*"], hasta: EV.semana + 0.45, color: ROJO };
export const Finde: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/finde_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.1} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} />
);
