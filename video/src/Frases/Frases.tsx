// Reel de alcance "Tres frases que dice un trader justo antes de quemar la cuenta" (~30 s), en blanco y negro con toques
// puntuales de verde y rojo y un stickman: sentado ante el monitor mientras el saldo baja, confiado señalando «esta vez es
// diferente», esperando con el reloj «ya volverá», el «sígueme» a mitad, clicando sin parar «solo una más» hasta 0 €, la
// pérdida pequeña que crece como una bola de nieve y la pregunta final. Tiempos en src/gen/frases.json (scripts/frases.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/frases.json";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { Arriba, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, ROJO, suelo, velas, VERDE } from "../Bot/kit";
import { escritorio, monigote, monitor, POSES, poseEn, silla } from "../Bot/monigote";
import { claves, CtaSeguir, Destello, golpe, Kicker, Montaje, P, paseo, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const FRASES_FPS = datos.fps;
export const FRASES_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// Bocadillo de cómic encima de la cabeza
const Bocadillo: React.FC<{ t: number; t0: number; x: number; y: number; texto: string; fin?: number }> = ({ t, t0, x, y, texto, fin }) => {
  const g = muelle(t, t0, 260, 14);
  const fuera = fin === undefined ? 0 : L(t, fin - 0.2, fin, 0, 1);
  if (g <= 0.001 || fuera >= 1) return null;
  return (
    <div style={{ position: "absolute", left: Math.min(Math.max(x, 250), 830), top: Math.max(y, 600), transform: `translate(-50%, -100%) scale(${0.6 + 0.4 * Math.min(g, 1.1)})`, transformOrigin: "50% 100%", opacity: Math.min(g * 1.5, 1) * (1 - fuera) }}>
      <div style={{ position: "relative", padding: "18px 30px", borderRadius: 26, border: "3px solid #fff", background: "#000", whiteSpace: "nowrap", ...mono(40) }}>
        {texto}
        <div style={{ position: "absolute", left: "50%", bottom: -18, width: 30, height: 30, marginLeft: -15, background: "#000", borderRight: "3px solid #fff", borderBottom: "3px solid #fff", transform: "rotate(45deg)" }} />
      </div>
    </div>
  );
};

// Saldo: blanco mientras aguanta, rojo suave cuando se hunde
const Saldo: React.FC<{ valor: number; top?: number; k?: number }> = ({ valor, top = 1275, k = 0 }) => (
  <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 16, alignItems: "baseline" }}>
    <span style={mono(26, 0.6)}>SALDO</span>
    <span style={{ ...mono(96), color: valor < 6000 ? ROJO : "#fff", opacity: valor < 6000 ? 0.92 : 1, display: "inline-block", transform: `scale(${1 + 0.25 * k})` }}>{`${euros(valor)} €`}</span>
  </div>
);

// Escena de escritorio: stickman de lado a la izquierda y monitor a la derecha
const MON: V3 = [0.42, 0.05, 0];
const CADERA: V3 = [-0.42, -0.52, 0];
const BAJA = paseo(26, 12, 0.5, -0.2);
const SUBE_BAJA = [...paseo(14, 3, 0.4, 0.18), ...paseo(12, 5, 0.4, -0.5).map((v) => v + 2.4)];
const pantalla = (tr: Trazo[], serie: number[], n: number, rojoFinal = 0) =>
  monitor(tr, MON, 0.7, 0.5, (p) => {
    const lo = Math.min(...serie);
    const hi = Math.max(...serie);
    const ys = serie.map((v) => p(0, 0.1 + ((v - lo) / (hi - lo)) * 0.8)[1]);
    velas(tr, ys, p(0.05, 0)[0], p(0.95, 0)[0], n, 0.016, 1, 0.012, true);
    // La última vela, en rojo suave cuando el golpe llega
    if (rojoFinal > 0 && n >= serie.length) {
      const x = p(0.95, 0)[0];
      tr.push({ t: "l", a: [x, ys[ys.length - 2], 0.01], b: [x, ys[ys.length - 1], 0.01], w: 5, o: 0.9 * rojoFinal, color: ROJO, luz: 0.5 * rojoFinal });
    }
  });
