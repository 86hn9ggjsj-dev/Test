// "Cómo se prueba un bot antes de arriesgar un euro" (parte 2 de Explica): 100 % motion graphics con el mismo lenguaje.
// Ocho pantallas: el gancho, los cinco pasos (backtest, costes, datos fuera de muestra, estrés y demo), el dinero real
// poco a poco y el CTA. Se animan con los tiempos de las palabras (src/gen/prueba.json, generado por scripts/prueba.py).
import { Easing, useCurrentFrame } from "remotion";
import datos from "../gen/prueba.json";
import { salida } from "../Premium/ui";
import { ANCHO, ruido } from "../Viral/util";
import { Arriba, dos, Etiqueta, euros, L, mono, muelle, Reticula, Teclea, Titular } from "../Bot/piezas";
import { caja, clave, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { BotonSeguir, claves, cuando, Kicker, Montaje, P, paseo } from "../Explica/Montaje";

export const PRUEBA_FPS = datos.fps;
export const PRUEBA_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const en = cuando(datos);
const pct = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(Math.round(v))} %`;
const escala = (v: number[], y0: number, y1: number) => {
  const lo = Math.min(...v);
  const hi = Math.max(...v);
  return v.map((x) => y0 + ((x - lo) / (hi - lo)) * (y1 - y0));
};
const Abajo: React.FC<{ o?: number; top?: number; children: React.ReactNode }> = ({ o = 1, top = 1255, children }) => (
  <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 18, alignItems: "baseline", opacity: o }}>{children}</div>
);

// ------------------------------------------------------------------ 1. Hook: una curva perfecta del pasado no demuestra nada
const EQ: V3[] = paseo(36, 5, 0.05).map((r, i): V3 => {
  const u = i / 35;
  return [-1.45 + u * 1.45, -0.7 + 1.25 * Math.pow(u, 1.25) + r * 0.4, 0];
});
const PRUEBAS = ["BACKTEST", "COSTES REALES", "FUERA DE MUESTRA", "ESTRÉS", "DEMO"];
const Hook: React.FC<P> = ({ t, s, e }) => {
  const tLo = en("lo", s);
  const cam = orbita([0.35, -0.05, 0], L(t, s, e, 8.2, 7.4), L(t, s, e, -0.42, -0.18), L(t, s, e, 0.1, 0.18), { apertura: 35, centroY: 930 });
  const tr: Trazo[] = [...polvo(0.3)];
  const dib = L(t, s + 0.15, EV.pasado + 0.5, 0, 1, salida);
  // Al decir "nada" la curva se apaga y pasa a discontinua
  const nada = L(t, EV.nada, EV.nada + 0.45, 0, 1, salida);
  tr.push({ t: "p", pts: EQ, w: 3, o: 1 - nada, prog: dib, luz: 0.45 * (1 - nada) });
  if (nada > 0) tr.push({ t: "p", pts: EQ, w: 2, o: 0.45 * nada, dash: "7 9" });
  EQ.forEach((p, i) => {
    if (i / 35 <= dib && i % 2 === 0) tr.push({ t: "l", a: p, b: [p[0], -1.1, 0], w: 1, o: 0.1 * (1 - 0.5 * nada) });
  });
  const plano = L(t, s + 0.4, s + 0.9, 0, 1, salida);
  tr.push({ t: "p", pts: [[0, -1.1, -0.6], [0, 1.0, -0.6], [0, 1.0, 0.6], [0, -1.1, 0.6], [0, -1.1, -0.6]], w: 1.4, o: 0.55, prog: plano });
  const cabeza = EQ[Math.min(35, Math.round(dib * 35))];
  if (dib > 0) tr.push({ t: "e", c: cabeza, r: 0.045, tipo: "punto", o: 1 - 0.6 * nada, luz: 1 - nada });
  const pr = proyector(cam);
  const cima = pr([0, 1.0, 0]);
  const q = pr(cabeza);
  const lista = pr([0.18, -0.15, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={s + 0.9} x={cima.x} y={cima.y - 30} size={26} o={0.7} alinea="centro">
        AHORA
      </Etiqueta>
      {dib > 0 && (
        <div style={{ position: "absolute", left: q.x - 34, top: q.y - 40, transform: "translate(-100%, -100%)", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, opacity: 1 - 0.55 * nada }}>
          <span style={mono(22, 0.5)}>RENTABILIDAD</span>
          <span style={{ position: "relative", ...mono(48) }}>
            {pct(312 * dib)}
            <span style={{ position: "absolute", left: -8, top: "52%", height: 3, width: `calc(${nada * 100}% + 16px)`, background: "#fff" }} />
          </span>
        </div>
      )}
      <div style={{ position: "absolute", left: lista.x, top: lista.y, display: "flex", flexDirection: "column", gap: 16 }}>
        {PRUEBAS.map((p, k) => (
          <div key={p} style={{ height: 30 }}>
            <Teclea t={t} t0={en("importa", s) + k * 0.22} texto={`□ ${p}`} size={26} o={0.75} />
          </div>
        ))}
      </div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={tLo - 0.05} texto="gana en el *pasado*" size={84} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tLo} texto="¿cómo se ha *probado*?" size={80} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Backtest: un cabezal recorre años de datos levantando las velas una a una
const NV = 34;
const CIERRES = escala(paseo(NV + 1, 41, 0.26, 0.022), -0.75, 0.55);
const Backtest: React.FC<P> = ({ t, s, e }) => {
  const p = clave(t, [[EV.pasas - 0.2, 0], [EV.directo + 0.4, 1]], Easing.bezier(0.4, 0, 0.6, 1));
  const xp = -1.6 + 3.2 * p;
  const cam = orbita([xp * 0.3, -0.05, 0], L(t, s, e, 8.6, 7.8), L(t, s, e, 0.38, 0.12), L(t, s, e, 0.14, 0.22), { apertura: 35, centroY: 860 });
  const tr: Trazo[] = [...polvo(0.3)];
  const eje = L(t, s + 0.3, s + 0.9, 0, 1, salida);
  tr.push({ t: "p", pts: [[-1.7, -1.0, 0], [1.7, -1.0, 0]], w: 1.2, o: 0.5, prog: eje });
  for (let a = 0; a <= 6; a++) tr.push({ t: "l", a: [-1.6 + a * (3.2 / 6), -1.0, 0], b: [-1.6 + a * (3.2 / 6), -0.92, 0], w: 1.2, o: 0.5 * eje });
  const Y = (v: number) => v;
  let operaciones = 0;
  for (let i = 0; i < NV; i++) {
    const g = Math.min(Math.max((p * NV - i) * 1.2, 0), 1);
    if (g <= 0) continue;
    const x = -1.6 + (i + 0.5) * (3.2 / NV);
    const a = Y(CIERRES[i]);
    const c = Y(CIERRES[i + 1]);
    const lo = Math.min(a, c);
    const alto = Math.max(Math.abs(c - a), 0.012) * g;
    const w = 0.032;
    for (const [pa, pb] of caja([x - w, lo, -w], [x + w, lo + alto, w])) tr.push({ t: "l", a: pa, b: pb, w: 1.3, o: c > a ? 0.9 : 0.45 });
    const mecha = (0.05 + 0.08 * ruido(i * 5)) * g;
    tr.push({ t: "l", a: [x, lo - mecha, 0], b: [x, lo + alto + mecha, 0], w: 1, o: 0.5 });
    // Cada pocas velas, una operación simulada
    if (i % 5 === 2 && g >= 1) {
      operaciones++;
      tr.push({ t: "e", c: [x, lo + alto + mecha + 0.16, 0], r: 0.03, tipo: "aro", o: 0.9 });
    }
  }
  // Cabezal de reproducción
  const cabezal = p > 0 ? L(t, EV.directo + 0.4, EV.directo + 0.9, 0.65, 0.2) : 0;
  tr.push({ t: "p", pts: [[xp, -1.0, -0.35], [xp, 0.85, -0.35], [xp, 0.85, 0.35], [xp, -1.0, 0.35], [xp, -1.0, -0.35]], w: 1.4, o: cabezal, luz: 0.3 * cabezal });
  const pr = proyector(cam);
  const arriba = pr([xp, 0.85, 0]);
  const meses = p * 5.999;
  const fecha = `${2019 + Math.floor(meses)}-${dos(1 + Math.floor((meses % 1) * 12))}`;
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {[2019, 2020, 2021, 2022, 2023, 2024, 2025].map((a, i) => {
        const q = pr([-1.6 + i * (3.2 / 6), -1.0, 0]);
        return (
          <div key={a} style={{ position: "absolute", left: q.x, top: q.y + 24, transform: "translateX(-50%)", opacity: eje, ...mono(24, 0.55) }}>
            {a}
          </div>
        );
      })}
      {p > 0 && (
        <div style={{ position: "absolute", left: arriba.x, top: arriba.y - 26, transform: "translate(-50%, -100%)", opacity: cabezal / 0.65 }}>
          <span style={mono(28, 0.9)}>{fecha}</span>
        </div>
      )}
      <Etiqueta t={t} t0={EV.directo - 0.1} x={110} y={575} size={26}>
        <span style={{ opacity: Math.floor(t * 2.5) % 2 ? 0.25 : 1 }}>●</span> COMO EN DIRECTO
      </Etiqueta>
      <Abajo o={p > 0 ? 1 : 0} top={1300}>
        <span style={mono(56)}>{euros(Math.round(p * 1284))}</span>
        <span style={mono(24, 0.55)}>VELAS · {operaciones} OPERACIONES</span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="PASO 01 / 05" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.vela - 0.3} texto="el *backtest*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.vela - 0.25} texto="vela a *vela*" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Costes: la curva neta se separa de la bruta en tres golpes
const NC = 46;
const BRUTA = paseo(NC, 61, 0.09).map((r, i) => -0.75 + (i / (NC - 1)) * 1.35 + r * 0.5);
const COSTES: [string, number][] = [
  ["− COMISIONES", EV.comisiones],
  ["− SPREAD", EV.spread],
  ["− DESLIZAMIENTO", EV.deslizamiento],
];
const Costes: React.FC<P> = ({ t, s, e }) => {
  const tUn = en("un", s);
  const cam = orbita([0.12, -0.1, 0], L(t, s, e, 9.0, 8.2), L(t, s, e, -0.32, -0.06), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 920 });
  const X = (i: number) => -1.45 + i * (2.9 / (NC - 1));
  const dib = L(t, s + 0.15, s + 1.3, 0, 1, salida);
  const coste = COSTES.reduce((a, [, t0]) => a + Math.min(muelle(t, t0 - 0.05, 160, 12), 1.15), 0);
  const neta = BRUTA.map((y, i) => y - (i / (NC - 1)) * 0.55 * coste);
  const verNeta = L(t, EV.comisiones - 0.3, EV.comisiones, 0, 1, salida);
  const tr: Trazo[] = [...polvo(0.3)];
  // Capital inicial: lo que queda por debajo es perder dinero
  tr.push({ t: "l", a: [-1.55, BRUTA[0], 0], b: [1.6, BRUTA[0], 0], w: 1.2, o: 0.45 * dib, dash: "6 9" });
  tr.push({ t: "p", pts: BRUTA.map((y, i): V3 => [X(i), y, 0]), w: 2.4, o: 1 - 0.5 * verNeta, prog: dib });
  if (verNeta > 0) {
    tr.push({ t: "p", pts: neta.map((y, i): V3 => [X(i), y, 0]), w: 2.8, o: verNeta, luz: 0.4 * verNeta });
    for (let i = 2; i < NC; i += 2) tr.push({ t: "l", a: [X(i), BRUTA[i], 0], b: [X(i), neta[i], 0], w: 1, o: 0.25 * verNeta });
  }
  const pr = proyector(cam);
  const finB = pr([X(NC - 1), BRUTA[NC - 1], 0]);
  const finN = pr([X(NC - 1), neta[NC - 1], 0]);
  const inicio = pr([-1.2, BRUTA[0], 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} encima={() => <Reticula q={finN} r={30} k={muelle(t, EV.perder, 220, 14)} />} />
      <Etiqueta t={t} t0={s + 0.5} x={inicio.x} y={inicio.y + 30} size={24} o={0.55}>
        0 %
      </Etiqueta>
      <Etiqueta t={t} t0={s + 1.1} x={Math.min(finB.x, 1030)} y={finB.y - 40} size={30} o={1 - 0.45 * verNeta} alinea="der">
        BRUTO +31 %
      </Etiqueta>
      <Etiqueta t={t} t0={EV.comisiones} x={Math.min(finN.x, 1030)} y={finN.y + 44} size={30} alinea="der">
        {`NETO ${pct(31 - 11.7 * coste)}`}
      </Etiqueta>
      <div style={{ position: "absolute", top: 560, left: 110, display: "flex", flexDirection: "column", gap: 14 }}>
        {COSTES.map(([texto, t0]) => (
          <div key={texto} style={{ height: 34, position: "relative" }}>
            <Etiqueta t={t} t0={t0 - 0.05} x={0} y={17} size={30}>
              {texto}
            </Etiqueta>
          </div>
        ))}
      </div>
      <Kicker t={t} t0={s + 0.05} texto="PASO 02 / 05" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={tUn - 0.05} texto="costes *reales*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tUn} fin={EV.perder - 0.3} texto="sin costes, *gana*" size={88} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.perder - 0.25} texto="con ellos, *pierde*" size={88} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Fuera de muestra: perfecta donde se ajustó, se desploma en datos nuevos
const XS = 0.2;
const NA = 30;
const NB = 18;
const AJUSTE: V3[] = paseo(NA, 71, 0.03).map((r, i): V3 => {
  const u = i / (NA - 1);
  return [-1.3 + u * (XS + 1.3), -0.8 + 1.4 * Math.pow(u, 1.4) + r * 0.3, 0];
});
const FIN_A = AJUSTE[NA - 1];
const FUERA: V3[] = paseo(NB, 77, 0.16).map((r, i): V3 => {
  const u = i / (NB - 1);
  return [XS + u * (1.3 - XS), FIN_A[1] - 1.25 * Math.pow(u, 0.8) + r * 0.35, 0];
});
const zona = (x0: number, x1: number): V3[] => [[x0, -1.05, 0], [x0, 0.95, 0], [x1, 0.95, 0], [x1, -1.05, 0], [x0, -1.05, 0]];
const Fuera: React.FC<P> = ({ t, s, e }) => {
  const tAnos = en("años", s);
  const tPruebas = en("pruebas", s);
  const cam = orbita([0.12, -0.05, 0], L(t, s, e, 9.2, 8.5), L(t, s, e, 0.3, 0.05), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 950 });
  const tr: Trazo[] = [...polvo(0.3)];
  // Los datos: marcas tenues a lo largo de todo el periodo
  const datosV = L(t, s + 0.2, s + 1.0, 0, 1, salida);
  for (let i = 0; i < 48; i++) {
    const x = -1.3 + i * (2.6 / 47);
    if ((i / 47) > datosV) break;
    const enPrueba = x > XS;
    const h = 0.08 + 0.2 * ruido(i * 9);
    tr.push({ t: "l", a: [x, -1.05, 0], b: [x, -1.05 + h, 0], w: 3, o: enPrueba ? 0.25 + 0.35 * L(t, EV.otros - 0.2, EV.otros + 0.3, 0, 1) : 0.25 });
  }
  const zA = L(t, EV.ajustas - 0.3, EV.ajustas + 0.3, 0, 1, salida);
  const zB = L(t, tPruebas - 0.2, tPruebas + 0.4, 0, 1, salida);
  tr.push({ t: "p", pts: zona(-1.35, XS - 0.02), w: 1.3, o: 0.4, prog: zA });
  tr.push({ t: "p", pts: zona(XS + 0.02, 1.35), w: 1.3, o: 0.4, prog: zB, dash: "6 8" });
  const dA = L(t, EV.ajustas - 0.1, tAnos + 0.6, 0, 1, salida);
  const dB = L(t, EV.otros - 0.1, EV.otros + 1.3, 0, 1, Easing.bezier(0.5, 0, 0.7, 1));
  const solo = L(t, en("solo", s), en("solo", s) + 0.5, 0, 1, salida);
  tr.push({ t: "p", pts: AJUSTE, w: 2.8, o: 1, prog: dA, luz: 0.25 + 0.35 * solo });
  if (dB > 0) tr.push({ t: "p", pts: FUERA, w: 2.8, o: 1, prog: dB, luz: 0.3 });
  const pr = proyector(cam);
  const etA = pr([-1.3, 0.95, 0]);
  const etB = pr([XS + 0.07, 0.95, 0]);
  const fa = pr(FIN_A);
  const finB = pr(FUERA[NB - 1]);
  const mitadA = pr([-0.55, 0.55, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} encima={() => <Reticula q={finB} r={30} k={muelle(t, EV.sobre, 220, 14)} />} />
      <Etiqueta t={t} t0={EV.ajustas} x={etA.x} y={etA.y - 26} size={24} o={0.7}>
        AJUSTE · 2019–2022
      </Etiqueta>
      <Etiqueta t={t} t0={tPruebas} x={etB.x} y={etB.y - 26} size={24} o={0.7}>
        PRUEBA · 2023–24
      </Etiqueta>
      <Etiqueta t={t} t0={tAnos + 0.4} x={fa.x - 16} y={fa.y - 36} size={30} alinea="der">
        +84 %
      </Etiqueta>
      <Etiqueta t={t} t0={EV.otros + 1.1} x={Math.min(finB.x, 1030)} y={finB.y + 48} size={30} alinea="der">
        −23 %
      </Etiqueta>
      <Etiqueta t={t} t0={en("solo", s)} x={mitadA.x} y={mitadA.y} size={26} o={0.8} alinea="centro">
        SOLO FUNCIONA AQUÍ
      </Etiqueta>
      <Kicker t={t} t0={s + 0.05} texto="PASO 03 / 05" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.sobre - 0.55} texto="datos que no ha *visto*" size={78} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.sobre - 0.5} texto="*sobreoptimizado*" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Estrés: las mismas operaciones barajadas; la peor racha frente a tu límite
const OPS = Array.from({ length: 40 }, (_, k) => 0.8 + (ruido(k * 7 + 3) - 0.5) * 9);
const acumula = (v: number[]) => {
  const c = [0];
  for (const r of v) c.push(c[c.length - 1] + r);
  return c;
};
const baraja = (sem: number) => {
  const v = OPS.slice();
  for (let i = v.length - 1; i > 0; i--) {
    const j = Math.floor(ruido(sem * 97.3 + i * 13.1) * (i + 1));
    const x = v[i];
    v[i] = v[j];
    v[j] = x;
  }
  return acumula(v);
};
const MC = [acumula(OPS), ...Array.from({ length: 47 }, (_, k) => baraja(k + 1))];
const caidaMax = (c: number[]) => {
  let pico = 0;
  let r = { dd: 0, pico: 0, valle: 0 };
  for (let i = 1; i < c.length; i++) {
    if (c[i] > c[pico]) pico = i;
    if (c[pico] - c[i] > r.dd) r = { dd: c[pico] - c[i], pico, valle: i };
  }
  return r;
};
const DD = MC.map(caidaMax);
const PEOR = DD.reduce((b, d, i) => (d.dd > DD[b].dd ? i : b), 0);
const LIMITE = Math.round(DD[PEOR].dd * 0.55);
const MIN_MC = Math.min(...MC.map((c) => Math.min(...c)));
const MAX_MC = Math.max(...MC.map((c) => Math.max(...c)));
const YM = (v: number) => -1.0 + ((v - MIN_MC) / (MAX_MC - MIN_MC)) * 2.0;
const XM = (i: number) => -1.3 + i * (2.6 / 40);
const Estres: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.22, -0.05, 0], L(t, s, e, 9.2, 8.4), L(t, s, e, -0.36, -0.1), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.3)];
  const t1 = EV.mil + 0.5;
  const peor = L(t, EV.peor - 0.1, EV.peor + 0.3, 0, 1, salida);
  MC.forEach((c, k) => {
    const t0 = k === 0 ? s + 0.2 : EV.barajas + ((k - 1) / 46) * (t1 - EV.barajas);
    const prog = L(t, t0, t0 + (k === 0 ? 0.9 : 0.35), 0, 1, salida);
    if (prog <= 0) return;
    const pts = c.map((v, i): V3 => [XM(i), YM(v), -0.01 * k]);
    if (k === PEOR) tr.push({ t: "p", pts, w: 1.1 + 2 * peor, o: 0.22 + 0.78 * peor, prog, luz: 0.6 * peor });
    else tr.push({ t: "p", pts, w: k === 0 ? 2.4 : 1.1, o: (k === 0 ? 0.9 : 0.22) * (1 - 0.6 * peor), prog });
  });
  // Peor caída: del pico al valle, y el límite que aguantarías
  const d = DD[PEOR];
  const c = MC[PEOR];
  const xv = XM(d.valle);
  const yp = YM(c[d.pico]);
  const yv = YM(c[d.valle]);
  const brk = L(t, EV.peor + 0.3, EV.peor + 0.8, 0, 1, salida);
  if (brk > 0) {
    tr.push({ t: "l", a: [XM(d.pico), yp, 0.02], b: [xv + 0.12, yp, 0.02], w: 1.2, o: 0.7 * brk, dash: "5 7" });
    tr.push({ t: "p", pts: [[xv + 0.12, yp, 0.02], [xv + 0.12, yp + (yv - yp) * brk, 0.02]], w: 2, o: 1 });
  }
  const yl = YM(c[d.pico] - LIMITE);
  const lim = L(t, EV.caida - 0.1, EV.caida + 0.4, 0, 1, salida);
  if (lim > 0) tr.push({ t: "p", pts: [[XM(d.pico) - 0.3, yl, 0.02], [xv + 0.5, yl, 0.02]], w: 1.6, o: 0.9, dash: "8 9", prog: lim });
  const pr = proyector(cam);
  const qv = pr([xv, yv, 0]);
  const listo = muelle(t, EV.listo - 0.05, 200, 15);
  return (
    <>
      <Escena cam={cam} trazos={tr} encima={() => <Reticula q={qv} r={28} k={muelle(t, EV.peor + 0.3, 220, 14)} />} />
      <Abajo o={t >= EV.barajas && t < EV.peor + 0.3 ? 1 : 0}>
        <span style={mono(56)}>{euros(L(t, EV.barajas, t1, 0, 1000, salida))}</span>
        <span style={mono(24, 0.55)}>SIMULACIONES</span>
      </Abajo>
      <Abajo o={t >= EV.peor + 0.3 && t < EV.listo - 0.1 ? 1 : 0}>
        <span style={mono(56)}>{`−${Math.round(d.dd)} %`}</span>
        <span style={mono(24, 0.55)}>MÁX. CAÍDA</span>
        <span style={{ ...mono(24, 0.8), opacity: t >= EV.caida ? 1 : 0 }}>{` · TU LÍMITE −${LIMITE} %`}</span>
      </Abajo>
      <Abajo o={Math.min(listo * 1.5, 1)}>
        <span style={{ ...mono(52), display: "inline-block", transform: `scale(${0.85 + 0.15 * Math.min(listo, 1.1)})` }}>✕ NO ESTÁ LISTO</span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="PASO 04 / 05" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.peor - 0.35} texto="prueba de *estrés*" size={88} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.peor - 0.3} texto="la *peor* racha" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Demo: en tiempo real y con dinero ficticio, calcando al backtest
const ND = 40;
const BT = escala(paseo(ND + 1, 88, 0.14, 0.025), -0.75, 0.6);
const DEMO = BT.map((v, i) => v + (i ? (ruido(i * 11 + 5) - 0.5) * 0.07 : 0));
const YD = (v: number) => v;
const XD = (i: number) => -1.5 + i * (3 / ND);
const Demo: React.FC<P> = ({ t, s, e }) => {
  const tY = en("y", s);
  const cam = orbita([0.15, -0.1, 0], L(t, s, e, 9.0, 8.3), L(t, s, e, 0.34, 0.08), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 930 });
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "p", pts: BT.map((v, i): V3 => [XD(i), YD(v), 0]), w: 1.6, o: 0.55, dash: "8 9", prog: L(t, s + 0.2, s + 1.0, 0, 1, salida) });
  const p = L(t, EV.semanas - 0.2, EV.mismo, 0, 1, Easing.bezier(0.3, 0, 0.6, 1));
  const n = p * ND;
  const i0 = Math.floor(n);
  const cabeza: V3 = i0 >= ND ? [XD(ND), YD(DEMO[ND]), 0] : [XD(n), YD(DEMO[i0] + (DEMO[i0 + 1] - DEMO[i0]) * (n - i0)), 0];
  if (p > 0) {
    tr.push({ t: "p", pts: DEMO.map((v, i): V3 => [XD(i), YD(v), 0]), w: 2.8, o: 1, prog: p, luz: 0.4 });
    tr.push({ t: "e", c: cabeza, r: 0.045, tipo: "punto", o: 1, luz: 1 });
    if (p < 1) tr.push({ t: "l", a: [cabeza[0], -1.05, 0], b: [cabeza[0], 0.95, 0], w: 1, o: 0.45 });
  }
  const pr = proyector(cam);
  const q = pr(cabeza);
  const fin = pr([XD(ND), YD(DEMO[ND]), 0]);
  const saldo = 10000 * (1 + 0.08 * (DEMO[Math.min(i0, ND)] - DEMO[0]));
  const igual = muelle(t, EV.mismo - 0.05, 200, 15);
  return (
    <>
      <Escena cam={cam} trazos={tr} encima={() => <Reticula q={fin} r={30} k={muelle(t, EV.backtest, 220, 14)} />} />
      <div style={{ position: "absolute", top: 560, left: 110, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ height: 30, position: "relative" }}>
          <Etiqueta t={t} t0={s + 0.5} x={0} y={15} size={26} o={0.6}>
            ┄ BACKTEST
          </Etiqueta>
        </div>
        <div style={{ height: 30, position: "relative" }}>
          <Etiqueta t={t} t0={EV.semanas - 0.1} x={0} y={15} size={26}>
            ━ DEMO · TIEMPO REAL
          </Etiqueta>
        </div>
      </div>
      {p > 0 && p < 1 && (
        <div style={{ position: "absolute", left: q.x, top: q.y - 44, transform: "translate(-50%, -100%)" }}>
          <span style={mono(26, 0.9)}>{`SEMANA ${Math.min(8, 1 + Math.floor(p * 8))}`}</span>
        </div>
      )}
      <Abajo o={t >= EV.ficticio - 0.1 && t < EV.mismo - 0.1 ? 1 : 0}>
        <span style={mono(56)}>{`${euros(saldo)} €`}</span>
        <span style={mono(24, 0.55)}>FICTICIOS</span>
      </Abajo>
      <Abajo o={Math.min(igual * 1.5, 1)}>
        <span style={mono(52)}>DESVIACIÓN 0,4 % ✓</span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="PASO 05 / 05" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={tY - 0.05} texto="cuenta *demo*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tY} texto="igual que el *backtest*" size={80} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. Real: bloques de capital que solo crecen cuando los números lo confirman
const BLOQUES: [number, number, string][] = [
  [-1.2, 0.26, "100 €"],
  [-0.65, 0.4, "250 €"],
  [0.05, 0.56, "500 €"],
  [0.94, 0.78, "1.000 €"],
];
const SUELO = -0.6;
const Real: React.FC<P> = ({ t, s, e }) => {
  const tY = en("y", EV.poco);
  const cam = orbita([0, -0.15, 0], L(t, s, e, 8.6, 8.0), L(t, s, e, -0.3, -0.1), L(t, s, e, 0.22, 0.3), { apertura: 35, centroY: 870 });
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "p", pts: [[-1.5, SUELO, 0.5], [1.5, SUELO, 0.5]], w: 1.2, o: 0.5, prog: L(t, s + 0.2, s + 0.8, 0, 1, salida) });
  const aparece = [EV.real - 0.05, EV.subiendo - 0.05, EV.subiendo + 0.45, EV.subiendo + 0.95];
  const cimas: V3[] = [];
  BLOQUES.forEach(([x, l], k) => {
    const g = muelle(t, aparece[k], 150, 13);
    if (g <= 0) return;
    const pulso = k === 0 ? 1 + 0.12 * Math.sin(Math.min(Math.max((t - EV.poco) / 0.4, 0), 1) * Math.PI) : 1;
    const h = l * g * pulso;
    for (const [a, b] of caja([x - l / 2, SUELO, -l / 2], [x + l / 2, SUELO + h, l / 2])) tr.push({ t: "l", a, b, w: 1.5, o: 0.9 });
    cimas.push([x, SUELO + h, 0]);
  });
  if (cimas.length > 1) tr.push({ t: "p", pts: cimas, w: 1.2, o: 0.5, dash: "5 8" });
  const pr = proyector(cam);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {BLOQUES.map(([x, l, etiqueta], k) => {
        const base = pr([x, SUELO, l / 2]);
        const cima = pr([x, SUELO + l, 0]);
        return (
          <div key={etiqueta}>
            <Etiqueta t={t} t0={k === 0 ? EV.poco - 0.05 : aparece[k] + 0.1} x={base.x} y={base.y + 34} size={26} alinea="centro">
              {etiqueta}
            </Etiqueta>
            <Etiqueta t={t} t0={EV.confirman - 0.1 + k * 0.12} x={cima.x} y={cima.y - 40} size={34} alinea="centro">
              ✓
            </Etiqueta>
          </div>
        );
      })}
      <Kicker t={t} t0={s + 0.05} texto="DESPUÉS DE LOS 5 PASOS" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.real - 0.45} texto="solo *entonces*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.real - 0.4} fin={tY - 0.05} texto="dinero *real*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tY} texto="poco a *poco*" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 8. CTA: seguir para la parte 3, los errores que hacen mentir a un backtest
const CURVA: V3[] = paseo(61, 23, 0.18, 0.03).map((y, i): V3 => [-1.9 + i * (3.8 / 60), y * 0.7 - 0.6, 0]);
const ERRORES = [14, 31, 47];
const REALIDAD: V3[] = paseo(47, 29, 0.12, -0.012).map((y, i): V3 => [CURVA[14][0] + i * (3.8 / 60), CURVA[14][1] + y * 0.8, 0]);
const Cta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.2, 0], L(t, s, e, 9, 8.2), L(t, s, e, -0.4, 0.05), 0.2, { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const eje = L(t, s + 0.6, s + 1.2, 0, 1, salida);
  tr.push({ t: "p", pts: [[-2.0, -1.3, 0], [2.0, -1.3, 0]], w: 1.2, o: 0.5, prog: eje });
  tr.push({ t: "p", pts: CURVA, w: 2.6, o: 1, prog: L(t, s + 0.7, EV.tres, 0, 1, Easing.bezier(0.3, 0, 0.3, 1)), luz: 0.4 });
  const verdad = L(t, EV.mienta - 0.3, EV.mienta + 0.8, 0, 1, salida);
  if (verdad > 0) tr.push({ t: "p", pts: REALIDAD, w: 2, o: 0.8, dash: "6 8", prog: verdad });
  const pr = proyector(cam);
  const marcas = ERRORES.map((i, k) => ({ q: pr(CURVA[i]), t0: EV.errores - 0.1 + k * 0.4 }));
  const finR = pr(REALIDAD[REALIDAD.length - 1]);
  const ini = pr([-1.9, 1.0, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} encima={() => marcas.map(({ q, t0 }, k) => <Reticula key={k} q={q} r={26} k={muelle(t, t0, 220, 14)} />)} />
      {marcas.map(({ q, t0 }, k) => (
        <Etiqueta key={k} t={t} t0={t0 + 0.05} x={q.x} y={q.y - 52} size={26} alinea="centro">
          {dos(k + 1)}
        </Etiqueta>
      ))}
      <Etiqueta t={t} t0={s + 0.8} x={ini.x} y={ini.y} size={26} o={0.7}>
        BACKTEST
      </Etiqueta>
      <Etiqueta t={t} t0={EV.mienta + 0.5} x={Math.min(finR.x, 1030)} y={finR.y + 36} size={26} o={0.8} alinea="der">
        REALIDAD
      </Etiqueta>
      <BotonSeguir t={t} t0={s} />
      <Kicker t={t} t0={EV.tres - 0.7} texto="PRÓXIMO VÍDEO · PARTE 3" />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.tres - 0.75} texto="*sígueme*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.tres - 0.7} texto="los tres *errores*" size={88} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ composición
const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, backtest: Backtest, costes: Costes, fuera: Fuera, estres: Estres, demo: Demo, real: Real, cta: Cta };
const CLAVES = claves(["pasado", "nada", "probado", "backtest", "directo", "costes", "perder", "visto", "sobreoptimizado", "estrés", "peor", "listo", "demo", "ficticio", "real", "confirman", "errores", "mienta"]);

export const Prueba: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/prueba_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
