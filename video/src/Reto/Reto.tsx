import { AbsoluteFill, Audio, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import datos from "../gen/reto.json";
import { ORO, Subtitulos } from "../Viral/Subtitulos";
import { ANCHO, C, entra, golpeZoom, lerp, sale, SANS, SERIF, suave } from "../Viral/util";

export const RETO_FPS = datos.fps;
export const RETO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const esc = (id: string) => datos.escenas.find((e) => e.id === id)!;
// Palabras clave: en el estilo premium van en serif cursiva dorada
const CLAVES: Record<string, string> = {
  "85%": ORO,
  "1": ORO,
  "4": ORO,
  dos: ORO,
  "31": ORO,
  reto: ORO,
  tabla: ORO,
  comentarios: ORO,
};

type Tipo = "primer" | "medio" | "captura" | "tabla";
const planoEn = (t: number) => (datos.planos.find((p) => t >= p.s && t < p.e) ?? datos.planos[datos.planos.length - 1]) as { s: number; e: number; tipo: Tipo; pieza: number };

// Subtítulos: nunca sobre la cara ni sobre las capturas
const Y_SUB: Record<Tipo, number> = { primer: 0.73, medio: 0.66, captura: 0.17, tabla: 0.17 };
function Y_SUB_DE(tipo: string) {
  return Y_SUB[tipo as Tipo];
}
// Si el bloque coincide con una captura o la tabla, va en la posición de esa imagen (arriba nunca tapa la cara);
// si no, en la del plano en el que pasa más tiempo
const ySubtitulo = (ini: number, fin: number) => {
  const solape = (p: { s: number; e: number }) => Math.min(fin, p.e) - Math.max(ini, p.s);
  const imagen = datos.planos.find((p) => (p.tipo === "captura" || p.tipo === "tabla") && solape(p) > 0.12);
  if (imagen) return Y_SUB_DE(imagen.tipo);
  const mejor = datos.planos.reduce((a, p) => (solape(p) > solape(a) ? p : a));
  return Y_SUB_DE(mejor.tipo);
};
// Además de las escenas, los bloques se parten donde cambia la altura de los subtítulos
const CORTES = [
  ...datos.escenas.map((e) => e.s),
  ...datos.planos.filter((p, k) => k > 0 && Y_SUB_DE(p.tipo) !== Y_SUB_DE(datos.planos[k - 1].tipo)).map((p) => p.s),
];

// Reencuadre en los jump cuts dentro del mismo plano (piezas 3 y 5)
const ENCUADRE = [1, 1, 1, 1.1, 1, 1.1];
// Punch-ins suaves en los momentos clave
const GOLPES: [number, number][] = [
  [EV.t85, 0.05],
  [EV.dos, 0.045],
  [EV.treintayuno, 0.06],
  [EV.comentarios, 0.04],
];

export const Reto: React.FC = () => {
  const t = useCurrentFrame() / RETO_FPS;
  const plano = planoEn(t);

  let escala = ENCUADRE[plano.pieza] + GOLPES.reduce((a, [t0, amt]) => a + golpeZoom(t, t0, amt, 0.2, 0.3, 0.45), 0);
  let origen = "50% 40%";
  if (plano.tipo === "captura" || plano.tipo === "tabla") {
    escala = lerp(t, plano.s, plano.e, 1, 1.06, (x) => x);
    origen = "50% 50%";
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Audio src={staticFile("gen/reto_mezcla.wav")} />
      <AbsoluteFill
        style={{
          transform: `scale(${escala})`,
          transformOrigin: origen,
        }}
      >
        <OffthreadVideo src={staticFile("gen/reto_base.mp4")} muted style={{ width: "100%", height: "100%" }} />
        {plano.tipo === "captura" && <NotasCaptura t={t} />}
        {plano.tipo === "tabla" && <NotasTabla t={t} />}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 65% at 50% 45%, transparent 55%, rgba(0,0,0,0.38) 100%)" }} />

      <Bienvenida t={t} />
      <Hoy t={t} />
      <Pasos t={t} />
      <Casilla t={t} />
      <Cta t={t} />

      <Subtitulos
        t={t}
        palabras={datos.palabras}
        cortes={CORTES}
        claves={CLAVES}
        duracion={datos.duracion}
        y={ySubtitulo}
        estilo="premium"
      />
      <Progreso t={t} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ piezas gráficas (estilo premium)
const vidrio: React.CSSProperties = {
  fontFamily: SANS,
  fontWeight: 600,
  fontSize: 40,
  letterSpacing: "-0.01em",
  color: C.blanco,
  background: "rgba(14,14,16,0.45)",
  backdropFilter: "blur(20px) saturate(140%)",
  border: "1px solid rgba(255,255,255,0.22)",
  borderRadius: 999,
  padding: "14px 30px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  gap: 14,
};

const etiqueta: React.CSSProperties = {
  fontFamily: SANS,
  fontWeight: 600,
  fontSize: 24,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.75)",
  textShadow: "0 2px 12px rgba(0,0,0,0.6)",
};

const Punto: React.FC<{ color?: string }> = ({ color = ORO }) => (
  <span style={{ width: 12, height: 12, borderRadius: 6, background: color, boxShadow: `0 0 12px ${color}88`, display: "inline-block" }} />
);

// Entrada suave (subida + desenfoque) y salida
const aparece = (t: number, t0: number, fin?: number, d = 0.3): React.CSSProperties => {
  const a = Math.min(entra(t, t0, d), fin === undefined ? 1 : sale(t, fin, 0.2));
  return { opacity: a, transform: `translateY(${(1 - a) * 14}px)`, filter: a < 0.99 ? `blur(${(1 - a) * 8}px)` : undefined };
};

const Arriba: React.FC<{ top?: number; children: React.ReactNode; style?: React.CSSProperties; columna?: boolean }> = ({ top = 250, children, style, columna }) => (
  <div style={{ position: "absolute", top, width: ANCHO, display: "flex", flexDirection: columna ? "column" : "row", justifyContent: "center", alignItems: "center", gap: columna ? 10 : 16, ...style }}>
    {children}
  </div>
);

const Progreso: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", top: 0, left: 0, height: 4, width: ANCHO, background: "rgba(255,255,255,0.12)" }}>
    <div style={{ height: "100%", width: `${(t / datos.duracion) * 100}%`, background: "rgba(255,255,255,0.85)" }} />
  </div>
);

