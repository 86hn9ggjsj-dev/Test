// Cierre de conversión de la regla 5-30-10 (los últimos ~10 s, a los que solo llega la gente con más interés):
// «si has llegado hasta aquí» con la barra del vídeo llegando al final, la caja de comentarios que escribe la palabra y
// la publica, y el mensaje directo que llega con la tarjeta «CUENTA AUDITADA ✓». Sin cifras ni promesas sobre el bot.
import React from "react";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "./piezas";
import { Escena, orbita, polvo } from "./tres";
import { ROJO, VERDE } from "./kit";
import { P } from "../Explica/Montaje";

const Avatar: React.FC<{ r: number; o?: number; lleno?: boolean }> = ({ r, o = 1, lleno }) => (
  <div style={{ width: r * 2, height: r * 2, borderRadius: r, border: "3px solid #fff", background: lleno ? "#fff" : "#000", opacity: o, flexShrink: 0 }} />
);
const Barra: React.FC<{ w: number; o?: number }> = ({ w, o = 0.35 }) => <div style={{ width: w, height: 16, borderRadius: 8, background: `rgba(255,255,255,${o})` }} />;

export const CierreComenta: React.FC<P & { tComenta: number; tPalabra: number; tPrivado: number; tCuenta: number; palabra?: string; mensaje?: string }> = ({ t, s, e, tComenta, tPalabra, tPrivado, tCuenta, palabra = "BOT", mensaje = "Te explico cómo lo hago ↓" }) => {
  // Fase 1: la barra del vídeo llega al final
  const f1 = 1 - L(t, tComenta - 0.45, tComenta - 0.2, 0, 1);
  const llena = L(t, s, s + 1.2, 0.86, 0.985, (u) => 1 - Math.pow(1 - u, 2));
  const marca = muelle(t, s + 0.5, 220, 13);
  // Fase 2: comentarios
  const f2 = L(t, tComenta - 0.35, tComenta - 0.1, 0, 1) * (1 - L(t, tPrivado - 0.35, tPrivado - 0.1, 0, 1));
  const letras = Math.max(0, Math.min(palabra.length, Math.floor(L(t, tComenta, tPalabra + 0.15, 0, palabra.length + 0.99, (u) => u))));
  const publica = t > tPalabra + 0.35;
  const pub = muelle(t, tPalabra + 0.35, 240, 14);
  const cursor = Math.floor(t * 2.5) % 2 === 0;
  // Fase 3: mensaje directo
  const f3 = L(t, tPrivado - 0.35, tPrivado - 0.05, 0, 1);
  const m1 = muelle(t, tPrivado + 0.05, 230, 14);
  const m2 = muelle(t, tCuenta - 0.25, 200, 13);
  const panel: React.CSSProperties = { color: "#fff", position: "absolute", left: 130, top: 330, width: 820, borderRadius: 40, border: "3px solid rgba(255,255,255,0.85)", background: "rgba(0,0,0,0.92)", padding: "34px 36px", boxSizing: "border-box" };
  return (
    <>
      <Escena cam={orbita([0, 0, 0], 9, L(t, s, e, -0.3, 0.2), 0.2, { apertura: 40 })} trazos={polvo(0.12, 40)} />
      {f1 > 0.01 && (
        <div style={{ position: "absolute", top: 640, left: 140, width: 800, opacity: f1 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", transform: `translateX(${-(1 - llena) * 800 + 60}px) scale(${0.6 + 0.4 * Math.min(marca, 1.1)})`, opacity: Math.min(marca * 1.5, 1), marginBottom: 26 }}>
            <span style={{ ...mono(40), fontWeight: 700, padding: "10px 22px", borderRadius: 14, border: `3px solid ${VERDE}`, color: VERDE, background: "#000" }}>TÚ ESTÁS AQUÍ ↓</span>
          </div>
          <div style={{ position: "relative", height: 18, borderRadius: 9, background: "rgba(255,255,255,0.18)" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${llena * 100}%`, borderRadius: 9, background: "#fff" }} />
            <div style={{ position: "absolute", left: `calc(${llena * 100}% - 20px)`, top: -11, width: 40, height: 40, borderRadius: 20, background: VERDE, boxShadow: `0 0 30px ${VERDE}` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, ...mono(28, 0.6) }}>
            <span>INICIO</span>
            <span>FINAL</span>
          </div>
        </div>
      )}
      {f2 > 0.01 && (
        <div style={{ ...panel, opacity: f2, transform: `translateY(${(1 - f2) * 80}px)` }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 44, textAlign: "center", marginBottom: 30 }}>Comentarios</div>
          {publica && (
            <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 30, transform: `scale(${0.7 + 0.3 * Math.min(pub, 1.08)})`, transformOrigin: "0% 50%", opacity: Math.min(pub * 1.5, 1) }}>
              <Avatar r={34} lleno />
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                <span style={mono(26, 0.6)}>tú · ahora</span>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, letterSpacing: "0.02em" }}>{palabra}</span>
              </div>
              <span style={{ fontSize: 54, color: ROJO }}>♥</span>
            </div>
          )}
          {[0.7].map((w, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 26, opacity: 0.55 }}>
              <Avatar r={30} o={0.7} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Barra w={180} o={0.3} />
                <Barra w={560 * w} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 20, padding: "16px 20px", borderRadius: 999, border: `3px solid ${letras > 0 && !publica ? "#fff" : "rgba(255,255,255,0.5)"}` }}>
            <Avatar r={28} lleno />
            <span style={{ flex: 1, fontFamily: SANS, fontWeight: 700, fontSize: 52, minHeight: 60 }}>
              {publica ? <span style={{ opacity: 0.4, fontSize: 36, fontWeight: 500 }}>Añade un comentario…</span> : palabra.slice(0, letras)}
              {!publica && cursor && <span style={{ fontWeight: 300 }}>|</span>}
            </span>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, color: letras >= palabra.length && !publica ? VERDE : "rgba(255,255,255,0.35)" }}>Publicar</span>
          </div>
        </div>
      )}
      {f3 > 0.01 && (
        <div style={{ ...panel, opacity: f3, transform: `translateX(${(1 - f3) * 300}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
            <Avatar r={34} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40 }}>Mensaje directo</span>
              <span style={mono(24, 0.6)}>te ha escrito · ahora</span>
            </div>
          </div>
          {m1 > 0.01 && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 26, opacity: Math.min(m1 * 1.5, 1), transform: `scale(${0.7 + 0.3 * Math.min(m1, 1.08)})`, transformOrigin: "0% 100%" }}>
              <div style={{ padding: "22px 30px", borderRadius: 34, borderBottomLeftRadius: 8, border: "3px solid #fff", fontFamily: SANS, fontWeight: 600, fontSize: 44 }}>{mensaje}</div>
            </div>
          )}
          {m2 > 0.01 && (
            <div style={{ display: "flex", opacity: Math.min(m2 * 1.5, 1), transform: `scale(${0.7 + 0.3 * Math.min(m2, 1.08)})`, transformOrigin: "0% 100%" }}>
              <div style={{ width: 600, borderRadius: 30, border: `4px solid ${VERDE}`, padding: "26px 30px", boxShadow: `0 0 40px ${VERDE}55` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{ width: 70, height: 70, borderRadius: 35, background: VERDE, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontSize: 46, fontWeight: 800, fontFamily: SANS }}>✓</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ ...mono(42), fontWeight: 700, color: VERDE }}>CUENTA AUDITADA</span>
                    <span style={mono(26, 0.7)}>del bot · verificada</span>
                  </div>
                </div>
                <div style={{ marginTop: 22, padding: "14px 0", borderRadius: 16, background: VERDE, color: "#000", textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 38 }}>Ver cuenta →</div>
              </div>
            </div>
          )}
        </div>
      )}
      <div style={{ position: "absolute", top: 0, left: 0, width: ANCHO }} />
    </>
  );
};
