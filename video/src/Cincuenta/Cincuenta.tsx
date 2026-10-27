// Reel de alcance "Pierdes un 50 %" (~25 s): cifras gigantes en el centro desde el primer fotograma, una sola idea
// y final en seco para que se repita. Sin promo hablada. Tiempos en src/gen/cincuenta.json (scripts/cincuenta.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/cincuenta.json";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { Arriba, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, Escena, orbita, polvo, proyector, Trazo } from "../Bot/tres";
import { claves, cuando, Montaje, P } from "../Explica/Montaje";

export const CINCUENTA_FPS = datos.fps;
export const CINCUENTA_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const en = cuando(datos);

// Cifra gigante en el centro, con su pie
const Gigante: React.FC<{ t: number; t0: number; fin?: number; texto: string; pie?: string; top?: number; size?: number; tacha?: number }> = ({ t, t0, fin, texto, pie, top = 760, size = 230, tacha }) => {
  const g = muelle(t, t0, 210, 14);
  const fuera = fin === undefined ? 0 : L(t, fin - 0.2, fin, 0, 1);
  if (g <= 0.001 || fuera >= 1) return null;
  const raya = tacha === undefined ? 0 : L(t, tacha, tacha + 0.3, 0, 1, salida);
  return (
    <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: Math.min(g * 1.5, 1) * (1 - fuera) * (1 - 0.55 * raya) }}>
      <div style={{ position: "relative", ...mono(size), letterSpacing: "-0.03em", transform: `scale(${0.75 + 0.25 * Math.min(g, 1.1)})` }}>
        {texto}
        <div style={{ position: "absolute", left: -20, top: "52%", height: 10, width: `calc(${raya * 100}% + ${raya * 40}px)`, background: "#fff" }} />
      </div>
      {pie && <span style={mono(30, 0.6)}>{pie}</span>}
    </div>
  );
};

// ------------------------------------------------------------------ 1. Hook: −50 % gigante desde el primer fotograma
const Hook: React.FC<P> = ({ t, s, e }) => {
  const tCuanto = en("cuánto", s);
  const cam = orbita([0, -0.6, 0], L(t, s, e, 7.4, 6.8), L(t, s, e, -0.3, -0.1), 0.18, { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  // La cuenta: una barra que se parte por la mitad
  const parte = L(t, 0.15, 0.9, 0, 1, salida);
  for (const [a, b] of caja([-1.0, -1.45, -0.12], [0, -1.25, 0.12])) tr.push({ t: "l", a, b, w: 1.6, o: 1 });
  const cae = parte * parte * 0.35;
  for (const [a, b] of caja([0.05 + 0.15 * parte, -1.45 - cae, -0.12], [1.05 + 0.15 * parte, -1.25 - cae, 0.12])) tr.push({ t: "l", a, b, w: 1.4, o: 0.9 * (1 - parte), dash: "5 7" });
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Gigante t={t} t0={-0.4} texto="−50 %" pie="DE TU CUENTA" />
      <Arriba>
        <Titular t={t} t0={-0.35} fin={tCuanto - 0.05} texto="pierdes la *mitad*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tCuanto} texto="¿cuánto para *recuperarte*?" size={74} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Respuesta: no es un 50 %, es un 100 %
const Respuesta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.2, 0.2), 0.2, { apertura: 40 });
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <Gigante t={t} t0={s + 0.05} fin={EV.cien - 0.15} texto="+50 %" tacha={EV.no + 0.3} />
      <Gigante t={t} t0={EV.cien - 0.1} texto="+100 %" size={250} pie="PARA VOLVER A DONDE ESTABAS" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.cien - 0.3} texto="no es un *50 %*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cien - 0.25} texto="es un *100 %*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Ejemplo: 1.000 € → 500 € → hay que duplicar
