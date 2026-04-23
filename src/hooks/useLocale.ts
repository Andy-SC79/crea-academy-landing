/**
 * ═══════════════════════════════════════════════════════════
 * useLocale — Maps app language to date-fns locale + BCP47
 * ═══════════════════════════════════════════════════════════
 */

import { useMemo } from 'react';
import { es } from 'date-fns/locale/es';
import { enUS } from 'date-fns/locale/en-US';
import { ptBR } from 'date-fns/locale/pt-BR';
import { format as dateFnsFormat } from 'date-fns';
import { useAppStore } from '@/stores/useAppStore';
import type { SupportedLanguage } from '@/i18n';

const DATE_FNS_LOCALES = {
  es,
  en: enUS,
  pt: ptBR,
} as const;

const BCP47_TAGS: Record<SupportedLanguage, string> = {
  es: 'es-CO',
  en: 'en-US',
  pt: 'pt-BR',
};

export function useLocale() {
  const language = useAppStore((s) => s.language);

  return useMemo(() => ({
    /** Current language code */
    language,
    /** date-fns Locale object for the current language */
    dateFnsLocale: DATE_FNS_LOCALES[language],
    /** BCP47 tag for toLocaleDateString / Intl */
    bcp47: BCP47_TAGS[language],
    /** Format a date using the current locale automatically */
    formatLocalDate: (date: Date | number | string, formatStr: string) =>
      dateFnsFormat(
        typeof date === 'string' ? new Date(date) : date,
        formatStr,
        { locale: DATE_FNS_LOCALES[language] }
      ),
  }), [language]);
}
