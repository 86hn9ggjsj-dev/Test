// Reel 5-30-10 de historia real "Un fondo con dos premios Nobel perdió 4.600 millones en menos de 4 meses" (~43 s):
// Long-Term Capital Management (1998). El rascacielos del fondo en rojo con dos medallas Nobel y el contador; la sala con
// la pizarra de fórmulas, +40 % y ×25 prestado; la campana con la cola «casi imposible»; el «sígueme» encima de la
// escena; agosto de 1998, cúpulas de Moscú y el sello IMPAGO; la bola que cae en la cola; la Reserva Federal y 14 bancos
// con 3.600 M; la pregunta «si pasa lo peor, ¿sigo vivo?» y el tamaño que encoge; y el cierre de conversión.
// Tiempos en src/gen/ltcm.json (scripts/ltcm.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/ltcm.json";
import { ANCHO, SANS } from "../Viral/util";
import { euros, L, mono, muelle } from "../Bot/piezas";
import { Camara, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { ROJO, suelo, VERDE } from "../Bot/kit";
import { cuerpoEn } from "../Bot/stick";
import { anclaje, ENCOGE, FlashRojo, MANOS_CABEZA, StickMundo } from "../Bot/comun";
import { CamaraTiembla, Sello } from "../Bot/historia";
import { bancoEdificio, despachoCasa, pizarra, rascacielos, rectXY } from "../Bot/decorados";
import { Abajo, Arriba, Ficha, PantallaPC, Pildora, Rotulo } from "../Bot/ui2d";
import { CierreComenta } from "../Bot/conversion";
import { claves, CtaSeguir, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const LTCM_FPS = datos.fps;
export const LTCM_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;

// ------------------------------------------------------------------ piezas
const Medalla: React.FC<{ x: number; y: number; g: number; giro?: number }> = ({ x, y, g, giro = 0 }) =>
  g < 0.01 ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${Math.min(g, 1.1)}) rotate(${giro}deg)`, opacity: Math.min(g * 1.5, 1) }}>
      <svg width={170} height={230} viewBox="0 0 68 92">
        <path d="M18 2 L30 34 L38 34 L26 2 Z M50 2 L38 34 L30 34 L42 2 Z" fill="#000" stroke="#fff" strokeWidth={2.2} strokeLinejoin="round" />
        <circle cx={34} cy={60} r={26} fill="#000" stroke="#fff" strokeWidth={3} />
        <circle cx={34} cy={60} r={20} fill="none" stroke="#fff" strokeWidth={1.4} opacity={0.6} />
        <text x={34} y={64} textAnchor="middle" fontFamily="monospace" fontWeight={800} fontSize={10} fill="#fff">NOBEL</text>
      </svg>
    </div>
  );
// Campana de probabilidad (2D) con la cola izquierda marcada; bola: 0…1 cae en la cola
const Campana: React.FC<{ x: number; y: number; w: number; h: number; t: number; marca: number; bola: number }> = ({ x, y, w, h, t, marca, bola }) => {
  const pts = Array.from({ length: 81 }, (_, i) => {
    const u = i / 80;
    const z = (u - 0.55) * 7;
    return [u * w, h - h * 0.92 * Math.exp(-z * z / 2)];
  });
  const d = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join("");
  const cola = pts.filter(([px]) => px < w * 0.16);
  const dCola = `M0,${h} ` + cola.map(([px, py]) => `L${px.toFixed(1)},${py.toFixed(1)}`).join(" ") + ` L${(w * 0.16).toFixed(1)},${h} Z`;
  const bx = w * 0.08;
  const by = -60 + (h - 20 + 60) * Math.min(1, bola * bola);
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <line x1={0} x2={w} y1={h} y2={h} stroke="#fff" strokeWidth={2} opacity={0.6} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={4} />
      <path d={dCola} fill={ROJO} opacity={0.25 + 0.5 * marca} />
      {bola > 0 && <circle cx={bx} cy={by} r={16} fill={ROJO} style={{ filter: `drop-shadow(0 0 12px ${ROJO})` }} />}
      {marca > 0.01 && (
        <g opacity={marca}>
          <line x1={w * 0.08} x2={w * 0.22} y1={h - 30} y2={h - 140} stroke={ROJO} strokeWidth={3} />
          <text x={w * 0.23} y={h - 150} fontFamily="monospace" fontWeight={800} fontSize={40} fill={ROJO}>CASI IMPOSIBLE</text>
        </g>
      )}
      <text x={w * 0.55} y={h + 44} textAnchor="middle" fontFamily="monospace" fontSize={28} fill="#fff" opacity={0.6}>LO NORMAL</text>
    </svg>
  );
};
// Pizarra de la sala: la proyecta y devuelve su caja en pantalla
const PIZ = { c: [0.15, 0.05, -0.9] as V3, w: 1.5, h: 0.82 };
const cajaPizarra = (cam: Camara) => {
  const pr = proyector(cam);
  const a = pr([PIZ.c[0] - PIZ.w / 2 + 0.05, PIZ.c[1] + PIZ.h / 2 - 0.05, PIZ.c[2]]);
  const b = pr([PIZ.c[0] + PIZ.w / 2 - 0.05, PIZ.c[1] - PIZ.h / 2 + 0.05, PIZ.c[2]]);
  return { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y };
};
const sala = (tr: Trazo[], t: number) => {
  for (let x = -1.6; x <= 1.61; x += 0.32) tr.push({ t: "l", a: [x, -1, -0.95], b: [x, -1, 1], w: 1, o: 0.12 });
  tr.push({ t: "l", a: [-1.6, -1, -0.95], b: [1.6, -1, -0.95], w: 1.8, o: 0.6 });
  pizarra(tr, PIZ.c, PIZ.w, PIZ.h);
  // Mesa con dos monitores a la derecha
  tr.push({ t: "p", pts: rectXY(0.55, -0.62, 1.2, -0.58, -0.3), w: 2, o: 0.8 });
  for (const x of [0.6, 1.15]) tr.push({ t: "l", a: [x, -0.62, -0.3], b: [x, -1, -0.3], w: 2, o: 0.7 });
  void t;
};
const camSala = (t: number, s: number, e: number, d0: number, d1: number) => orbita([0.15, -0.2, -0.4], L(t, s, e, d0, d1), L(t, s, e, -0.05, 0.05), 0.08, { apertura: 6, centroY: 960 });
const FORMULAS = ["σ = √ Σ(x − μ)² / n", "VaR 99 % = 2,33 · σ", "P(pérdida grande) ≈ 0", "E[r] ≈ 40 %"];
// Cúpulas de Moscú en alambre
const cupulas = (tr: Trazo[], x: number, z: number, k = 1) => {
  for (const [dx, h, r] of [[-0.35, 0.55, 0.12], [0, 0.8, 0.16], [0.35, 0.6, 0.12]] as [number, number, number][]) {
    const cx = x + dx * k;
    const y0 = -1 + h * k;
    tr.push({ t: "p", pts: rectXY(cx - r * 0.7 * k, -1, cx + r * 0.7 * k, y0, z), w: 2, o: 0.9, relleno: "#fff", oRelleno: 0.04 });
    const bulbo: V3[] = Array.from({ length: 25 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const yy = Math.sin(a);
      const ancho = Math.cos(a) * (yy > 0 ? 1 - yy * 0.85 : 1);
      return [cx + ancho * r * k, y0 + r * k + yy * r * 1.25 * k, z];
    });
    tr.push({ t: "p", pts: bulbo, w: 2.2, o: 1, relleno: "#fff", oRelleno: 0.06, luz: 0.2 });
    tr.push({ t: "l", a: [cx, y0 + r * 2.5 * k, z], b: [cx, y0 + r * 3.1 * k, z], w: 2, o: 1 });
    tr.push({ t: "l", a: [cx - 0.03 * k, y0 + r * 2.9 * k, z], b: [cx + 0.03 * k, y0 + r * 2.9 * k, z], w: 2, o: 1 });
  }
};

// ------------------------------------------------------------------ 1. Hook: el rascacielos en rojo, dos medallas Nobel y el contador
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.25, -0.15, -0.3], L(t, s, e, 4.6, 4.2), L(t, s, e, 0.12, -0.04) + sacude(t, EV["4600"] - 0.05, 0.02), 0.1, { apertura: 6, centroY: 1080 });
  const tr: Trazo[] = [...polvo(0.12)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.3);
  rascacielos(tr, 0.45, -0.3, 0.6, 1.8, t, 1);
  const valor = L(t, 0, EV["4600"] + 0.6, 1.2e9, 4.6e9, (u) => 1 - Math.pow(1 - u, 2));
  return (
    <>
      <CamaraTiembla t={t} t0={EV["4600"] - 0.05} a={0.02}>
        <Escena cam={cam} trazos={tr} />
        <Medalla x={220} y={820} g={muelle(t, -0.5, 200, 13)} giro={-8 + 4 * Math.sin(t * 2)} />
        <Medalla x={360} y={860} g={muelle(t, -0.35, 200, 13)} giro={6 + 4 * Math.sin(t * 2 + 1)} />
      </CamaraTiembla>
      <Abajo top={1300}>
        <span style={{ ...mono(66), fontWeight: 800, color: ROJO, fontVariantNumeric: "tabular-nums", textShadow: "0 0 30px rgba(255,77,94,0.5)" }}>{`−${euros(valor)} $`}</span>
      </Abajo>
      <FlashRojo t={t} t0={EV["4600"] - 0.05} o={0.16} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: la sala de las fórmulas · +40 % · ×25 prestado
const s1 = inicio("uno");
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = camSala(t, s, e, 4.0, 3.7);
  const tr: Trazo[] = [...polvo(0.1)];
  sala(tr, t);
  const caja = cajaPizarra(cam);
  const lineas = Math.floor(L(t, EV.modelos - 0.6, EV.prestado - 0.3, 0, FORMULAS.length + 0.99, (u) => u));
  const c = cuerpoEn(t, [[s, { mDx: 0.48, mDy: 0.25, mira: 0.8, boca: 0.5, cejas: 0.3 }], [EV.ano - 0.3, { ...ENCOGE, boca: 0.9, mira: 0 }], [EV.modelos - 0.2, { mDx: 0.5, mDy: 0.3, mira: 0.8, boca: 0.4 }]], { mira: 0.8 }, s - 0.4);
  const a = anclaje(cam, [-0.62, -1, 0.0], 0.44);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: caja.x + 30, top: caja.y + 26, width: caja.w - 60, display: "flex", flexDirection: "column", gap: 18 }}>
        {FORMULAS.slice(0, lineas).map((f, i) => (
          <span key={i} style={{ fontFamily: "monospace", fontSize: 40, color: i === 2 ? ROJO : "#fff", opacity: 0.92, whiteSpace: "nowrap" }}>{f}</span>
        ))}
      </div>
      <StickMundo a={a} c={c} t={t} />
      <Arriba>
        <Pildora t={t} t0={EV.capital - 0.4} size={46}>LONG-TERM CAPITAL</Pildora>
      </Arriba>
      <Ficha t={t} t0={EV["40"] - 0.3} texto="+40 %" color={VERDE} size={110} x={300} y={1180} sub="EN UN AÑO" />
      <Ficha t={t} t0={EV.prestado - 0.35} texto="×25" color={ROJO} size={110} x={760} y={1180} sub="CON DINERO PRESTADO" />
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: la campana: una pérdida grande, «casi imposible»
const s2 = inicio("dos");
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = camSala(t, s, e, 3.4, 3.2);
  const tr: Trazo[] = [...polvo(0.1)];
  sala(tr, t);
  const caja = cajaPizarra(cam);
  const marca = L(t, EV.imposible - 0.6, EV.imposible - 0.2, 0, 1);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Campana x={caja.x + 30} y={caja.y + 40} w={caja.w - 60} h={caja.h - 110} t={t} marca={marca} bola={0} />
      <Arriba>
        <Pildora t={t} t0={s + 0.1} size={40}>LO QUE DECÍAN SUS MODELOS</Pildora>
      </Arriba>
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

// ------------------------------------------------------------------ 5. Tres: agosto de 1998, Rusia, IMPAGO · la bola cae en la cola · la Fed y 14 bancos
const s3 = inicio("tres");
const cBola = EV.esperaba - 1.3;
const cBancos = EV.reserva - 0.4;
const Tres: React.FC<P> = (p) => {
  const { t, s, e } = p;
  if (t < cBola) {
    const cam = orbita([0, -0.3, -0.6], L(t, s, cBola, 4.2, 3.9), L(t, s, cBola, -0.08, 0.06) + sacude(t, EV.deuda - 0.05, 0.02), 0.1, { apertura: 6, centroY: 1080 });
    const tr: Trazo[] = [...polvo(0.12)];
    suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
    cupulas(tr, 0, -1.2, 1.2);
    return (
      <>
        <CamaraTiembla t={t} t0={EV.deuda - 0.05} a={0.02}>
          <Escena cam={cam} trazos={tr} />
        </CamaraTiembla>
        <Arriba>
          <Pildora t={t} t0={s + 0.05} size={52}>AGOSTO 1998</Pildora>
        </Arriba>
        {t > EV.rusia - 0.5 && (
          <div style={{ position: "absolute", left: ANCHO / 2, top: 1120, transform: `translate(-50%, -50%) rotate(-3deg) scale(${Math.min(muelle(t, EV.rusia - 0.5, 220, 14), 1.05)})`, width: 520, padding: "24px 30px", borderRadius: 14, border: "4px solid #fff", background: "#000", color: "#fff" }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44 }}>BONOS DE RUSIA</div>
            {[0.9, 0.7, 0.8].map((w, i) => (
              <div key={i} style={{ height: 12, width: `${w * 100}%`, background: "rgba(255,255,255,0.35)", borderRadius: 6, marginTop: 14 }} />
            ))}
          </div>
        )}
        <Sello t={t} t0={EV.deuda - 0.15} texto="IMPAGO" top={1060} size={100} />
        <FlashRojo t={t} t0={EV.deuda - 0.05} o={0.16} />
      </>
    );
  }
  if (t < cBancos) {
    const cam = camSala(t, cBola, cBancos, 3.4, 3.2);
    const tr: Trazo[] = [...polvo(0.1)];
    sala(tr, t);
    const caja = cajaPizarra(cam);
    const bola = L(t, EV.esperaba - 0.7, EV.esperaba, 0, 1);
    return (
      <>
        <CamaraTiembla t={t} t0={EV.esperaba} a={0.025}>
          <Escena cam={cam} trazos={tr} />
          <Campana x={caja.x + 30} y={caja.y + 40} w={caja.w - 60} h={caja.h - 110} t={t} marca={1} bola={bola} />
        </CamaraTiembla>
        <Arriba>
          <Pildora t={t} t0={cBola + 0.1} size={40} color={ROJO}>LO «IMPOSIBLE» PASA</Pildora>
        </Arriba>
        <FlashRojo t={t} t0={EV.esperaba} o={0.2} />
      </>
    );
  }
  const cam = orbita([0, -0.3, -0.8], L(t, cBancos, e, 5.0, 4.6), L(t, cBancos, e, -0.06, 0.06), 0.14, { apertura: 6, centroY: 1060 });
  const tr: Trazo[] = [...polvo(0.12)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  rascacielos(tr, 0, -1.6, 0.5, 1.5, t, 1);
  // 14 bancos en dos filas que van apareciendo
  for (let k = 0; k < 14; k++) {
    const fila = k < 7 ? 0 : 1;
    const i = k % 7;
    const x = -1.2 + i * 0.4;
    const z = fila === 0 ? 0.2 : -0.5;
    bancoEdificio(tr, x, z, muelle(t, EV["14"] - 0.6 + k * 0.05, 220, 13), fila === 0 ? 1 : 0.7, 0.7);
  }
  const pr = proyector(cam);
  const qf = pr([0, 0.6, -1.6]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Rotulo x={qf.x} y={qf.y} size={30} caja ancla="translate(-50%, -100%)">LTCM</Rotulo>
      <Arriba>
        <Pildora t={t} t0={EV.reserva - 0.3} size={46}>RESERVA FEDERAL</Pildora>
        <Pildora t={t} t0={EV["14"] - 0.3} size={40}>REÚNE A 14 BANCOS</Pildora>
      </Arriba>
      <Ficha t={t} t0={EV["3600"] - 0.3} texto="3.600 M $" color={ROJO} size={110} x={ANCHO / 2} y={1200} sub="DE RESCATE" />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: si mañana pasa lo peor, ¿sigo vivo? Si no, baja el tamaño
const sG = inicio("giro");
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.42, -0.35, -0.35], L(t, s, e, 4.4, 4.1), L(t, s, e, -0.08, 0.04), 0.1, { apertura: 6, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.1)];
  despachoCasa(tr, t, { hora: 9 });
  const c = cuerpoEn(t, [[s, { mira: 0.8, cejas: 0.4, mDx: 0.2, mDy: 0.3, cabeza: 0.1 }], [EV.peor - 0.2, { ...MANOS_CABEZA, mira: 0.7 }], [EV.vivo + 0.2, { mira: 0.8, mDx: 0.45, mDy: -0.1, cejas: 0, boca: 0.3, agobio: 0, mIx: -0.15, mIy: -0.52 }]], { mira: 0.8 }, s - 0.4);
  const a = anclaje(cam, [0.02, -1, -0.15], 0.48);
  const peor = L(t, EV.peor - 0.5, EV.peor, 0, 1);
  const no = t > EV.vivo + 0.1;
  const encoge = L(t, EV.vivo + 0.3, EV.tamano, 1, 0.45, (u) => 1 - Math.pow(1 - u, 2));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <PantallaPC cam={cam}>
        {(w, h) => (
          <svg width={w} height={h}>
            {Array.from({ length: 10 }, (_, i) => {
              const x = w * 0.06 + (w * 0.88 * i) / 10;
              const y = h * (0.45 + 0.04 * Math.sin(i * 1.7));
              const ult = i === 9;
              const alto = ult ? h * 0.5 * peor : h * 0.08;
              return <rect key={i} x={x} y={ult ? h * 0.38 : y} width={w * 0.05} height={Math.max(3, alto)} fill={ult ? ROJO : "#fff"} opacity={ult && peor < 0.05 ? 0 : 1} />;
            })}
            {peor > 0.5 && <text x={w * 0.94} y={h * 0.32} textAnchor="end" fontFamily="monospace" fontWeight={800} fontSize={h * 0.11} fill={ROJO}>LO PEOR</text>}
          </svg>
        )}
      </PantallaPC>
      <StickMundo a={a} c={c} t={t} gorra />
      <Arriba>
        <Pildora t={t} t0={EV.solucion - 0.2} size={42} color={VERDE}>LA SOLUCIÓN, ANTES DE ENTRAR</Pildora>
      </Arriba>
      {t > EV.peor - 0.8 && (
        <div style={{ position: "absolute", left: 140, top: 420, width: 800, padding: "22px 26px", borderRadius: 26, border: "4px solid #fff", background: "rgba(0,0,0,0.92)", color: "#fff", textAlign: "center", transform: `scale(${Math.min(muelle(t, EV.peor - 0.8, 220, 14), 1.04)})` }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, lineHeight: 1.1 }}>Si pasa lo peor,<br />¿sigo vivo?</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 30, marginTop: 20 }}>
            <span style={{ ...mono(44), fontWeight: 800, padding: "8px 34px", borderRadius: 14, border: `3px solid ${VERDE}`, color: VERDE, opacity: no ? 0.35 : 1 }}>SÍ</span>
            <span style={{ ...mono(44), fontWeight: 800, padding: "8px 34px", borderRadius: 14, border: `3px solid ${ROJO}`, color: no ? "#000" : ROJO, background: no ? ROJO : "transparent" }}>NO</span>
          </div>
        </div>
      )}
      {t > EV.vivo + 0.2 && (
        <div style={{ position: "absolute", left: ANCHO / 2, top: 1210, transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", gap: 26 }}>
          <div style={{ width: 160 * encoge, height: 160 * encoge, border: `5px solid ${VERDE}`, borderRadius: 16, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", ...mono(30 * Math.max(encoge, 0.6)), fontWeight: 800, color: VERDE }}>TAMAÑO</div>
          <span style={{ ...mono(44), fontWeight: 800, color: VERDE }}>↓ BÁJALO</span>
        </div>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 7. Cierre de conversión
const Cierre: React.FC<P> = (p) => <CierreComenta {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tCuenta={EV.auditada} mensaje="Así controlo yo lo peor ↓" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["nobel", VERDE], ["4600", ROJO], "capital", ["40", VERDE], "modelos", ["prestado", ROJO], ["imposible", ROJO], "sígueme", "agosto", "rusia", ["deuda", ROJO], "esperaba", "reserva", "14", ["3600", ROJO], ["solución", VERDE], "peor", ["vivo", VERDE], "tamaño", "riesgo", "bot", "privado", ["auditada", VERDE]]);

const GANCHO = { lineas: ["Un fondo con *2_Nobel*", "perdió *4.600_millones*"], hasta: EV.meses + 0.45, colores: [VERDE, ROJO] };
export const Ltcm: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/ltcm_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.1} empujes={0.05} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} />
);
