// Montaje común de los videos de motion graphics con voz en off (Explica, Prueba): pantallas encadenadas con
// fundido, subtítulos y barra de progreso, más las piezas que comparten (kicker, botón de seguir, paseos aleatorios).
import { useMemo } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Progreso, salida } from "../Premium/ui";
import { Palabra, Subtitulos } from "../Viral/Subtitulos";
import { ANCHO, lerp, ruido, SANS, SERIF } from "../Viral/util";
import { Arriba, L, mono, muelle, Teclea, Titular } from "../Bot/piezas";
import { Escena, io, orbita, polvo, Tinta } from "../Bot/tres";

export type Datos = { fps: number; duracion: number; palabras: Palabra[]; escenas: { id: string; s: number; e: number }[] };
export type P = { t: number; s: number; e: number };

const norm = (w: string) => w.toLowerCase().replace(/[^\wáéíóúñü%]/g, "");
// Momento en que se dice una palabra (la primera vez a partir de "desde")
export const cuando = (datos: Datos) => (w: string, desde = 0) => datos.palabras.find((p) => p.s >= desde - 0.1 && norm(p.w) === w)?.s ?? desde;

// Paseo aleatorio suave y reproducible
export const paseo = (n: number, semilla: number, paso: number, deriva = 0): number[] => {
  const v = [0];
  for (let i = 1; i < n; i++) v.push(v[i - 1] + deriva + (ruido(semilla * 131 + i * 17) - 0.5) * paso);
  return v;
};

