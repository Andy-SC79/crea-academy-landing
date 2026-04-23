import { type ReactNode } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

import Header from "@/components/landing/tour/Header";
import { cn } from "@/lib/utils";
import Footer from "@/components/layout/Footer";
import "@/styles/tour-ambient.css";

import { TOUR_SCENES } from "./scenes";

type TourControllerProps = {
  integrationSlot?: ReactNode;
};

export default function TourController({ integrationSlot }: TourControllerProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="tour-ambient-shell relative flex w-full flex-col overflow-x-hidden text-[90%] text-slate-900 transition-colors duration-500 dark:text-white md:text-[100%]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="tour-ambient-base absolute inset-0" />
        <div className="tour-ambient-glow neon absolute left-[10%] top-[8%] h-[28rem] w-[28rem]" />
        <div className="tour-ambient-glow cyan absolute right-[8%] top-[12%] h-[24rem] w-[24rem]" />
        <div className="tour-ambient-glow purple absolute left-1/2 top-[62%] h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2" />
        <div className="tour-ambient-vignette absolute inset-0" />
      </div>

      <div className="fixed left-0 top-0 z-50 h-[66px] w-full">
        <Header />
        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-black/8 dark:bg-white/8">
          <motion.div className="origin-left h-full bg-brand-neon" style={{ scaleX }} />
        </div>
      </div>

      <div className="relative z-10 flex w-full flex-col pt-[66px]">
        {TOUR_SCENES.map((scene) => {
          const SceneComponent = scene.Component;

          return (
            <div
              key={scene.id}
              id={scene.id}
              className={cn(
                "tour-section-blend flex w-full flex-col items-center justify-center",
                scene.id === "tour-pricing" && "scroll-mt-24",
              )}
            >
              <SceneComponent integrationSlot={integrationSlot} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
