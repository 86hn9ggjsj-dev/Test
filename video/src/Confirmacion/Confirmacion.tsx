// Reel de alcance "Compras y luego buscas vídeos de por qué va a subir" (~32 s). Solo subtítulos abajo y el «sígueme»
// grande en medio. Escenas 3D en wireframe con el stickman 2D: pulsa COMPRAR y abre el buscador lleno de vídeos «va a
// subir»; un embudo por el que solo pasan las noticias verdes (sin stickman); se tapa los oídos y las velas verdes le
// parecen señales; el «sígueme»; la libreta con «me equivoco si…» y la línea de invalidación; el precio la cruza, cierra
// y se cierran el buscador y el grupo; y la pregunta NINGUNO o DEMASIADOS.
// Tiempos en src/gen/confirmacion.json (scripts/confirmacion.py).
import React from "react";
import { useCurrentFrame } from "remotion";
import datos from "../gen/confirmacion.json";
import { ANCHO } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, ROJO, suelo, velas, VERDE } from "../Bot/kit";
import { Clave, cuerpoEn } from "../Bot/stick";
import { anclaje, Exclama, SiguemeStick, StickMundo } from "../Bot/comun";
import { fr, PreguntaDos, Sello } from "../Bot/historia";
import { claves, golpe, Montaje, P, paseo, sacude } from "../Explica/Montaje";

export const CONFIRMACION_FPS = datos.fps;
export const CONFIRMACION_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;