export const Kicker: React.FC<{ t: number; t0: number; texto: string }> = ({ t, t0, texto }) => (
  <div style={{ position: "absolute", top: 228, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
    <Teclea t={t} t0={t0} texto={texto} size={26} o={0.6} />
  </div>
);

export const pct = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(Math.round(v))} %`;
// Reescala una serie al rango [y0, y1]
export const escala = (v: number[], y0: number, y1: number) => {
  const lo = Math.min(...v);
  const hi = Math.max(...v);
  return v.map((x) => y0 + ((x - lo) / (hi - lo)) * (y1 - y0));
};
// Cifra grande en la franja inferior, por encima de los subtítulos
export const Abajo: React.FC<{ o?: number; top?: number; children: React.ReactNode }> = ({ o = 1, top = 1255, children }) => (
  <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 18, alignItems: "baseline", opacity: o }}>{children}</div>
);

// Botón "Seguir" que se pulsa solo y pasa a "Siguiendo ✓"
export const BotonSeguir: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const boton = muelle(t, t0 + 0.05, 200, 16);
  const pulsa = muelle(t, t0 + 0.5, 260, 15);
  const onda = L(t, t0 + 0.5, t0 + 1.1, 0, 1, salida);
  const blanco = pulsa > 0.5;
  return (
    <div style={{ position: "absolute", top: 470, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", opacity: Math.min(boton * 1.6, 1), transform: `scale(${(0.8 + 0.2 * boton) * (1 - 0.06 * Math.sin(Math.min(pulsa, 1) * Math.PI))})` }}>
        {onda > 0 && onda < 1 && <div style={{ position: "absolute", inset: -20 - 40 * onda, borderRadius: 999, border: "2px solid #fff", opacity: 1 - onda }} />}
        <div style={{ padding: "26px 60px", borderRadius: 999, border: "2px solid #fff", background: blanco ? "#fff" : "transparent", color: blanco ? "#000" : "#fff", fontFamily: SANS, fontWeight: 700, fontSize: 52, letterSpacing: "-0.01em" }}>
          {blanco ? "Siguiendo ✓" : "Seguir"}
        </div>
      </div>
    </div>
  );
};

// Cifra gigante en el centro, con su pie
export const Gigante: React.FC<{ t: number; t0: number; fin?: number; texto: string; pie?: string; top?: number; size?: number; tacha?: number }> = ({ t, t0, fin, texto, pie, top = 760, size = 230, tacha }) => {
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

// Golpe de impacto para las cifras clave: decae en ~0,4 s. Úsalo para sacudir la cámara o escalar un número
export const golpe = (t: number, t0: number) => (t < t0 ? 0 : Math.exp(-(t - t0) * 7));
export const sacude = (t: number, t0: number, a = 0.035) => a * golpe(t, t0) * Math.sin((t - t0) * 48);
// Destello blanco breve sobre toda la pantalla
export const Destello: React.FC<{ t: number; t0: number; o?: number }> = ({ t, t0, o = 0.22 }) => {
  const k = golpe(t, t0);
  return k > 0.01 ? <AbsoluteFill style={{ background: "#fff", opacity: o * k, pointerEvents: "none" }} /> : null;
};

// Cierre de los reels de alcance: «sígueme» con el botón que se pulsa y la cuenta auditada del bot en la bio
// El «sígueme» grande va siempre (es la única rotulación de arriba que se mantiene en los vídeos con solo subtítulos);
// sinLema quita el lema pequeño de encima
// sinFondo: sin el polvo de fondo, para ponerlo encima de una escena que sigue viva (el «sígueme» no corta la historia)
export const CtaSeguir: React.FC<P & { lema: string; sinLema?: boolean; sinFondo?: boolean }> = ({ t, s, e, lema, sinLema = false, sinFondo = false }) => (
  <>
    {!sinFondo && <Escena cam={orbita([0, 0, 0], 9, L(t, s, e, -0.3, 0.2), 0.2, { apertura: 40 })} trazos={polvo(0.35)} />}
    <BotonSeguir t={t} t0={s} />
    <div style={{ position: "absolute", top: 660, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, s + 0.6, s + 0.9, 0, 1, salida) }}>
      <span style={{ ...mono(30, 0.85), padding: "12px 24px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.5)" }}>↗ CUENTA AUDITADA DEL BOT EN LA BIO</span>
    </div>
    {!sinLema && lema && <Kicker t={t} t0={s + 0.05} texto={lema} />}
    <Arriba>
      <Titular t={t} t0={s + 0.05} texto="*sígueme*" size={110} />
    </Arriba>
  </>
);

// Pregunta a mitad de vídeo para que comenten: bocadillo de comentario con los puntos de «escribiendo…»
export const PreguntaComentarios: React.FC<P & { lineas: string[]; pie?: string; size?: number; kicker?: string }> = ({ t, s, e, lineas, pie = "TE LEO EN COMENTARIOS", size = 92, kicker = "ANTES DE SEGUIR" }) => {
  const g = muelle(t, s + 0.1, 200, 14);
  const punto = (i: number) => 0.35 + 0.65 * Math.max(0, Math.sin((t - s) * 7 - i * 0.9));
  return (
    <>
      <Escena cam={orbita([0, 0, 0], 9, L(t, s, e, -0.3, 0.2), 0.2, { apertura: 40 })} trazos={polvo(0.35)} />
      <Kicker t={t} t0={s + 0.05} texto={kicker} />
      <div style={{ position: "absolute", top: 640, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: Math.min(Math.max(g, 0) * 1.5, 1), transform: `scale(${0.7 + 0.3 * Math.min(Math.max(g, 0), 1.1)})` }}>
        <svg width={420} height={250} viewBox="0 0 300 180">
          <path d="M40 10 H260 A30 30 0 0 1 290 40 V100 A30 30 0 0 1 260 130 H110 L70 168 L80 130 H40 A30 30 0 0 1 10 100 V40 A30 30 0 0 1 40 10 Z" fill="none" stroke="#fff" strokeWidth={3} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={110 + i * 40} cy={70} r={11} fill="#fff" opacity={punto(i)} />
          ))}
        </svg>
      </div>
      <div style={{ position: "absolute", top: 930, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, s + 0.5, s + 0.8, 0, 1, salida) }}>
        <span style={{ ...mono(32, 0.9), padding: "14px 28px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.6)" }}>{`↓ ${pie}`}</span>
      </div>
      <Arriba>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          {lineas.map((l, i) => (
            <Titular key={l} t={t} t0={s + 0.05 + i * 0.3} texto={l} size={size} />
          ))}
        </div>
      </Arriba>
    </>
  );
};

const FUNDE = 0.16;

// Transiciones entre pantallas: «fundido» (la de siempre) o «variada», que alterna barridos laterales y zooms con desenfoque
const paso = (tipo: string, entra: number, sale: number): React.CSSProperties => {
  const blur = (1 - entra + sale) * 16;
  if (tipo === "barrido" || tipo === "barrido-inv") {
    const dir = tipo === "barrido" ? 1 : -1;
    return { opacity: Math.min(entra * 2, 1) * (1 - sale), transform: `translateX(${dir * ((1 - entra) * 260 - sale * 260)}px) skewX(${dir * (1 - entra + sale) * -4}deg)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined };
  }
  if (tipo === "zoom") return { opacity: entra * (1 - sale), transform: `scale(${1.25 - 0.25 * entra - 0.12 * sale})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined };
  return { opacity: entra * (1 - sale), transform: `translateY(${(1 - entra) * 40 - sale * 40}px)` };
};
const TIPOS = ["barrido", "zoom", "barrido-inv", "zoom"];

// Gancho escrito: el titular del vídeo en grande desde el primer fotograma (sin fundido: quien hace scroll decide en
// menos de un segundo, muchas veces sin sonido). Las palabras entre * van en serif cursiva y con el color de acento.
export type GanchoT = { lineas: string[]; hasta: number; color?: string; colores?: string[]; top?: number; size?: number };
export const Gancho: React.FC<{ t: number; g: GanchoT }> = ({ t, g }) => {
  const fuera = lerp(t, g.hasta - 0.22, g.hasta, 0, 1, io);
  if (fuera >= 1) return null;
  // Ancho de cada línea en «em»: la serif cursiva va a 1,32× pero es más estrecha
  const largo = Math.max(...g.lineas.map((l) => l.split(" ").reduce((a, w) => a + w.replace(/\*/g, "").length * (w.startsWith("*") ? 0.6 : 0.56) + 0.24, -0.24)));
  const size = Math.min(g.size ?? 128, 930 / largo);
  const pop = 1 + 0.1 * Math.exp(-t * 14);
  return (
    <div style={{ position: "absolute", top: g.top ?? 235, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.08, opacity: 1 - fuera, transform: `translateY(${-fuera * 60}px) scale(${pop})`, transformOrigin: "50% 30%" }}>
      {g.lineas.map((linea, k) => (
        <div key={k} style={{ display: "flex", alignItems: "baseline", gap: size * 0.24, whiteSpace: "nowrap" }}>
          {linea.split(" ").map((w, i) => {
            const clave = w.startsWith("*");
            return (
              <span key={i} style={{ fontFamily: clave ? SERIF : SANS, fontStyle: clave ? "italic" : "normal", fontWeight: clave ? 400 : 800, fontSize: clave ? size * 1.32 : size, letterSpacing: clave ? "0" : "-0.02em", lineHeight: 1, color: clave ? (g.colores?.[k] ?? g.color ?? "#fff") : "#fff", textShadow: "0 0 2px rgba(0,0,0,0.9), 0 4px 18px rgba(0,0,0,0.85), 0 10px 50px rgba(0,0,0,0.7)" }}>
                {w.replace(/\*/g, "").replace(/_/g, " ")}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const Montaje: React.FC<{
  t: number;
  datos: Datos;
  audio: string;
  piezas: Record<string, React.FC<P>>;
  claves: Record<string, string>;
  fondo?: string;
  transicion?: "fundido" | "variada";
  vineta?: boolean;
  // ---- formato nuevo (todo opcional; sin estas opciones el vídeo sale como siempre)
  gancho?: GanchoT; // titular escrito en grande desde el fotograma 0; mientras está, no hay subtítulos
  zoom?: number; // escala base de las escenas, para llenar más el encuadre
  empujes?: number; // acercamiento seco alterno en cada frase (p. ej. 0.06): cambia el plano cada 2-3 s
  tinta?: number; // multiplica el grosor de los trazos 3D
  bucle?: boolean; // los últimos fotogramas funden con el primero para que enlace al repetirse
  subs?: { y?: number; tamano?: number; ancho?: number };
  // v3 «dopamina»: golpe de zoom seco (y fogonazo de color en los bordes si lleva color) en cada cifra o palabra clave
  golpes?: [number, string?][];
  // capa por encima de las escenas (y por debajo del gancho y los subtítulos): transiciones que cruzan un corte
  encima?: React.FC<{ t: number }>;
}> = ({ t, datos, audio, piezas, claves, fondo = "radial-gradient(ellipse 90% 70% at 50% 45%, #0b0b0c, #000)", transicion = "fundido", vineta = false, gancho, zoom = 1, empujes = 0, tinta = 1, bucle = false, subs = {}, golpes = [], encima: Encima }) => {
  const cortes = useMemo(() => datos.escenas.map((x) => x.s), [datos]);
  // Comienzo de cada frase (tras punto, interrogación, dos puntos o puntos suspensivos, o al cambiar de escena)
  const frases = useMemo(() => {
    const ini = [0];
    datos.palabras.forEach((p, i) => {
      const ant = datos.palabras[i - 1];
      if (ant && (/[.?!:…]$/.test(ant.w) || cortes.some((c) => c > ant.s && c <= p.s)) && p.s - ini[ini.length - 1] > 0.9) ini.push(p.s);
    });
    return ini;
  }, [datos, cortes]);
  const funde = transicion === "variada" ? 0.2 : FUNDE;
  let k = 0;
  while (k + 1 < frases.length && frases[k + 1] <= t) k++;
  const u = Math.min(1, Math.max(0, (t - frases[k]) / 0.12));
  const mezcla = 1 - Math.pow(1 - u, 3);
  const empuje = k === 0 ? 0 : (k % 2) * mezcla + ((k - 1) % 2) * (1 - mezcla);
  // Golpe: sube en 0,05 s y cae en ~0,3 s
  const fuerza = (g: number) => (t < g ? 0 : t - g < 0.05 ? (t - g) / 0.05 : Math.exp(-(t - g - 0.05) * 9));
  const punch = Math.min(1.2, golpes.reduce((a, [g]) => a + fuerza(g), 0));
  const fogonazo = golpes.filter(([g, c]) => c && t >= g && t - g < 0.6).map(([g, c]) => ({ c: c!, k: fuerza(g) }));
  const escala = zoom * (1 + empujes * empuje) * (1 + 0.05 * punch);
  const lazo = bucle ? lerp(t, datos.duracion - 0.4, datos.duracion - 0.06, 0, 1, io) : 0;
  const Primera = piezas[datos.escenas[0].id];
  return (
    <AbsoluteFill style={{ background: fondo }}>
      <Audio src={staticFile(audio)} />
      <Tinta.Provider value={tinta}>
        <AbsoluteFill style={{ transform: escala !== 1 ? `scale(${escala.toFixed(4)})` : undefined, transformOrigin: "50% 60%" }}>
          {datos.escenas
            .filter((p) => t >= p.s - funde && t < p.e + funde)
            .map((p) => {
              const j = datos.escenas.indexOf(p);
              const Pieza = piezas[p.id];
              const entra = p.s <= 0.01 ? 1 : lerp(t, p.s - funde, p.s + funde, 0, 1, io);
              const sale = p.e >= datos.duracion - 0.01 ? 0 : lerp(t, p.e - funde, p.e + funde, 0, 1, io);
              // La pantalla que sale usa la transición de la que entra, para que el corte se lea como un solo movimiento
              const tipo = transicion === "variada" ? (entra < 1 ? TIPOS[(j - 1 + TIPOS.length) % TIPOS.length] : TIPOS[j % TIPOS.length]) : "fundido";
              return (
                <AbsoluteFill key={p.id} style={paso(tipo, entra, sale)}>
                  <Pieza t={t} s={p.s} e={p.e} />
                </AbsoluteFill>
              );
            })}
        </AbsoluteFill>
        {lazo > 0.001 && (
          <AbsoluteFill style={{ opacity: lazo, background: fondo }}>
            <AbsoluteFill style={{ transform: zoom !== 1 ? `scale(${zoom})` : undefined, transformOrigin: "50% 60%" }}>
              <Primera t={0} s={datos.escenas[0].s} e={datos.escenas[0].e} />
            </AbsoluteFill>
            {gancho && <Gancho t={0.3} g={gancho} />}
          </AbsoluteFill>
        )}
      </Tinta.Provider>
      {vineta && <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 60% at 50% 45%, transparent 55%, rgba(0,0,0,0.6))", pointerEvents: "none" }} />}
      {Encima && <Encima t={t} />}
      {fogonazo.map(({ c, k }, i) => (
        <AbsoluteFill key={i} style={{ background: `radial-gradient(ellipse 80% 65% at 50% 45%, transparent 45%, ${c})`, opacity: 0.5 * k, pointerEvents: "none" }} />
      ))}
      {gancho && lazo < 0.5 && <Gancho t={t} g={gancho} />}
      {(!gancho || t >= gancho.hasta - 0.1) && lazo < 0.5 && <Subtitulos t={t} palabras={datos.palabras} cortes={cortes} claves={claves} duracion={datos.duracion} y={() => subs.y ?? 0.765} estilo="premium" dinamico tamano={subs.tamano} ancho={subs.ancho} />}
      <Progreso t={t} duracion={datos.duracion} />
    </AbsoluteFill>
  );
};

// Palabras clave de los subtítulos (en blanco, serif cursiva)
export const claves = (palabras: (string | [string, string])[]) => {
  const c: Record<string, string> = {};
  for (const w of palabras) if (typeof w === "string") c[w] = "#ffffff";
  else c[w[0]] = w[1];
  return c;
};
