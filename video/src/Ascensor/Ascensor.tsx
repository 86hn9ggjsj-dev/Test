// Reel de alcance "La bolsa sube por la escalera y baja en ascensor" (~39 s), en blanco y negro: el precio que sube
// escalón a escalón y la cabina del ascensor que cae, el S&P 500 de 2020 hasta el mínimo del 23 de marzo (−34 %), el
// «sígueme» a mitad, 33 días para caer frente a 148 para volver, los relojes del miedo y la codicia con las ventas
// amontonadas en el mínimo, el plan escrito y la pregunta final. Tiempos en src/gen/ascensor.json (scripts/ascensor.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/ascensor.json";
import { salida } from "../Premium/ui";
import { ANCHO, ruido } from "../Viral/util";
import { Arriba, Etiqueta, L, mono, muelle, Teclea, Titular } from "../Bot/piezas";
import { circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, suelo } from "../Bot/kit";
import { claves, CtaSeguir, Destello, Gigante, golpe, Kicker, Montaje, P, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const ASCENSOR_FPS = datos.fps;
export const ASCENSOR_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// S&P 500 en 2020 (día del año → cierre aproximado): máximo el 19-2 (día 50), mínimo el 23-3 (día 83), vuelta el 18-8 (día 231)
const CLAVES_SP: [number, number][] = [
  [1, 3258], [19, 3330], [31, 3226], [50, 3386], [56, 3128], [62, 2954], [72, 2711], [76, 2386], [83, 2237], [86, 2630], [98, 2790],
  [115, 2840], [135, 2950], [150, 3080], [160, 3230], [174, 3010], [190, 3200], [204, 3270], [219, 3290], [231, 3390],
];
const SP = Array.from({ length: 231 }, (_, i) => {
  const d = i + 1;
  const j = Math.max(0, CLAVES_SP.findIndex(([x]) => x >= d) - 1);
  const [x0, y0] = CLAVES_SP[j];
  const [x1, y1] = CLAVES_SP[Math.min(j + 1, CLAVES_SP.length - 1)];
  const u = x1 === x0 ? 0 : (d - x0) / (x1 - x0);
  return y0 + (y1 - y0) * u + 18 * Math.sin(d * 1.3) * (d > 1 && d < 231 && d !== 50 && d !== 83 ? 1 : 0);
});
// dmax: último día que cabe en el ancho (100 para ver la caída de cerca, 231 para el año hasta la vuelta)
const XD = (d: number, dmax = 231) => -0.85 + (1.7 * (d - 1)) / (dmax - 1);
const YS = (v: number) => -0.55 + ((v - 2200) / 1220) * 1.1;
const curva = (hasta: number, dmax: number): V3[] => SP.slice(0, Math.max(2, Math.round(hasta))).map((v, i) => [XD(i + 1, dmax), YS(v), 0]);
const grafico = (tr: Trazo[], hasta: number, o = 1, dmax = 231) => {
  const pts = curva(hasta, dmax);
  tr.push({ t: "p", pts: [...pts, [pts[pts.length - 1][0], YS(2200), 0], [pts[0][0], YS(2200), 0], pts[0]], w: 0, o, relleno: "#fff", oRelleno: 0.07 * o });
  tr.push({ t: "p", pts, w: 2.4, o, luz: 0.35 });
  tr.push({ t: "e", c: pts[pts.length - 1], r: 0.03, tipo: "punto", o, luz: 1 });
  tr.push({ t: "l", a: [XD(1, dmax), YS(2200), 0], b: [XD(Math.min(231, dmax), dmax), YS(2200), 0], w: 1, o: 0.4 * o });
};

// ------------------------------------------------------------------ 1. Hook: sube por la escalera, baja en ascensor
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.05, 0], L(t, s, e, 5.0, 4.6), L(t, s, e, -0.45, -0.2) + sacude(t, EV.ascensor - 0.05), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  suelo(tr, t, -0.7, 0.18, "#fff", 0.3);
  // Escalera: ocho peldaños
  for (let k = 0; k < 8; k++) {
    const g = muelle(t, -0.6 + k * 0.06, 220, 15);
    if (g <= 0) continue;
    const x = -0.95 + k * 0.13;
    cristal(tr, [x, -0.7, -0.15], [x + 0.13, -0.7 + (k + 1) * 0.12 * Math.min(g, 1.05), 0.15], "#fff", 0.9, 0.05, 0.08);
  }
  // El precio sube peldaño a peldaño
  const paso = Math.min(7, Math.floor(L(t, 0, EV.ascensor - 0.3, 0, 8)));
  tr.push({ t: "e", c: [-0.95 + paso * 0.13 + 0.065, -0.7 + (paso + 1) * 0.12 + 0.04, 0], r: 0.04, tipo: "punto", o: 1, luz: 1 });
  // Ascensor: hueco y cabina que cae de golpe
  for (const [a, b] of [[[0.45, -0.7, -0.15], [0.45, 0.65, -0.15]], [[0.75, -0.7, -0.15], [0.75, 0.65, -0.15]], [[0.45, -0.7, 0.15], [0.45, 0.65, 0.15]], [[0.75, -0.7, 0.15], [0.75, 0.65, 0.15]]] as [V3, V3][]) tr.push({ t: "l", a, b, w: 1.2, o: 0.6 });
  const cae = L(t, EV.ascensor - 0.15, EV.ascensor + 0.25, 0, 1, (u) => u * u);
  const yc = 0.35 - 1.05 * cae;
  cristal(tr, [0.47, yc - 0.13, -0.13], [0.73, yc + 0.13, 0.13], "#fff", 1, 0.3 + 0.6 * golpe(t, EV.ascensor + 0.2), 0.3);
  tr.push({ t: "l", a: [0.6, yc + 0.13, 0], b: [0.6, 0.65, 0], w: 1, o: 0.5 * (1 - cae), dash: "3 4" });
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Destello t={t} t0={EV.ascensor + 0.2} o={0.15} />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.ascensor - 0.4} texto="sube por la *escalera*" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.ascensor - 0.35} texto="baja en *ascensor*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Caída: febrero de 2020, −34 % en poco más de un mes
const Caida: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 5.2, 4.9), L(t, s, e, -0.15, 0.1) + sacude(t, EV.treintaycuatro - 0.05), L(t, s, e, 0.05, 0.09), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const hasta = t < EV.maximos ? L(t, s, EV.maximos, 5, 50, (u) => u) : L(t, EV.maximos + 0.4, EV.treintaycuatro, 50, 83, (u) => u * u);
  grafico(tr, hasta, 1, 100);
  const k = golpe(t, EV.treintaycuatro - 0.05);
  const marca = muelle(t, EV.treintaycuatro - 0.1, 200, 15);
  if (marca > 0) tr.push({ t: "p", pts: [[XD(88, 100), YS(3386), 0], [XD(93, 100), YS(3386), 0], [XD(93, 100), YS(2237), 0], [XD(88, 100), YS(2237), 0]], w: 2, o: 1, luz: 0.5, prog: Math.min(marca, 1) });
  const pr = proyector(cam);
  const qmax = pr([XD(50, 100), YS(3386), 0]);
  const qmin = pr([XD(83, 100), YS(2237), 0]);
  const qb = pr([XD(93, 100), YS(2810), 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.maximos - 0.2} x={qmax.x} y={qmax.y - 46} size={26} alinea="centro">
        19 FEB · 3.386
      </Etiqueta>
      <Etiqueta t={t} t0={EV.treintaycuatro - 0.1} x={qmin.x} y={qmin.y + 40} size={26} alinea="centro">
        23 MAR · 2.237
      </Etiqueta>
      {marca > 0 && <div style={{ position: "absolute", left: Math.min(qb.x + 18, 860), top: qb.y - 36, transform: `scale(${1 + 0.3 * k})`, transformOrigin: "left center", ...mono(64) }}>−34 %</div>}
      <Kicker t={t} t0={s + 0.05} texto="S&P 500 · 2020" />
      <Destello t={t} t0={EV.treintaycuatro - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.treintaycuatro - 0.45} texto="febrero de *2020*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.treintaycuatro - 0.4} fin={EV.historia - 0.45} texto="*−34 %* en un mes" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.historia - 0.4} texto="la más *rápida*" size={116} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Sígueme a mitad
const Sigueme: React.FC<P> = (p) => <CtaSeguir {...p} lema="ENTIENDE CÓMO FUNCIONA DE VERDAD" />;

// ------------------------------------------------------------------ 4. Recupera: 33 días para caer, 148 para volver
const Recupera: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 5.3, 5.0), L(t, s, e, 0.1, -0.12) + sacude(t, EV.cuatro - 0.05), L(t, s, e, 0.05, 0.09), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const dmax = L(t, s, EV.cinco, 100, 231, salida);
  grafico(tr, L(t, EV.tardo - 0.2, EV.cinco, 83, 231, salida), 1, dmax);
  const llave = (d0: number, d1: number, y: number, prog: number) =>
    prog > 0 && tr.push({ t: "p", pts: [[XD(d0, dmax), y + 0.04, 0], [XD(d0, dmax), y, 0], [XD(d1, dmax), y, 0], [XD(d1, dmax), y + 0.04, 0]], w: 1.8, o: 1, luz: 0.3, prog: Math.min(prog, 1) });
  const yb = YS(2200) - 0.1;
  llave(50, 83, yb, muelle(t, s + 0.2, 200, 16));
  llave(83, 231, yb, muelle(t, EV.cinco - 0.1, 200, 16));
  const pr = proyector(cam);
  const q1 = pr([XD(66, dmax), yb - 0.04, 0]);
  const q2 = pr([XD(157, dmax), yb - 0.04, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={s + 0.3} x={q1.x} y={q1.y + 34} size={30} alinea="centro">
        33 DÍAS
      </Etiqueta>
      <Etiqueta t={t} t0={EV.cinco - 0.05} x={q2.x} y={q2.y + 34} size={30} alinea="centro">
        148 DÍAS
      </Etiqueta>
      {t >= EV.cuatro - 0.15 && <Gigante t={t} t0={EV.cuatro - 0.15} texto="×4,5" top={430} size={180} pie="MÁS RÁPIDO BAJAR QUE SUBIR" />}
      <Destello t={t} t0={EV.cuatro - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.cinco - 0.45} texto="¿cuánto *tardó*?" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cinco - 0.4} fin={EV.cuatro - 0.45} texto="casi *5 meses*" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cuatro - 0.4} texto="bajar, *×4* más rápido" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Miedo: el miedo vende más rápido que la codicia compra
