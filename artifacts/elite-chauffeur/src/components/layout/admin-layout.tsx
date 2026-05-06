import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import { LayoutDashboard, Calendar, CarFront, Users, DollarSign, ListTodo, LogOut, Settings, Sparkles, UserCog, Shield, FileText, Palette } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";
import { useI18n, LanguageSwitcher } from "@/lib/i18n";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { logout, userName, role } = useAdminAuth();
  const { t, isRtl } = useI18n();
  const a = t.admin;

  const isFullAccess = role === "super_admin" || role === "admin";
  const isSuperAdmin = role === "super_admin";

  const navItems = [
    { href: "/", label: a.nav.dashboard, icon: LayoutDashboard, show: true },
    { href: "/reservations", label: a.nav.reservations, icon: ListTodo, show: true },
    { href: "/calendar", label: a.nav.calendar, icon: Calendar, show: true },
    { href: "/cars", label: a.nav.cars, icon: CarFront, show: isFullAccess },
    { href: "/drivers", label: a.nav.drivers, icon: Users, show: isFullAccess },
    { href: "/pricing", label: a.nav.pricing, icon: DollarSign, show: isFullAccess },
    { href: "/services", label: a.nav.services, icon: Sparkles, show: isFullAccess },
    { href: "/terms", label: "Terms & Conditions", icon: FileText, show: isFullAccess },
    { href: "/users", label: "Staff Users", icon: UserCog, show: isSuperAdmin },
    { href: "/theme", label: "Theme", icon: Palette, show: isFullAccess },
    { href: "/settings", label: a.nav.settings, icon: Settings, show: isFullAccess },
  ].filter(item => item.show);

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const roleBadge = role === "super_admin" ? "Master Admin" : role === "admin" ? "Admin" : "User";
  const roleColor = role === "user" ? "text-muted-foreground" : "text-primary";

  return (
    <div
      className="min-h-[100dvh] flex flex-col md:flex-row bg-background text-foreground dark"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <aside className="w-full md:w-60 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">{a.eliteChauffeur}</p>
          <h2 className="text-base font-bold text-foreground tracking-tight">{a.portal}</h2>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer text-sm ${
                  isActive
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          {userName && (
            <div className="px-3 py-2 rounded-md bg-secondary/40 flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Shield className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{userName}</p>
                <p className={`text-[10px] ${roleColor} uppercase tracking-wider`}>{roleBadge}</p>
              </div>
            </div>
          )}
          <div className="px-3 py-1">
            <LanguageSwitcher />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{a.signOut}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
