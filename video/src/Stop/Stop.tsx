// Reel "Deja de mover el stop": consejo de trading en ~37 s. Gráfico con su entrada y su stop, un cursor que lo
// arrastra, la pérdida que se estira, la balanza del cerebro y la regla del stop que solo sube. Tiempos en src/gen/stop.json.
import { useCurrentFrame } from "remotion";
import datos from "../gen/stop.json";
import { salida } from "../Premium/ui";
import { Arriba, Etiqueta, L, mono, muelle, Titular } from "../Bot/piezas";
import { circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { Abajo, claves, cuando, escala, Kicker, Montaje, P, paseo } from "../Explica/Montaje";
import { Promo } from "../Explica/Promo";

export const STOP_FPS = datos.fps;
export const STOP_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const en = cuando(datos);

const X0 = -1.15;
const X1 = 1.05;
const ENT = 0.45;
const U = 0.25; // altura de un 1 % de pérdida
const pct = (y: number) => `−${Math.max(1, Math.round((ENT - y) / U))} %`;
const MIRA: V3 = [-0.05, 0.1, 0];

// Cursor de ratón (flecha) en coordenadas de pantalla
const Cursor: React.FC<{ x: number; y: number; o: number; pulsa: number }> = ({ x, y, o, pulsa }) =>
  o > 0.01 ? (
    <g transform={`translate(${x} ${y}) scale(${1.5 * (1 - 0.12 * pulsa)})`} opacity={o}>
      <path d="M0,0 L0,34 L9,26 L15,40 L21,37 L15,24 L27,24 Z" fill="#fff" stroke="#000" strokeWidth={2} strokeLinejoin="round" />
    </g>
  ) : null;

// Línea horizontal del gráfico (entrada, stop u objetivo)
const nivel = (tr: Trazo[], y: number, o: number, dash?: string, luz = 0) => tr.push({ t: "l", a: [X0, y, 0], b: [X1, y, 0], w: 1.6, o, dash, luz });
// Zona rayada entre dos niveles
const rayas = (tr: Trazo[], y0: number, y1: number, n: number, o = 0.3) => {
  for (let r = 0; r < n; r++) {
    const x = X0 + ((X1 - X0) * r) / 17;
    tr.push({ t: "l", a: [x, y1, 0], b: [Math.min(x + 0.2, X1), y0, 0], w: 1, o });
  }
};

// ------------------------------------------------------------------ 1. Hook: el cursor arrastra el stop hacia abajo
const PRECIO_H: V3[] = escala(paseo(26, 12, 0.2), ENT - 0.2, ENT + 0.55).map((y, i): V3 => [X0 + i * ((X1 - X0) / 25), i === 25 ? ENT + 0.02 : y, 0]);
const Hook: React.FC<P> = ({ t, s, e }) => {
  const tEsto = en("esto", s);
  const cam = orbita(MIRA, L(t, s, e, 7.6, 7.0), L(t, s, e, -0.3, -0.12), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 930 });
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "p", pts: PRECIO_H, w: 2.6, o: 1, luz: 0.35 });
  nivel(tr, ENT, 0.8);
  const arrastra = muelle(t, EV.movido - 0.05, 120, 14);
  const yStop = ENT - U - 2 * U * arrastra;
  nivel(tr, ENT - U, 0.25 * arrastra, "4 7");
  nivel(tr, yStop, 0.95, "8 9");
  rayas(tr, ENT, yStop, 18, 0.22);
  const pr = proyector(cam);
  const qS = pr([X1, yStop, 0]);
  const qE = pr([X1, ENT, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} encima={() => <Cursor x={qS.x - 30} y={qS.y - 4} o={1 - L(t, EV.aire + 0.4, EV.aire + 0.8, 0, 1)} pulsa={t > EV.movido - 0.2 && t < EV.aire + 0.3 ? 1 : 0} />} />
      <Etiqueta t={t} t0={-0.3} x={Math.min(qE.x, 1030)} y={qE.y - 26} size={24} o={0.8} alinea="der">
        ENTRADA
      </Etiqueta>
      <Etiqueta t={t} t0={-0.25} x={Math.min(qS.x, 1030) - 50} y={qS.y + 30} size={28} alinea="der">
        {`STOP ${pct(yStop)}`}
      </Etiqueta>
      <Arriba>
        <Titular t={t} t0={-0.35} fin={tEsto - 0.05} texto="¿mueves el *stop*?" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tEsto} texto="esto es para *ti*" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Situación: el precio va al stop y lo alejas
