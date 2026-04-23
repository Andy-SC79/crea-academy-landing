import React, { ElementType, Fragment, ReactNode } from "react";
import { cn } from "@/lib/utils";
import TypewriterComponent from "typewriter-effect";
import { useReducedMotion } from "framer-motion";

import { Sparkles } from "lucide-react";

export type SceneComponentProps = {
  integrationSlot?: ReactNode;
  onNextScene?: () => void;
};

export const SCENE_CONTAINER_CLASS =
  "mx-auto grid w-full min-w-0 max-w-[min(100%,104rem)] content-start items-center gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-8 md:gap-8 md:px-10 md:py-10 mt-0 lg:mt-4 xl:gap-10 xl:px-14 2xl:px-16 2xl:py-12";

export const HERO_HEADLINE_CLASS =
  "max-w-[14ch] font-display text-[clamp(1.35rem,5vw,6.25rem)] font-extrabold dark:font-bold leading-[0.96] tracking-[-0.045em] text-slate-900 dark:text-white pb-3";

export const SCENE_HEADING_CLASS =
  "max-w-[16ch] font-display text-[clamp(2rem,6vw,4rem)] font-extrabold dark:font-bold leading-[0.98] tracking-[-0.04em] text-slate-900 dark:text-white pb-3";

export const LEAD_COPY_CLASS =
  "max-w-[44rem] font-display text-[clamp(1.15rem,1.5vw+1rem,1.65rem)] leading-[1.6] text-slate-800 dark:text-slate-100 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]";

export const SURFACE_TITLE_CLASS =
  "mt-4 font-display text-[clamp(1.45rem,1.08rem+1.45vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-slate-900 dark:text-white pb-3";

export const SURFACE_COPY_CLASS =
  "mt-4 text-[clamp(0.85rem,0.8rem+0.2vw,1.1rem)] leading-[1.8] text-slate-700 font-medium dark:text-white/60";

export const METRIC_VALUE_CLASS =
  "mt-3 font-display text-[clamp(1.25rem,1.5rem+1.5vw,3.5rem)] font-semibold leading-none text-slate-900 dark:text-white pb-3";

export const TOUR_FRAME_CLASS =
  "relative w-full rounded-[32px] p-[1px] bg-gradient-to-br from-brand-cyan/60 via-brand-purple/45 to-brand-orange/55 shadow-xl shadow-black/5 dark:shadow-[0_0_40px_rgba(123,44,191,0.05)]";

export const TOUR_SURFACE_CLASS =
  "relative overflow-hidden rounded-[31px] border border-slate-200/75 bg-slate-50/85 text-slate-900 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:!border-[#16243C] dark:!bg-[linear-gradient(180deg,rgba(9,18,35,0.96)_0%,rgba(7,13,27,0.94)_100%)] dark:text-white dark:shadow-[0_24px_70px_rgba(0,0,0,0.24)]";

export const TOUR_GLASS_PANEL_CLASS =
  "rounded-[30px] border border-slate-200/80 bg-white/80 text-slate-900 shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-[0_24px_70px_rgba(0,0,0,0.28)]";

type HeadlineAccent = "none" | "neon" | "prisma";

export type SceneHeadlinePart = {
  text: string;
  accent?: HeadlineAccent;
  breakBefore?: boolean;
};

type SceneHeadlineProps<T extends ElementType = "h2"> = {
  as?: T;
  className?: string;
  delay?: number;
  parts: SceneHeadlinePart[];
  typewriter?: boolean;
  variant?: "hero" | "section";
  wrapperClassName?: string;
};

function escapeHtml(value: string) {
  return value
    .replace("&", "&amp;")
    .replace("<", "&lt;")
    .replace(">", "&gt;")
    .replace('"', "&quot;")
    .replace("'", "&#39;");
}

function getAccentClass(accent: HeadlineAccent = "none") {
  if (accent === "prisma") {
    return "bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-orange bg-clip-text text-transparent";
  }

  if (accent === "neon") {
    return "text-brand-neon";
  }

  return "";
}

function buildHeadlineMarkup(parts: SceneHeadlinePart[]) {
  return parts
    .map((part) => {
      const text = escapeHtml(part.text);
      const className = getAccentClass(part.accent);
      const content = className ? `<span class="${className}">${text}</span>` : text;

      return `${part.breakBefore ? "<br />" : ""}${content}`;
    })
    .join("");
}

export function SceneHeadline<T extends ElementType = "h2">({
  as,
  className,
  delay = 36,
  parts,
  typewriter = true,
  variant = "section",
  wrapperClassName = "inline-block",
}: SceneHeadlineProps<T>) {
  const Component = (as ?? "h2") as ElementType;
  const prefersReducedMotion = useReducedMotion();
  const shouldType = typewriter && !prefersReducedMotion;
  const markup = buildHeadlineMarkup(parts);

  return (
    <Component
      className={cn(
        variant === "hero" ? HERO_HEADLINE_CLASS : SCENE_HEADING_CLASS,
        "pb-3 text-balance [&_.Typewriter__cursor]:text-brand-neon [&_.Typewriter__cursor]:font-light",
        className,
      )}
    >
      {shouldType ? (
        <TypewriterComponent
          key={markup}
          component="span"
          onInit={(typewriterInstance) => {
            typewriterInstance.typeString(markup).start();
          }}
          options={{
            autoStart: true,
            cursor: "|",
            delay,
            loop: false,
            wrapperClassName,
          }}
        />
      ) : (
        parts.map((part, index) => (
          <Fragment key={`${part.text}-${index}`}>
            {part.breakBefore ? <br /> : null}
            {part.accent && part.accent !== "none" ? (
              <span className={getAccentClass(part.accent)}>{part.text}</span>
            ) : (
              part.text
            )}
          </Fragment>
        ))
      )}
    </Component>
  );
}

export function SceneEyebrow({
  children,
  icon,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 overflow-hidden rounded-full border border-slate-200/80 bg-black/5 px-2.5 py-1 text-[8px] font-display font-black uppercase tracking-[0.2em] text-brand-neon shadow-sm shadow-black/5 backdrop-blur-lg sm:px-3 sm:py-1.5 sm:text-[9px] lg:px-4 lg:py-2 lg:text-[10px] xl:text-[11px] dark:border-white/10 dark:bg-black/40 dark:text-brand-neon/90 dark:shadow-none",
        className,
      )}
    >
      {icon ?? <Sparkles className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />}
      <span className="truncate whitespace-nowrap">{children}</span>
    </div>
  );
}



