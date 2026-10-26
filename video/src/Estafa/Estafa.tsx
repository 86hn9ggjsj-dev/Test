// "Cómo detectar un bot estafa en 30 segundos" (parte 5 de Explica): 100 % motion graphics con el mismo lenguaje.
// Siete pantallas: el anuncio que se escanea, las cuatro señales (rentabilidad garantizada, solo capturas, martingala
// y prisa), los números buenos y malos y el cierre de promo. Tiempos en src/gen/estafa.json (scripts/estafa.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/estafa.json";
import { salida } from "../Premium/ui";
import { ANCHO, ruido, SANS } from "../Viral/util";
import { Arriba, dos, Etiqueta, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, Escena, io, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { Abajo, claves, cuando, escala, Kicker, Montaje, P, paseo } from "../Explica/Montaje";
import { Promo } from "../Explica/Promo";

export const ESTAFA_FPS = datos.fps;
export const ESTAFA_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const en = cuando(datos);

const tarjeta = (o: number): React.CSSProperties => ({
  position: "absolute",
  borderRadius: 26,
  border: "1.5px solid rgba(255,255,255,0.45)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.015))",
  opacity: o,
});

// Sello de goma: entra golpeando y se tacha cuando toca
const Sello: React.FC<{ t: number; t0: number; tacha?: number; top: number; texto: string; giro?: number; size?: number; left?: number }> = ({ t, t0, tacha = 1e9, top, texto, giro = -8, size = 60, left }) => {
  const g = muelle(t, t0, 240, 13);
  if (g <= 0.001) return null;
  const raya = L(t, tacha, tacha + 0.35, 0, 1, salida);
  return (
    <div style={{ position: "absolute", top, left: left ?? 0, width: left === undefined ? ANCHO : undefined, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          padding: "14px 34px",
          border: "5px solid #fff",
          borderRadius: 14,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: size,
          letterSpacing: "0.06em",
          color: "#fff",
          opacity: Math.min(g * 1.5, 1) * (1 - 0.5 * raya),
          transform: `rotate(${giro}deg) scale(${1.6 - 0.6 * Math.min(g, 1.05)})`,
        }}
      >
        {texto}
        <div style={{ position: "absolute", left: -20, top: "50%", height: 6, width: `calc(${raya * 100}% + ${raya * 40}px)`, background: "#fff" }} />
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ 1. Hook: el anuncio que promete hacerte rico, escaneado
const FILAS_AD: [number, number][] = [
  [190, 0],
  [280, 1],
  [372, 2],
];
const Hook: React.FC<P> = ({ t, s, e }) => {
  const tAsi = en("así", s);
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.25, 0.2), 0.2, { apertura: 40 });
  const panel = muelle(t, s + 0.3, 140, 16);
  const duerme = L(t, EV.duermes - 0.15, EV.duermes + 0.25, 0, 1, salida);
  const H = 440;
  const scan = L(t, EV.estafa - 0.2, EV.estafa + 1.1, 0, 1, io);
  const yScan = 24 + scan * (H - 48);
  const escaneando = scan > 0 && scan < 1;
  const restan = 30 - Math.floor(Math.max(0, t - EV.treinta));
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <div style={{ position: "absolute", top: 560, left: 0, width: ANCHO, height: H, display: "flex", justifyContent: "center", perspective: 1300 }}>
        <div
          style={{
            ...tarjeta(Math.min(panel * 1.6, 1)),
            position: "relative",
            width: 760,
            height: H,
            overflow: "hidden",
            transform: `rotateX(${L(t, s, e, 14, 6)}deg) rotateY(${L(t, s, e, -14, -4)}deg) translateY(${(1 - Math.min(panel, 1)) * 120}px)`,
          }}
        >
          <div style={{ position: "absolute", top: 34, left: 44, ...mono(22, 0.55) }}>PATROCINADO</div>
          <div style={{ position: "absolute", top: 72, left: 44, fontFamily: SANS, fontWeight: 700, fontSize: 58, color: "#fff", letterSpacing: "-0.02em" }}>Bot IA Premium</div>
          <div style={{ position: "absolute", top: 156, left: 44, ...mono(64) }}>+10 % MENSUAL</div>
          <div style={{ position: "absolute", top: 262, left: 44, ...mono(30, 0.85), opacity: duerme }}>GANA MIENTRAS DUERMES</div>
          <div style={{ position: "absolute", top: 340, left: 44, padding: "12px 30px", borderRadius: 999, background: "#fff", color: "#000", fontFamily: SANS, fontWeight: 700, fontSize: 34 }}>Únete ya →</div>
          {FILAS_AD.map(([y, k]) => {
            const v = Math.min(Math.max((yScan - y) / 40, 0), 1) * (scan > 0 ? 1 : 0);
            return (
              <div key={k} style={{ position: "absolute", top: y - 26, right: 40, ...mono(46), opacity: v, transform: `scale(${1.5 - 0.5 * v})` }}>
                ✕
              </div>
            );
          })}
          {escaneando && (
            <>
              <div style={{ position: "absolute", left: 0, right: 0, top: Math.max(0, yScan - 90), height: Math.min(90, yScan), background: "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.12))" }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: yScan, height: 3, background: "#fff", boxShadow: "0 0 18px 4px rgba(255,255,255,0.6)" }} />
            </>
          )}
        </div>
      </div>
      <Abajo o={t >= EV.treinta - 0.1 ? 1 : 0}>
        <span style={mono(56)}>{`00:${dos(Math.max(restan, 0))}`}</span>
        <span style={mono(24, 0.55)}>PARA DETECTARLA</span>
      </Abajo>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={tAsi - 0.05} texto="hacerte *rico*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tAsi} texto="detecta la *estafa*" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Garantía: un 10 % al mes, siempre igual
const MESES = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const XG = (i: number) => -1.1 + i * 0.2;
const BASE_G = -0.6;
const Garantia: React.FC<P> = ({ t, s, e }) => {
  const tEn = en("en", EV.fijo);
  const cam = orbita([0, -0.1, 0], L(t, s, e, 8.6, 7.8), L(t, s, e, -0.32, -0.08), L(t, s, e, 0.14, 0.22), { apertura: 35, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.3)];
  const t0 = EV.diez - 0.2;
  const t1 = EV.fijo + 0.3;
  const g = MESES.map((_, i) => muelle(t, t0 + (i * (t1 - t0)) / 11, 190, 15));
  tr.push({ t: "p", pts: [[-1.25, BASE_G, 0], [1.25, BASE_G, 0]], w: 1.2, o: 0.5, prog: L(t, s + 0.2, s + 0.8, 0, 1, salida) });
  g.forEach((k, i) => {
    if (k <= 0) return;
    const h = 0.35 * Math.min(k, 1.1);
    for (const [a, b] of caja([XG(i) - 0.065, BASE_G, -0.065], [XG(i) + 0.065, BASE_G + h, 0.065])) tr.push({ t: "l", a, b, w: 1.3, o: 0.9 });
  });
  const recta = L(t, EV.fijo, EV.fijo + 0.5, 0, 1, salida);
  if (recta > 0) tr.push({ t: "p", pts: [[XG(0) - 0.15, BASE_G + 0.35, 0], [XG(11) + 0.15, BASE_G + 0.35, 0]], w: 1.6, o: 0.9, dash: "8 8", prog: recta, luz: 0.4 });
  const pr = proyector(cam);
  const nada = muelle(t, EV.nada - 0.05, 200, 15);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {MESES.map((m, i) => {
        const q = pr([XG(i), BASE_G, 0.065]);
        const c = pr([XG(i), BASE_G + 0.35, 0]);
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: q.x, top: q.y + 24, transform: "translateX(-50%)", ...mono(20, 0.5) }}>{m}</div>
            {g[i] > 0.3 && <div style={{ position: "absolute", left: c.x, top: c.y - 30, transform: "translateX(-50%)", ...mono(18, 0.85) }}>+10%</div>}
          </div>
        );
      })}
      <Sello t={t} t0={EV.garantiza - 0.05} tacha={EV.nada - 0.1} top={570} texto="GARANTIZADO" />
      <Abajo o={t >= EV.fijo && t < EV.nada - 0.1 ? 1 : 0}>
        <span style={mono(56)}>+214 %</span>
        <span style={mono(24, 0.55)}>AL AÑO, «FIJO»</span>
      </Abajo>
      <Abajo o={Math.min(nada * 1.5, 1)}>
        <span style={mono(52)}>✕ NADIE LO GARANTIZA</span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="SEÑAL 01 / 04" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={tEn - 0.05} texto="rentabilidad *garantizada*" size={74} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tEn} texto="nadie puede *garantizar*" size={80} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Capturas: se editan en un minuto; lo que vale es una cuenta auditada
