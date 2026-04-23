import { CheckCircle2, Star, Trophy } from "lucide-react";
import AnimatedText from "@/components/landing/tour/AnimatedText";
import TypewriterComponent from "typewriter-effect";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import SceneTemplate from "./SceneTemplate";

import {
  LEAD_COPY_CLASS,
  METRIC_VALUE_CLASS,
  SCENE_CONTAINER_CLASS,
  SCENE_HEADING_CLASS,
  SceneEyebrow,
  type SceneComponentProps,
} from "./shared";


export default function Scene5(_: SceneComponentProps) {
  const { t } = useTranslation('landing');
  const GAMIFICATION_METRICS = [
    { label: t('tour.scene5.metrics.0.label'), value: t('tour.scene5.metrics.0.value') },
    { label: t('tour.scene5.metrics.1.label'), value: t('tour.scene5.metrics.1.value') },
    { label: t('tour.scene5.metrics.2.label'), value: t('tour.scene5.metrics.2.value') },
  ];
  const GAMIFICATION_MILESTONES = [
    { label: t('tour.scene5.milestones.0.label'), progress: t('tour.scene5.milestones.0.progress'), done: true },
    { label: t('tour.scene5.milestones.1.label'), progress: t('tour.scene5.milestones.1.progress'), done: true },
    { label: t('tour.scene5.milestones.2.label'), progress: t('tour.scene5.milestones.2.progress'), done: false },
  ];
  return (
    <SceneTemplate
      className={cn(
        "lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)] 2xl:grid-cols-[minmax(0,0.86fr)_minmax(26rem,1.14fr)]",
      )}
    >
      <div className="min-w-0 space-y-6 xl:space-y-8">
        <SceneEyebrow>
          <AnimatedText text={t("tour.scene5.eyebrow")} className="" />
        </SceneEyebrow>

        <div className="space-y-5 xl:space-y-6">
          <h2 className={cn(SCENE_HEADING_CLASS, "bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-orange bg-clip-text text-transparent dark:text-transparent")}>
            <TypewriterComponent
              key={t("tour.scene5.headline_line1")}
              component="span"
              onInit={(typewriter) => {
                typewriter.typeString(`${t("tour.scene5.headline_line1")}<br />${t("tour.scene5.headline_line2")}`).start();
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
          <p className={LEAD_COPY_CLASS}>
            Eleva las capacidades de tu equipo y empodéralos para multiplicar los resultados al aplicar procesos de automatización impulsados por IA. Monitorea los resultados en tiempo real y motívalos en un ambiente competitivo.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 divide-y divide-black/10 dark:divide-white/10 sm:flex-row sm:gap-6 sm:divide-y-0 sm:divide-x">
          {GAMIFICATION_METRICS.map((item) => (
            <div key={item.label} className="flex flex-col pt-4 sm:pt-0 sm:pl-6 first:pt-0 first:pl-0 transition-opacity hover:opacity-100 opacity-90">
              <p className="text-xs font-display uppercase tracking-[0.18em] text-slate-600 dark:text-white/50">
                {item.label}
              </p>
              <p className={METRIC_VALUE_CLASS}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-full rounded-[32px] p-[1px] bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-orange shadow-xl shadow-black/5 dark:shadow-[0_0_40px_rgba(123,44,191,0.05)]">
        <Card className="min-w-0 overflow-hidden rounded-[31px] border-0 bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white backdrop-blur-sm">
          <CardContent className="space-y-6 p-5 md:p-6 xl:p-7">
            <div className="flex flex-col gap-3 md:p-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-display uppercase tracking-[0.18em] text-slate-600 dark:text-white/50">
                  {t("tour.scene5.card.tag")}
                </p>
                <h3 className="mt-1 font-display text-xl md:text-2xl lg:text-3xl leading-tight font-semibold text-slate-900 dark:text-white">
                  {t("tour.scene5.card.title")}
                </h3>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-neon/20 bg-brand-neon/10 px-4 py-2 text-xs md:text-sm font-display font-semibold text-brand-neon">
                <Trophy className="h-4 w-4" />
                {t("tour.scene5.card.level")}
              </div>
            </div>

            <div className="pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-display font-semibold text-slate-900 dark:text-white">{t("tour.scene5.card.summary_title")}</p>
                  <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-white/60">{t("tour.scene5.card.summary_desc")}</p>
                </div>
                <div className="rounded-2xl border border-brand-neon/20 bg-brand-neon/10 p-3 text-brand-neon">
                  <Trophy className="h-5 w-5" />
                </div>
              </div>

              <Progress value={68} className="mt-5 h-3 bg-white/10 [&>div]:bg-brand-neon" />

              <div className="mt-6 flex flex-col gap-0 divide-y divide-black/5 dark:divide-white/5">
                {GAMIFICATION_MILESTONES.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-3.5 transition-opacity hover:opacity-100 opacity-90 sm:flex-nowrap"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center shrink-0 transition-transform",
                          item.done ? "text-brand-neon scale-110 drop-shadow-[0_0_15px_rgba(4,255,141,0.5)]" : "text-slate-600 dark:text-white/30 opacity-70",
                        )}
                      >
                        {item.done ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Star className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-display font-semibold text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-brand-neon">
                          {item.done ? t("tour.scene5.card.completed") : t("tour.scene5.card.next_objective")}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs md:text-sm font-display font-semibold text-slate-600 dark:text-white/70">
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
