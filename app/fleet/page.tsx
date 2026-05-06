'use client';

import { useState } from 'react';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { CarCard } from '@/components/public/CarCard';
import { useStore } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';
import { Car, Clock, ArrowLeftRight } from 'lucide-react';

export default function FleetPage() {
  const [activeTab, setActiveTab] = useState('all');
  const cars = useStore((state) => state.cars);
  const { t, dir } = useLanguage();

  const tabs = [
    { id: 'all', label: t.fleet.allVehicles, icon: Car },
    { id: 'transfer', label: t.fleet.transfer, icon: ArrowLeftRight },
    { id: 'hourly', label: t.fleet.hourlyCharter, icon: Clock },
  ];

  const filteredCars = cars.filter(car => {
    if (!car.available) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'hourly') return car.available_for_hourly;
    return !car.available_for_hourly;
  });

  return (
    <main className="min-h-screen bg-background">
      <PublicNavbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-foreground mb-4 tracking-tight">
            {t.fleet.title}
          </h1>
          <div className="w-16 h-0.5 bg-foreground mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.fleet.subtitle}
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className={cn(
              "inline-flex bg-secondary rounded-full p-1 border border-border",
              dir === 'rtl' && 'flex-row-reverse'
            )}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all',
                      activeTab === tab.id
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground',
                      dir === 'rtl' && 'flex-row-reverse'
                    )}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCars.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No vehicles available in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
