// Reel de alcance "¿Compras más cuando el precio baja para promediar?" (~36 s): un precio que cae de 100 a 80 con dos
// compras y la línea del precio medio en 90; el rebote a 90 que lo deja a cero (+12,5 % en vez de +25 %); la caída a 50
// que convierte −50 € en −80 €; y un cubo contra dos: el riesgo duplicado. Tiempos en src/gen/promediar.json
// (scripts/promediar.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/promediar.json";
import { salida } from "../Premium/ui";
import { Arriba, Etiqueta, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { Abajo, claves, CtaSeguir, Destello, golpe, Kicker, Montaje, P, sacude } from "../Explica/Montaje";

export const PROMEDIAR_FPS = datos.fps;
export const PROMEDIAR_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// Precio: de 100 a 80 (0-30); luego rebota a 90 (30-40) o cae a 50 (30-60)
const BAJA = Array.from({ length: 31 }, (_, i) => 100 - 20 * (i / 30) + 3 * Math.sin((Math.PI * i) / 30) * Math.sin(i * 1.3));
const REBOTE = Array.from({ length: 11 }, (_, i) => 80 + i + 1.2 * Math.sin((Math.PI * i) / 10) * Math.sin(i * 1.7));
const CAIDA = Array.from({ length: 31 }, (_, i) => 80 - i + 2.5 * Math.sin((Math.PI * i) / 30) * Math.sin(i * 1.2));
const X = (i: number) => -0.85 + (1.7 * i) / 60;
const Y = (p: number) => -0.55 + ((p - 45) / 60) * 1.2;
const tramo = (serie: number[], i0: number, hasta = 1): V3[] => {
  const n = Math.max(1, Math.round((serie.length - 1) * hasta));
  return serie.slice(0, n + 1).map((p, k) => [X(i0 + k), Y(p), 0]);
};
const cubo = (tr: Trazo[], c: V3, lado: number, o = 1, luz = 0.5, dash?: string) => {
  const r = lado / 2;
  for (const [a, b] of caja([c[0] - r, c[1] - r, c[2] - r], [c[0] + r, c[1] + r, c[2] + r])) tr.push({ t: "l", a, b, w: 1.8, o, luz, dash });
};
const camara = (t: number, s: number, e: number, t0 = -1, a0 = -0.25, a1 = -0.05) =>
  orbita([0, 0, 0], L(t, s, e, 6.2, 5.9), L(t, s, e, a0, a1) + sacude(t, t0), L(t, s, e, 0.1, 0.16), { apertura: 35, centroY: 960 });
// La media en 90, que se dibuja de izquierda a derecha
const media = (tr: Trazo[], prog: number) => {
  if (prog > 0) tr.push({ t: "p", pts: [[-1.0, Y(90), 0], [1.0, Y(90), 0]], w: 1.4, o: 0.8, dash: "6 6", prog });
};

// ------------------------------------------------------------------ 1. Hook: el precio cae… ¿compras más?
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = camara(t, s, e);
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "p", pts: tramo(BAJA, 0, L(t, -0.5, EV.baja + 0.3, 0.4, 1, (u) => u)), w: 2.4, o: 1, luz: 0.4 });
  const g = muelle(t, EV.mira - 0.3, 200, 14);
  if (g > 0) cubo(tr, [X(30), Y(80), 0], 0.1 * Math.min(g, 1.1), 1, 0.6, "4 4");
  const pr = proyector(cam);
  const q = pr([X(30), Y(80), 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.mira - 0.2} x={q.x} y={q.y + 70} size={40} alinea="centro">
        ¿+1?
      </Etiqueta>
      <Kicker t={t} t0={-0.5} texto="PROMEDIAR A LA BAJA" />
      <Arriba>
        <Titular t={t} t0={-0.6} texto="¿compras más si *baja*?" size={88} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Cuenta: compras a 100 y a 80; precio medio 90
const Cuenta: React.FC<P> = ({ t, s, e }) => {
  const cam = camara(t, s, e, -1, -0.05, 0.12);
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "p", pts: tramo(BAJA, 0, L(t, EV.cien - 0.1, EV.ochenta, 0, 1, (u) => u)), w: 2.4, o: 1, luz: 0.4 });
  const c1 = muelle(t, EV.cien - 0.15, 220, 14);
  const c2 = muelle(t, EV.vuelves - 0.1, 220, 14);
  if (c1 > 0) cubo(tr, [X(0), Y(100), 0], 0.1 * Math.min(c1, 1.1));
  if (c2 > 0) cubo(tr, [X(30), Y(80), 0], 0.1 * Math.min(c2, 1.1));
  media(tr, L(t, EV.medio - 0.2, EV.noventa, 0, 1, salida));
  const pr = proyector(cam);
  const q1 = pr([X(0), Y(100), 0]);
  const q2 = pr([X(30), Y(80), 0]);
  const qm = pr([1.0, Y(90), 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.cien - 0.1} x={q1.x - 20} y={q1.y - 60} size={34}>
        COMPRA · 100
      </Etiqueta>
      <Etiqueta t={t} t0={EV.vuelves - 0.05} x={q2.x} y={q2.y + 70} size={34} alinea="centro">
        COMPRA · 80
      </Etiqueta>
      <Etiqueta t={t} t0={EV.noventa - 0.15} x={Math.min(qm.x, 1040)} y={qm.y - 34} size={34} alinea="der">
        MEDIO 90
      </Etiqueta>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.medio - 0.35} texto="*100* y luego *80*" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.medio - 0.3} texto="precio medio: *90*" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Magia: rebota a 90 y ya no pierdes (+12,5 % en vez de +25 %)
