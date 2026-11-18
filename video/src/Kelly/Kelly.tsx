// Reel de alcance "La fórmula del matemático que ganó al blackjack" (~39 s), en blanco y negro: cartas de alambre que se
// reparten y se convierten en velas, la fórmula de Kelly que se escribe sola, el «sígueme» a mitad, 0,55 − 0,45 / 1 = 10 %,
// las tres curvas de crecimiento (10 % sube, 20 % plano, 30 % se hunde), la regla con medio Kelly y la pregunta final.
// Tiempos en src/gen/kelly.json (scripts/kelly.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/kelly.json";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { Arriba, Etiqueta, L, mono, muelle, Teclea, Titular } from "../Bot/piezas";
import { Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { fichas, velas } from "../Bot/kit";
import { claves, CtaSeguir, Destello, Gigante, golpe, Kicker, Montaje, P, paseo, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const KELLY_FPS = datos.fps;
export const KELLY_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// ------------------------------------------------------------------ 1. Hook: blackjack… y luego Wall Street
const carta = (tr: Trazo[], c: V3, ang: number, g: number, o = 1) => {
  const w = 0.2 * g;
  const h = 0.3 * g;
  const r = (x: number, y: number): V3 => [c[0] + x * Math.cos(ang) - y * Math.sin(ang), c[1] + x * Math.sin(ang) + y * Math.cos(ang), c[2]];
  const pts = [r(-w, -h), r(w, -h), r(w, h), r(-w, h), r(-w, -h)];
  tr.push({ t: "p", pts, w: 2, o, relleno: "#fff", oRelleno: 0.08 * o, luz: 0.2 });
  tr.push({ t: "p", pts: [r(-w * 0.8, -h * 0.85), r(w * 0.8, -h * 0.85), r(w * 0.8, h * 0.85), r(-w * 0.8, h * 0.85), r(-w * 0.8, -h * 0.85)], w: 0.8, o: 0.5 * o });
};
const SUBE = paseo(30, 8, 0.5, 0.12);
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.05, 0], L(t, s, e, 4.6, 4.2), L(t, s, e, -0.25, 0.2) + sacude(t, EV.blackjack - 0.05, 0.02), L(t, s, e, 0.1, 0.14), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const cambio = L(t, EV.wall - 0.4, EV.wall + 0.1, 0, 1, salida);
  const g1 = muelle(t, -0.6, 200, 14);
  const g2 = muelle(t, -0.3, 200, 14);
  if (cambio < 1) {
    carta(tr, [-0.14, 0.05, 0], -0.12, Math.min(g1, 1.05), 1 - cambio);
    carta(tr, [0.14, 0.08, 0.01], 0.1, Math.min(g2, 1.05), 1 - cambio);
    fichas(tr, [-0.55, -0.55, 0.1], 5, 0.13, 1 - cambio, true);
    fichas(tr, [0.55, -0.55, 0.1], 8, 0.13, 1 - cambio, true);
  }
  if (cambio > 0) {
    const lo = Math.min(...SUBE);
    const hi = Math.max(...SUBE);
    velas(tr, SUBE.map((v) => -0.5 + ((v - lo) / (hi - lo)) * 1.0), -0.8, 0.8, Math.round(L(t, EV.wall - 0.2, e, 2, SUBE.length)), 0.035, cambio, 0.03, true);
  }
  const pr = proyector(cam);
  const qa = pr([-0.14, 0.05, 0.02]);
  const qk = pr([0.14, 0.08, 0.03]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {cambio < 1 && (
        <div style={{ opacity: (1 - cambio) * Math.min(g2 * 1.5, 1) }}>
          <div style={{ position: "absolute", left: qa.x, top: qa.y, transform: "translate(-50%, -50%) rotate(7deg)", ...mono(90) }}>A</div>
          <div style={{ position: "absolute", left: qk.x, top: qk.y, transform: "translate(-50%, -50%) rotate(-6deg)", ...mono(90) }}>K</div>
          <div style={{ position: "absolute", top: 1240, left: 0, width: ANCHO, display: "flex", justifyContent: "center", ...mono(60) }}>21</div>
        </div>
      )}
      <Destello t={t} t0={EV.wall - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.wall - 0.45} texto="ganó al *blackjack*" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.wall - 0.4} texto="y luego en *Wall Street*" size={88} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Kelly: Edward Thorp y la fórmula que dice cuánto apostar
const Kelly: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.2, 0.2) + sacude(t, EV.kelly - 0.05, 0.02), 0.2, { apertura: 40 });
  const g = muelle(t, EV.kelly - 0.2, 200, 14);
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <div style={{ position: "absolute", top: 640, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: Math.min(Math.max(g, 0) * 1.5, 1), transform: `scale(${0.8 + 0.2 * Math.min(Math.max(g, 0), 1.1)})`, ...mono(120) }}>
        f = p − q / b
      </div>
      <div style={{ position: "absolute", top: 860, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <Teclea t={t} t0={EV.kelly + 0.3} texto="p · PROBABILIDAD DE GANAR" size={30} o={0.85} cps={40} />
        <Teclea t={t} t0={EV.kelly + 0.9} texto="q · PROBABILIDAD DE PERDER" size={30} o={0.85} cps={40} />
        <Teclea t={t} t0={EV.kelly + 1.5} texto="b · LO QUE GANAS / LO QUE ARRIESGAS" size={30} o={0.85} cps={40} />
      </div>
      <Kicker t={t} t0={s + 0.05} texto="EDWARD THORP · CRITERIO DE KELLY" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.ventaja - 0.6} texto="criterio de *Kelly*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.ventaja - 0.55} texto="cuánto *apostar*" size={116} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Sígueme a mitad
const Sigueme: React.FC<P> = (p) => <CtaSeguir {...p} lema="GUARDA ESTA FÓRMULA" />;

// ------------------------------------------------------------------ 4. Cuenta: 0,55 − 0,45 / 1 = 10 %
const Cuenta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], 9, L(t, s, e, 0.2, -0.2) + sacude(t, EV.diez - 0.05, 0.02), 0.2, { apertura: 40 });
  const pieza = (t0: number, txt: string, o = 1) => {
    const g = muelle(t, t0 - 0.08, 220, 15);
    return <span style={{ display: "inline-block", opacity: Math.min(Math.max(g, 0) * 1.5, 1) * o, transform: `translateY(${(1 - Math.min(Math.max(g, 0), 1)) * 40}px)` }}>{txt}</span>;
  };
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <div style={{ position: "absolute", top: 560, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 30 }}>
        <span style={mono(40, 0.6)}>{pieza(EV.cincuentaycinco, "ACIERTAS 55 %")}</span>
        <span style={mono(40, 0.6)}>{pieza(EV.mismo, "GANAS = ARRIESGAS")}</span>
      </div>
      <div style={{ position: "absolute", top: 680, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 24, ...mono(86) }}>
        {pieza(EV.cincuentaycinco + 0.3, "0,55")}
        {pieza(EV.cincuentaycinco + 0.6, "− 0,45")}
        {pieza(EV.mismo + 0.2, "/ 1")}
      </div>
      <Gigante t={t} t0={EV.diez - 0.12} texto="10 %" top={850} size={230} pie="POR OPERACIÓN" />
      <Destello t={t} t0={EV.diez - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.diez - 0.45} texto="con un *55 %*…" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.diez - 0.4} texto="Kelly: *10 %*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Exceso: con un 20 % no creces; con un 30 % te arruinas
