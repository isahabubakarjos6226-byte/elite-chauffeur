'use client';

import Link from 'next/link';
import { Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { useStore } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';
import { getServiceIcon } from '@/app/administration/services/page';

// Map service titles to translation keys
const serviceTranslationMap: Record<string, { titleKey: string; descKey: string }> = {
  'Airport Transfers': { titleKey: 'airportTransfers', descKey: 'airportTransfersDesc' },
  'Corporate Travel': { titleKey: 'corporateTravel', descKey: 'corporateTravelDesc' },
  'Special Events': { titleKey: 'specialEvents', descKey: 'specialEventsDesc' },
  'Hourly Charter': { titleKey: 'hourlyCharter', descKey: 'hourlyCharterDesc' },
  'Long Distance': { titleKey: 'longDistance', descKey: 'longDistanceDesc' },
};

export default function ServicesPage() {
  const services = useStore((state) => state.services);
  const { t, dir } = useLanguage();
  const activeServices = services.filter(s => s.active).sort((a, b) => a.sort_order - b.sort_order);

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  // Helper to get translated title
  const getServiceTitle = (service: { title: string }) => {
    const mapping = serviceTranslationMap[service.title];
    if (mapping && t.services[mapping.titleKey as keyof typeof t.services]) {
      return t.services[mapping.titleKey as keyof typeof t.services];
    }
    return service.title;
  };

  // Helper to get translated description
  const getServiceDesc = (service: { title: string; description: string }) => {
    const mapping = serviceTranslationMap[service.title];
    if (mapping && t.services[mapping.descKey as keyof typeof t.services]) {
      return t.services[mapping.descKey as keyof typeof t.services];
    }
    return service.description;
  };

  return (
    <main className="min-h-screen">
      <PublicNavbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-5xl sm:text-6xl text-foreground mb-6">
            {t.services.title}
          </h1>
          <div className="w-16 h-0.5 bg-foreground mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.services.subtitle}
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {activeServices.map((service, index) => (
              <div 
                key={service.id}
                className={cn(
                  'grid lg:grid-cols-2 gap-12 items-center',
                  index % 2 === 1 && 'lg:flex-row-reverse'
                )}
              >
                {/* Image */}
                <div className={cn(
                  'relative aspect-[4/3] rounded-2xl overflow-hidden',
                  index % 2 === 1 && 'lg:order-2'
                )}>
                  <img
                    src={service.image_url}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className={cn(
                  index % 2 === 1 && 'lg:order-1',
                  dir === 'rtl' && 'text-right'
                )}>
                  {(() => {
                    const IconComponent = getServiceIcon(service.icon);
                    return (
                      <div className={cn(
                        "w-16 h-16 rounded-xl bg-foreground/10 flex items-center justify-center mb-6",
                        dir === 'rtl' && 'mr-auto'
                      )}>
                        <IconComponent size={28} className="text-foreground" />
                      </div>
                    );
                  })()}
                  <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
                    {getServiceTitle(service)}
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                    {getServiceDesc(service)}
                  </p>
                  <Link
                    href="/book"
                    className={cn(
                      "inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-medium rounded-lg transition-all hover:bg-foreground/90",
                      dir === 'rtl' && 'flex-row-reverse'
                    )}
                  >
                    {t.services.reserveService}
                    <ArrowIcon size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Solutions CTA */}
      <section className="py-16 bg-secondary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn(
            "bg-card border border-border rounded-2xl p-8 sm:p-12 text-center",
            dir === 'rtl' && 'text-center'
          )}>
            <h2 className="font-serif text-3xl text-foreground mb-4">
              {t.services.customSolution}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {t.services.customSolutionDesc}
            </p>
            <Link
              href="/contact"
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-foreground/30 text-foreground font-medium rounded-lg transition-all hover:bg-foreground/10",
                dir === 'rtl' && 'flex-row-reverse'
              )}
            >
              <Phone size={18} />
              {t.services.contactConcierge}
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
