import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, ListChecks } from "lucide-react";
import creaLogoWhite from "@/assets/crea-logo-white-v2.png";
import creaLogoBlack from "@/assets/crea-logo-black-v2.png";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ThemeToggle from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export default function Header() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="safe-area-pt fixed left-0 right-0 z-50 border-b border-[#04FF8D]/10 bg-white/80 backdrop-blur-xl transition-[top] duration-300 dark:bg-background/80" style={{ top: "var(--banner-height, 0px)" }}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex min-h-[64px] items-center justify-between gap-2 py-1">
          <Link to="/" className="flex items-center gap-3">
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
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {/* Los links del dashboard están comentados en la app principal. Replicamos lo visible */}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher compact />
            <ThemeToggle />
            
            <div className="flex items-center gap-2 md:gap-4 ml-1">
              <a href="https://crea.academy/auth" className="hidden text-sm font-display font-extrabold text-slate-900 dark:text-white hover:text-[#04FF8D] transition-colors md:inline-block">
                Iniciar sesión
              </a>
              <a href="https://crea.academy/auth?signup=true" className="inline-flex h-9 items-center justify-center rounded-full bg-brand-neon px-4 text-xs font-display font-extrabold text-black transition-transform hover:scale-105 md:h-10 md:px-5 md:text-[0.92rem]">
                Crear cuenta
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
