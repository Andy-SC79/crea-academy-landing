import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnimatedText from "@/components/landing/tour/AnimatedText";
import TypewriterComponent from "typewriter-effect";
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



export default function Scene3({ integrationSlot }: SceneComponentProps) {
  const { t } = useTranslation('landing');
  const TextoEscena3 = [
    { text: t('tour.scene3.sequence.0'), durationMs: 4000 },
    { text: t('tour.scene3.sequence.1'), durationMs: 6500 },
    { text: t('tour.scene3.sequence.2'), durationMs: 3500 },
    { text: t('tour.scene3.sequence.3'), durationMs: 2000 },
    { text: t('tour.scene3.sequence.4'), durationMs: 4500 }
  ];

  return (
    <SceneTemplate
      className={cn(
        "lg:grid-cols-[minmax(0,0.82fr)_minmax(20rem,1.18fr)] 2xl:grid-cols-[minmax(0,0.78fr)_minmax(26rem,1.22fr)]",
      )}
    >
      <div className="relative z-10 flex min-w-0 flex-col justify-center space-y-6 xl:space-y-8">
        <SceneEyebrow>
          <AnimatedText text={t("tour.scene3.eyebrow")} className="" />
        </SceneEyebrow>

        <div className="space-y-5 xl:space-y-6">
          <h2 className={cn(SCENE_HEADING_CLASS, "bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-orange bg-clip-text text-transparent dark:text-transparent pb-3")}>
            <TypewriterComponent
              key={t("tour.scene3.headline")}
              component="span"
              onInit={(typewriter) => {
                typewriter.typeString(t("tour.scene3.headline")).start();
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

          <div className={cn(LEAD_COPY_CLASS, "")}>
            <TextSequence sequenceData={TextoEscena3} className={LEAD_COPY_CLASS} />
          </div>
        </div>

        <div className="mt-8 grid gap-3">
          {[
            t("tour.scene3.promises.0"),
            t("tour.scene3.promises.1"),
            t("tour.scene3.promises.2"),
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 sm:gap-4 py-2 group transition-all duration-300 hover:translate-x-1"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-neon" />
              <p className="min-w-0 text-sm sm:text-base leading-[1.6] text-slate-700 dark:text-white/75 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-h-[18rem] min-w-0 items-center lg:min-h-0">
        <div className="relative w-full rounded-[32px] p-[1px] bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-orange shadow-xl shadow-black/5 dark:shadow-lg shadow-black/5 dark:shadow-[0_0_40px_rgba(123,44,191,0.05)]">
          <div className="relative flex h-[clamp(20rem,48svh,38rem)] w-full min-w-0 flex-col overflow-hidden rounded-[31px] bg-slate-50 dark:bg-[#0A0A0A] md:p-6 xl:h-[clamp(22rem,52svh,40rem)] xl:p-7">
            {integrationSlot ?? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <p className="mb-2 text-xs md:text-sm font-semibold text-brand-purple">{t("tour.scene3.card.title")}</p>
                <p className="text-xs text-slate-600 dark:text-white/40">
                  {t("tour.scene3.card.desc")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SceneTemplate>
  );
}
