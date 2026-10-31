import { Composition } from "remotion";
import { Acierto, ACIERTO_FPS, ACIERTO_FRAMES } from "./Acierto/Acierto";
import { Bot, BOT_FPS, BOT_FRAMES } from "./Bot/Bot";
import { Cazastop, CAZASTOP_FPS, CAZASTOP_FRAMES } from "./Cazastop/Cazastop";
import { Cincuenta, CINCUENTA_FPS, CINCUENTA_FRAMES } from "./Cincuenta/Cincuenta";
import { Cifras, CIFRAS_FPS, CIFRAS_FRAMES } from "./Cifras/Cifras";
import { Errores, ERRORES_FPS, ERRORES_FRAMES } from "./Errores/Errores";
import { Estafa, ESTAFA_FPS, ESTAFA_FRAMES } from "./Estafa/Estafa";
import { BotMG } from "./Bot/BotMG";
import { Explica, EXPLICA_FPS, EXPLICA_FRAMES } from "./Explica/Explica";
import { Ganapierde, GANAPIERDE_FPS, GANAPIERDE_FRAMES } from "./Ganapierde/Ganapierde";
import { Intro } from "./Intro";
import { Prueba, PRUEBA_FPS, PRUEBA_FRAMES } from "./Prueba/Prueba";
import { Ahorro, AHORRO_FPS, AHORRO_FRAMES } from "./Ahorro/Ahorro";
import { MEDIA_FPS, MEDIA_FRAMES, MediaReel } from "./Media/Media";
import { Miedo, MIEDO_FPS, MIEDO_FRAMES } from "./Miedo/Miedo";
import { Promediar, PROMEDIAR_FPS, PROMEDIAR_FRAMES } from "./Promediar/Promediar";
import { Nueve, NUEVE_FPS, NUEVE_FRAMES } from "./Nueve/Nueve";
import { Rachas, RACHAS_FPS, RACHAS_FRAMES } from "./Rachas/Rachas";
import { Regla72, REGLA72_FPS, REGLA72_FRAMES } from "./Regla72/Regla72";
import { Reto, RETO_FPS, RETO_FRAMES } from "./Reto/Reto";
import { Stop, STOP_FPS, STOP_FRAMES } from "./Stop/Stop";
import { Unodiario, UNODIARIO_FPS, UNODIARIO_FRAMES } from "./Unodiario/Unodiario";
import { DURACION_FRAMES, Viral } from "./Viral/Viral";
import { ALTO, ANCHO, FPS } from "./Viral/util";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Intro"
        component={Intro}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Viral"
        component={Viral}
        durationInFrames={DURACION_FRAMES}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Bot"
        component={Bot}
        durationInFrames={BOT_FRAMES}
        fps={BOT_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="BotMG"
        component={BotMG}
        durationInFrames={BOT_FRAMES}
        fps={BOT_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Explica"
        component={Explica}
        durationInFrames={EXPLICA_FRAMES}
        fps={EXPLICA_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Prueba"
        component={Prueba}
        durationInFrames={PRUEBA_FRAMES}
        fps={PRUEBA_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Errores"
        component={Errores}
        durationInFrames={ERRORES_FRAMES}
        fps={ERRORES_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Cifras"
        component={Cifras}
        durationInFrames={CIFRAS_FRAMES}
        fps={CIFRAS_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Estafa"
        component={Estafa}
        durationInFrames={ESTAFA_FRAMES}
        fps={ESTAFA_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Acierto"
        component={Acierto}
        durationInFrames={ACIERTO_FRAMES}
        fps={ACIERTO_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Stop"
        component={Stop}
        durationInFrames={STOP_FRAMES}
        fps={STOP_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Cincuenta"
        component={Cincuenta}
        durationInFrames={CINCUENTA_FRAMES}
        fps={CINCUENTA_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Cazastop"
        component={Cazastop}
        durationInFrames={CAZASTOP_FRAMES}
        fps={CAZASTOP_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Ganapierde"
        component={Ganapierde}
        durationInFrames={GANAPIERDE_FRAMES}
        fps={GANAPIERDE_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Unodiario"
        component={Unodiario}
        durationInFrames={UNODIARIO_FRAMES}
        fps={UNODIARIO_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Nueve"
        component={Nueve}
        durationInFrames={NUEVE_FRAMES}
        fps={NUEVE_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Regla72"
        component={Regla72}
        durationInFrames={REGLA72_FRAMES}
        fps={REGLA72_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Rachas"
        component={Rachas}
        durationInFrames={RACHAS_FRAMES}
        fps={RACHAS_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Media"
        component={MediaReel}
        durationInFrames={MEDIA_FRAMES}
        fps={MEDIA_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Ahorro"
        component={Ahorro}
        durationInFrames={AHORRO_FRAMES}
        fps={AHORRO_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Promediar"
        component={Promediar}
        durationInFrames={PROMEDIAR_FRAMES}
        fps={PROMEDIAR_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Miedo"
        component={Miedo}
        durationInFrames={MIEDO_FRAMES}
        fps={MIEDO_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Reto"
        component={Reto}
        durationInFrames={RETO_FRAMES}
        fps={RETO_FPS}
        width={ANCHO}
        height={ALTO}
      />
    </>
  );
};
