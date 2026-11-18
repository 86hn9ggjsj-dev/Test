// Reel de alcance de Halloween "Tres cifras del trading que dan más miedo que Halloween" (~37 s): una calabaza de alambre
// que se enciende, el 1 % que con ×100 vacía la cuenta, el +100 % que hace falta tras perder la mitad, los 7-9 de cada 10
// cubos que se apagan y la calabaza que se apaga con la cura. Tiempos en src/gen/miedo.json (scripts/miedo.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/miedo.json";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { Arriba, Etiqueta, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { claves, CtaSeguir, Destello, Gigante, golpe, Kicker, Montaje, P, sacude } from "../Explica/Montaje";

export const MIEDO_FPS = datos.fps;
export const MIEDO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// ------------------------------------------------------------------ calabaza de alambre
const C: V3 = [0, 0.05, 0];
const RX = 0.75;
const RY = 0.55;
const sup = ([x, y]: number[]): V3 => [C[0] + x, C[1] + y, RX * Math.sqrt(Math.max(1 - (x / RX) ** 2 - (y / RY) ** 2, 0)) + 0.01];
const OJO = (cx: number) => [[cx - 0.13, 0.08], [cx + 0.13, 0.08], [cx, 0.27], [cx - 0.13, 0.08]];
const NARIZ = [[-0.06, -0.03], [0.06, -0.03], [0, 0.07], [-0.06, -0.03]];
const BOCA = [[-0.42, -0.12], [-0.3, -0.2], [-0.2, -0.13], [-0.1, -0.22], [0, -0.14], [0.1, -0.22], [0.2, -0.13], [0.3, -0.2], [0.42, -0.12], [0.3, -0.31], [0, -0.37], [-0.3, -0.31], [-0.42, -0.12]];
const calabaza = (tr: Trazo[], g: number, luz: number, o = 1) => {
  const s = Math.min(g, 1.05);
  const esc = (p: V3): V3 => [C[0] + (p[0] - C[0]) * s, C[1] + (p[1] - C[1]) * s, C[2] + (p[2] - C[2]) * s];
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 8;
    const pts: V3[] = Array.from({ length: 49 }, (_, j) => {
      const th = (j / 48) * Math.PI * 2;
      return esc([C[0] + RX * Math.cos(th) * Math.cos(a), C[1] + RY * Math.sin(th), C[2] + RX * Math.cos(th) * Math.sin(a)]);
    });
    tr.push({ t: "p", pts, w: 1.2, o: 0.6 * o });
  }
  tr.push({ t: "p", pts: circulo(C, RX, "y", 64).map(esc), w: 1.6, o });
  tr.push({ t: "p", pts: ([[0, C[1] + RY - 0.02, 0], [0.03, C[1] + RY + 0.12, 0], [0.1, C[1] + RY + 0.2, 0]] as V3[]).map(esc), w: 3, o });
  for (const forma of [OJO(-0.27), OJO(0.27), NARIZ, BOCA]) tr.push({ t: "p", pts: forma.map(sup).map(esc), w: 2.2, o, luz });
};

// ------------------------------------------------------------------ 1. Hook: ¿quieres pasar miedo?
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.05, 0], L(t, s, e, 5.6, 5.0), L(t, s, e, -0.45, 0.3), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.35)];
  const enciende = L(t, EV.halloween - 0.3, EV.halloween + 0.2, 0.15, 1, salida) * (0.85 + 0.15 * Math.sin(t * 23));
  calabaza(tr, muelle(t, -0.6, 140, 14), enciende);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Kicker t={t} t0={-0.5} texto="NOCHE DE HALLOWEEN" />
      <Destello t={t} t0={EV.halloween - 0.1} o={0.12} />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.tres - 0.35} texto="¿quieres pasar *miedo*?" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.tres - 0.3} texto="3 cifras de *terror*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ bloque de la cuenta (para las cifras 1 y 2)
const BASE = -0.75;
const bloque = (tr: Trazo[], y0: number, y1: number, o = 1, luz = 0.25, dash?: string, dx = 0) => {
  for (const [a, b] of caja([-0.6 + dx, y0, -0.25], [0.6 + dx, y1, 0.25])) tr.push({ t: "l", a, b, w: 1.8, o, luz, dash });
};
const camBloque = (t: number, s: number, e: number, t0: number) =>
  orbita([0, -0.3, 0], L(t, s, e, 7.0, 6.6), L(t, s, e, -0.3, -0.05) + sacude(t, t0), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 1000 });