const SALDO_INI = "10.240 €";
const SALDO_FIN = "98.750 €";
const AUDITA = ["VERIFICADA POR UN TERCERO", "DATOS DEL BRÓKER", "HISTORIAL COMPLETO"];
const Capturas: React.FC<P> = ({ t, s, e }) => {
  const tLo = en("lo", EV.minuto);
  const cam = orbita([0, 0, 0], 9, L(t, s, e, 0.25, -0.2), 0.2, { apertura: 40 });
  const izq = muelle(t, s + 0.15, 150, 16);
  const mueve = muelle(t, tLo - 0.15, 150, 17);
  const der = muelle(t, tLo - 0.05, 150, 16);
  const ed = L(t, EV.edita - 0.15, EV.minuto + 0.45, 0, 1, (u) => u);
  const n = ed < 0.5 ? Math.round(SALDO_INI.length * (1 - ed * 2)) : Math.round(SALDO_FIN.length * (ed * 2 - 1));
  const saldo = ed <= 0 ? SALDO_INI : ed < 0.5 ? SALDO_INI.slice(0, n) : SALDO_FIN.slice(0, n);
  const editando = t >= EV.edita - 0.2 && t < EV.minuto + 0.8;
  const W = 440;
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <div
        style={{
          ...tarjeta(Math.min(izq * 1.6, 1) * (1 - 0.5 * Math.min(der, 1))),
          top: 610,
          left: (ANCHO - W) / 2 - Math.min(mueve, 1) * 245,
          width: W,
          height: 470,
          padding: "34px 36px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          transform: `rotate(${-3 * Math.min(mueve, 1)}deg)`,
        }}
      >
        <span style={mono(22, 0.55)}>CAPTURA DE PANTALLA</span>
        <span style={{ ...mono(22, 0.55), marginTop: 30 }}>SALDO</span>
        <span style={mono(62)}>
          {saldo}
          {editando && Math.floor(t * 3) % 2 === 0 && <span style={{ opacity: 0.9 }}>▍</span>}
        </span>
        <span style={mono(26, 0.75)}>HOY +1.240 €</span>
        <span
          style={{
            ...mono(22),
            alignSelf: "flex-start",
            marginTop: 26,
            padding: "8px 16px",
            borderRadius: 999,
            border: "1.5px dashed #fff",
            opacity: L(t, EV.minuto, EV.minuto + 0.3, 0, 1, salida),
          }}
        >
          EDITADA EN 1 MIN
        </span>
      </div>
      <div
        style={{
          ...tarjeta(Math.min(der * 1.6, 1)),
          top: 610,
          left: (ANCHO - W) / 2 + 245 + (1 - Math.min(der, 1)) * 300,
          width: W,
          height: 470,
          padding: "34px 36px",
          display: "flex",
          flexDirection: "column",
          gap: 26,
          border: "2px solid #fff",
        }}
      >
        <span style={mono(22, 0.55)}>CUENTA AUDITADA</span>
        {AUDITA.map((txt, k) => {
          const t0 = k === 0 ? EV.tercero - 0.1 : EV.tercero + 0.15 + k * 0.2;
          const v = L(t, t0, t0 + 0.3, 0, 1, salida);
          return (
            <div key={txt} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, opacity: 0.25 + 0.75 * v, borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 16 }}>
              <span style={{ ...mono(22, 0.85), whiteSpace: "normal" }}>{txt}</span>
              <span style={{ ...mono(32), opacity: v }}>✓</span>
            </div>
          );
        })}
      </div>
      <Kicker t={t} t0={s + 0.05} texto="SEÑAL 02 / 04" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={tLo - 0.05} texto="solo *capturas*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tLo} texto="cuenta *auditada*" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Martingala: doblar al perder; curva perfecta hasta que se quema
