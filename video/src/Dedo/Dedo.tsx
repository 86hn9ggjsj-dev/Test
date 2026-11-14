// Reel de alcance "Escribió un número en la casilla equivocada y le costó 200 millones" (~38 s). Solo subtítulos abajo:
// las cifras van dentro de la animación. Escenas 3D en wireframe (blanco y negro con rojo y verde puntuales) con el
// stickman 2D dentro: la orden con 610.000 en la casilla equivocada y el contador de pérdidas; 1 acción frente a un bloque
// de 610.000 (sin stickman); Tokio y el botón CANCELAR que no responde; el «sígueme» a mitad; el chaval con gorra que
// compra desde su habitación; los dos, lado a lado, en el mismo minuto; y la pregunta COMPRAR o MIEDO.
// Tiempos en src/gen/dedo.json (scripts/dedo.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/dedo.json";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { euros, L, mono, muelle } from "../Bot/piezas";
import { circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, ROJO, suelo, VERDE } from "../Bot/kit";
import { escritorio, monitor } from "../Bot/monigote";
import { Clave, cuerpoEn, Estado, Stick } from "../Bot/stick";
import { Suelo, SUELO_Y } from "../Bot/plato";
import { anclaje, BRAZOS_ARRIBA, CHOQUE, ENCOGE, Exclama, FlashRojo, MANOS_CABEZA, StickMundo } from "../Bot/comun";
import { claves, CtaSeguir, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const DEDO_FPS = datos.fps;
export const DEDO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fr = (v: number) => ((v % 1) + 1) % 1;

// Contador que corre deprisa hasta la cifra (cifras de ancho fijo para que no baile)
const Contador: React.FC<{ valor: number; signo: string; color: string; size: number; sufijo?: string }> = ({ valor, signo, color, size, sufijo = " $" }) => (
  <div style={{ ...mono(size), color, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
    {signo}
    {euros(valor)}
    {sufijo}
  </div>
);

const CamaraTiembla: React.FC<{ t: number; t0: number; a?: number; children: React.ReactNode }> = ({ t, t0, a = 0.04, children }) => (
  <AbsoluteFill style={{ transform: `translateX(${sacude(t, t0, a) * 420}px) scale(${1 + 0.03 * golpe(t, t0)})` }}>{children}</AbsoluteFill>
);

// ------------------------------------------------------------------ 1. Hook: 610.000 en la casilla equivocada, ENVIAR y −200 millones
const T_ENVIA = EV.costo - 0.45;
const HOOK: Clave[] = [
  [T_ENVIA - 0.25, { mDx: 0.47, mDy: 0.33, boca: 0.4, cejas: 0.3 }],
  [T_ENVIA + 0.15, { mDx: 0.36, mDy: 0.22 }],
  [EV.costo - 0.05, { ...CHOQUE, incl: -0.06 }],
  [EV.costo + 0.45, { ...MANOS_CABEZA, mira: 0.6 }],
  [EV.costo + 0.75, { cabeza: 0.12 }],
  [EV.costo + 0.9, { cabeza: -0.12 }],
  [EV.costo + 1.05, { cabeza: 0 }],
];
const Campo: React.FC<{ etiqueta: string; valor: string; cursor?: boolean; mal?: number; tiembla?: number }> = ({ etiqueta, valor, cursor, mal = 0, tiembla = 0 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, transform: `translateX(${tiembla}px)` }}>
    <span style={mono(24, 0.55)}>{etiqueta}</span>
    <div style={{ height: 112, borderRadius: 14, border: `3px solid ${mal > 0.05 ? ROJO : "#fff"}`, boxShadow: mal > 0.05 ? `0 0 ${30 * mal}px rgba(255,77,94,0.55)` : undefined, display: "flex", alignItems: "center", padding: "0 26px", ...mono(70), color: mal > 0.05 ? ROJO : "#fff" }}>
      {valor}
      {cursor && <span style={{ width: 5, height: 70, background: "#fff", marginLeft: 6 }} />}
    </div>
  </div>
);
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.2, 0], 6, L(t, s, e, -0.3, 0.2), 0.12, { apertura: 40, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.3)];
  suelo(tr, t, -1.25, 0.14, "#fff", 0.3);
  // Tecleo de «610.000» en la casilla de ACCIONES (la equivocada)
  const texto = "610.000";
  const n = Math.max(0, Math.min(texto.length, Math.floor(L(t, 0.15, EV.casilla, 0, texto.length + 0.99, (u) => u))));
  const mal = L(t, EV.equivocada - 0.1, EV.equivocada + 0.1, 0, 1);
  const tiembla = 10 * golpe(t, EV.equivocada) * Math.sin(t * 60);
  const pulsa = golpe(t, T_ENVIA);
  const vuela = L(t, EV.costo - 0.1, EV.costo + 0.5, 0, 1, salida);
  const ry = L(t, 0, EV.costo, -16, 10);
  const contador = muelle(t, EV.costo - 0.05, 160, 14);
  const valor = L(t, EV.costo, EV.dolares - 0.3, 0, 200000000, (u) => 1 - Math.pow(1 - u, 3));
  const c = cuerpoEn(t, HOOK, { mira: 0.8, mDx: 0.36, mDy: 0.22, boca: 0.2 });
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <CamaraTiembla t={t} t0={EV.costo - 0.05}>
        {vuela < 1 && (
          <div style={{ position: "absolute", left: 150, top: 330, width: 780, perspective: 1600 }}>
            <div
              style={{
                padding: "34px 44px 40px",
                borderRadius: 28,
                border: "3px solid #fff",
                background: "rgba(5,5,5,0.92)",
                transform: `rotateY(${ry}deg) rotateX(${6 + 70 * vuela}deg) translateY(${vuela * 260}px)`,
                opacity: 1 - vuela,
                display: "flex",
                flexDirection: "column",
                gap: 30,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={mono(26, 0.85)}>ORDEN DE VENTA</span>
                <span style={mono(26, 0.5)}>J-COM · TOKIO</span>
              </div>
              <Campo etiqueta="ACCIONES" valor={texto.slice(0, n)} cursor={n < texto.length && Math.floor(t * 4) % 2 === 0} mal={mal} tiembla={tiembla} />
              <Campo etiqueta="PRECIO" valor="1 ¥" />
              <div style={{ alignSelf: "center", padding: "18px 70px", borderRadius: 999, border: "3px solid #fff", background: pulsa > 0.05 ? "#fff" : "transparent", color: pulsa > 0.05 ? "#000" : "#fff", transform: `scale(${1 - 0.08 * pulsa})`, ...mono(44), fontWeight: 700 }}>ENVIAR</div>
            </div>
          </div>
        )}
        {contador > 0.01 && (
          <div style={{ position: "absolute", top: 520, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: Math.min(contador * 1.5, 1), transform: `scale(${0.6 + 0.4 * Math.min(contador, 1.1)})` }}>
            <span style={mono(30, 0.7)}>MÁS DE</span>
            <Contador valor={valor} signo="−" color={ROJO} size={96} />
          </div>
        )}
        <Suelo />
        <Stick c={c} ox={290} oy={SUELO_Y} s={320} t={t} />
        <Exclama t={t} t0={EV.costo - 0.05} c={c} ox={290} s={320} />
      </CamaraTiembla>
      <FlashRojo t={t} t0={EV.costo - 0.05} o={0.2} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: quería 1 acción a 610.000 ¥; vendió un bloque de 610.000 a 1 ¥ (sin stickman)
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([L(t, s, e, -0.45, 0.3), -0.35, 0], L(t, s, e, 4.8, 5.4) - 0.3 * golpe(t, EV.yen - 0.05), L(t, s, e, -0.3, 0.22) + sacude(t, EV.yen - 0.05), 0.14, { apertura: 38, centroY: 880 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -0.9, 0.16, "#fff", 0.25);
  // La que quería: una sola acción sobre su peana
  const g1 = Math.min(muelle(t, s + 0.05, 200, 14), 1.05);
  cristal(tr, [-1.0, -0.9, -0.2], [-0.6, -0.62, 0.2], "#fff", 0.7, 0.15, 0.05);
  if (g1 > 0) cristal(tr, [-0.88, -0.62, -0.08], [-0.72, -0.62 + 0.16 * g1, 0.08], "#fff", 1, 0.45, 0.25);
  // La que hizo: un bloque de 610.000 acciones que crece y, al caer el precio a 1 ¥, se pone rojo
  const g2 = Math.min(muelle(t, EV.vendio - 0.1, 90, 12), 1.08);
  const rojo = t >= EV.yen - 0.05;
  if (g2 > 0.01) {
    const w = 0.15 + 0.95 * g2;
    const h = 0.12 + 1.0 * g2;
    const x0 = 0.55 - w / 2;
    cristal(tr, [x0, -0.9, -w / 2], [x0 + w, -0.9 + h, w / 2], rojo ? ROJO : "#fff", 1, 0.25 + 0.6 * golpe(t, EV.yen - 0.05), rojo ? 0.14 : 0.06);
    // Cuadrícula en la cara de delante: muchísimas acciones
    for (let i = 1; i < 12; i++) tr.push({ t: "l", a: [x0 + (w * i) / 12, -0.9, w / 2 + 0.002], b: [x0 + (w * i) / 12, -0.9 + h, w / 2 + 0.002], w: 1, o: 0.3, color: rojo ? ROJO : undefined });
    for (let j = 1; j < 12; j++) tr.push({ t: "l", a: [x0, -0.9 + (h * j) / 12, w / 2 + 0.002], b: [x0 + w, -0.9 + (h * j) / 12, w / 2 + 0.002], w: 1, o: 0.3, color: rojo ? ROJO : undefined });
    for (let i = 1; i < 12; i++) tr.push({ t: "l", a: [x0 + (w * i) / 12, -0.9 + h + 0.002, -w / 2], b: [x0 + (w * i) / 12, -0.9 + h + 0.002, w / 2], w: 1, o: 0.2, color: rojo ? ROJO : undefined });
  }
  const pr = proyector(cam);
  const q1 = pr([-0.8, -0.3, 0]);
  const top2 = -0.9 + 0.12 + 1.0 * Math.max(g2, 0);
  const q2 = pr([0.55, top2 + 0.12, 0]);
  // La etiqueta de «1 ¥» cae sobre el bloque
  const cae = muelle(t, EV.yen - 0.25, 260, 13);
  const y1 = pr([0.55, top2 + 0.02, 0]).y;
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: Math.min(Math.max(q1.x, 200), 880), top: q1.y, transform: "translate(-50%, -100%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: L(t, s, s + 0.3, 0, 1) }}>
        <span style={mono(26, 0.55)}>QUERÍA</span>
        <span style={{ ...mono(40), whiteSpace: "nowrap" }}>1 × 610.000 ¥</span>
      </div>
      {g2 > 0.05 && (
        <div style={{ position: "absolute", left: Math.min(Math.max(q2.x, 280), 800), top: q2.y - (cae > 0 ? 120 : 0), transform: "translate(-50%, -100%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: Math.min(g2 * 1.5, 1) }}>
          <span style={mono(26, 0.55)}>VENDIÓ</span>
          <span style={{ ...mono(44), whiteSpace: "nowrap", color: rojo ? ROJO : "#fff" }}>610.000 ACCIONES</span>
        </div>
      )}
      {cae > 0.01 && (
        <div style={{ position: "absolute", left: Math.min(Math.max(q2.x, 280), 800), top: y1 - 40 - (1 - Math.min(cae, 1)) * 700, transform: `translate(-50%, -100%) rotate(${-8 + 4 * Math.sin(Math.min(cae, 1) * Math.PI)}deg)`, padding: "14px 30px", borderRadius: 16, border: `4px solid ${ROJO}`, background: "#000", ...mono(86), fontWeight: 700, color: ROJO }}>
          1 ¥
        </div>
      )}
      <FlashRojo t={t} t0={EV.yen - 0.05} o={0.18} />
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: Tokio, 2005; aporrea CANCELAR y el sistema no le deja
const s2 = inicio("dos");
const EDIFICIOS = Array.from({ length: 22 }, (_, i) => {
  const r = (n: number) => fr(Math.sin(i * 12.9898 + n * 78.233) * 43758.5453);
  return { x: -2.2 + i * 0.21, z: -1.0 - r(1) * 0.9, w: 0.12 + r(2) * 0.08, h: 0.35 + r(3) * 1.3 };
});
const PULSOS = [-0.5, -0.15, 0.2, 0.5, 0.8].map((d) => EV.cancelarla + d);
const DOS: Clave[] = [
  [s2 + 0.05, { mDx: 0.4, mDy: -0.38, mira: 0.7, ojos: 1.2, cejas: -0.5, boca: -0.3, incl: 0.05 }],
  [EV.cancelarla - 0.3, { agobio: 0.8, cejas: -0.9 }],
  [EV.sistema - 0.05, { ...CHOQUE, incl: -0.06 }],
  [EV.sistema + 0.4, { ...MANOS_CABEZA }],
];
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.3, 0], L(t, s, e, 5.6, 5.0) - 0.25 * golpe(t, EV.sistema), L(t, s, e, -0.3, 0.12) + sacude(t, EV.sistema), 0.12, { apertura: 38, centroY: 880 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.16, "#fff", 0.2);
  // Skyline de Tokio en wireframe, con ventanas encendidas
  EDIFICIOS.forEach((b, i) => {
    const g = Math.min(muelle(t, s - 0.2 + i * 0.03, 160, 14), 1.05);
    if (g <= 0) return;
    const h = b.h * g;
    cristal(tr, [b.x, -1.0, b.z], [b.x + b.w, -1.0 + h, b.z + b.w], "#fff", 0.55, 0.15, 0.04);
    for (let k = 0; k < Math.floor(h / 0.18); k++) {
      if (fr(Math.sin((i + 1) * (k + 3) * 7.13) * 991.7) > 0.55) continue;
      const y = -0.92 + k * 0.18;
      tr.push({ t: "l", a: [b.x + b.w * 0.3, y, b.z + b.w + 0.002], b: [b.x + b.w * 0.7, y, b.z + b.w + 0.002], w: 2.4, o: 0.65 + 0.3 * Math.sin(t * 2 + i + k), luz: 0.5 });
    }
  });
  // Peana con el botón CANCELAR: cada pulsación se hunde y no responde
  const ultimo = PULSOS.filter((p) => t >= p).pop();
  const pulsa = ultimo !== undefined ? golpe(t, ultimo) : 0;
  const rojo = t >= EV.sistema - 0.05;
  cristal(tr, [-0.23, -1.0, 0.3], [-0.03, -0.52, 0.5], "#fff", 0.8, 0.15, 0.06);
  cristal(tr, [-0.2, -0.52, 0.33], [-0.06, -0.47 - 0.03 * pulsa, 0.47], rojo ? ROJO : "#fff", 1, 0.3 + 0.6 * pulsa, 0.2 + 0.4 * pulsa);
  const base = cuerpoEn(t, DOS, { mira: 0.6 }, s - 0.3);
  const aporrea = PULSOS.reduce((acc, p) => acc + Math.max(0, 1 - Math.abs(t - p) / 0.12), 0);
  const c: Estado = t < EV.sistema - 0.1 ? { ...base, mDy: base.mDy - 0.08 * aporrea + 0.06 } : base;
  const a = anclaje(cam, [-0.4, -1.0, 0.4], 0.6);
  const pr = proyector(cam);
  const qb = pr([-0.13, -0.36, 0.4]);
  const qt = pr([0.95, -0.98, 0.3]);
  const errores = PULSOS.filter((p) => t >= p + 0.05);
  const dialogo = muelle(t, EV.sistema - 0.1, 220, 13);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: Math.min(qt.x, 1030), top: qt.y, transform: "translate(-100%, -100%)", opacity: L(t, EV.tokio, EV.tokio + 0.3, 0, 1), ...mono(30, 0.65) }}>TOKIO · 2005</div>
      <div style={{ position: "absolute", left: qb.x, top: qb.y, transform: "translate(-50%, -100%)", ...mono(28), color: rojo ? ROJO : "#fff" }}>CANCELAR</div>
      {errores.map((p, i) => {
        const g = Math.min(muelle(t, p + 0.05, 260, 13), 1.05);
        return (
          <div key={i} style={{ position: "absolute", left: qb.x + 70 + (i % 2) * 120, top: qb.y - 130 - i * 62, transform: `scale(${g})`, padding: "8px 18px", borderRadius: 10, border: `2.5px solid ${ROJO}`, background: "#000", ...mono(28), color: ROJO, opacity: 1 - 0.6 * Math.min(dialogo, 1) }}>
            ✗ ERROR
          </div>
        );
      })}
      {dialogo > 0.01 && (
        <div style={{ position: "absolute", top: 380, left: 190, width: 700, borderRadius: 22, border: `3px solid ${ROJO}`, background: "rgba(0,0,0,0.94)", transform: `scale(${0.7 + 0.3 * Math.min(dialogo, 1.08)})`, opacity: Math.min(dialogo * 1.5, 1), boxShadow: "0 0 60px rgba(255,77,94,0.35)" }}>
          <div style={{ padding: "14px 24px", borderBottom: `2px solid ${ROJO}`, display: "flex", justifyContent: "space-between", ...mono(24, 0.8) }}>
            <span>SISTEMA</span>
            <span>✕</span>
          </div>
          <div style={{ padding: "26px 24px 30px", display: "flex", alignItems: "center", gap: 26 }}>
            <span style={{ ...mono(110), color: ROJO, fontWeight: 700 }}>✗</span>
            <span style={{ ...mono(38), whiteSpace: "normal", lineHeight: 1.25 }}>ORDEN NO CANCELABLE</span>
          </div>
        </div>
      )}
      <StickMundo a={a} c={c} t={t} />
      <FlashRojo t={t} t0={EV.sistema - 0.05} o={0.16} />
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme: «y eso no es lo más loco» con el dedo en alto y el botón
const sS = inicio("sigueme");
const T_SIG = EV.sigueme - 0.15;
const SIGUE: Clave[] = [
  [sS + 0.05, { mDx: 0.22, mDy: 0.42, mira: 0.2, boca: 0.7, cejas: 0.8, ojos: 0.85, cabeza: 0.1 }],
  [EV.loco - 0.3, { cabeza: -0.1 }],
  [EV.loco, { cabeza: 0.1 }],
  [T_SIG - 0.05, { mDx: 0.5, mDy: 0.4, mira: 0.6, boca: 0.6, cejas: 0.5, incl: 0.05, cabeza: 0 }],
  [T_SIG + 0.5, { y: 0.6, mDx: 0.3, mDy: -0.3, mIx: -0.3, mIy: -0.3, incl: 0 }],
  [T_SIG + 0.68, { y: 0.95, ...BRAZOS_ARRIBA, boca: 1, abre: 0.7, ojos: 1.2 }],
  [T_SIG + 0.74, { pIy: 0.28, pDy: 0.28 }],
  [T_SIG + 0.92, { pIy: 0, pDy: 0, y: 0.79 }],
];
const Sigueme: React.FC<P> = (p) => {
  const { t, s, e } = p;
  const c = cuerpoEn(t, SIGUE, {}, s - 0.3);
  const antes = 1 - L(t, T_SIG - 0.2, T_SIG, 0, 1);
  // Mientras dice «y eso no es lo más loco», tres puntos suspensivos que laten encima
  return (
    <>
      {t >= T_SIG - 0.2 ? <CtaSeguir t={t} s={T_SIG} e={e} lema="" sinLema /> : <Escena cam={orbita([0, 0, 0], 9, L(t, s, e, -0.3, 0.2), 0.2, { apertura: 40 })} trazos={polvo(0.35)} />}
      {antes > 0.01 && (
        <div style={{ position: "absolute", top: 520, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 34, opacity: antes }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 42, height: 42, borderRadius: 21, background: "#fff", opacity: 0.3 + 0.7 * Math.max(0, Math.sin((t - s) * 6 - i * 0.9)), transform: `translateY(${-14 * Math.max(0, Math.sin((t - s) * 6 - i * 0.9))}px)` }} />
          ))}
        </div>
      )}
      <Suelo />
      <Stick c={c} ox={t < T_SIG - 0.2 ? 540 - 290 * L(t, T_SIG - 0.6, T_SIG - 0.2, 0, 1) : 250} oy={SUELO_Y} s={330} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 5. Tres: el chaval de la gorra lo ve desde su habitación, compra en el desplome y gana 15 millones