const Ejemplo: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 7.6, 7.0), L(t, s, e, 0.3, 0.1), L(t, s, e, 0.2, 0.28), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  const dup = L(t, EV.duplicarse - 0.2, EV.duplicarse + 0.4, 0, 1, salida);
  for (let k = 0; k < 10; k++) {
    const col = k % 5;
    const fila = Math.floor(k / 5);
    const x = -0.84 + col * 0.42;
    const y = 0.15 - fila * 0.45;
    const g = muelle(t, s + 0.1 + k * 0.04, 200, 15);
    if (g <= 0) continue;
    const pierde = fila === 1;
    const cae = pierde ? L(t, EV.quedan - 0.2 + col * 0.06, EV.quedan + 0.5 + col * 0.06, 0, 1, (u) => u * u) : 0;
    const yy = y - cae * 1.4;
    const vuelve = pierde ? dup : 0;
    const o = pierde ? Math.max((1 - cae) * 0.9, 0.5 * vuelve) : 1;
    const yFinal = pierde && vuelve > 0 ? y : yy;
    for (const [a, b] of caja([x - 0.15, yFinal - 0.15, -0.15], [x + 0.15, yFinal + 0.15, 0.15])) {
      tr.push({ t: "l", a, b, w: 1.4, o: o * Math.min(g * 1.5, 1), dash: pierde && vuelve > 0 ? "5 7" : undefined, luz: !pierde && dup > 0 ? 0.3 * dup : 0 });
    }
  }
  const pr = proyector(cam);
  const centro = pr([0, -0.1, 0.18]);
  const saldo = t < EV.quedan ? "1.000 €" : "500 €";
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: centro.x, top: centro.y + 260, transform: "translateX(-50%)", display: "flex", gap: 24, alignItems: "baseline" }}>
        <span style={mono(72)}>{saldo}</span>
        <span style={{ ...mono(72), opacity: dup }}>×2</span>
      </div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.duplicarse - 0.35} texto="1.000 € → *500 €*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.duplicarse - 0.3} texto="hay que *duplicar*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Escala: −90 % pide +900 %
const Escala: React.FC<P> = ({ t, s, e }) => {
  const sube = L(t, EV.novecientos - 0.5, EV.novecientos + 0.6, 0, 1, salida);
  const cam = orbita([0, -0.25 + 2.0 * sube, 0], L(t, s, e, 7.6, 8.6), L(t, s, e, -0.3, -0.08), 0.12, { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "l", a: [-1.3, 0, 0], b: [1.3, 0, 0], w: 1.4, o: 0.6, dash: "6 8" });
  const baja = muelle(t, EV.noventa - 0.15, 150, 14);
  if (baja > 0) for (const [a, b] of caja([-0.75, -0.9 * Math.min(baja, 1.05), -0.18], [-0.35, 0, 0.18])) tr.push({ t: "l", a, b, w: 1.5, o: 0.7 });
  if (sube > 0) for (const [a, b] of caja([0.35, 0, -0.18], [0.75, 4.5 * sube, 0.18])) tr.push({ t: "l", a, b, w: 1.8, o: 1, luz: 0.4 });
  const pr = proyector(cam);
  const qb = pr([-0.55, -0.9, 0.18]);
  const qs = pr([0.55, 4.5 * sube, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qb.x, top: qb.y + 20, transform: "translateX(-50%)", opacity: Math.min(baja * 1.5, 1), ...mono(64, 0.8) }}>−90 %</div>
      <div style={{ position: "absolute", left: qs.x, top: Math.max(qs.y - 90, 520), transform: "translateX(-50%)", opacity: sube > 0.05 ? 1 : 0, ...mono(80) }}>+900 %</div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.novecientos - 0.35} texto="si pierdes un *90 %*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.novecientos - 0.3} texto="necesitas un *900 %*" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Lección: no perder mucho (final en seco)
const Leccion: React.FC<P> = ({ t, s, e }) => {
  const tEs = en("es", EV.primero + 1);
  const cam = orbita([0, 0, 0], 9, L(t, s, e, 0.2, -0.2), 0.2, { apertura: 40 });
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <div style={{ position: "absolute", top: 760, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div style={{ opacity: tEs > t ? 1 : 0.35 }}>
          <Titular t={t} t0={s + 0.15} texto="ganar *mucho*" size={110} />
        </div>
        <div style={{ height: 6, width: 520 * L(t, tEs - 0.2, tEs + 0.2, 0, 1, salida), background: "#fff", marginTop: -100, marginBottom: 60 }} />
        <Titular t={t} t0={EV.perder - 0.3} texto="no perder *mucho*" size={120} />
      </div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} texto="lo *primero*" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, respuesta: Respuesta, ejemplo: Ejemplo, escala: Escala, leccion: Leccion };
export const CLAVES = claves(["50%", "recuperarte", "100%", "duplicarse", "90%", "900%", "perder", "mucho"]);

export const Cincuenta: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/cincuenta_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
