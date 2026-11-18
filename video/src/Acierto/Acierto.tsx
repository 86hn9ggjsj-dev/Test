// Reel "Puedes fallar 6 de cada 10 operaciones y ganar dinero": consejo de riesgo/beneficio en ~40 s.
// El gancho ya está en pantalla en el primer fotograma (sirve de portada). Tiempos en src/gen/acierto.json (scripts/acierto.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/acierto.json";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { Arriba, Etiqueta, L, mono, muelle, Reticula, Titular } from "../Bot/piezas";
import { caja, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { Abajo, claves, Kicker, Montaje, P } from "../Explica/Montaje";
import { Promo } from "../Explica/Promo";

export const ACIERTO_FPS = datos.fps;
export const ACIERTO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// Secuencia de 10 operaciones: 6 fallos (−100 €) y 4 aciertos (+200 €)
const OPS = [false, true, false, false, true, false, true, false, false, true];
const euros = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(Math.round(v))} €`;

// Barra horizontal de alambre (para comparar lo que se gana y lo que se pierde)
const barra = (tr: Trazo[], y: number, largo: number, g: number, o = 1) => {
  if (g <= 0) return;
  for (const [a, b] of caja([-1.1, y - 0.1, -0.1], [-1.1 + largo * Math.min(g, 1.05), y + 0.1, 0.1])) tr.push({ t: "l", a, b, w: 1.5, o });
};

// ------------------------------------------------------------------ 1. Hook: 6 fallos, 4 aciertos… y saldo positivo
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.25, 0.2), 0.2, { apertura: 40 });
  const saldo = muelle(t, EV.ganar - 0.15, 200, 13);
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <div style={{ position: "absolute", top: 640, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 14 }}>
        {OPS.map((ok, k) => {
          const g = muelle(t, -0.3 + k * 0.09, 220, 15);
          return (
            <div
              key={k}
              style={{
                width: 84,
                height: 84,
                borderRadius: 16,
                border: `2px solid rgba(255,255,255,${ok ? 1 : 0.4})`,
                background: ok ? "#fff" : "transparent",
                color: ok ? "#000" : "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                fontFamily: "'JetBrains Mono', monospace",
                opacity: Math.min(g * 1.5, 1),
                transform: `translateY(${(1 - Math.min(g, 1)) * 60}px) scale(${0.7 + 0.3 * Math.min(g, 1.1)})`,
              }}
            >
              {ok ? "✓" : "✕"}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 760, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 40, opacity: L(t, 0.2, 0.6, 0, 1, salida) }}>
        <span style={mono(30, 0.6)}>6 FALLOS</span>
        <span style={mono(30)}>4 ACIERTOS</span>
      </div>
      <div style={{ position: "absolute", top: 880, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: Math.min(saldo * 1.5, 1) }}>
        <span style={mono(24, 0.55)}>SALDO</span>
        <span style={{ ...mono(150), transform: `scale(${0.8 + 0.2 * Math.min(saldo, 1.1)})` }}>+200 €</span>
      </div>
      <Arriba>
        <Titular t={t} t0={-0.35} fin={EV.ganar - 0.7} texto="fallar *6* de *10*" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.ganar - 0.65} texto="y aun así *ganar*" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Clave: lo que ganas al acertar frente a lo que pierdes al fallar
const Clave: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 7.4, 6.8), L(t, s, e, -0.35, -0.12), L(t, s, e, 0.16, 0.24), { apertura: 35, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.3)];
  barra(tr, 0.3, 2.0, muelle(t, EV.ganas - 0.1, 150, 15), 1);
  barra(tr, -0.3, 1.0, muelle(t, EV.pierdes - 0.1, 150, 15), 0.55);
  const pr = proyector(cam);
  const g = pr([-1.1, 0.48, 0]);
  const p = pr([-1.1, -0.12, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.ganas} x={g.x} y={g.y - 20} size={28}>
        CUANDO ACIERTAS · +200 €
      </Etiqueta>
      <Etiqueta t={t} t0={EV.pierdes} x={p.x} y={p.y - 20} size={28} o={0.7}>
        CUANDO FALLAS · −100 €
      </Etiqueta>
      <Abajo o={Math.min(muelle(t, EV.pierdes + 0.4, 200, 15) * 1.5, 1)}>
        <span style={mono(56)}>×2</span>
        <span style={mono(24, 0.55)}>LO QUE GANAS FRENTE A LO QUE PIERDES</span>
      </Abajo>
      <Arriba>
        <Titular t={t} t0={s + 0.1} texto="la *clave*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Ejemplo: 6 × −100 € frente a 4 × +200 €
const Ejemplo: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.1, 0], L(t, s, e, 8.2, 7.4), L(t, s, e, 0.35, 0.1), L(t, s, e, 0.14, 0.22), { apertura: 35, centroY: 930 });
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "l", a: [-1.3, 0, 0], b: [1.3, 0, 0], w: 1.4, o: 0.6, dash: "6 8" });
  const u = 0.12;
  for (let k = 0; k < 6; k++) {
    const g = muelle(t, EV.fallas + 0.15 + k * 0.22, 200, 14);
    if (g <= 0) continue;
    const y0 = -(k + 1) * u - (1 - Math.min(g, 1)) * 0.4;
    for (const [a, b] of caja([-0.7, y0, -0.15], [-0.4, y0 + u - 0.012, 0.15])) tr.push({ t: "l", a, b, w: 1.3, o: 0.55 * Math.min(g * 1.5, 1) });
  }
  for (let k = 0; k < 4; k++) {
    const g = muelle(t, EV.aciertas + 0.15 + k * 0.25, 200, 14);
    if (g <= 0) continue;
    const y0 = k * 2 * u + (1 - Math.min(g, 1)) * 0.4;
    for (const [a, b] of caja([0.4, y0, -0.15], [0.7, y0 + 2 * u - 0.012, 0.15])) tr.push({ t: "l", a, b, w: 1.5, o: Math.min(g * 1.5, 1), luz: 0.2 });
  }
  const pr = proyector(cam);
  const qp = pr([-0.55, -6 * u - 0.1, 0.15]);
  const qg = pr([0.55, 8 * u + 0.08, 0]);
  const fallos = Math.min(6, Math.max(0, Math.floor((t - EV.fallas - 0.15) / 0.22) + 1));
  const aciertos = Math.min(4, Math.max(0, Math.floor((t - EV.aciertas - 0.15) / 0.25) + 1));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qp.x, top: qp.y + 20, transform: "translateX(-50%)", opacity: fallos ? 0.75 : 0, ...mono(40) }}>{euros(-100 * fallos)}</div>
      <div style={{ position: "absolute", left: qg.x, top: qg.y - 60, transform: "translateX(-50%)", opacity: aciertos ? 1 : 0, ...mono(40) }}>{euros(200 * aciertos)}</div>
      <Abajo o={t < EV.fallas - 0.1 ? 1 : 0}>
        <span style={mono(44)}>RIESGO 100 € · OBJETIVO 200 €</span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="10 OPERACIONES" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.fallas - 0.35} texto="arriesgas 1, buscas *2*" size={86} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.fallas - 0.3} texto="−600 / *+800*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Resultado: más fallos que aciertos y el saldo arriba
const CURVA: number[] = OPS.reduce((c, ok) => [...c, c[c.length - 1] + (ok ? 200 : -100)], [0]);
const XC = (i: number) => -1.2 + i * 0.24;
const YC = (v: number) => v / 300;
const Resultado: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.1, 0], L(t, s, e, 7.8, 7.1), L(t, s, e, -0.3, -0.06), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "l", a: [-1.3, 0, 0], b: [1.3, 0, 0], w: 1.2, o: 0.5, dash: "6 8" });
  const prog = L(t, s + 0.2, EV.arriba - 0.2, 0, 1, (u) => u);
  const pts: V3[] = [];
  CURVA.forEach((v, i) => {
    pts.push([XC(i), YC(v), 0]);
    if (i < CURVA.length - 1) pts.push([XC(i + 1), YC(v), 0]);
  });
  tr.push({ t: "p", pts, w: 2.8, o: 1, prog, luz: 0.4 });
  OPS.forEach((ok, i) => {
    if ((i + 1) / OPS.length > prog + 0.02) return;
    const c: V3 = [XC(i + 1), YC(CURVA[i + 1]), 0];
    if (ok) tr.push({ t: "e", c, r: 0.05, tipo: "aro", o: 1 });
    else {
      tr.push({ t: "l", a: [c[0] - 0.04, c[1] - 0.04, 0], b: [c[0] + 0.04, c[1] + 0.04, 0], w: 2, o: 0.6 });
      tr.push({ t: "l", a: [c[0] - 0.04, c[1] + 0.04, 0], b: [c[0] + 0.04, c[1] - 0.04, 0], w: 2, o: 0.6 });
    }
  });
  const pr = proyector(cam);
  const fin = pr([XC(10), YC(CURVA[10]), 0]);
  const arriba = muelle(t, EV.arriba - 0.1, 200, 14);
  return (
    <>
      <Escena cam={cam} trazos={tr} encima={() => <Reticula q={fin} r={30} k={arriba} />} />
      <Etiqueta t={t} t0={EV.arriba} x={Math.min(fin.x, 1000)} y={fin.y - 56} size={40} alinea="der">
        +200 €
      </Etiqueta>
      <Abajo>
        <span style={mono(30, 0.6)}>{`✕ ${OPS.filter((ok, i) => !ok && (i + 1) / OPS.length <= prog + 0.02).length}`}</span>
        <span style={mono(30)}>{`✓ ${OPS.filter((ok, i) => ok && (i + 1) / OPS.length <= prog + 0.02).length}`}</span>
      </Abajo>
      <Arriba>
        <Titular t={t} t0={s + 0.1} texto="más fallos, *más dinero*" size={86} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Error del novato: lo contrario
const Novato: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 7.4, 6.8), L(t, s, e, 0.35, 0.12), L(t, s, e, 0.16, 0.24), { apertura: 35, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.3)];
  barra(tr, 0.3, 0.5, muelle(t, EV.corta - 0.1, 150, 15), 1);
  barra(tr, -0.3, 2.0, L(t, EV.correr - 0.4, EV.correr + 0.6, 0, 1, salida), 0.6);
  const pr = proyector(cam);
  const g = pr([-1.1, 0.48, 0]);
  const p = pr([-1.1, -0.12, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.corta} x={g.x} y={g.y - 20} size={28}>
        GANANCIAS CORTAS · +50 €
      </Etiqueta>
      <Etiqueta t={t} t0={EV.correr - 0.2} x={p.x} y={p.y - 20} size={28} o={0.7}>
        PÉRDIDAS LARGAS · −200 €
      </Etiqueta>
      <Abajo o={Math.min(muelle(t, EV.correr + 0.4, 200, 15) * 1.5, 1)}>
        <span style={mono(52)}>✕ AL REVÉS</span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="ERROR DE NOVATO" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.corta - 0.3} texto="el *novato*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.corta - 0.25} texto="hace lo *contrario*" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Regla: lo que puedes ganar, al menos el doble de lo que arriesgas
const Regla: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.2, 0.1, 0], L(t, s, e, 7.8, 7.2), L(t, s, e, -0.32, -0.08), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.3)];
  const x0 = -0.9;
  const x1 = 1.1;
  const entra = L(t, s + 0.2, s + 0.7, 0, 1, salida);
  tr.push({ t: "p", pts: [[x0, 0, 0], [x1, 0, 0]], w: 2, o: 1, prog: entra });
  const stop = muelle(t, s + 0.6, 130, 14);
  const obj = muelle(t, EV.doble - 0.3, 130, 13);
  const yS = -0.4 * stop;
  const yO = 0.8 * obj;
  if (stop > 0) tr.push({ t: "p", pts: [[x0, yS, 0], [x1, yS, 0]], w: 1.6, o: 0.7, dash: "8 9" });
  if (obj > 0) tr.push({ t: "p", pts: [[x0, yO, 0], [x1, yO, 0]], w: 1.6, o: 1, dash: "8 9", luz: 0.4 });
  const rS = Math.round(14 * L(t, s + 0.7, s + 1.2, 0, 1, salida));
  for (let r = 0; r < rS; r++) tr.push({ t: "l", a: [x0 + (r * (x1 - x0)) / 13, yS, 0], b: [Math.min(x0 + (r * (x1 - x0)) / 13 + 0.15, x1), 0, 0], w: 1, o: 0.3 });
  const pr = proyector(cam);
  const qE = pr([x1, 0, 0]);
  const qS = pr([x1, yS, 0]);
  const qO = pr([x1, yO, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={s + 0.4} x={Math.min(qE.x, 1030)} y={qE.y - 26} size={24} o={0.8} alinea="der">
        ENTRADA
      </Etiqueta>
      <Etiqueta t={t} t0={s + 0.8} x={Math.min(qS.x, 1030)} y={qS.y + 28} size={26} o={0.8} alinea="der">
        RIESGO · 1
      </Etiqueta>
      <Etiqueta t={t} t0={EV.doble - 0.1} x={Math.min(qO.x, 1030)} y={qO.y - 28} size={26} alinea="der">
        OBJETIVO · 2 O MÁS
      </Etiqueta>
      <Abajo o={Math.min(obj * 1.5, 1)}>
        <span style={mono(64)}>1 : 2</span>
        <span style={mono(24, 0.55)}>MÍNIMO</span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="LA REGLA" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} texto="al menos el *doble*" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. Promo
const Cta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.3, 0.2), 0.2, { apertura: 40 });
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <Promo t={t} t0={s} tAuditada={EV.auditada} tLink={EV.bio} tSigue={EV.sigueme} />
      <Kicker t={t} t0={s + 0.05} texto="LINK EN LA BIO" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.auditada - 0.35} texto="¿sin operar a *mano*?" size={90} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.auditada - 0.3} fin={EV.sigueme - 0.3} texto="cuenta *auditada*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.sigueme - 0.25} texto="*sígueme*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ composición
const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, clave: Clave, ejemplo: Ejemplo, resultado: Resultado, error: Novato, regla: Regla, cta: Cta };
const CLAVES = claves(["fallar", "ganar", "clave", "600", "800", "arriba", "novato", "contrario", "pérdidas", "doble", "auditada", "bio", "sígueme"]);

export const Acierto: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/acierto_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
