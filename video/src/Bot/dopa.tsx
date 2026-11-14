// Recursos de «dopamina» sacados del vídeo de referencia (igexport-DcOvTIOx0Yr), traducidos a nuestro estilo sin cara:
// cifras en fichas 3D que entran de golpe, pruebas que saltan como tarjetas, notificaciones apiladas, iconos que orbitan
// alrededor de la idea, la barra de tiempo roja-amarilla-verde, el móvil que se lanza a cámara como transición y el
// cierre en el móvil (comentario con la palabra → mensaje directo).
import React from "react";
import { ANCHO, SANS, SERIF } from "../Viral/util";
import { L, mono, muelle } from "./piezas";
import { ORO, ROJO, VERDE } from "./kit";
import { P } from "../Explica/Montaje";

const min1 = (g: number, m = 1) => Math.min(g, m);
const brillo = (t: number, t0: number, k = 6) => (t < t0 ? 0 : Math.exp(-(t - t0) * k));

// ------------------------------------------------------------------ cifra en ficha 3D («5 · 30 · 10» de la referencia)
export const Ficha3D: React.FC<{ t: number; t0: number; texto: string; x?: number; y: number; size?: number; color?: string; fin?: number; sub?: string; giro?: number }> = ({ t, t0, texto, x = ANCHO / 2, y, size = 200, color = "#fff", fin, sub, giro = 1 }) => {
  const g = muelle(t, t0, 230, 12);
  const fuera = fin === undefined ? 0 : L(t, fin - 0.2, fin, 0, 1);
  if (g <= 0.01 || fuera >= 1) return null;
  const capas = Array.from({ length: 10 }, (_, i) => `0 ${((i + 1) * size * 0.011).toFixed(1)}px 0 ${i < 9 ? "#1d1d1d" : "#000"}`).join(", ");
  const b = brillo(t, t0, 5);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) perspective(900px) rotateX(${8 + 30 * (1 - min1(g))}deg) rotateY(${giro * -35 * (1 - min1(g))}deg) scale(${(0.3 + 0.7 * min1(g, 1.08)) * (1 - 0.4 * fuera)})`, opacity: min1(g * 2) * (1 - fuera), display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.16 }}>
      <div style={{ padding: `${size * 0.1}px ${size * 0.2}px`, borderRadius: size * 0.2, background: "linear-gradient(165deg, #3b3b3b 0%, #171717 46%, #0a0a0a 100%)", border: `3px solid ${color === "#fff" ? "rgba(255,255,255,0.4)" : color}`, boxShadow: `${capas}, 0 ${size * 0.2}px ${size * 0.45}px rgba(0,0,0,0.85), 0 0 ${size * (0.25 + 0.5 * b)}px ${color}${b > 0.3 ? "99" : "44"}, inset 0 3px 0 rgba(255,255,255,0.22)`, fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1, color, letterSpacing: "-0.04em", whiteSpace: "nowrap" }}>
        {texto}
      </div>
      {sub && <div style={{ ...mono(size * 0.2), fontWeight: 800, letterSpacing: "0.16em", color }}>{sub}</div>}
    </div>
  );
};

// ------------------------------------------------------------------ prueba que salta como tarjeta (estudio, cifra, fuente)
export const Prueba: React.FC<{ t: number; t0: number; x: number; y: number; w?: number; rot?: number; desde?: number; cabecera: string; titulo?: string; cifra?: string; pie?: string; color?: string; fin?: number }> = ({ t, t0, x, y, w = 880, rot = -3, desde = 1, cabecera, titulo, cifra, pie, color = "#fff", fin }) => {
  const g = muelle(t, t0, 190, 14);
  const fuera = fin === undefined ? 0 : L(t, fin - 0.25, fin, 0, 1);
  if (g <= 0.01 || fuera >= 1) return null;
  const b = brillo(t, t0 + 0.15, 4);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, transform: `translate(${desde * (1 - min1(g)) * 760}px, -50%) rotate(${rot + desde * (1 - min1(g)) * 18}deg) scale(${1 - 0.15 * fuera})`, opacity: 1 - fuera }}>
      <div style={{ borderRadius: 30, background: "linear-gradient(180deg, #151515 0%, #070707 100%)", border: `3px solid ${color}`, boxShadow: `0 40px 90px rgba(0,0,0,0.85), 0 0 ${20 + 70 * b}px ${color}${b > 0.3 ? "aa" : "33"}`, padding: "30px 38px", color: "#fff", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width={34} height={42} viewBox="0 0 34 42"><path d="M3 3 H22 L31 12 V39 H3 Z M22 3 V12 H31" fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" /><path d="M9 21 H25 M9 27 H25 M9 33 H19" stroke={color} strokeWidth={2.5} opacity={0.7} /></svg>
          <span style={{ ...mono(34), fontWeight: 800, letterSpacing: "0.1em", color, whiteSpace: "normal" }}>{cabecera}</span>
        </div>
        {titulo && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 72, lineHeight: 1.05 }}>{titulo}</div>}
        {cifra && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 120, lineHeight: 1, letterSpacing: "-0.04em", color }}>{cifra}</div>}
        {pie && <div style={{ ...mono(36, 0.8), fontWeight: 700, whiteSpace: "normal", lineHeight: 1.3 }}>{pie}</div>}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ notificaciones apiladas («Pago recibido» de la referencia)
export type Noti = { t0: number; titulo: string; texto: string; color?: string; letra?: string };
export const Notis: React.FC<{ t: number; items: Noti[]; top?: number; fin?: number; max?: number }> = ({ t, items, top = 400, fin, max = 5 }) => {
  const fuera = fin === undefined ? 0 : L(t, fin - 0.25, fin, 0, 1);
  if (fuera >= 1) return null;
  return (
    <>
      {items.map((n, i) => {
        const g = muelle(t, n.t0, 260, 16);
        if (g <= 0.01) return null;
        // Cada notificación nueva empuja hacia abajo a las anteriores
        const baja = items.slice(i + 1).reduce((a, m) => a + min1(muelle(t, m.t0, 260, 16), 1.05), 0);
        if (baja > max) return null;
        const c = n.color ?? VERDE;
        return (
          <div key={i} style={{ position: "absolute", left: 90, top: top + baja * 150 - (1 - min1(g)) * 120, width: 900, height: 128, borderRadius: 34, background: "rgba(30,30,32,0.95)", border: "1.5px solid rgba(255,255,255,0.18)", boxShadow: "0 18px 50px rgba(0,0,0,0.7)", display: "flex", alignItems: "center", gap: 24, padding: "0 30px", boxSizing: "border-box", opacity: min1(g * 2) * (1 - fuera) * (1 - L(baja, max - 1, max, 0, 1)), transform: `scale(${1 - 0.04 * Math.min(baja, 3)})` }}>
            <div style={{ width: 78, height: 78, borderRadius: 20, background: c, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 44, color: "#000", flexShrink: 0 }}>{n.letra ?? "€"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: "#fff" }}>{n.titulo}</span>
              <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: c }}>{n.texto}</span>
            </div>
            <span style={{ ...mono(24, 0.5), alignSelf: "flex-start", marginTop: 26 }}>ahora</span>
          </div>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ bombilla con iconos que orbitan (la «solución» de la referencia)
export const Bombilla: React.FC<{ x: number; y: number; size?: number; luz: number }> = ({ x, y, size = 260, luz }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 100 130" style={{ position: "absolute", left: x - size / 2, top: y - size * 0.65, overflow: "visible", filter: luz > 0.05 ? `drop-shadow(0 0 ${40 * luz}px ${ORO})` : undefined }}>
    <path d="M50 8 C24 8 10 28 10 48 C10 64 20 74 28 84 C32 90 34 94 34 100 H66 C66 94 68 90 72 84 C80 74 90 64 90 48 C90 28 76 8 50 8 Z" fill={`rgba(245,196,81,${0.85 * luz})`} stroke={luz > 0.5 ? ORO : "#fff"} strokeWidth={4} />
    <path d="M38 100 V86 L44 70 L50 80 L56 70 L62 86 V100" fill="none" stroke={luz > 0.5 ? "#000" : "#fff"} strokeWidth={3} opacity={0.8} />
    <rect x={34} y={104} width={32} height={8} rx={3} fill="#fff" />
    <rect x={36} y={116} width={28} height={8} rx={3} fill="#fff" />
  </svg>
);
export const Orbita: React.FC<{ t: number; t0: number; x: number; y: number; r?: number; simbolos: string[]; colores?: string[] }> = ({ t, t0, x, y, r = 300, simbolos, colores = [] }) => (
  <>
    {simbolos.map((s, i) => {
      const g = muelle(t, t0 + i * 0.08, 220, 13);
      if (g <= 0.01) return null;
      const a = (i / simbolos.length) * Math.PI * 2 + (t - t0) * 0.9;
      const rr = r * (0.4 + 0.6 * min1(g));
      const c = colores[i] ?? "#fff";
      return (
        <div key={i} style={{ position: "absolute", left: x + Math.cos(a) * rr - 52, top: y + Math.sin(a) * rr * 0.62 - 52, width: 104, height: 104, borderRadius: 52, border: `3px solid ${c}`, background: "rgba(10,10,10,0.95)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 46, color: c, opacity: min1(g * 2), transform: `scale(${0.5 + 0.5 * min1(g, 1.1)})`, boxShadow: `0 0 24px ${c}44` }}>
          {s}
        </div>
      );
    })}
  </>
);

// ------------------------------------------------------------------ barra de tiempo roja-amarilla-verde con el marcador
export const BarraTiempo: React.FC<{ t: number; t0: number; y?: number; fin?: number; texto?: string }> = ({ t, t0, y = 760, fin, texto = "TÚ ESTÁS AQUÍ" }) => {
  const g = muelle(t, t0, 220, 15);
  const fuera = fin === undefined ? 0 : L(t, fin - 0.25, fin, 0, 1);
  if (g <= 0.01 || fuera >= 1) return null;
  const W = 840;
  const seg: [number, string][] = [[5, ROJO], [30, ORO], [10, VERDE]];
  const pos = L(t, t0 + 0.1, t0 + 1.1, 0.04, 0.9, (u) => 1 - Math.pow(1 - u, 3));
  const marca = muelle(t, t0 + 1.0, 220, 12);
  let acum = 0;
  return (
    <div style={{ position: "absolute", left: (ANCHO - W) / 2, top: y, width: W, opacity: min1(g * 1.5) * (1 - fuera), transform: `translateY(${(1 - min1(g)) * 60}px)` }}>
      {marca > 0.01 && (
        <div style={{ position: "absolute", left: pos * W, top: -120, transform: `translateX(-50%) scale(${0.5 + 0.5 * min1(marca, 1.1)})`, ...mono(40), fontWeight: 800, color: VERDE, padding: "10px 22px", borderRadius: 14, border: `3px solid ${VERDE}`, background: "#000", opacity: min1(marca * 2) }}>{texto} ↓</div>
      )}
      <div style={{ position: "relative", height: 34, borderRadius: 17, overflow: "hidden", display: "flex", gap: 6 }}>
        {seg.map(([n, c], i) => {
          const w = (n / 45) * (W - 12);
          acum += w;
          return <div key={i} style={{ width: w, height: 34, borderRadius: 8, background: c, opacity: 0.9 }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: pos * W - 28, top: -11, width: 56, height: 56, borderRadius: 28, background: "#fff", border: "6px solid #000", boxShadow: `0 0 30px ${VERDE}` }} />
    </div>
  );
};

// ------------------------------------------------------------------ móvil
export const Movil: React.FC<{ x: number; y: number; w?: number; h?: number; rotX?: number; rotY?: number; rot?: number; s?: number; o?: number; children?: React.ReactNode }> = ({ x, y, w = 540, h = 1020, rotX = 0, rotY = 0, rot = 0, s = 1, o = 1, children }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, perspective: 1800, opacity: o }}>
    <div style={{ position: "relative", width: w, height: h, borderRadius: w * 0.13, border: "7px solid #cfcfcf", background: "#000", overflow: "hidden", boxShadow: "0 0 0 4px #0d0d0d, 0 50px 140px rgba(0,0,0,0.95), 0 0 80px rgba(255,255,255,0.07)", transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotate(${rot}deg) scale(${s})` }}>
      {children}
      <div style={{ position: "absolute", top: 16, left: "50%", width: w * 0.3, height: 34, marginLeft: -w * 0.15, borderRadius: 17, background: "#0b0b0b", border: "1px solid #222" }} />
    </div>
  </div>
);

