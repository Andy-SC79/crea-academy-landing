import { Link } from "react-router-dom";
import creaLogoWhite from "@/assets/crea-logo-white-v2.png";
import creaLogoBlack from "@/assets/crea-logo-black-v2.png";

export default function Header() {
  return (
    <nav className="safe-area-pt fixed left-0 right-0 z-50 border-b border-[#04FF8D]/10 bg-white/80 backdrop-blur-xl transition-[top] duration-300 dark:bg-background/80">
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

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 md:gap-4">
              <a href="https://app.crea-academy.com/auth" className="hidden text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground md:inline-block">Iniciar sesión</a>
              <a href="https://app.crea-academy.com/auth?signup=true" className="inline-flex h-9 items-center justify-center rounded-full bg-brand-neon px-4 text-xs font-bold text-black transition-transform hover:scale-105 md:h-10 md:px-5 md:text-sm">Comenzar gratis</a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
