import { AbsoluteFill, Audio, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import datos from "../gen/reto.json";
import { Arriba, etiqueta, Filo, Linea, Progreso, recogida, Revela, salida, sans, serif, aparicion, tarjeta } from "../Premium/ui";
import { ORO, Subtitulos } from "../Viral/Subtitulos";
import { ANCHO, C, golpeZoom, lerp, SERIF, suave } from "../Viral/util";

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
      {/* Degradado superior: da lectura al texto editorial sin usar cajas */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.42) 16%, rgba(0,0,0,0.15) 28%, transparent 38%)" }} />

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
      <Progreso t={t} duracion={datos.duracion} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ piezas gráficas
const Bienvenida: React.FC<{ t: number }> = ({ t }) => {
  const fin = esc("hoy").s;
  if (t < EV.dia - 0.1 || t >= fin) return null;
  return (
    <Arriba t={t} t0={EV.dia - 0.15} fin={fin}>
      <Revela t={t} t0={EV.dia - 0.1} fin={fin}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <span style={sans(64)}>Día</span>
          <span style={serif(120)}>1</span>
        </div>
      </Revela>
      <Linea t={t} t0={EV.dia} fin={fin} />
      <Revela t={t} t0={EV.segundo - 0.05} fin={fin}>
        <div style={etiqueta}>Segundo intento</div>
      </Revela>
    </Arriba>
  );
};

const Hoy: React.FC<{ t: number }> = ({ t }) => {
  // Se retira al entrar la captura: ahí arriba van los subtítulos
  const fin = EV.captura;
  if (t < EV.t85 - 0.2 || t >= fin) return null;
  const n = Math.round(lerp(t, EV.t85 - 0.1, EV.t85 + 0.5, 0, 85, salida));
  return (
    <Arriba t={t} t0={EV.t85 - 0.25} fin={fin} top={235}>
      <Revela t={t} t0={EV.t85 - 0.2} fin={fin}>
        <div style={etiqueta}>Resultado de hoy</div>
      </Revela>
      <Revela t={t} t0={EV.t85 - 0.12} fin={fin}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <span style={serif(130)}>+{n}%</span>
          <span style={sans(38)}>de la cuenta</span>
        </div>
      </Revela>
      <Linea t={t} t0={EV.t85} fin={fin} ancho={300} />
    </Arriba>
  );
};

// Coordenadas medidas sobre el fotograma a 1080x1920
const FILAS = [757, 872, 990, 1107];
const GANA = [true, true, false, true];
const ROJO_SOBRIO = "#e5484d";

const NotasCaptura: React.FC<{ t: number }> = ({ t }) => {
  const caja = lerp(t, EV.veis - 0.1, EV.veis + 0.45, 0, 1, salida);
  return (
    <AbsoluteFill>
      {FILAS.map((y, k) => {
        const a = lerp(t, EV.cuatro + 0.12 * k, EV.cuatro + 0.12 * k + 0.4, 0, 1, salida);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 108 - 22,
              top: y - 22,
              width: 44,
              height: 44,
              borderRadius: 22,
              border: `2px solid ${GANA[k] ? ORO : ROJO_SOBRIO}`,
              background: "rgba(0,0,0,0.85)",
              color: GANA[k] ? ORO : ROJO_SOBRIO,
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 30,
              lineHeight: "40px",
              textAlign: "center",
              opacity: a,
              transform: `translateX(${(1 - a) * -24}px)`,
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
          width: 856,
          border: `1.5px solid ${ORO}`,
          borderRadius: 10,
          background: "rgba(232,194,122,0.10)",
          clipPath: `inset(0 ${(1 - caja) * 100}% 0 0)`,
        }}
      />
      <div style={{ position: "absolute", top: 1300, width: ANCHO, display: "flex", justifyContent: "center" }}>
        <Revela t={t} t0={EV.veis + 0.15}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span style={serif(60)}>+80,44 $</span>
            <span style={{ ...etiqueta, fontSize: 26 }}>de beneficio</span>
          </div>
        </Revela>
      </div>
    </AbsoluteFill>
  );
};

const NotasTabla: React.FC<{ t: number }> = ({ t }) => {
  const caja = lerp(t, EV.tabla - 0.1, EV.tabla + 0.45, 0, 1, salida);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 172,
          top: 1444,
          height: 38,
          width: 744,
          border: `1.5px solid ${ORO}`,
          borderRadius: 6,
          background: "rgba(232,194,122,0.12)",
          clipPath: `inset(0 ${(1 - caja) * 100}% 0 0)`,
        }}
      />
      <div style={{ position: "absolute", top: 1344, width: ANCHO, display: "flex", justifyContent: "center" }}>
        <Revela t={t} t0={EV.tabla + 0.1}>
          <div style={{ background: "rgba(10,10,12,0.92)", borderRadius: 6, padding: "10px 22px", display: "flex", alignItems: "baseline", gap: 14 }}>
            <span style={{ ...etiqueta, fontSize: 20 }}>Objetivo</span>
            <span style={serif(40)}>nivel 31</span>
            <span style={sans(28)}>· 102.170 €</span>
          </div>
        </Revela>
      </div>
    </AbsoluteFill>
  );
};