const NM = 40;
const LISA: V3[] = Array.from({ length: NM + 1 }, (_, i): V3 => [-1.2 + i * 0.05, -0.05 + i * 0.019 + (ruido(i * 9) - 0.5) * 0.025, 0]);
const CORTE = 28;
const XT = (k: number) => -1.1 + k * 0.3;
const acelera = (u: number) => u * u;
const Martingala: React.FC<P> = ({ t, s, e }) => {
  const tMuchos = en("muchos", s);
  const cam = orbita([0, -0.1, 0], L(t, s, e, 8.8, 8.0), L(t, s, e, 0.3, 0.08), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 860 });
  const tr: Trazo[] = [...polvo(0.3)];
  const parpadea = t > EV.deja && t < EV.deja + 0.4 && Math.floor(t * 18) % 2 === 0 ? 0.35 : 1;
  const a = L(t, s + 0.2, EV.deja, 0, 1, salida);
  tr.push({ t: "p", pts: LISA.slice(0, CORTE + 1), w: 2.8, o: parpadea, prog: a, luz: 0.4 });
  const b = L(t, EV.ganan - 0.1, EV.todo - 0.3, 0, 1, (u) => u);
  if (b > 0) tr.push({ t: "p", pts: LISA.slice(CORTE), w: 2.8, o: 1, prog: b, luz: 0.4 });
  const fin = LISA[NM];
  const cae = L(t, EV.todo - 0.25, EV.todo + 0.3, 0, 1, acelera);
  if (cae > 0) tr.push({ t: "p", pts: [fin, [fin[0] + 0.06, -0.95, 0], [1.25, -0.95, 0]], w: 2.8, o: 1, prog: cae, luz: 0.6 });
  // Tamaño de la posición: se dobla en cada pérdida
  for (let k = 0; k < 6; k++) {
    const g = muelle(t, EV.doblan - 0.1 + k * 0.22, 190, 14);
    if (g <= 0) continue;
    const h = 0.025 * 2 ** k * Math.min(g, 1.1);
    for (const [p, q] of caja([XT(k) - 0.07, -0.95, -0.07], [XT(k) + 0.07, -0.95 + h, 0.07])) tr.push({ t: "l", a: p, b: q, w: 1.3, o: 0.85 });
  }
  const pr = proyector(cam);
  const quemada = muelle(t, EV.todo, 200, 14);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const q = pr([XT(k), -0.95 + 0.025 * 2 ** k, 0]);
        return (
          <div key={k} style={{ position: "absolute", left: q.x, top: q.y - 30, transform: "translateX(-50%)", opacity: L(t, EV.doblan + k * 0.22, EV.doblan + k * 0.22 + 0.2, 0, 1), ...mono(22) }}>
            {`×${2 ** k}`}
          </div>
        );
      })}
      <Etiqueta t={t} t0={EV.doblan + 0.2} x={pr([XT(0) - 0.1, -0.6, 0]).x} y={pr([XT(0) - 0.1, -0.6, 0]).y} size={20} o={0.6}>
        TAMAÑO TRAS CADA PÉRDIDA
      </Etiqueta>
      <Abajo o={t >= EV.ganan - 0.1 && t < EV.todo - 0.1 ? 1 : 0}>
        <span style={mono(56)}>{Math.round(L(t, EV.ganan, EV.todo - 0.3, 1, 14, (u) => u))}</span>
        <span style={mono(24, 0.55)}>MESES EN VERDE</span>
      </Abajo>
      <Abajo o={Math.min(quemada * 1.5, 1)}>
        <span style={mono(56)}>−100 %</span>
        <span style={mono(24, 0.55)}>CUENTA QUEMADA</span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="SEÑAL 03 / 04" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={tMuchos - 0.05} texto="la curva *perfecta*" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tMuchos} fin={EV.ganan - 0.3} texto="doblar al *perder*" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.ganan - 0.25} fin={EV.todo - 0.45} texto="meses *ganando*" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.todo - 0.4} texto="y un día, *todo*" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Prisa: cuenta atrás, plazas, «acaba hoy» y la pirámide de amigos
