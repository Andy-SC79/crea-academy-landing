import { motion } from "framer-motion";
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
  "relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,250,252,0.88)_100%)] text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-[#15243A] dark:bg-[linear-gradient(180deg,rgba(7,16,31,0.96)_0%,rgba(5,10,22,0.94)_100%)] dark:text-white dark:shadow-[0_30px_90px_rgba(0,0,0,0.34)]";
const PRICING_PANEL_CLASS =
  "rounded-[28px] border border-slate-200/80 bg-white/78 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-[#16243C] dark:bg-[#091223]/92 dark:shadow-[0_20px_52px_rgba(0,0,0,0.24)]";
const PRICING_INSET_CLASS =
  "border border-slate-200/80 bg-slate-50/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-[#18263D] dark:bg-[#0C172B]/92 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";
const PRICING_CARD_BASE_CLASS =
  "border border-slate-200/80 bg-white/82 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-[#16243C] dark:bg-[#091223]/94 dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)]";
const PRICING_GHOST_BUTTON_CLASS =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/88 px-6 text-sm font-display font-bold tracking-[0.01em] text-slate-900 no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition-all duration-300 hover:border-brand-neon/50 hover:bg-brand-neon/8 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-neon/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:border-[#18263D] dark:bg-[#0C172B]/96 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:hover:border-brand-neon/45 dark:hover:bg-[#11203A] dark:hover:text-white";

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
      ctaHref: "/auth",
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
      ctaHref: "/auth",
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
      priceAmount: t("tour.pricing.tiers.creadores.price_amount"),
      pricePeriod: t("tour.pricing.tiers.creadores.price_period"),
      priceSubtext: t("tour.pricing.tiers.creadores.price_subtext"),
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
          <div className="absolute left-[-8%] top-[-18%] h-52 w-52 rounded-full bg-brand-neon/10 blur-3xl dark:bg-brand-neon/8" />
          <div className="absolute right-[-10%] top-[18%] h-64 w-64 rounded-full bg-brand-purple/10 blur-3xl dark:bg-brand-purple/12" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.2))] dark:bg-[linear-gradient(180deg,transparent,rgba(3,7,18,0.32))]" />
        </div>
        <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <SceneEyebrow className="dark:text-brand-neon">
                <AnimatedText text={t("tour.pricing.eyebrow")} className="" />
              </SceneEyebrow>
              <div className="space-y-3">
                <SceneHeadline
                  parts={[
                    { text: t("tour.pricing.headline_1") },
                    { text: t("tour.pricing.headline_2"), accent: "prisma" },
                    { text: t("tour.pricing.headline_3") },
                    { text: t("tour.pricing.headline_4"), accent: "neon" },
                  ]}
                />
                <p className="max-w-2xl text-base leading-7 text-slate-700 dark:text-white/70 sm:text-[1.05rem]">
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
              <p className="text-[11px] font-display font-black uppercase tracking-[0.18em] text-[#00A859] dark:text-brand-neon/80">
                {t("tour.pricing.safe_payment")}
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-900 dark:font-medium dark:text-white/90">
                {t("tour.pricing.no_card")}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-slate-600 dark:text-white/60">
                <span
                  className={cn(
                    PRICING_INSET_CLASS,
                    "inline-flex items-center rounded-full px-3 py-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/60",
                  )}
                >
                  {t("tour.pricing.payment_methods")}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {pricingTiers.map((tier) => {
              const TierIcon = tier.icon;
              const CtaIcon = tier.ctaIcon;

              return (
                <motion.article
                  key={tier.id}
                  variants={cardVariants}
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden rounded-[30px] p-8 transition-all duration-300",
                    PRICING_CARD_BASE_CLASS,
                    "hover:-translate-y-1",
                    tier.id === "enterprise"
                      ? "hover:shadow-[0_0_0_1px_rgba(123,44,191,0.5),0_24px_60px_rgba(123,44,191,0.2)]"
                      : "hover:border-brand-neon/40 hover:shadow-[0_0_0_1px_rgba(4,255,141,0.18),0_24px_60px_rgba(4,255,141,0.10)] dark:hover:border-brand-neon/40",
                    tier.highlighted
                      ? "border border-brand-neon/80 shadow-[0_0_0_1px_rgba(4,255,141,0.26),0_28px_70px_rgba(4,255,141,0.12)]"
                      : "",
                  )}
                >
                  {tier.id === "enterprise" ? (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-[30px] p-[1px] bg-gradient-to-br from-brand-cyan/50 via-brand-purple/50 to-brand-orange/50 transition-all duration-500 group-hover:from-brand-cyan group-hover:via-brand-purple group-hover:to-brand-orange group-hover:opacity-100"
                      style={{
                        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                      }}
                    />
                  ) : null}

                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div
                      className={cn(
                        "absolute inset-x-0 top-0 h-32",
                        tier.id === "enterprise"
                          ? "bg-[radial-gradient(circle_at_top,_rgba(123,44,191,0.25),_transparent_60%)]"
                          : "bg-[radial-gradient(circle_at_top,_rgba(4,255,141,0.18),_transparent_58%)]",
                      )}
                    />
                  </div>

                  <div className="relative z-10 flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-4">
                        <div
                          className={cn(
                            PRICING_INSET_CLASS,
                            "inline-flex h-12 w-12 items-center justify-center rounded-2xl text-brand-neon",
                          )}
                        >
                          <TierIcon className="h-5 w-5" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[11px] font-display font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/50">
                            {tier.kicker}
                          </p>
                          <h3 className="font-display text-[2rem] font-bold tracking-tight text-slate-900 dark:text-brand-white">
                            {tier.name}
                          </h3>
                        </div>
                      </div>

                      {tier.badge ? (
                        <div className="absolute right-4 top-4 z-20">
                          <span className="inline-flex whitespace-nowrap rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-[10px] font-display font-black uppercase tracking-[0.16em] text-[#00A859] shadow-sm backdrop-blur-md md:text-[11px] dark:border-brand-neon/50 dark:bg-brand-neon/10 dark:text-brand-neon dark:shadow-[0_0_15px_rgba(4,255,141,0.2)]">
                            {tier.badge}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <p className="mt-6 min-h-[56px] text-sm leading-6 text-slate-700 dark:text-white/70">
                      {tier.subtitle}
                    </p>
                    
                    <div className="my-6">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                          {tier.priceAmount}
                        </span>
                        {tier.pricePeriod && (
                          <span className="text-sm font-semibold text-slate-500 dark:text-white/50">
                            {tier.pricePeriod}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[13px] text-slate-500 dark:text-white/50">
                        {tier.priceSubtext}
                      </p>
                    </div>

                    <div className="mt-4 flex-1 border-t border-slate-200/50 dark:border-white/10 pt-6">
                      <ul className="space-y-4">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <span
                              className={cn(
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                                tier.featureTone === "brand"
                                  ? "border-brand-neon/40 bg-brand-neon/12 text-brand-neon"
                                  : cn(
                                      PRICING_INSET_CLASS,
                                      "text-slate-500 dark:text-slate-300/65",
                                    ),
                              )}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-sm leading-6 text-slate-700 dark:text-white/80">{feature}</span>
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
                          className="w-full rounded-full px-6 font-display text-[0.95rem] font-extrabold tracking-[0.01em] shadow-none transition-all duration-300 hover:shadow-none bg-brand-neon text-black hover:bg-brand-neon/90"
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
            })}
          </div>
        </div>
      </div>
    </SceneTemplate>
  );
};

export default PricingSection;
