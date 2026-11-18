// "Las tres cifras que miro antes de fiarme de un bot" (parte 4 de Explica): 100 % motion graphics con el mismo lenguaje.
// Siete pantallas: el gancho (las casillas veladas de la parte 3), la máxima caída, el factor de beneficio, el número de
// operaciones, las tres juntas, el informe y el cierre de promo. Tiempos en src/gen/cifras.json (scripts/cifras.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/cifras.json";
import { salida } from "../Premium/ui";
import { ANCHO, ruido, SANS } from "../Viral/util";
import { Arriba, dos, Etiqueta, L, mono, muelle, Reticula, Titular } from "../Bot/piezas";
import { caja, clave, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { Abajo, claves, cuando, Kicker, Montaje, P, paseo } from "../Explica/Montaje";
import { Promo } from "../Explica/Promo";

export const CIFRAS_FPS = datos.fps;
export const CIFRAS_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const en = cuando(datos);

// Las tres casillas (las mismas que quedaron veladas al final de la parte 3)
const CIFRAS: [string, string][] = [
  ["MÁX. CAÍDA", "−12 %"],
  ["FACTOR", "1,8"],
  ["OPERACIONES", "214"],
];
const Casillas: React.FC<{ t: number; aparece: number[]; velo: number; top: number; marcas?: string[]; valores?: string[]; atenua?: number[] }> = ({ t, aparece, velo, top, marcas, valores, atenua }) => (
  <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 30, perspective: 1200 }}>
    {CIFRAS.map(([nombre, valor], k) => {
      const g = muelle(t, aparece[k], 170, 15);
      const marca = marcas?.[k] ?? "";
      return (
        <div
          key={k}
          style={{
            position: "relative",
            width: 290,
            height: 240,
            borderRadius: 22,
            border: `1.5px ${marca === "✕" ? "dashed" : "solid"} rgba(255,255,255,0.5)`,
            background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 22,
            opacity: Math.min(g * 1.6, 1) * (atenua?.[k] ?? 1),
            transform: `translateY(${(1 - Math.min(g, 1)) * 80}px) rotateX(${(1 - Math.min(g, 1)) * 30}deg)`,
          }}
        >
          <span style={mono(22, 0.55)}>{velo > 0.5 ? `CIFRA ${dos(k + 1)}` : nombre}</span>
          <span style={{ ...mono(64), filter: `blur(${velo * (10 + 2 * Math.sin(t * 3 + k))}px)` }}>{valores?.[k] ?? valor}</span>
          {marca && <span style={{ position: "absolute", top: 14, right: 18, ...mono(34) }}>{marca}</span>}
        </div>
      );
    })}
  </div>
);

// ------------------------------------------------------------------ 1. Hook: no la rentabilidad, sino tres cifras que casi nadie enseña
const Hook: React.FC<P> = ({ t, s, e }) => {
  const tMiro = en("miro", EV.gana);
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.25, 0.2), 0.2, { apertura: 40 });
  const grande = muelle(t, s + 0.3, 160, 15);
  const borra = L(t, EV.gana - 0.1, EV.gana + 0.5, 0, 1, salida);
  const aparece = [0, 1, 2].map((k) => EV.cifras - 0.15 + k * 0.15);
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <div style={{ position: "absolute", top: 560, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: Math.min(grande * 1.5, 1) * (1 - 0.75 * borra) }}>
        <span style={{ ...mono(150), filter: `blur(${borra * 14}px)`, transform: `scale(${0.85 + 0.15 * Math.min(grande, 1.1)})` }}>+212 %</span>
        <span style={mono(26, 0.55)}>RENTABILIDAD</span>
      </div>
      <Casillas t={t} aparece={aparece} velo={1} top={880} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={tMiro - 0.05} texto="no miro cuánto *gana*" size={84} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tMiro} texto="miro tres *cifras*" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Máxima caída: del mejor momento al peor punto, ¿lo aguantarías?
