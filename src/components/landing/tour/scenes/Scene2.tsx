import { CheckCircle2 } from "lucide-react";
import AnimatedText from "@/components/landing/tour/AnimatedText";
import TypewriterComponent from "typewriter-effect";
import { useTranslation } from "react-i18next";
import currentAudioEs from "@/assets/eli_scene2.mp3";
import currentAudioEn from "@/assets/eli_scene2_en.mp3";
import currentAudioPt from "@/assets/eli_scene2_pt.mp3";
import { useState } from "react";
import EliSphereSoundWaves from "@/components/ELI/EliSphereSoundWaves";
import TextSequence from "@/components/landing/tour/TextSequence";
import { cn } from "@/lib/utils";
import SceneTemplate from "./SceneTemplate";

import {
  LEAD_COPY_CLASS,
  SCENE_CONTAINER_CLASS,
  SCENE_HEADING_CLASS,
  SceneEyebrow,
  type SceneComponentProps,
} from "./shared";


const ELI_TIMINGS = {
  es: [
    { time: 0.0, key: "eli_intro" },
    { time: 4.5, key: "consume_evolve" },
    { time: 8.5, key: "designed_adapt" },
    { time: 13.5, key: "multimodal" },
    { time: 18.5, key: "stuck_project" },
    { time: 23.5, key: "analyze_routes" },
    { time: 27.5, key: "clear_friction" },
    { time: 31.5, key: "forget_menus" },
    { time: 35.5, key: "build_path" },
    { time: 39.5, key: "not_simple_chat" }
  ],
  en: [
    { time: 0.0, key: "eli_intro" },
    { time: 4.5, key: "consume_evolve" },
    { time: 8.5, key: "designed_adapt" },
    { time: 13.5, key: "multimodal" },
    { time: 18.5, key: "stuck_project" },
    { time: 23.5, key: "analyze_routes" },
    { time: 27.5, key: "clear_friction" },
    { time: 31.5, key: "forget_menus" },
    { time: 34.5, key: "build_path" },
    { time: 38.0, key: "not_simple_chat" }
  ],
  pt: [
    { time: 0.0, key: "eli_intro" },
    { time: 4.5, key: "consume_evolve" },
    { time: 8.5, key: "designed_adapt" },
    { time: 13.5, key: "multimodal" },
    { time: 18.5, key: "stuck_project" },
    { time: 23.5, key: "analyze_routes" },
    { time: 27.5, key: "clear_friction" },
    { time: 31.5, key: "forget_menus" },
    { time: 35.0, key: "build_path" },
    { time: 38.5, key: "not_simple_chat" }
  ]
};

const AUDIO_FILES = {
  es: currentAudioEs,
  en: currentAudioEn,
  pt: currentAudioPt
};



export default function Scene2(_: SceneComponentProps) {
  const { t, i18n } = useTranslation("landing");
  const currentLang = (i18n.language || "es").split("-")[0] as "es" | "en" | "pt";
  const activeLang = ELI_TIMINGS[currentLang] ? currentLang : "es";
  
  const currentSequence = ELI_TIMINGS[activeLang].map(item => ({ 
    time: item.time, 
    text: t(`tour.scene2.${item.key}`) 
  }));

  const currentAudio = AUDIO_FILES[activeLang];

  const ELI_PROMISES = [
    t('tour.scene2.promises.0'),
    t('tour.scene2.promises.1'),
    t('tour.scene2.promises.2'),
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const currentTime = e.currentTarget.currentTime;
    let newIndex = 0;
    for (let i = currentSequence.length - 1; i >= 0; i--) {
      if (currentTime >= currentSequence[i].time) {
        newIndex = i;
        break;
      }
    }
    if (newIndex !== -1 && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <SceneTemplate
      className={cn(
        "lg:grid-cols-[minmax(0,0.84fr)_minmax(20rem,1.16fr)] 2xl:grid-cols-[minmax(0,0.78fr)_minmax(28rem,1.22fr)] items-start lg:items-center",
      )}
    >
      {/* 1. HEADER (Title & Eyebrow) */}
      <div className="order-1 lg:col-start-1 lg:row-start-1 flex flex-col justify-end space-y-5 xl:space-y-6 w-full relative z-20">
        <SceneEyebrow>
          <AnimatedText text={t("tour.scene2.eyebrow")} className="" />
        </SceneEyebrow>
        <h2 className={cn(SCENE_HEADING_CLASS, "bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-orange bg-clip-text text-transparent dark:text-transparent pb-3")}>
          <TypewriterComponent
            key={t("tour.scene2.headline")}
            component="span"
            onInit={(typewriter) => {
              typewriter.typeString(t("tour.scene2.headline")).start();
            }}
            options={{
              cursor: "|",
              autoStart: true,
              loop: false,
              delay: 40,
              wrapperClassName: "typewriter-wrapper",
            }}
          />
        </h2>
      </div>

      {/* 2. SPHERE (Visual Simulation Box) */}
      <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-3 w-full min-w-0 mt-8 mb-6 lg:my-0 flex flex-col justify-center relative z-10">
        <div className="relative w-full rounded-[32px] p-[1px] bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-orange shadow-xl shadow-black/5 dark:shadow-lg shadow-black/5 dark:shadow-[0_0_40px_rgba(123,44,191,0.05)]">
          <div className="relative flex h-[clamp(20rem,48svh,38rem)] w-full min-w-0 flex-col overflow-hidden rounded-[31px] bg-slate-50 dark:bg-[#0A0A0A] p-5 md:p-6 xl:h-[clamp(22rem,52svh,40rem)] xl:p-7">
            <p className="mb-4 text-xs font-display uppercase tracking-[0.18em] text-brand-neon">
              Simulación
            </p>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-transparent">
              <div className="relative flex aspect-square w-full max-w-[320px] items-center justify-center md:max-w-[400px]">
                <EliSphereSoundWaves audioSrc={currentAudio} onTimeUpdate={handleTimeUpdate} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SUBTITLES (Audio-synced TextSequence) */}
      <div className={cn(LEAD_COPY_CLASS, "order-3 lg:col-start-1 lg:row-start-2 w-full relative z-20 flex flex-col justify-center min-h-[5rem] lg:mt-4")}>
        <TextSequence sequenceData={currentSequence} activeIndex={activeIndex} />
      </div>

      {/* 4. PROMISES (Checklist) */}
      <div className="order-4 lg:col-start-1 lg:row-start-3 mt-8 lg:mt-0 grid gap-3 w-full relative z-20 flex-col justify-start">
        {ELI_PROMISES.map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 sm:gap-4 py-2 group transition-all duration-300 hover:translate-x-1"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-neon" />
            <p className="min-w-0 text-sm sm:text-base leading-[1.6] text-slate-700 font-medium dark:font-normal dark:text-white/75 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300">{item}</p>
          </div>
        ))}
      </div>
    </SceneTemplate>
  );
}
