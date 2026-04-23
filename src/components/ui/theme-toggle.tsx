import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { markExplicitThemeSelection } from "@/lib/theme-preference";

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const setUserTheme = useAppStore((state) => state.setUserTheme);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const [mounted, setMounted] = useState(false);

  // Evita hydration mismatch: no renderiza nada en servidor
  useEffect(() => setMounted(true), []);

  if (!mounted) return <span style={{ width: 40, height: 40, display: "inline-block" }} />;

  const isDark = resolvedTheme === "dark";

  const toggle = () => {
    const nextTheme = isDark ? "light" : "dark";
    markExplicitThemeSelection(currentUserId);
    setTheme(nextTheme);
    setUserTheme({ theme: nextTheme });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="h-10 w-auto px-2 flex items-center gap-2 hover:bg-muted/50 transition-colors"
    >
      {/* Icon con transición suave */}
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun 
            className="h-5 w-5 text-yellow-400 animate-in fade-in-0 spin-in-12 duration-300"
            key="sun"
          />
        ) : (
          <Moon 
            className="h-5 w-5 text-muted-foreground animate-in fade-in-0 spin-in-12 duration-300"
            key="moon"
          />
        )}
      </div>

      {/* Label visible en pantallas md+ */}
      <span className="hidden md:inline text-sm font-medium text-foreground">
        {isDark ? "Claro" : "Oscuro"}
      </span>
    </Button>
  );
};

export default ThemeToggle;