const s3 = inicio("tres");
const CRASH = [...Array.from({ length: 9 }, (_, i) => 1 - 0.02 * i), 0.55, 0.2, 0.05];
const REBOTE = [0.05, 0.12, 0.22, 0.3, 0.42, 0.5, 0.62, 0.7];
const TRES: Clave[] = [
  [EV.chaval - 0.1, { incl: 0.08, mira: 0.9, ojos: 1.25, cejas: 0.5, boca: 0 }],
  [EV.compro - 0.3, { mDx: 0.5, mDy: -0.12, boca: 0.4, mIx: -0.2, mIy: -0.4 }],
  [EV.compro, { mDy: -0.22 }],
  [EV.compro + 0.25, { mDy: -0.1, mDx: 0.45 }],
  [EV.quince - 0.35, { ...BRAZOS_ARRIBA, boca: 1, abre: 0.7, ojos: 1.2, cejas: 0.8, incl: 0, mira: 0.3 }],
];
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.1, -0.25, 0], L(t, s, e, 6.0, 5.0), L(t, s, e, -0.32, 0.12), 0.1, { apertura: 38, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.2)];
  // Habitación: suelo, pared del fondo y una ventana con la ciudad de noche
  suelo(tr, t, -1.0, 0.14, "#fff", 0);
  tr.push({ t: "p", pts: [[-1.4, -1.0, -0.7], [-1.4, 0.75, -0.7], [1.4, 0.75, -0.7], [1.4, -1.0, -0.7]], w: 2, o: 0.55 });
  tr.push({ t: "p", pts: [[0.3, -0.15, -0.69], [1.05, -0.15, -0.69], [1.05, 0.48, -0.69], [0.3, 0.48, -0.69], [0.3, -0.15, -0.69]], w: 2.4, o: 0.9, relleno: "#000", oRelleno: 0.9 });
  tr.push({ t: "l", a: [0.675, -0.15, -0.69], b: [0.675, 0.48, -0.69], w: 1.6, o: 0.7 });
  for (let i = 0; i < 26; i++) {
    const x = 0.33 + fr(Math.sin(i * 3.7) * 99.1) * 0.69;
    const y = -0.12 + fr(Math.sin(i * 5.3) * 71.3) * 0.32;
    tr.push({ t: "e", c: [x, y, -0.69], r: 0.004, tipo: "punto", o: 0.4 + 0.4 * Math.sin(t * 3 + i), luz: 0.4 });
  }
  escritorio(tr, -0.15, 0.95, -0.32);
  // Dos monitores: el desplome y, al comprar, el rebote en verde
  const n = Math.round(L(t, s, EV.compro - 0.1, 3, CRASH.length, (u) => u));
  const nR = Math.round(L(t, EV.compro, EV.minutos, 1, REBOTE.length, (u) => u));
  monitor(tr, [0.15, 0.0, 0], 0.48, 0.34, (p) => {
    const pts = CRASH.slice(0, n).map((v, i) => p(i / (CRASH.length + REBOTE.length - 2), 0.1 + v * 0.8));
    tr.push({ t: "p", pts, w: 2.4, o: 1, luz: 0.3 });
    if (t >= EV.compro) {
      const r = REBOTE.slice(0, nR).map((v, i) => p((CRASH.length - 1 + i) / (CRASH.length + REBOTE.length - 2), 0.1 + v * 0.8));
      tr.push({ t: "p", pts: r, w: 3, o: 1, luz: 0.5, color: VERDE });
      tr.push({ t: "e", c: r[r.length - 1], r: 0.012, tipo: "punto", o: 1, luz: 1, color: VERDE });
    }
  });
  monitor(tr, [0.68, 0.0, 0], 0.48, 0.34, (p) => {
    for (let i = 0; i < 6; i++) tr.push({ t: "l", a: p(0.08, 0.85 - i * 0.14), b: p(0.08 + 0.3 + 0.5 * fr(Math.sin(i * 9.1) * 31.7), 0.85 - i * 0.14), w: 1.6, o: 0.6 });
  });
  const base = cuerpoEn(t, TRES, { mira: 0.8, ojos: 1.05 }, s - 0.3);
  const h = (() => {
    const u = (t - EV.quince + 0.1) / 0.36;
    return u > 0 && u < 1 ? 0.2 * Math.sin(Math.PI * u) : 0;
  })();
  const c: Estado = { ...base, y: base.y + h, pIy: base.pIy + h * 1.15, pDy: base.pDy + h * 1.15 };
  const a = anclaje(cam, [-0.45, -1.0, 0.3], 0.6);
  const contador = muelle(t, EV.quince - 0.25, 170, 14);
  const valor = L(t, EV.quince - 0.2, EV.minutos + 0.4, 0, 15000000, (u) => 1 - Math.pow(1 - u, 3));
  const verde = t < EV.compro ? 0 : 0.12 * Math.exp(-(t - EV.compro) * 3);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <StickMundo a={a} c={c} t={t} gorra />
      {contador > 0.01 && (
        <div style={{ position: "absolute", top: 330, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: Math.min(contador * 1.5, 1), transform: `scale(${0.6 + 0.4 * Math.min(contador, 1.1)})` }}>
          <span style={mono(28, 0.7)}>MÁS DE</span>
          <Contador valor={valor} signo="+" color={VERDE} size={92} />
        </div>
      )}
      {verde > 0.005 && <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(47,224,138,${verde}))` }} />}
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: el mismo minuto; uno pulsa sin mirar, el otro estaba mirando
const sG = inicio("giro");
const IZQ: Clave[] = [
  [sG + 0.05, { mira: -0.7, boca: 0.3, cejas: 0.2 }],
  [EV.pulso - 0.35, { mira: 0.9, cabeza: 0.15, ojos: 0.12, boca: 0.4, mIx: -0.5, mIy: -0.05 }],
  [EV.pulso + 0.05, { mIx: -0.56, mIy: -0.15 }],
  [EV.pulso + 0.6, { ...CHOQUE, mira: -0.8, cabeza: 0, incl: 0.05 }],
  [EV.otro - 0.1, { ...MANOS_CABEZA, mira: -0.5 }],
];
const DER: Clave[] = [
  [sG + 0.05, { mira: 0.9, ojos: 1.15, cejas: 0.4, incl: 0.04 }],
  [EV.otro - 0.2, { mDx: 0.12, mDy: 0.24, ojos: 1.3, cejas: 0.7, boca: 0.3 }],
  [EV.mirando - 0.15, { mDx: 0.55, mDy: 0.08, mira: 1, boca: 0.8 }],
];
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.25, 0], L(t, s, e, 7.2, 6.8) - 0.2 * golpe(t, EV.pulso), 0.06 * Math.sin((t - s) * 0.7) + sacude(t, EV.pulso, 0.02), 0.1, { apertura: 38, centroY: 860 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  // Separación entre los dos mundos
  tr.push({ t: "l", a: [0, -1.0, 0], b: [0, 0.75, 0], w: 2, o: 0.5, luz: 0.3 });
  // Monitores en sus pies: rojo a la izquierda, verde a la derecha
  const pinta = (x: number, color: string, cae: boolean) => {
    tr.push({ t: "l", a: [x, -1.0, -0.2], b: [x, -0.32, -0.2], w: 2, o: 0.8 });
    monitor(tr, [x, -0.1, -0.2], 0.42, 0.3, (p) => {
      const pts = Array.from({ length: 12 }, (_, i) => p(i / 11, cae ? 0.85 - (i < 8 ? i * 0.02 : 0.16 + (i - 8) * 0.2) : 0.15 + (i < 8 ? 0.02 * i : 0.16 + (i - 8) * 0.18)));
      tr.push({ t: "p", pts, w: 2.6, o: 1, luz: 0.5, color });
    });
  };
  pinta(-0.98, ROJO, true);
  pinta(0.98, VERDE, false);
  // Reloj compartido: el mismo minuto
  const rc: V3 = [0, 0.5, -0.2];
  tr.push({ t: "p", pts: circulo(rc, 0.13, "z", 36), w: 2.4, o: 1, relleno: "#000", oRelleno: 0.9 });
  const ah = (t - s) * 6;
  tr.push({ t: "l", a: rc, b: [rc[0] + Math.sin(ah) * 0.1, rc[1] + Math.cos(ah) * 0.1, rc[2]], w: 2.2, o: 1 });
  tr.push({ t: "l", a: rc, b: [rc[0] + 0.06 * Math.sin(1.2), rc[1] + 0.06 * Math.cos(1.2), rc[2]], w: 3, o: 1 });
  const ci = cuerpoEn(t, IZQ, { mira: -0.6 }, s - 0.3);
  const cd = cuerpoEn(t, DER, { mira: 0.9 }, s - 0.3);
  const ai = anclaje(cam, [-0.48, -1.0, 0.3], 0.55);
  const ad = anclaje(cam, [0.48, -1.0, 0.3], 0.55);
  const pr = proyector(cam);
  const qi = pr([-0.75, 0.28, -0.2]);
  const qd = pr([0.75, 0.28, -0.2]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qi.x, top: qi.y, transform: `translate(-50%, -100%) scale(${1 + 0.25 * golpe(t, EV.pulso)})`, ...mono(54), color: ROJO, fontWeight: 600, opacity: L(t, s, s + 0.3, 0, 1) }}>−200 M $</div>
      <div style={{ position: "absolute", left: qd.x, top: qd.y, transform: `translate(-50%, -100%) scale(${1 + 0.25 * golpe(t, EV.mirando)})`, ...mono(54), color: VERDE, fontWeight: 600, opacity: L(t, s, s + 0.3, 0, 1) }}>+15 M $</div>
      <StickMundo a={ai} c={ci} t={t} />
      <StickMundo a={ad} c={cd} t={t + 1.1} gorra />
      <FlashRojo t={t} t0={EV.pulso + 0.05} o={0.12} />
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta: ¿COMPRAR o MIEDO? (sin stickman)
const Boton: React.FC<{ x: number; texto: string; color: string; activo: number; g: number; giro: number }> = ({ x, texto, color, activo, g, giro }) => (
  <div style={{ position: "absolute", left: x, top: 470, width: 420, perspective: 1200, opacity: Math.min(Math.max(g, 0) * 1.5, 1) }}>
    <div style={{ height: 190, borderRadius: 30, border: `4px solid ${color}`, background: `rgba(${color === VERDE ? "47,224,138" : "255,77,94"},${0.06 + 0.25 * activo})`, boxShadow: activo > 0.05 ? `0 0 ${60 * activo}px ${color}66` : undefined, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotateY(${giro}deg) scale(${(0.7 + 0.3 * Math.min(Math.max(g, 0), 1.1)) * (1 + 0.06 * activo)})`, ...mono(64), fontWeight: 700, color }}>
      {texto}
    </div>
  </div>
);
const Pregunta: React.FC<P> = ({ t, s, e }) => {
  const izq = L(t, EV.comprado - 0.15, EV.comprado + 0.1, 0, 1) * (1 - L(t, EV.miedo - 0.3, EV.miedo - 0.1, 0, 1));
  const der = L(t, EV.miedo - 0.15, EV.miedo + 0.1, 0, 1) * (1 - L(t, EV.etiqueta + 0.2, EV.etiqueta + 0.5, 0, 1));
  const ambos = L(t, EV.etiqueta + 0.2, EV.etiqueta + 0.5, 0, 1) * (0.5 + 0.5 * Math.sin((t - s) * 5));
  // Cursor que duda entre los dos botones
  const cx = 540 + 250 * Math.sin((t - s) * 2.4) * (1 - 0.3 * ambos);
  const cy = 690 + 30 * Math.sin((t - s) * 4.1);
  const punto = (i: number) => 0.35 + 0.65 * Math.max(0, Math.sin((t - s) * 7 - i * 0.9));
  return (
    <>
      <Escena cam={orbita([0, 0, 0], 9, L(t, s, e, -0.3, 0.2), 0.2, { apertura: 40 })} trazos={polvo(0.35)} />
      <Boton x={80} texto="COMPRAR" color={VERDE} activo={Math.max(izq, ambos)} g={muelle(t, s + 0.05, 220, 14)} giro={10} />
      <Boton x={580} texto="MIEDO" color={ROJO} activo={Math.max(der, ambos)} g={muelle(t, s + 0.15, 220, 14)} giro={-10} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={`M${cx},${cy} l0,64 l16,-15 l12,27 l10,-5 l-12,-26 l22,-2 z`} fill="#fff" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", top: 820, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, s + 0.3, s + 0.6, 0, 1) }}>
        <svg width={360} height={216} viewBox="0 0 300 180">
          <path d="M40 10 H260 A30 30 0 0 1 290 40 V100 A30 30 0 0 1 260 130 H110 L70 168 L80 130 H40 A30 30 0 0 1 10 100 V40 A30 30 0 0 1 40 10 Z" fill="none" stroke="#fff" strokeWidth={3} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={110 + i * 40} cy={70} r={11} fill="#fff" opacity={punto(i)} />
          ))}
        </svg>
      </div>
      <div style={{ position: "absolute", top: 1100, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, EV.etiqueta - 0.1, EV.etiqueta + 0.2, 0, 1, salida) }}>
        <span style={{ ...mono(32, 0.9), padding: "14px 28px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.6)" }}>↓ ETIQUETA AL QUE PULSA SIN MIRAR</span>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves(["casilla", ["200", ROJO], "610.000", ["yen", ROJO], "cancelarla", "sistema", "loco", "Sígueme", "chaval", "compró", ["15", VERDE], "Mismo", "mirar", "mirando", "comprado", "miedo", "Etiqueta"]);

export const Dedo: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/dedo_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
