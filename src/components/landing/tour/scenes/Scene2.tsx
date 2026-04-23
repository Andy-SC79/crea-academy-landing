import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import EliSphereSoundWaves from "@/components/ELI/EliSphereSoundWaves";
import AnimatedText from "@/components/landing/tour/AnimatedText";
import TextSequence from "@/components/landing/tour/TextSequence";
import { cn } from "@/lib/utils";

import SceneTemplate from "./SceneTemplate";
import {
  LEAD_COPY_CLASS,
  SceneHeadline,
  SceneEyebrow,
  TOUR_FRAME_CLASS,
  TOUR_SURFACE_CLASS,
  type SceneComponentProps,
} from "./shared";

const ELI_TIMINGS = {
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
    { time: 38.0, key: "not_simple_chat" },
  ],
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
    { time: 39.5, key: "not_simple_chat" },
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
    { time: 38.5, key: "not_simple_chat" },
  ],
};

export default function Scene2(_: SceneComponentProps) {
  const { i18n, t } = useTranslation("landing");
  const currentLang = (i18n.language || "es").split("-")[0] as "en" | "es" | "pt";
  const activeLang = ELI_TIMINGS[currentLang] ? currentLang : "es";
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentAudio, setCurrentAudio] = useState<string>("");

  const currentSequence = ELI_TIMINGS[activeLang].map((item) => ({
    text: t(`tour.scene2.${item.key}`),
    time: item.time,
  }));

  useEffect(() => {
    const loadAudio = async () => {
      let audioPath;

      if (activeLang === "en") {
        audioPath = (await import("@/assets/eli_scene2_en.mp3")).default;
      } else if (activeLang === "pt") {
        audioPath = (await import("@/assets/eli_scene2_pt.mp3")).default;
      } else {
        audioPath = (await import("@/assets/eli_scene2.mp3")).default;
      }

      setCurrentAudio(audioPath);
    };

    loadAudio();
  }, [activeLang]);

  const eliPromises = [
    t("tour.scene2.promises.0"),
    t("tour.scene2.promises.1"),
    t("tour.scene2.promises.2"),
  ];

  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLAudioElement>) => {
    const currentTime = event.currentTarget.currentTime;
    let newIndex = 0;

    for (let index = currentSequence.length - 1; index >= 0; index -= 1) {
      if (currentTime >= currentSequence[index].time) {
        newIndex = index;
        break;
      }
    }

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <SceneTemplate
      className={cn(
        "lg:grid-cols-[minmax(0,0.84fr)_minmax(20rem,1.16fr)] 2xl:grid-cols-[minmax(0,0.78fr)_minmax(28rem,1.22fr)] items-start lg:items-center",
      )}
    >
      <div className="relative z-20 order-1 flex w-full flex-col items-center lg:items-start text-center lg:text-left justify-end space-y-5 lg:col-start-1 lg:row-start-1 xl:space-y-6">
        <div className="flex justify-center lg:justify-start w-full mb-4"><SceneEyebrow>
          <AnimatedText text={t("tour.scene2.eyebrow")} className="" />
        </SceneEyebrow></div>
        <SceneHeadline 
          parts={[
            { text: t("tour.scene2.headline_1") },
            { text: t("tour.scene2.headline_2"), accent: "prisma" },
            { text: t("tour.scene2.headline_3") },
            { text: t("tour.scene2.headline_4"), accent: "neon" },
            ...(t("tour.scene2.headline_5") !== "tour.scene2.headline_5" && t("tour.scene2.headline_5") ? [{ text: t("tour.scene2.headline_5") }] : [])
          ]} 
        />
      </div>

      <div className="relative z-10 order-2 my-8 flex w-full min-w-0 flex-col justify-center lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:my-0">
        <div className={TOUR_FRAME_CLASS}>
          <div className={cn(TOUR_SURFACE_CLASS, "flex h-[clamp(20rem,48svh,38rem)] w-full min-w-0 flex-col p-5 md:p-6 xl:h-[clamp(22rem,52svh,40rem)] xl:p-7")}>
            <p className="mb-4 text-xs font-display font-black uppercase tracking-[0.18em] text-[#00A859] dark:text-brand-neon/80">
              Simulacion
            </p>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-transparent">
              <div className="relative flex aspect-square w-full max-w-[320px] items-center justify-center md:max-w-[400px]">
                <EliSphereSoundWaves audioSrc={currentAudio} onTimeUpdate={handleTimeUpdate} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 order-3 flex min-h-[5rem] w-full flex-col justify-center lg:col-start-1 lg:row-start-2 lg:mt-4 lg:pr-8">
        <div className="relative w-full max-w-[44rem] rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-brand-cyan/30 dark:bg-[#0A1628]/95 dark:shadow-[0_8px_32px_rgba(0,229,255,0.08)] sm:p-8 lg:rounded-[2.5rem] lg:rounded-tr-2xl">
          
          {/* Cola apuntando hacia ARRIBA (Mobile) */}
          <div className="absolute -top-[10px] right-[40px] h-[10px] w-[20px] overflow-hidden lg:hidden">
            <div className="absolute bottom-0 left-1/2 h-[14px] w-[14px] origin-center -translate-x-1/2 translate-y-1/2 rotate-45 border-l border-t border-slate-200/80 bg-white dark:border-brand-cyan/30 dark:bg-[#0A1628]" />
          </div>

          {/* Cola apuntando hacia la DERECHA (Desktop) */}
          <div className="absolute -right-[10px] top-[32px] hidden h-[20px] w-[10px] overflow-hidden lg:block">
            <div className="absolute left-0 top-1/2 h-[14px] w-[14px] origin-center -translate-x-1/2 -translate-y-1/2 rotate-45 border-r border-t border-slate-200/80 bg-white dark:border-brand-cyan/30 dark:bg-[#0A1628]" />
          </div>
          
          <div className={LEAD_COPY_CLASS}>
            <TextSequence sequenceData={currentSequence} activeIndex={activeIndex} />
          </div>
        </div>
      </div>

      <div className="relative z-20 order-4 mt-8 grid w-full gap-3 lg:col-start-1 lg:row-start-3 lg:mt-0">
        {eliPromises.map((item) => (
          <div
            key={item}
            className="group flex items-start gap-3 py-2 transition-all duration-300 hover:translate-x-1 sm:gap-4"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-neon" />
            <p className="min-w-0 text-sm font-medium leading-[1.6] text-slate-700 transition-colors duration-300 group-hover:text-slate-900 dark:font-normal dark:text-white/75 dark:group-hover:text-white sm:text-base">
              {item}
            </p>
          </div>
        ))}
      </div>
    </SceneTemplate>
  );
}
