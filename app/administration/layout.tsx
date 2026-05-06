'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Calendar, 
  Car, 
  Users, 
  DollarSign, 
  Briefcase, 
  FileText, 
  UserCog, 
  Palette, 
  Settings, 
  LogOut,
  ClipboardList,
  Menu,
  X
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import { locales } from '@/lib/i18n';
import { FlagIcon } from '@/components/public/FlagIcon';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, currentUser, logout, settings } = useStore();
  const { locale, setLocale, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navItems = [
    { href: '/administration', icon: LayoutDashboard, label: t.admin.dashboard, roles: ['admin', 'super_admin'] },
    { href: '/administration/reservations', icon: ClipboardList, label: t.admin.reservations, roles: ['admin', 'super_admin'] },
    { href: '/administration/calendar', icon: Calendar, label: t.admin.calendar, roles: ['admin', 'super_admin'] },
    { href: '/administration/cars', icon: Car, label: t.admin.fleet, roles: ['admin', 'super_admin'] },
    { href: '/administration/drivers', icon: Users, label: t.admin.drivers, roles: ['admin', 'super_admin'] },
    { href: '/administration/pricing', icon: DollarSign, label: t.admin.pricing, roles: ['admin', 'super_admin'] },
    { href: '/administration/services', icon: Briefcase, label: t.admin.services, roles: ['admin', 'super_admin'] },
    { href: '/administration/terms', icon: FileText, label: t.admin.terms, roles: ['admin', 'super_admin'] },
    { href: '/administration/users', icon: UserCog, label: t.admin.staffUsers, roles: ['super_admin'] },
    { href: '/administration/theme', icon: Palette, label: t.admin.theme, roles: ['admin', 'super_admin'] },
    { href: '/administration/settings', icon: Settings, label: t.admin.settings, roles: ['admin', 'super_admin'] },
  ];

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/administration/login') {
      router.push('/administration/login');
    }
  }, [isAuthenticated, pathname, router]);

  if (pathname === '/administration/login') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const userRole = currentUser?.role || 'admin';
  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  const handleLogout = () => {
    logout();
    router.push('/administration/login');
  };

  const currentLocale = locales.find(l => l.code === locale) || locales[0];

  return (
    <div className="min-h-screen bg-background flex" dir={currentLocale.dir}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static inset-y-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform lg:translate-x-0',
        currentLocale.dir === 'rtl' ? 'right-0' : 'left-0',
        sidebarOpen ? 'translate-x-0' : (currentLocale.dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
            <Link href="/administration" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background font-serif text-xl font-bold">E</span>
              </div>
              <div>
                <span className="font-serif text-lg text-sidebar-foreground">
                  {settings.siteName}
                </span>
                <p className="text-xs text-muted-foreground">{t.admin.adminPanel}</p>
              </div>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-sidebar-foreground"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/administration' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-foreground text-background'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="mb-4 px-4">
              <p className="text-sm font-medium text-sidebar-foreground">
                {currentUser?.name || 'Admin'}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {userRole.replace('_', ' ')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-red-400 transition-colors"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">{t.admin.signOut}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-foreground"
            >
              <Menu size={24} />
            </button>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <FlagIcon locale={locale} size={20} />
                  <span className="text-sm font-medium">{locale.toUpperCase()}</span>
                </button>
                {langDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setLangDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                      {locales.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLocale(lang.code);
                            setLangDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors',
                            locale === lang.code && 'bg-secondary'
                          )}
                        >
                          <FlagIcon locale={lang.code} size={20} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{lang.nativeName}</p>
                            <p className="text-xs text-muted-foreground">{lang.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.admin.viewSite}
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
