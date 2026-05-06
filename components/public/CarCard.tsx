'use client';

import Link from 'next/link';
import { Users, Clock, ArrowLeftRight, Eye } from 'lucide-react';
import { useStore, formatPrice } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';
import type { Car } from '@/lib/types';

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
  const settings = useStore((state) => state.settings);
  const { t, dir } = useLanguage();

  return (
    <article className="group bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-foreground/30 hover:shadow-lg hover:shadow-white/5 hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        <Link href={`/fleet/${car.id}`} className="block w-full h-full">
          <img
            src={car.photo_url}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        
        {/* Year Badge - Top Right */}
        <div className={cn(
          "absolute top-4 flex flex-col gap-2",
          dir === 'rtl' ? 'left-4 items-start' : 'right-4 items-end'
        )}>
          <span className="px-3 py-1.5 bg-secondary/90 backdrop-blur-sm text-foreground text-xs font-medium rounded">
            {car.year}
          </span>
          {car.available_for_hourly && (
            <span className={cn(
              "px-3 py-1.5 bg-secondary/90 backdrop-blur-sm text-foreground text-xs font-medium rounded flex items-center gap-1.5",
              dir === 'rtl' && 'flex-row-reverse'
            )}>
              <Clock size={12} />
              {t.fleet.hourlyCharter.toUpperCase()}
            </span>
          )}
        </div>

        {/* View Details Overlay */}
        <Link 
          href={`/fleet/${car.id}`}
          className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <span className={cn(
            "text-foreground text-sm font-medium flex items-center gap-2",
            dir === 'rtl' && 'flex-row-reverse'
          )}>
            <Eye size={16} />
            {t.fleet.viewDetails}
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className={cn("p-6", dir === 'rtl' && 'text-right')}>
        {/* Header: Brand/Model and Price */}
        <div className={cn(
          "flex items-start justify-between gap-4 mb-3",
          dir === 'rtl' && 'flex-row-reverse'
        )}>
          <div>
            <h3 className="text-foreground font-semibold text-lg leading-tight">
              {car.brand}
            </h3>
            <p className="text-muted-foreground text-sm">
              {car.model}
            </p>
          </div>
          <div className={cn(dir === 'rtl' ? 'text-left' : 'text-right')}>
            <p className="text-foreground font-bold text-lg">
              {formatPrice(car.price_per_km, settings)}
            </p>
            <p className="text-muted-foreground text-xs">
              {t.fleet.perKm}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
          {car.description}
        </p>

        {/* Features */}
        <div className={cn(
          "flex flex-wrap gap-1.5 mb-4",
          dir === 'rtl' && 'flex-row-reverse'
        )}>
          {car.features.slice(0, 3).map((feature, index) => (
            <span 
              key={index}
              className="px-2.5 py-1 bg-secondary text-muted-foreground text-xs rounded border border-border"
            >
              {feature}
            </span>
          ))}
          {car.features.length > 3 && (
            <span className="px-2.5 py-1 bg-secondary text-muted-foreground text-xs rounded border border-border">
              +{car.features.length - 3}
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className={cn(
          "flex items-center gap-4 mb-5 text-sm text-muted-foreground",
          dir === 'rtl' && 'flex-row-reverse'
        )}>
          <div className={cn("flex items-center gap-1.5", dir === 'rtl' && 'flex-row-reverse')}>
            <Users size={14} />
            <span>{car.capacity} {t.fleet.seats}</span>
          </div>
          <div className={cn("flex items-center gap-1.5", dir === 'rtl' && 'flex-row-reverse')}>
            {car.available_for_hourly ? (
              <>
                <Clock size={14} />
                <span>{t.fleet.hourlyCharter}</span>
              </>
            ) : (
              <>
                <ArrowLeftRight size={14} />
                <span>{t.fleet.transfer}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={cn("flex gap-3", dir === 'rtl' && 'flex-row-reverse')}>
          <Link
            href={`/fleet/${car.id}`}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent border border-border text-foreground text-sm font-medium rounded-lg transition-all hover:bg-secondary hover:border-foreground/30",
              dir === 'rtl' && 'flex-row-reverse'
            )}
          >
            <Eye size={14} />
            {t.fleet.viewDetails.toUpperCase()}
          </Link>
          <Link
            href={`/book?car=${car.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-lg transition-all hover:bg-foreground/90"
          >
            {t.fleet.reserveNow.toUpperCase()}
          </Link>
        </div>
      </div>
    </article>
  );
}
