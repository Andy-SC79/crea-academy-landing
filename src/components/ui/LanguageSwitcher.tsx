import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language || "es";

  const languages = [
    { code: "es", label: "ES" },
    { code: "en", label: "EN" },
    { code: "pt", label: "PT" },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size={compact ? "icon" : "default"}
        onClick={() => setIsOpen(!isOpen)}
        className="tour-control-button h-9 rounded-full px-2 text-slate-700 dark:text-slate-300"
      >
        <Globe className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline-block font-bold">
          {currentLang.toUpperCase().substring(0, 2)}
        </span>
      </Button>
      
      {isOpen && (
        <div className="tour-floating-menu absolute right-0 top-full mt-2 w-20 rounded-2xl p-1.5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={cn(
                "block w-full rounded-xl px-3 py-2 text-center text-sm font-bold transition-colors",
                currentLang.startsWith(lang.code)
                  ? "tour-accent-chip"
                  : "tour-text-default hover:bg-[var(--tour-chip-bg)] hover:text-[color:var(--tour-text-strong)] dark:hover:bg-white/10 dark:text-slate-200"
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
