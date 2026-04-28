import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Magnetic from "@/components/landing/Magnetic";
import VolumetricBrandField from "@/components/landing/VolumetricBrandField";
import creaLogoWhite from "@/assets/crea-logo-white-v2.png";
import creaLogoBlack from "@/assets/crea-logo-black-v2.png";
import { Button } from "@/components/ui/button";
import { APP_AUTH_URL, BOOTCAMP_IA_PATH } from "@/lib/external-links";
import "@/styles/singularity.css";

import SceneTemplate from "./SceneTemplate";
import { SceneHeadline, type SceneHeadlinePart } from "./shared";

const HERO_KEYWORDS = {
  en: { neon: "living", prisma: "singularity" },
  es: { neon: "viva", prisma: "singularidad" },
  pt: { neon: "viva", prisma: "singularidade" },
} as const;

function buildHeroHeadlineParts(headline: string, prismaWord: string, neonWord: string): SceneHeadlinePart[] {
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

export default function SceneHero() {
  const { resolvedTheme } = useTheme();
  const { i18n, t } = useTranslation(["landing", "common"]);
  const prefersReducedMotion = useReducedMotion();
  const language = (i18n.language || "es").split("-")[0] as "en" | "es" | "pt";
  const activeLanguage = HERO_KEYWORDS[language] ? language : "es";
  const heroFieldDensity = 0.6;
  const headline = t("tour.sceneHero.headline", { ns: "landing" });
  const headlineParts = buildHeroHeadlineParts(
    headline,
    HERO_KEYWORDS[activeLanguage].prisma,
    HERO_KEYWORDS[activeLanguage].neon,
  );

  return (
    <SceneTemplate className="grid-cols-1 !max-w-none !gap-0 !px-0 !py-0" flush>
      <div className="col-span-full">
        <section className="relative isolate flex min-h-[100dvh] w-full items-center justify-center overflow-hidden px-6 pb-6 sm:px-8 sm:pb-8 md:px-12 md:pb-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(250,252,254,0.74)_54%,rgba(247,250,252,0.62)_100%),radial-gradient(circle_at_50%_22%,rgba(10,86,184,0.03),transparent_34%),radial-gradient(circle_at_20%_76%,rgba(0,90,67,0.024),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(75,43,223,0.018),transparent_28%)] dark:bg-[radial-gradient(circle_at_50%_22%,rgba(0,229,255,0.16),transparent_34%),radial-gradient(circle_at_20%_76%,rgba(4,255,141,0.12),transparent_28%)]" />
          <div className="absolute inset-0 opacity-68 dark:opacity-90">
            <VolumetricBrandField
              shape="nebula"
              density={heroFieldDensity}
              palette={["#04FF8D", "#00E5FF", "#9D00FF"]}
              cycle={false}
              showLogo={false}
              theme={resolvedTheme}
              className="absolute inset-0 h-full w-full opacity-[0.66] dark:opacity-[0.88]"
            />
          </div>
          <div className="singularity-ring absolute inset-0 opacity-38 dark:opacity-70" />
          <div className="singularity-vignette absolute inset-0 opacity-24 dark:opacity-70" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-white/28 via-white/6 to-transparent dark:from-white/[0.035] dark:via-white/[0.01]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#fbfdff]/42 via-[#fbfdff]/6 to-transparent dark:from-black/30 dark:via-black/8" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-cyan/3 blur-[140px] dark:bg-brand-cyan/12" />

          <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[72rem] flex-col items-center justify-between gap-10 pb-16 pt-[5.5rem] text-center sm:gap-12 sm:pb-20 sm:pt-28">
            <div className="flex flex-1 w-full flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.7 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex w-full flex-col items-center"
              >
                <div className="mb-8 flex justify-center">
                  <div className="tour-pill-shell group relative inline-flex items-center justify-center gap-4 rounded-full px-5 py-2.5 transition-all duration-500 hover:scale-105">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-cyan/20 via-brand-purple/20 to-brand-orange/20 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center">
                        <img src={creaLogoBlack} alt="Crea Logo" className="h-6 sm:h-8 w-auto object-contain block dark:hidden" />
                        <img src={creaLogoWhite} alt="Crea Logo" className="h-6 sm:h-8 w-auto object-contain hidden dark:block" />
                      </div>
                      <div className="h-5 sm:h-6 w-[2px] rounded-full bg-[color:var(--tour-border-strong)] dark:bg-white/20" />
                      <span className="font-display text-[0.9rem] sm:text-[1.05rem] font-black tracking-[0.25em] text-[color:var(--tour-text-default)] dark:text-white uppercase dark:drop-shadow-sm pt-1">
                        Academy
                      </span>
                    </div>
                  </div>
                </div>
                <SceneHeadline
                  as="h1"
                  variant="hero"
                  className="mx-auto max-w-[18ch] text-center text-[clamp(2.5rem,8.5vw,7.5rem)] leading-[0.95] tracking-[-0.05em]"
                  delay={34}
                  parts={headlineParts}
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full max-w-[44rem] flex-col items-center justify-center gap-3 min-[640px]:flex-row pb-safe"
            >
              <Magnetic strength={0.24} className="w-full min-[640px]:flex-1">
                <Button
                  asChild
                  size="xl"
                  className="singularity-cta min-h-[3.5rem] w-full rounded-full bg-brand-neon px-4 sm:px-8 text-[1.05rem] sm:text-[1.2rem] font-display font-black tracking-tight text-black hover:bg-brand-neon/90"
                >
                  <Link to={BOOTCAMP_IA_PATH}>Bootcamp IA</Link>
                </Button>
              </Magnetic>
              <Magnetic strength={0.2} className="w-full min-[640px]:flex-1">
                <Button
                  asChild
                  size="xl"
                  variant="outline"
                  className="tour-secondary-button min-h-[3.5rem] w-full rounded-full px-4 sm:px-8 text-[1.05rem] sm:text-[1.2rem] font-display font-black tracking-tight dark:border-white/14 dark:bg-white/[0.05] dark:text-white dark:hover:border-white/24 dark:hover:bg-white/[0.08]"
                >
                  <a href={APP_AUTH_URL}>{t("nav.signIn", { ns: "common" })}</a>
                </Button>
              </Magnetic>
              <Magnetic strength={0.24} className="w-full min-[640px]:flex-1">
                <Button
                  asChild
                  size="xl"
                  variant="outline"
                  className="tour-secondary-button min-h-[3.5rem] w-full rounded-full px-4 sm:px-8 text-[1.05rem] sm:text-[1.2rem] font-display font-black tracking-tight dark:border-white/14 dark:bg-white/[0.05] dark:text-white dark:hover:border-white/24 dark:hover:bg-white/[0.08]"
                >
                  <a href="#pricing-section">{t("tour.sceneHero.createAccount", { ns: "landing" })}</a>
                </Button>
              </Magnetic>
            </motion.div>
          </div>
        </section>
      </div>
    </SceneTemplate>
  );
}
