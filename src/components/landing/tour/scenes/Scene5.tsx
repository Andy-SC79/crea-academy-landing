import { ArrowUpRight, TrendingUp, Trophy, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import AnimatedText from "@/components/landing/tour/AnimatedText";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import SceneTemplate from "./SceneTemplate";
import {
  LEAD_COPY_CLASS,
  METRIC_VALUE_CLASS,
  SceneHeadline,
  SceneEyebrow,
  TOUR_FRAME_CLASS,
  TOUR_SURFACE_CLASS,
  type SceneComponentProps,
} from "./shared";

export default function Scene5(_: SceneComponentProps) {
  const { t } = useTranslation("landing");
  const metrics = [
    { label: t("tour.scene5.metrics.0.label"), value: t("tour.scene5.metrics.0.value") },
    { label: t("tour.scene5.metrics.1.label"), value: t("tour.scene5.metrics.1.value") },
    { label: t("tour.scene5.metrics.2.label"), value: t("tour.scene5.metrics.2.value") },
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
          <SceneHeadline
            parts={[
              { text: t("tour.scene5.headline_line1") },
              { text: t("tour.scene5.headline_line2"), accent: "neon", breakBefore: true },
            ]}
          />
          <p className={LEAD_COPY_CLASS}>
            Eleva las capacidades de tu equipo y empodéralos para multiplicar los resultados al aplicar procesos de automatización impulsados por IA. Monitorea los resultados en tiempo real y motívalos en un ambiente competitivo.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 divide-y divide-black/10 dark:divide-white/10 sm:flex-row sm:gap-6 sm:divide-x sm:divide-y-0">
          {metrics.map((item) => (
            <div
              key={item.label}
              className="flex flex-col pt-4 opacity-90 transition-opacity hover:opacity-100 first:pl-0 first:pt-0 sm:pl-6 sm:pt-0"
            >
              <p className="text-xs font-display uppercase tracking-[0.18em] text-slate-600 dark:text-white/50">
                {item.label}
              </p>
              <p className={METRIC_VALUE_CLASS}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={TOUR_FRAME_CLASS}>
        <Card className={cn(TOUR_SURFACE_CLASS, "min-w-0")}>
          <CardContent className="space-y-6 p-5 md:p-6 xl:p-7">
            <div className="flex flex-col gap-3 md:p-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-display uppercase tracking-[0.18em] text-slate-600 dark:text-white/50">
                  {t("tour.scene5.card.dashboard_tag")}
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold leading-tight text-slate-900 dark:text-white md:text-2xl lg:text-3xl">
                  {t("tour.scene5.card.dashboard_title")}
                </h3>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-neon/20 bg-brand-neon/10 px-4 py-2 text-xs font-display font-bold text-brand-neon md:text-sm">
                <Users className="h-4 w-4" />
                {t("tour.scene5.card.global_retention")}
              </div>
            </div>

            <div className="pt-2">
              <div className="flex flex-col items-center justify-center p-4 mb-6 rounded-2xl border border-brand-neon/20 bg-gradient-to-b from-brand-neon/10 to-transparent">
                <p className="text-3xl font-display font-black text-brand-neon drop-shadow-[0_0_15px_rgba(4,255,141,0.5)]">
                  {t("tour.scene5.card.retention_value")}
                </p>
                <p className="mt-1 text-xs uppercase tracking-widest text-brand-neon/80 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Impacto Organizacional
                </p>
              </div>

              <div className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
                <p className="pb-3 text-xs font-display uppercase tracking-[0.18em] text-slate-600 dark:text-white/50">
                  {t("tour.scene5.card.top_students")}
                </p>
                {[
                  { name: t("tour.scene5.card.student_1"), score: t("tour.scene5.card.student_1_score"), color: "text-yellow-400" },
                  { name: t("tour.scene5.card.student_2"), score: t("tour.scene5.card.student_2_score"), color: "text-slate-300" },
                  { name: t("tour.scene5.card.student_3"), score: t("tour.scene5.card.student_3_score"), color: "text-amber-600" },
                ].map((student, i) => (
                  <div key={student.name} className="flex items-center justify-between py-3 opacity-90 transition-opacity hover:opacity-100">
                    <div className="flex items-center gap-3">
                      <span className={cn("font-display font-bold text-lg", student.color)}>#{i + 1}</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-white">
                        {student.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{student.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-display font-bold text-brand-neon">{student.score}</span>
                      <ArrowUpRight className="h-3 w-3 text-brand-neon/70" />
                    </div>
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
