import { Building2, ExternalLink } from "lucide-react";

import AnimatedText from "@/components/landing/tour/AnimatedText";
import { SceneEyebrow } from "@/components/landing/tour/scenes/shared";
import {
  IMPACTED_COMPANY_COUNT,
  IMPACTED_COMPANY_GROUPS,
} from "@/data/impacted-companies";
import { cn } from "@/lib/utils";

type ImpactedCompaniesSectionProps = {
  className?: string;
  compact?: boolean;
};

export default function ImpactedCompaniesSection({
  className,
  compact = false,
}: ImpactedCompaniesSectionProps) {
  return (
    <section
      id="empresas-impactadas"
      className={cn(
        "relative z-20 w-full overflow-hidden border-y border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-elevated)] px-4 py-16 dark:border-white/10 dark:bg-[#030812]/92 sm:px-6 lg:px-8",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <SceneEyebrow icon={<Building2 className="h-4 w-4 sm:h-5 sm:w-5" />}>
              <AnimatedText text="Impacto empresarial" />
            </SceneEyebrow>
            <h2 className="mt-5 max-w-2xl font-display text-[clamp(2rem,5vw,4.2rem)] font-black leading-[1.02] tracking-tight text-[color:var(--tour-text-strong)]">
              Empresas que ha impactado{" "}
              <a
                href="https://www.ingenieria365.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-neon underline decoration-brand-neon/40 underline-offset-8 transition-colors hover:text-brand-cyan"
              >
                i365
              </a>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--tour-text-default)] dark:text-white/70">
              Organizaciones de múltiples industrias han participado en los bootcamps y procesos de adopción de IA liderados por Ingeniería 365.
            </p>

            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-soft)] p-4">
                <p className="font-display text-3xl font-black text-[color:var(--tour-text-strong)]">
                  +{IMPACTED_COMPANY_COUNT}
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">
                  organizaciones
                </p>
              </div>
              <div className="rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-soft)] p-4">
                <p className="font-display text-3xl font-black text-brand-cyan">8</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">
                  bloques
                </p>
              </div>
              <a
                href="https://www.ingenieria365.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border border-brand-neon/25 bg-brand-neon/10 p-4 text-sm font-black text-[color:var(--tour-text-strong)] transition-colors hover:border-brand-cyan/45 hover:bg-brand-cyan/10 sm:col-span-1"
              >
                <span className="flex items-center gap-2">
                  Ver i365
                  <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
            </div>
          </div>

          <div className={cn("grid gap-4", compact ? "md:grid-cols-2" : "xl:grid-cols-2")}>
            {IMPACTED_COMPANY_GROUPS.map((group) => (
              <article
                key={group.range}
                className="rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-panel-gradient)] p-5 shadow-[var(--tour-shadow-soft)]"
              >
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-[color:var(--tour-border-subtle)] pb-3">
                  <h3 className="font-display text-lg font-black text-[color:var(--tour-text-strong)]">
                    {group.range}
                  </h3>
                  <span className="rounded-full border border-[color:var(--tour-border-standard)] px-2.5 py-1 text-[11px] font-black text-[color:var(--tour-text-muted)]">
                    {group.companies.length}
                  </span>
                </div>
                <ul className="columns-1 gap-6 space-y-2 sm:columns-2">
                  {group.companies.map((company) => (
                    <li
                      key={company}
                      className="break-inside-avoid text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/72"
                    >
                      {company}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