// App del bróker dentro del móvil: saldo del día y una línea
export const AppBroker: React.FC<{ t: number; pnl: number; serie: number[]; color: string; titulo?: string }> = ({ pnl, serie, color, titulo = "Hoy" }) => {
  const W = 480;
  const H = 360;
  const mn = Math.min(...serie);
  const mx = Math.max(...serie);
  const pts = serie.map((v, i) => `${(i / (serie.length - 1)) * W},${H - ((v - mn) / (mx - mn || 1)) * H}`).join(" ");
  return (
    <div style={{ position: "absolute", inset: 0, padding: "90px 26px 0", display: "flex", flexDirection: "column", gap: 18, color: "#fff" }}>
      <span style={{ ...mono(28, 0.6), fontWeight: 700 }}>{titulo}</span>
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 92, letterSpacing: "-0.04em", color }}>{pnl >= 0 ? "+" : "−"}{Math.abs(pnl).toFixed(2).replace(".", ",")} €</span>
      <svg width={W} height={H} style={{ overflow: "visible", marginTop: 20 }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
      </svg>
      <div style={{ display: "flex", gap: 16, marginTop: 30 }}>
        <div style={{ flex: 1, padding: "22px 0", borderRadius: 18, background: VERDE, color: "#000", textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 34 }}>COMPRAR</div>
        <div style={{ flex: 1, padding: "22px 0", borderRadius: 18, background: ROJO, color: "#000", textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 34 }}>VENDER</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ transición: el móvil se lanza a cámara (como en la referencia)
export const MovilACamara: React.FC<{ t: number; t0: number; dura?: number; children?: React.ReactNode }> = ({ t, t0, dura = 0.55, children }) => {
  if (t < t0 || t > t0 + dura + 0.3) return null;
  const u = L(t, t0, t0 + dura, 0, 1, (v) => v * v);
  const s = 0.45 * Math.pow(16, u);
  const tapa = L(t, t0 + dura - 0.12, t0 + dura, 0, 1);
  const sale = L(t, t0 + dura, t0 + dura + 0.3, 0, 1);
  return (
    <>
      {sale < 1 && <Movil x={540 + 120 * (1 - u)} y={1050 - 250 * u} s={s} rot={-25 + 55 * u} rotX={20 * (1 - u)} o={1 - sale}>{children}</Movil>}
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: tapa * (1 - sale) }} />
    </>
  );
};