// Ventana de navegador con el buscador y miniaturas de vídeos «va a subir»
const VIDEOS = ["VA A EXPLOTAR ↑", "SUBIDA SEGURA ↑", "NO VENDAS ↑", "ESTO SE VA A LA LUNA ↑"];
const Buscador: React.FC<{ t: number; t0: number; tVideos: number; fuera?: number; cerrado?: number }> = ({ t, t0, tVideos, fuera = 0, cerrado = 0 }) => {
  const g = muelle(t, t0, 200, 14);
  if (g <= 0.01 || fuera >= 1) return null;
  const texto = "¿VA A SUBIR?";
  const n = Math.floor(L(t, t0 + 0.2, t0 + 1.0, 0, texto.length + 0.99, (u) => u));
  return (
    <div style={{ position: "absolute", left: 130, top: 300, width: 820, perspective: 1500, opacity: Math.min(g * 1.5, 1) * (1 - fuera) }}>
      <div style={{ borderRadius: 24, border: "3px solid #fff", background: "rgba(5,5,5,0.94)", padding: "20px 24px 26px", transform: `rotateY(${-10 + 4 * Math.sin(t * 0.8)}deg) rotateX(6deg) scale(${(0.8 + 0.2 * Math.min(g, 1.05)) * (1 - 0.3 * cerrado)})` }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 16, height: 16, borderRadius: 8, border: "2px solid #fff", opacity: 0.6 }} />
          ))}
        </div>
        <div style={{ borderRadius: 999, border: "2px solid #fff", padding: "14px 24px", ...mono(36), display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ opacity: 0.6 }}>⌕</span>
          <span>{texto.slice(0, Math.min(n, texto.length))}</span>
          {n < texto.length && <span style={{ width: 3, height: 36, background: "#fff" }} />}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}>
          {VIDEOS.map((v, i) => {
            const gv = muelle(t, tVideos - 0.3 + i * 0.15, 240, 14);
            return (
              <div key={v} style={{ borderRadius: 14, border: `2px solid ${VERDE}`, padding: "14px 14px", height: 120, display: "flex", flexDirection: "column", justifyContent: "space-between", opacity: Math.min(Math.max(gv, 0) * 1.5, 1), transform: `scale(${0.7 + 0.3 * Math.min(Math.max(gv, 0), 1.05)})` }}>
                <span style={{ ...mono(24), color: VERDE, whiteSpace: "normal" }}>{v}</span>
                <span style={{ ...mono(20, 0.5) }}>▶ 1,2 M visitas</span>
              </div>
            );
          })}
        </div>
      </div>
      {cerrado > 0.01 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ ...mono(220), color: ROJO, fontWeight: 700, opacity: cerrado, transform: `scale(${0.6 + 0.4 * cerrado})` }}>✗</span>
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------------ 1. Hook: pulsa COMPRAR y abre el buscador
const HOOK: Clave[] = [
  [0.05, { mDx: 0.48, mDy: -0.12, boca: 0.6, cejas: 0.4, mira: 0.8 }],
  [0.45, { mDx: 0.3, mDy: -0.3 }],
  [EV.videos - 0.7, { mDx: 0.2, mDy: -0.05, mIx: -0.05, mIy: -0.1, mira: 0.3, agacha: 0.35, boca: 0.8, ojos: 1.15 }],
];
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.4, 0], L(t, s, e, 4.0, 3.6), L(t, s, e, -0.15, 0.1), 0.1, { apertura: 38, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  const pulsa = golpe(t, 0.25);
  cristal(tr, [-0.02, -1, 0.2], [0.22, -0.55, 0.44], "#fff", 0.8, 0.15, 0.05);
  cristal(tr, [0.02, -0.55, 0.24], [0.18, -0.5 - 0.03 * pulsa, 0.4], VERDE, 1, 0.3 + 0.6 * pulsa, 0.25 + 0.4 * pulsa);
  const c = cuerpoEn(t, HOOK, { mira: 0.8 });
  const a = anclaje(cam, [-0.35, -1, 0.35], 0.55);
  const pr = proyector(cam);
  const qb = pr([0.1, -0.44, 0.32]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qb.x, top: qb.y, transform: "translate(-50%, -100%)", ...mono(30), fontWeight: 700, color: VERDE }}>COMPRAR</div>
      <Buscador t={t} t0={1.0} tVideos={EV.videos} />
      <StickMundo a={a} c={c} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: el embudo del sesgo — solo pasan las noticias verdes (sin stickman)
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.2, 0], L(t, s, e, 4.2, 3.8), 0.2 * Math.sin((t - s) * 0.5), 0.25, { apertura: 38, centroY: 930 });
  const tr: Trazo[] = [...polvo(0.25)];
  // Embudo: aros que se estrechan
  for (let k = 0; k <= 6; k++) {
    const y = 0.55 - k * 0.18;
    const r = 0.7 - k * 0.1;
    tr.push({ t: "p", pts: circulo([0, y, 0], r, "y", 48), w: k === 0 || k === 6 ? 2.4 : 1.2, o: k === 0 || k === 6 ? 1 : 0.4 });
  }
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    tr.push({ t: "l", a: [Math.cos(a) * 0.7, 0.55, Math.sin(a) * 0.7], b: [Math.cos(a) * 0.1, -0.53, Math.sin(a) * 0.1], w: 1, o: 0.35 });
  }
  // Noticias que caen: las verdes atraviesan el embudo; las rojas rebotan fuera
  for (let i = 0; i < 26; i++) {
    const nace = s + 0.1 + i * 0.17;
    const u = (t - nace) / 1.3;
    if (u < 0 || u > 1) continue;
    const verde = fr(Math.sin(i * 12.9) * 437.5) > 0.45;
    const ang = fr(Math.sin(i * 7.3) * 91.1) * Math.PI * 2;
    let x = Math.cos(ang) * 0.55 * (1 - u * (verde ? 0.85 : 0.2));
    let z = Math.sin(ang) * 0.55 * (1 - u * (verde ? 0.85 : 0.2));
    let y = 1.1 - u * 2.2;
    if (!verde && u > 0.35) {
      const v = (u - 0.35) / 0.65;
      x = Math.cos(ang) * (0.55 + 0.9 * v);
      z = Math.sin(ang) * (0.55 + 0.9 * v);
      y = 0.33 + 0.4 * v - 1.6 * v * v;
    }
    const col = verde ? VERDE : ROJO;
    const w = 0.07;
    const h = 0.045;
    tr.push({ t: "p", pts: [[x - w, y - h, z], [x + w, y - h, z], [x + w, y + h, z], [x - w, y + h, z], [x - w, y - h, z]] as V3[], w: 1.6, o: 1 - 0.3 * u, color: col, relleno: col, oRelleno: 0.25 });
  }
  const pr = proyector(cam);
  const qa = pr([0, 0.6, 0]);
  const qb = pr([0, -0.62, 0]);
  const rot = muelle(t, EV.sesgo - 0.2, 220, 14);
  const decidido = muelle(t, EV.decidido - 0.3, 240, 12);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {rot > 0.01 && (
        <div style={{ position: "absolute", left: qa.x, top: qa.y - 40, transform: `translate(-50%, -100%) scale(${Math.min(rot, 1.05)})`, ...mono(38), fontWeight: 700, whiteSpace: "nowrap" }}>SESGO DE CONFIRMACIÓN</div>
      )}
      <div style={{ position: "absolute", left: qb.x, top: qb.y + 20, transform: "translateX(-50%)", ...mono(28), color: VERDE, whiteSpace: "nowrap" }}>SOLO PASA LO QUE QUIERES OÍR</div>
      {decidido > 0.01 && <Sello t={t} t0={EV.decidido - 0.3} texto="YA LO HABÍAS DECIDIDO" top={1180} color="#fff" size={44} />}
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: se tapa los oídos a lo malo y cada vela verde le parece una señal
const s2 = inicio("dos");
const SERIE2 = paseo(16, 13, 0.5, 0.05);
const DOS: Clave[] = [
  [EV.ignoras - 0.1, { mIx: -0.2, mIy: 0.22, mDx: 0.2, mDy: 0.22, ojos: 0.1, boca: 0.6, cejas: 0.3 }],
  [EV.verde - 0.25, { mIx: -0.15, mIy: -0.52, mDx: 0.52, mDy: 0.15, ojos: 1.3, boca: 1, abre: 0.5, cejas: 0.8, mira: 0.9 }],
];
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.3, -0.3, 0], L(t, s, e, 4.9, 4.5), L(t, s, e, -0.1, 0.1), 0.1, { apertura: 38, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  const lo = Math.min(...SERIE2);
  const hi = Math.max(...SERIE2);
  const ys = SERIE2.map((v) => -0.45 + ((v - lo) / (hi - lo)) * 0.9);
  // Velas: las rojas se apagan, las verdes brillan
  const filtra = L(t, EV.verde - 0.3, EV.verde + 0.2, 0, 1);
  ys.forEach((y, i) => {
    if (i === 0) return;
    const x = 0.0 + i * 0.06;
    const sube = y >= ys[i - 1];
    const o = sube ? 1 : 1 - 0.75 * filtra;
    tr.push({ t: "l", a: [x, Math.min(y, ys[i - 1]) - 0.04, -0.3], b: [x, Math.max(y, ys[i - 1]) + 0.04, -0.3], w: 1.6, o: o * 0.85, color: sube ? (filtra > 0 ? VERDE : undefined) : undefined });
    tr.push({ t: "p", pts: [[x - 0.028, Math.min(y, ys[i - 1]), -0.3], [x + 0.028, Math.min(y, ys[i - 1]), -0.3], [x + 0.028, Math.max(y, ys[i - 1]) + 0.006, -0.3], [x - 0.028, Math.max(y, ys[i - 1]) + 0.006, -0.3], [x - 0.028, Math.min(y, ys[i - 1]), -0.3]], w: 1.6, o, color: sube && filtra > 0 ? VERDE : undefined, relleno: sube ? (filtra > 0 ? VERDE : "#fff") : "#000", oRelleno: sube ? 0.6 : 0.9, luz: sube ? 0.5 * filtra : 0 });
  });
  const pr = proyector(cam);
  // Titulares en contra que se apagan cuando se tapa los oídos
  const contra = ["BAJA LA DEMANDA ↓", "RESULTADOS FLOJOS ↓", "ANALISTAS: VENDER ↓"];
  const tapa = L(t, EV.ignoras - 0.1, EV.ignoras + 0.3, 0, 1);
  const senales = ys.map((y, i) => ({ i, y, sube: i > 0 && y >= ys[i - 1] })).filter((v) => v.sube).slice(-3);
  const c = cuerpoEn(t, DOS, { mira: 0.6 }, s - 0.3);
  const a = anclaje(cam, [-0.3, -1, 0.4], 0.55);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 290, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {contra.map((n, i) => (
          <span key={n} style={{ position: "relative", padding: "8px 18px", borderRadius: 10, border: `2px solid ${ROJO}`, ...mono(28), color: ROJO, opacity: L(t, s + i * 0.1, s + 0.3 + i * 0.1, 0, 1) * (1 - 0.75 * tapa), filter: tapa > 0.1 ? `blur(${3 * tapa}px)` : undefined }}>
            {n}
          </span>
        ))}
      </div>
      {t > EV.senal - 0.4 &&
        senales.map(({ i, y }, k) => {
          const q = pr([0.0 + i * 0.06, y + 0.08, -0.3]);
          const g = muelle(t, EV.senal - 0.4 + k * 0.12, 260, 12);
          return (
            <div key={i} style={{ position: "absolute", left: q.x, top: q.y, transform: `translate(-50%, -100%) scale(${Math.min(g, 1.08)})`, padding: "4px 10px", borderRadius: 8, background: VERDE, color: "#000", ...mono(22), fontWeight: 700 }}>
              SEÑAL
            </div>
          );
        })}
      <StickMundo a={a} c={c} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme
const Sigueme: React.FC<P> = (p) => <SiguemeStick {...p} lema="" />;

// ------------------------------------------------------------------ 5. Tres: antes de entrar, escribe qué tendría que pasar para estar equivocado
const s3 = inicio("tres");
const TRES: Clave[] = [
  [s3 + 0.1, { mDx: 0.3, mDy: -0.25, mira: 0.7, agacha: 0.3, cejas: 0.2, boca: 0 }],
  [EV.equivocado - 0.2, { agacha: 0, mDx: 0.5, mDy: 0.1, mira: 0.9, boca: 0.4 }],
];
const NOTA = "ME EQUIVOCO SI CIERRA POR DEBAJO DE 1.0820";
const Libreta: React.FC<{ t: number; t0: number; t1: number; fuera?: number }> = ({ t, t0, t1, fuera = 0 }) => {
  const g = muelle(t, t0 - 0.3, 200, 14);
  if (g <= 0.01) return null;
  const n = Math.floor(L(t, t0, t1, 0, NOTA.length + 0.99, (u) => u));
  return (
    <div style={{ position: "absolute", left: 130, top: 290, width: 820, perspective: 1400, opacity: Math.min(g * 1.5, 1) * (1 - fuera) }}>
      <div style={{ borderRadius: 18, border: "3px solid #fff", background: "rgba(5,5,5,0.94)", padding: "26px 34px 30px 70px", position: "relative", transform: `rotateX(8deg) rotateY(${6 - 3 * Math.sin(t * 0.7)}deg) scale(${0.8 + 0.2 * Math.min(g, 1.05)})` }}>
        <div style={{ position: "absolute", left: 40, top: 0, bottom: 0, width: 2, background: ROJO, opacity: 0.6 }} />
        <div style={{ ...mono(24, 0.6), marginBottom: 14 }}>ANTES DE ENTRAR</div>
        <div style={{ ...mono(40), whiteSpace: "normal", lineHeight: 1.3, minHeight: 104 }}>
          {NOTA.slice(0, Math.min(n, NOTA.length))}
          {n < NOTA.length && <span style={{ display: "inline-block", width: 4, height: 38, background: "#fff", marginLeft: 4, verticalAlign: "middle" }} />}
        </div>
      </div>
    </div>
  );
};
const yPrecio = (p: number) => -0.75 + ((p - 1.08) / 0.006) * 1.1;
const NIVEL = 1.082;
const PRECIOS = [1.0838, 1.0842, 1.0846, 1.0843, 1.0849, 1.0846, 1.0844, 1.0839, 1.0834, 1.0829, 1.0825, 1.0817, 1.0812];
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.15, -0.35, 0], L(t, s, e, 4.6, 4.3), L(t, s, e, 0.1, -0.1), 0.1, { apertura: 38, centroY: 930 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.1);
  const pts: V3[] = PRECIOS.slice(0, 7).map((p, i) => [0.0 + i * 0.066, yPrecio(p), -0.3]);
  tr.push({ t: "p", pts, w: 2.6, o: 1, luz: 0.3 });
  const linea = L(t, EV.equivocado - 0.4, EV.equivocado + 0.1, 0, 1);
  if (linea > 0) tr.push({ t: "l", a: [-0.05, yPrecio(NIVEL), -0.3], b: [-0.05 + 0.95 * linea, yPrecio(NIVEL), -0.3], w: 2.6, o: 1, dash: "12 9", color: ROJO, luz: 0.4 });
  const pr = proyector(cam);
  const ql = pr([0.9, yPrecio(NIVEL), -0.3]);
  const c = cuerpoEn(t, TRES, { mira: 0.7 }, s - 0.3);
  const a = anclaje(cam, [-0.45, -1, 0.4], 0.5);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Libreta t={t} t0={EV.escribe} t1={EV.equivocado} />
      {linea > 0.5 && <div style={{ position: "absolute", left: Math.min(ql.x, 1000), top: ql.y - 10, transform: "translate(-100%, -100%)", ...mono(26), fontWeight: 700, color: ROJO }}>INVALIDACIÓN</div>}
      <StickMundo a={a} c={c} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: si pasa, cierras; sin vídeos y sin preguntar en el grupo
