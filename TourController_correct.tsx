import { startTransition, type ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TOUR_SCENES } from "./scenes";
import Header from "@/components/landing/tour/Header";

const WHEEL_GESTURE_THRESHOLD = 180;
const TOUCH_GESTURE_THRESHOLD = 160;
const GESTURE_LOCK_MS = 900;

type TourControllerProps = {
  integrationSlot?: ReactNode;
};

type TouchPoint = {
  x: number;
  y: number;
};

function clampScene(nextScene: number) {
  return Math.min(Math.max(nextScene, 0), TOUR_SCENES.length - 1);
}

function SceneShell({ children, prefersReducedMotion }: SceneShellProps) {
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
      className="absolute inset-x-0 bottom-0 top-[66px] flex w-full flex-col px-3 pt-6 pb-24 md:px-12 md:pt-8 md:pb-24 overflow-y-auto overscroll-contain bg-slate-50 dark:bg-[#0A0A0A]"
    >
      {/* Using margin-auto in flex breaks scrolling for tall content. Using a min-height flex container fixes it */}
      <div className={cn("w-full min-h-full flex flex-col justify-start md:py-8", TOUR_WIDTH_CLASS)}>
        {children}
        
        
      </div>
    </motion.section>
  );
}

export default function TourController({ integrationSlot }: TourControllerProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [currentScene, setCurrentScene] = useState(0);
  
  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchCurrentRef = useRef<TouchPoint | null>(null);
  const wheelAccumulatorRef = useRef(0);
  const wheelResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastGestureAtRef = useRef(0);

  const goToScene = (nextScene: number) => {
    startTransition(() => {
      setCurrentScene(clampScene(nextScene));
    });
  };

  const navigateByDirection = (direction: 1 | -1) => {
    const now = Date.now();
    if (now - lastGestureAtRef.current < GESTURE_LOCK_MS) return;

    const nextScene = clampScene(currentScene + direction);
    if (nextScene === currentScene) return;

    lastGestureAtRef.current = now;
    goToScene(nextScene);
  };

  const clearWheelResetTimeout = () => {
    if (wheelResetTimeoutRef.current) {
      clearTimeout(wheelResetTimeoutRef.current);
      wheelResetTimeoutRef.current = null;
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    
    // Check if scrolling inside content
    const target = event.target as HTMLElement;
    const scrollableContainer = target.closest('.overflow-y-auto');
    
    if (scrollableContainer) {
      const isAtTop = scrollableContainer.scrollTop <= 0;
      const isAtBottom = Math.abs(scrollableContainer.scrollHeight - scrollableContainer.clientHeight - scrollableContainer.scrollTop) <= 2;

      if (event.deltaY > 0 && !isAtBottom) return;
      if (event.deltaY < 0 && !isAtTop) return;
    }

    wheelAccumulatorRef.current += event.deltaY;
    clearWheelResetTimeout();
    
    wheelResetTimeoutRef.current = setTimeout(() => {
      wheelAccumulatorRef.current = 0;
      wheelResetTimeoutRef.current = null;
    }, 160);
    
    if (Math.abs(wheelAccumulatorRef.current) < WHEEL_GESTURE_THRESHOLD) return;
    
    const direction = wheelAccumulatorRef.current > 0 ? 1 : -1;
    wheelAccumulatorRef.current = 0;
    navigateByDirection(direction);
  };

  const resetTouchGesture = () => {
    touchStartRef.current = null;
    touchCurrentRef.current = null;
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) {
      resetTouchGesture();
      return;
    }
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchCurrentRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1 || !touchStartRef.current) return;
    const touch = event.touches[0];
    touchCurrentRef.current = { x: touch.clientX, y: touch.clientY };
    

  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const touchStart = touchStartRef.current;
    const touchCurrent = touchCurrentRef.current;
    resetTouchGesture();
    
    if (!touchStart || !touchCurrent) return;
    
    const deltaX = touchStart.x - touchCurrent.x;
    const deltaY = touchStart.y - touchCurrent.y;
    const isVerticalGesture = Math.abs(deltaY) > Math.abs(deltaX);
    
    if (!isVerticalGesture || Math.abs(deltaY) < TOUCH_GESTURE_THRESHOLD) return;

    // Check if the gesture happened inside a scrollable container
    const target = event.target as HTMLElement;
    const scrollableContainer = target.closest('.overflow-y-auto');

    if (scrollableContainer) {
      const isAtTop = scrollableContainer.scrollTop <= 0;
      const isAtBottom = Math.abs(scrollableContainer.scrollHeight - scrollableContainer.clientHeight - scrollableContainer.scrollTop) <= 2;

      // Swipe UP (deltaY > 0) means native scroll down. If not at bottom, let it scroll.
      if (deltaY > 0 && !isAtBottom) return;
      // Swipe DOWN (deltaY < 0) means native scroll up. If not at top, let it scroll.
      if (deltaY < 0 && !isAtTop) return;
    }
    
    if (deltaY > 0) {
      navigateByDirection(1);
    } else {
      navigateByDirection(-1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "PageDown") {
        navigateByDirection(1);
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "PageUp") {
        navigateByDirection(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentScene]);

  const currentSceneMeta = TOUR_SCENES[currentScene];
  const CurrentSceneComponent = currentSceneMeta.Component;

  return (
    <div className="relative flex h-[100svh] w-full flex-col overflow-hidden bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white text-[90%] md:text-[100%] !transition-none">
      
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(4,255,141,0.08),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(0,0,0,0.03),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_48%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(4,255,141,0.18),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.10),transparent_24%),linear-gradient(180deg,#000000_0%,#050505_48%,#000000_100%)]" />
        <div className="absolute left-1/2 top-[42%] h-[min(36rem,82vw)] w-[min(36rem,82vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-neon/5 blur-[110px] md:top-1/2 md:blur-3xl" />
      </div>

      <div className="absolute top-0 left-0 w-full z-50">
        <Header />
      </div>

      <div className="absolute left-0 top-[64px] z-40 h-[2px] w-full bg-black/10 dark:bg-white/10">
        <motion.div 
          className="h-full bg-brand-neon origin-left"
          animate={{ scaleX: (currentScene + 1) / TOUR_SCENES.length }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <div 
        className="relative z-10 flex h-full w-full"
        onWheelCapture={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={resetTouchGesture}
      >
                <AnimatePresence>
          <CurrentSceneComponent key={currentSceneMeta.id} integrationSlot={integrationSlot} onNextScene={() => navigateByDirection(1)} />
        </AnimatePresence>
      </div>

    </div>
  );
}
