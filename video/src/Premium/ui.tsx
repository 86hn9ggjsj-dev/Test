// Piezas gráficas del estilo premium/editorial compartidas por las composiciones grabadas a cámara
import { Easing } from "remotion";
import { ORO, SOMBRA_PREMIUM } from "../Viral/Subtitulos";
import { ANCHO, C, lerp, SANS, SERIF } from "../Viral/util";

// ------------------------------------------------------------------ piezas gráficas (estilo editorial)
export const salida = Easing.bezier(0.16, 1, 0.3, 1); // expo out
export const recogida = Easing.bezier(0.7, 0, 0.84, 0); // expo in

// Revelado con máscara: el texto sube desde detrás de un borde invisible y se recoge al salir
export const Revela: React.FC<{ t: number; t0: number; fin?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, t0, fin, children, style }) => {
  const dentro = lerp(t, t0, t0 + 0.55, 0, 1, salida);
  const fuera = fin === undefined ? 0 : lerp(t, fin - 0.3, fin, 0, 1, recogida);
  return (
    <div style={{ overflow: "hidden", padding: "0 12px 10px", marginBottom: -10, ...style }}>
      <div style={{ transform: `translateY(${(1 - dentro) * 115 - fuera * 115}%)` }}>{children}</div>
    </div>
  );
};

// Línea dorada fina que se dibuja desde el centro
export const Linea: React.FC<{ t: number; t0: number; fin?: number; ancho?: number }> = ({ t, t0, fin, ancho = 220 }) => {
  const k = lerp(t, t0, t0 + 0.6, 0, 1, salida) * (fin === undefined ? 1 : 1 - lerp(t, fin - 0.3, fin, 0, 1, recogida));
  return <div style={{ width: ancho, height: 3, borderRadius: 2, background: ORO, transform: `scaleX(${k})`, boxShadow: "0 1px 6px rgba(0,0,0,0.6)" }} />;
};

export const SOMBRA = SOMBRA_PREMIUM;
export const etiqueta: React.CSSProperties = {
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: 30,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: C.blanco,
  textShadow: SOMBRA,
};
export const serif = (size: number, color: string = ORO): React.CSSProperties => ({
  fontFamily: SERIF,
  fontStyle: "italic",
  fontWeight: 400,
  fontSize: size,
  lineHeight: 1,
  color,
  textShadow: SOMBRA,
});
export const sans = (size: number): React.CSSProperties => ({
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: size,
  letterSpacing: "-0.015em",
  color: C.blanco,
  textShadow: SOMBRA,
});

// Tarjeta oscura translúcida con desenfoque y filo dorado: da fondo a los elementos sin perder el aire premium
export const aparicion = (t: number, t0: number, fin?: number) =>
  lerp(t, t0, t0 + 0.45, 0, 1, salida) * (fin === undefined ? 1 : 1 - lerp(t, fin - 0.3, fin, 0, 1, recogida));

export const tarjeta = (v: number): React.CSSProperties => ({
  position: "relative",
  background: "linear-gradient(180deg, rgba(24,24,28,0.8) 0%, rgba(10,10,12,0.74) 100%)",
  backdropFilter: "blur(22px) saturate(140%)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 30,
  boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  overflow: "hidden",
  opacity: v,
  transform: `translateY(${(1 - v) * 12}px) scale(${0.94 + 0.06 * v})`,
});

export const Filo: React.FC = () => (
  <div style={{ position: "absolute", top: 0, left: "12%", right: "12%", height: 2, background: `linear-gradient(90deg, transparent, ${ORO}, transparent)` }} />
);

export const Arriba: React.FC<{ t: number; t0: number; fin?: number; top?: number; children: React.ReactNode }> = ({ t, t0, fin, top = 245, children }) => (
  <div style={{ position: "absolute", top, width: ANCHO, display: "flex", justifyContent: "center" }}>
    <div style={{ ...tarjeta(aparicion(t, t0, fin)), padding: "26px 48px 30px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <Filo />
      {children}
    </div>
  </div>
);

export const Progreso: React.FC<{ t: number; duracion: number }> = ({ t, duracion }) => (
  <div style={{ position: "absolute", top: 0, left: 0, height: 4, width: ANCHO, background: "rgba(255,255,255,0.12)" }}>
    <div style={{ height: "100%", width: `${(t / duracion) * 100}%`, background: "rgba(255,255,255,0.85)" }} />
  </div>
);

