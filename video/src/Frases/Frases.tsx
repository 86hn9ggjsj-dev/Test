// Reel de alcance "Tres frases que dice un trader justo antes de quemar la cuenta" (~26 s): escenas 3D en wireframe
// (blanco y negro con toques puntuales de verde y rojo) mezcladas con el stickman 2D metido dentro de la escena. Junto al
// escritorio mientras el saldo baja; «esta vez es diferente» con el mismo dibujo de antes y de ahora (sin stickman); de
// brazos cruzados con un reloj 3D «ya volverá»; el «sígueme» a mitad; pulsando un botón mientras crece una torre de lotes
// que se derrumba «solo una más»; la pérdida que crece como un cubo rojo (sin stickman) y la pregunta final.
// Tiempos en src/gen/frases.json (scripts/frases.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/frases.json";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { Arriba, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, ROJO, suelo, velas, VERDE } from "../Bot/kit";
import { escritorio, monitor } from "../Bot/monigote";
import { Clave, cuerpoEn, Estado, Stick } from "../Bot/stick";
import { Suelo, SUELO_Y } from "../Bot/plato";
import { anclaje, Bocadillo, CHOQUE, ENCOGE, Exclama, FlashRojo, HUNDIDO, MANOS_CABEZA, sentado, SiguemeStick, StickMundo } from "../Bot/comun";
import { claves, Destello, golpe, Kicker, Montaje, P, paseo, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const FRASES_FPS = datos.fps;
export const FRASES_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;

// Saldo grande debajo de la escena: blanco mientras aguanta, rojo suave cuando se hunde
const Saldo: React.FC<{ valor: number; top?: number; k?: number }> = ({ valor, top = 1335, k = 0 }) => (
  <div style={{ position: "absolute", top, left: 0, width: ANCHO - 60, display: "flex", justifyContent: "flex-end", gap: 16, alignItems: "baseline" }}>
    <span style={mono(26, 0.6)}>SALDO</span>
    <span style={{ ...mono(80), color: valor < 6000 ? ROJO : "#fff", opacity: valor < 6000 ? 0.92 : 1, display: "inline-block", transform: `scale(${1 + 0.25 * k})`, transformOrigin: "100% 50%" }}>{`${euros(valor)} €`}</span>
  </div>
);

// Escritorio 3D con el monitor; el stickman de pie a su izquierda, un poco por delante
const MON: V3 = [0.42, 0.05, 0];
const PIE: V3 = [-0.36, -1.0, 0.28];
const K = 0.6; // unidades del mundo por unidad del stickman
const pantalla = (tr: Trazo[], serie: number[], n: number, rojoFinal = 0) =>
  monitor(tr, MON, 0.7, 0.5, (p) => {
    const lo = Math.min(...serie);
    const hi = Math.max(...serie);
    const ys = serie.map((v) => p(0, 0.1 + ((v - lo) / (hi - lo)) * 0.8)[1]);
    velas(tr, ys, p(0.05, 0)[0], p(0.95, 0)[0], n, 0.016, 1, 0.012, true);
    if (rojoFinal > 0 && n >= serie.length) {
      const x = p(0.95, 0)[0];
      tr.push({ t: "l", a: [x, ys[ys.length - 2], 0.01], b: [x, ys[ys.length - 1], 0.01], w: 5, o: 0.9 * rojoFinal, color: ROJO, luz: 0.5 * rojoFinal });
    }
  });
const camEscritorio = (t: number, s: number, e: number, golpeT = -9) =>
  orbita([0.0, -0.2, 0], L(t, s, e, 5.6, 5.2) - 0.3 * golpe(t, golpeT), L(t, s, e, -0.16, 0.1) + sacude(t, golpeT), L(t, s, e, 0.05, 0.1), { apertura: 35, centroY: 850 });

// ------------------------------------------------------------------ 1. Hook: junto al escritorio mientras el saldo baja
const BAJA = paseo(26, 12, 0.5, -0.2);
const HOOK: Clave[] = [
  [EV.quemar - 0.4, { incl: 0.1, x: 0.05, ojos: 1.15, cejas: -0.5, boca: -0.3, mDx: 0.3, mDy: -0.3 }],
  [EV.duele - 0.12, { ...CHOQUE, incl: -0.07, x: -0.03 }],
  [EV.duele + 0.3, { ...MANOS_CABEZA, mira: 0.4 }],
  [EV.duele + 0.55, { cabeza: 0.12 }],
  [EV.duele + 0.7, { cabeza: -0.12 }],
  [EV.duele + 0.85, { cabeza: 0 }],
];
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = camEscritorio(t, s, e, EV.duele - 0.05);
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.16, "#fff", 0.25);
  escritorio(tr, -0.05, 0.85, -0.32);
  pantalla(tr, BAJA, Math.round(L(t, -0.4, EV.duele, 6, BAJA.length)), L(t, EV.duele - 0.3, EV.duele, 0, 1));
  const c = cuerpoEn(t, HOOK, { incl: 0.05, mira: 0.8, mDx: 0.06, mDy: 0.13, boca: 0.1 });
  const a = anclaje(cam, PIE, K);
  const saldo = Math.round(L(t, 0, EV.duele, 10000, 6240, (u) => u * u));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <StickMundo a={a} c={c} t={t} />
      <Exclama t={t} t0={EV.duele - 0.05} c={c} {...a} />
      <Saldo valor={saldo} k={golpe(t, EV.duele - 0.05)} />
      <FlashRojo t={t} t0={EV.duele - 0.05} o={0.14} />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.tercera - 0.45} texto="*3 frases* antes de quemarla" size={84} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.tercera - 0.4} texto="la *tercera* duele" size={108} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Una: «esta vez es diferente»… el mismo dibujo de antes y de ahora (sin stickman)
