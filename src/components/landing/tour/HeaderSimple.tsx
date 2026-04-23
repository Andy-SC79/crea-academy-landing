import { Button } from "@/components/ui/button";
import creaLogoWhite from "@/assets/crea-logo-white-v2.png";
import creaLogoBlack from "@/assets/crea-logo-black-v2.png";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ThemeToggle from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

type NavbarProps = {
  publicHomePath?: string;
  guestCtaPath?: string;
  guestCtaTargetId?: string;
};

const Header = ({
  publicHomePath = "/",
  guestCtaPath = "/",
  guestCtaTargetId = "waitlist",
}: NavbarProps) => {
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
          <Link to={publicHomePath} className="flex items-center gap-3">
            <img
              src={mounted && resolvedTheme === 'light' ? creaLogoBlack : creaLogoWhite}
              alt="Crea Academy"
              className="h-10 w-auto transition-opacity duration-300 sm:h-14"
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher compact />
            <ThemeToggle />
            <Button
              asChild
              size="sm"
              variant="outline"
              className="hidden sm:inline-flex"
            >
              <a href="mailto:contact@crea-academy.com">{t("common.contact", { defaultValue: "Contacto" })}</a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;