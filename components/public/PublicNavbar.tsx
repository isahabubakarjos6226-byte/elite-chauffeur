'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { LanguageSwitcher } from './LanguageSwitcher';

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const settings = useStore((state) => state.settings);
  const { t, dir } = useLanguage();

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/fleet', label: t.nav.fleet },
    { href: '/services', label: t.nav.services },
    { href: '/contact', label: t.nav.contact },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn("flex items-center justify-between h-16", dir === 'rtl' && 'flex-row-reverse')}>
          {/* Logo */}
          <Link href="/" className="text-foreground font-bold text-lg tracking-widest uppercase">
            {settings.siteName || 'ELITE CHAUFFEUR'}
          </Link>

          {/* Desktop Navigation */}
          <div className={cn("hidden md:flex items-center gap-8", dir === 'rtl' && 'flex-row-reverse')}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side - Language Switcher & CTA */}
          <div className={cn("hidden md:flex items-center gap-4", dir === 'rtl' && 'flex-row-reverse')}>
            <LanguageSwitcher />
            <Link
              href="/book"
              className="px-5 py-2 bg-foreground text-background text-sm font-medium rounded-lg transition-all hover:bg-foreground/90"
            >
              {t.nav.bookNow}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block py-2 text-base font-medium',
                  pathname === link.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="py-2">
              <LanguageSwitcher />
            </div>
            <Link
              href="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="block mt-4 py-3 bg-foreground text-background text-center text-sm font-medium rounded-lg"
            >
              {t.nav.bookNow}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
