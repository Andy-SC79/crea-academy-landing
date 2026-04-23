import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, TrendingUp, Users } from "lucide-react";
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


function AnimatedCounter({ text }: { text: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-50px" });
  const [current, setCurrent] = useState(0);

  const numMatch = text.match(/\d+/);
  const targetNum = numMatch ? parseInt(numMatch[0], 10) : 94;
  const prefix = text.split(numMatch ? numMatch[0] : "94")[0] || "";
  const suffix = text.split(numMatch ? numMatch[0] : "94")[1] || "%";

  useEffect(() => {
    if (!isInView) return;
    let val = 0;
    const frames = 40;
    const increment = targetNum / frames;
    const interval = setInterval(() => {
      val += increment;
      if (val >= targetNum) {
        setCurrent(targetNum);
        clearInterval(interval);
      } else {
        setCurrent(Math.floor(val));
      }
    }, 30);
    return () => clearInterval(interval);
  }, [isInView, targetNum]);

  return <span ref={nodeRef}>{prefix}{current}{suffix}</span>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.4 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

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
      <div className="min-w-0 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 xl:space-y-8">
        <div className="flex justify-center lg:justify-start w-full mb-4"><SceneEyebrow>
          <AnimatedText text={t("tour.scene5.eyebrow")} className="" />
        </SceneEyebrow></div>

        <div className="space-y-5 xl:space-y-6">
          <SceneHeadline
            parts={[
              { text: t("tour.scene5.headline_line1") },
              { text: t("tour.scene5.headline_line2"), accent: "neon", breakBefore: true },
            ]}
          />
          <p className={LEAD_COPY_CLASS}>
            {t("tour.scene5.description")}
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
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-xs font-display font-black text-[#00A859] shadow-sm backdrop-blur-md md:text-sm dark:border-brand-neon/20 dark:bg-brand-neon/10 dark:text-brand-neon dark:shadow-none">
                <Users className="h-4 w-4" />
                {t("tour.scene5.card.global_retention")}
              </div>
            </div>

            <div className="pt-2">
              <div className="relative overflow-hidden flex flex-col items-center justify-center p-4 mb-6 rounded-2xl border border-brand-neon/30 bg-brand-neon/5 dark:bg-brand-neon/10">
                {/* Laser scan effect */}
                <motion.div 
                  className="absolute top-0 bottom-0 w-[40px] bg-white/20 dark:bg-white/10 skew-x-[-20deg]"
                  initial={{ left: "-20%" }}
                  whileInView={{ left: "120%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                />
                <p className="text-4xl font-display font-black text-brand-neon drop-shadow-[0_0_15px_rgba(4,255,141,0.5)]">
                  <AnimatedCounter text={t("tour.scene5.card.retention_value")} />
                </p>
                <p className="mt-2 text-xs font-black uppercase tracking-widest text-[#00A859] dark:text-brand-neon/80 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Impacto Organizacional
                </p>
              </div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="flex flex-col"
              >
                <p className="pb-3 text-xs font-display uppercase tracking-[0.18em] text-slate-600 dark:text-white/50 border-b border-black/5 dark:border-white/5">
                  {t("tour.scene5.card.top_students")}
                </p>
                <div className="pt-2 space-y-4">
                  {[
                    { name: t("tour.scene5.card.student_1"), score: t("tour.scene5.card.student_1_score"), color: "text-yellow-400", width: "100%" },
                    { name: t("tour.scene5.card.student_2"), score: t("tour.scene5.card.student_2_score"), color: "text-slate-300", width: "80%" },
                    { name: t("tour.scene5.card.student_3"), score: t("tour.scene5.card.student_3_score"), color: "text-amber-600", width: "65%" },
                  ].map((student, i) => (
                    <motion.div variants={itemVariants} key={student.name} className="relative flex flex-col justify-center py-2 opacity-90 transition-opacity hover:opacity-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 z-10">
                          <span className={cn("font-display font-bold text-lg w-5", student.color)}>#{i + 1}</span>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-white shadow-inner">
                            {student.name.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{student.name}</span>
                        </div>
                        <div className="flex items-center gap-2 z-10">
                          <span className="text-xs font-display font-bold text-brand-neon bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md">{student.score}</span>
                        </div>
                      </div>
                      {/* XP Progress Bar */}
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-brand-neon"
                          initial={{ width: 0 }}
                          whileInView={{ width: student.width }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 + (i * 0.2), ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SceneTemplate>
  );
}
