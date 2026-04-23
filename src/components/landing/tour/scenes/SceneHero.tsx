import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import VolumetricBrandField from "@/components/landing/VolumetricBrandField";
import { Button } from "@/components/ui/button";
import "@/styles/singularity.css";

import SceneTemplate from "./SceneTemplate";
import { SceneHeadline, type SceneComponentProps, type SceneHeadlinePart } from "./shared";

const HERO_KEYWORDS = {
  en: { neon: "living", prisma: "singularity" },
  es: { neon: "viva", prisma: "singularidad" },
  pt: { neon: "viva", prisma: "singularidade" },
} as const;

function buildHeroHeadlineParts(headline: string, prismaWord: string, neonWord: string): any[] {
  const lowerHeadline = headline.toLowerCase();
  const prismaIndex = lowerHeadline.indexOf(prismaWord);

  if (prismaIndex === -1) {
    return [{ text: headline }];
  }

  const neonIndex = lowerHeadline.indexOf(neonWord, prismaIndex + prismaWord.length);

  if (neonIndex === -1) {
    return [
      { text: headline.slice(0, prismaIndex) },
      { text: headline.slice(prismaIndex, prismaIndex + prismaWord.length), accent: "prisma" },
      { text: headline.slice(prismaIndex + prismaWord.length) },
    ].filter((part) => part.text.length > 0);
  }

  return [
    { text: headline.slice(0, prismaIndex) },
    { text: headline.slice(prismaIndex, prismaIndex + prismaWord.length), accent: "prisma" },
    { text: headline.slice(prismaIndex + prismaWord.length, neonIndex) },
    { text: headline.slice(neonIndex, neonIndex + neonWord.length), accent: "neon" },
    { text: headline.slice(neonIndex + neonWord.length) },
  ].filter((part) => part.text.length > 0);
}

export default function SceneHero(_: SceneComponentProps) {
  const { resolvedTheme } = useTheme();
  const { i18n, t } = useTranslation(["landing", "common"]);
  const prefersReducedMotion = useReducedMotion();
  const language = (i18n.language || "es").split("-")[0] as "en" | "es" | "pt";
  const activeLanguage = HERO_KEYWORDS[language] ? language : "es";
  const headline = t("tour.sceneHero.headline", { ns: "landing" });
  const headlineParts = buildHeroHeadlineParts(
    headline,
    HERO_KEYWORDS[activeLanguage].prisma,
    HERO_KEYWORDS[activeLanguage].neon,
  );

  return (
    <SceneTemplate className="grid-cols-1 !max-w-none !gap-0 !px-0 !py-0" flush>
      <div className="col-span-full">
        <section className="relative isolate flex min-h-[calc(100dvh-66px)] w-full items-center justify-center overflow-hidden px-6 py-12 sm:px-8 md:px-12 md:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(0,229,255,0.12),transparent_34%),radial-gradient(circle_at_20%_76%,rgba(4,255,141,0.08),transparent_28%)] dark:bg-[radial-gradient(circle_at_50%_22%,rgba(0,229,255,0.16),transparent_34%),radial-gradient(circle_at_20%_76%,rgba(4,255,141,0.12),transparent_28%)]" />
          <div className="absolute inset-0 opacity-70 dark:opacity-90">
            <VolumetricBrandField
              shape="nebula"
              density={0.62}
              palette={["#04FF8D", "#00E5FF", "#9D00FF"]}
              cycle={false}
              showLogo={false}
              theme={resolvedTheme}
              className="absolute inset-0 h-full w-full opacity-[0.72] dark:opacity-[0.88]"
            />
          </div>
          <div className="singularity-ring absolute inset-0 opacity-50 dark:opacity-70" />
          <div className="singularity-vignette absolute inset-0 opacity-30 dark:opacity-70" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-white/22 via-white/6 to-transparent dark:from-white/[0.035] dark:via-white/[0.01]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-white/28 via-white/6 to-transparent dark:from-black/30 dark:via-black/8" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-cyan/10 blur-[140px] dark:bg-brand-cyan/12" />

          <div className="relative z-10 mx-auto flex w-full max-w-[72rem] flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full flex-col items-center gap-8"
            >
              <SceneHeadline
                as="h1"
                variant="hero"
                className="mx-auto max-w-[16ch] text-center text-[clamp(2rem,6.9vw,5.9rem)] leading-[0.95] tracking-[-0.05em]"
                delay={34}
                parts={headlineParts}
              />

              <div className="flex w-full max-w-md flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="xl"
                  variant="outline"
                  className="min-h-[3.5rem] w-full rounded-full border-slate-300/80 bg-white/78 px-8 text-base font-bold text-slate-900 backdrop-blur-xl hover:border-slate-400/80 hover:bg-white dark:border-white/14 dark:bg-white/[0.05] dark:text-white dark:hover:border-white/24 dark:hover:bg-white/[0.08]"
                >
                  <a href="mailto:contact@crea-academy.com">Contacto</a>
                </Button>
                <Button
                  asChild
                  size="xl"
                  className="singularity-cta min-h-[3.5rem] w-full rounded-full bg-brand-neon px-8 text-base font-bold text-black hover:bg-brand-neon/90"
                >
                  <Link to="#tour-pricing">{t("tour.sceneHero.createAccount", { ns: "landing" })}</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </SceneTemplate>
  );
}
