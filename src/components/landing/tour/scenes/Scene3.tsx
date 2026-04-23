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
      <div className="relative z-10 flex min-w-0 flex-col justify-center space-y-6 xl:space-y-8">
        <SceneEyebrow>
          <AnimatedText text={t("tour.scene3.eyebrow")} className="" />
        </SceneEyebrow>

        <div className="space-y-5 xl:space-y-6">
          <SceneHeadline parts={[{ text: t("tour.scene3.headline") }]} />

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

      <div className="flex min-h-[18rem] min-w-0 items-center lg:min-h-0">
        <div className={TOUR_FRAME_CLASS}>
          <div className={cn(TOUR_SURFACE_CLASS, "flex h-[clamp(20rem,48svh,38rem)] w-full min-w-0 flex-col p-2 xl:h-[clamp(22rem,52svh,40rem)] xl:p-3")}>
            {integrationSlot ? (
              integrationSlot
            ) : (
              <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[24px] bg-slate-950">
                <video
                  src="https://assets-sam.mkt.dynamics.com/2be9f283-e2e5-40bf-b6a6-d1e8356bf9a7/digitalassets/videos/6255db2c-1539-f111-88b3-000d3ac0461d?ts=639118866570000000"
                  className="absolute inset-0 h-full w-full object-cover opacity-92"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </SceneTemplate>
  );
}