const Prisa: React.FC<P> = ({ t, s, e }) => {
  const tEso = en("eso", EV.amigos);
  const cam = orbita([0, -0.3, 0], L(t, s, e, 8.2, 7.6), L(t, s, e, -0.3, -0.05), L(t, s, e, 0.2, 0.28), { apertura: 35, centroY: 900 });
  const mk = L(t, EV.marketing - 0.1, EV.marketing + 0.4, 0, 1, salida);
  const tr: Trazo[] = [...polvo(0.3)];
  // Pirámide de referidos
  const nodos: V3[][] = [0, 1, 2, 3].map((nivel) => Array.from({ length: 2 ** nivel }, (_, j): V3 => [(j - (2 ** nivel - 1) / 2) * (1.6 / 2 ** nivel) * (nivel ? 1.6 : 1), -0.35 - nivel * 0.2, 0]));
  nodos.forEach((fila, nivel) => {
    const g = muelle(t, EV.amigos - 0.2 + nivel * 0.25, 190, 15);
    if (g <= 0) return;
    fila.forEach((c, j) => {
      tr.push({ t: "e", c, r: 0.035 * Math.min(g, 1.1), tipo: "nodo", o: 1 - 0.7 * mk });
      if (nivel) tr.push({ t: "l", a: nodos[nivel - 1][Math.floor(j / 2)], b: c, w: 1.2, o: 0.6 * Math.min(g, 1) * (1 - 0.7 * mk) });
    });
  });
  const pr = proyector(cam);
  const cima = pr(nodos[0][0]);
  const reloj = Math.max(0, 599 - (t - s) * 23);
  const plazas = t < EV.plazas ? 5 : Math.max(1, 5 - Math.floor((t - EV.plazas) / 0.45));
  const atenua = 1 - 0.7 * mk;
  const marketing = muelle(t, EV.marketing - 0.05, 200, 14);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 520, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: L(t, EV.prisa - 0.3, EV.prisa, 0, 1, salida) * atenua }}>
        <span style={mono(22, 0.55)}>LA OFERTA TERMINA EN</span>
        <span style={mono(104)}>{`00:${dos(Math.floor(reloj / 60))}:${dos(Math.floor(reloj % 60))}`}</span>
      </div>
      <div style={{ position: "absolute", top: 712, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, EV.plazas - 0.2, EV.plazas + 0.1, 0, 1, salida) * atenua }}>
        <span style={mono(40)}>{`PLAZAS LIBRES: ${plazas}`}</span>
      </div>
      {t >= EV.hoy - 0.1 && (
        <div style={{ opacity: atenua }}>
          <Sello t={t} t0={EV.hoy - 0.05} top={780} left={600} texto="ACABA HOY" giro={-7} size={44} />
        </div>
      )}
      <Etiqueta t={t} t0={EV.amigos} x={cima.x - 40} y={cima.y} size={22} o={0.75 * atenua} alinea="der">
        TRAE AMIGOS
      </Etiqueta>
      <Abajo o={Math.min(marketing * 1.5, 1)}>
        <span style={{ ...mono(52), display: "inline-block", transform: `scale(${0.85 + 0.15 * Math.min(marketing, 1.1)})` }}>= MARKETING</span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="SEÑAL 04 / 04" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={tEso - 0.05} texto="te mete *prisa*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tEso} texto="es *marketing*" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: un bot de verdad enseña sus números, también las caídas