const KC: [number, number][] = [
  [-1.2, -0.6],
  [-0.15, 0.55],
  [0.5, -0.35],
  [1.2, 0.4],
];
const NC = 49;
const CURVA: V3[] = paseo(NC, 61, 0.09).map((r, i): V3 => {
  const x = -1.2 + i * (2.4 / (NC - 1));
  let k = 0;
  while (k < KC.length - 2 && x > KC[k + 1][0]) k++;
  const [x0, y0] = KC[k];
  const [x1, y1] = KC[k + 1];
  const u = (x - x0) / (x1 - x0);
  return [x, y0 + ((y1 - y0) * (1 - Math.cos(u * Math.PI))) / 2 + r * 0.8 + (ruido(i * 13) - 0.5) * 0.06, 0];
});
const PICO = CURVA.reduce((b, p, i) => (p[1] > CURVA[b][1] ? i : b), 0);
const VALLE = CURVA.reduce((b, p, i) => (i > PICO && p[1] < CURVA[b][1] ? i : b), PICO + 1);
const Caida: React.FC<P> = ({ t, s, e }) => {
  const tSi = en("si", s);
  const cam = orbita([0, 0, 0], L(t, s, e, 8.4, 7.6), L(t, s, e, -0.3, -0.08), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 930 });
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "p", pts: CURVA, w: 2.8, o: 1, prog: L(t, s + 0.2, EV.perder + 0.4, 0, 1, salida), luz: 0.35 });
  const yp = CURVA[PICO][1];
  const yv = CURVA[VALLE][1];
  const xv = CURVA[VALLE][0];
  const marca = L(t, EV.perder, EV.perder + 0.6, 0, 1, salida);
  if (marca > 0) {
    tr.push({ t: "l", a: [CURVA[PICO][0], yp, 0], b: [xv + 0.15, yp, 0], w: 1.2, o: 0.7 * marca, dash: "5 7" });
    tr.push({ t: "p", pts: [[xv + 0.15, yp, 0], [xv + 0.15, yp + (yv - yp) * marca, 0]], w: 2, o: 1 });
    // Zona de la caída rayada, del pico al valle
    for (let i = PICO + 1; i <= VALLE; i++) {
      if ((i - PICO) / (VALLE - PICO) > marca) break;
      tr.push({ t: "l", a: [CURVA[i][0], yp, 0], b: CURVA[i], w: 1, o: 0.28 });
    }
  }
  const pr = proyector(cam);
  const qp = pr(CURVA[PICO]);
  const qv = pr([xv, yv, 0]);
  const apagar = muelle(t, EV.aguantarias - 0.1, 200, 14);
  const tienta = t >= EV.apagarlo - 0.1 ? 0.5 + 0.5 * Math.cos((t - EV.apagarlo) * 9) : 0;
  return (
    <>
      <Escena cam={cam} trazos={tr} encima={() => <Reticula q={qp} r={28} k={muelle(t, EV.momento - 0.1, 220, 14)} />} />
      <Etiqueta t={t} t0={EV.momento} x={qp.x} y={qp.y - 56} size={24} o={0.8} alinea="centro">
        MEJOR MOMENTO
      </Etiqueta>
      <Etiqueta t={t} t0={EV.treinta - 0.1} x={qv.x} y={qv.y + 56} size={44} alinea="centro">
        −30 %
      </Etiqueta>
      <Abajo o={t >= EV.treinta - 0.1 && t < EV.aguantarias - 0.1 ? 1 : 0}>
        <span style={mono(56)}>−30 %</span>
        <span style={mono(24, 0.55)}>MÁX. CAÍDA</span>
      </Abajo>
      <Abajo o={Math.min(apagar * 1.5, 1)}>
        <span
          style={{
            ...mono(40),
            padding: "14px 34px",
            borderRadius: 999,
            border: "2px solid #fff",
            background: `rgba(255,255,255,${0.9 * tienta})`,
            color: tienta > 0.5 ? "#000" : "#fff",
            display: "inline-block",
            transform: `scale(${0.85 + 0.15 * Math.min(apagar, 1.1)})`,
          }}
        >
          ⏻ APAGAR BOT
        </span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="CIFRA 01 / 03" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={tSi - 0.05} texto="la máxima *caída*" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tSi} texto="¿lo *aguantarías*?" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Factor de beneficio: lo que gana entre lo que pierde