const crec = (f: number) => 0.55 * Math.log(1 + f) + 0.45 * Math.log(1 - f);
const N = 500;
const curvaF = (f: number, hasta: number, semilla: number): V3[] => {
  const ruidoC = paseo(101, semilla, 0.09);
  return Array.from({ length: Math.max(2, Math.round(101 * hasta)) }, (_, i) => {
    const n = (i / 100) * N;
    const logv = n * crec(f) + ruidoC[i] * Math.sqrt(f * 10) * 0.3;
    return [-0.85 + 1.7 * (i / 100), Math.max(-0.7, Math.min(0.75, 0.05 + logv * 0.28)), 0] as V3;
  });
};
const Exceso: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 5.2, 4.9), L(t, s, e, -0.15, 0.12) + sacude(t, EV.arruinas - 0.05), L(t, s, e, 0.05, 0.09), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "l", a: [-0.9, 0.05, 0], b: [0.9, 0.05, 0], w: 1, o: 0.45, dash: "5 6" });
  const p10 = L(t, s + 0.1, s + 1.2, 0, 1, salida);
  const p20 = L(t, EV.veinte - 0.2, EV.nada, 0, 1, salida);
  const p30 = L(t, EV.treinta - 0.2, EV.arruinas, 0, 1, salida);
  tr.push({ t: "p", pts: curvaF(0.1, p10, 3), w: 2.6, o: 1, luz: 0.5 });
  if (p20 > 0) tr.push({ t: "p", pts: curvaF(0.2, p20, 5), w: 2.2, o: 1, dash: "10 6", luz: 0.3 });
  if (p30 > 0) tr.push({ t: "p", pts: curvaF(0.3, p30, 9), w: 2.2, o: 1, dash: "3 5", luz: 0.3 });
  const pr = proyector(cam);
  const fin = (f: number, sem: number) => {
    const c = curvaF(f, 1, sem);
    return pr(c[c.length - 1]);
  };
  const q10 = fin(0.1, 3);
  const q20 = fin(0.2, 5);
  const q30 = fin(0.3, 9);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={s + 1.0} x={Math.min(q10.x, 1040)} y={q10.y - 34} size={30} alinea="der">
        10 % ↑
      </Etiqueta>
      <Etiqueta t={t} t0={EV.nada - 0.1} x={Math.min(q20.x, 1040)} y={q20.y - 34} size={30} alinea="der">
        20 % =
      </Etiqueta>
      <Etiqueta t={t} t0={EV.arruinas - 0.1} x={Math.min(q30.x, 1040)} y={q30.y + 34} size={30} alinea="der">
        30 % ↓
      </Etiqueta>
      <Kicker t={t} t0={s + 0.05} texto="500 OPERACIONES · 55 % DE ACIERTOS" />
      <Destello t={t} t0={EV.arruinas - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.treinta - 0.45} texto="*20 %*: no creces" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.treinta - 0.4} fin={EV.pierdes - 0.6} texto="*30 %*: te arruinas" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.pierdes - 0.55} texto="aunque *ganes* más" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Profesionales: medio Kelly
