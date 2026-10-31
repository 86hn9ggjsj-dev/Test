// Raíz solo con los reels de alcance del día: se renderiza con `npx remotion render src/reels.ts <Id> …` y no necesita
// los tiempos (src/gen/*.json) de los videos anteriores, que dependen de sus locuciones originales.
import { Composition } from "remotion";
import { Ahorro, AHORRO_FPS, AHORRO_FRAMES } from "./Ahorro/Ahorro";
import { MEDIA_FPS, MEDIA_FRAMES, MediaReel } from "./Media/Media";
import { Miedo, MIEDO_FPS, MIEDO_FRAMES } from "./Miedo/Miedo";
import { Nueve, NUEVE_FPS, NUEVE_FRAMES } from "./Nueve/Nueve";
import { Promediar, PROMEDIAR_FPS, PROMEDIAR_FRAMES } from "./Promediar/Promediar";
import { Rachas, RACHAS_FPS, RACHAS_FRAMES } from "./Rachas/Rachas";
import { Regla72, REGLA72_FPS, REGLA72_FRAMES } from "./Regla72/Regla72";
import { ALTO, ANCHO } from "./Viral/util";

export const RaizReels: React.FC = () => (
  <>
    <Composition id="Ahorro" component={Ahorro} durationInFrames={AHORRO_FRAMES} fps={AHORRO_FPS} width={ANCHO} height={ALTO} />
    <Composition id="Promediar" component={Promediar} durationInFrames={PROMEDIAR_FRAMES} fps={PROMEDIAR_FPS} width={ANCHO} height={ALTO} />
    <Composition id="Miedo" component={Miedo} durationInFrames={MIEDO_FRAMES} fps={MIEDO_FPS} width={ANCHO} height={ALTO} />
    <Composition id="Media" component={MediaReel} durationInFrames={MEDIA_FRAMES} fps={MEDIA_FPS} width={ANCHO} height={ALTO} />
    <Composition id="Nueve" component={Nueve} durationInFrames={NUEVE_FRAMES} fps={NUEVE_FPS} width={ANCHO} height={ALTO} />
    <Composition id="Regla72" component={Regla72} durationInFrames={REGLA72_FRAMES} fps={REGLA72_FPS} width={ANCHO} height={ALTO} />
    <Composition id="Rachas" component={Rachas} durationInFrames={RACHAS_FRAMES} fps={RACHAS_FPS} width={ANCHO} height={ALTO} />
  </>
);