const XR = (v: number) => -1.2 + v * 0.8;
const Factor: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 8.4, 7.8), L(t, s, e, -0.4, -0.15), L(t, s, e, 0.18, 0.24), { apertura: 35, centroY: 880 });
  const tr: Trazo[] = [...polvo(0.3)];
  const pila = (x: number, n: number, t0: number, o: number) => {
    for (let k = 0; k < n; k++) {
      const g = muelle(t, t0 + k * 0.07, 190, 15);
      if (g <= 0) continue;
      const y0 = -0.35 + k * 0.1 + (1 - Math.min(g, 1)) * 0.5;
      for (const [a, b] of caja([x - 0.16, y0, -0.16], [x + 0.16, y0 + 0.085, 0.16])) tr.push({ t: "l", a, b, w: 1.3, o: o * Math.min(g * 1.5, 1) });
    }
  };
  pila(-0.55, 9, EV.gana2 - 0.1, 0.95);
  pila(0.55, 5, EV.pierde - 0.1, 0.5);
  // Regla del factor: por debajo de 1 pierde dinero
  const regla = L(t, EV.debajo - 0.3, EV.debajo + 0.2, 0, 1, salida);
  if (regla > 0) {
    tr.push({ t: "p", pts: [[XR(0), -0.95, 0], [XR(3), -0.95, 0]], w: 1.4, o: 0.7, prog: regla });
    for (let v = 0; v <= 3; v++) tr.push({ t: "l", a: [XR(v), -0.95, 0], b: [XR(v), -0.88, 0], w: 1.4, o: 0.7 * regla });
    const rayas = Math.round(10 * L(t, EV.debajo, EV.debajo + 0.5, 0, 1, salida));
    for (let r = 0; r < rayas; r++) tr.push({ t: "l", a: [XR(r / 10), -0.95, 0], b: [XR((r + 0.6) / 10), -1.07, 0], w: 1, o: 0.4 });
  }
  const fragil = muelle(t, EV.cerca - 0.05, 200, 15);
  const cae = muelle(t, EV.tumba - 0.25, 160, 12);
  const vF = 1.1 - 0.2 * cae;
  if (fragil > 0) tr.push({ t: "l", a: [XR(vF), -0.95, 0], b: [XR(vF), -0.95 + 0.22 * Math.min(fragil, 1.1), 0], w: 2.4, o: 1, luz: 0.4 });
  const principal = muelle(t, EV.debajo + 0.3, 200, 15);
  if (principal > 0) tr.push({ t: "l", a: [XR(1.8), -0.95, 0], b: [XR(1.8), -0.95 + 0.22 * Math.min(principal, 1.1), 0], w: 2.4, o: 0.8 });
  const pr = proyector(cam);
  const gana = pr([-0.55, -0.42, 0.16]);
  const pierde = pr([0.55, -0.42, 0.16]);
  const centro = pr([0, 0.05, 0]);
  const igual = muelle(t, EV.pierde + 0.6, 200, 15);
  const qF = pr([XR(vF), -0.7, 0]);
  const q18 = pr([XR(1.8), -0.7, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.gana2} x={gana.x} y={gana.y + 34} size={26} alinea="centro">
        GANA +9.000 €
      </Etiqueta>
      <Etiqueta t={t} t0={EV.pierde} x={pierde.x} y={pierde.y + 34} size={26} o={0.75} alinea="centro">
        PIERDE −5.000 €
      </Etiqueta>
      <div style={{ position: "absolute", left: centro.x, top: centro.y, transform: "translate(-50%, -50%)", opacity: L(t, EV.pierde + 0.2, EV.pierde + 0.5, 0, 1, salida) }}>
        <span style={mono(64)}>÷</span>
      </div>
      <div style={{ position: "absolute", left: centro.x, top: centro.y - 330, transform: `translate(-50%, -50%) scale(${Math.min(igual, 1.1)})`, opacity: Math.min(igual * 1.5, 1) }}>
        <span style={mono(64)}>= 1,8</span>
      </div>
      {[0, 1, 2, 3].map((v) => {
        const q = pr([XR(v), -0.95, 0]);
        return (
          <div key={v} style={{ position: "absolute", left: q.x, top: q.y + 28, transform: "translateX(-50%)", opacity: regla, ...mono(24, 0.6) }}>
            {v}
          </div>
        );
      })}
      <Etiqueta t={t} t0={EV.debajo + 0.2} x={pr([XR(0.5), -1.2, 0]).x} y={pr([XR(0.5), -1.2, 0]).y} size={22} o={0.75} alinea="centro">
        PIERDE DINERO
      </Etiqueta>
      <Etiqueta t={t} t0={EV.debajo + 0.4} x={q18.x} y={q18.y - 20} size={26} alinea="centro">
        1,8 ✓
      </Etiqueta>
      <Etiqueta t={t} t0={EV.cerca} x={qF.x} y={qF.y - 20} size={26} alinea="centro">
        {cae > 0.5 ? "0,9 ✕" : "1,1"}
      </Etiqueta>
      <Etiqueta t={t} t0={EV.tumba - 0.1} x={qF.x + 60} y={qF.y + 40} size={20} o={0.7}>
        ← COSTES
      </Etiqueta>
      <Kicker t={t} t0={s + 0.05} texto="CIFRA 02 / 03" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.debajo - 0.35} texto="factor de *beneficio*" size={86} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.debajo - 0.3} fin={EV.cerca - 0.3} texto="por debajo de *uno*" size={88} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cerca - 0.25} texto="un coste lo *tumba*" size={88} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Operaciones: con 20 puede ser suerte; con cientos se ve la ventaja