const reloj = (tr: Trazo[], c: V3, r: number, valor: number, g: number) => {
  const k = Math.min(g, 1.05);
  const arco: V3[] = Array.from({ length: 41 }, (_, i) => { const a = Math.PI - (i / 40) * Math.PI; return [c[0] + Math.cos(a) * r * k, c[1] + Math.sin(a) * r * k, 0]; });
  tr.push({ t: "p", pts: arco, w: 2.4, o: 1 });
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI - (i / 10) * Math.PI;
    tr.push({ t: "l", a: [c[0] + Math.cos(a) * r * 0.86 * k, c[1] + Math.sin(a) * r * 0.86 * k, 0], b: [c[0] + Math.cos(a) * r * k, c[1] + Math.sin(a) * r * k, 0], w: i % 5 ? 1 : 2, o: 0.7 });
  }
  const a = Math.PI - valor * Math.PI;
  tr.push({ t: "l", a: c, b: [c[0] + Math.cos(a) * r * 0.8 * k, c[1] + Math.sin(a) * r * 0.8 * k, 0], w: 3, o: 1, luz: 0.6 });
  tr.push({ t: "p", pts: circulo(c, 0.03 * k, "z", 16), w: 2, o: 1, relleno: "#fff", oRelleno: 1 });
};
const Miedo: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 5.2, 4.9), L(t, s, e, -0.12, 0.12) + sacude(t, EV.peor - 0.05, 0.02), L(t, s, e, 0.05, 0.09), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const cambio = L(t, EV.ascensor2 - 0.5, EV.ascensor2, 0, 1, salida);
  const pr = proyector(cam);
  let html: React.ReactNode = null;
  if (cambio < 1) {
    const vm = L(t, EV.miedo - 0.2, EV.miedo + 0.3, 0, 0.96, salida) + 0.02 * Math.sin(t * 30);
    const vc = L(t, EV.codicia - 0.2, EV.codicia + 1.4, 0, 0.42, (u) => u);
    const g = muelle(t, s + 0.05, 170, 15) * (1 - cambio);
    reloj(tr, [-0.45, -0.1, 0], 0.36, vm, g);
    reloj(tr, [0.45, -0.1, 0], 0.36, vc, g);
    const a = pr([-0.45, -0.2, 0]);
    const b = pr([0.45, -0.2, 0]);
    html = (
      <div style={{ opacity: 1 - cambio }}>
        <div style={{ position: "absolute", left: a.x, top: a.y + 30, transform: "translateX(-50%)", ...mono(34) }}>MIEDO</div>
        <div style={{ position: "absolute", left: b.x, top: b.y + 30, transform: "translateX(-50%)", ...mono(34, 0.7) }}>CODICIA</div>
      </div>
    );
  }
  if (cambio > 0) {
    grafico(tr, 100, cambio, 100);
    // Ventas en pánico amontonadas cerca del mínimo
    const ventas = L(t, EV.ascensor2, EV.peor, 0, 1, (u) => u);
    for (let i = 0; i < 34; i++) {
      if (ruido(i * 3.1) > ventas) continue;
      const d = 74 + Math.round(12 * ruido(i * 7.3));
      tr.push({ t: "e", c: [XD(d, 100) + 0.02 * (ruido(i * 1.7) - 0.5), YS(SP[d - 1]) + 0.05 + 0.18 * ruido(i * 5.9), 0.05], r: 0.016, tipo: "aro", o: 0.9 * cambio });
    }
  }
  const qmin = pr([XD(83, 100), YS(2237), 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {html}
      <Etiqueta t={t} t0={EV.peor - 0.1} x={qmin.x} y={qmin.y + 44} size={32} alinea="centro">
        VENDEN AQUÍ
      </Etiqueta>
      <Destello t={t} t0={EV.peor - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.ascensor2 - 0.45} texto="el *miedo* corre más" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.ascensor2 - 0.4} texto="venden en el *peor*" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Plan: escríbelo antes de la caída
const Plan: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 4.4, 4.1), L(t, s, e, -0.3, 0.1), L(t, s, e, 0.25, 0.3), { apertura: 35, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.3)];
  const g = Math.min(muelle(t, s + 0.05, 160, 15), 1.05);
  const hoja: V3[] = [[-0.5 * g, -0.6 * g, 0], [0.5 * g, -0.6 * g, 0], [0.5 * g, 0.55 * g, 0], [-0.5 * g, 0.55 * g, 0], [-0.5 * g, -0.6 * g, 0]];
  tr.push({ t: "p", pts: hoja, w: 2, o: 1, relleno: "#fff", oRelleno: 0.05, luz: 0.2 });
  const lineas = ["MI PLAN", "1 · CUÁNTO ARRIESGO", "2 · DÓNDE SALGO", "3 · QUÉ HAGO SI CAE"];
  const k = golpe(t, EV.escribe - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 640, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        {lineas.map((l, i) => (
          <Teclea key={l} t={t} t0={s + 0.3 + i * 0.7} texto={l} size={i ? 36 : 48} o={i ? 0.9 : 1} cps={32} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 1240, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, EV.escribe - 0.3, EV.escribe, 0, 1), transform: `scale(${1 + 0.2 * k})`, ...mono(40) }}>
        ESCRITO ANTES DE LA CAÍDA
      </div>
      <Destello t={t} t0={EV.escribe - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} texto="escríbelo *antes*" size={112} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta al final
const Pregunta: React.FC<P> = (p) => <PreguntaComentarios {...p} lineas={["¿vender rápido", "o *aguantar*?"]} kicker="CUÉNTAMELO" size={96} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, caida: Caida, sigueme: Sigueme, recupera: Recupera, miedo: Miedo, plan: Plan, pregunta: Pregunta };
export const CLAVES = claves(["escalera", "ascensor", "2020", "máximos", "34%", "historia", "sígueme", "cinco", "cuatro", "miedo", "codicia", "peor", "plan", "escribe", "aguantar"]);

export const Ascensor: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/ascensor_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