const Pasos: React.FC<{ t: number }> = ({ t }) => {
  const e = esc("eso");
  if (t < e.s || t >= e.e) return null;
  const paso = lerp(t, EV.dos, EV.dos + 0.3, 0, 1, salida) + lerp(t, EV.dos + 0.25, EV.dos + 0.55, 0, 1, salida);
  const x0 = 150;
  const largo = 780;
  const dx = largo / 30;
  const traza = lerp(t, e.s + 0.1, e.s + 0.8, 0, 1, salida) * (1 - lerp(t, e.e - 0.3, e.e, 0, 1, recogida));
  return (
    <div style={{ position: "absolute", top: 250, left: 0, width: ANCHO, height: 140 }}>
      <div style={{ ...tarjeta(aparicion(t, e.s, e.e)), position: "absolute", left: x0 - 44, width: largo + 88, top: -26, height: 160 }}>
        <Filo />
      </div>
      <div style={{ position: "absolute", left: x0 - 12, right: ANCHO - x0 - largo - 12, top: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Revela t={t} t0={e.s + 0.05} fin={e.e}>
          <span style={etiqueta}>El reto</span>
        </Revela>
        <Revela t={t} t0={e.s + 0.12} fin={e.e}>
          <span style={sans(40)}>
            Paso <span style={serif(66)}>{Math.round(paso)}</span> / 31
          </span>
        </Revela>
      </div>
      <div style={{ position: "absolute", left: x0, width: largo, top: 90, height: 2, background: "rgba(255,255,255,0.7)", transform: `scaleX(${traza})`, transformOrigin: "left" }} />
      <div style={{ position: "absolute", left: x0, width: paso * dx, top: 89, height: 3.5, borderRadius: 2, background: ORO, opacity: traza }} />
      {Array.from({ length: 31 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x0 + i * dx - 3,
            top: 88,
            width: 6,
            height: 6,
            borderRadius: 3,
            background: i <= paso ? ORO : "rgba(255,255,255,0.7)",
            opacity: suave(Math.min(Math.max(traza * 31 - i, 0), 1)),
          }}
        />
      ))}
      <div style={{ position: "absolute", left: x0 + paso * dx - 10, top: 81, width: 20, height: 20, borderRadius: 10, background: ORO, boxShadow: "0 0 0 7px rgba(232,194,122,0.22)", opacity: traza }} />
    </div>
  );
};

const Casilla: React.FC<{ t: number }> = ({ t }) => {
  const e = esc("casilla");
  if (t < EV.casilla - 0.2 || t >= e.e) return null;
  const n = Math.round(lerp(t, EV.casilla - 0.1, EV.treintayuno, 2, 31, suave));
  return (
    <Arriba t={t} t0={EV.casilla - 0.25} fin={e.e} top={225}>
      <Revela t={t} t0={EV.casilla - 0.2} fin={e.e}>
        <div style={etiqueta}>Casilla</div>
      </Revela>
      <Revela t={t} t0={EV.casilla - 0.12} fin={e.e}>
        <div style={serif(118, t >= EV.treintayuno ? ORO : C.blanco)}>{n}</div>
      </Revela>
      <Linea t={t} t0={EV.treintayuno} fin={e.e} ancho={160} />
    </Arriba>
  );
};

const Cta: React.FC<{ t: number }> = ({ t }) => {
  const e = esc("cta");
  if (t < e.s) return null;
  return (
    <Arriba t={t} t0={e.s - 0.05} top={240}>
      <Revela t={t} t0={e.s}>
        <div style={etiqueta}>Y tú, ¿qué dices?</div>
      </Revela>
      <Revela t={t} t0={e.s + 0.08}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={sans(60)}>¿Llegaremos a la</span>
          <span style={serif(96)}>31</span>
          <span style={sans(60)}>?</span>
        </div>
      </Revela>
      <Linea t={t} t0={e.s + 0.15} ancho={260} />
      <Revela t={t} t0={EV.comentarios - 0.1}>
        <div style={{ ...etiqueta, fontSize: 26 }}>Te leo en comentarios</div>
      </Revela>
    </Arriba>
  );
};
