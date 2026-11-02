// Reel de alcance "¿Cuánto dinero necesitas para vivir del trading?" (~38 s): fajo de billetes de alambre, doce bloques de
// 2.000 € (24.000 € al año), la pregunta a los espectadores, la cuenta de 120.000 € que hace falta al 20 %, los 10.000 €
// que tendrían que dar un 240 % y el bloque pequeño que se rompe. Tiempos en src/gen/vivir.json (scripts/vivir.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/vivir.json";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { Arriba, Etiqueta, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { Abajo, claves, CtaSeguir, Destello, Gigante, golpe, Kicker, Montaje, P, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const VIVIR_FPS = datos.fps;
export const VIVIR_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

const bloque = (tr: Trazo[], min: V3, max: V3, o = 1, luz = 0.2, dash?: string) => {
  for (const [a, b] of caja(min, max)) tr.push({ t: "l", a, b, w: 1.8, o, luz, dash });
};

// ------------------------------------------------------------------ 1. Hook: un fajo de billetes que gira
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 5.4, 5.0), t * 0.5 - 0.4, L(t, s, e, 0.35, 0.42), { apertura: 35, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.3)];
  for (let i = 0; i < 8; i++) {
    const g = muelle(t, -0.6 + i * 0.07, 220, 14);
    if (g <= 0) continue;
    const y = -0.5 + i * 0.06 + (1 - Math.min(g, 1)) * 0.6;
    const r = (i * 0.37) % 0.2 - 0.1;
    const c = Math.cos(r);
    const sn = Math.sin(r);
    const p = (x: number, z: number): V3 => [x * c - z * sn, y, x * sn + z * c];
    tr.push({ t: "p", pts: [p(-0.7, -0.35), p(0.7, -0.35), p(0.7, 0.35), p(-0.7, 0.35), p(-0.7, -0.35)], w: 1.6, o: Math.min(g * 1.5, 1), luz: 0.2 });
    if (i === 7) tr.push({ t: "p", pts: [p(-0.55, -0.22), p(0.55, -0.22), p(0.55, 0.22), p(-0.55, 0.22), p(-0.55, -0.22)], w: 1, o: 0.6 });
  }
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Kicker t={t} t0={-0.5} texto="VIVIR DEL TRADING" />
      <Arriba>
        <Titular t={t} t0={-0.6} texto="¿cuánto para *vivir*?" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Sueldo: 2.000 € al mes, 24.000 € al año
const Sueldo: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 6.4, 6.0), L(t, s, e, -0.25, 0.1) + sacude(t, EV.r24 - 0.05), L(t, s, e, 0.25, 0.3), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  const n = t < EV.dosmil - 0.15 ? 0 : t < EV.dosmil + 0.6 ? 1 : Math.min(12, 1 + Math.floor(L(t, EV.dosmil + 0.6, EV.r24, 0, 11, (u) => u)));
  for (let i = 0; i < n; i++) {
    const g = muelle(t, i === 0 ? EV.dosmil - 0.15 : EV.dosmil + 0.6 + ((i - 1) * (EV.r24 - EV.dosmil - 0.6)) / 11, 240, 15);
    const x = -0.8 + (i % 6) * 0.32;
    const z = Math.floor(i / 6) * 0.45 - 0.2;
    const h = 0.32 * Math.min(g, 1.05);
    bloque(tr, [x - 0.13, -0.4, z - 0.13], [x + 0.13, -0.4 + h, z + 0.13], 1, i === 0 ? 0.5 : 0.2);
  }
  const pr = proyector(cam);
  const q0 = pr([-0.8, -0.4 + 0.32, -0.2]);
  const k = golpe(t, EV.r24 - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.dosmil - 0.05} x={q0.x} y={q0.y - 50} size={34} alinea="centro" o={t < EV.dosmil + 0.6 ? 1 : 0.6}>
        2.000 €
      </Etiqueta>
      <Abajo top={1220} o={L(t, EV.dosmil + 0.5, EV.dosmil + 0.8, 0, 1, salida)}>
        <span style={{ ...mono(100), display: "inline-block", transform: `scale(${1 + 0.25 * k})` }}>{`${euros(2000 * n)} €`}</span>
        <span style={mono(26, 0.6)}>AL AÑO</span>
      </Abajo>
      <Destello t={t} t0={EV.r24 - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.r24 - 0.4} texto="*2.000 €* al mes" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.r24 - 0.35} texto="*24.000 €* al año" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Pregunta a los espectadores