const Magia: React.FC<P> = ({ t, s, e }) => {
  const cam = camara(t, s, e, -1, 0.12, 0.3);
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "p", pts: tramo(BAJA, 0), w: 2.4, o: 0.7, luz: 0.2 });
  tr.push({ t: "p", pts: tramo(REBOTE, 30, L(t, EV.suba - 0.2, EV.pierdes, 0, 1, (u) => u)), w: 2.8, o: 1, luz: 0.6 });
  cubo(tr, [X(0), Y(100), 0], 0.1, 0.7, 0.2);
  cubo(tr, [X(30), Y(80), 0], 0.1, 0.7, 0.2);
  media(tr, 1);
  const b1 = muelle(t, EV.doce - 0.15, 200, 15);
  const b2 = muelle(t, EV.veinticinco - 0.15, 200, 15);
  const xb = X(40) + 0.08;
  if (b1 > 0) tr.push({ t: "p", pts: [[xb - 0.04, Y(80), 0], [xb, Y(80), 0], [xb, Y(90), 0], [xb - 0.04, Y(90), 0]], w: 2, o: 1, luz: 0.6, prog: Math.min(b1, 1) });
  if (b2 > 0) tr.push({ t: "p", pts: [[xb + 0.22, Y(80), 0], [xb + 0.26, Y(80), 0], [xb + 0.26, Y(100), 0], [xb + 0.22, Y(100), 0]], w: 1.4, o: 0.7, dash: "4 4", prog: Math.min(b2, 1) });
  const pr = proyector(cam);
  const q1 = pr([xb, Y(80), 0]);
  const q2 = pr([xb + 0.26, Y(100), 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.doce - 0.1} x={q1.x} y={q1.y + 44} size={40} alinea="centro">
        +12,5 %
      </Etiqueta>
      <Etiqueta t={t} t0={EV.veinticinco - 0.1} x={Math.min(q2.x, 960)} y={q2.y - 36} size={34} o={0.7} alinea="centro">
        +25 %
      </Etiqueta>
      <Abajo top={1250} o={L(t, EV.pierdes - 0.3, EV.pierdes, 0, 1, salida)}>
        <span style={mono(26, 0.6)}>RESULTADO</span>
        <span style={mono(80)}>0 €</span>
      </Abajo>
      <Destello t={t} t0={EV.magia - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.doce - 0.35} texto="sube a *90*: cero" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.doce - 0.3} fin={EV.magia - 0.35} texto="*12,5 %* y no *25 %*" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.magia - 0.3} texto="parece *magia*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Caída: sigue hasta 50 y pierdes 80 en vez de 50