const BRUTO_S = paseo(31, 31, 0.16, -0.02);
const PRECIO_S: V3[] = BRUTO_S.map((v, i): V3 => [X0 + i * ((X1 - X0) / 30), ENT + (v * -0.7) / BRUTO_S[30], 0]);
const Situacion: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([-0.05, -0.1, 0], L(t, s, e, 7.6, 7.0), L(t, s, e, 0.3, 0.1), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 930 });
  const tr: Trazo[] = [...polvo(0.3)];
  const prog = L(t, s + 0.2, e, 0, 1, (u) => u);
  tr.push({ t: "p", pts: PRECIO_S, w: 2.6, o: 1, prog, luz: 0.35 });
  nivel(tr, ENT, 0.8);
  const aleja = muelle(t, EV.alejas - 0.05, 120, 14);
  const yStop = ENT - 2 * U - 2 * U * aleja;
  if (aleja > 0) nivel(tr, ENT - 2 * U, 0.25, "4 7");
  nivel(tr, yStop, 0.95, "8 9");
  const pr = proyector(cam);
  const qS = pr([X1, yStop, 0]);
  const qE = pr([X1, ENT, 0]);
  const cabeza = PRECIO_S[Math.min(30, Math.round(prog * 30))];
  const qC = pr(cabeza);
  const piensa = muelle(t, EV.vuelta - 0.4, 200, 15);
  return (
    <>
      <Escena
        cam={cam}
        trazos={[...tr, { t: "e", c: cabeza, r: 0.04, tipo: "punto", o: prog > 0 ? 1 : 0, luz: 1 }]}
        encima={() => <Cursor x={qS.x - 30} y={qS.y - 4} o={L(t, EV.alejas - 0.6, EV.alejas - 0.3, 0, 1) * (1 - L(t, EV.alejas + 0.6, EV.alejas + 0.9, 0, 1))} pulsa={t > EV.alejas - 0.2 && t < EV.alejas + 0.5 ? 1 : 0} />}
      />
      <Etiqueta t={t} t0={s + 0.2} x={Math.min(qE.x, 1030)} y={qE.y - 26} size={24} o={0.8} alinea="der">
        ENTRADA
      </Etiqueta>
      <Etiqueta t={t} t0={s + 0.25} x={Math.min(qS.x, 1030) - 50} y={qS.y + 30} size={28} alinea="der">
        {`STOP ${pct(yStop)}`}
      </Etiqueta>
      {piensa > 0.001 && (
        <div style={{ position: "absolute", left: Math.min(qC.x - 40, 540), top: qC.y - 150, opacity: Math.min(piensa * 1.5, 1), transform: `scale(${0.8 + 0.2 * Math.min(piensa, 1.1)})`, transformOrigin: "left bottom" }}>
          <div style={{ ...mono(28), padding: "14px 22px", borderRadius: 999, border: "2px dashed rgba(255,255,255,0.8)", background: "rgba(0,0,0,0.6)" }}>¿YA SE DARÁ LA VUELTA?</div>
        </div>
      )}
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.alejas - 0.3} texto="ya se dará la *vuelta*" size={86} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.alejas - 0.25} texto="y lo *alejas*" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Consecuencia: la pérdida pequeña se hace grande… y se repite
const Consecuencia: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([-0.05, 0, 0], L(t, s, e, 7.6, 7.0), L(t, s, e, -0.3, -0.08), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 860 });
  const tr: Trazo[] = [...polvo(0.3)];
  nivel(tr, ENT, 0.85);
  const crece = muelle(t, EV.grande - 0.3, 110, 13);
  const yStop = ENT - U - 3 * U * crece;
  nivel(tr, yStop, 0.95, "8 9", 0.3 * crece);
  rayas(tr, ENT, yStop, Math.round(18 * L(t, s + 0.2, s + 0.7, 0, 1, salida)), 0.3);
  const pr = proyector(cam);
  const qS = pr([X1, yStop, 0]);
  const qZ = pr([(X0 + X1) / 2, (ENT + yStop) / 2, 0]);
  const otra = muelle(t, EV.vuelves - 0.1, 200, 14);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={s + 0.3} x={qZ.x} y={qZ.y} size={56} alinea="centro">
        {pct(yStop)}
      </Etiqueta>
      <Etiqueta t={t} t0={s + 0.3} x={Math.min(qS.x, 1030)} y={qS.y + 30} size={24} o={0.8} alinea="der">
        STOP
      </Etiqueta>
      <Abajo o={Math.min(otra * 1.5, 1)}>
        <span style={{ ...mono(52), display: "inline-block", transform: `rotate(${(1 - Math.min(otra, 1)) * -180}deg)` }}>↻</span>
        <span style={mono(40)}>Y OTRA VEZ</span>
      </Abajo>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.siguiente - 0.3} texto="de pequeña a *grande*" size={88} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.siguiente - 0.25} texto="y lo *repites*" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Cerebro: perder duele el doble que ganar
