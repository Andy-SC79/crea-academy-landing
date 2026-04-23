import { Mail, MapPin, Phone } from "lucide-react";
import creaLogoColor from "@/assets/crea-logo-color.png";
import creaLogoWhite from "@/assets/crea-logo-white-v2.png";
import i365Logo from "@/assets/i365-logo-color.png";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-white dark:bg-card border-t border-[#04FF8D]/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <img
              src={mounted && resolvedTheme === 'light' ? creaLogoColor : creaLogoWhite}
              alt="Crea Academy"
              className="h-8 w-auto mb-4"
            />
            <p className="text-sm text-muted-foreground mb-4">
              {t("footer.description", { defaultValue: "Transformando la educación con IA y tecnología avanzada." })}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("footer.contact.title", { defaultValue: "Contacto" })}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:contact@crea-academy.com" className="text-sm hover:text-primary">
                  contact@crea-academy.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{t("footer.contact.phone", { defaultValue: "+57 300 123 4567" })}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("footer.links.title", { defaultValue: "Enlaces" })}</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-sm hover:text-primary">
                {t("footer.links.home", { defaultValue: "Inicio" })}
              </Link>
              <a href="#tour-pricing" className="block text-sm hover:text-primary">
                {t("footer.links.pricing", { defaultValue: "Precios" })}
              </a>
              <a href="mailto:contact@crea-academy.com" className="block text-sm hover:text-primary">
                {t("footer.links.contact", { defaultValue: "Contacto" })}
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("footer.legal.title", { defaultValue: "Legal" })}</h3>
            <div className="space-y-2">
              <span className="block text-sm text-muted-foreground">
                {t("footer.legal.copyright", { defaultValue: "© 2024 Crea Academy. Todos los derechos reservados." })}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {t("footer.poweredBy", { defaultValue: "Desarrollado por" })}
              <a href="https://ingenieria365.com" className="hover:text-primary ml-1">
                Ingeniería 365
              </a>
            </p>
            <img src={i365Logo} alt="Ingeniería 365" className="h-6 w-auto" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;