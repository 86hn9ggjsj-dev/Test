// Reel de alcance "Ganas un 50 % y pierdes un 50 %: ¿estás igual?" (~23 s): cifras gigantes desde el primer fotograma,
// la barra de 100 € que sube a 150 y baja a 75, por qué la caída pesa más en euros y CTA de seguir.
// Tiempos en src/gen/ganapierde.json (scripts/ganapierde.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/ganapierde.json";
import { Arriba, Etiqueta, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, Escena, orbita, polvo, proyector, Trazo } from "../Bot/tres";
import { Abajo, claves, CtaSeguir, Gigante, Montaje, P } from "../Explica/Montaje";

export const GANAPIERDE_FPS = datos.fps;
export const GANAPIERDE_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const fondo = (t: number, s: number, e: number) => <Escena cam={orbita([0, 0, 0], 9, L(t, s, e, -0.2, 0.2), 0.2, { apertura: 40 })} trazos={polvo(0.35)} />;

// ------------------------------------------------------------------ 1. Hook: +50 %, −50 %… ¿= 0 %?
const Hook: React.FC<P> = ({ t, s, e }) => (
  <>
    {fondo(t, s, e)}
    <Gigante t={t} t0={-0.45} texto="+50 %" top={540} size={200} />
    <Gigante t={t} t0={EV.pierdes - 0.1} texto="−50 %" top={790} size={200} />
    <Gigante t={t} t0={EV.igual - 0.4} texto="= ¿0 %?" top={1040} size={130} />
    <Arriba>
      <Titular t={t} t0={-0.6} texto="¿te quedas *igual*?" size={100} />
    </Arriba>
  </>
);

// ------------------------------------------------------------------ 2. Giro: no, has perdido un 25 %
const Giro: React.FC<P> = ({ t, s, e }) => (
  <>
    {fondo(t, s, e)}
    <Gigante t={t} t0={s + 0.05} fin={EV.veinticinco - 0.15} texto="0 %" top={640} size={200} tacha={EV.no + 0.2} />
    <Gigante t={t} t0={EV.veinticinco - 0.1} texto="−25 %" top={640} size={250} pie="HAS PERDIDO" />
    <Arriba>
      <Titular t={t} t0={s + 0.05} texto="*no*" size={150} />
    </Arriba>
  </>
);

// ------------------------------------------------------------------ 3. Cuenta: 100 € → 150 € → 75 €
const Cuenta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.75, 0], L(t, s, e, 7.2, 6.6), L(t, s, e, -0.32, -0.1), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  const sube = muelle(t, EV.ciento50 - 0.45, 120, 13);
  const baja = muelle(t, EV.setenta5 - 0.45, 120, 13);
  const h = 1 + 0.5 * sube - 0.75 * baja;
  tr.push({ t: "l", a: [-1.0, 0, 0], b: [1.0, 0, 0], w: 1.4, o: 0.6 });
  tr.push({ t: "l", a: [-1.0, 1, 0], b: [1.0, 1, 0], w: 1.4, o: 0.7, dash: "6 8" });
  for (const [a, b] of caja([-0.3, 0, -0.3], [0.3, Math.max(h, 0.01), 0.3])) tr.push({ t: "l", a, b, w: 1.8, o: 1, luz: 0.25 });
  // Lo que falta para volver a 100 €
  if (baja > 0.3) for (let r = 0; r < 9; r++) tr.push({ t: "l", a: [-0.3 + r * 0.075, h, 0.3], b: [-0.3 + r * 0.075 + 0.08, 1, 0.3], w: 1, o: 0.45 });
  const pr = proyector(cam);
  const cima = pr([0, h, 0]);
  const cien = pr([1.0, 1, 0]);
  const valor = Math.round(100 * h);
  const paso = t < EV.ciento50 - 0.45 ? "" : t < EV.setenta5 - 0.45 ? "+50 %" : "−50 %";
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: cima.x, top: cima.y - 120, transform: "translateX(-50%)", display: "flex", gap: 24, alignItems: "baseline" }}>
        <span style={mono(90)}>{`${valor} €`}</span>
        <span style={mono(40, 0.7)}>{paso}</span>
      </div>
      <Etiqueta t={t} t0={s + 0.3} x={Math.min(cien.x, 1030)} y={cien.y - 26} size={26} o={0.75} alinea="der">
        EMPEZASTE CON 100 €
      </Etiqueta>
      <Arriba>
        <Titular t={t} t0={s + 0.1} texto="100 → 150 → *75*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Lección: mismo porcentaje, más euros en la caída
const Leccion: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.35, 0], L(t, s, e, 7.8, 7.4), L(t, s, e, 0.3, 0.1), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.3)];
  const up = muelle(t, s + 0.2, 150, 14);
  const down = muelle(t, EV.caidas - 0.2, 150, 13);
  tr.push({ t: "l", a: [-1.1, 0, 0], b: [1.1, 0, 0], w: 1.4, o: 0.6, dash: "6 8" });
  for (const [a, b] of caja([-0.65, 0, -0.22], [-0.25, Math.max(0.5 * up, 0.01), 0.22])) tr.push({ t: "l", a, b, w: 1.6, o: 0.7 });
  for (const [a, b] of caja([0.25, -Math.max(0.75 * down, 0.01), -0.22], [0.65, 0, 0.22])) tr.push({ t: "l", a, b, w: 2, o: 1, luz: 0.4 });
  const pr = proyector(cam);
  const qU = pr([-0.45, 0.5, 0]);
  const qD = pr([0.45, -0.75, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qU.x, top: qU.y - 112, transform: "translateX(-50%)", textAlign: "center", opacity: Math.min(up * 1.5, 1) }}>
        <div style={mono(24, 0.6)}>+50 % DE 100 €</div>
        <div style={mono(76, 0.8)}>+50 €</div>
      </div>
      <div style={{ position: "absolute", left: qD.x, top: qD.y + 20, transform: "translateX(-50%)", textAlign: "center", opacity: Math.min(down * 1.5, 1) }}>
        <div style={mono(76)}>−75 €</div>
        <div style={mono(24, 0.6)}>−50 % DE 150 €</div>
      </div>
      <Abajo top={1310} o={Math.min(muelle(t, EV.subidas, 200, 15) * 1.5, 1)}>
        <span style={mono(40)}>MISMO %, MÁS EUROS</span>
      </Abajo>
      <Arriba>
        <Titular t={t} t0={s + 0.1} texto="las caídas *pesan más*" size={88} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. CTA
const Cta: React.FC<P> = (p) => <CtaSeguir {...p} lema="MÁS CUENTAS QUE NADIE TE HACE" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, giro: Giro, cuenta: Cuenta, leccion: Leccion, cta: Cta };
export const CLAVES = claves(["50%", "igual", "25%", "150", "75", "caídas", "subidas", "sígueme"]);

export const Ganapierde: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/ganapierde_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
