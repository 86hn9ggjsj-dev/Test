// Reel de alcance "¿Ganar un 1 % al día? Parece poco" (~23 s): +1 % gigante desde el primer fotograma, la curva del
// interés compuesto que se dispara (1.000 € → 37.783 € → 1.427.588 €), nadie lo consigue, señal de estafa y CTA.
// Tiempos en src/gen/unodiario.json (scripts/unodiario.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/unodiario.json";
import { ANCHO, SANS } from "../Viral/util";
import { Arriba, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { clave, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { claves, CtaSeguir, Gigante, Montaje, P } from "../Explica/Montaje";

export const UNODIARIO_FPS = datos.fps;
export const UNODIARIO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const fondo = (t: number, s: number, e: number) => <Escena cam={orbita([0, 0, 0], 9, L(t, s, e, -0.2, 0.2), 0.2, { apertura: 40 })} trazos={polvo(0.35)} />;
const saldo = (dias: number) => 1000 * Math.pow(1.01, dias);

// ------------------------------------------------------------------ 1. Hook: +1 % al día
const Hook: React.FC<P> = ({ t, s, e }) => (
  <>
    {fondo(t, s, e)}
    <Gigante t={t} t0={-0.45} texto="+1 %" top={600} size={280} pie="AL DÍA" />
    <Arriba>
      <Titular t={t} t0={-0.6} fin={EV.poco - 0.35} texto="¿un *1 %* al día?" size={104} />
    </Arriba>
    <Arriba>
      <Titular t={t} t0={EV.poco - 0.3} texto="parece *poco*" size={110} />
    </Arriba>
  </>
);

// ------------------------------------------------------------------ 2. Cuenta: la curva del interés compuesto
const Cuenta: React.FC<P> = ({ t, s, e }) => {
  const dias = clave(t, [[s + 0.2, 0], [EV.treintayocho, 365], [EV.dos, 365], [EV.millon + 0.2, 730]], (u) => u);
  const anchoDias = clave(t, [[EV.dos - 0.1, 365], [EV.dos + 0.5, 730]]);
  const tope = clave(t, [[EV.dos, saldo(365)], [EV.millon + 0.2, saldo(730)]]);
  const cam = orbita([0, 0, 0], L(t, s, e, 7.4, 7.0), L(t, s, e, -0.28, -0.08), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 860 });
  const tr: Trazo[] = [...polvo(0.3)];
  const X = (d: number) => -1.1 + (2.2 * d) / anchoDias;
  const Y = (v: number) => -0.9 + 1.9 * Math.min(v / tope, 1.15);
  tr.push({ t: "l", a: [-1.15, -0.9, 0], b: [1.15, -0.9, 0], w: 1.2, o: 0.5 });
  const pts: V3[] = [];
  for (let d = 0; d <= dias; d += 5) pts.push([X(d), Y(saldo(d)), 0]);
  pts.push([X(dias), Y(saldo(dias)), 0]);
  if (pts.length > 1) tr.push({ t: "p", pts, w: 2.8, o: 1, luz: 0.45 });
  const cabeza: V3 = [X(dias), Y(saldo(dias)), 0];
  tr.push({ t: "e", c: cabeza, r: 0.045, tipo: "punto", o: 1, luz: 1 });
  const pr = proyector(cam);
  const anio = pr([X(365), -0.9, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: anio.x, top: anio.y + 20, transform: "translateX(-50%)", ...mono(24, 0.6), opacity: anchoDias > 400 ? 1 : 0 }}>1 AÑO</div>
      <div style={{ position: "absolute", top: 1290, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 18, alignItems: "baseline" }}>
        <span style={mono(80)}>{`${euros(saldo(dias))} €`}</span>
        <span style={mono(26, 0.6)}>{dias > 366 ? "AÑO 2" : "AÑO 1"}</span>
      </div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.dos - 0.3} texto="1.000 € → *38.000 €*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.dos - 0.25} texto="→ *1,4 millones*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Giro: nadie lo consigue
const Giro: React.FC<P> = ({ t, s, e }) => (
  <>
    {fondo(t, s, e)}
    <Gigante t={t} t0={s + 0.05} texto="+1 % AL DÍA" top={640} size={118} tacha={EV.nadie + 0.25} pie={t >= EV.fondos - 0.1 ? "NI LOS MEJORES FONDOS DEL MUNDO" : undefined} />
    <Arriba>
      <Titular t={t} t0={s + 0.1} texto="*nadie* lo consigue" size={100} />
    </Arriba>
  </>
);

// ------------------------------------------------------------------ 4. Lección: si te lo prometen, es una señal de estafa
const Leccion: React.FC<P> = ({ t, s, e }) => {
  const sello = muelle(t, EV.sabes - 0.1, 240, 13);
  return (
    <>
      {fondo(t, s, e)}
      <Gigante t={t} t0={EV.promete - 0.1} texto="1 % DIARIO" top={620} size={130} />
      {sello > 0.001 && (
        <div style={{ position: "absolute", top: 900, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              padding: "14px 34px",
              border: "5px solid #fff",
              borderRadius: 14,
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 64,
              letterSpacing: "0.06em",
              color: "#fff",
              opacity: Math.min(sello * 1.5, 1),
              transform: `rotate(-7deg) scale(${1.6 - 0.6 * Math.min(sello, 1.05)})`,
            }}
          >
            SEÑAL DE ESTAFA
          </div>
        </div>
      )}
      <Arriba>
        <Titular t={t} t0={s + 0.1} texto="si te lo *prometen*…" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. CTA
const Cta: React.FC<P> = (p) => <CtaSeguir {...p} lema="MÁS CUENTAS QUE NADIE TE HACE" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, cuenta: Cuenta, giro: Giro, leccion: Leccion, cta: Cta };
export const CLAVES = claves(["1%", "poco", "38.000", "millón", "nadie", "fondos", "promete", "sabes", "sígueme"]);

export const Unodiario: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/unodiario_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
