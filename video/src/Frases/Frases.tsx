// Reel de alcance "Tres frases que dice un trader justo antes de quemar la cuenta" (~26 s), en blanco y negro con toques
// puntuales de verde y rojo y el stickman 2D con física (src/Bot/stick.tsx): ante su pantalla mientras el saldo baja,
// señalando chulo «esta vez es diferente», de brazos cruzados con el reloj girando «ya volverá», el «sígueme» a mitad,
// aporreando la pantalla «solo una más» hasta 0 € y sentado en el suelo, la pérdida pequeña que crece como una bola de
// nieve y lo tumba, y la pregunta final. Tiempos en src/gen/frases.json (scripts/frases.py).
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/frases.json";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { Arriba, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { Escena, orbita, polvo } from "../Bot/tres";
import { ROJO, VERDE } from "../Bot/kit";
import { cabezaPx, Clave, Cuerpo, cuerpoEn, Estado, R_CABEZA, Stick } from "../Bot/stick";
import { Camara, PANT, Pantalla, Reloj, SaldoPantalla, Suelo, SUELO_Y } from "../Bot/plato";
import { claves, CtaSeguir, golpe, Kicker, Montaje, P, paseo, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const FRASES_FPS = datos.fps;
export const FRASES_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const OX = 330;
const S = 370;

// Bocadillo de cómic encima de la cabeza, sin pisar la pantalla de la derecha
const Bocadillo: React.FC<{ t: number; t0: number; c: Cuerpo; ox?: number; s?: number; texto: string; fin?: number }> = ({ t, t0, c, ox = OX, s = S, texto, fin }) => {
  const g = muelle(t, t0, 260, 14);
  const fuera = fin === undefined ? 0 : L(t, fin - 0.2, fin, 0, 1);
  if (g <= 0.001 || fuera >= 1) return null;
  const [hx, hy] = cabezaPx(c, ox, SUELO_Y, s);
  const medio = (texto.length * 20.4 + 64) / 2;
  const x = Math.min(Math.max(hx, medio + 30), PANT.x0 - 12 - medio);
  return (
    <div style={{ position: "absolute", left: x, top: hy - R_CABEZA * s - 26, transform: `translate(-50%, -100%) scale(${0.6 + 0.4 * Math.min(g, 1.1)})`, transformOrigin: "50% 100%", opacity: Math.min(g * 1.5, 1) * (1 - fuera) }}>
      <div style={{ position: "relative", padding: "16px 32px", borderRadius: 26, border: "3px solid #fff", background: "#000", whiteSpace: "nowrap", ...mono(34) }}>
        {texto}
        <div style={{ position: "absolute", left: `calc(50% + ${hx - x}px)`, bottom: -17, width: 28, height: 28, marginLeft: -14, background: "#000", borderRight: "3px solid #fff", borderBottom: "3px solid #fff", transform: "rotate(45deg)" }} />
      </div>
    </div>
  );
};

const Polvo: React.FC<P> = ({ t, s, e }) => <Escena cam={orbita([0, 0, 0], 9, L(t, s, e, -0.3, 0.2), 0.2, { apertura: 40 })} trazos={polvo(0.25)} />;
const FlashRojo: React.FC<{ t: number; t0: number; o?: number }> = ({ t, t0, o = 0.16 }) => {
  const k = t < t0 ? 0 : o * Math.exp(-(t - t0) * 3);
  return k > 0.005 ? <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(255,77,94,${k}))` }} /> : null;
};
const Exclama: React.FC<{ t: number; t0: number; c: Cuerpo; ox?: number; s?: number }> = ({ t, t0, c, ox = OX, s = S }) => {
  const g = t < t0 ? 0 : muelle(t, t0, 260, 12) * (1 - L(t, t0 + 0.45, t0 + 0.65, 0, 1));
  if (g < 0.01) return null;
  const [hx, hy] = cabezaPx(c, ox, SUELO_Y, s);
  return <div style={{ position: "absolute", left: hx + R_CABEZA * s + 10, top: hy - R_CABEZA * s - 110, ...mono(120), fontWeight: 700, transform: `scale(${g}) rotate(12deg)`, transformOrigin: "50% 100%" }}>!</div>;
};
const cam = (t: number, s: number, e: number, t0 = -9) => ({ zoom: L(t, s, e, 1, 1.05) + 0.04 * golpe(t, t0), dx: sacude(t, t0, 0.04) * 420 });

// Poses que se repiten
const CHOQUE: Partial<Cuerpo> = { ojos: 1.45, cejas: 1, abre: 0.85, boca: 0, mIx: -0.32, mIy: -0.3, mDx: 0.32, mDy: -0.3 };
const MANOS_CABEZA: Partial<Cuerpo> = { mIx: -0.17, mIy: 0.27, mDx: 0.17, mDy: 0.27, cejas: -1, boca: -1, abre: 0.4, agobio: 1, incl: 0, ojos: 1.1 };
const HUNDIDO: Partial<Cuerpo> = { y: 0.73, agacha: 0.5, boca: -1, abre: 0, cejas: -1, ojos: 0.75, mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52, incl: 0 };
const ENCOGE: Partial<Cuerpo> = { mIx: -0.42, mIy: -0.08, mDx: 0.42, mDy: -0.08, cejas: 0.8, boca: -0.3, cabeza: 0.14 };
const sentado = (x: number): Partial<Cuerpo> => ({ x, y: 0.2, pIx: x - 0.48, pDx: x + 0.48, agacha: 1, mIx: -0.36, mIy: -0.27, mDx: 0.36, mDy: -0.27, abre: 0, boca: -1, ojos: 0.6, agobio: 0.5, mira: 0, incl: 0 });

// ------------------------------------------------------------------ 1. Hook: tres frases antes de quemar la cuenta
const BAJA = [...paseo(25, 12, 0.5, -0.2)];
BAJA.push(BAJA[BAJA.length - 1] - 2.6);
const HOOK: Clave[] = [
  [EV.quemar - 0.4, { incl: 0.1, x: 0.05, ojos: 1.15, cejas: -0.5, boca: -0.3, mDx: 0.3, mDy: -0.3 }],
  [EV.duele - 0.12, { ...CHOQUE, incl: -0.07, x: -0.03 }],
  [EV.duele + 0.3, { ...MANOS_CABEZA, mira: 0.4 }],
  [EV.duele + 0.55, { cabeza: 0.12 }],
  [EV.duele + 0.7, { cabeza: -0.12 }],
  [EV.duele + 0.85, { cabeza: 0 }],
];
const Hook: React.FC<P> = (p) => {
  const { t, s, e } = p;
  const c = cuerpoEn(t, HOOK, { incl: 0.05, mira: 0.8, mDx: 0.06, mDy: 0.13, boca: 0.1 });
  const saldo = Math.round(L(t, 0, EV.duele, 10000, 6240, (u) => u * u));
  return (
    <>
      <Polvo {...p} />
      <Camara {...cam(t, s, e, EV.duele - 0.05)}>
        <Suelo />
        <Pantalla serie={BAJA} n={Math.round(L(t, -0.4, EV.duele, 8, BAJA.length))} ultima={ROJO} k={L(t, EV.duele - 0.2, EV.duele, 0, 1)} />
        <SaldoPantalla valor={saldo} k={golpe(t, EV.duele - 0.05)} />
        <Stick c={c} ox={OX} oy={SUELO_Y} s={S} t={t} />
        <Exclama t={t} t0={EV.duele - 0.05} c={c} />
      </Camara>
      <FlashRojo t={t} t0={EV.duele - 0.05} />
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
const SUBE_BAJA = [...paseo(14, 3, 0.4, 0.18), ...paseo(12, 5, 0.4, -0.5).map((v) => v + 2.4)];
const s1 = datos.escenas.find((x) => x.id === "una")!.s;
const UNA: Clave[] = [
  [s1 - 0.1, { mDx: 0.56, mDy: 0.08, mIx: -0.13, mIy: -0.42, boca: 0.9, cejas: 0.6, ojos: 0.85, incl: 0.06, x: 0.03 }],
  [EV.diferente + 0.35, { ojos: 1.4, cejas: 1, abre: 0.7, boca: 0, mDx: 0.3, mDy: -0.2, incl: -0.04 }],
  [EV.diferente + 0.75, HUNDIDO],
];
const Una: React.FC<P> = (p) => {
  const { t, s, e } = p;
  const c = cuerpoEn(t, UNA, { incl: 0.04, mira: 0.8, boca: 0.5, cejas: 0.4 }, s - 0.3);
  const n = Math.round(L(t, s, EV.diferente + 0.4, 13, SUBE_BAJA.length, (u) => u));
  const verde = L(t, s, s + 0.2, 0, 1) * (1 - L(t, EV.diferente + 0.1, EV.diferente + 0.3, 0, 1));
  return (
    <>
      <Polvo {...p} />
      <Camara {...cam(t, s, e, EV.diferente + 0.35)}>
        <Suelo />
        <Pantalla serie={SUBE_BAJA} n={n} ultima={ROJO} k={L(t, EV.diferente + 0.2, EV.diferente + 0.4, 0, 1)} />
        <div style={{ position: "absolute", left: PANT.x0, width: PANT.x1 - PANT.x0, top: PANT.y0 - 100, display: "flex", justifyContent: "center", opacity: verde, ...mono(64), color: VERDE }}>+12 %</div>
        <Stick c={c} ox={OX} oy={SUELO_Y} s={S} t={t} />
        <Bocadillo t={t} t0={s + 0.05} c={c} texto="«ESTA VEZ ES DIFERENTE»" fin={EV.diferente + 0.4} />
        <Exclama t={t} t0={EV.diferente + 0.35} c={c} />
      </Camara>
      <FlashRojo t={t} t0={EV.diferente + 0.35} o={0.12} />
      <Kicker t={t} t0={s + 0.02} texto="FRASE 1" />
      <Arriba>
        <Titular t={t} t0={s + 0.05} texto="esta vez es *diferente*" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: «ya volverá»… y no vuelve
const ESPERA = [...paseo(10, 9, 0.3, -0.1), ...paseo(16, 4, 0.35, -0.35).map((v) => v - 1.0)];
const s2 = datos.escenas.find((x) => x.id === "dos")!.s;
const DOS: Clave[] = [
  [s2 - 0.1, { mIx: 0.13, mIy: -0.17, mDx: -0.13, mDy: -0.17, boca: -0.1, cejas: 0.3, ojos: 0.85, incl: -0.03, x: -0.02 }],
  [EV.vuelve - 0.1, { ...CHOQUE, abre: 0.6 }],
  [EV.vuelve + 0.3, HUNDIDO],
];
const Dos: React.FC<P> = (p) => {
  const { t, s, e } = p;
  const base = cuerpoEn(t, DOS, { mira: 0.8, incl: -0.02 }, s - 0.3);
  // Tamborilea con el pie mientras espera
  const c: Estado = t < EV.vuelve - 0.1 ? { ...base, pDy: base.pDy + 0.035 * Math.max(0, Math.sin((t - s) * 11)) } : base;
  const saldo = Math.round(L(t, s, e, 6240, 3900, (u) => u * u));
  return (
    <>
      <Polvo {...p} />
      <Camara {...cam(t, s, e, EV.vuelve - 0.05)}>
        <Suelo />
        <Pantalla serie={ESPERA} n={Math.round(L(t, s, e, 10, ESPERA.length, (u) => u))} ultima={ROJO} k={L(t, EV.vuelve - 0.2, EV.vuelve, 0, 1)} />
        <Reloj x={PANT.x1 - 56} y={PANT.y0 + 68} r={30} t={t - s} />
        <SaldoPantalla valor={saldo} k={golpe(t, EV.vuelve - 0.05)} />
        <Stick c={c} ox={OX} oy={SUELO_Y} s={S} t={t} />
        <Bocadillo t={t} t0={s + 0.05} c={c} texto="«YA VOLVERÁ»" fin={EV.vuelve - 0.1} />
      </Camara>
      <FlashRojo t={t} t0={EV.vuelve - 0.05} o={0.12} />
      <Kicker t={t} t0={s + 0.02} texto="FRASE 2" />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.vuelve - 0.4} texto="ya *volverá*" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.vuelve - 0.35} texto="y no *vuelve*" size={116} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme a mitad: el stickman señala el botón y salta al pulsarse
const sS = datos.escenas.find((x) => x.id === "sigueme")!.s;
const SIGUE: Clave[] = [
  [sS - 0.05, { mDx: 0.5, mDy: 0.4, mira: 0.6, boca: 0.6, cejas: 0.5, incl: 0.05 }],
  [sS + 0.5, { y: 0.6, mDx: 0.3, mDy: -0.3, mIx: -0.3, mIy: -0.3, incl: 0 }],
  [sS + 0.68, { y: 0.95, mIx: -0.27, mIy: 0.48, mDx: 0.27, mDy: 0.48, boca: 1, abre: 0.7, ojos: 1.2 }],
  [sS + 0.74, { pIy: 0.28, pDy: 0.28 }],
  [sS + 0.92, { pIy: 0, pDy: 0, y: 0.79 }],
];
const Sigueme: React.FC<P> = (p) => {
  const { t, s } = p;
  const c = cuerpoEn(t, SIGUE, {}, s - 0.3);
  return (
    <>
      <CtaSeguir {...p} lema="SI ALGUNA TE SUENA" />
      <Suelo />
      <Stick c={c} ox={250} oy={SUELO_Y} s={330} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 5. Tres: «solo una más para recuperar… y lo dejo»
const s3 = datos.escenas.find((x) => x.id === "tres")!.s;
const CAE = BAJA.map((v, i) => v - i * 0.05);
const TRES: Clave[] = [
  [s3 - 0.1, { mDx: 0.45, mDy: -0.05, mIx: -0.2, mIy: -0.35, ojos: 1.2, cejas: -0.6 }],
  [EV.recuperar, { agobio: 0.9 }],
  [EV.dejo - 0.12, { ...CHOQUE, incl: -0.07, x: 0.15 }],
  [EV.dejo + 0.25, sentado(0.15)],
];
const Tres: React.FC<P> = (p) => {
  const { t, s, e } = p;
  const base = cuerpoEn(t, TRES, { x: 0.22, pIx: 0.08, pDx: 0.36, incl: 0.08, mira: 0.9, cejas: -0.3, boca: -0.2 }, s - 0.3);
  // Aporrea la pantalla: el brazo derecho va y viene
  const clic = t < EV.dejo - 0.15 ? Math.abs(Math.sin((t - s) * 14)) : 0;
  const c: Estado = { ...base, mDx: base.mDx + 0.12 * clic, mDy: base.mDy + 0.04 * clic };
  const pasos = Math.min(4, Math.floor(L(t, EV.solo, EV.dejo - 0.2, 0, 4)));
  const lote = [1, 2, 4, 8, 16][pasos];
  const saldo = t < EV.dejo - 0.1 ? Math.round(3900 - pasos * 900) : 0;
  const k = golpe(t, EV.dejo - 0.05);
  return (
    <>
      <Polvo {...p} />
      <Camara {...cam(t, s, e, EV.dejo - 0.05)}>
        <Suelo />
        <Pantalla serie={CAE} ultima={ROJO} k={L(t, EV.dejo - 0.2, EV.dejo, 0, 1)} />
        <div style={{ position: "absolute", left: (PANT.x0 + PANT.x1) / 2, top: PANT.y0 + 110, transform: `translate(-50%, -50%) scale(${1 + 0.2 * golpe(t, EV.solo + pasos * 0.5)})`, opacity: L(t, EV.solo - 0.2, EV.solo, 0, 1) * (1 - L(t, EV.dejo - 0.2, EV.dejo, 0, 1)), padding: "6px 18px", background: "#000", border: "2px solid #fff", borderRadius: 12, ...mono(48) }}>{`LOTE ×${lote}`}</div>
        <SaldoPantalla valor={saldo} k={k} />
        <Stick c={c} ox={OX} oy={SUELO_Y} s={S} t={t} />
        <Bocadillo t={t} t0={EV.solo - 0.1} c={c} texto="«SOLO UNA MÁS…»" fin={EV.dejo - 0.1} />
        <Exclama t={t} t0={EV.dejo - 0.05} c={c} />
      </Camara>
      <FlashRojo t={t} t0={EV.dejo - 0.05} o={0.2} />
      <Kicker t={t} t0={s + 0.02} texto="FRASE 3" />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.dejo - 0.45} texto="solo *una más*" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.dejo - 0.4} texto="…y lo *dejo*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: excusas; la pérdida pequeña rueda como una bola de nieve y lo tumba
const sG = datos.escenas.find((x) => x.id === "giro")!.s;
const GIRO: Clave[] = [
  [sG + 0.1, ENCOGE],
  [EV.excusas - 0.1, { cabeza: -0.1 }],
  [EV.pequena - 0.4, { mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52, cabeza: 0, mira: 0.9, ojos: 1.1, cejas: 0, boca: 0 }],
  [EV.grande - 0.5, { ojos: 1.45, cejas: 1, abre: 0.85, incl: -0.08, mIx: 0.12, mIy: 0.05, mDx: 0.38, mDy: 0.05 }],
  [EV.grande + 0.02, { ...sentado(-0.2), pIx: -0.68, pDx: 0.25, agacha: 0.4, incl: -0.12, mIx: -0.45, mIy: -0.35, mDx: 0.42, mDy: -0.3, abre: 0.55, cejas: -1, agobio: 1, ojos: 1.1, mira: 0.8 }],
];
const Giro: React.FC<P> = (p) => {
  const { t, s, e } = p;
  const c = cuerpoEn(t, GIRO, { mira: 0.3 }, s - 0.3);
  const lista = t < EV.excusas - 0.1;
  const crece = L(t, EV.excusas, EV.grande, 0, 1, (u) => u * u);
  const r = 16 + 250 * crece;
  const bx = 960 - 230 * crece;
  const by = SUELO_Y - r;
  const giro = -(960 - bx) / Math.max(r, 40) - (t - EV.excusas) * 0.8;
  const valor = Math.round(50 + 4950 * crece);
  const tachas = ["ESTA VEZ ES DIFERENTE", "YA VOLVERÁ", "SOLO UNA MÁS"];
  const golpeG = EV.grande - 0.02;
  return (
    <>
      <Polvo {...p} />
      <Camara {...cam(t, s, e, golpeG)}>
        <Suelo />
        {!lista && (
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <ellipse cx={bx} cy={SUELO_Y + 6} rx={r * 0.9} ry={r * 0.12 + 4} fill={ROJO} opacity={0.12} />
            <circle cx={bx} cy={by} r={r} fill={ROJO} fillOpacity={0.14 + 0.1 * golpe(t, golpeG)} stroke={ROJO} strokeWidth={3} />
            {[0, 1, 2].map((i) => {
              const a = giro + (i * Math.PI) / 3;
              return <path key={i} d={`M${bx + Math.cos(a) * r},${by + Math.sin(a) * r} Q${bx + Math.cos(a + 1.2) * r * 0.25},${by + Math.sin(a + 1.2) * r * 0.25} ${bx - Math.cos(a) * r},${by - Math.sin(a) * r}`} fill="none" stroke={ROJO} strokeWidth={2.2} opacity={0.55} />;
            })}
          </svg>
        )}
        <Stick c={c} ox={300} oy={SUELO_Y} s={S} t={t} />
        {!lista && <div style={{ position: "absolute", left: Math.min(bx, 860), top: by - r - 30, transform: "translate(-50%, -100%)", ...mono(40 + 30 * crece), color: ROJO, opacity: 0.92 }}>{`−${euros(valor)} €`}</div>}
      </Camara>
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
      <FlashRojo t={t} t0={golpeG} o={0.14} />
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
const sP = datos.escenas.find((x) => x.id === "pregunta")!.s;
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