const Pros: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.2, 0.2) + sacude(t, EV.mitad - 0.05, 0.02), 0.2, { apertura: 40 });
  const X0 = 120;
  const X1 = 960;
  const xv = (v: number) => X0 + ((X1 - X0) * v) / 30;
  const marcas: [number, string][] = [[5, "MEDIO KELLY"], [10, "KELLY"], [20, "CRECES 0"], [30, "RUINA"]];
  const knob = L(t, s + 0.3, EV.mitad, 18, 5, salida);
  const k = golpe(t, EV.mitad - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <div style={{ position: "absolute", top: 820, left: X0, width: X1 - X0, height: 4, background: "rgba(255,255,255,0.55)" }} />
      {marcas.map(([v, txt], i) => (
        <div key={v} style={{ position: "absolute", top: i % 2 ? 860 : 700, left: xv(v), transform: "translateX(-50%)", textAlign: "center", opacity: L(t, s + 0.1 + i * 0.1, s + 0.4 + i * 0.1, 0, 1) * (v === 5 ? 1 : 0.7) }}>
          <div style={mono(v === 5 ? 34 : 26)}>{`${v} %`}</div>
          <div style={mono(v === 5 ? 24 : 20, 0.8)}>{txt}</div>
        </div>
      ))}
      <div style={{ position: "absolute", top: 800, left: xv(knob), width: 44, height: 44, marginLeft: -22, borderRadius: 22, background: "#fff", boxShadow: `0 0 ${30 + 30 * k}px rgba(255,255,255,0.7)` }} />
      <Destello t={t} t0={EV.mitad - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} texto="*medio* Kelly" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta al final
const Pregunta: React.FC<P> = (p) => <PreguntaComentarios {...p} lineas={["¿apuestas de menos", "o *de más*?"]} kicker="DIME LA VERDAD" size={88} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, kelly: Kelly, sigueme: Sigueme, cuenta: Cuenta, exceso: Exceso, pros: Pros, pregunta: Pregunta };
export const CLAVES = claves(["blackjack", "Wall", "Thorp", "Kelly", "ventaja", "sígueme", "55%", "10%", "20%", "nada", "30%", "arruinas", "mitad", "más"]);

export const KellyReel: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/kelly_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
