import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import AnimatedText from "@/components/landing/tour/AnimatedText";
import TextSequence from "@/components/landing/tour/TextSequence";
import { cn } from "@/lib/utils";

import SceneTemplate from "./SceneTemplate";
import {
  LEAD_COPY_CLASS,
  SceneHeadline,
  SceneEyebrow,
  TOUR_FRAME_CLASS,
  TOUR_SURFACE_CLASS,
  type SceneComponentProps,
} from "./shared";

export default function Scene3({ integrationSlot }: SceneComponentProps) {
  const { t } = useTranslation("landing");
  const textoEscena3 = [
    { text: t("tour.scene3.sequence.0"), durationMs: 4000 },
    { text: t("tour.scene3.sequence.1"), durationMs: 6500 },
    { text: t("tour.scene3.sequence.2"), durationMs: 3500 },
    { text: t("tour.scene3.sequence.3"), durationMs: 2000 },
    { text: t("tour.scene3.sequence.4"), durationMs: 4500 },
  ];

  return (
    <SceneTemplate
      className={cn(
        "lg:grid-cols-[minmax(0,0.82fr)_minmax(20rem,1.18fr)] 2xl:grid-cols-[minmax(0,0.78fr)_minmax(26rem,1.22fr)]",
      )}
    >
      <div className="relative z-10 flex min-w-0 flex-col items-center lg:items-start text-center lg:text-left justify-center space-y-6 xl:space-y-8">
        <div className="flex justify-center lg:justify-start w-full mb-4"><SceneEyebrow>
          <AnimatedText text={t("tour.scene3.eyebrow")} className="" />
        </SceneEyebrow></div>

        <div className="space-y-5 xl:space-y-6">
          <SceneHeadline 
            parts={[
              { text: t("tour.scene3.headline_1"), accent: "prisma" },
              { text: t("tour.scene3.headline_2") },
              { text: t("tour.scene3.headline_3"), accent: "neon" }
            ]} 
          />

          <div className={LEAD_COPY_CLASS}>
            <TextSequence sequenceData={textoEscena3} className={LEAD_COPY_CLASS} />
          </div>
        </div>

        <div className="mt-8 grid gap-3">
          {[t("tour.scene3.promises.0"), t("tour.scene3.promises.1"), t("tour.scene3.promises.2")].map((item) => (
            <div
              key={item}
              className="group flex items-start gap-3 py-2 transition-all duration-300 hover:translate-x-1 sm:gap-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-neon" />
              <p className="min-w-0 text-sm leading-[1.6] text-slate-700 transition-colors duration-300 group-hover:text-slate-900 dark:text-white/75 dark:group-hover:text-white sm:text-base">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex w-full min-w-0 items-center justify-center lg:h-full">
        <div className={cn(TOUR_FRAME_CLASS, "w-full p-[1px] aspect-video")}>
          <div className="relative h-full w-full overflow-hidden rounded-[31px] bg-slate-950 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
            {integrationSlot ? (
              integrationSlot
            ) : (
              <video
                src="https://assets-sam.mkt.dynamics.com/2be9f283-e2e5-40bf-b6a6-d1e8356bf9a7/digitalassets/videos/6255db2c-1539-f111-88b3-000d3ac0461d?ts=639118866570000000"
                className="absolute inset-0 h-full w-full object-cover scale-105 pointer-events-none opacity-90"
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                preload="metadata"
                disablePictureInPicture
              />
            )}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(4,255,141,0.15)] rounded-[31px]" />
          </div>
        </div>
      </div>
    </SceneTemplate>
  );
}
