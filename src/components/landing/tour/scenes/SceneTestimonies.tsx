import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { Play, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import AnimatedText from "@/components/landing/tour/AnimatedText";

import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

import {
  SceneEyebrow,
  SceneHeadline,
  TOUR_GLASS_PANEL_CLASS,
} from "./shared";

const TESTIMONIES = [
  { id: 1, url: "https://assets-sam.mkt.dynamics.com/2be9f283-e2e5-40bf-b6a6-d1e8356bf9a7/digitalassets/videos/57bb8fe9-4a3e-f111-88b4-000d3ac04e45?ts=639124596530000000" },
  { id: 2, url: "https://assets-sam.mkt.dynamics.com/2be9f283-e2e5-40bf-b6a6-d1e8356bf9a7/digitalassets/videos/56bb8fe9-4a3e-f111-88b4-000d3ac04e45?ts=639124596700000000" },
  { id: 3, url: "https://assets-sam.mkt.dynamics.com/2be9f283-e2e5-40bf-b6a6-d1e8356bf9a7/digitalassets/videos/55bb8fe9-4a3e-f111-88b4-000d3ac04e45?ts=639124596670000000" },
  { id: 4, url: "https://assets-sam.mkt.dynamics.com/2be9f283-e2e5-40bf-b6a6-d1e8356bf9a7/digitalassets/videos/54bb8fe9-4a3e-f111-88b4-000d3ac04e45?ts=639124596280000000" },
  { id: 5, url: "https://assets-sam.mkt.dynamics.com/2be9f283-e2e5-40bf-b6a6-d1e8356bf9a7/digitalassets/videos/6cc5983d-4b3e-f111-88b4-000d3ac04e45?ts=639124596990000000" },
  { id: 6, url: "https://assets-sam.mkt.dynamics.com/2be9f283-e2e5-40bf-b6a6-d1e8356bf9a7/digitalassets/videos/7c41d649-4b3e-f111-88b4-000d3ac04e45?ts=639124597780000000" },
  { id: 7, url: "https://assets-sam.mkt.dynamics.com/2be9f283-e2e5-40bf-b6a6-d1e8356bf9a7/digitalassets/videos/7bb2ea50-4b3e-f111-88b4-000d3ac04e45?ts=639124597530000000" },
  { id: 8, url: "https://assets-sam.mkt.dynamics.com/2be9f283-e2e5-40bf-b6a6-d1e8356bf9a7/digitalassets/videos/84da0866-4b3e-f111-88b4-000d3ac04e45?ts=639124597800000000" },
];

interface TestimonyCardProps {
  testimony: typeof TESTIMONIES[0];
  index: number;
  activeVideoId: number | null;
  setActiveVideoId: (id: number | null) => void;
}

const TestimonyCard = ({
  testimony,
  index,
  activeVideoId,
  setActiveVideoId,
}: TestimonyCardProps) => {
  const { t } = useTranslation("landing");
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(cardRef, { margin: "200px" });

  const [isHovered, setIsHovered] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const isPlaying = activeVideoId === testimony.id;

  useEffect(() => {
    if (activeVideoId !== testimony.id) {
      videoRef.current?.pause();
    }
  }, [activeVideoId, testimony.id]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 28 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 28 });

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (!isPlaying || videoRef.current.paused) {
      videoRef.current.muted = false;
      void videoRef.current.play();
      setActiveVideoId(testimony.id);
      return;
    }

    videoRef.current.pause();
    setActiveVideoId(null);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      className={cn(
        TOUR_GLASS_PANEL_CLASS,
        "group relative h-[480px] w-[280px] shrink-0 cursor-pointer overflow-hidden rounded-[30px] md:h-[600px] md:w-[340px]",
      )}
      onClick={togglePlay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {isInView ? (
        <video
          ref={videoRef}
          src={`${testimony.url}#t=0.001`}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            isPlaying ? "opacity-100" : "opacity-82 group-hover:opacity-92",
          )}
          loop
          playsInline
          controls={false}
          preload="metadata"
          onLoadedData={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
        />
      ) : null}

      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 transition-opacity duration-500",
          isPlaying && !isBuffering ? "opacity-0" : "opacity-100",
        )}
      >
        {isBuffering ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-neon" />
            <p className="font-display text-sm font-bold uppercase tracking-widest text-brand-neon drop-shadow-lg">
              {t("tour.testimonies.loading")}
            </p>
          </div>
        ) : (
          <p className="font-display text-2xl font-bold tracking-tight text-white drop-shadow-lg">
            {t("tour.testimonies.card_title")}
          </p>
        )}
      </div>

      <AnimatePresence>
        {isHovered ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{ x: springX, y: springY }}
            className="tour-meta-chip pointer-events-none absolute left-0 top-0 z-50 -ml-[60px] -mt-[24px] flex h-12 w-[120px] items-center justify-center gap-2 rounded-full !bg-white/90 text-black"
          >
            {isPlaying ? (
              <span className="text-xs font-bold uppercase tracking-wider text-black">{t("tour.testimonies.pause")}</span>
            ) : (
              <>
                <Play className="h-3 w-3 fill-black text-black" />
                <span className="text-xs font-bold uppercase tracking-wider text-black">{t("tour.testimonies.play")}</span>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export default function SceneTestimonies() {
  const { t } = useTranslation("landing");
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollRefDesktop = useRef<HTMLDivElement>(null);

  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    setIsDown(true);
    setStartX(event.pageX - element.offsetLeft);
    setScrollLeft(element.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDown(false);
  };

  const onMouseUp = () => {
    setIsDown(false);
  };

  const onMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!isDown) return;

    event.preventDefault();
    const element = event.currentTarget;
    const x = event.pageX - element.offsetLeft;
    const walk = (x - startX) * 2;
    element.scrollLeft = scrollLeft - walk;
  };

  const scroll = (direction: "left" | "right") => {
    const container = window.innerWidth < 768 ? scrollRef.current : scrollRefDesktop.current;
    if (container) {
      const scrollAmount = window.innerWidth < 768 ? container.clientWidth * 0.8 : 450;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative flex w-full flex-col items-center overflow-hidden py-20 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="mb-8 px-4 text-center md:mb-12"
      >
        <div className="mb-4 flex justify-center">
          <SceneEyebrow icon={<Play className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />}>
            <AnimatedText text={t("tour.testimonies.eyebrow")} />
          </SceneEyebrow>
        </div>
        <SceneHeadline
          typewriter={false}
          className="mx-auto max-w-[min(100%,14ch)] text-center text-[clamp(2.3rem,6vw,4.9rem)] leading-[1.02]"
          parts={[
            { text: t("tour.testimonies.headline_1") },
            { text: t("tour.testimonies.headline_2"), accent: "prisma" },
            { text: t("tour.testimonies.headline_3") },
            { text: t("tour.testimonies.headline_4"), breakBefore: true },
            { text: t("tour.testimonies.headline_5") },
            { text: t("tour.testimonies.headline_6"), accent: "neon" },
          ]}
        />
      </motion.div>

      <div className="relative w-full">
        <div className="w-full md:hidden">
          <div
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
          >
            {TESTIMONIES.map((testimony, index) => (
              <div key={`mobile-${testimony.id}`} className="snap-center shrink-0">
                <TestimonyCard
                  testimony={testimony}
                  index={index}
                  activeVideoId={activeVideoId}
                  setActiveVideoId={setActiveVideoId}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden w-full md:flex">
          <div
            ref={scrollRefDesktop}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            className="flex w-full snap-x snap-mandatory gap-6 overflow-x-auto px-12 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
          >
            {TESTIMONIES.map((testimony, index) => (
              <div key={`desktop-${testimony.id}`} className="snap-center shrink-0">
                <TestimonyCard
                  testimony={testimony}
                  index={index}
                  activeVideoId={activeVideoId}
                  setActiveVideoId={setActiveVideoId}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons - Centered relative to videos */}
        <div className="absolute inset-y-0 left-0 z-30 flex items-center pl-2 pointer-events-none md:pl-6">
          <button
            onClick={() => scroll("left")}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-brand-neon/40 bg-slate-900/80 text-brand-neon shadow-[0_0_20px_rgba(4,255,141,0.2)] backdrop-blur-md transition-all hover:bg-slate-900 hover:scale-110 active:scale-95 md:h-16 md:w-16"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-8 w-8 md:h-10 md:w-10" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 z-30 flex items-center pr-2 pointer-events-none md:pr-6">
          <button
            onClick={() => scroll("right")}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-brand-neon/40 bg-slate-900/80 text-brand-neon shadow-[0_0_20px_rgba(4,255,141,0.2)] backdrop-blur-md transition-all hover:bg-slate-900 hover:scale-110 active:scale-95 md:h-16 md:w-16"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-8 w-8 md:h-10 md:w-10" />
          </button>
        </div>
      </div>
    </div>
  );
}
