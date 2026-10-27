// Estilo "claro" para reels de alcance: formas planas y rellenas, verde = ganas, rojo = pierdes, cifras enormes y una
// sola idea por pantalla. Se entiende de un vistazo en el móvil, sin leer etiquetas pequeñas.
import { salida } from "../Premium/ui";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";

export const VERDE = "#2fd47a";
export const ROJO = "#ff4d4d";

// Cifra gigante centrada que entra con un golpe de muelle; opcionalmente se tacha
export const Cifra: React.FC<{ t: number; t0: number; fin?: number; texto: string; color?: string; size?: number; top: number; tacha?: number; pie?: string }> = ({
  t,
  t0,
  fin,
  texto,
  color = "#fff",
  size = 210,
  top,
  tacha,
  pie,
}) => {
  const g = muelle(t, t0, 230, 13);
  const fuera = fin === undefined ? 0 : L(t, fin - 0.2, fin, 0, 1);
  if (g <= 0.001 || fuera >= 1) return null;
  const raya = tacha === undefined ? 0 : L(t, tacha, tacha + 0.3, 0, 1, salida);
  return (
    <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: Math.min(g * 1.5, 1) * (1 - fuera) }}>
      <div style={{ position: "relative", ...mono(size), color, letterSpacing: "-0.04em", fontWeight: 500, transform: `scale(${0.6 + 0.4 * Math.min(g, 1.12)})`, opacity: 1 - 0.5 * raya }}>
        {texto}
        <div style={{ position: "absolute", left: -24, top: "50%", height: 14, borderRadius: 7, width: `calc(${raya * 100}% + ${raya * 48}px)`, background: ROJO }} />
      </div>
      {pie && <span style={{ ...mono(32, 0.7) }}>{pie}</span>}
    </div>
  );
};

// Bloque rellenado con texto (billete, tramo de una barra…)
export const Bloque: React.FC<{ x: number; y: number; w: number; h: number; color: string; texto?: string; o?: number; contorno?: boolean; giro?: number; size?: number }> = ({
  x,
  y,
  w,
  h,
  color,
  texto,
  o = 1,
  contorno = false,
  giro = 0,
  size = 40,
}) =>
  o > 0.001 ? (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 18,
        background: contorno ? "transparent" : color,
        border: contorno ? `4px dashed ${color}` : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: size,
        color: contorno ? color : "#000",
        opacity: o,
        transform: `rotate(${giro}deg)`,
      }}
    >
      {texto}
    </div>
  ) : null;

// Marca circular ✓ / ✕
export const Marca: React.FC<{ t: number; t0: number; ok: boolean; x: number; y: number; size?: number }> = ({ t, t0, ok, x, y, size = 110 }) => {
  const g = muelle(t, t0, 260, 13);
  if (g <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: 999,
        background: ok ? VERDE : ROJO,
        color: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: SANS,
        fontWeight: 900,
        fontSize: size * 0.6,
        transform: `scale(${Math.min(g, 1.15)})`,
      }}
    >
      {ok ? "✓" : "✕"}
    </div>
  );
};
