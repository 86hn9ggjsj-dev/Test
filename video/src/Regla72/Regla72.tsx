// Reel de alcance "¿Cuántos años tardas en duplicar tu dinero?" (~20 s): la regla del 72. Reloj de años con ×2, el 72
// que cae de golpe, dos líneas de tiempo (10 % → 7 años, 2 % → 36) y un billete de 100 € que la inflación deja en 50 €.
// Tiempos en src/gen/regla72.json (scripts/regla72.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/regla72.json";
import { salida } from "../Premium/ui";
import { ANCHO, ruido } from "../Viral/util";
import { Arriba, Etiqueta, L, mono, muelle, Titular } from "../Bot/piezas";
import { circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { Abajo, claves, CtaSeguir, Destello, Gigante, golpe, Kicker, Montaje, P, sacude } from "../Explica/Montaje";

export const REGLA72_FPS = datos.fps;
export const REGLA72_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// ------------------------------------------------------------------ 1. Hook: ×2 dentro de un reloj de años que gira
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.15, 0], L(t, s, e, 7.0, 6.4), L(t, s, e, -0.25, 0.1), L(t, s, e, 0.1, 0.16), { apertura: 35, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.3)];
  const c: V3 = [0, 0.15, 0];
  const g = muelle(t, -0.5, 140, 15);
  tr.push({ t: "p", pts: circulo(c, 1.0 * Math.min(g, 1.05), "z", 90), w: 2, o: 0.9, luz: 0.2 });
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    tr.push({ t: "l", a: [Math.cos(a) * 0.88, 0.15 + Math.sin(a) * 0.88, 0], b: [Math.cos(a) * 1.0, 0.15 + Math.sin(a) * 1.0, 0], w: k % 3 ? 1.2 : 2.4, o: 0.8 * Math.min(g, 1) });
  }
  const ang = Math.PI / 2 - t * 7;
  tr.push({ t: "l", a: c, b: [Math.cos(ang) * 0.8, 0.15 + Math.sin(ang) * 0.8, 0], w: 2.4, o: 1, luz: 0.5 });
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Gigante t={t} t0={-0.45} texto="×2" top={520} size={150} />
      <div style={{ position: "absolute", top: 1240, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, EV.segundos - 0.3, EV.segundos, 0, 1, salida) }}>
        <span style={mono(40)}>UNA CUENTA DE 3 SEGUNDOS</span>
      </div>
      <Arriba>
        <Titular t={t} t0={-0.6} texto="¿cuándo se *duplica*?" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Regla: 72 ÷ lo que ganas al año
const Regla: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.2, 0.2) + sacude(t, EV.setentaydos - 0.1), 0.2, { apertura: 40 });
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <Gigante t={t} t0={EV.setentaydos - 0.15} texto="72" top={560} size={320} />
      <div style={{ position: "absolute", top: 960, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, EV.ano - 0.4, EV.ano - 0.1, 0, 1, salida) }}>
        <span style={mono(76)}>÷ % AL AÑO</span>
      </div>
      <Destello t={t} t0={EV.setentaydos - 0.1} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} texto="la regla del *72*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Ejemplo: 10 % → 7 años; 2 % → 36
