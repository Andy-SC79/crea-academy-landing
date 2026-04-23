import { Construction } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRoles } from "@/hooks/useRoles";

interface UnderConstructionProps {
  className?: string;
}

export const UnderConstruction = ({ className }: UnderConstructionProps) => {
  const { isAdmin } = useRoles();
  const [adminMode, setAdminMode] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("admin_mode") !== "false";
  });

  useEffect(() => {
    const handleAdminModeChange = (e: CustomEvent) => {
      setAdminMode(e.detail);
    };

    window.addEventListener('admin-mode-change', handleAdminModeChange as EventListener);
    
    const checkStorage = () => {
       setAdminMode(localStorage.getItem("admin_mode") !== "false");
    };
    window.addEventListener('storage', checkStorage);

    return () => {
      window.removeEventListener('admin-mode-change', handleAdminModeChange as EventListener);
      window.removeEventListener('storage', checkStorage);
    };
  }, []);

  // Only bypass if user is effectively an admin (centralized role + UI toggle)
  if (isAdmin && adminMode) {
    return null; 
  }

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md p-4 text-center select-none h-screen w-screen",
      className
    )}>
      <div className="rounded-full bg-primary/10 p-6 mb-6 animate-pulse ring-1 ring-primary/20">
        <Construction className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-3">
        En Construcción
      </h2>
      <p className="text-muted-foreground max-w-md text-lg">
        Estamos preparando algo increíble. Esta sección estará disponible muy pronto.
      </p>
      <div className="flex flex-col gap-2 mt-8">
        <Button 
            onClick={() => window.location.href = 'https://crea.academy/'}
            size="lg"
        >
            Volver al Inicio
        </Button>
      </div>
    </div>
  );
};
