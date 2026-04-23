import { motion } from "framer-motion";
import { ShieldAlert, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import TypewriterComponent from "typewriter-effect";

import ParticleField from "@/components/landing/ParticleField";
import AnimatedText from "@/components/landing/tour/AnimatedText";
import TextSequence from "@/components/landing/tour/TextSequence";
import powerPrism from "@/assets/power-prism-dark.webp";
import { cn } from "@/lib/utils";
import SceneTemplate from "./SceneTemplate";
import BottomScrollZone from "./BottomScrollZone";

import {
  HERO_HEADLINE_CLASS,
  LEAD_COPY_CLASS,
  SCENE_CONTAINER_CLASS,
  SceneEyebrow,
  type SceneComponentProps,
} from "./shared";


export default function Scene1(props: SceneComponentProps) {
  const { t } = useTranslation('landing');
  const HERO_SEQUENCE = [
    {
      text: t('tour.scene1.typewriter'),
      durationMs: 5000
    },
  ];
  return (
    <SceneTemplate
      className={cn(
        "lg:grid-cols-[minmax(0,1.18fr)_minmax(22rem,0.82fr)] 2xl:grid-cols-[minmax(0,1.24fr)_minmax(24rem,0.76fr)]",
      )}
    >
      {/* LEFT PANEL (Problem Awareness) */}
      <div className="relative z-10 flex min-w-0 flex-col justify-center space-y-6 xl:space-y-8">
        <SceneEyebrow>
          <AnimatedText
            text={t("tour.scene1.eyebrow")}
            className=""
          />
        </SceneEyebrow>

        <div className="space-y-5 xl:space-y-6 mt-4">
          {/* Restored text with Prisma gradient applied via Typewriter component wrapper */}
          <h1 className={cn(HERO_HEADLINE_CLASS, "bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-orange bg-clip-text text-transparent dark:text-transparent pb-3")}>
            <TypewriterComponent
              key={t("tour.scene1.headline")}
              component="span"
              onInit={(typewriter) => {
                typewriter.typeString(t("tour.scene1.headline")).start();
              }}
              options={{
                cursor: "|",
                autoStart: true,
                loop: false,
                delay: 40,
                wrapperClassName: "typewriter-wrapper",
              }}
            />
          </h1>

          {/* <ParticleField /> */}

          <div className={cn(LEAD_COPY_CLASS, "mt-12")}>
            <TextSequence sequenceData={HERO_SEQUENCE} className={LEAD_COPY_CLASS} />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (Power Button Visual) */}
      <div className="relative flex h-[240px] md:h-[400px] w-full min-w-0 items-center justify-center overflow-hidden rounded-[32px] bg-black/5 dark:bg-white/[0.03] p-[1px] lg:h-full">
        {/* Prisma Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-orange opacity-40 rounded-[32px]"></div>

        {/* Inner Card content */}
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[31px] bg-slate-50 dark:bg-[#0A0A0A] p-5 shadow-xl shadow-black/5 dark:shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-xl shadow-black/5 dark:shadow-[0_0_40px_rgba(123,44,191,0.05)] backdrop-blur-xl md:p-6 xl:p-7">
          {/* Dynamic background glow based on Prisma palette */}
          <div className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-purple/20 blur-[80px] dark:bg-brand-purple/10"></div>

          <div className="absolute left-6 top-6 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-orange-600 dark:text-brand-orange" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600 dark:text-brand-orange">{t("tour.scene1.card_tag")}</p>
          </div>

          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 flex h-64 w-64 items-center justify-center md:h-80 md:w-80"
          >
            <img src={powerPrism} alt="Power Button" className="h-full w-full object-contain drop-shadow-2xl" />
          </motion.div>
        </div>
      </div>

      <BottomScrollZone onClick={props.onNextScene} />
    </SceneTemplate>
  );
}