const Caida: React.FC<P> = ({ t, s, e }) => {
  const cam = camara(t, s, e, EV.ochenta2 - 0.1, -0.1, 0.1);
  const tr: Trazo[] = [...polvo(0.3)];
  const prog = L(t, EV.cayendo - 0.3, EV.cincuenta + 0.5, 0, 1, (u) => u);
  tr.push({ t: "p", pts: tramo(BAJA, 0), w: 2.4, o: 0.8, luz: 0.3 });
  tr.push({ t: "p", pts: tramo(CAIDA, 30, prog), w: 2.8, o: 1, luz: 0.6 });
  const k = golpe(t, EV.ochenta2 - 0.1);
  cubo(tr, [X(0), Y(100), 0], 0.1, 1, 0.3 + 0.6 * k);
  cubo(tr, [X(30), Y(80), 0], 0.1, 1, 0.3 + 0.6 * k);
  media(tr, 1);
  const precio = prog <= 0 ? 80 : CAIDA[Math.round(30 * prog)];
  const una = Math.round(precio - 100);
  const dos = Math.round(2 * precio - 180);
  const tacha = L(t, EV.ochenta2 - 0.2, EV.ochenta2 + 0.2, 0, 1, salida);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 1150, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "baseline", opacity: 1 - 0.5 * tacha }}>
          <span style={mono(24, 0.6)}>CON 1 COMPRA</span>
          <span style={{ position: "relative", ...mono(52) }}>
            {`−${Math.abs(una)} €`}
            <span style={{ position: "absolute", left: -8, top: "52%", height: 5, width: `calc(${tacha * 100}% + ${tacha * 16}px)`, background: "#fff" }} />
          </span>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "baseline", opacity: L(t, EV.cincuenta, EV.cincuenta + 0.4, 0, 1, salida) }}>
          <span style={mono(24, 0.6)}>CON 2 COMPRAS</span>
          <span style={{ ...mono(92), display: "inline-block", transform: `scale(${1 + 0.3 * k})` }}>{`−${Math.abs(dos)} €`}</span>
        </div>
      </div>
      <Destello t={t} t0={EV.ochenta2 - 0.1} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.ochenta2 - 0.4} texto="si sigue *cayendo*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.ochenta2 - 0.35} texto="pierdes *80 €*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: no reduce el riesgo, lo duplica; decide antes de entrar
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 6.4, 6.0), L(t, s, e, -0.3, 0.1) + sacude(t, EV.duplica - 0.05), L(t, s, e, 0.25, 0.3), { apertura: 35, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.3)];
  const g = muelle(t, s + 0.05, 180, 15);
  const d = muelle(t, EV.duplica - 0.2, 200, 13);
  const L1 = 0.42;
  cubo(tr, [-0.5, -0.5 + L1 / 2, 0], L1 * Math.min(g, 1.05), 1, 0.2);
  cubo(tr, [0.5, -0.5 + L1 / 2, 0], L1 * Math.min(g, 1.05), 1, 0.2 + 0.5 * Math.max(Math.min(d, 1), 0));
  if (d > 0) cubo(tr, [0.5, -0.5 + L1 * 1.5 + (1 - Math.min(d, 1)) * 0.8, 0], L1 * Math.min(d, 1.05), 1, 0.7);
  const pr = proyector(cam);
  const b1 = pr([-0.5, -0.5, 0.21]);
  const b2 = pr([0.5, -0.5, 0.21]);
  const top2 = pr([0.5, -0.5 + 2 * L1, 0]);
  const pasos = L(t, EV.decide - 0.2, EV.decide + 0.2, 0, 1, salida);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: b1.x, top: b1.y + 24, transform: "translateX(-50%)", opacity: Math.min(g * 1.5, 1), ...mono(28, 0.8) }}>1 COMPRA</div>
      <div style={{ position: "absolute", left: b2.x, top: b2.y + 24, transform: "translateX(-50%)", opacity: Math.min(g * 1.5, 1), ...mono(28, 0.8) }}>2 COMPRAS</div>
      <Etiqueta t={t} t0={EV.duplica - 0.1} x={top2.x} y={top2.y - 60} size={64} alinea="centro">
        ×2
      </Etiqueta>
      <div style={{ position: "absolute", top: 1180, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: pasos }}>
        <span style={mono(26, 0.6)}>ANTES DE ENTRAR</span>
        <span style={mono(40)}>CUÁNTO METES · DÓNDE SALES</span>
      </div>
      <Destello t={t} t0={EV.duplica - 0.05} o={0.18} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.duplica - 0.4} texto="¿menos *riesgo*?" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.duplica - 0.35} fin={EV.decide - 0.35} texto="el *doble*" size={120} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.decide - 0.3} texto="decide *antes*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. CTA
const Cta: React.FC<P> = (p) => <CtaSeguir {...p} lema="MÁS CUENTAS QUE NADIE TE HACE" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, cuenta: Cuenta, magia: Magia, caida: Caida, giro: Giro, cta: Cta };
export const CLAVES = claves(["baja", "promediar", "100", "80", "90", "12,5%", "25", "magia", "50", "riesgo", "duplica", "peor", "antes", "sígueme"]);

export const Promediar: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/promediar_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
