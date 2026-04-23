import { motion } from "framer-motion";
import { Cpu } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

import SceneTemplate from "./SceneTemplate";
import {
  SceneEyebrow,
  SceneHeadline,
  SURFACE_TITLE_CLASS,
  TOUR_GLASS_PANEL_CLASS,
  type SceneComponentProps,
} from "./shared";

const DEMOS = [
  {
    id: 1,
    title: "Creacion de Rutas con IA",
    description: "Generacion de rutas de aprendizaje automaticas.",
    url: "https://assets-sam.mkt.dynamics.com/2be9f283-e2e5-40bf-b6a6-d1e8356bf9a7/digitalassets/videos/6255db2c-1539-f111-88b3-000d3ac0461d?ts=639118866570000000",
  },
  {
    id: 2,
    title: "Generacion de Avatares",
    description: "Personaliza tu gemelo digital educativo.",
    url: "/audio-avatars/public/generating.mp4",
  },
  {
    id: 3,
    title: "Plataforma Inteligente",
    description: "El ecosistema de aprendizaje del futuro.",
    url: "https://assets-sam.mkt.dynamics.com/2be9f283-e2e5-40bf-b6a6-d1e8356bf9a7/digitalassets/videos/77f71e3f-5034-f111-88b4-000d3ac04e45?ts=639113622740000000",
  },
  { 
    id: 4, 
    title: "Contexto Inteligente",
    description: "Sincroniza tu LinkedIn y hoja de vida para adaptar la IA a tu perfil exacto.",
    url: "https://assets-sam.mkt.dynamics.com/2be9f283-e2e5-40bf-b6a6-d1e8356bf9a7/digitalassets/videos/81c67eea-5134-f111-88b4-000d3ac04e45?ts=639113629940000000" 
  },
  { 
    id: 4, 
    title: "Contexto Inteligente",
    description: "Sincroniza tu LinkedIn y hoja de vida para adaptar la IA a tu perfil exacto.",
    url: "https://assets-sam.mkt.dynamics.com/2be9f283-e2e5-40bf-b6a6-d1e8356bf9a7/digitalassets/videos/81c67eea-5134-f111-88b4-000d3ac04e45?ts=639113629940000000" 
  },
];

const DemoCard = ({ demo, t, index }: { demo: typeof DEMOS[0], t: any, index: number }) => {
  return (
    <div className={cn(TOUR_GLASS_PANEL_CLASS, "relative mx-auto flex w-full max-w-5xl flex-col overflow-hidden md:flex-row")}>
      <div className="flex flex-1 flex-col justify-center p-8 md:p-12">
        <h3 className={cn(SURFACE_TITLE_CLASS, "mt-0 pb-0 text-[clamp(1.6rem,2vw+1rem,3rem)]")}>
          {t(`tour.platformDemo.demos.${index}.title`)}
        </h3>
        <p className="mt-4 text-lg text-slate-700 dark:text-white/70 md:text-xl">
          {t(`tour.platformDemo.demos.${index}.desc`)}
        </p>
      </div>
      <div className="relative h-[300px] w-full overflow-hidden rounded-[28px] bg-slate-950 md:h-[450px] md:w-[50%]">
        <video
          src={demo.url}
          className="absolute inset-0 h-full w-full object-cover opacity-92"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
    </div>
  );
};

export default function ScenePlatformDemo(_: SceneComponentProps) {
  const { t } = useTranslation("landing");
  return (
    <SceneTemplate className="relative z-10 flex min-h-[100vh] w-full flex-col items-center justify-center py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="mb-16 px-4 text-center"
      >
        <div className="mb-6 flex justify-center">
          <SceneEyebrow icon={<Cpu className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />}>
            Arquitectura Viva
          </SceneEyebrow>
        </div>
        <SceneHeadline
          className="mx-auto max-w-[14ch] text-center text-[clamp(2.2rem,5.8vw,4.75rem)] leading-[1.02]"
          parts={[
            { text: t("tour.platformDemo.headline_1") },
            { text: t("tour.platformDemo.headline_2"), accent: "prisma" },
            { text: t("tour.platformDemo.headline_3"), breakBefore: true },
            { text: t("tour.platformDemo.headline_4"), accent: "neon" },
          ]}
        />
      </motion.div>

      <div className="flex w-full flex-col gap-12 px-4 md:px-12">
        {DEMOS.map((demo, index) => (
          <motion.div
            key={demo.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <DemoCard demo={demo} t={t} index={index} />
          </motion.div>
        ))}
      </div>
    </SceneTemplate>
  );
}
