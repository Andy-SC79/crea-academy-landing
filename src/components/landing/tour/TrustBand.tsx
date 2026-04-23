import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import comfamaLogo from "@/assets/comfama-logo.png";
import cesdeLogo from "@/assets/cesde-logo.png";
import i365LogoBlack from "@/assets/i365-logo-black.png";
import i365LogoWhite from "@/assets/i365-logo-white.png";

export default function TrustBand() {
  const { resolvedTheme } = useTheme();
  
  // We'll render a smooth infinite marquee. 
  // For the logos, we want them to look sleek, so we'll use grayscale + opacity, and restore color on hover.
  const logos = [
    { src: resolvedTheme === "dark" ? i365LogoWhite : i365LogoBlack, alt: "Ingeniería 365", className: "h-6 md:h-8 w-auto" },
    { src: cesdeLogo, alt: "CESDE", className: "h-7 md:h-10 w-auto" },
    { src: comfamaLogo, alt: "Comfama", className: "h-6 md:h-8 w-auto" },
  ];

  return (
    <section className="relative z-20 w-full overflow-hidden border-y border-slate-200/50 bg-white/40 py-8 backdrop-blur-md dark:border-white/5 dark:bg-black/20">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-4">
        <p className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-white/40">
          Respaldado por pioneros de la industria
        </p>
        
        <div className="flex w-full flex-wrap items-center justify-center gap-8 md:gap-16 lg:gap-24 opacity-60 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
          {logos.map((logo, i) => (
            <img 
              key={i} 
              src={logo.src} 
              alt={logo.alt} 
              className={logo.className} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
