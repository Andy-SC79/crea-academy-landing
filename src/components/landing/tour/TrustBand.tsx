import { ExternalLink } from "lucide-react";

import {
  FEATURED_IMPACTED_COMPANIES,
  IMPACTED_COMPANY_COUNT,
} from "@/data/impacted-companies";

export default function TrustBand() {
  return (
    <section className="relative z-20 w-full overflow-hidden border-y border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-elevated)] py-8 shadow-[0_12px_30px_rgba(15,23,42,0.03)] dark:border-white/5 dark:bg-black/20 dark:shadow-none dark:backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-4">
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

        <div className="flex w-full flex-wrap items-center justify-center gap-3 opacity-80 transition-opacity duration-500 hover:opacity-100">
          {FEATURED_IMPACTED_COMPANIES.map((company) => (
            <span
              key={company}
              className="rounded-full border border-[color:var(--tour-border-standard)] bg-[var(--tour-chip-bg)] px-4 py-2 text-xs font-black text-[color:var(--tour-text-default)] shadow-[0_8px_18px_rgba(15,23,42,0.04)] dark:bg-white/[0.04] dark:text-white/72"
            >
              {company}
            </span>
          ))}
          <a
            href="#empresas-impactadas"
            className="rounded-full border border-brand-neon/35 bg-brand-neon/10 px-4 py-2 text-xs font-black text-[color:var(--tour-text-strong)] transition-colors hover:border-brand-cyan/45 hover:bg-brand-cyan/10 dark:text-brand-neon"
          >
            Ver listado completo
          </a>
        </div>
      </div>
    </section>
  );
}
