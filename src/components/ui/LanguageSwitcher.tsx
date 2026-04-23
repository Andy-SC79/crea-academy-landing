import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

const languages = [
  { code: "es", name: "ES" },
  { code: "en", name: "EN" },
  { code: "pt", name: "PT" },
];

interface LanguageSwitcherProps {
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="flex gap-1">
      {languages.map((language) => (
        <Button
          key={language.code}
          variant={i18n.language === language.code ? "default" : "ghost"}
          size="sm"
          onClick={() => i18n.changeLanguage(language.code)}
          className="h-8 px-2 text-xs"
        >
          {language.name}
        </Button>
      ))}
    </div>
  );
}