const PATRON = [0, 0.3, 0.2, 0.55, 0.45, 0.8, 0.7, 1.05, 1.0, 0.6, 0.15, -0.3, -0.7, -1.0];
const CAIDA = 9;
const yP = (v: number) => -0.55 + ((v + 1) / 2.05) * 0.75;
const Una: React.FC<P> = ({ t, s, e }) => {
  const tc = EV.diferente + 0.35;
  const cam = orbita([0, -0.2, 0], L(t, s, e, 4.3, 3.9) - 0.25 * golpe(t, tc), L(t, s, e, -0.25, 0.2) + sacude(t, tc), 0.08, { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -0.9, 0.14, "#fff", 0.2);
  const ys = PATRON.map(yP);
  const xA = (i: number) => -0.95 + (i / (PATRON.length - 1)) * 0.8;
  const xB = (i: number) => 0.15 + (i / (PATRON.length - 1)) * 0.8;
  // ANTES: el patrón entero, apagado, con su caída en rojo tenue
  velas(tr, ys, xA(0), xA(PATRON.length - 1), PATRON.length, 0.02, 0.4, 0.014, true);
  for (let i = CAIDA; i < PATRON.length; i++) tr.push({ t: "l", a: [xA(i), ys[i - 1], 0.01], b: [xA(i), ys[i], 0.01], w: 4, o: 0.35, color: ROJO });
  // AHORA: se dibuja igual… y cae igual
  const n = Math.round(L(t, s, tc + 0.1, 4, PATRON.length, (u) => u));
  velas(tr, ys, xB(0), xB(PATRON.length - 1), n, 0.02, 1, 0.014, true);
  for (let i = CAIDA; i < n; i++) tr.push({ t: "l", a: [xB(i), ys[i - 1], 0.01], b: [xB(i), ys[i], 0.01], w: 6, o: 0.95, color: ROJO, luz: 0.5 });
  // Mismo dibujo: una línea discontinua une los dos techos
  const techo = L(t, s + 0.3, s + 0.8, 0, 1);
  if (techo > 0) tr.push({ t: "l", a: [xA(7), ys[7] + 0.06, 0], b: [xA(7) + (xB(7) - xA(7)) * techo, ys[7] + 0.06, 0], w: 1.6, o: 0.7, dash: "8 10" });
  const pr = proyector(cam);
  const qa = pr([xA(6), 0.42, 0]);
  const qb = pr([xB(6), 0.42, 0]);
  const verde = L(t, s, s + 0.2, 0, 1) * (1 - L(t, tc - 0.25, tc - 0.05, 0, 1));
  const cita = muelle(t, s + 0.05, 240, 14);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qa.x, top: qa.y, transform: "translate(-50%, -50%)", ...mono(30, 0.55) }}>ANTES</div>
      <div style={{ position: "absolute", left: qb.x, top: qb.y, transform: "translate(-50%, -50%)", ...mono(30) }}>AHORA</div>
      <div style={{ position: "absolute", left: qb.x, top: qb.y - 70, transform: "translate(-50%, -50%)", opacity: verde, ...mono(48), color: VERDE }}>+12 %</div>
      <div style={{ position: "absolute", top: 1240, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: Math.min(Math.max(cita, 0) * 1.5, 1), transform: `scale(${0.7 + 0.3 * Math.min(Math.max(cita, 0), 1.1)})` }}>
        <span style={{ padding: "16px 32px", borderRadius: 26, border: "3px solid #fff", background: "#000", ...mono(38) }}>«ESTA VEZ ES DIFERENTE»</span>
      </div>
      <Kicker t={t} t0={s + 0.02} texto="FRASE 1" />
      <FlashRojo t={t} t0={tc} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={tc - 0.1} texto="esta vez es *diferente*" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tc - 0.05} texto="mismo dibujo, *mismo final*" size={84} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: «ya volverá»… y no vuelve (stickman ante un reloj 3D y el precio que no vuelve)
