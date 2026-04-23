
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type SceneComponentProps = {
  integrationSlot?: ReactNode;
  onNextScene?: () => void;
};

export type SceneHeadlinePart = {
  text: string;
  accent?: "neon" | "prisma";
  breakBefore?: boolean;
};

export const SCENE_CONTAINER_CLASS =
  "mx-auto grid w-full min-w-0 max-w-[min(100%,104rem)] content-start items-center gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-8 md:gap-8 md:px-10 md:py-10 mt-0 lg:mt-4 xl:gap-10 xl:px-14 2xl:px-16 2xl:py-12";

export const HERO_HEADLINE_CLASS =
  "max-w-[14ch] font-display text-[clamp(1.35rem,5vw,6.25rem)] font-extrabold dark:font-bold leading-[0.96] tracking-[-0.045em] text-slate-900 dark:text-white pb-3";

export const SCENE_HEADING_CLASS =
  "max-w-[16ch] font-display text-[clamp(2rem,6vw,4rem)] font-extrabold dark:font-bold leading-[0.98] tracking-[-0.04em] text-slate-900 dark:text-white pb-3";

export const LEAD_COPY_CLASS =
  "max-w-[42rem] text-[clamp(0.85rem,0.92rem+0.4vw,1.22rem)] leading-[1.8] font-medium dark:font-normal text-slate-700 dark:text-white/70";

export const SURFACE_TITLE_CLASS =
  "mt-4 font-display text-[clamp(1.45rem,1.08rem+1.45vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-slate-900 dark:text-white pb-3";

export const SURFACE_COPY_CLASS =
  "mt-4 text-[clamp(0.85rem,0.8rem+0.2vw,1.1rem)] leading-[1.8] text-slate-700 font-medium dark:text-white/60";

export const METRIC_VALUE_CLASS =
  "mt-3 font-display text-[clamp(1.25rem,1.5rem+1.5vw,3.5rem)] font-semibold leading-none text-slate-900 dark:text-white pb-3";

export function SceneEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 dark:border-gray-800 bg-white/[0.03] shadow-sm shadow-black/5 dark:shadow-none px-2.5 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-[8px] sm:text-[9px] lg:text-[10px] xl:text-[11px] font-display font-bold dark:font-semibold uppercase tracking-[0.2em] text-brand-neon dark:text-brand-neon/90 overflow-hidden">
      <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 shrink-0" />
      <span className="truncate whitespace-nowrap">{children}</span>
    </div>
  );
}

interface SceneHeadlineProps {
  children?: ReactNode;
  as?: "h1" | "h2" | "h3";
  variant?: "hero" | "default";
  className?: string;
  delay?: number;
  parts?: SceneHeadlinePart[];
}

export function SceneHeadline({
  children,
  as: Element = "h2",
  variant = "default",
  className,
  parts = [],
}: SceneHeadlineProps) {
  const getHeadlineClass = () => {
    switch (variant) {
      case "hero":
        return HERO_HEADLINE_CLASS;
      default:
        return SCENE_HEADING_CLASS;
    }
  };

  const finalClassName = cn(getHeadlineClass(), className);

  if (parts && parts.length > 0) {
    return (
      <Element className={finalClassName}>
        {parts.map((part, i) => {
          const accentClass =
            part.accent === "neon"
              ? "text-brand-neon"
              : part.accent === "prisma"
                ? "text-brand-cyan"
                : "";

          return (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              className={part.breakBefore ? "block" : "inline"}
            >
              <span className={accentClass}>{part.text}</span>
              {i < parts.length - 1 && !part.breakBefore ? " " : ""}
            </motion.span>
          );
        })}
      </Element>
    );
  }

  return (
    <Element className={finalClassName}>
      {children}
    </Element>
  );
}



