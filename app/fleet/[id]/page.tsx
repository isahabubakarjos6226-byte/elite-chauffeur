'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Users, Calendar, Star, Tag, Shield, Clock, Wifi, Coffee, Award } from 'lucide-react';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { useStore, formatPrice } from '@/lib/store';

const trustBadges = [
  { icon: Shield, label: 'Fully Insured' },
  { icon: Clock, label: '24/7 Service' },
  { icon: Award, label: 'Pro Chauffeur' },
  { icon: Wifi, label: 'Wi-Fi Equipped' },
  { icon: Coffee, label: 'Complimentary Beverages' },
  { icon: Star, label: '5-Star Rated' },
];

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const cars = useStore((state) => state.cars);
  const settings = useStore((state) => state.settings);
  
  const car = cars.find(c => c.id === parseInt(id));

  if (!car) {
    return (
      <main className="min-h-screen">
        <PublicNavbar />
        <div className="pt-32 pb-16 text-center">
          <h1 className="font-serif text-4xl text-foreground mb-4">Vehicle Not Found</h1>
          <Link href="/fleet" className="text-foreground hover:underline">
            Return to Fleet
          </Link>
        </div>
        <PublicFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <PublicNavbar />
      
      {/* Hero Image */}
      <section className="relative h-[60vh] min-h-[500px]">
        <img
          src={car.photo_url}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 ec-gradient-overlay" />
      </section>

      {/* Content */}
      <section className="py-16 bg-background -mt-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/fleet" className="hover:text-foreground transition-colors">Fleet</Link>
            <ChevronRight size={14} />
            <span className="text-foreground">{car.brand} {car.model}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column - Details */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-foreground text-background text-sm font-medium rounded-full">
                  {car.year}
                </span>
                <span className="px-3 py-1 bg-secondary text-foreground text-sm rounded-full capitalize">
                  {car.category}
                </span>
                {car.available_for_hourly && (
                  <span className="px-3 py-1 bg-secondary text-foreground text-sm rounded-full flex items-center gap-1">
                    <Clock size={14} />
                    Hourly Available
                  </span>
                )}
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-6">
                {car.brand} {car.model}
              </h1>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-card border border-border rounded-lg text-center">
                  <Calendar size={20} className="mx-auto mb-2 text-foreground" />
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="text-lg font-medium text-foreground">{car.year}</p>
                </div>
                <div className="p-4 bg-card border border-border rounded-lg text-center">
                  <Users size={20} className="mx-auto mb-2 text-foreground" />
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="text-lg font-medium text-foreground">{car.capacity} Passengers</p>
                </div>
                <div className="p-4 bg-card border border-border rounded-lg text-center">
                  <Tag size={20} className="mx-auto mb-2 text-foreground" />
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="text-lg font-medium text-foreground capitalize">{car.category}</p>
                </div>
                <div className="p-4 bg-card border border-border rounded-lg text-center">
                  <Star size={20} className="mx-auto mb-2 text-foreground" />
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-lg font-medium text-foreground">5.0</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="font-serif text-2xl text-foreground mb-4">About This Vehicle</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {car.description}
                </p>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h2 className="font-serif text-2xl text-foreground mb-4">Features & Amenities</h2>
                <div className="flex flex-wrap gap-3">
                  {car.features.map((feature, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-secondary text-foreground text-sm rounded-lg"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div>
                <h2 className="font-serif text-2xl text-foreground mb-4">Service Guarantees</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {trustBadges.map((badge, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"
                    >
                      <badge.icon size={20} className="text-foreground" />
                      <span className="text-sm text-foreground">{badge.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Pricing Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-card border border-border rounded-xl p-6">
                <h3 className="font-serif text-xl text-foreground mb-6">Pricing</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Price per km</span>
                    <span className="text-xl font-medium text-foreground">
                      {formatPrice(car.price_per_km, settings)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Base fee</span>
                    <span className="text-xl font-medium text-foreground">
                      {formatPrice(car.base_fee, settings)}
                    </span>
                  </div>
                  {settings.showChauffeurService && (
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-muted-foreground">Driver fee</span>
                      <span className="text-xl font-medium text-foreground">
                        {formatPrice(car.driver_fee, settings)}
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/book?car=${car.id}`}
                  className="block w-full ec-btn-gold text-center mb-4"
                >
                  Reserve Now
                </Link>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Need assistance?</p>
                  <a 
                    href={`tel:${settings.contactPhone}`}
                    className="text-foreground hover:underline text-sm"
                  >
                    {settings.contactPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
