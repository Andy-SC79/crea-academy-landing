import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import comfamaLogo from "@/assets/comfama-logo.png";
import cesdeLogo from "@/assets/cesde-logo.png";
import i365LogoBlack from "@/assets/i365-logo-black.png";
import i365LogoWhite from "@/assets/i365-logo-white.png";

export default function TrustBand() {
  const { t } = useTranslation("landing");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative z-20 w-full overflow-hidden border-y border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-elevated)] py-8 shadow-[0_12px_30px_rgba(15,23,42,0.03)] dark:border-white/5 dark:bg-black/20 dark:shadow-none dark:backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-4">
        <p className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-[color:var(--tour-text-muted)] dark:text-white/40 text-center">
          {t("tour.trustBand.label")}
        </p>
        
        <div className={`flex w-full flex-wrap items-center justify-center gap-8 md:gap-16 lg:gap-24 opacity-65 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0 ${!mounted ? 'invisible' : ''}`}>
          <div className="flex items-center">
            <img src={i365LogoBlack} alt="Ingeniería 365" className="h-6 md:h-8 w-auto block dark:hidden" />
            <img src={i365LogoWhite} alt="Ingeniería 365" className="h-6 md:h-8 w-auto hidden dark:block" />
          </div>
          <img src={cesdeLogo} alt="CESDE" className="h-7 md:h-10 w-auto dark:mix-blend-screen dark:invert" />
          <img src={comfamaLogo} alt="Comfama" className="h-6 md:h-8 w-auto dark:mix-blend-screen dark:invert" />
        </div>
      </div>
    </section>
  );
}