const decorado = (tr: Trazo[], t: number) => {
  suelo(tr, t, -1.0, 0.16, "#fff", 0.25);
  escritorio(tr, -0.05, 0.85, -0.32);
  silla(tr, -0.5, -0.56);
};
const camEscritorio = (t: number, s: number, e: number, golpeT = -9, d0 = 4.6, d1 = 4.2) =>
  orbita([0.0, -0.2, 0], L(t, s, e, d0, d1) * 0.95 - 0.3 * golpe(t, golpeT), L(t, s, e, -0.12, 0.12) + sacude(t, golpeT), L(t, s, e, 0.05, 0.1), { apertura: 35, centroY: 930 });

// ------------------------------------------------------------------ 1. Hook: tres frases antes de quemar la cuenta
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = camEscritorio(t, s, e, EV.duele - 0.05);
  const tr: Trazo[] = [...polvo(0.25)];
  decorado(tr, t);
  pantalla(tr, BAJA, Math.round(L(t, -0.4, EV.duele, 6, BAJA.length)), L(t, EV.duele - 0.3, EV.duele, 0, 1));
  const pose = poseEn(t, [[0, POSES.sentado], [EV.quemar - 0.4, POSES.inclinado], [EV.duele - 0.15, POSES.cabezaManos]], 0.3);
  monigote(tr, CADERA, pose, "lado", 1, 1, t);
  const saldo = Math.round(L(t, 0, EV.duele, 10000, 6240, (u) => u * u));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Saldo valor={saldo} k={golpe(t, EV.duele - 0.05)} />
      <Destello t={t} t0={EV.duele - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.tercera - 0.45} texto="*3 frases* antes de quemarla" size={84} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.tercera - 0.4} texto="la *tercera* duele" size={108} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Una: «esta vez es diferente», y el mismo dibujo cae