const NP = 400;
const PUNTOS = Array.from({ length: NP }, (_, i) => ({
  x: -1.2 + ruido(i * 3.3 + 1) * 2.4,
  y: 0.12 + (ruido(i * 7.1 + 2) + ruido(i * 2.9 + 3) + ruido(i * 5.3 + 4) - 1.5) * 0.9,
}));
const Operaciones: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.05, 0], L(t, s, e, 8.6, 7.8), L(t, s, e, 0.3, 0.08), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 930 });
  const tr: Trazo[] = [...polvo(0.3)];
  const n = Math.round(clave(t, [[s + 0.4, 0], [EV.veinte + 0.2, 20], [EV.cientos - 0.1, 20], [EV.cientos + 1.3, NP]]));
  let suma = 0;
  for (let i = 0; i < n; i++) suma += PUNTOS[i].y;
  const media = n ? suma / n : 0;
  let v = 0;
  for (let i = 0; i < n; i++) v += (PUNTOS[i].y - media) ** 2;
  const sd = n > 1 ? Math.sqrt(v / (n - 1)) : 0.45;
  const ic = (2 * sd) / Math.sqrt(Math.max(n, 1));
  tr.push({ t: "l", a: [-1.3, 0, 0], b: [1.3, 0, 0], w: 1.2, o: 0.55, dash: "6 8" });
  for (let i = 0; i < n; i++) tr.push({ t: "e", c: [PUNTOS[i].x, Math.max(-0.95, Math.min(1.0, PUNTOS[i].y)), 0], r: n > 40 ? 0.012 : 0.02, tipo: "punto", o: n > 40 ? 0.6 : 0.9 });
  const banda = L(t, EV.veinte, EV.veinte + 0.4, 0, 1, salida);
  if (banda > 0) {
    const a = media - ic;
    const b = media + ic;
    tr.push({ t: "p", pts: [[-1.25, a, 0.01], [1.25, a, 0.01], [1.25, b, 0.01], [-1.25, b, 0.01], [-1.25, a, 0.01]], w: 1.2, o: 0.08 * banda, relleno: "#fff" });
    tr.push({ t: "l", a: [-1.25, a, 0.01], b: [1.25, a, 0.01], w: 1.2, o: 0.6 * banda });
    tr.push({ t: "l", a: [-1.25, b, 0.01], b: [1.25, b, 0.01], w: 1.2, o: 0.6 * banda });
    tr.push({ t: "l", a: [-1.25, media, 0.01], b: [1.25, media, 0.01], w: 2.4, o: banda, luz: 0.4 });
  }
  const pr = proyector(cam);
  const cero = pr([-1.3, 0, 0]);
  const qb = pr([1.25, media + ic, 0.01]);
  const ventaja = n >= NP - 5 && t >= EV.real - 0.1;
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={s + 0.5} x={cero.x + 10} y={cero.y + 24} size={22} o={0.6}>
        0
      </Etiqueta>
      <Etiqueta t={t} t0={EV.suerte - 0.1} x={Math.min(qb.x, 1030)} y={qb.y - 30} size={24} alinea="der">
        {ventaja ? "VENTAJA REAL ✓" : media - ic > 0 ? "VENTAJA" : "¿VENTAJA O SUERTE?"}
      </Etiqueta>
      <Abajo o={n > 0 ? 1 : 0}>
        <span style={mono(56)}>{n}</span>
        <span style={mono(24, 0.55)}>OPERACIONES</span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="CIFRA 03 / 03" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.cientos - 0.35} texto="número de *operaciones*" size={76} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cientos - 0.3} texto="la ventaja es *real*" size={88} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Juntas: las tres a la vez; si una falla, desconfía
