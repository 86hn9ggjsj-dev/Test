// Tiempos del video Viral (src/gen/timeline.json, generado por scripts/audio.py). Aparte de util.ts para que el resto
// de composiciones no dependan de esa locución.
import timeline from "../gen/timeline.json";

export const TL = timeline;

export const palabra = (i: number, hook = false) => {
  const p = TL.palabras.find((w) => w.i === i && w.hook === hook);
  if (!p) throw new Error(`palabra ${i}`);
  return p;
};
export const escena = (id: string) => {
  const e = TL.escenas.find((x) => x.id === id);
  if (!e) throw new Error(`escena ${id}`);
  return e;
};