// ------------------------------------------------------------------ 2. Uno: el 1 % con ×100 se lo lleva todo
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = camBloque(t, s, e, EV.todo - 0.05);
  const tr: Trazo[] = [...polvo(0.3)];
  const H = 0.6;
  const g = muelle(t, s + 0.1, 170, 15);
  const h = L(t, EV.contra - 0.1, EV.todo, 1, 0, (u) => u * u);
  if (h > 0.005) bloque(tr, BASE, BASE + H * h * Math.min(g, 1.05));
  // Lo que se va cae en trozos
  for (let k = 0; k < 4; k++) {
    const tk = EV.contra + (k * (EV.todo - EV.contra)) / 4;
    const u = L(t, tk, tk + 0.8, 0, 1, (x) => x);
    if (t < tk || u >= 1) continue;
    const y1 = BASE + H * (1 - k / 4);
    bloque(tr, y1 - H / 4 - 1.4 * u * u, y1 - 1.4 * u * u, 0.8 * (1 - u), 0, "4 5", (k % 2 ? 1 : -1) * 0.3 * u);
  }
  tr.push({ t: "l", a: [-0.9, BASE, 0], b: [0.9, BASE, 0], w: 1.2, o: 0.5 });
  const pr = proyector(cam);
  const q = pr([0, BASE + H * Math.max(h, 0), 0.25]);
  const k = golpe(t, EV.todo - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Kicker t={t} t0={s + 0.05} texto="CIFRA 1 DE 3" />
      <Gigante t={t} t0={EV.unopct - 0.12} texto="1 %" top={460} size={220} pie="EN CONTRA" />
      <Etiqueta t={t} t0={EV.cien - 0.1} x={780} y={590} size={72}>
        ×100
      </Etiqueta>
      <div style={{ position: "absolute", left: q.x, top: q.y - 74, transform: `translateX(-50%) scale(${1 + 0.3 * k})`, opacity: Math.min(g * 1.5, 1), ...mono(56) }}>{`${Math.round(100 * h)} %`}</div>
      <div style={{ position: "absolute", left: pr([0, BASE, 0.25]).x, top: pr([0, BASE, 0.25]).y + 22, transform: "translateX(-50%)", opacity: Math.min(g * 1.5, 1), ...mono(28, 0.7) }}>TU DINERO</div>
      <Destello t={t} t0={EV.todo - 0.05} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.cien - 0.4} texto="uno: el *1 %*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cien - 0.35} fin={EV.todo - 0.4} texto="con *×100*…" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.todo - 0.35} texto="se lo lleva *todo*" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: pierdes la mitad y necesitas un +100 %
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = camBloque(t, s, e, EV.mitad - 0.05);
  const tr: Trazo[] = [...polvo(0.3)];
  const H = 0.7;
  const g = muelle(t, s + 0.1, 170, 15);
  const parte = t >= EV.mitad - 0.1;
  bloque(tr, BASE, BASE + (parte ? H / 2 : H) * Math.min(g, 1.05));
  // La mitad de arriba se cae
  const u = L(t, EV.mitad - 0.1, EV.mitad + 0.8, 0, 1, (x) => x);
  if (parte && u < 1) bloque(tr, BASE + H / 2 - 1.5 * u * u, BASE + H - 1.5 * u * u, 0.9 * (1 - u), 0, "4 5", 0.4 * u);
  // Hay que doblar lo que queda para volver
  const sube = L(t, EV.doblar - 0.1, EV.empezar, 0, 1, salida);
  if (sube > 0) bloque(tr, BASE + H / 2, BASE + H / 2 + (H / 2) * sube, 1, 0.6, "6 5");
  tr.push({ t: "l", a: [-0.9, BASE, 0], b: [0.9, BASE, 0], w: 1.2, o: 0.5 });
  const pr = proyector(cam);
  const valor = !parte ? 1000 : sube > 0 ? 500 + 500 * sube : 500;
  const q = pr([0, BASE + (parte ? H / 2 + (H / 2) * sube : H), 0.25]);
  const lado = pr([0.6, BASE + H * 0.75, 0.25]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Kicker t={t} t0={s + 0.05} texto="CIFRA 2 DE 3" />
      <Gigante t={t} t0={EV.ciento - 0.12} texto="+100 %" top={460} size={200} pie="PARA VOLVER A EMPEZAR" />
      <div style={{ position: "absolute", left: q.x, top: q.y - 74, transform: "translateX(-50%)", opacity: Math.min(g * 1.5, 1), ...mono(56) }}>{`${euros(valor)} €`}</div>
      <Etiqueta t={t} t0={EV.doblar - 0.05} x={lado.x + 24} y={lado.y} size={44}>
        +100 %
      </Etiqueta>
      <Destello t={t} t0={EV.mitad - 0.05} o={0.18} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.mitad - 0.4} texto="dos: el *100 %*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.mitad - 0.35} fin={EV.doblar - 0.4} texto="pierdes la *mitad*" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.doblar - 0.35} texto="toca *doblar*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Tres: entre 7 y 9 de cada 10 cuentas pierden