const sG = inicio("giro");
const GIRO: Clave[] = [
  [EV.cierras - 0.1, { mDx: 0.45, mDy: -0.05, mira: 0.9, boca: 0.2, cejas: 0.1, cabeza: 0.08 }],
  [EV.cierras + 0.4, { mDx: 0.15, mDy: -0.52, cabeza: 0, boca: 0.5, ojos: 0.9 }],
  [EV.grupo - 0.5, { mIx: -0.45, mIy: 0.05, mira: -0.6 }],
];
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.15, -0.35, 0], L(t, s, e, 4.6, 4.3) - 0.15 * golpe(t, EV.cierras), L(t, s, e, -0.05, 0.12) + sacude(t, EV.cierras - 0.05, 0.015), 0.1, { apertura: 38, centroY: 930 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.1);
  const n = Math.round(L(t, s, EV.pasa + 0.3, 7, PRECIOS.length, (u) => u));
  const pts: V3[] = PRECIOS.slice(0, n).map((p, i) => [0.0 + i * 0.066, yPrecio(p), -0.3]);
  tr.push({ t: "p", pts: pts.slice(0, 11), w: 2.6, o: 1, luz: 0.3 });
  if (pts.length > 10) tr.push({ t: "p", pts: pts.slice(10), w: 3, o: 1, color: ROJO, luz: 0.5 });
  tr.push({ t: "l", a: [-0.05, yPrecio(NIVEL), -0.3], b: [0.9, yPrecio(NIVEL), -0.3], w: 2.6, o: 1, dash: "12 9", color: ROJO, luz: 0.4 + 0.5 * golpe(t, EV.pasa) });
  if (n > 11) tr.push({ t: "e", c: [0.0 + 11 * 0.066, yPrecio(PRECIOS[11]), -0.29], r: 0.03, tipo: "aro", o: 1, color: ROJO, luz: 1 });
  const c = cuerpoEn(t, GIRO, { mira: 0.7 }, s - 0.3);
  const a = anclaje(cam, [-0.45, -1, 0.4], 0.5);
  const grupo = muelle(t, EV.grupo - 0.9, 220, 14);
  const tacha = L(t, EV.grupo - 0.2, EV.grupo + 0.1, 0, 1);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Sello t={t} t0={EV.cierras - 0.15} texto="OPERACIÓN CERRADA" top={330} color="#fff" size={56} />
      {grupo > 0.01 && (
        <div style={{ position: "absolute", left: 560, top: 500, width: 420, opacity: Math.min(grupo * 1.5, 1), transform: `scale(${0.7 + 0.3 * Math.min(grupo, 1.05)})` }}>
          <div style={{ position: "relative", borderRadius: 20, border: "2px solid #fff", background: "rgba(5,5,5,0.94)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={mono(22, 0.6)}>GRUPO TRADING · 3 NUEVOS</span>
            <span style={{ ...mono(26), whiteSpace: "normal" }}>¿Alguien sabe si va a subir?</span>
            <span style={{ ...mono(26), whiteSpace: "normal", opacity: 0.7 }}>¿Aguanto o vendo?</span>
            {tacha > 0 && <div style={{ position: "absolute", left: 10, right: 10, top: "50%", height: 8, background: ROJO, transform: `scaleX(${tacha})`, transformOrigin: "0% 50%", borderRadius: 4 }} />}
          </div>
        </div>
      )}
      <StickMundo a={a} c={c} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta: ¿cuántos vídeos viste la última vez que ibas perdiendo?
const Pregunta: React.FC<P> = (p) => <PreguntaDos {...p} izq={{ texto: "NINGUNO", t0: EV.perdiendo - 0.6 }} der={{ texto: "DEMASIADOS", t0: EV.perdiendo + 0.1 }} pie="ETIQUETA AL QUE SIEMPRE PREGUNTA SI VA A SUBIR" tPie={EV.etiqueta} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves(["compras", "vídeos", ["subir", VERDE], "sesgo", "confirmación", "decidido", "ignoras", ["verde", VERDE], "señal", "sígueme", "truco", "escribe", "equivocado", ["cierras", ROJO], "grupo", "perdiendo", "etiqueta"]);

export const Confirmacion: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/confirmacion_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
