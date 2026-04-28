import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import creaLogoWhite from "@/assets/crea-logo-white-v2.png";
import creaLogoBlack from "@/assets/crea-logo-black-v2.png";
import ThemeToggle from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { APP_AUTH_URL } from "@/lib/external-links";

const PRICING_SECTION_HREF = "#pricing-section";

export default function Header() {
  const { t } = useTranslation(["landing", "common"]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#scene-hero", label: t("nav.home", { ns: "common" }) },
    { href: "#scene-platform-demo", label: t("nav.platform", { ns: "common" }) },
    { href: "#scene-testimonies", label: t("nav.bootcamps", { ns: "common" }) },
    { href: PRICING_SECTION_HREF, label: t("nav.plans", { ns: "common" }) },
  ];

  return (
    <nav
      className="safe-area-pt fixed left-0 right-0 z-50 border-b border-[#04FF8D]/10 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-[top] duration-300 dark:bg-background/80 dark:shadow-none"
      style={{ top: "var(--banner-height, 0px)" }}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex min-h-[64px] items-center justify-between gap-2 py-1">
          <a href="https://crea.academy/" className="flex items-center gap-3">
            <img
              src={creaLogoWhite}
              alt="Crea Academy"
              className="hidden h-10 w-auto transition-opacity duration-300 dark:block sm:h-14"
            />
            <img
              src={creaLogoBlack}
              alt="Crea Academy"
              className="block h-10 w-auto transition-opacity duration-300 dark:hidden sm:h-14"
            />
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[0.9rem] font-display font-black tracking-tight text-[color:var(--tour-text-default)] transition-colors hover:text-[color:var(--tour-text-strong)] dark:text-white/80 dark:hover:text-[#04FF8D]"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher compact />
            <ThemeToggle />

            <div className="ml-1 flex items-center gap-2 md:gap-4">
              <a
                href={APP_AUTH_URL}
                className="hidden text-[0.95rem] font-display font-black tracking-tight text-[color:var(--tour-text-default)] transition-colors hover:text-[color:var(--tour-text-strong)] dark:text-white dark:hover:text-[#04FF8D] md:inline-block"
              >
                {t("nav.signIn", { ns: "common" })}
              </a>
              <a
                href={PRICING_SECTION_HREF}
                className="hidden h-9 items-center justify-center rounded-full bg-brand-neon px-4 text-[0.85rem] font-display font-black tracking-tight text-black transition-transform hover:scale-105 md:inline-flex md:h-10 md:px-5 md:text-[1rem]"
              >
                {t("tour.sceneHero.createAccount", { ns: "landing" })}
              </a>
            </div>

            <button
              type="button"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-tour-menu"
              aria-label={
                isMobileMenuOpen
                  ? t("actions.close", { ns: "common" })
                  : t("nav.menu", { ns: "common" })
              }
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--tour-border-standard)] bg-white/70 text-[color:var(--tour-text-strong)] shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-colors hover:border-brand-neon/40 hover:text-brand-neon dark:border-white/10 dark:bg-white/[0.06] dark:text-white md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div
          id="mobile-tour-menu"
          className="absolute right-3 top-[calc(100%+0.5rem)] z-50 w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-[color:var(--tour-border-standard)] bg-white/95 p-2 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-[#071120]/95"
        >
          <div className="flex flex-col">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-display font-black tracking-tight text-[color:var(--tour-text-default)] transition-colors hover:bg-brand-neon/10 hover:text-[color:var(--tour-text-strong)] dark:text-white/85 dark:hover:text-brand-neon"
              >
                {item.label}
              </a>
            ))}
            <div className="my-2 h-px bg-[color:var(--tour-border-subtle)] dark:bg-white/10" />
            <a
              href={APP_AUTH_URL}
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-2xl px-4 py-3 text-sm font-display font-black tracking-tight text-[color:var(--tour-text-default)] transition-colors hover:bg-brand-neon/10 hover:text-[color:var(--tour-text-strong)] dark:text-white/85 dark:hover:text-brand-neon"
            >
              {t("nav.signIn", { ns: "common" })}
            </a>
            <a
              href={PRICING_SECTION_HREF}
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-brand-neon px-5 text-sm font-display font-black tracking-tight text-black transition-transform hover:scale-[1.02]"
            >
              {t("tour.sceneHero.createAccount", { ns: "landing" })}
            </a>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