const Cerebro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 7.2, 6.6), L(t, s, e, 0.3, -0.2), L(t, s, e, 0.14, 0.24), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  const th = 0.24 * muelle(t, EV.doble - 0.25, 90, 9);
  const pivote: V3 = [0, 0.55, 0];
  // El plato de perder (izquierda) baja: pesa más
  const brazo = (lado: number): V3 => [lado * 0.8 * Math.cos(th), pivote[1] + lado * 0.8 * Math.sin(th), 0];
  const k = muelle(t, s + 0.1, 150, 16);
  tr.push({ t: "l", a: [0, -1.2, 0], b: [0, -1.2 + 1.75 * k, 0], w: 2, o: 0.9 });
  tr.push({ t: "p", pts: [[-0.5, -1.2, 0.3], [0.5, -1.2, 0.3], [0.5, -1.2, -0.3], [-0.5, -1.2, -0.3], [-0.5, -1.2, 0.3]], w: 1.4, o: 0.7 });
  const platos: V3[] = [];
  if (k > 0.6) {
    tr.push({ t: "l", a: brazo(-1), b: brazo(1), w: 2.4, o: 1 });
    for (const lado of [-1, 1]) {
      const ext = brazo(lado);
      const plato: V3 = [ext[0], ext[1] - 0.7, 0];
      platos.push(plato);
      tr.push({ t: "l", a: ext, b: [plato[0] - 0.25, plato[1], 0], w: 1, o: 0.6 });
      tr.push({ t: "l", a: ext, b: [plato[0] + 0.25, plato[1], 0], w: 1, o: 0.6 });
      tr.push({ t: "p", pts: circulo(plato, 0.28, "y", 40), w: 1.6, o: lado < 0 ? 1 : 0.6, luz: lado < 0 ? 0.3 * Math.min(th / 0.24, 1) : 0 });
    }
    tr.push({ t: "p", pts: circulo(pivote, 0.06, "z", 20), w: 2, o: 1 });
  }
  const pr = proyector(cam);
  const q = (lado: number) => pr([brazo(lado)[0], brazo(lado)[1] - 0.95, 0]);
  const doble = muelle(t, EV.doble - 0.05, 200, 14);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {platos.length > 0 && (
        <>
          <Etiqueta t={t} t0={s + 0.5} x={q(-1).x} y={q(-1).y} size={28} alinea="centro">
            PERDER 100 €
          </Etiqueta>
          <Etiqueta t={t} t0={s + 0.6} x={q(1).x} y={q(1).y} size={28} o={0.7} alinea="centro">
            GANAR 100 €
          </Etiqueta>
        </>
      )}
      <Abajo o={Math.min(doble * 1.5, 1)}>
        <span style={mono(56)}>×2</span>
        <span style={mono(24, 0.55)}>DUELE EL DOBLE</span>
      </Abajo>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.cerebro - 0.3} texto="no es tu *análisis*" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cerebro - 0.25} texto="es tu *cerebro*" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Regla: el stop antes de entrar y solo a favor
