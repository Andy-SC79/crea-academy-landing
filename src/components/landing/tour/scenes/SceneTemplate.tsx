import { type ReactNode } from "react";
import { motion } from "framer-motion";

import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

import { SCENE_CONTAINER_CLASS } from "./shared";

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

interface SceneTemplateProps {
  children: ReactNode;
  className?: string;
  disableScrollReveal?: boolean;
  flush?: boolean;
  isPricing?: boolean;
  showFooter?: boolean;
}

export default function SceneTemplate({
  children,
  className,
  disableScrollReveal = false,
  flush = false,
  isPricing = false,
  showFooter = false,
}: SceneTemplateProps) {
  const revealProps = disableScrollReveal
    ? {}
    : {
        initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.97 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: false, amount: 0.15 },
        exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -40, scale: 0.98 },
        transition: {
          type: "spring" as const,
          stiffness: 220,
          damping: 28,
          mass: 1.2,
          opacity: { duration: 0.4, ease: "easeInOut" as const },
        },
      };

  return (
    <motion.section
      {...revealProps}
      className={cn(
        "relative z-10 flex w-full flex-col justify-center bg-transparent",
        flush ? "py-0" : "py-16 md:py-24",
      )}
    >
      <div
        className={cn(
          "relative w-full",
          !flush && "px-4 md:px-12",
          !isPricing && !flush && "mx-auto max-w-[min(100%,104rem)]",
        )}
      >
        {isPricing ? (
          children
        ) : (
          <div className={cn(SCENE_CONTAINER_CLASS, className)}>{children}</div>
        )}
      </div>
      {showFooter ? (
        <div className="mt-auto w-full pt-16">
          <Footer />
        </div>
      ) : null}
    </motion.section>
  );
}
