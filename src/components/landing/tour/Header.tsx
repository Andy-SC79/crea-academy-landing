import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Link to="/">
          <span className="text-xl font-bold text-white">CREA Academy</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild className="hidden sm:inline-flex">
          <a href="https://app.crea-academy.com/auth">Iniciar Sesión</a>
        </Button>
        <Button asChild className="bg-brand-neon text-black hover:bg-brand-neon/80">
          <a href="https://app.crea-academy.com/auth?signup=true">Comenzar gratis</a>
        </Button>
      </div>
    </header>
  );
}
