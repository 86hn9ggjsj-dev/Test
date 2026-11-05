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
import { Aguanta, AGUANTA_FPS, AGUANTA_FRAMES } from "./Aguanta/Aguanta";
import { Ahorro, AHORRO_FPS, AHORRO_FRAMES } from "./Ahorro/Ahorro";
import { Ascensor, ASCENSOR_FPS, ASCENSOR_FRAMES } from "./Ascensor/Ascensor";
import { Cerebro, CEREBRO_FPS, CEREBRO_FRAMES } from "./Cerebro/Cerebro";
import { DopaminaReel, DOPAMINA_FPS, DOPAMINA_FRAMES } from "./Dopamina/Dopamina";
import { Redondos, REDONDOS_FPS, REDONDOS_FRAMES } from "./Redondos/Redondos";
import { Casino, CASINO_FPS, CASINO_FRAMES } from "./Casino/Casino";
import { Correlacion, CORRELACION_FPS, CORRELACION_FRAMES } from "./Correlacion/Correlacion";
import { Recuperar, RECUPERAR_FPS, RECUPERAR_FRAMES } from "./Recuperar/Recuperar";
import { Vivir, VIVIR_FPS, VIVIR_FRAMES } from "./Vivir/Vivir";
import { Instagram, INSTAGRAM_FPS, INSTAGRAM_FRAMES } from "./Instagram/Instagram";
import { Costes, COSTES_FPS, COSTES_FRAMES } from "./Costes/Costes";
import { Doblar, DOBLAR_FPS, DOBLAR_FRAMES } from "./Doblar/Doblar";
import { Moneda, MONEDA_FPS, MONEDA_FRAMES } from "./Moneda/Moneda";
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
        id="Aguanta"
        component={Aguanta}
        durationInFrames={AGUANTA_FRAMES}
        fps={AGUANTA_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Ascensor"
        component={Ascensor}
        durationInFrames={ASCENSOR_FRAMES}
        fps={ASCENSOR_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Cerebro"
        component={Cerebro}
        durationInFrames={CEREBRO_FRAMES}
        fps={CEREBRO_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Dopamina"
        component={DopaminaReel}
        durationInFrames={DOPAMINA_FRAMES}
        fps={DOPAMINA_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Redondos"
        component={Redondos}
        durationInFrames={REDONDOS_FRAMES}
        fps={REDONDOS_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Casino"
        component={Casino}
        durationInFrames={CASINO_FRAMES}
        fps={CASINO_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Correlacion"
        component={Correlacion}
        durationInFrames={CORRELACION_FRAMES}
        fps={CORRELACION_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Recuperar"
        component={Recuperar}
        durationInFrames={RECUPERAR_FRAMES}
        fps={RECUPERAR_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Vivir"
        component={Vivir}
        durationInFrames={VIVIR_FRAMES}
        fps={VIVIR_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Instagram"
        component={Instagram}
        durationInFrames={INSTAGRAM_FRAMES}
        fps={INSTAGRAM_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Costes"
        component={Costes}
        durationInFrames={COSTES_FRAMES}
        fps={COSTES_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Doblar"
        component={Doblar}
        durationInFrames={DOBLAR_FRAMES}
        fps={DOBLAR_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Moneda"
        component={Moneda}
        durationInFrames={MONEDA_FRAMES}
        fps={MONEDA_FPS}
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
