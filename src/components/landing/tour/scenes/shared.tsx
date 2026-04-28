import React, { ElementType, Fragment, ReactNode, cloneElement, isValidElement, useState } from "react";
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
  "max-w-[14ch] font-display text-[clamp(1.35rem,5vw,6.25rem)] font-black leading-[0.96] tracking-normal text-[color:var(--tour-text-strong)] dark:text-white pb-3";

export const SCENE_HEADING_CLASS =
  "max-w-[15ch] font-display text-[clamp(1.72rem,4.8vw+0.65rem,4rem)] font-extrabold leading-[1.02] sm:leading-[0.98] tracking-normal text-[color:var(--tour-text-strong)] dark:text-white pb-2 sm:pb-3";

export const LEAD_COPY_CLASS =
  "max-w-[38rem] font-display text-[clamp(0.98rem,0.75rem+0.95vw,1.22rem)] font-normal leading-[1.72] tracking-normal text-[color:var(--tour-text-default)] dark:text-slate-100/90 sm:max-w-[42rem] sm:text-[clamp(1.02rem,0.88rem+0.62vw,1.32rem)] sm:leading-[1.68]";

export const SURFACE_TITLE_CLASS =
  "mt-4 font-display text-[clamp(1.28rem,1rem+1.2vw,3rem)] font-bold leading-[1.08] tracking-normal text-[color:var(--tour-text-strong)] dark:text-white pb-3";

export const SURFACE_COPY_CLASS =
  "mt-4 font-display text-[clamp(0.85rem,0.8rem+0.2vw,1.1rem)] leading-[1.8] text-[color:var(--tour-text-default)] font-normal dark:text-white/60";

export const METRIC_VALUE_CLASS =
  "mt-3 font-display text-[clamp(1.1rem,0.95rem+1.4vw,3.5rem)] font-bold leading-none text-[color:var(--tour-text-strong)] dark:text-white pb-3";

export const TOUR_FRAME_CLASS =
  "tour-frame-shell relative w-full rounded-[32px] p-[1px]";

export const TOUR_SURFACE_CLASS =
  "tour-surface-shell relative overflow-hidden rounded-[31px] text-[color:var(--tour-text-strong)] backdrop-blur-2xl dark:text-white";

export const TOUR_GLASS_PANEL_CLASS =
  "tour-glass-shell rounded-[30px] text-[color:var(--tour-text-strong)] backdrop-blur-xl dark:text-white";

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
        "pb-3 text-balance [&_.Typewriter__cursor]:text-brand-neon [&_.Typewriter__cursor]:font-light [&_.Typewriter__cursor]:ml-2",
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
  const [hoverReplaySignal, setHoverReplaySignal] = useState(0);
  const [hasReplayedOnHover, setHasReplayedOnHover] = useState(false);

  const animatedChildren =
    isValidElement<{ replaySignal?: number }>(children)
      ? cloneElement(children, { replaySignal: hoverReplaySignal })
      : children;

  return (
    <div
      onMouseEnter={() => {
        if (hasReplayedOnHover) return;
        setHoverReplaySignal(1);
        setHasReplayedOnHover(true);
      }}
      className={cn(
        "tour-pill-shell group relative inline-flex items-center justify-center gap-4 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 transition-all duration-500 hover:scale-105",
        className,
      )}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-cyan/20 via-brand-purple/20 to-brand-orange/20 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex items-center gap-3 sm:gap-4">
        <div className="flex items-center text-[#0d8b5c] dark:text-brand-neon">
          {icon ?? <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />}
        </div>
        <div className="h-4 sm:h-5 w-[2px] rounded-full bg-[color:var(--tour-border-strong)] dark:bg-white/20" />
        <span className="font-display text-[0.7rem] sm:text-[0.8rem] font-black tracking-[0.25em] text-[color:var(--tour-text-default)] dark:text-white uppercase dark:drop-shadow-sm pt-1 truncate">
          {animatedChildren}
        </span>
      </div>
    </div>
  );
}



