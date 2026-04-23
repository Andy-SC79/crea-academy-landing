import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SCENE_CONTAINER_CLASS } from "./shared";
import Footer from "@/components/layout/Footer";

// Check for reduced motion preference safely
const prefersReducedMotion = typeof window !== 'undefined' 
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
  : false;

interface SceneTemplateProps {
  children: ReactNode;
  className?: string;
  isPricing?: boolean;
  showFooter?: boolean;
}

export default function SceneTemplate({
  children, className, isPricing = false, showFooter = false }: SceneTemplateProps) {
  return (
    <motion.section
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -40, scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 220, 
        damping: 28, 
        mass: 1.2,
        opacity: { duration: 0.4, ease: "easeInOut" }
      }}
      className="absolute inset-x-0 bottom-0 top-[66px] block w-full overflow-y-auto overscroll-contain bg-slate-50 dark:bg-[#0A0A0A]"
    >
      <div className={cn("w-full min-h-full px-3 pt-6 pb-16 md:px-12 md:pt-8 md:pb-24", !isPricing && "max-w-[min(100%,104rem)] mx-auto")}>
        {isPricing ? (
          children
        ) : (
          <div className={cn(SCENE_CONTAINER_CLASS, className)}>
            {children}
          </div>
        )}
      </div>
      {showFooter && (
        <div className="mt-auto w-full pt-16">
          <Footer />
        </div>
      )}
    </motion.section>
  );
}
