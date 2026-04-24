import { Mic, Sparkles, Wand2, Activity, CheckCircle2, Bot } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
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



function InteractiveGenerator() {
  const { t } = useTranslation("landing");
  const [stage, setStage] = useState<"idle" | "generating" | "done">("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (stage === "generating") {
      let val = 0;
      const interval = setInterval(() => {
        val += 5;
        setProgress(val);
        if (val >= 100) {
          clearInterval(interval);
          setTimeout(() => setStage("done"), 300);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [stage]);

  return (
    <div className="relative z-10 p-5 sm:p-2">
      {stage === "idle" && (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="mb-6 w-full rounded-xl border border-slate-200/50 bg-slate-950 p-4 font-mono text-sm text-brand-neon/80 shadow-inner dark:border-white/10 dark:bg-black/40 text-left">
            <p className="text-brand-orange">Error: Module not found</p>
            <p className="text-slate-400">Can&apos;t resolve &apos;./Dashboard&apos; in &apos;/src/pages&apos;</p>
          </div>
          <button 
            onClick={() => setStage("generating")}
            className="group relative flex items-center justify-center gap-2 rounded-full bg-brand-neon px-6 py-3 font-display text-sm font-black text-black transition-all hover:scale-105 hover:bg-brand-neon/90 shadow-lg shadow-brand-neon/20"
          >
            <Activity className="h-4 w-4" />
            {t("tour.scene4.card.action_btn")}
          </button>
        </div>
      )}

      {stage === "generating" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-4">
          <div className="flex items-center gap-3 w-full mb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-cyan/20 text-brand-cyan shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              <Bot className="h-5 w-5 animate-pulse" />
            </div>
            <div className="w-full text-left">
              <p className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                {t("tour.scene4.card.status_generating")}
              </p>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-brand-cyan transition-all duration-100" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
          <div className="mb-2 w-full rounded-xl border border-brand-cyan/30 bg-slate-950 p-3 font-mono text-[11px] text-brand-cyan/80 shadow-inner dark:bg-black/60 text-left">
            <p className="animate-pulse">&#47;&#47; {t("tour.scene4.card.processing_line")}</p>
            <p className="mt-1 opacity-70">import Dashboard from &apos;@/pages/Dashboard&apos;;</p>
          </div>
          <div className="flex items-center justify-center gap-1 h-6 w-full overflow-hidden">
            {[...Array(12)].map((_, t) => (
              <motion.div 
                key={t}
                className="w-1.5 rounded-full bg-brand-cyan/80" 
                animate={{ height: ["20%", "80%", "30%", "100%", "20%"] }} 
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: t * 0.1 }} 
              />
            ))}
          </div>
        </motion.div>
      )}

      {stage === "done" && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-neon/20 text-brand-neon mb-3 shadow-[0_0_20px_rgba(4,255,141,0.2)]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-lg font-display font-bold text-slate-900 dark:text-white text-center">
            {t("tour.scene4.card.status_done")}
          </p>
          
          <div className="my-3 w-full rounded-xl border border-brand-neon/30 bg-brand-neon/5 p-3 text-center">
            <p className="text-xs font-medium text-slate-700 dark:text-white/80">
              {t("tour.scene4.card.resolved_message")}
            </p>
          </div>

          <div className="mt-2 flex w-full items-center justify-between border-t border-slate-200 dark:border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.16em] text-[color:var(--tour-text-muted)] dark:text-white/50">
                {t("tour.scene4.reward_label")}
              </span>
            </div>
            <span className="shrink-0 text-sm font-display font-bold text-brand-neon drop-shadow-[0_0_10px_rgba(4,255,141,0.5)]">
              {t("tour.scene4.xp_earned")}
            </span>
          </div>
          <button 
            onClick={() => setStage("idle")}
            className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[color:var(--tour-text-muted)] hover:text-[color:var(--tour-text-strong)] dark:hover:text-brand-neon transition-colors"
          >
            {t("tour.scene4.card.reset_action")}
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function Scene4(_: SceneComponentProps) {
  const { t, i18n } = useTranslation("landing");
  const language = (i18n.language || "es").split("-")[0];
  const textoEscena4 = [
    { text: t("tour.scene4.sequence.0"), durationMs: 4000 },
    { text: t("tour.scene4.sequence.1"), durationMs: 5000 },
    { text: t("tour.scene4.sequence.2"), durationMs: 4500 },
    { text: t("tour.scene4.sequence.3"), durationMs: 4500 },
    { text: t("tour.scene4.sequence.4"), durationMs: 5500 },
  ];
  const line2Parts =
    language === "en"
      ? [
          { text: t("tour.scene4.headline_line2_continuous"), accent: "neon" as const, breakBefore: true },
          { text: t("tour.scene4.headline_line2_creation"), accent: "prisma" as const },
        ]
      : [
          { text: t("tour.scene4.headline_line2_creation"), accent: "prisma" as const, breakBefore: true },
          { text: t("tour.scene4.headline_line2_continuous"), accent: "neon" as const },
        ];

  return (
    <SceneTemplate
      className={cn(
        "lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)] 2xl:grid-cols-[minmax(0,0.86fr)_minmax(26rem,1.14fr)]",
      )}
    >
      <div className="relative z-10 flex min-w-0 flex-col items-center lg:items-start text-center lg:text-left justify-center space-y-6 xl:space-y-8">
        <div className="flex justify-center lg:justify-start w-full mb-4"><SceneEyebrow>
          <AnimatedText text={t("tour.scene4.eyebrow")} className="" />
        </SceneEyebrow></div>

        <div className="space-y-5 xl:space-y-6">
          <SceneHeadline
            parts={[
              { text: t("tour.scene4.headline_line1") },
              ...line2Parts,
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
              <p className="text-xs font-display uppercase tracking-[0.18em] text-[color:var(--tour-text-muted)] dark:text-white/50">
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
                <p className="tour-kicker text-xs font-display font-black uppercase tracking-[0.18em] dark:text-brand-orange/80">
                  {t("tour.scene4.card.workspace_tag")}
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold leading-tight text-slate-900 dark:text-white md:text-2xl lg:text-3xl">
                  {t("tour.scene4.card.workspace_title")}
                </h3>
              </div>
              <div className="tour-meta-chip inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-display font-black text-[color:var(--tour-text-default)] md:text-sm dark:border-brand-neon/20 dark:bg-brand-neon/10 dark:text-brand-neon dark:shadow-none">
                <Wand2 className="h-4 w-4" />
                {t("tour.scene4.card.active_tool")}
              </div>
            </div>

            <InteractiveGenerator />
          </CardContent>
        </Card>
      </div>
    </SceneTemplate>
  );
}
