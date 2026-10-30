// Reel de alcance "Aciertas 9 de cada 10 operaciones y pierdes dinero" (~16 s): nueve cubos de +10 € y uno de −100 €
// que cae a plomo y se lo come todo, la balanza de una sola pérdida y CTA. Tiempos en src/gen/nueve.json (scripts/nueve.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/nueve.json";
import { ruido } from "../Viral/util";
import { Arriba, Etiqueta, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { Abajo, claves, CtaSeguir, Destello, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const NUEVE_FPS = datos.fps;
export const NUEVE_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const euros = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(Math.round(v))} €`;
const cubo = (tr: Trazo[], c: V3, lado: number, o: number, dash?: string, luz = 0) => {
  const r = lado / 2;
  for (const [a, b] of caja([c[0] - r, c[1] - r, c[2] - r], [c[0] + r, c[1] + r, c[2] + r])) tr.push({ t: "l", a, b, w: 1.6, o, dash, luz });
};

// ------------------------------------------------------------------ 1. Hook: 9 ✓ y 1 ✕… y el saldo en negativo
const XH = (k: number) => -0.95 + k * 0.2;
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.1, 0], L(t, s, e, 6.4, 6.0), L(t, s, e, -0.3, -0.12) + sacude(t, EV.dinero), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.3)];
  const crece = muelle(t, EV.dinero - 0.1, 160, 11);
  const apar = (k: number) => muelle(t, -0.6 + k * 0.08, 220, 14);
  for (let k = 0; k < 9; k++) if (apar(k) > 0) cubo(tr, [XH(k), 0, 0], 0.14 * Math.min(apar(k), 1.1), 1, undefined, 0.25);
  const g10 = muelle(t, EV.pierdes - 0.2, 200, 13);
  if (g10 > 0) cubo(tr, [XH(9) - 0.12 * crece, 0.2 * crece, 0], 0.14 * Math.min(g10, 1.1) * (1 + 2.2 * crece), 1, "5 6", 0.5 * crece);
  const pr = proyector(cam);
  const vistos = Array.from({ length: 9 }, (_, k) => apar(k) > 0.5).filter(Boolean).length;
  const saldo = t >= EV.dinero - 0.05 ? -10 : 10 * vistos;
  const k = golpe(t, EV.dinero - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {Array.from({ length: 10 }, (_, i) => {
        const q = pr([XH(i), 0.16, 0]);
        const o = i < 9 ? Math.min(apar(i) * 1.5, 1) : Math.min(g10 * 1.5, 1) * (1 - crece);
        return (
          <div key={i} style={{ position: "absolute", left: q.x, top: q.y - 50, transform: "translateX(-50%)", opacity: o, ...mono(36) }}>
            {i < 9 ? "✓" : "✕"}
          </div>
        );
      })}
      <Abajo top={1180}>
        <span style={mono(26, 0.6)}>SALDO</span>
        <span style={{ ...mono(110), display: "inline-block", transform: `scale(${1 + 0.25 * k})` }}>{euros(saldo)}</span>
      </Abajo>
      <Destello t={t} t0={EV.dinero - 0.05} />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.pierdes - 0.35} texto="aciertas *9 de 10*" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.pierdes - 0.3} texto="y *pierdes* dinero" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Cuenta: +10 € nueve veces; cae un −100 € y se lo come todo
const LADO = 0.14;
const Cuenta: React.FC<P> = ({ t, s, e }) => {
  const cae = L(t, EV.cien - 0.45, EV.cien, 0, 1, (u) => u * u);
  const cam = orbita([0, 0.7, 0], L(t, s, e, 7.4, 7.0), L(t, s, e, 0.3, 0.08) + sacude(t, EV.cien), L(t, s, e, 0.16, 0.22) + sacude(t, EV.cien, 0.02), { apertura: 35, centroY: 920 });
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "l", a: [-1.2, 0, 0], b: [1.2, 0, 0], w: 1.4, o: 0.6 });
  const t1 = EV.noventa - 0.2;
  const salen = Math.max(0, t - EV.cien);
  for (let k = 0; k < 9; k++) {
    const t0 = EV.ganas + 0.1 + (k * (t1 - EV.ganas - 0.1)) / 8;
    const g = muelle(t, t0, 220, 14);
    if (g <= 0) continue;
    // Tras el impacto, los cubos de ganancia salen despedidos
    const dx = (ruido(k * 3.7) - 0.5) * 3 * salen;
    const dy = (1.6 * ruido(k * 5.1) + 0.4) * salen - 4 * salen * salen;
    const o = Math.max(0, 1 - salen * 1.6);
    if (o <= 0) continue;
    cubo(tr, [-0.55 + dx, LADO / 2 + k * LADO + dy, 0], LADO * Math.min(g, 1.1), o, undefined, 0.2);
  }
  // El bloque de −100 €: diez veces más alto, cae a plomo
  if (cae > 0) {
    const y0 = 4 * (1 - cae);
    for (const [a, b] of caja([0.25, y0, -0.25], [0.85, y0 + 10 * LADO, 0.25])) tr.push({ t: "l", a, b, w: 2.2, o: 1, luz: 0.5 });
  }
  const pr = proyector(cam);
  const qCol = pr([-0.55, 9 * LADO + 0.2, 0]);
  const qBlo = pr([0.55, 10 * LADO * 0.5 + 4 * (1 - cae), 0.25]);
  const k = golpe(t, EV.menos - 0.05);
  const total = t < EV.cien ? 10 * Math.min(9, Math.floor(Math.max(0, (t - EV.ganas - 0.1) / Math.max((t1 - EV.ganas - 0.1) / 8, 0.01))) + 1) : t < EV.menos - 0.05 ? 90 - 100 * Math.min((t - EV.cien) / 0.6, 1) : -10;
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.noventa - 0.1} x={qCol.x} y={qCol.y - 20} size={44} o={t < EV.cien ? 1 : 0} alinea="centro">
        +90 €
      </Etiqueta>
      {cae > 0 && <div style={{ position: "absolute", left: qBlo.x, top: qBlo.y, transform: "translate(-50%, -50%)", ...mono(52) }}>−100 €</div>}
      <Abajo top={1290}>
        <span style={mono(26, 0.6)}>TOTAL</span>
        <span style={{ ...mono(88), display: "inline-block", transform: `scale(${1 + 0.3 * k})` }}>{euros(Math.max(total, -10))}</span>
      </Abajo>
      <Destello t={t} t0={EV.cien} o={0.3} />
      <Destello t={t} t0={EV.menos - 0.05} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.pierdes2 - 0.3} texto="*+10 €* nueve veces" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.pierdes2 - 0.25} fin={EV.total - 0.3} texto="*−100 €* una vez" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.total - 0.25} texto="total: *−10 €*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Giro: una sola pérdida pesa más que nueve aciertos
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 7.0, 6.5), L(t, s, e, 0.3, -0.15) + sacude(t, EV.todo), L(t, s, e, 0.14, 0.24), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  const th = -0.28 * muelle(t, EV.sola - 0.2, 90, 8);
  const pivote: V3 = [0, 0.55, 0];
  const brazo = (lado: number): V3 => [lado * 0.85 * Math.cos(th), pivote[1] + lado * 0.85 * Math.sin(th), 0];
  const k = muelle(t, s + 0.1, 150, 16);
  tr.push({ t: "l", a: [0, -1.2, 0], b: [0, -1.2 + 1.75 * k, 0], w: 2, o: 0.9 });
  if (k > 0.6) {
    tr.push({ t: "l", a: brazo(-1), b: brazo(1), w: 2.4, o: 1 });
    for (const lado of [-1, 1]) {
      const ext = brazo(lado);
      const plato: V3 = [ext[0], ext[1] - 0.7, 0];
      tr.push({ t: "l", a: ext, b: [plato[0] - 0.25, plato[1], 0], w: 1, o: 0.6 });
      tr.push({ t: "l", a: ext, b: [plato[0] + 0.25, plato[1], 0], w: 1, o: 0.6 });
      tr.push({ t: "p", pts: circulo(plato, 0.3, "y", 40), w: 1.6, o: 1 });
      if (lado < 0) for (let i = 0; i < 9; i++) cubo(tr, [plato[0] - 0.16 + (i % 3) * 0.16, plato[1] + 0.05 + Math.floor(i / 3) * 0.1, 0], 0.08, 0.9);
      else cubo(tr, [plato[0], plato[1] + 0.22, 0], 0.42, 1, undefined, 0.4);
    }
  }
  const pr = proyector(cam);
  const q = (lado: number) => pr([brazo(lado)[0], brazo(lado)[1] - 0.95, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {k > 0.6 && (
        <>
          <Etiqueta t={t} t0={s + 0.4} x={q(-1).x} y={q(-1).y} size={28} o={0.8} alinea="centro">
            9 ACIERTOS
          </Etiqueta>
          <Etiqueta t={t} t0={s + 0.5} x={q(1).x} y={q(1).y} size={28} alinea="centro">
            1 PÉRDIDA
          </Etiqueta>
        </>
      )}
      <Destello t={t} t0={EV.todo} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.sola - 0.3} texto="da igual cuánto *aciertes*" size={84} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.sola - 0.25} texto="una sola *pérdida*" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. CTA
const Cta: React.FC<P> = (p) => <CtaSeguir {...p} lema="MÁS CUENTAS QUE NADIE TE HACE" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, cuenta: Cuenta, giro: Giro, cta: Cta };
export const CLAVES = claves(["9", "pierdes", "dinero", "90", "100", "menos", "10", "aciertes", "sola", "pérdida", "todo", "sígueme"]);

export const Nueve: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/nueve_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
