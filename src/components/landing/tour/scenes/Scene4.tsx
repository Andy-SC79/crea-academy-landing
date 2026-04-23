import { Mic, Sparkles, Wand2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

import AnimatedText from "@/components/landing/tour/AnimatedText";
import TextSequence from "@/components/landing/tour/TextSequence";
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

export default function Scene4(_: SceneComponentProps) {
  const { t } = useTranslation("landing");
  const textoEscena4 = [
    { text: t("tour.scene4.sequence.0"), durationMs: 4000 },
    { text: t("tour.scene4.sequence.1"), durationMs: 5000 },
    { text: t("tour.scene4.sequence.2"), durationMs: 4500 },
    { text: t("tour.scene4.sequence.3"), durationMs: 4500 },
    { text: t("tour.scene4.sequence.4"), durationMs: 5500 },
  ];

  return (
    <SceneTemplate
      className={cn(
        "lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)] 2xl:grid-cols-[minmax(0,0.86fr)_minmax(26rem,1.14fr)]",
      )}
    >
      <div className="relative z-10 flex min-w-0 flex-col justify-center space-y-6 xl:space-y-8">
        <SceneEyebrow>
          <AnimatedText text={t("tour.scene4.eyebrow")} className="" />
        </SceneEyebrow>

        <div className="space-y-5 xl:space-y-6">
          <SceneHeadline
            parts={[
              { text: t("tour.scene4.headline_line1") },
              { text: t("tour.scene4.headline_line2"), accent: "neon", breakBefore: true },
            ]}
          />

          <div className={LEAD_COPY_CLASS}>
            <TextSequence sequenceData={textoEscena4} className={LEAD_COPY_CLASS} />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 divide-y divide-black/10 dark:divide-white/10 sm:flex-row sm:gap-6 sm:divide-x sm:divide-y-0">
          {[
            { label: t("tour.scene4.metrics.0.label"), value: t("tour.scene4.metrics.0.value") },
            { label: t("tour.scene4.metrics.1.label"), value: t("tour.scene4.metrics.1.value") },
            { label: t("tour.scene4.metrics.2.label"), value: t("tour.scene4.metrics.2.value") },
          ].map((item) => (
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

      <div className={cn(TOUR_FRAME_CLASS, "self-center min-w-0")}>
        <Card className={cn(TOUR_SURFACE_CLASS, "min-w-0")}>
          <CardContent className="relative space-y-6 p-5 md:p-6 xl:p-7">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-cyan/20 blur-[60px]" />

            <div className="relative z-10 flex flex-col gap-3 md:p-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-display font-black uppercase tracking-[0.18em] text-[#00A859] dark:text-brand-orange/80">
                  {t("tour.scene4.card.workspace_tag")}
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold leading-tight text-slate-900 dark:text-white md:text-2xl lg:text-3xl">
                  {t("tour.scene4.card.workspace_title")}
                </h3>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-xs font-display font-black text-[#00A859] shadow-sm backdrop-blur-md md:text-sm dark:border-brand-neon/20 dark:bg-brand-neon/10 dark:text-brand-neon dark:shadow-none">
                <Wand2 className="h-4 w-4" />
                {t("tour.scene4.card.active_tool")}
              </div>
            </div>

            <div className="relative z-10 p-5 sm:p-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cyan/20 text-brand-cyan">
                    <Mic className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                      {t("tour.scene4.card.status_generating")}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-white/60">
                      00:14 / 02:30
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulación de ondas de audio */}
              <div className="mt-5 flex items-center justify-center gap-1 h-12 w-full overflow-hidden">
                {[...Array(24)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 rounded-full bg-brand-cyan/80"
                    animate={{
                      height: ["20%", "80%", "30%", "100%", "20%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-col pt-4 border-t border-black/5 dark:border-white/5">
                <div className="flex items-center justify-between opacity-90 hover:opacity-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-neon/20 text-brand-neon">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-white/40">
                        {t("tour.scene4.card.reward_label")}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-display font-bold text-brand-neon drop-shadow-[0_0_10px_rgba(4,255,141,0.5)]">
                    {t("tour.scene4.card.xp_earned")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SceneTemplate>
  );
}
