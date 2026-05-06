'use client';

import Link from 'next/link';
import { Phone } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function CTASection() {
  const { t, dir } = useLanguage();
  const settings = useStore((state) => state.settings);

  return (
    <section className="py-24 bg-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-serif text-4xl sm:text-5xl text-foreground mb-4 tracking-tight">
          {settings.ctaTitle || t.cta.title}
        </h2>
        <div className="w-16 h-0.5 bg-foreground mx-auto mb-6" />
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
          {settings.ctaSubtitle || t.cta.subtitle}
        </p>
        
        <div className={cn(
          "flex flex-col sm:flex-row gap-4 justify-center",
          dir === 'rtl' && 'sm:flex-row-reverse'
        )}>
          <Link
            href="/book"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background font-medium rounded-lg transition-all hover:bg-foreground/90"
          >
            {t.cta.bookNow}
          </Link>
          <Link
            href="/contact"
            className={cn(
              "inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-foreground/30 text-foreground font-medium rounded-lg transition-all hover:bg-foreground/10",
              dir === 'rtl' && 'flex-row-reverse'
            )}
          >
            <Phone size={20} />
            {t.cta.contactUs}
          </Link>
        </div>
      </div>
    </section>
  );
}