const SUBIDA: V3[] = escala(paseo(25, 57, 0.12, 0.04), ENT, ENT + 0.95).map((y, i): V3 => [-0.6 + i * (1.6 / 24), i === 0 ? ENT : y, 0]);
const Regla: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([-0.05, 0.3, 0], L(t, s, e, 7.6, 7.0), L(t, s, e, 0.3, 0.08), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 930 });
  const tr: Trazo[] = [...polvo(0.3)];
  const vStop = L(t, s + 0.2, s + 0.6, 0, 1, salida);
  const vEnt = L(t, EV.antes + 0.3, EV.antes + 0.7, 0, 1, salida);
  const sube = [EV.favor - 0.3, EV.favor + 0.2].reduce((a, t0) => a + Math.min(muelle(t, t0, 160, 15), 1.05), 0);
  const yStop = ENT - 2 * U + 0.3 * sube;
  if (vEnt > 0) nivel(tr, ENT, 0.8 * vEnt);
  nivel(tr, yStop, 0.95 * vStop, "8 9", 0.3 * Math.min(sube, 1));
  if (sube > 0) nivel(tr, ENT - 2 * U, 0.2, "4 7");
  tr.push({ t: "p", pts: SUBIDA, w: 2.6, o: 1, prog: L(t, EV.antes + 0.6, EV.favor + 0.5, 0, 1, salida), luz: 0.35 });
  const pr = proyector(cam);
  const qS = pr([X1, yStop, 0]);
  const qE = pr([X0, ENT, 0]);
  const nunca = muelle(t, EV.nunca - 0.05, 200, 14);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={s + 0.3} x={Math.min(qS.x, 1030)} y={qS.y + 30} size={26} alinea="der">
        {sube > 0.5 ? `STOP ↑${sube > 1.5 ? "↑" : ""}` : "1 · STOP"}
      </Etiqueta>
      <Etiqueta t={t} t0={EV.antes + 0.4} x={Math.max(qE.x, 60)} y={qE.y - 26} size={24} o={0.8}>
        2 · ENTRADA
      </Etiqueta>
      <Abajo o={t >= EV.favor - 0.2 && t < EV.nunca - 0.1 ? 1 : 0}>
        <span style={mono(48)}>↑ SOLO A FAVOR</span>
      </Abajo>
      <Abajo o={Math.min(nunca * 1.5, 1)}>
        <span style={mono(48)}>↓ ✕ NUNCA EN CONTRA</span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="LA REGLA" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.favor - 0.3} texto="*antes* de entrar" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.favor - 0.25} texto="solo a *favor*" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Promo
const Cta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.3, 0.2), 0.2, { apertura: 40 });
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <Promo t={t} t0={s} tAuditada={EV.auditada} tLink={EV.bio} tSigue={EV.sigueme} />
      <Kicker t={t} t0={s + 0.05} texto="LINK EN LA BIO" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.auditada - 0.35} texto="sin *trampas*" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.auditada - 0.3} fin={EV.sigueme - 0.3} texto="cuenta *auditada*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.sigueme - 0.25} texto="*sígueme*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ composición
const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, situacion: Situacion, consecuencia: Consecuencia, cerebro: Cerebro, regla: Regla, cta: Cta };
const CLAVES = claves(["stop", "aire", "vuelta", "alejas", "grande", "cerebro", "doble", "antes", "favor", "nunca", "trampas", "auditada", "bio", "sígueme"]);

export const Stop: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/stop_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
