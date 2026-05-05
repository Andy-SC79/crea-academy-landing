import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

import {
  IMPACTED_COMPANIES,
  IMPACTED_COMPANY_COUNT,
  FEATURED_IMPACTED_COMPANIES,
} from "@/data/impacted-companies";

// Split companies into two groups for the two rows
// We mix featured ones with some others to make it more interesting
const companiesRow1 = [
  ...FEATURED_IMPACTED_COMPANIES.slice(0, 6),
  "Nutresa",
  "Corona",
  "Alpina",
  "Ecopetrol",
  "Argos",
  "Bancolombia",
  "Crystal",
  "Noel",
];

const companiesRow2 = [
  ...FEATURED_IMPACTED_COMPANIES.slice(6),
  "Zenú",
  "Leonisa",
  "Sofasa",
  "Haceb",
  "Sura",
  "Protección",
  "Cueros Vélez",
  "Postobón",
];

interface MarqueeProps {
  companies: string[];
  direction?: "left" | "right";
  speed?: number;
}

function Marquee({ companies, direction = "left", speed = 30 }: MarqueeProps) {
  // Double the array to create the infinite loop effect
  const displayCompanies = [...companies, ...companies];

  return (
    <div className="group flex w-full overflow-hidden py-1">
      <motion.div
        className="flex shrink-0 items-center gap-3 pr-3"
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {displayCompanies.map((company, idx) => (
          <span
            key={`${company}-${idx}`}
            className="rounded-full border border-[color:var(--tour-border-standard)] bg-[var(--tour-chip-bg)] px-5 py-2.5 text-xs font-black text-[color:var(--tour-text-default)] shadow-[0_4px_12px_rgba(15,23,42,0.03)] transition-all hover:scale-105 hover:border-brand-cyan/30 hover:bg-white dark:border-white/5 dark:bg-white/[0.03] dark:text-white/70 dark:hover:bg-white/10"
          >
            {company}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function TrustBand() {
  return (
    <section className="relative z-20 w-full overflow-hidden border-y border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-elevated)] py-10 shadow-[0_12px_30px_rgba(15,23,42,0.03)] dark:border-white/5 dark:bg-[#020617]/40 dark:shadow-none dark:backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-8 px-4">
        <p className="text-center font-display text-xs font-extrabold uppercase tracking-[0.2em] text-[color:var(--tour-text-muted)] dark:text-white/40">
          Empresas que ha impactado{" "}
          <a
            href="https://www.ingenieria365.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[color:var(--tour-text-strong)] underline decoration-brand-neon/40 underline-offset-4 transition-colors hover:text-brand-neon dark:text-white"
          >
            i365
            <ExternalLink className="h-3 w-3" />
          </a>
          <span className="mx-2 text-[color:var(--tour-text-muted)]">/</span>
          +{IMPACTED_COMPANY_COUNT} organizaciones
        </p>

        {/* Marquee Container with Fade Masks */}
        <div className="relative w-full">
          {/* Gradient Masks - Using semantic variables for perfect matching */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-[var(--tour-surface-elevated)] to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-[var(--tour-surface-elevated)] to-transparent" />
          
          <div className="flex flex-col gap-1 overflow-hidden opacity-90 transition-opacity duration-500 hover:opacity-100">
            <Marquee companies={companiesRow1} direction="left" speed={35} />
            <Marquee companies={companiesRow2} direction="right" speed={40} />
          </div>
        </div>

        <div className="mt-2">
          <a
            href="#empresas-impactadas"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-brand-neon/35 bg-brand-neon/5 px-6 py-2.5 text-xs font-black text-[color:var(--tour-text-strong)] transition-all hover:border-brand-cyan/50 hover:bg-brand-cyan/10 dark:text-brand-neon"
          >
            <span className="relative z-10">Ver listado completo</span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </a>
        </div>
      </div>
    </section>
  );
}

