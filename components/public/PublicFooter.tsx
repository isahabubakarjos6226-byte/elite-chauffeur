'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';

export function PublicFooter() {
  const settings = useStore((state) => state.settings);
  const { t, dir } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={cn(
          "flex flex-col sm:flex-row justify-between items-center gap-4",
          dir === 'rtl' && 'sm:flex-row-reverse'
        )}>
          {/* Copyright */}
          <p className="text-muted-foreground text-sm">
            &copy; {currentYear} {settings.siteName?.toUpperCase() || 'ELITE CHAUFFEUR'}. {t.footer.rights}.
          </p>
          
          {/* Navigation Links */}
          <nav className={cn(
            "flex items-center gap-6",
            dir === 'rtl' && 'flex-row-reverse'
          )}>
            <Link href="/fleet" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              {t.nav.fleet}
            </Link>
            <Link href="/services" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              {t.nav.services}
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              {t.nav.contact}
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              {t.nav.terms}
            </Link>
            <Link href="/book" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              {t.nav.bookNow}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