const Pregunta: React.FC<P> = (p) => <PreguntaComentarios {...p} lineas={["¿con cuánto", "*empezaste*?"]} />;

// ------------------------------------------------------------------ 4. Cuenta: al 20 %, una cuenta de 120.000 €
const ESC = 1.4 / 120000;
const BASE = -0.8;
const Cuenta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 6.8, 6.4), L(t, s, e, -0.3, 0.05) + sacude(t, EV.r120 - 0.05), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 1060 });
  const tr: Trazo[] = [...polvo(0.3)];
  const g = muelle(t, EV.necesitas - 0.2, 140, 13);
  const H = 120000 * ESC * Math.max(Math.min(g, 1.05), 0);
  if (g > 0) {
    bloque(tr, [-0.45, BASE, -0.3], [0.45, BASE + H * (100 / 120), 0.3], 1, 0.2);
    bloque(tr, [-0.45, BASE + H * (100 / 120), -0.3], [0.45, BASE + H, 0.3], 1, 0.6, "5 4");
  }
  const pr = proyector(cam);
  const qT = pr([0, BASE + H, 0.3]);
  const qS = pr([-0.45, BASE + H * (110 / 120), 0.3]);
  const k = golpe(t, EV.r120 - 0.05);
  const gig = t < EV.necesitas - 0.3;
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {gig && <Gigante t={t} t0={EV.veinte - 0.12} fin={EV.necesitas - 0.3} texto="20 %" top={520} size={240} pie="AL AÑO: EXCELENTE" />}
      <Etiqueta t={t} t0={EV.fondos - 0.1} x={540} y={980} size={30} o={gig ? 0.75 : 0} alinea="centro">
        MUCHOS FONDOS NO LO CONSIGUEN
      </Etiqueta>
      {g > 0 && <div style={{ position: "absolute", left: qT.x, top: qT.y - 74, transform: `translateX(-50%) scale(${1 + 0.25 * k})`, opacity: Math.min(g * 1.5, 1), ...mono(56) }}>{t >= EV.r120 - 0.1 ? "120.000 €" : ""}</div>}
      <Etiqueta t={t} t0={EV.r120 + 0.2} x={qS.x - 16} y={qS.y} size={30} alinea="der">
        20 % = 24.000 €
      </Etiqueta>
      <Destello t={t} t0={EV.r120 - 0.05} o={0.18} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.necesitas - 0.35} texto="un *20 %* al año" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.necesitas - 0.3} texto="cuenta de *120.000 €*" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: con 10.000 €, un 240 % al año, todos los años
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.2, 0], L(t, s, e, 6.2, 5.8), L(t, s, e, 0.3, 0.05) + sacude(t, EV.r240 - 0.05), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.3)];
  const E = 0.6 / 10000;
  const g1 = muelle(t, s + 0.05, 170, 15);
  const g2 = muelle(t, EV.r240 - 0.4, 140, 13);
  bloque(tr, [-0.7, BASE, -0.25], [-0.2, BASE + 10000 * E * Math.min(g1, 1.05), 0.25], 1, 0.2);
  if (g2 > 0) bloque(tr, [0.2, BASE, -0.25], [0.7, BASE + 24000 * E * Math.min(g2, 1.05), 0.25], 1, 0.6, "6 5");
  const pr = proyector(cam);
  const t1 = pr([-0.45, BASE + 10000 * E, 0.25]);
  const t2 = pr([0.45, BASE + 24000 * E * Math.max(Math.min(g2, 1), 0), 0.25]);
  const b1 = pr([-0.45, BASE, 0.25]);
  const b2 = pr([0.45, BASE, 0.25]);
  const k = golpe(t, EV.r240 - 0.05);
  const anio = t >= EV.todos - 0.1 ? Math.min(1 + Math.floor((t - EV.todos + 0.1) * 3), 9) : 1;
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: t1.x, top: t1.y - 66, transform: "translateX(-50%)", opacity: Math.min(g1 * 1.5, 1), ...mono(46) }}>10.000 €</div>
      {g2 > 0 && <div style={{ position: "absolute", left: t2.x, top: t2.y - 66, transform: `translateX(-50%) scale(${1 + 0.25 * k})`, ...mono(46) }}>24.000 €</div>}
      <div style={{ position: "absolute", left: b1.x, top: b1.y + 22, transform: "translateX(-50%)", ...mono(28, 0.8) }}>TU CUENTA</div>
      <div style={{ position: "absolute", left: b2.x, top: b2.y + 22, transform: "translateX(-50%)", opacity: Math.min(Math.max(g2, 0) * 1.5, 1), ...mono(28, 0.8) }}>TU SUELDO</div>
      <Kicker t={t} t0={EV.todos - 0.1} texto={`AÑO ${anio}, AÑO ${anio + 1}, AÑO ${anio + 2}…`} />
      <Destello t={t} t0={EV.r240 - 0.05} o={0.18} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.r240 - 0.4} texto="¿con *10.000 €*?" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.r240 - 0.35} fin={EV.todos - 0.35} texto="un *240 %* al año" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.todos - 0.3} texto="*todos* los años" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: las cuentas pequeñas se queman
