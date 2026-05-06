'use client';

import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { CarCard } from './CarCard';
import { cn } from '@/lib/utils';

export function FleetPreview() {
  const { cars, settings } = useStore();
  const { t, dir } = useLanguage();
  const availableCars = cars.filter(car => car.available).slice(0, 6);

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl sm:text-5xl text-foreground mb-4 tracking-tight">
            {settings.fleetTitle || t.fleet.title}
          </h2>
          <div className="w-16 h-0.5 bg-foreground mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            {t.fleet.subtitle}
          </p>
          <Link
            href="/fleet"
            className={cn(
              "inline-flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors font-medium",
              dir === 'rtl' && 'flex-row-reverse'
            )}
          >
            {t.fleet.viewAll}
            <ArrowIcon size={18} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </section>
  );
}
