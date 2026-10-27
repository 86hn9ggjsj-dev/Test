// Reel de alcance "Pierdes un 50 %" (~26 s) en estilo claro: formas planas, verde = ganas, rojo = pierdes, cifras
// enormes y una idea por pantalla; el gancho ya está en el primer fotograma y el final corta en seco para que se repita.
// Tiempos en src/gen/cincuenta.json (scripts/cincuenta.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/cincuenta.json";
import { salida } from "../Premium/ui";
import { ANCHO, SANS } from "../Viral/util";
import { Arriba, L, mono, muelle, Titular } from "../Bot/piezas";
import { claves, cuando, Montaje, P } from "../Explica/Montaje";
import { Bloque, Cifra, Marca, ROJO, VERDE } from "../Claro/claro";

export const CINCUENTA_FPS = datos.fps;
export const CINCUENTA_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const en = cuando(datos);

const BX = 140; // barra de la cuenta: 800 px de ancho
const BW = 800;

// ------------------------------------------------------------------ 1. Hook: −50 % y la cuenta partida por la mitad
const Hook: React.FC<P> = ({ t, s }) => {
  const tCuanto = en("cuánto", s);
  const parte = L(t, 0.35, 1.1, 0, 1, salida);
  const hueco = muelle(t, EV.recuperarte - 0.2, 200, 14);
  return (
    <>
      <Cifra t={t} t0={-0.45} texto="−50 %" color={ROJO} top={500} />
      <Bloque x={BX} y={860} w={BW / 2} h={120} color="#fff" texto={parte > 0.5 ? "500 €" : ""} size={48} />
      <Bloque x={BX + BW / 2} y={860 + 260 * parte * parte} w={BW / 2} h={120} color={parte > 0.05 ? ROJO : "#fff"} o={1 - parte} giro={12 * parte} />
      {parte <= 0.5 && <div style={{ position: "absolute", left: BX, top: 860, width: BW, height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 48, color: "#000" }}>1.000 €</div>}
      <Bloque x={BX + BW / 2 + 8} y={860} w={BW / 2 - 8} h={120} color={VERDE} contorno texto="¿?" o={Math.min(hueco * 1.5, 1)} size={52} />
      <div style={{ position: "absolute", top: 1010, left: 0, width: ANCHO, textAlign: "center", ...mono(30, 0.6) }}>TU CUENTA</div>
      <Arriba>
        <Titular t={t} t0={-0.35} fin={tCuanto - 0.05} texto="pierdes la *mitad*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tCuanto} texto="¿cuánto para *recuperarte*?" size={74} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Respuesta: +50 % no; +100 % sí
const Respuesta: React.FC<P> = ({ t, s }) => {
  const crece = L(t, EV.cien - 0.05, EV.cien + 0.5, 0, 1, salida);
  return (
    <>
      <Cifra t={t} t0={s + 0.05} fin={EV.cien - 0.15} texto="+50 %" top={500} tacha={EV.no + 0.35} />
      <Marca t={t} t0={EV.no + 0.5} ok={false} x={540} y={800} />
      <Cifra t={t} t0={EV.cien - 0.1} texto="+100 %" color={VERDE} top={500} size={200} />
      <Marca t={t} t0={EV.cien + 0.1} ok x={540} y={800} />
      <Bloque x={BX} y={920} w={BW / 2} h={120} color="#fff" texto="500 €" size={48} />
      <Bloque x={BX + BW / 2 + 8} y={920} w={(BW / 2 - 8) * crece} h={120} color={VERDE} texto={crece > 0.6 ? "+500 €" : ""} size={48} o={crece > 0 ? 1 : 0} />
      <div style={{ position: "absolute", top: 1070, left: 0, width: ANCHO, textAlign: "center", ...mono(36, 0.85), opacity: L(t, EV.cien + 0.3, EV.cien + 0.6, 0, 1, salida) }}>500 € × 2 = 1.000 €</div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.cien - 0.3} texto="no es un *50 %*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cien - 0.25} texto="es un *100 %*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Ejemplo: 10 billetes de 100 €, se van 5 y hay que duplicar
const Ejemplo: React.FC<P> = ({ t, s }) => {
  const dup = L(t, EV.duplicarse - 0.15, EV.duplicarse + 0.35, 0, 1, salida);
  const saldo = t < EV.quedan ? "1.000 €" : "500 €";
  return (
    <>
      {Array.from({ length: 10 }, (_, k) => {
        const col = k % 5;
        const fila = Math.floor(k / 5);
        const x = 100 + col * 180;
        const y = 600 + fila * 130;
        const g = muelle(t, s + 0.05 + k * 0.05, 230, 15);
        const pierde = fila === 1;
        const cae = pierde ? L(t, EV.quedan - 0.15 + col * 0.06, EV.quedan + 0.55 + col * 0.06, 0, 1, (u) => u * u) : 0;
        return (
          <div key={k}>
            <Bloque x={x} y={y + 500 * cae + (1 - Math.min(g, 1)) * 40} w={160} h={100} color={cae > 0 ? ROJO : "#fff"} texto="100 €" size={38} o={Math.min(g * 1.5, 1) * (1 - cae)} giro={cae * (col - 2) * 8} />
            {pierde && <Bloque x={x} y={y} w={160} h={100} color={VERDE} contorno texto="+100" size={34} o={dup} />}
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 900, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 30, alignItems: "baseline" }}>
        <span style={{ ...mono(110), color: t < EV.quedan ? "#fff" : ROJO }}>{saldo}</span>
        <span style={{ ...mono(110), color: VERDE, opacity: dup, transform: `scale(${0.6 + 0.4 * dup})`, display: "inline-block" }}>×2</span>
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
const BASE = 1000;
const Escala: React.FC<P> = ({ t, s }) => {
  const baja = muelle(t, EV.noventa - 0.15, 170, 14);
  const sube = L(t, EV.novecientos - 0.45, EV.novecientos + 0.7, 0, 1, salida);
  const alto = 2700 * sube;
  return (
    <>
      <div style={{ position: "absolute", top: BASE, left: 160, width: 760, height: 4, background: "rgba(255,255,255,0.5)" }} />
      <Bloque x={200} y={BASE + 4} w={240} h={270 * Math.min(baja, 1.05)} color={ROJO} o={baja > 0 ? 1 : 0} />
      <div style={{ position: "absolute", left: 160, top: BASE - 90, width: 320, textAlign: "center", ...mono(70), color: ROJO, opacity: Math.min(baja * 1.5, 1) }}>−90 %</div>
      {/* La barra verde se corta bajo el titular: sigue subiendo fuera de cuadro (flecha) */}
      <Bloque x={560} y={Math.max(BASE - alto, 450)} w={320} h={Math.min(alto, BASE - 450)} color={VERDE} o={sube > 0 ? 1 : 0} />
      <div style={{ position: "absolute", left: 560, top: Math.max(BASE - alto + 20, 466), width: 320, display: "flex", flexDirection: "column", alignItems: "center", opacity: sube > 0.03 ? 1 : 0 }}>
        <span style={{ ...mono(56), color: "#000", opacity: alto > BASE - 450 ? 1 : 0 }}>↑</span>
        <span style={{ ...mono(66), color: alto > 140 ? "#000" : VERDE }}>+900 %</span>
      </div>
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
const Leccion: React.FC<P> = ({ t, s }) => {
  const tEs = en("es", EV.primero + 1);
  const raya = L(t, tEs - 0.15, tEs + 0.25, 0, 1, salida);
  const subraya = L(t, EV.perder, EV.perder + 0.5, 0, 1, salida);
  const g = muelle(t, s + 0.1, 200, 15);
  return (
    <>
      <div style={{ position: "absolute", top: 640, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: Math.min(g * 1.5, 1) * (1 - 0.6 * raya) }}>
        <div style={{ position: "relative", fontFamily: SANS, fontWeight: 800, fontSize: 110, color: "#fff", letterSpacing: "-0.03em" }}>
          ganar mucho
          <div style={{ position: "absolute", left: -20, top: "52%", height: 14, borderRadius: 7, width: `calc(${raya * 100}% + ${raya * 40}px)`, background: ROJO }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 880, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <Titular t={t} t0={EV.perder - 0.35} texto="no perder *mucho*" size={124} />
        <div style={{ height: 14, borderRadius: 7, width: 700 * subraya, background: VERDE }} />
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