const XH = (k: number) => -0.95 + k * 0.21;
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.3, 0], L(t, s, e, 6.6, 6.2), L(t, s, e, -0.3, -0.1) + sacude(t, EV.nueve - 0.05), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 1020 });
  const tr: Trazo[] = [...polvo(0.3)];
  const y = -0.45;
  const pierde = (k: number) => (k < 7 ? muelle(t, EV.siete - 0.15 + k * 0.04, 200, 14) : k < 9 ? muelle(t, EV.nueve - 0.1, 200, 14) : 0);
  for (let k = 0; k < 10; k++) {
    const g = muelle(t, s + 0.05 + k * 0.04, 220, 15);
    if (g <= 0) continue;
    const p = Math.max(Math.min(pierde(k), 1), 0);
    const r = (0.15 * Math.min(g, 1.1)) / 2;
    const yc = y - 0.12 * p;
    const o = 1 - (k < 7 ? 0.55 : 0.35) * p;
    for (const [a, b] of caja([XH(k) - r, yc - r, -r], [XH(k) + r, yc + r, r])) tr.push({ t: "l", a, b, w: 1.6, o, dash: p > 0.5 ? (k < 7 ? "3 4" : "6 4") : undefined, luz: p > 0.5 ? 0 : 0.3 });
  }
  const pr = proyector(cam);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {Array.from({ length: 10 }, (_, k) => {
        const p = Math.max(Math.min(pierde(k), 1), 0);
        const q = pr([XH(k), y + 0.14, 0]);
        return (
          <div key={k} style={{ position: "absolute", left: q.x, top: q.y - 48, transform: "translateX(-50%)", opacity: k === 9 ? L(t, EV.nueve, EV.nueve + 0.3, 0, 1) : p * (k < 7 ? 1 : 0.7), ...mono(34) }}>
            {k === 9 ? "✓" : k < 7 ? "✕" : "✕?"}
          </div>
        );
      })}
      <Kicker t={t} t0={s + 0.05} texto="CIFRA 3 DE 3 · ESMA, 2018" />
      <Gigante t={t} t0={EV.siete - 0.12} texto="7-9" top={460} size={220} pie="DE CADA 10 PIERDEN" />
      <Destello t={t} t0={EV.nueve - 0.05} o={0.18} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.siete - 0.4} texto="según el *regulador*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.siete - 0.35} texto="*7 a 9* de cada 10" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Cura: arriesgar poco; la calabaza se apaga
const Cura: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.05, 0], L(t, s, e, 5.4, 5.8), L(t, s, e, 0.3, -0.1), L(t, s, e, 0.16, 0.12), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  const apaga = L(t, EV.poco - 0.3, EV.poco + 0.5, 0, 1, salida);
  calabaza(tr, 1, (1 - apaga) * (0.85 + 0.15 * Math.sin(t * 23)), 1 - 0.5 * apaga);
  const raya = L(t, EV.poco - 0.2, EV.poco + 0.3, 0, 1, salida);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 1260, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, s + 0.2, s + 0.6, 0, 1, salida) * (1 - 0.4 * raya) }}>
        <span style={{ position: "relative", ...mono(44) }}>
          1 % · +100 % · 7-9/10
          <span style={{ position: "absolute", left: -12, top: "52%", height: 5, width: `calc(${raya * 100}% + ${raya * 24}px)`, background: "#fff" }} />
        </span>
      </div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.poco - 0.4} texto="la misma *cura*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.poco - 0.35} texto="arriesgar *poco*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. CTA
const Cta: React.FC<P> = (p) => <CtaSeguir {...p} lema="FELIZ HALLOWEEN · MÁS CUENTAS QUE NADIE TE HACE" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, tres: Tres, cura: Cura, cta: Cta };
export const CLAVES = claves(["miedo", "Halloween", "1%", "100", "todo", "100%", "mitad", "doblar", "regulador", "7", "9", "pierden", "cura", "poco", "sígueme"]);

export const Miedo: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/miedo_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
