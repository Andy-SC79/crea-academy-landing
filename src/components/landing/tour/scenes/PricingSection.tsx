import React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  Rocket,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import AnimatedText from "@/components/landing/tour/AnimatedText";
import { Button } from "@/components/ui/button";
import { APP_AUTH_URL } from "@/lib/external-links";
import { cn } from "@/lib/utils";

import SceneTemplate from "./SceneTemplate";
import { SceneEyebrow, SceneHeadline } from "./shared";

type PricingTier = {
  id: "free" | "creadores" | "enterprise";
  name: string;
  kicker: string;
  subtitle: string;
  badge?: string;
  highlighted?: boolean;
  icon: LucideIcon;
  ctaLabel: string;
  ctaHref: string;
  ctaIcon?: LucideIcon;
  ctaStyle: "ghost" | "solid";
  featureTone: "muted" | "brand";
  features: string[];
  priceAmount: string;
  pricePeriod: string;
  priceSubtext: string;
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const PRICING_SECTION_CLASS =
  "tour-surface-shell relative overflow-hidden rounded-[32px] text-[color:var(--tour-text-strong)] backdrop-blur-xl dark:text-white";
const PRICING_PANEL_CLASS =
  "tour-glass-shell rounded-[28px]";
const PRICING_INSET_CLASS =
  "tour-inset-surface";
const PRICING_CARD_BASE_CLASS =
  "tour-glass-shell";
const PRICING_GHOST_BUTTON_CLASS =
  "tour-secondary-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-display font-bold tracking-[0.01em] no-underline transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-neon/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:border-[#18263D] dark:bg-[#0C172B]/96 dark:text-white dark:hover:border-brand-neon/45 dark:hover:bg-[#11203A] dark:hover:text-white";


function PricingCard({ tier }: { tier: PricingTier }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(event: React.MouseEvent<HTMLElement>) {
    const { left, top } = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - left);
    mouseY.set(event.clientY - top);
  }

  const TierIcon = tier.icon;
  const CtaIcon = tier.ctaIcon;
  const glowColor = tier.id === "enterprise" ? "rgba(157,0,255,0.6)" : "rgba(4,255,141,0.5)";

  return (
    <motion.article
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative flex h-full flex-col rounded-[30px] transition-all duration-500 hover:z-20",
        PRICING_CARD_BASE_CLASS,
        "hover:-translate-y-2 hover:scale-[1.02]",
        tier.highlighted
          ? "border-brand-neon/45 shadow-[0_0_0_1px_rgba(4,255,141,0.18),0_24px_60px_rgba(4,255,141,0.10)] dark:border-brand-neon/80 dark:shadow-[0_0_0_1px_rgba(4,255,141,0.26),0_28px_70px_rgba(4,255,141,0.12)]"
          : "border-[color:var(--tour-border-standard)] dark:border-[#16243C]"
      )}
    >
      {/* Mouse Tracking Glow Border */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[30px] opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-50"
        style={{
          background: useMotionTemplate`radial-gradient(450px circle at ${mouseX}px ${mouseY}px, ${glowColor}, transparent 80%)`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "2px",
        }}
      />
      
      {/* Mouse Tracking Inner Core Glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[30px] opacity-0 transition-opacity duration-500 group-hover:opacity-100 overflow-hidden z-0"
      >
         <motion.div 
            className="absolute inset-0"
            style={{
               background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${glowColor.replace('0.6', '0.08').replace('0.5', '0.08')}, transparent 80%)`
            }}
         />
      </motion.div>

      <div className="relative z-10 flex h-full flex-col p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-4">
            <div className={cn(PRICING_INSET_CLASS, "inline-flex h-12 w-12 items-center justify-center rounded-2xl text-brand-neon")}>
              <TierIcon className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <p className="tour-kicker text-[11px] font-display font-black uppercase tracking-[0.18em] dark:text-brand-neon/80">
                {tier.kicker}
              </p>
              <h3 className="font-display text-[2rem] font-bold tracking-tight text-slate-900 dark:text-brand-white">
                {tier.name}
              </h3>
            </div>
          </div>
          {tier.badge ? (
            <div className="absolute right-4 top-4 z-20">
              <span className="tour-meta-chip inline-flex whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-display font-black uppercase tracking-[0.16em] text-[color:var(--tour-text-strong)] md:text-[11px] dark:border-brand-neon/50 dark:bg-brand-neon/10 dark:text-brand-neon dark:shadow-[0_0_15px_rgba(4,255,141,0.2)]">
                {tier.badge}
              </span>
            </div>
          ) : null}
        </div>

        <p className="tour-text-default mt-6 min-h-[56px] text-sm leading-6 dark:text-white/70">
          {tier.subtitle}
        </p>

        <div className="my-6">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-[clamp(1.8rem,4vw,2.25rem)] font-bold tracking-tight text-slate-900 dark:text-white">
              {tier.priceAmount}
            </span>
            {tier.pricePeriod && (
              <span className="tour-text-muted text-sm font-semibold dark:text-white/50">
                {tier.pricePeriod}
              </span>
            )}
          </div>
          <p className="tour-text-muted mt-1 text-[13px] dark:text-white/50">
            {tier.priceSubtext}
          </p>
        </div>

        <div className="mt-4 flex-1 border-t border-[color:var(--tour-border-subtle)] dark:border-white/10 pt-6">
          <ul className="space-y-4">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    tier.featureTone === "brand"
                      ? "tour-accent-chip"
                      : cn(PRICING_INSET_CLASS, "text-[color:var(--tour-text-muted)] dark:text-slate-300/65")
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="tour-text-default text-sm leading-6 dark:text-white/80">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 pt-6">
          {tier.ctaStyle === "ghost" ? (
            <a href={tier.ctaHref} className={PRICING_GHOST_BUTTON_CLASS}>
              <span>{tier.ctaLabel}</span>
              {CtaIcon ? <CtaIcon className="h-4 w-4" /> : null}
            </a>
          ) : (
            <Button
              asChild
              size="lg"
              variant="default"
              className="w-full rounded-full px-6 font-display text-[1.05rem] font-black tracking-tight shadow-none transition-all duration-300 hover:shadow-none bg-brand-neon text-black hover:bg-brand-neon/90"
            >
              <a href={tier.ctaHref}>
                {tier.ctaLabel}
                {CtaIcon ? <CtaIcon className="h-4 w-4" /> : null}
              </a>
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

const PricingSection = () => {

  const { t } = useTranslation("landing");

  const pricingTiers: PricingTier[] = [
    {
      id: "free",
      name: t("tour.pricing.tiers.free.name"),
      kicker: t("tour.pricing.tiers.free.kicker"),
      subtitle: t("tour.pricing.tiers.free.subtitle"),
      icon: Sparkles,
      ctaLabel: t("tour.pricing.tiers.free.ctaLabel"),
      ctaHref: APP_AUTH_URL,
      ctaIcon: ArrowRight,
      ctaStyle: "ghost",
      featureTone: "brand",
      priceAmount: t("tour.pricing.tiers.free.price_amount"),
      pricePeriod: t("tour.pricing.tiers.free.price_period"),
      priceSubtext: t("tour.pricing.tiers.free.price_subtext"),
      features: [
        t("tour.pricing.tiers.free.features.0"),
        t("tour.pricing.tiers.free.features.1"),
        t("tour.pricing.tiers.free.features.2"),
        t("tour.pricing.tiers.free.features.3"),
      ],
    },
    {
      id: "creadores",
      name: t("tour.pricing.tiers.creadores.name"),
      kicker: t("tour.pricing.tiers.creadores.kicker"),
      subtitle: t("tour.pricing.tiers.creadores.subtitle"),
      badge: t("tour.pricing.tiers.creadores.badge"),
      highlighted: true,
      icon: Rocket,
      ctaLabel: t("tour.pricing.tiers.creadores.ctaLabel"),
      ctaHref: APP_AUTH_URL,
      ctaIcon: Zap,
      ctaStyle: "solid",
      featureTone: "brand",
      priceAmount: t("tour.pricing.tiers.creadores.price_amount"),
      pricePeriod: t("tour.pricing.tiers.creadores.price_period"),
      priceSubtext: t("tour.pricing.tiers.creadores.price_subtext"),
      features: [
        t("tour.pricing.tiers.creadores.features.0"),
        t("tour.pricing.tiers.creadores.features.1"),
        t("tour.pricing.tiers.creadores.features.2"),
        t("tour.pricing.tiers.creadores.features.3"),
        t("tour.pricing.tiers.creadores.features.4"),
      ],
    },
    {
      id: "enterprise",
      name: t("tour.pricing.tiers.enterprise.name"),
      kicker: t("tour.pricing.tiers.enterprise.kicker"),
      subtitle: t("tour.pricing.tiers.enterprise.subtitle"),
      icon: Building2,
      ctaLabel: t("tour.pricing.tiers.enterprise.ctaLabel"),
      ctaHref: "mailto:info@ingenieria365.com?subject=Agendar%20Diagnostico%20Crea%20Academy",
      ctaIcon: CalendarDays,
      ctaStyle: "solid",
      featureTone: "brand",
      priceAmount: t("tour.pricing.tiers.enterprise.price_amount"),
      pricePeriod: t("tour.pricing.tiers.enterprise.price_period"),
      priceSubtext: t("tour.pricing.tiers.enterprise.price_subtext"),
      features: [
        t("tour.pricing.tiers.enterprise.features.0"),
        t("tour.pricing.tiers.enterprise.features.1"),
        t("tour.pricing.tiers.enterprise.features.2"),
        t("tour.pricing.tiers.enterprise.features.3"),
        t("tour.pricing.tiers.enterprise.features.4"),
      ],
    },
  ];

  return (
    <SceneTemplate isPricing showFooter={true} disableScrollReveal>
      <div className={PRICING_SECTION_CLASS}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8%] top-[-18%] h-52 w-52 rounded-full bg-brand-neon/6 blur-3xl dark:bg-brand-neon/8" />
          <div className="absolute right-[-10%] top-[18%] h-64 w-64 rounded-full bg-brand-purple/6 blur-3xl dark:bg-brand-purple/12" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.2))] dark:bg-[linear-gradient(180deg,transparent,rgba(3,7,18,0.32))]" />
        </div>
        <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
              <div className="flex justify-center lg:justify-start mb-4"><SceneEyebrow className="dark:text-brand-neon">
                <AnimatedText text={t("tour.pricing.eyebrow")} className="" />
              </SceneEyebrow></div>
              <div className="space-y-3">
                <SceneHeadline
                  parts={[
                    { text: t("tour.pricing.headline_1") },
                    { text: t("tour.pricing.headline_2"), accent: "prisma" },
                    { text: t("tour.pricing.headline_3") },
                    { text: t("tour.pricing.headline_4"), accent: "neon" },
                  ]}
                />
                <p className="tour-text-default max-w-2xl text-base leading-7 dark:text-white/70 sm:text-[1.05rem]">
                  {t("tour.pricing.description")}
                </p>
              </div>
            </div>

            <div
              className={cn(
                PRICING_PANEL_CLASS,
                "p-5 lg:max-w-sm",
              )}
            >
              <p className="tour-kicker text-[11px] font-display font-black uppercase tracking-[0.18em] dark:text-brand-neon/80">
                {t("tour.pricing.safe_payment")}
              </p>
              <p className="tour-text-default mt-2 text-sm font-bold leading-6 dark:font-medium dark:text-white/90">
                {t("tour.pricing.no_card")}
              </p>
              <div className="tour-text-default mt-4 flex flex-wrap items-center gap-3 dark:text-white/60">
                <span
                  className={cn(
                    "tour-meta-chip inline-flex items-center rounded-full px-3 py-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-[color:var(--tour-text-muted)] dark:text-white/60",
                  )}
                >
                  {t("tour.pricing.payment_methods")}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <PricingCard key={tier.id} tier={tier} />
            ))}
          </div>
        </div>
      </div>
    </SceneTemplate>
  );
};

export default PricingSection;
