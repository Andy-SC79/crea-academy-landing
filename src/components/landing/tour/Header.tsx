import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, LayoutDashboard, Calendar, Award, Image as ImageIcon, Settings, Tags, Rocket, ShieldCheck, ListChecks, Building2, Newspaper } from "lucide-react";
import creaLogoWhite from "@/assets/crea-logo-white-v2.png";
import creaLogoBlack from "@/assets/crea-logo-black-v2.png";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useRoles } from "@/hooks/useRoles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeToggle from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type NavbarProps = {
  publicHomePath?: string;
  guestCtaPath?: string;
  guestCtaTargetId?: string;
};

const Header = ({
  publicHomePath = "/",
  guestCtaPath = "/",
  guestCtaTargetId = "waitlist",
}: NavbarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { isSuperAdmin, canAccessPlatform, isWaitingListOnly } = useRoles();
  const { t } = useTranslation();
  const [adminMode, setAdminMode] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("admin_mode") !== "false";
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success(t('toast.sessionClosed'));
    } catch (error) {
      toast.error(t('toast.sessionCloseError'));
      console.error("Sign out error:", error);
    }
  };

  const handleGuestPrimaryAction = () => {
    const targetHash = guestCtaTargetId ? `#${guestCtaTargetId}` : "";
    if (location.pathname !== guestCtaPath) {
      navigate(`${guestCtaPath}${targetHash}`);
      return;
    }

    if (guestCtaTargetId) {
      const element = document.getElementById(guestCtaTargetId);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const superAdminMenuItems = (isSuperAdmin
    ? [
      { label: t('adminMenu.adminCursos'), path: "/super-admin/rutas", icon: LayoutDashboard },
      { label: t('adminMenu.adminBootcamps'), path: "/super-admin/bootcamps", icon: LayoutDashboard },
      { label: t('adminMenu.adminEventos'), path: "/super-admin/eventos", icon: Calendar },
      { label: t('adminMenu.adminNoticias', { defaultValue: 'Admin Noticias' }), path: "/super-admin/noticias", icon: Newspaper },
      { label: t('adminMenu.adminBanners'), path: "/super-admin/banners", icon: ImageIcon },
      { label: t('adminMenu.adminInsignias'), path: "/super-admin/insignias", icon: Award },
      { label: t('adminMenu.forms', { defaultValue: 'Formularios' }), path: "/super-admin/forms", icon: Tags },
      { label: t('adminMenu.generalConfig'), path: "/super-admin/configuracion", icon: Settings },
      { label: t('adminMenu.media'), path: "/super-admin/media", icon: ImageIcon },
      { label: t('adminMenu.maratonCertificates'), path: "/super-admin/maraton-certificados", icon: Award },
      { label: t('adminMenu.adminOnboarding'), path: "/super-admin/onboarding", icon: ListChecks },
      { label: t('adminMenu.organizationManagement', { defaultValue: 'Organizaciones' }), path: "/super-admin/organizaciones", icon: Building2 },
      { label: t('adminMenu.roleManagement'), path: "/super-admin/roles", icon: ShieldCheck },
    ]
    : []).sort((a, b) => a.label.localeCompare(b.label));

  const showPlatformNavigation = Boolean(user) && canAccessPlatform;
  const showPendingAccessNavigation = Boolean(user) && isWaitingListOnly;

  return (
    <nav className="safe-area-pt fixed left-0 right-0 z-50 border-b border-[#04FF8D]/10 bg-white/80 backdrop-blur-xl transition-[top] duration-300 dark:bg-background/80" style={{ top: "var(--banner-height, 0px)" }}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex min-h-[64px] items-center justify-between gap-2 py-1">
          <Link to={publicHomePath} className="flex items-center gap-3">
            <img
              src={mounted && resolvedTheme === 'light' ? creaLogoBlack : creaLogoWhite}
              alt="Crea Academy"
              className="h-10 w-auto transition-opacity duration-300 sm:h-14"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {showPlatformNavigation ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-bold text-black dark:text-white hover:text-[#04FF8D] transition-colors flex items-center gap-1.5"
                >
                  <Rocket className="w-4 h-4" />
                  {t('nav.platform')}
                </Link>
                <Link
                  to="/onboarding"
                  className="text-sm font-bold text-black dark:text-white hover:text-[#04FF8D] transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  {t('nav.onboarding')}
                </Link>
              </>
            ) : null}
            {showPendingAccessNavigation ? (
              <Link
                to="/access-pending"
                className="text-sm font-bold text-black dark:text-white hover:text-[#04FF8D] transition-colors flex items-center gap-1.5"
              >
                <ListChecks className="w-4 h-4" />
                {t('nav.waitlistStatus', { defaultValue: 'Estado de acceso' })}
              </Link>
            ) : null}
            {user && (
              <>
                Comentado temporalmente — se habilita después del lanzamiento
                <Link 
                  to="/cursos"
                  className="text-sm font-bold text-black dark:text-white hover:text-[#04FF8D] transition-colors"
                >
                  Cursos
                </Link>
                <Link 
                  to="/maraton"
                  className="text-sm font-bold text-black dark:text-white hover:text-[#04FF8D] transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  Maratón
                </Link>
                <Link 
                  to="/bootcamps"
                  className="text-sm font-bold text-black dark:text-white hover:text-[#04FF8D] transition-colors"
                >
                  Bootcamps
                </Link>
                <Link 
                  to="/dashboard"
                  className="text-sm font-bold text-black dark:text-white hover:text-[#04FF8D] transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/badges"
                  className="text-sm font-bold text-black dark:text-white hover:text-[#04FF8D] transition-colors"
                >
                  Insignias
                </Link>
               
                {isSuperAdmin && (
                  <>
                    {adminMode && (
                      <>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1 px-2"
                            >
                              <Settings className="w-4 h-4" />
                              Admin
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {superAdminMenuItems.map((item) => (
                              <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                                <item.icon className="mr-2 h-4 w-4" />
                                <span>{item.label}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </>
                )}
              </>
            )}
            {/* Comentado temporalmente — se habilita después del lanzamiento
            {!user && (
              <>
                <Link to="/cursos" className="text-sm font-bold text-black dark:text-white hover:text-[#04FF8D] transition-colors">
                  Cursos
                </Link>
                <Link 
                  to="/maraton"
                  className="text-sm font-bold text-black dark:text-white hover:text-[#04FF8D] transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  Maratón
                </Link>
                <Link 
                  to="/bootcamps"
                  className="text-sm font-bold text-black dark:text-white hover:text-[#04FF8D] transition-colors"
                >
                  Bootcamps
                </Link>
              </>
            )}
            */}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher compact />
            <ThemeToggle />
            {isSuperAdmin && (
              <div className="hidden md:flex items-center gap-2">
                <Switch
                  checked={adminMode}
                  onCheckedChange={(checked) => {
                    setAdminMode(checked);
                    localStorage.setItem("admin_mode", String(checked));
                    // Dispatch event for other components to react
                    window.dispatchEvent(new CustomEvent('admin-mode-change', { detail: checked }));
                  }}
                  id="admin-mode-toggle"
                />
                <Label htmlFor="admin-mode-toggle" className="text-xs text-muted-foreground cursor-pointer min-w-[90px]">
                  {adminMode ? t('userMenu.modeAdmin') : t('userMenu.modeStudent')}
                </Label>
              </div>
            )}
            {user ? (
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border-2 border-[#04FF8D]/30">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                        <AvatarFallback className="bg-[#04FF8D]/10 text-black font-bold">
                          {user.user_metadata?.full_name?.[0] || user.email?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.user_metadata?.full_name || "Usuario"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>{t('nav.home')}</span>
                    </DropdownMenuItem>
                    {canAccessPlatform ? (
                      <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                        <Rocket className="mr-2 h-4 w-4" />
                        <span>{t('nav.platform')}</span>
                      </DropdownMenuItem>
                    ) : null}
                    {canAccessPlatform ? (
                      <DropdownMenuItem onClick={() => navigate('/invite')}>
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>{t('nav.acceptOrgInvite', { defaultValue: 'Ingresar código de organización' })}</span>
                      </DropdownMenuItem>
                    ) : null}
                    {isWaitingListOnly ? (
                      <DropdownMenuItem onClick={() => navigate('/access-pending')}>
                        <ListChecks className="mr-2 h-4 w-4" />
                        <span>{t('nav.waitlistStatus', { defaultValue: 'Estado de acceso' })}</span>
                      </DropdownMenuItem>
                    ) : null}
                  {/* Comentado temporalmente — se habilita después del lanzamiento
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/cursos')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Cursos</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/bootcamps')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Bootcamps</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/badges')}>
                    <Award className="mr-2 h-4 w-4" />
                    <span>Insignias Digitales</span>
                  </DropdownMenuItem>
                  */}
                    {isSuperAdmin && (
                      <>
                        {adminMode && (
                          <>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>{t('nav.administration')}</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {superAdminMenuItems.map((item) => (
                                  <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    <span>{item.label}</span>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          </>
                        )}
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('nav.signOut')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            ) : (
              <>
                <div className="flex items-center gap-2 md:gap-4">
<Link to="/auth" className="hidden text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground md:inline-block">Iniciar sesión</Link>
<Link to="/auth" className="inline-flex h-9 items-center justify-center rounded-full bg-brand-neon px-4 text-xs font-bold text-black transition-transform hover:scale-105 md:h-10 md:px-5 md:text-sm">Crear cuenta</Link>
</div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