const REAL: V3[] = escala(paseo(49, 85, 0.28, 0.035), -0.7, 0.6).map((v, i): V3 => [-1.2 + i * 0.05, v, 0]);
const CAIDAS = (() => {
  const r: { pico: number; valle: number; dd: number }[] = [];
  let pico = 0;
  let valle = 0;
  for (let i = 1; i < REAL.length; i++) {
    if (REAL[i][1] >= REAL[pico][1]) {
      if (REAL[pico][1] - REAL[valle][1] > 0.06) r.push({ pico, valle, dd: REAL[pico][1] - REAL[valle][1] });
      pico = i;
      valle = i;
    } else if (REAL[i][1] < REAL[valle][1]) valle = i;
  }
  if (REAL[pico][1] - REAL[valle][1] > 0.06) r.push({ pico, valle, dd: REAL[pico][1] - REAL[valle][1] });
  return r.sort((a, b) => b.dd - a.dd).slice(0, 3);
})();
const Cierre: React.FC<P> = ({ t, s, e }) => {
  const tLos = en("los", EV.numeros);
  const cam = orbita([0, 0, 0], L(t, s, e, 8.4, 7.6), L(t, s, e, -0.3, -0.08), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 930 });
  const tr: Trazo[] = [...polvo(0.3)];
  const buenos = L(t, EV.buenos - 0.1, EV.buenos + 0.3, 0, 1, salida);
  tr.push({ t: "p", pts: REAL, w: 2.8, o: 1, prog: L(t, s + 0.2, EV.buenos, 0, 1, salida), luz: 0.25 + 0.35 * buenos });
  CAIDAS.forEach(({ pico, valle }, k) => {
    const v = L(t, EV.malos - 0.4 + k * 0.12, EV.malos + k * 0.12, 0, 1, salida);
    if (v <= 0) return;
    const xv = REAL[valle][0];
    const yp = REAL[pico][1];
    tr.push({ t: "l", a: [REAL[pico][0], yp, 0], b: [xv, yp, 0], w: 1, o: 0.6 * v, dash: "4 6" });
    tr.push({ t: "p", pts: [[xv, yp, 0], [xv, yp + (REAL[valle][1] - yp) * v, 0]], w: 2, o: 1 });
  });
  const pr = proyector(cam);
  const fin = pr(REAL[REAL.length - 1]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.buenos} x={Math.min(fin.x, 1030)} y={fin.y - 40} size={28} alinea="der">
        +46 %
      </Etiqueta>
      {CAIDAS.map(({ valle, dd }, k) => {
        const q = pr(REAL[valle]);
        return (
          <Etiqueta key={k} t={t} t0={EV.malos - 0.2 + k * 0.12} x={q.x} y={q.y + 40} size={24} alinea="centro">
            {`−${Math.round(dd * 40)} %`}
          </Etiqueta>
        );
      })}
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={tLos - 0.05} texto="sus *números*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tLos} texto="los buenos y los *malos*" size={78} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. Promo: cuenta auditada en la bio, seguir y escribir
const Cta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.3, 0.2), 0.2, { apertura: 40 });
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <Promo t={t} t0={s} tAuditada={EV.auditada2} tLink={EV.link} tSigue={EV.sigueme} tEscribe={EV.escribeme} tInfo={EV.info} />
      <Kicker t={t} t0={s + 0.05} texto="LINK EN LA BIO" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.sigueme - 0.3} texto="cuenta *auditada*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.sigueme - 0.25} texto="*sígueme* y *escríbeme*" size={84} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ composición
const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, garantia: Garantia, capturas: Capturas, martingala: Martingala, prisa: Prisa, cierre: Cierre, cta: Cta };
const CLAVES = claves(["rico", "estafa", "garantiza", "fijo", "nada", "capturas", "auditada", "tercero", "perfecta", "doblan", "todo", "prisa", "marketing", "números", "malos", "bio", "sígueme", "escríbeme"]);

export const Estafa: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/estafa_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
