import { Mail, MapPin, Phone } from "lucide-react";
import creaLogoColor from "@/assets/crea-logo-color.png";
import creaLogoWhite from "@/assets/crea-logo-white-v2.png";
import creaLogoBlack from "@/assets/crea-logo-black-v2.png";
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
    <footer className="relative z-20 w-full bg-white dark:bg-[#02050d] border-t border-slate-200 dark:border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-4">
              <div className="flex items-center">
                <img 
                  src={creaLogoBlack} 
                  alt="Crea Academy" 
                  className="h-12 w-auto object-contain block dark:hidden transition-opacity duration-300" 
                />
                <img 
                  src={creaLogoWhite} 
                  alt="Crea Academy" 
                  className="h-12 w-auto object-contain hidden dark:block transition-opacity duration-300" 
                />
              </div>
            </div>
            <p className="text-black/60 dark:text-white/60 mb-4">
              {t('footer.tagline')}
            </p>
            <a 
              href="https://ingenieria365.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <img src={i365Logo} alt="Ingeniería 365" className="h-10" />
            </a>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-black dark:text-white">{t('footer.courses')}</h3>
            <ul className="space-y-2 text-black/60 dark:text-white/60">
              <li><Link to="/cursos" className="hover:text-[#04FF8D] transition-colors">{t('footer.ai')}</Link></li>
              <li><Link to="/cursos" className="hover:text-[#04FF8D] transition-colors">{t('footer.dataScience')}</Link></li>
              <li><Link to="/bootcamps" className="hover:text-[#04FF8D] transition-colors">{t('nav.bootcamps')}</Link></li>
              <li><Link to="/cursos" className="hover:text-[#04FF8D] transition-colors">{t('footer.certification')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-black dark:text-white">{t('footer.contact')}</h3>
            <ul className="space-y-3 text-black/60 dark:text-white/60 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:info@ingenieria365.com" className="hover:text-[#04FF8D] transition-colors">
                  info@ingenieria365.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <a href="tel:+573106014893" className="hover:text-[#04FF8D] transition-colors">
                    {t('footer.salesPhone')}
                  </a>
                  <a href="tel:+573002893607" className="hover:text-[#04FF8D] transition-colors">
                    {t('footer.supportPhone')}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Carrera 42 Nº 3 Sur 81<br />Torre 1 Piso 15<br />Medellín, Antioquia</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-black dark:text-white">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-black/60 dark:text-white/60">
              <li>
                <a 
                  href="https://ingenieria365.com/terminos-condiciones" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#04FF8D] transition-colors"
                >
                  {t('footer.terms')}
                </a>
              </li>
              <li>
                <a 
                  href="https://ingenieria365.com/politica-datos" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#04FF8D] transition-colors"
                >
                  {t('footer.dataPolicy')}
                </a>
              </li>
              <li>
                <a 
                  href="https://ingenieria365.com/aviso-privacidad" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#04FF8D] transition-colors"
                >
                  {t('footer.privacyNotice')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#04FF8D]/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-black/50 dark:text-white/50">
            <p>&copy; {t('footer.copyright')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
