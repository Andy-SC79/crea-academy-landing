import { Mail, MapPin, Phone } from "lucide-react";
import creaLogoWhite from "@/assets/crea-logo-white-v2.png";
import creaLogoBlack from "@/assets/crea-logo-black-v2.png";
import i365Logo from "@/assets/i365-logo-color.png";
import { useTranslation } from "react-i18next";
import { APP_BOOTCAMPS_URL, APP_COURSES_URL } from "@/lib/external-links";

const Footer = () => {
  const { t } = useTranslation("common");

  return (
    <footer className="relative z-20 w-full border-t border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-elevated)] shadow-[0_-18px_40px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-[#02050d] dark:shadow-none">
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
            <p className="mb-4 text-[color:var(--tour-text-default)] dark:text-white/60">
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
            <h3 className="mb-4 font-bold text-[color:var(--tour-text-strong)] dark:text-white">{t('footer.courses')}</h3>
            <ul className="space-y-2 text-[color:var(--tour-text-default)] dark:text-white/60">
              <li><a href={APP_COURSES_URL} className="transition-colors hover:text-[color:var(--tour-text-strong)] dark:hover:text-[#04FF8D]">{t('footer.ai')}</a></li>
              <li><a href={APP_COURSES_URL} className="transition-colors hover:text-[color:var(--tour-text-strong)] dark:hover:text-[#04FF8D]">{t('footer.dataScience')}</a></li>
              <li><a href={APP_BOOTCAMPS_URL} className="transition-colors hover:text-[color:var(--tour-text-strong)] dark:hover:text-[#04FF8D]">{t('nav.bootcamps')}</a></li>
              <li><a href={APP_COURSES_URL} className="transition-colors hover:text-[color:var(--tour-text-strong)] dark:hover:text-[#04FF8D]">{t('footer.certification')}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-[color:var(--tour-text-strong)] dark:text-white">{t('footer.contact')}</h3>
            <ul className="space-y-3 text-[color:var(--tour-text-default)] dark:text-white/60 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:info@ingenieria365.com" className="transition-colors hover:text-[color:var(--tour-text-strong)] dark:hover:text-[#04FF8D]">
                  info@ingenieria365.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <a href="tel:+573106014893" className="transition-colors hover:text-[color:var(--tour-text-strong)] dark:hover:text-[#04FF8D]">
                    {t('footer.salesPhone')}
                  </a>
                  <a href="tel:+573002893607" className="transition-colors hover:text-[color:var(--tour-text-strong)] dark:hover:text-[#04FF8D]">
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
            <h3 className="mb-4 font-bold text-[color:var(--tour-text-strong)] dark:text-white">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-[color:var(--tour-text-default)] dark:text-white/60">
              <li>
                <a 
                  href="https://ingenieria365.com/terminos-condiciones" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[color:var(--tour-text-strong)] dark:hover:text-[#04FF8D]"
                >
                  {t('footer.terms')}
                </a>
              </li>
              <li>
                <a 
                  href="https://ingenieria365.com/politica-datos" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[color:var(--tour-text-strong)] dark:hover:text-[#04FF8D]"
                >
                  {t('footer.dataPolicy')}
                </a>
              </li>
              <li>
                <a 
                  href="https://ingenieria365.com/aviso-privacidad" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[color:var(--tour-text-strong)] dark:hover:text-[#04FF8D]"
                >
                  {t('footer.privacyNotice')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[color:var(--tour-border-subtle)] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[color:var(--tour-text-muted)] dark:text-white/50">
            <p>&copy; {t('footer.copyright')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