const s2 = inicio("dos");
const ESPERA = [...paseo(10, 9, 0.3, -0.1), ...paseo(16, 4, 0.35, -0.35).map((v) => v - 1.0)];
const PIE2: V3 = [-0.62, -1.0, 0.3];
const DOS: Clave[] = [
  [s2 - 0.1, { mIx: 0.13, mIy: -0.17, mDx: -0.13, mDy: -0.17, boca: -0.1, cejas: 0.3, ojos: 0.85, incl: -0.03, x: -0.02 }],
  [EV.vuelve - 0.1, { ...CHOQUE, abre: 0.6 }],
  [EV.vuelve + 0.3, HUNDIDO],
];
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.1, -0.25, 0], L(t, s, e, 5.6, 5.2) - 0.25 * golpe(t, EV.vuelve - 0.05), L(t, s, e, -0.2, 0.12) + sacude(t, EV.vuelve - 0.05), 0.08, { apertura: 35, centroY: 860 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.16, "#fff", 0.2);
  // Precio: arranca en la entrada y se va alejando; al final, el tramo que «no vuelve» en rojo
  const lo = Math.min(...ESPERA);
  const hi = Math.max(...ESPERA);
  const yE = (v: number) => -0.62 + ((v - lo) / (hi - lo)) * 0.62;
  const xE = (i: number) => -0.05 + (i / (ESPERA.length - 1)) * 1.1;
  const n = Math.max(2, Math.round(L(t, s, e, 6, ESPERA.length, (u) => u)));
  const entrada = yE(ESPERA[0]);
  tr.push({ t: "l", a: [-0.1, entrada, -0.2], b: [1.1, entrada, -0.2], w: 1.6, o: 0.6, dash: "8 10" });
  const corte = Math.round(ESPERA.length * 0.62);
  tr.push({ t: "p", pts: ESPERA.slice(0, Math.min(n, corte)).map((v, i) => [xE(i), yE(v), -0.2] as V3), w: 2.8, o: 1, luz: 0.3 });
  if (n > corte) tr.push({ t: "p", pts: ESPERA.slice(corte - 1, n).map((v, i) => [xE(i + corte - 1), yE(v), -0.2] as V3), w: 3.2, o: 0.95, color: ROJO, luz: 0.4 });
  tr.push({ t: "e", c: [xE(n - 1), yE(ESPERA[n - 1]), -0.2], r: 0.018, tipo: "punto", o: 1, luz: 1, color: n > corte ? ROJO : undefined });
  // Reloj 3D que gira deprisa
  const rc: V3 = [0.66, 0.34, -0.3];
  tr.push({ t: "p", pts: circulo(rc, 0.17, "z", 40), w: 2.6, o: 1, relleno: "#000", oRelleno: 0.9, luz: 0.2 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    tr.push({ t: "l", a: [rc[0] + Math.sin(a) * 0.135, rc[1] + Math.cos(a) * 0.135, rc[2]], b: [rc[0] + Math.sin(a) * 0.155, rc[1] + Math.cos(a) * 0.155, rc[2]], w: 1.6, o: 0.8 });
  }
  const ah = (t - s) * 9;
  tr.push({ t: "l", a: rc, b: [rc[0] + Math.sin(ah) * 0.13, rc[1] + Math.cos(ah) * 0.13, rc[2]], w: 2.6, o: 1 });
  tr.push({ t: "l", a: rc, b: [rc[0] + Math.sin(ah / 12) * 0.09, rc[1] + Math.cos(ah / 12) * 0.09, rc[2]], w: 3.4, o: 1 });
  const base = cuerpoEn(t, DOS, { mira: 0.8, incl: -0.02 }, s - 0.3);
  const c: Estado = t < EV.vuelve - 0.1 ? { ...base, pDy: base.pDy + 0.035 * Math.max(0, Math.sin((t - s) * 11)) } : base;
  const a = anclaje(cam, PIE2, K);
  const pr = proyector(cam);
  const qe = pr([0.95, entrada + 0.05, -0.2]);
  const saldo = Math.round(L(t, s, e, 6240, 3900, (u) => u * u));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qe.x, top: qe.y, transform: "translate(-100%, -100%)", ...mono(22, 0.6) }}>TU ENTRADA</div>
      <StickMundo a={a} c={c} t={t} />
      <Bocadillo t={t} t0={s + 0.05} c={c} {...a} texto="«YA VOLVERÁ»" fin={EV.vuelve - 0.1} limite={620} />
      <Saldo valor={saldo} k={golpe(t, EV.vuelve - 0.05)} />
      <Kicker t={t} t0={s + 0.02} texto="FRASE 2" />
      <FlashRojo t={t} t0={EV.vuelve - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.vuelve - 0.4} texto="ya *volverá*" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.vuelve - 0.35} texto="y no *vuelve*" size={116} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme a mitad
