import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import Magnetic from "@/components/landing/Magnetic";

// Target Date: April 23, 2026, 16:00 (4:00 PM) Colombia Time (UTC-5)
// In UTC: 2026-04-23T21:00:00Z
const TARGET_DATE = new Date("2026-04-23T21:00:00Z").getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(): TimeLeft {
  const difference = TARGET_DATE - Date.now();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference
  };
}

function AnimatedNumber({ value, label }: { value: number; label: string }) {
  // Pad with leading zero if needed
  const paddedValue = value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/[0.04] border border-black/5 dark:border-white/5 relative overflow-hidden group w-[46px] h-[54px] sm:w-[80px] sm:h-[86px]">
      {/* Subtle glow effect inside each card */}
      <div className="absolute inset-0 bg-brand-neon/0 group-hover:bg-brand-neon/5 transition-colors duration-500 rounded-2xl" />
      
      <div className="relative h-[40px] sm:h-[50px] w-full flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={paddedValue}
            initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute font-display text-[1.35rem] leading-none sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter"
          >
            {paddedValue}
          </motion.span>
        </AnimatePresence>
      </div>
      <p className="mt-1 sm:mt-2 text-[6.5px] sm:text-[11px] font-bold uppercase tracking-normal sm:tracking-[0.05em] text-slate-500 dark:text-white/50">
        {label}
      </p>
    </div>
  );
}

export default function TimeCounter({ className }: { className?: string }) {
  const { t } = useTranslation("landing");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isLive = timeLeft.total <= 0;

  return (
    <div className={cn("w-full max-w-4xl mx-auto relative z-20 px-4 sm:px-0", className)}>
      <div className="relative overflow-hidden rounded-[32px] bg-white/70 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 p-3 sm:p-6 shadow-2xl shadow-black/5 dark:shadow-[0_0_80px_rgba(4,255,141,0.05)]">
        
        {/* Background Prisma Glow */}
        <div className="absolute top-1/2 left-1/2 w-full h-full max-w-[400px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-brand-cyan/20 via-brand-purple/20 to-brand-orange/20 rounded-full blur-[100px] pointer-events-none opacity-50 dark:opacity-30" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-3 sm:space-y-5">
          <div className="space-y-2">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-brand-neon/10 border border-brand-neon/20 px-3 py-1.5 sm:px-4"
            >
              <span className="w-2 h-2 rounded-full bg-brand-neon animate-pulse" />
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] sm:tracking-[0.18em] text-brand-neon whitespace-nowrap">
                {t("tour.countdown.title")}
              </p>
            </motion.div>
          </div>

          {isLive ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6"
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-orange bg-clip-text text-transparent tracking-tight">
                {t("tour.countdown.live")}
              </h2>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center gap-1 sm:gap-3">
              <AnimatedNumber value={timeLeft.days} label={t("tour.countdown.days")} />
              <span className="text-xl sm:text-4xl font-light text-slate-300 dark:text-white/20 mb-4 sm:mb-5">:</span>
              <AnimatedNumber value={timeLeft.hours} label={t("tour.countdown.hours")} />
              <span className="text-xl sm:text-4xl font-light text-slate-300 dark:text-white/20 mb-4 sm:mb-5">:</span>
              <AnimatedNumber value={timeLeft.minutes} label={t("tour.countdown.minutes")} />
              <span className="text-xl sm:text-4xl font-light text-slate-300 dark:text-white/20 mb-4 sm:mb-5">:</span>
              <AnimatedNumber value={timeLeft.seconds} label={t("tour.countdown.seconds")} />
            </div>
          )}

          {/* YouTube Action Button (Always visible) */}
          <div className="pt-2">
            <Magnetic strength={0.25}>
              <a 
                href="https://www.youtube.com/live/5e-FQmljP0E" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-6 sm:py-3 bg-white/5 backdrop-blur-md border border-[#FF0000]/30 hover:border-[#FF0000] hover:bg-[#FF0000]/10 text-slate-900 dark:text-white rounded-full font-bold text-[11px] sm:text-base whitespace-nowrap shadow-[0_0_20px_rgba(255,0,0,0.1)] hover:shadow-[0_0_40px_rgba(255,0,0,0.2)] transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000" className="w-5 h-5 sm:w-8 sm:h-8 drop-shadow-md">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>
                    {isLive 
                      ? "Unirse al Directo"
                      : "Activar Recordatorio"}
                  </span>
                </motion.div>
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </div>
  );
}
