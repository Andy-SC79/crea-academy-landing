import { useRef } from "react";
import { useInView } from "framer-motion";
import { useTranslation } from "react-i18next";

import creaLogoVideo from "@/assets/infinite-power-transformation-crea.mp4";
import AnimatedText from "@/components/landing/tour/AnimatedText";
import TextSequence from "@/components/landing/tour/TextSequence";
import { cn } from "@/lib/utils";

import SceneTemplate from "./SceneTemplate";
import {
  LEAD_COPY_CLASS,
  SceneHeadline,
  SceneEyebrow,
  TOUR_FRAME_CLASS,
  type SceneComponentProps,
} from "./shared";

export default function Scene1(_: SceneComponentProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(videoRef, { once: true, margin: "200px" });
  const { t } = useTranslation("landing");
  const heroSequence = [
    {
      text: t("tour.scene1.typewriter"),
      durationMs: 5000,
    },
  ];

  return (
    <SceneTemplate
      className={cn(
        "lg:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] 2xl:grid-cols-[minmax(0,1.14fr)_minmax(28rem,0.86fr)]",
      )}
    >
      <div className="relative z-10 flex min-w-0 flex-col justify-center space-y-6 xl:space-y-8">
        <SceneEyebrow>
          <AnimatedText text={t("tour.scene1.eyebrow")} className="" />
        </SceneEyebrow>

        <div className="mt-4 space-y-5 xl:space-y-6">
          <SceneHeadline
            as="h1"
            variant="hero"
            className="max-w-[15ch]"
            parts={[
              { text: t("tour.scene1.headline_line1") },
              { text: t("tour.scene1.headline_line2"), accent: "neon", breakBefore: true },
            ]}
          />

          <div className={cn(LEAD_COPY_CLASS, "mt-12")}>
            <TextSequence sequenceData={heroSequence} className={LEAD_COPY_CLASS} />
          </div>
        </div>
      </div>

      <div className="relative flex w-full min-w-0 items-center justify-center lg:h-full">
        <div className={cn(TOUR_FRAME_CLASS, "w-full max-w-[48rem] p-[1px] aspect-video")}>
          <div ref={videoRef} className="relative h-full w-full overflow-hidden rounded-[31px] bg-slate-950 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
            {isInView ? (
              <video
                src={creaLogoVideo}
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                preload="metadata"
                disablePictureInPicture
                className="absolute inset-0 h-full w-full object-cover scale-105 pointer-events-none opacity-90"
              />
            ) : null}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(4,255,141,0.15)] rounded-[31px]" />
          </div>
        </div>
      </div>
    </SceneTemplate>
  );
}
