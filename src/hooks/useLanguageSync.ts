/**
 * ═══════════════════════════════════════════════════════════
 * useLanguageSync — Keeps i18next, HTML lang, and Zustand in sync
 * Call once in App.tsx
 * ═══════════════════════════════════════════════════════════
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';

export function useLanguageSync() {
  const { i18n } = useTranslation();
  const language = useAppStore((s) => s.language);

  useEffect(() => {
    // Sync i18next language with Zustand store
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }

    // Update HTML lang attribute
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : language;

    // Persist to localStorage for i18next-browser-languagedetector
    localStorage.setItem('crea-language', language);
  }, [language, i18n]);

  // Also listen to store changes (for external callers)
  useEffect(() => {
    const unsub = useAppStore.subscribe(
      (state) => state.language,
      (lang) => {
        if (i18n.language !== lang) {
          i18n.changeLanguage(lang);
        }
        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
        localStorage.setItem('crea-language', lang);
      }
    );
    return unsub;
  }, [i18n]);
}