const XA = (anios: number) => -0.95 + (1.95 * anios) / 40;
const Ejemplo: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.05, 0, 0], L(t, s, e, 7.0, 6.6), L(t, s, e, -0.25, -0.08) + sacude(t, EV.treintayseis), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 920 });
  const tr: Trazo[] = [...polvo(0.3)];
  const raiz = L(t, s + 0.1, s + 0.6, 0, 1, salida);
  for (const y of [0.4, -0.4]) {
    tr.push({ t: "p", pts: [[XA(0), y, 0], [XA(40), y, 0]], w: 1.4, o: 0.6, prog: raiz });
    for (let a = 0; a <= 40; a += 5) tr.push({ t: "l", a: [XA(a), y - 0.05, 0], b: [XA(a), y + 0.05, 0], w: a % 10 ? 1 : 1.6, o: 0.6 * raiz });
  }
  const a1 = L(t, EV.diez - 0.1, EV.siete, 0, 7.2, salida);
  const a2 = L(t, EV.dos - 0.1, EV.treintayseis, 0, 36, (u) => u);
  if (t >= EV.diez - 0.1) {
    tr.push({ t: "p", pts: [[XA(0), 0.4, 0], [XA(a1), 0.4, 0]], w: 3, o: 1, luz: 0.5 });
    tr.push({ t: "e", c: [XA(a1), 0.4, 0], r: 0.05, tipo: "punto", o: 1, luz: 1 });
  }
  if (t >= EV.dos - 0.1) {
    tr.push({ t: "p", pts: [[XA(0), -0.4, 0], [XA(a2), -0.4, 0]], w: 3, o: 1, luz: 0.5 });
    tr.push({ t: "e", c: [XA(a2), -0.4, 0], r: 0.05, tipo: "punto", o: 1, luz: 1 });
  }
  const pr = proyector(cam);
  const q1 = pr([XA(a1), 0.4, 0]);
  const q2 = pr([XA(a2), -0.4, 0]);
  const ini1 = pr([XA(0), 0.4, 0]);
  const ini2 = pr([XA(0), -0.4, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {[0, 10, 20, 30, 40].map((a) => {
        const q = pr([XA(a), -0.4, 0]);
        return (
          <div key={a} style={{ position: "absolute", left: q.x, top: q.y + 24, transform: "translateX(-50%)", opacity: raiz, ...mono(22, 0.55) }}>
            {a}
          </div>
        );
      })}
      <Etiqueta t={t} t0={EV.diez - 0.1} x={ini1.x} y={ini1.y - 40} size={30}>
        10 %
      </Etiqueta>
      <Etiqueta t={t} t0={EV.dos - 0.1} x={ini2.x} y={ini2.y - 40} size={30}>
        2 % · DEPÓSITO
      </Etiqueta>
      {t >= EV.siete - 0.05 && <div style={{ position: "absolute", left: q1.x, top: q1.y - 92, transform: "translateX(-50%)", ...mono(44) }}>×2 · 7 AÑOS</div>}
      {t >= EV.treintayseis - 0.05 && <div style={{ position: "absolute", left: Math.min(q2.x, 830), top: q2.y + 56, transform: "translateX(-50%)", ...mono(44) }}>×2 · 36 AÑOS</div>}
      <Destello t={t} t0={EV.treintayseis - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.dos - 0.3} texto="10 % → *7 años*" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.dos - 0.25} texto="2 % → *36 años*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Giro: con un 3 % de inflación, 100 € parados valen 50 € en 24 años
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.1, 0], L(t, s, e, 6.8, 6.3), L(t, s, e, 0.28, 0.05) + sacude(t, EV.mitad), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 900 });
  const anios = L(t, EV.inflacion, EV.veinticuatro + 0.2, 0, 24, (u) => u);
  const valor = 100 / Math.pow(1.03, anios);
  const o = 0.35 + 0.65 * (valor - 50) / 50;
  const tr: Trazo[] = [...polvo(0.3)];
  const g = muelle(t, s + 0.1, 150, 15);
  const rect = (w: number, h: number, z = 0): V3[] => [[-w, -h + 0.1, z], [w, -h + 0.1, z], [w, h + 0.1, z], [-w, h + 0.1, z], [-w, -h + 0.1, z]];
  tr.push({ t: "p", pts: rect(1.0 * Math.min(g, 1.05), 0.5 * Math.min(g, 1.05)), w: 2.2, o, luz: 0.3 * o, dash: valor < 70 ? "10 6" : undefined });
  tr.push({ t: "p", pts: rect(0.88, 0.38), w: 1, o: 0.6 * o, dash: valor < 80 ? "4 6" : undefined });
  tr.push({ t: "p", pts: circulo([0.62, 0.1, 0], 0.16, "z", 30), w: 1.2, o: 0.6 * o });
  // Lo que se lleva la inflación sale volando como polvo
  const perdido = (100 - valor) / 50;
  for (let i = 0; i < 40; i++) {
    const vida = (t * 0.6 + ruido(i * 2.3)) % 1;
    if (ruido(i * 7.9) > perdido) continue;
    tr.push({ t: "e", c: [-1 + 2 * ruido(i * 3.1), 0.1 - 0.5 + ruido(i * 5.3) + vida * 1.4, 0.1], r: 0.012, tipo: "punto", o: 0.7 * (1 - vida) });
  }
  const pr = proyector(cam);
  const centro = pr([0, 0.1, 0]);
  const k = golpe(t, EV.mitad - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: centro.x, top: centro.y, transform: `translate(-50%, -50%) scale(${1 + 0.2 * k})`, opacity: Math.min(g * 1.5, 1), ...mono(130) }}>{`${Math.round(valor)} €`}</div>
      <Abajo top={1240} o={t >= EV.inflacion - 0.1 ? 1 : 0}>
        <span style={mono(56)}>{`AÑO ${Math.floor(anios)}`}</span>
        <span style={mono(26, 0.6)}>INFLACIÓN 3 %</span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="TU DINERO PARADO" />
      <Destello t={t} t0={EV.mitad - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.mitad - 0.35} texto="inflación del *3 %*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.mitad - 0.3} texto="pierde la *mitad*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. CTA
const Cta: React.FC<P> = (p) => <CtaSeguir {...p} lema="GUÁRDALO · MÁS CUENTAS QUE NADIE TE HACE" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, regla: Regla, ejemplo: Ejemplo, giro: Giro, cta: Cta };
export const CLAVES = claves(["duplicar", "72", "10%", "7", "2%", "36", "inflación", "mitad", "24", "guárdalo", "sígueme"]);

export const Regla72: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/regla72_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