const Cierre: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.2, 0], L(t, s, e, 6.0, 5.6), L(t, s, e, -0.3, 0.1) + sacude(t, EV.queman - 0.05), L(t, s, e, 0.2, 0.26), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  const H = 0.6;
  const rompe = t >= EV.queman - 0.15;
  if (!rompe) bloque(tr, [-0.3, BASE, -0.25], [0.3, BASE + H, 0.25], 1, 0.3);
  else
    for (let k = 0; k < 6; k++) {
      const u = L(t, EV.queman - 0.15 + k * 0.05, EV.queman + 1.2, 0, 1, (x) => x);
      const fx = (k % 3) - 1;
      const fy = Math.floor(k / 3);
      const x0 = -0.3 + (k % 3) * 0.2;
      const y0 = BASE + fy * (H / 2);
      const dx = fx * 0.5 * u;
      const dy = (0.3 - 1.0 * u) * u;
      bloque(tr, [x0 + dx, y0 + dy, -0.25], [x0 + 0.2 + dx, y0 + H / 2 + dy, 0.25], 1 - 0.7 * u, 0.4 * (1 - u), u > 0.05 ? "4 4" : undefined);
    }
  const pr = proyector(cam);
  const q = pr([0, BASE, 0.25]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: q.x, top: q.y + 22, transform: "translateX(-50%)", ...mono(28, 0.8) }}>CUENTA PEQUEÑA</div>
      <div style={{ position: "absolute", top: 1250, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, EV.arriesgando - 0.2, EV.arriesgando + 0.2, 0, 1, salida) }}>
        <span style={mono(40)}>SUELDO GRANDE → RIESGO GRANDE</span>
      </div>
      <Destello t={t} t0={EV.queman - 0.05} o={0.2} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.arriesgando - 0.4} texto="se *queman*" size={120} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.arriesgando - 0.35} texto="arriesgando *de más*" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. CTA
const Cta: React.FC<P> = (p) => <CtaSeguir {...p} lema="MÁS CUENTAS QUE NADIE TE HACE" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, sueldo: Sueldo, pregunta: Pregunta, cuenta: Cuenta, giro: Giro, cierre: Cierre, cta: Cta };
export const CLAVES = claves(["vivir", "2.000", "24.000", "comentarios", "20%", "excelente", "120.000", "10.000", "240%", "Todos", "queman", "sueldo", "sígueme"]);

export const Vivir: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/vivir_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