const Bienvenida: React.FC<{ t: number }> = ({ t }) => {
  const fin = esc("hoy").s;
  if (t < EV.dia - 0.1 || t >= fin) return null;
  return (
    <Arriba top={260}>
      <div style={{ ...vidrio, ...aparece(t, EV.dia - 0.1, fin) }}>
        <Punto /> Día 1
      </div>
      <div style={{ ...vidrio, ...aparece(t, EV.segundo - 0.05, fin) }}>Segundo intento</div>
    </Arriba>
  );
};

const Hoy: React.FC<{ t: number }> = ({ t }) => {
  // Se retira al entrar la captura: ahí arriba van los subtítulos
  const fin = EV.captura;
  if (t < EV.t85 - 0.15 || t >= fin) return null;
  const n = Math.round(lerp(t, EV.t85 - 0.1, EV.t85 + 0.5, 0, 85));
  return (
    <Arriba top={235} columna style={aparece(t, EV.t85 - 0.15, fin)}>
      <div style={etiqueta}>Resultado de hoy</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 130, lineHeight: 1, color: ORO, textShadow: "0 6px 30px rgba(0,0,0,0.5)" }}>+{n}%</span>
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 38, color: C.blanco, textShadow: "0 2px 14px rgba(0,0,0,0.6)" }}>de la cuenta</span>
      </div>
    </Arriba>
  );
};

// Coordenadas medidas sobre el fotograma a 1080x1920
const FILAS = [757, 872, 990, 1107];
const GANA = [true, true, false, true];
const ROJO_SOBRIO = "#e5484d";

