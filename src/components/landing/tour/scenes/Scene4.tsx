import { CheckCircle2, Trophy } from "lucide-react";
import AnimatedText from "@/components/landing/tour/AnimatedText";
import TypewriterComponent from "typewriter-effect";
import infinitePrism from "@/assets/infinite-prism-dark.webp";
import { Progress } from "@/components/ui/progress";
import TextSequence from "@/components/landing/tour/TextSequence";
import { cn } from "@/lib/utils";
import SceneTemplate from "./SceneTemplate";

import {
  LEAD_COPY_CLASS,
  METRIC_VALUE_CLASS,
  SCENE_CONTAINER_CLASS,
  SCENE_HEADING_CLASS,
  SceneEyebrow,
  type SceneComponentProps,
} from "./shared";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";


export default function Scene4(_: SceneComponentProps) {
  const { t } = useTranslation('landing');
  const TextoEscena4 = [
    { text: t('tour.scene4.sequence.0'), durationMs: 4000 },
    { text: t('tour.scene4.sequence.1'), durationMs: 5000 },
    { text: t('tour.scene4.sequence.2'), durationMs: 4500 },
    { text: t('tour.scene4.sequence.3'), durationMs: 4500 },
    { text: t('tour.scene4.sequence.4'), durationMs: 5500 }
  ];
  const milestones = [
    { label: t('tour.scene4.milestones.0.label'), progress: t('tour.scene4.milestones.0.progress'), done: true },
    { label: t('tour.scene4.milestones.1.label'), progress: t('tour.scene4.milestones.1.progress'), done: true },
    { label: t('tour.scene4.milestones.2.label'), progress: t('tour.scene4.milestones.2.progress'), done: false },
  ];
  return (
    <SceneTemplate
      className={cn(
        "lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)] 2xl:grid-cols-[minmax(0,0.86fr)_minmax(26rem,1.14fr)]",
      )}
    >
      {/* LEFT PANEL - CINEMATIC TEXTS */}
      <div className="relative z-10 flex min-w-0 flex-col justify-center space-y-6 xl:space-y-8">
        <SceneEyebrow>
          <AnimatedText text={t("tour.scene4.eyebrow")} className="" />
        </SceneEyebrow>

        <div className="space-y-5 xl:space-y-6">
          <h2 className={cn(SCENE_HEADING_CLASS, "bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-orange bg-clip-text text-transparent dark:text-transparent pb-3")}>
            <TypewriterComponent
              key={t("tour.scene4.headline_line1")}
              component="span"
              onInit={(typewriter) => {
                typewriter.typeString(`${t("tour.scene4.headline_line1")}<br />${t("tour.scene4.headline_line2")}`).start();
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
            <TextSequence sequenceData={TextoEscena4} className={LEAD_COPY_CLASS} />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 divide-y divide-black/10 dark:divide-white/10 sm:flex-row sm:gap-6 sm:divide-y-0 sm:divide-x">
          {[
            { label: t("tour.scene4.metrics.0.label"), value: t("tour.scene4.metrics.0.value") },
            { label: t("tour.scene4.metrics.1.label"), value: t("tour.scene4.metrics.1.value") },
            { label: t("tour.scene4.metrics.2.label"), value: t("tour.scene4.metrics.2.value") },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col pt-4 sm:pt-0 sm:pl-6 first:pt-0 first:pl-0 transition-opacity hover:opacity-100 opacity-90"
            >
              <p className="text-xs font-display uppercase tracking-[0.18em] text-slate-600 dark:text-white/50">
                {item.label}
              </p>
              <p className={METRIC_VALUE_CLASS}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL - GAMIFIED INTERFACE WITH PRISM BORDER */}
      <div className="self-center w-full min-w-0 rounded-[32px] p-[1px] bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-orange shadow-xl shadow-black/5 dark:shadow-lg shadow-black/5 dark:shadow-[0_0_40px_rgba(123,44,191,0.05)]">
        <Card className="min-w-0 overflow-hidden rounded-[31px] border-0 bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white backdrop-blur-sm">
          <CardContent className="space-y-6 p-5 md:p-6 xl:p-7 relative">
            {/* Ambient inner glow based on the infinite prism */}
            <div className="absolute top-1/2 left-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-cyan/20 blur-[60px] pointer-events-none"></div>

            <div className="flex flex-col gap-3 md:p-4 sm:flex-row sm:items-end sm:justify-between relative z-10">
              <div>
                <p className="text-xs font-display uppercase tracking-[0.18em] text-brand-orange/80">{t("tour.scene4.card.tag")}</p>
                <h3 className="mt-1 font-display text-xl md:text-2xl lg:text-3xl leading-tight font-semibold text-slate-900 dark:text-white">
                  {t("tour.scene4.card.title")}
                </h3>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-purple/30 bg-brand-purple/10 px-4 py-2 text-xs md:text-sm font-display font-semibold text-brand-purple">
                <img src={infinitePrism} alt="Infinite loop" className="h-4 w-4 object-contain brightness-150" />
                {t("tour.scene4.card.level")}
              </div>
            </div>

            <div className="relative z-10 p-5 sm:p-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-display font-semibold text-slate-900 dark:text-white">{t("tour.scene4.card.summary_title")}</p>
                  <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-white/60">{t("tour.scene4.card.summary_desc")}</p>
                </div>
                <div className="rounded-2xl border border-brand-cyan/30 bg-brand-cyan/10 p-3 flex items-center justify-center animate-[pulse_3s_ease-in-out_infinite]">
                  <img src={infinitePrism} alt="Infinite Prism" className="h-6 w-6 object-contain" />
                </div>
              </div>

              <Progress value={68} className="mt-5 h-3 bg-white/10 [&>div]:bg-brand-cyan" />

              <div className="mt-6 flex flex-col gap-0 divide-y divide-black/5 dark:divide-white/5">
                {milestones.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-3.5 transition-opacity hover:opacity-100 opacity-90 sm:flex-nowrap"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center shrink-0 transition-transform",
                          item.done
                            ? "text-brand-neon scale-110 drop-shadow-[0_0_15px_rgba(4,255,141,0.5)]"
                            : "text-slate-600 dark:text-white/30 opacity-70",
                        )}
                      >
                        {item.done ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <img src={infinitePrism} className="h-5 w-5 object-contain" alt="Pending" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-display font-semibold text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-600 dark:text-white/40">
                          {item.done ? "Completado" : "Siguiente objetivo"}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs md:text-sm font-display font-semibold text-brand-cyan/90">
                      {item.progress}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SceneTemplate>
  );
}
