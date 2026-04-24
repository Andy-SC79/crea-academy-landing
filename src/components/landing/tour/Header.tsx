import creaLogoWhite from "@/assets/crea-logo-white-v2.png";
import creaLogoBlack from "@/assets/crea-logo-black-v2.png";
import { useTranslation } from "react-i18next";
import ThemeToggle from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { APP_AUTH_URL } from "@/lib/external-links";

export default function Header() {
  const { t } = useTranslation(["landing", "common"]);

  return (
    <nav className="safe-area-pt fixed left-0 right-0 z-50 border-b border-[#04FF8D]/10 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-[top] duration-300 dark:bg-background/80 dark:shadow-none" style={{ top: "var(--banner-height, 0px)" }}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex min-h-[64px] items-center justify-between gap-2 py-1">
          <a href="https://crea.academy/" className="flex items-center gap-3">
            <img
              src={creaLogoWhite}
              alt="Crea Academy"
              className="h-10 w-auto transition-opacity duration-300 sm:h-14 hidden dark:block"
            />
            <img
              src={creaLogoBlack}
              alt="Crea Academy"
              className="h-10 w-auto transition-opacity duration-300 sm:h-14 block dark:hidden"
            />
          </a>

          <div className="hidden md:flex items-center gap-8">
            {/* Los links del dashboard están comentados en la app principal. Replicamos lo visible */}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher compact />
            <ThemeToggle />
            
            <div className="flex items-center gap-2 md:gap-4 ml-1">
              <a href={APP_AUTH_URL} className="hidden text-[0.95rem] font-display font-black tracking-tight text-[color:var(--tour-text-default)] dark:text-white hover:text-[color:var(--tour-text-strong)] dark:hover:text-[#04FF8D] transition-colors md:inline-block">
                {t("nav.signIn", { ns: "common" })}
              </a>
              <a href={APP_AUTH_URL} className="inline-flex h-9 items-center justify-center rounded-full bg-brand-neon px-4 text-[0.85rem] font-display font-black tracking-tight text-black transition-transform hover:scale-105 md:h-10 md:px-5 md:text-[1rem]">
                {t("tour.sceneHero.createAccount", { ns: "landing" })}
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