const NotasCaptura: React.FC<{ t: number }> = ({ t }) => {
  const caja = lerp(t, EV.veis - 0.1, EV.veis + 0.25, 0, 1);
  return (
    <AbsoluteFill>
      {FILAS.map((y, k) => {
        const a = entra(t, EV.cuatro + 0.12 * k, 0.22);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 108 - 24,
              top: y - 24,
              width: 48,
              height: 48,
              borderRadius: 24,
              background: GANA[k] ? C.blanco : ROJO_SOBRIO,
              color: GANA[k] ? "#111" : C.blanco,
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 26,
              lineHeight: "48px",
              textAlign: "center",
              opacity: a,
              transform: `scale(${0.6 + 0.4 * a})`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            }}
          >
            {k + 1}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 112,
          top: 1230,
          height: 52,
          width: 856 * suave(caja),
          border: `2px solid ${ORO}`,
          borderRadius: 12,
          background: "rgba(232,194,122,0.12)",
          opacity: caja > 0.01 ? 1 : 0,
        }}
      />
      <div style={{ position: "absolute", top: 1300, width: ANCHO, display: "flex", justifyContent: "center" }}>
        <div style={{ ...vidrio, background: "rgba(10,10,12,0.72)", ...aparece(t, EV.veis + 0.15) }}>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 52, color: ORO, lineHeight: 1 }}>+80,44 $</span>
          <span style={{ ...etiqueta, fontSize: 20 }}>beneficio</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const NotasTabla: React.FC<{ t: number }> = ({ t }) => {
  const caja = lerp(t, EV.tabla - 0.1, EV.tabla + 0.25, 0, 1);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 172,
          top: 1444,
          height: 38,
          width: 744 * suave(caja),
          border: `2px solid ${ORO}`,
          borderRadius: 8,
          background: "rgba(232,194,122,0.10)",
          opacity: caja > 0.01 ? 1 : 0,
        }}
      />
      <div style={{ position: "absolute", top: 1342, width: ANCHO, display: "flex", justifyContent: "center" }}>
        <div style={{ ...vidrio, background: "rgba(10,10,12,0.8)", fontSize: 30, padding: "10px 24px", ...aparece(t, EV.tabla + 0.1) }}>
          <Punto /> Objetivo: nivel 31 · 102.170 €
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Pasos: React.FC<{ t: number }> = ({ t }) => {
  const e = esc("eso");
  if (t < e.s || t >= e.e) return null;
  const paso = lerp(t, EV.dos, EV.dos + 0.25, 0, 1) + lerp(t, EV.dos + 0.25, EV.dos + 0.5, 0, 1);
  const x0 = 150;
  const largo = 780;
  const dx = largo / 30;
  return (
    <div style={{ position: "absolute", top: 255, left: 0, width: ANCHO, height: 140, ...aparece(t, e.s + 0.05, e.e) }}>
      <div style={{ position: "absolute", left: x0, right: ANCHO - x0 - largo, top: 0, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={etiqueta}>El reto</span>
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.blanco, textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
          Paso <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 52, color: ORO }}>{Math.round(paso)}</span> / 31
        </span>
      </div>
      <div style={{ position: "absolute", left: x0, width: largo, top: 86, height: 2, background: "rgba(255,255,255,0.3)" }} />
      <div style={{ position: "absolute", left: x0, width: paso * dx, top: 85, height: 4, borderRadius: 2, background: ORO }} />
      {Array.from({ length: 31 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x0 + i * dx - 3,
            top: 84,
            width: 6,
            height: 6,
            borderRadius: 3,
            background: i <= paso ? ORO : "rgba(255,255,255,0.55)",
          }}
        />
      ))}
      <div style={{ position: "absolute", left: x0 + paso * dx - 11, top: 76, width: 22, height: 22, borderRadius: 11, background: ORO, boxShadow: `0 0 0 8px rgba(232,194,122,0.22), 0 0 24px ${ORO}` }} />
    </div>
  );
};

const Casilla: React.FC<{ t: number }> = ({ t }) => {
  const e = esc("casilla");
  if (t < EV.casilla - 0.15 || t >= e.e) return null;
  const n = Math.round(lerp(t, EV.casilla - 0.1, EV.treintayuno, 2, 31));
  const asiento = 1 + 0.06 * (1 - suave(Math.min(Math.max((t - EV.treintayuno) / 0.4, 0), 1))) * (t >= EV.treintayuno ? 1 : 0);
  return (
    <Arriba top={215} columna style={aparece(t, EV.casilla - 0.15, e.e)}>
      <div style={etiqueta}>Casilla</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 150, lineHeight: 0.9, color: t >= EV.treintayuno ? ORO : C.blanco, transform: `scale(${asiento})`, textShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
        {n}
      </div>
    </Arriba>
  );
};

const Cta: React.FC<{ t: number }> = ({ t }) => {
  const e = esc("cta");
  if (t < e.s) return null;
  return (
    <Arriba top={250} columna>
      <div style={{ ...vidrio, fontSize: 40, ...aparece(t, e.s + 0.03) }}>
        ¿Llegaremos a la <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 56, color: ORO, lineHeight: 1 }}>31</span>?
      </div>
      <div style={{ ...etiqueta, marginTop: 8, ...aparece(t, EV.comentarios - 0.1) }}>Te leo en comentarios ↓</div>
    </Arriba>
  );
};