const Una: React.FC<P> = ({ t, s, e }) => {
  const cam = camEscritorio(t, s, e, EV.diferente + 0.35, 4.4, 4.1);
  const tr: Trazo[] = [...polvo(0.25)];
  decorado(tr, t);
  const n = Math.round(L(t, s, EV.diferente + 0.4, 12, SUBE_BAJA.length, (u) => u));
  pantalla(tr, SUBE_BAJA, n, L(t, EV.diferente + 0.2, EV.diferente + 0.4, 0, 1));
  const pose = poseEn(t, [[s - 1, POSES.inclinado], [s + 0.05, POSES.senala], [EV.diferente + 0.45, POSES.hundidoPie]], 0.25);
  const cabeza = monigote(tr, [-0.42, -0.42, 0], pose, "lado", 1, 1, t);
  const pr = proyector(cam);
  const q = pr([cabeza[0], cabeza[1] + 0.16, 0]);
  const qm = pr([MON[0] + 0.2, MON[1] + 0.3, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Bocadillo t={t} t0={s + 0.05} x={q.x + 120} y={q.y} texto="«ESTA VEZ ES DIFERENTE»" />
      <div style={{ position: "absolute", left: qm.x, top: qm.y - 40, transform: "translateX(-50%)", opacity: L(t, s, s + 0.2, 0, 1) * (1 - L(t, EV.diferente + 0.1, EV.diferente + 0.3, 0, 1)), ...mono(40), color: VERDE }}>+12 %</div>
      <Kicker t={t} t0={s + 0.02} texto="FRASE 1" />
      <Destello t={t} t0={EV.diferente + 0.35} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.05} texto="esta vez es *diferente*" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: «ya volverá»… y no vuelve
const ESPERA = [...paseo(10, 9, 0.3, -0.1), ...paseo(16, 4, 0.35, -0.35).map((v) => v - 1.0)];
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = camEscritorio(t, s, e, EV.vuelve - 0.05, 4.5, 4.1);
  const tr: Trazo[] = [...polvo(0.25)];
  decorado(tr, t);
  pantalla(tr, ESPERA, Math.round(L(t, s, e, 10, ESPERA.length, (u) => u)), L(t, EV.vuelve - 0.2, EV.vuelve, 0, 1));
  const pose = poseEn(t, [[s - 1, POSES.sentado], [EV.vuelve - 0.1, POSES.hundido]], 0.3);
  const cabeza = monigote(tr, CADERA, pose, "lado", 1, 1, t);
  // Reloj que gira deprisa encima del monitor
  const rc: V3 = [0.42, -0.62, 0];
  tr.push({ t: "p", pts: circulo(rc, 0.1, "z", 30), w: 2.4, o: 1, relleno: "#000", oRelleno: 0.9 });
  const ah = -(t - s) * 9;
  tr.push({ t: "l", a: rc, b: [rc[0] + Math.sin(ah) * 0.08, rc[1] + Math.cos(ah) * 0.08, 0], w: 2.4, o: 1 });
  tr.push({ t: "l", a: rc, b: [rc[0] + Math.sin(ah / 12) * 0.05, rc[1] + Math.cos(ah / 12) * 0.05, 0], w: 2.4, o: 1 });
  const pr = proyector(cam);
  const q = pr([cabeza[0], cabeza[1] + 0.16, 0]);
  const saldo = Math.round(L(t, s, e, 6240, 3900, (u) => u * u));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Bocadillo t={t} t0={s + 0.05} x={q.x + 100} y={q.y} texto="«YA VOLVERÁ»" fin={EV.vuelve - 0.1} />
      <Saldo valor={saldo} k={golpe(t, EV.vuelve - 0.05)} />
      <Kicker t={t} t0={s + 0.02} texto="FRASE 2" />
      <Destello t={t} t0={EV.vuelve - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.vuelve - 0.4} texto="ya *volverá*" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.vuelve - 0.35} texto="y no *vuelve*" size={116} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme a mitad, con el stickman señalando el botón
const Sigueme: React.FC<P> = (p) => {
  const { t, s, e } = p;
  const cam = orbita([0, -0.3, 0], 4.2, L(t, s, e, -0.2, 0.2), 0.05, { apertura: 35, centroY: 1020 });
  const tr: Trazo[] = [];
  const pose = poseEn(t, [[s - 1, POSES.dePie], [s + 0.1, POSES.senala], [s + 1.2, POSES.celebra]], 0.3);
  monigote(tr, [0, -0.98, 0], { ...pose, bD: [pose.bD[0] + 8 * Math.sin((t - s) * 8), pose.bD[1]] }, "frente", 1, 1.0, t);
  return (
    <>
      <CtaSeguir {...p} lema="SI ALGUNA TE SUENA" />
      <Escena cam={cam} trazos={tr} />
    </>
  );
};

// ------------------------------------------------------------------ 5. Tres: «solo una más para recuperar… y lo dejo»
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = camEscritorio(t, s, e, EV.dejo - 0.05, 4.4, 3.9);
  const tr: Trazo[] = [...polvo(0.25)];
  decorado(tr, t);
  pantalla(tr, BAJA.map((v, i) => v - i * 0.05), BAJA.length, L(t, EV.dejo - 0.2, EV.dejo, 0, 1));
  // Clica sin parar: el antebrazo derecho sube y baja
  const clic = t < EV.dejo - 0.1 ? Math.abs(Math.sin((t - s) * 14)) : 0;
  const base = poseEn(t, [[s - 1, POSES.inclinado], [EV.dejo - 0.1, POSES.cabezaManos]], 0.25);
  const pose = { ...base, bD: [base.bD[0] - 18 * clic, base.bD[1] + 25 * clic] as [number, number] };
  const cabeza = monigote(tr, CADERA, pose, "lado", 1, 1, t);
  const pr = proyector(cam);
  const q = pr([cabeza[0], cabeza[1] + 0.16, 0]);
  const pasos = Math.min(4, Math.floor(L(t, EV.solo, EV.dejo - 0.2, 0, 4)));
  const qm = pr([MON[0], -0.5, 0]);
  const lote = [1, 2, 4, 8, 16][pasos];
  const saldo = t < EV.dejo - 0.1 ? Math.round(3900 - pasos * 900) : 0;
  const k = golpe(t, EV.dejo - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Bocadillo t={t} t0={EV.solo - 0.1} x={q.x + 120} y={q.y} texto="«SOLO UNA MÁS…»" fin={EV.dejo - 0.1} />
      <div style={{ position: "absolute", left: qm.x, top: qm.y, transform: `translate(-50%, -50%) scale(${1 + 0.2 * golpe(t, EV.solo + pasos * 0.5)})`, opacity: L(t, EV.solo - 0.2, EV.solo, 0, 1) * (1 - L(t, EV.dejo - 0.2, EV.dejo, 0, 1)), ...mono(54) }}>{`LOTE ×${lote}`}</div>
      <Saldo valor={saldo} k={k} />
      <Kicker t={t} t0={s + 0.02} texto="FRASE 3" />
      <Destello t={t} t0={EV.dejo - 0.05} o={0.22} />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.dejo - 0.45} texto="solo *una más*" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.dejo - 0.4} texto="…y lo *dejo*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: excusas; la pérdida pequeña crece hasta ser enorme
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.3, 0], L(t, s, e, 4.8, 5.4) - 0.3 * golpe(t, EV.grande - 0.05), L(t, s, e, -0.35, -0.1) + sacude(t, EV.grande - 0.05), L(t, s, e, 0.1, 0.14), { apertura: 35, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -0.9, 0.18, "#fff", 0.3);
  const lista = t < EV.excusas - 0.1;
  // La pérdida: un cubo que empieza diminuto y crece hasta que es grande
  const crece = L(t, EV.excusas, EV.grande, 0, 1, (u) => u * u);
  const lado = 0.08 + 0.85 * crece;
  const xc = 0.35 + 0.15 * crece;
  if (!lista) cristal(tr, [xc - lado / 2, -0.9, -lado / 2], [xc + lado / 2, -0.9 + lado, lado / 2], ROJO, 0.9, 0.2 + 0.5 * golpe(t, EV.grande - 0.05), 0.08 + 0.1 * crece);
  const pose = poseEn(t, [[s - 1, POSES.dePie], [EV.excusas, POSES.encoge], [EV.grande - 0.3, POSES.manosCabeza]], 0.35);
  monigote(tr, [-0.35, -0.42, 0], pose, "frente", 1, 1, t);
  const pr = proyector(cam);
  const qc = pr([xc, -0.9 + lado + 0.06, 0]);
  const valor = Math.round(50 + 4950 * crece);
  const tachas = ["ESTA VEZ ES DIFERENTE", "YA VOLVERÁ", "SOLO UNA MÁS"];
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {lista && (
        <div style={{ position: "absolute", top: 470, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {tachas.map((f, i) => {
            const raya = L(t, EV.estrategia - 0.3 + i * 0.15, EV.estrategia + i * 0.15, 0, 1, salida);
            return (
              <span key={f} style={{ position: "relative", opacity: L(t, s + i * 0.1, s + 0.3 + i * 0.1, 0, 1) * (1 - 0.4 * raya), ...mono(42) }}>
                {`«${f}»`}
                <span style={{ position: "absolute", left: -10, top: "52%", height: 5, width: `calc(${raya * 100}% + ${raya * 20}px)`, background: "#fff" }} />
              </span>
            );
          })}
        </div>
      )}
      {!lista && <div style={{ position: "absolute", left: Math.min(qc.x, 880), top: qc.y - 60, transform: "translateX(-50%)", ...mono(40 + 30 * crece), color: ROJO, opacity: 0.9 }}>{`−${euros(valor)} €`}</div>}
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

// ------------------------------------------------------------------ 7. Pregunta final, con el stickman encogiéndose de hombros
const Pregunta: React.FC<P> = (p) => {
  const { t, s } = p;
  const cam = orbita([0, -0.3, 0], 4.2, 0.1 * Math.sin(t * 0.8), 0.05, { apertura: 35, centroY: 1020 });
  const tr: Trazo[] = [];
  monigote(tr, [0.42, -1.0, 0], poseEn(t, [[s - 1, POSES.dePie], [s + 0.3, POSES.encoge]], 0.3), "frente", 1, 0.85, t);
  return (
    <>
      <PreguntaComentarios {...p} lineas={["¿cuál has", "*dicho tú*?"]} kicker="Y ENVÍASELO" pie="ENVÍASELO A QUIEN DICE LA TERCERA" size={104} />
      <Escena cam={cam} trazos={tr} />
    </>
  );
};

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, una: Una, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves(["quemar", "tercera", "duele", "diferente", "volverá", ["vuelve", ROJO], "Sígueme", "más", ["dejo", ROJO], "estrategia", "excusas", "pequeña", ["grande", ROJO], "tú", "envíaselo"]);

export const Frases: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/frases_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
