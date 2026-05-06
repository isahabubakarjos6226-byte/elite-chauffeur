'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Navigation, ChevronDown, ArrowRight, ArrowLeft, Loader2, Car, CalendarDays } from 'lucide-react';
import { useStore, formatPrice } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';
import { DatePicker, TimePicker } from '@/components/ui/date-time-picker';
import { RouteMap } from '@/components/ui/route-map';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';

export function HeroSection() {
  const router = useRouter();
  const { settings, cars } = useStore();
  const { t, dir } = useLanguage();
  const availableCars = cars.filter(c => c.available);
  
  const [formData, setFormData] = useState({
    booking_type: 'transfer' as 'transfer' | 'daily',
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
    return_date: '',
    return_time: '',
    vehicle: '',
    name: '',
    email: '',
    distance_km: 0,
  });
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lon: number; display_name?: string } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lon: number; display_name?: string } | null>(null);
  const [showMap, setShowMap] = useState(false);

  const handleCalculateDistance = async () => {
    if (!formData.pickup || !formData.dropoff) return;
    
    setIsCalculating(true);
    
    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup: formData.pickup,
          dropoff: formData.dropoff,
        }),
      });
      
      const data = await response.json();
      
      if (data.distanceKm) {
        setFormData(prev => ({ ...prev, distance_km: data.distanceKm }));
        setPickupCoords(data.pickup);
        setDropoffCoords(data.dropoff);
        setShowMap(true);
      }
    } catch (error) {
      console.error('Distance calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      type: formData.booking_type,
      pickup: formData.pickup,
      dropoff: formData.dropoff,
      date: formData.date,
      time: formData.time,
      car: formData.vehicle,
      name: formData.name,
      email: formData.email,
    });
    router.push(`/book?${params.toString()}`);
  };

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={settings.heroImageUrl || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920&q=80'}
          alt="Luxury car interior"
          className="w-full h-full object-cover"
        />
        <div className={cn(
          "absolute inset-0",
          dir === 'rtl' 
            ? "bg-gradient-to-l from-background via-background/80 to-background/40"
            : "bg-gradient-to-r from-background via-background/80 to-background/40"
        )} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className={cn(
          "grid lg:grid-cols-2 gap-12 lg:gap-16 items-center",
          dir === 'rtl' && 'lg:grid-flow-dense'
        )}>
          {/* Left - Text Content */}
          <div className={cn(dir === 'rtl' && 'text-right lg:col-start-2')}>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-foreground leading-[1.1] mb-6 tracking-tight">
              <span className="font-bold italic">{settings.heroTitle1 || t.hero.title1}</span>
              <br />
              <span className="font-bold italic">{settings.heroTitle2 || t.hero.title2}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mb-10 leading-relaxed">
              {settings.heroSubtitle || t.hero.subtitle}
            </p>
            <div className={cn("flex flex-wrap gap-4", dir === 'rtl' && 'flex-row-reverse justify-end')}>
              <Link
                href="/fleet"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-foreground text-background font-medium rounded-lg transition-all hover:bg-foreground/90"
              >
                {settings.heroButtonText1 || t.hero.exploreFleet}
              </Link>
              <Link
                href="/services"
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent border border-foreground/30 text-foreground font-medium rounded-lg transition-all hover:bg-foreground/10 hover:border-foreground/50",
                  dir === 'rtl' && 'flex-row-reverse'
                )}
              >
                {settings.heroButtonText2 || t.hero.ourServices}
                <ArrowIcon size={18} />
              </Link>
            </div>
          </div>

          {/* Right - Booking Form */}
          <div className={cn(
            "bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-8",
            dir === 'rtl' && 'lg:col-start-1 text-right'
          )}>
            <h2 className="text-foreground text-xl font-semibold mb-6 tracking-wide">
              {t.hero.reserveTitle}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Service Type Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, booking_type: 'transfer' })}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors",
                    formData.booking_type === 'transfer'
                      ? 'bg-foreground text-background'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Car size={16} />
                  {t.hero.transfer}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, booking_type: 'daily' })}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors",
                    formData.booking_type === 'daily'
                      ? 'bg-foreground text-background'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  <CalendarDays size={16} />
                  {t.hero.dailyRental}
                </button>
              </div>

              {/* Pickup & Dropoff */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground text-sm mb-2">
                    {t.hero.pickupLocation}
                  </label>
                  <AddressAutocomplete
                    value={formData.pickup}
                    onChange={(value, coords) => {
                      setFormData({ ...formData, pickup: value });
                      if (coords) setPickupCoords({ ...coords, display_name: value });
                    }}
                    placeholder={t.hero.pickupPlaceholder}
                    icon={<MapPin size={16} />}
                    dir={dir}
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground text-sm mb-2">
                    {t.hero.dropoffLocation}
                  </label>
                  <AddressAutocomplete
                    value={formData.dropoff}
                    onChange={(value, coords) => {
                      setFormData({ ...formData, dropoff: value });
                      if (coords) setDropoffCoords({ ...coords, display_name: value });
                    }}
                    placeholder={t.hero.dropoffPlaceholder}
                    icon={<Navigation size={16} />}
                    dir={dir}
                  />
                </div>
              </div>

              {/* Calculate Distance Button */}
              <button
                type="button"
                onClick={handleCalculateDistance}
                disabled={isCalculating || !formData.pickup || !formData.dropoff}
                className={cn(
                  "w-full flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors disabled:opacity-50",
                  dir === 'rtl' ? 'justify-start flex-row-reverse' : 'justify-end'
                )}
              >
                {isCalculating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    {t.hero.calculateDistance}
                    {formData.distance_km > 0 && (
                      <span className="text-foreground font-medium ml-2">
                        {formData.distance_km} km
                      </span>
                    )}
                  </>
                )}
              </button>
              
              {/* Map Preview */}
              {showMap && (
                <RouteMap 
                  pickup={pickupCoords} 
                  dropoff={dropoffCoords}
                  className="h-[200px] rounded-lg"
                />
              )}

              {/* Date & Time - Pickup/Start */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground text-sm mb-2">
                    {formData.booking_type === 'transfer' ? t.hero.pickupDate || t.hero.date : t.hero.startDate || t.hero.date}
                  </label>
                  <DatePicker
                    value={formData.date}
                    onChange={(date) => setFormData({ ...formData, date })}
                    placeholder={t.hero.pickDate}
                    minDate={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground text-sm mb-2">
                    {formData.booking_type === 'transfer' ? t.hero.pickupTime || t.hero.time : t.hero.startTime || t.hero.time}
                  </label>
                  <TimePicker
                    value={formData.time}
                    onChange={(time) => setFormData({ ...formData, time })}
                    placeholder={t.hero.pickTime}
                  />
                </div>
              </div>

              {/* Return Date & Time - Only for Daily Rental */}
              {formData.booking_type === 'daily' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted-foreground text-sm mb-2">
                      {t.hero.returnDate || 'Return Date'}
                    </label>
                    <DatePicker
                      value={formData.return_date}
                      onChange={(date) => setFormData({ ...formData, return_date: date })}
                      placeholder={t.hero.pickDate}
                      minDate={formData.date || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground text-sm mb-2">
                      {t.hero.returnTime || 'Return Time'}
                    </label>
                    <TimePicker
                      value={formData.return_time}
                      onChange={(time) => setFormData({ ...formData, return_time: time })}
                      placeholder={t.hero.pickTime}
                    />
                  </div>
                </div>
              )}

              {/* Vehicle Select */}
              <div>
                <label className="block text-muted-foreground text-sm mb-2">
                  {t.hero.selectVehicle}
                </label>
                <div className="relative">
                  <select
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    className={cn(
                      "w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground text-sm appearance-none focus:outline-none focus:border-foreground/50 transition-colors",
                      dir === 'rtl' && 'text-right'
                    )}
                  >
                    <option value="">{t.hero.chooseVehicle}</option>
                    {availableCars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.brand} {car.model} - {formData.booking_type === 'transfer' 
                          ? `${formatPrice(car.price_per_km || 0, settings)}/km`
                          : `${formatPrice(car.price_per_day || car.base_fee * 3 || 0, settings)}/day`
                        }
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className={cn(
                    "absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none",
                    dir === 'rtl' ? 'left-4' : 'right-4'
                  )} />
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground text-sm mb-2">
                    {t.hero.fullName}
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={cn(
                      "w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors",
                      dir === 'rtl' && 'text-right'
                    )}
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground text-sm mb-2">
                    {t.hero.emailAddress}
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={cn(
                      "w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors",
                      dir === 'rtl' && 'text-right'
                    )}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-foreground text-background font-medium rounded-lg transition-all hover:bg-foreground/90"
              >
                {t.hero.requestReservation}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
