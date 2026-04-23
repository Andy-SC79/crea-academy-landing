/**
 * ═══════════════════════════════════════════════════════════
 * LanguageSwitcher — Dropdown to change the app language
 * Reads/writes language from Zustand store
 * ═══════════════════════════════════════════════════════════
 */

import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { useAppStore } from '@/stores/useAppStore';
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_LABELS,
  LANGUAGE_FLAGS,
  type SupportedLanguage,
} from '@/i18n';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  /** Compact mode shows only flag + code (for navbar) */
  compact?: boolean;
  className?: string;
}

export function LanguageSwitcher({ compact = false, className }: LanguageSwitcherProps) {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const selectedLanguageCode = language.toUpperCase();
  const selectedLanguageLabel = LANGUAGE_LABELS[language];

  return (
    <Select value={language} onValueChange={(v) => setLanguage(v as SupportedLanguage)}>
      <SelectTrigger
        className={cn(
          compact
            ? 'h-8 w-auto gap-1.5 px-2 text-xs'
            : 'h-12 w-full rounded-2xl border-border/70 bg-background/90 px-4 text-base',
          className,
        )}
      >
        {compact ? (
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            <span>{LANGUAGE_FLAGS[language]} {language.toUpperCase()}</span>
          </span>
        ) : (
          <span className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {selectedLanguageCode}
            </span>
            <span className="font-display text-base font-semibold text-foreground">
              {selectedLanguageLabel}
            </span>
          </span>
        )}
      </SelectTrigger>
      <SelectContent
        sideOffset={8}
        className="!z-[220] rounded-2xl border-border/70 bg-card/95 shadow-soft [&_[data-radix-select-viewport]]:h-auto"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <SelectItem
            key={lang}
            value={lang}
            className="rounded-xl py-2.5 pl-10 pr-3 text-foreground transition-colors data-[highlighted]:bg-primary/10 data-[highlighted]:text-foreground data-[state=checked]:bg-primary/[0.14] data-[state=checked]:text-foreground focus:bg-primary/10 focus:text-foreground"
          >
            <span className="flex items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] opacity-70">
                {lang.toUpperCase()}
              </span>
              <span className="font-medium">{LANGUAGE_LABELS[lang]}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