const Sigueme: React.FC<P> = (p) => <SiguemeStick {...p} lema="SI ALGUNA TE SUENA" />;

// ------------------------------------------------------------------ 5. Tres: «solo una más…»: pulsa el botón y la torre de lotes crece, se tambalea y se derrumba
const s3 = inicio("tres");
const PIE3: V3 = [-0.58, -1.0, 0.32];
const TRES: Clave[] = [
  [s3 - 0.1, { mDx: 0.33, mDy: -0.44, mIx: -0.2, mIy: -0.35, ojos: 1.2, cejas: -0.6, mira: 0.7, incl: 0.06 }],
  [EV.recuperar, { agobio: 0.9 }],
  [EV.dejo - 0.12, { ...CHOQUE, incl: -0.07 }],
  [EV.dejo + 0.25, sentado(0)],
];
const LOTES = [1, 2, 4, 8, 16];
const Tres: React.FC<P> = ({ t, s, e }) => {
  const td = EV.dejo - 0.05;
  const cam = orbita([0, -0.3, 0], L(t, s, e, 5.6, 5.1) - 0.3 * golpe(t, td), L(t, s, e, -0.2, 0.15) + sacude(t, td), 0.1, { apertura: 35, centroY: 860 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.16, "#fff", 0.2);
  const pasos = Math.min(4, Math.floor(L(t, EV.solo, EV.dejo - 0.2, 0, 4.99)));
  const tPaso = (i: number) => EV.solo + (i * (EV.dejo - 0.2 - EV.solo)) / 4.99;
  // Botón sobre su peana: se hunde y se ilumina con cada pulsación
  const pulsa = golpe(t, tPaso(pasos));
  cristal(tr, [-0.47, -1.0, 0.2], [-0.29, -0.52, 0.44], "#fff", 0.8, 0.15, 0.06);
  cristal(tr, [-0.44, -0.52, 0.23], [-0.32, -0.47 - 0.03 * pulsa, 0.41], t < td ? "#fff" : ROJO, 1, 0.3 + 0.6 * pulsa, 0.25 + 0.4 * pulsa);
  // Torre de lotes: cada bloque dobla al anterior; se tambalea más cuanto más alta y al final se derrumba en rojo
  const cae = L(t, td - 0.1, td + 0.8, 0, 1, (u) => u * u);
  const tambalea = (0.01 + 0.012 * pasos) * Math.sin(t * 6);
  let y = -1.0;
  const pr = proyector(cam);
  const etiquetas: { x: number; y: number; n: number }[] = [];
  for (let i = 0; i <= Math.min(pasos, 3); i++) {
    const g = Math.min(muelle(t, tPaso(i), 220, 13), 1.05);
    const h = 0.07 * Math.pow(2, i) * g;
    const lado = 0.34 - i * 0.03;
    const dx = tambalea * (y + 1) * 3 + (i - 1.5) * 0.35 * cae;
    const dy = -1.4 * cae * cae * (i + 1) * 0.4;
    cristal(tr, [0.5 - lado / 2 + dx, y + dy, -lado / 2], [0.5 + lado / 2 + dx, y + h + dy, lado / 2], cae > 0 ? ROJO : "#fff", 1 - 0.5 * cae, 0.25 + 0.4 * golpe(t, tPaso(i)), cae > 0 ? 0.2 : 0.1);
    const q = pr([0.5 + lado / 2 + dx + 0.04, y + h / 2 + dy, lado / 2]);
    etiquetas.push({ x: q.x, y: q.y, n: LOTES[i] });
    y += h;
  }
  const c0 = cuerpoEn(t, TRES, { mira: 0.7, cejas: -0.3, boca: -0.2 }, s - 0.3);
  // Aporrea el botón: la mano sube y baja
  const clic = t < td - 0.1 ? Math.abs(Math.sin((t - s) * 14)) : 0;
  const c: Estado = { ...c0, mDy: c0.mDy + 0.1 * clic };
  const a = anclaje(cam, PIE3, K);
  const qTop = pr([0.5, y + 0.12, 0]);
  const lote = LOTES[pasos];
  const saldo = t < td ? Math.round(3900 - pasos * 900) : 0;
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {etiquetas.map((q) => (
        <div key={q.n} style={{ position: "absolute", left: q.x, top: q.y, transform: "translateY(-50%)", opacity: 1 - cae, ...mono(30, 0.85) }}>{`×${q.n}`}</div>
      ))}
      <div style={{ position: "absolute", left: qTop.x, top: qTop.y, transform: `translate(-50%, -100%) scale(${1 + 0.2 * golpe(t, tPaso(pasos))})`, opacity: L(t, EV.solo - 0.2, EV.solo, 0, 1) * (1 - cae), ...mono(50) }}>{`LOTE ×${lote}`}</div>
      <StickMundo a={a} c={c} t={t} />
      <Bocadillo t={t} t0={EV.solo - 0.1} c={c} {...a} texto="«SOLO UNA MÁS…»" fin={EV.dejo - 0.1} limite={760} />
      <Exclama t={t} t0={td} c={c} {...a} />
      <Saldo valor={saldo} k={golpe(t, td)} />
      <Kicker t={t} t0={s + 0.02} texto="FRASE 3" />
      <FlashRojo t={t} t0={td} o={0.2} />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.dejo - 0.45} texto="solo *una más*" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.dejo - 0.4} texto="…y lo *dejo*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: son excusas; la pérdida pequeña crece hasta ser un cubo rojo enorme (sin stickman)
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.3, 0], L(t, s, e, 4.4, 5.6) - 0.3 * golpe(t, EV.grande - 0.05), L(t, s, e, -0.35, -0.05) + sacude(t, EV.grande - 0.05), L(t, s, e, 0.1, 0.18), { apertura: 35, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -0.9, 0.18, "#fff", 0.3);
  const lista = t < EV.excusas - 0.1;
  const crece = L(t, EV.excusas, EV.grande, 0, 1, (u) => u * u);
  const lado = 0.08 + 0.95 * crece;
  const xc = 0.1 + 0.1 * crece;
  if (!lista) {
    cristal(tr, [xc - lado / 2, -0.9, -lado / 2], [xc + lado / 2, -0.9 + lado, lado / 2], ROJO, 0.9, 0.2 + 0.5 * golpe(t, EV.grande - 0.05), 0.08 + 0.1 * crece);
    // Las grietas de la «pérdida pequeña» que se va haciendo grande
    for (let i = 0; i < 3; i++) {
      const f = 0.25 + i * 0.25;
      tr.push({ t: "l", a: [xc - lado / 2, -0.9 + lado * f, lado / 2 + 0.001], b: [xc + lado / 2, -0.9 + lado * f, lado / 2 + 0.001], w: 1.2, o: 0.35 * crece, color: ROJO });
    }
  }
  const pr = proyector(cam);
  const qc = pr([xc, -0.9 + lado + 0.06, 0]);
  const valor = Math.round(50 + 4950 * crece);
  const tachas = ["ESTA VEZ ES DIFERENTE", "YA VOLVERÁ", "SOLO UNA MÁS"];
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {lista && (
        <div style={{ position: "absolute", top: 560, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          {tachas.map((f, i) => {
            const raya = L(t, EV.estrategia - 0.3 + i * 0.15, EV.estrategia + i * 0.15, 0, 1, salida);
            return (
              <span key={f} style={{ position: "relative", opacity: L(t, s + i * 0.1, s + 0.3 + i * 0.1, 0, 1) * (1 - 0.4 * raya), ...mono(46) }}>
                {`«${f}»`}
                <span style={{ position: "absolute", left: -10, top: "52%", height: 5, width: `calc(${raya * 100}% + ${raya * 20}px)`, background: "#fff" }} />
              </span>
            );
          })}
        </div>
      )}
      {!lista && <div style={{ position: "absolute", left: Math.min(Math.max(qc.x, 220), 860), top: qc.y - 60, transform: "translateX(-50%)", ...mono(44 + 36 * crece), color: ROJO, opacity: 0.92 }}>{`−${euros(valor)} €`}</div>}
      <Destello t={t} t0={EV.grande - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.excusas - 0.4} texto="ninguna es *estrategia*" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.excusas - 0.35} fin={EV.pequena - 0.35} texto="son *excusas*" size={120} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.pequena - 0.3} texto="hasta que es *grande*" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta final: se encoge de hombros y señala el comentario
const sP = inicio("pregunta");
const PREG: Clave[] = [
  [sP + 0.2, { ...ENCOGE, boca: 0.3, mira: -0.3 }],
  [sP + 1.2, { cabeza: -0.06, mDx: 0.18, mDy: 0.55, boca: 0.8, abre: 0.3, cejas: 0.5, mira: 0.2 }],
];
const Pregunta: React.FC<P> = (p) => {
  const { t, s } = p;
  const c = cuerpoEn(t, PREG, {}, s - 0.3);
  return (
    <>
      <PreguntaComentarios {...p} lineas={["¿cuál has", "*dicho tú*?"]} kicker="Y ENVÍASELO" pie="ENVÍASELO A QUIEN DICE LA TERCERA" size={104} />
      <Suelo />
      <Stick c={c} ox={540} oy={SUELO_Y} s={225} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, una: Una, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves(["quemar", "tercera", "duele", "diferente", "volverá", ["vuelve", ROJO], "Sígueme", "más", ["dejo", ROJO], "estrategia", "excusas", "pequeña", ["grande", ROJO], "tú", "envíaselo"]);

export const Frases: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/frases_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