// ------------------------------------------------------------------ cierre en el móvil: comentario con la palabra → mensaje directo
export const CierreMovil: React.FC<P & { tComenta: number; tPalabra: number; tPrivado: number; tFinal: number; palabra: string; mensaje: string; final: React.ReactNode }> = ({ t, s, tComenta, tPalabra, tPrivado, tFinal, palabra, mensaje, final }) => {
  const barra = t < tComenta - 0.15;
  const sube = muelle(t, tComenta - 0.45, 120, 16);
  const letras = Math.max(0, Math.min(palabra.length, Math.floor(L(t, tComenta, tPalabra + 0.2, 0, palabra.length + 0.99, (u) => u))));
  const publica = t > tPalabra + 0.4;
  const pub = muelle(t, tPalabra + 0.4, 240, 13);
  const cursor = Math.floor(t * 2.5) % 2 === 0;
  const aviso = muelle(t, tPrivado - 0.35, 220, 16);
  const dm = t > tPrivado + 0.15;
  const m1 = muelle(t, tPrivado + 0.3, 230, 14);
  const m2 = muelle(t, tFinal - 0.2, 200, 13);
  const W = 540;
  return (
    <>
      {barra && <BarraTiempo t={t} t0={s + 0.05} y={780} fin={tComenta - 0.15} />}
      {sube > 0.01 && (
        <Movil x={540} y={880 + (1 - min1(sube)) * 1100} w={W} h={1000} rotX={6 + 20 * (1 - min1(sube))} rotY={-6 * Math.sin(t * 0.8)}>
          {!dm ? (
            <>
              {/* el reel arriba */}
              <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 360, background: "radial-gradient(ellipse at 50% 40%, #1d1d1d, #050505)" }}>
                <svg width={W} height={360} style={{ position: "absolute", inset: 0 }}>
                  <polyline points="40,280 110,240 170,260 240,170 300,200 380,110 450,140 500,80" fill="none" stroke={VERDE} strokeWidth={5} opacity={0.8} />
                </svg>
              </div>
              {/* hoja de comentarios */}
              <div style={{ position: "absolute", left: 0, top: 330, width: W, bottom: 0, borderRadius: "34px 34px 0 0", background: "#121212", padding: "18px 28px", boxSizing: "border-box", color: "#fff" }}>
                <div style={{ width: 70, height: 8, borderRadius: 4, background: "#555", margin: "0 auto 18px" }} />
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, textAlign: "center", marginBottom: 26 }}>Comentarios</div>
                {publica && (
                  <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 26, transform: `scale(${0.7 + 0.3 * min1(pub, 1.08)})`, transformOrigin: "0% 50%", opacity: min1(pub * 1.5), background: `rgba(47,224,138,${0.12 * brillo(t, tPalabra + 0.4, 2)})`, borderRadius: 18, padding: 6 }}>
                    <div style={{ width: 62, height: 62, borderRadius: 31, background: "#fff", flexShrink: 0 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                      <span style={mono(22, 0.6)}>tú · ahora</span>
                      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 54 }}>{palabra}</span>
                    </div>
                    <span style={{ fontSize: 46, color: ROJO, transform: `scale(${1 + 0.5 * brillo(t, tPalabra + 0.6, 5)})` }}>♥</span>
                  </div>
                )}
                {[0.75, 0.55, 0.65].map((w, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24, opacity: 0.45 }}>
                    <div style={{ width: 54, height: 54, borderRadius: 27, border: "3px solid #fff", flexShrink: 0 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ width: 130, height: 13, borderRadius: 7, background: "rgba(255,255,255,0.35)" }} />
                      <div style={{ width: 360 * w, height: 13, borderRadius: 7, background: "rgba(255,255,255,0.5)" }} />
                    </div>
                  </div>
                ))}
                <div style={{ position: "absolute", left: 22, right: 22, bottom: 34, display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", borderRadius: 999, border: `3px solid ${letras > 0 && !publica ? "#fff" : "rgba(255,255,255,0.4)"}`, background: "#000" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 26, background: "#fff", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontFamily: SANS, fontWeight: 700, fontSize: 44, minHeight: 52 }}>
                    {publica ? <span style={{ opacity: 0.4, fontSize: 30, fontWeight: 500 }}>Añade un comentario…</span> : palabra.slice(0, letras)}
                    {!publica && cursor && <span style={{ fontWeight: 300 }}>|</span>}
                  </span>
                  <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: letras >= palabra.length && !publica ? VERDE : "rgba(255,255,255,0.35)" }}>Publicar</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "#050505", padding: "80px 26px 0", boxSizing: "border-box", color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, paddingBottom: 22, borderBottom: "1.5px solid #2a2a2a", marginBottom: 36 }}>
                <div style={{ width: 66, height: 66, borderRadius: 33, border: `3px solid ${VERDE}`, background: "#000" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36 }}>Mensaje directo</span>
                  <span style={mono(22, 0.55)}>activo ahora</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 26 }}>
                <div style={{ padding: "16px 24px", borderRadius: 30, borderBottomRightRadius: 8, background: "#3a3a3c", fontFamily: SANS, fontWeight: 700, fontSize: 40 }}>{palabra}</div>
              </div>
              {m1 > 0.01 && (
                <div style={{ display: "flex", marginBottom: 26, opacity: min1(m1 * 1.5), transform: `scale(${0.7 + 0.3 * min1(m1, 1.08)})`, transformOrigin: "0% 100%" }}>
                  <div style={{ maxWidth: 420, padding: "18px 26px", borderRadius: 30, borderBottomLeftRadius: 8, border: "3px solid #fff", fontFamily: SANS, fontWeight: 600, fontSize: 36, lineHeight: 1.2 }}>{mensaje}</div>
                </div>
              )}
              {m2 > 0.01 && <div style={{ opacity: min1(m2 * 1.5), transform: `scale(${0.7 + 0.3 * min1(m2, 1.08)})`, transformOrigin: "0% 100%" }}>{final}</div>}
            </div>
          )}
          {/* aviso de mensaje directo que baja */}
          {aviso > 0.01 && t < tPrivado + 0.5 && (
            <div style={{ position: "absolute", left: 16, right: 16, top: 60 - (1 - min1(aviso)) * 160, padding: "18px 22px", borderRadius: 28, background: "rgba(44,44,46,0.97)", display: "flex", alignItems: "center", gap: 16, color: "#fff", boxShadow: "0 16px 40px rgba(0,0,0,0.7)" }}>
              <div style={{ width: 58, height: 58, borderRadius: 16, background: VERDE, flexShrink: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30 }}>Mensaje directo</span>
                <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26, opacity: 0.8 }}>Te he escrito por privado</span>
              </div>
            </div>
          )}
        </Movil>
      )}
    </>
  );
};

// Tarjeta final con la cuenta auditada del bot (solo en vídeos que NO son de fondeo)
export const TarjetaAuditada: React.FC = () => (
  <div style={{ width: 470, borderRadius: 28, border: `4px solid ${VERDE}`, padding: "22px 24px", boxShadow: `0 0 40px ${VERDE}55`, background: "#000" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 62, height: 62, borderRadius: 31, background: VERDE, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontSize: 40, fontWeight: 800, fontFamily: SANS }}>✓</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ ...mono(34), fontWeight: 800, color: VERDE }}>CUENTA AUDITADA</span>
        <span style={mono(22, 0.7)}>del bot · verificada</span>
      </div>
    </div>
    <div style={{ marginTop: 18, padding: "12px 0", borderRadius: 14, background: VERDE, color: "#000", textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 32 }}>Ver cuenta →</div>
  </div>
);