const Juntas: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], 9, L(t, s, e, 0.2, -0.2), 0.2, { apertura: 40 });
  const falla = t >= EV.falla - 0.05;
  const marcas = [EV.caida2, EV.factor2, EV.muchas].map((t0, k) => (falla && k === 1 ? "✕" : t >= t0 - 0.05 ? "✓" : ""));
  const apaga = L(t, EV.falla, EV.falla + 0.4, 0, 1, salida);
  const desconfia = muelle(t, EV.desconfia - 0.05, 200, 15);
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <Casillas
        t={t}
        aparece={[s + 0.1, s + 0.25, s + 0.4]}
        velo={0}
        top={720}
        marcas={marcas}
        valores={["−12 %", falla ? "1,05" : "1,8", "214"]}
        atenua={[1 - 0.6 * apaga, 1, 1 - 0.6 * apaga]}
      />
      <Abajo o={Math.min(desconfia * 1.5, 1)}>
        <span style={{ ...mono(52), display: "inline-block", transform: `scale(${0.85 + 0.15 * Math.min(desconfia, 1.1)})` }}>✕ DESCONFÍA</span>
      </Abajo>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.falla - 0.3} texto="míralas *juntas*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.falla - 0.25} texto="si una falla, *desconfía*" size={80} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: el informe se abre solo
const FILAS: [string, string][] = [
  ["MÁX. CAÍDA", "−12 %"],
  ["FACTOR DE BENEFICIO", "1,8"],
  ["OPERACIONES", "214"],
  ["CUENTA", "AUDITADA ✓"],
];
const Cierre: React.FC<P> = ({ t, s, e }) => {
  const tSin = en("sin", s);
  const abre = muelle(t, s + 0.1, 120, 16);
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.2, 0.2), 0.25, { apertura: 40 });
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <div style={{ position: "absolute", top: 600, left: 0, width: ANCHO, display: "flex", justifyContent: "center", perspective: 1300 }}>
        <div
          style={{
            width: 860,
            padding: "36px 44px",
            borderRadius: 24,
            border: "1.5px solid rgba(255,255,255,0.45)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
            display: "flex",
            flexDirection: "column",
            gap: 22,
            opacity: Math.min(abre * 1.6, 1),
            transform: `rotateX(${(1 - Math.min(abre, 1)) * 70 + 8}deg) rotateY(${L(t, s, e, -10, 4)}deg)`,
            transformOrigin: "center top",
          }}
        >
          <span style={mono(24, 0.55)}>INFORME DEL BOT</span>
          {FILAS.map(([a, b], k) => {
            const g = L(t, s + 0.5 + k * 0.3, s + 0.8 + k * 0.3, 0, 1, salida);
            return (
              <div key={a} style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 18, opacity: g, transform: `translateX(${(1 - g) * -30}px)` }}>
                <span style={mono(32, 0.75)}>{a}</span>
                <span style={mono(32)}>{b}</span>
              </div>
            );
          })}
        </div>
      </div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={tSin - 0.05} texto="un bot *serio*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tSin} texto="sin que se las *pidas*" size={88} />
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
      <Promo t={t} t0={s} tAuditada={EV.auditada} tLink={EV.link} tSigue={EV.sigueme} tEscribe={EV.escribeme} tInfo={EV.info} />
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
const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, caida: Caida, factor: Factor, operaciones: Operaciones, juntas: Juntas, cierre: Cierre, cta: Cta };
const CLAVES = claves(["gana", "cifras", "caída", "aguantarías", "beneficio", "uno", "tumba", "operaciones", "suerte", "real", "juntas", "desconfía", "serio", "auditada", "bio", "sígueme", "escríbeme"]);

export const Cifras: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/cifras_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
