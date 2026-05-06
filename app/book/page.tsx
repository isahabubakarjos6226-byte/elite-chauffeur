'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, User, Mail, Phone, ChevronRight, Check, Calculator, Loader2, Car, CalendarDays } from 'lucide-react';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { useStore, formatPrice, calculateTotalPrice, calculateRentalDays } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';
import { DatePicker, TimePicker, formatDate, formatTime } from '@/components/ui/date-time-picker';
import { RouteMap } from '@/components/ui/route-map';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();

  // Dynamic steps with translations
  const steps = [
    { id: 1, label: t.booking?.step1 || 'Service Type' },
    { id: 2, label: t.booking?.step2 || 'Details' },
    { id: 3, label: t.booking?.step3 || 'Vehicle' },
    { id: 4, label: t.booking?.step4 || 'Your Info' },
  ];
  const cars = useStore((state) => state.cars);
  const settings = useStore((state) => state.settings);
  const addReservation = useStore((state) => state.addReservation);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const bookingTypeParam = searchParams.get('type');
  const [formData, setFormData] = useState({
    booking_type: (bookingTypeParam === 'daily' ? 'daily' : 'transfer') as 'transfer' | 'daily',
    pickup: searchParams.get('pickup') || '',
    dropoff: searchParams.get('dropoff') || '',
    date: searchParams.get('date') || '',
    time: searchParams.get('time') || '',
    return_date: '',
    return_time: '',
    car_id: searchParams.get('car') || '',
    with_driver: true,
    distance_km: 0,
    rental_days: 1,
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    notes: '',
  });

  const [distanceCalculated, setDistanceCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lon: number; display_name?: string } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lon: number; display_name?: string } | null>(null);
  const [geocodeError, setGeocodeError] = useState('');

  const availableCars = cars.filter(c => c.available);
  const selectedCar = cars.find(c => c.id === parseInt(formData.car_id));

  // Calculate rental days when dates change
  useEffect(() => {
    if (formData.booking_type === 'daily' && formData.date && formData.return_date) {
      const days = calculateRentalDays(formData.date, formData.return_date);
      setFormData(prev => ({ ...prev, rental_days: days }));
    }
  }, [formData.date, formData.return_date, formData.booking_type]);

  const totalPrice = selectedCar 
    ? calculateTotalPrice(
        selectedCar, 
        formData.distance_km, 
        formData.with_driver,
        formData.booking_type,
        formData.rental_days,
        settings.showChauffeurService
      )
    : 0;

  const handleCalculateDistance = async () => {
    if (!formData.pickup || !formData.dropoff) {
      setGeocodeError('Please enter both pickup and dropoff locations');
      return;
    }
    
    setIsCalculating(true);
    setGeocodeError('');
    
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
      
      if (data.error && !data.pickup && !data.dropoff) {
        setGeocodeError(data.error);
      } else if (data.distanceKm) {
        setFormData(prev => ({ ...prev, distance_km: data.distanceKm }));
        setPickupCoords(data.pickup);
        setDropoffCoords(data.dropoff);
        setDistanceCalculated(true);
      } else {
        setGeocodeError('Could not calculate distance. Please check the addresses.');
      }
    } catch (error) {
      setGeocodeError('Failed to calculate distance. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create reservation
    addReservation({
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      pickup_location: formData.pickup,
      dropoff_location: formData.dropoff,
      pickup_date: formData.date,
      pickup_time: formData.time,
      return_date: formData.return_date,
      return_time: formData.return_time,
      booking_type: formData.booking_type,
      rental_days: formData.rental_days,
      distance_km: formData.distance_km,
      car_id: parseInt(formData.car_id),
      driver_id: formData.with_driver ? 1 : null,
      with_driver: formData.with_driver,
      driver_fee: formData.with_driver && selectedCar && settings.showChauffeurService ? selectedCar.driver_fee : 0,
      total_price: totalPrice,
      notes: formData.notes,
      status: 'pending',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    const confirmMessage = (t.booking?.confirmationMessage || 'Thank you for choosing Elite Chauffeur. We\'ve sent a confirmation to {email}. Our team will contact you shortly.')
      .replace('{email}', formData.customer_email);
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check size={40} className="text-green-500" />
        </div>
        <h2 className="font-serif text-3xl text-foreground mb-4">
          {t.booking?.reservationConfirmed || 'Reservation Confirmed!'}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {confirmMessage}
        </p>
        <Link href="/" className="ec-btn-gold">
          {t.booking?.returnHome || 'Return Home'}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-12">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div 
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                currentStep >= step.id
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-muted-foreground'
              )}
            >
              {currentStep > step.id ? <Check size={16} /> : step.id}
            </div>
            <span className={cn(
              'ml-2 text-sm hidden sm:inline',
              currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <ChevronRight size={16} className="mx-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Form Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Service Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-foreground mb-6">
                {t.hero.chooseService || 'Choose Your Service'}
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Transfer Option */}
                <label
                  className={cn(
                    'flex flex-col items-center gap-4 p-6 bg-card border rounded-xl cursor-pointer transition-all',
                    formData.booking_type === 'transfer'
                      ? 'border-foreground bg-foreground/5'
                      : 'border-border hover:border-foreground/50'
                  )}
                >
                  <input
                    type="radio"
                    name="booking_type"
                    value="transfer"
                    checked={formData.booking_type === 'transfer'}
                    onChange={(e) => setFormData({ ...formData, booking_type: e.target.value as 'transfer' | 'daily' })}
                    className="sr-only"
                  />
                  <div className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center',
                    formData.booking_type === 'transfer' ? 'bg-foreground text-background' : 'bg-secondary'
                  )}>
                    <Car size={28} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-foreground text-lg">{t.hero.transfer}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.hero.transferDesc}
                    </p>
                  </div>
                </label>

                {/* Daily Rental Option */}
                <label
                  className={cn(
                    'flex flex-col items-center gap-4 p-6 bg-card border rounded-xl cursor-pointer transition-all',
                    formData.booking_type === 'daily'
                      ? 'border-foreground bg-foreground/5'
                      : 'border-border hover:border-foreground/50'
                  )}
                >
                  <input
                    type="radio"
                    name="booking_type"
                    value="daily"
                    checked={formData.booking_type === 'daily'}
                    onChange={(e) => setFormData({ ...formData, booking_type: e.target.value as 'transfer' | 'daily' })}
                    className="sr-only"
                  />
                  <div className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center',
                    formData.booking_type === 'daily' ? 'bg-foreground text-background' : 'bg-secondary'
                  )}>
                    <CalendarDays size={28} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-foreground text-lg">{t.hero.dailyRental}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.hero.dailyRentalDesc}
                    </p>
                  </div>
                </label>
              </div>

              <div className="mt-8 p-4 bg-secondary/30 rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  {formData.booking_type === 'transfer' ? t.hero.transferPricing : t.hero.dailyRentalPricing}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {formData.booking_type === 'transfer' 
                    ? 'Base fee + (Distance in km × Price per km)' + (settings.showChauffeurService ? ' + Optional chauffeur fee' : '')
                    : 'Price per day × Number of days' + (settings.showChauffeurService ? ' + Optional chauffeur fee' : '')
                  }
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Details (Locations/Dates) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-foreground mb-6">
                {formData.booking_type === 'transfer' ? t.hero.routeSchedule : t.hero.rentalDetails}
              </h2>
              
              {/* Pickup Location */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  {t.hero.pickupLocation}
                </label>
                <AddressAutocomplete
                  value={formData.pickup}
                  onChange={(value, coords) => {
                    setFormData({ ...formData, pickup: value });
                    if (coords) setPickupCoords({ ...coords, display_name: value });
                  }}
                  placeholder={t.hero.pickupPlaceholder}
                  icon={<MapPin size={18} />}
                />
              </div>

              {/* Dropoff Location (for transfer) or Return Location (for daily) */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  {formData.booking_type === 'transfer' ? t.hero.dropoffLocation : t.hero.returnLocation}
                </label>
                <AddressAutocomplete
                  value={formData.dropoff}
                  onChange={(value, coords) => {
                    setFormData({ ...formData, dropoff: value });
                    if (coords) setDropoffCoords({ ...coords, display_name: value });
                  }}
                  placeholder={formData.booking_type === 'transfer' ? t.hero.dropoffPlaceholder : t.hero.returnLocation}
                  icon={<MapPin size={18} />}
                />
              </div>

              {/* Calculate Distance Button (for transfer) */}
              {formData.booking_type === 'transfer' && (
                <>
                  <button
                    type="button"
                    onClick={handleCalculateDistance}
                    disabled={isCalculating}
                    className="ec-btn-outline inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {isCalculating ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Calculator size={18} />
                    )}
                    {isCalculating ? (t.booking?.calculating || 'Calculating...') : (t.booking?.calculateDistance || 'Calculate Distance')}
                  </button>
                  
                  {geocodeError && (
                    <p className="text-red-400 text-sm">{geocodeError}</p>
                  )}
                  
                  {distanceCalculated && (
                    <div className="space-y-4">
                      <p className="text-foreground font-medium">
                        {t.booking?.estimatedDistance || 'Estimated distance'}: {formData.distance_km} km
                      </p>
                      <RouteMap 
                        pickup={pickupCoords} 
                        dropoff={dropoffCoords}
                        className="h-[250px]"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Dates */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    {formData.booking_type === 'transfer' ? t.hero.pickupDate : t.hero.startDate}
                  </label>
                  <DatePicker
                    value={formData.date}
                    onChange={(date) => setFormData({ ...formData, date })}
                    placeholder={t.hero.pickDate}
                    minDate={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    {formData.booking_type === 'transfer' ? t.hero.pickupTime : t.hero.startTime}
                  </label>
                  <TimePicker
                    value={formData.time}
                    onChange={(time) => setFormData({ ...formData, time })}
                    placeholder={t.hero.pickTime}
                  />
                </div>
              </div>

              {/* Return Date/Time (for daily rental) */}
              {formData.booking_type === 'daily' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      {t.hero.returnDate}
                    </label>
                    <DatePicker
                      value={formData.return_date}
                      onChange={(date) => setFormData({ ...formData, return_date: date })}
                      placeholder={t.hero.pickDate}
                      minDate={formData.date || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      {t.hero.returnTime}
                    </label>
                    <TimePicker
                      value={formData.return_time}
                      onChange={(time) => setFormData({ ...formData, return_time: time })}
                      placeholder={t.hero.pickTime}
                    />
                  </div>
                </div>
              )}

              {/* Rental Days Display */}
              {formData.booking_type === 'daily' && formData.date && formData.return_date && (
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-foreground font-medium">
                    {t.hero.rentalDuration}: {formData.rental_days} {formData.rental_days > 1 ? t.hero.days : t.hero.day}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Vehicle */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-foreground mb-6">
                {t.booking?.selectVehicle || 'Select Your Vehicle'}
              </h2>
              <div className="grid gap-4">
                {availableCars.map((car) => {
                  const carPrice = formData.booking_type === 'transfer'
                    ? calculateTotalPrice(car, formData.distance_km, false, 'transfer', 1, false)
                    : calculateTotalPrice(car, 0, false, 'daily', formData.rental_days, false);
                  
                  return (
                    <label
                      key={car.id}
                      className={cn(
                        'flex items-center gap-4 p-4 bg-card border rounded-xl cursor-pointer transition-all',
                        formData.car_id === car.id.toString()
                          ? 'border-foreground bg-foreground/5'
                          : 'border-border hover:border-foreground/50'
                      )}
                    >
                      <input
                        type="radio"
                        name="car"
                        value={car.id}
                        checked={formData.car_id === car.id.toString()}
                        onChange={(e) => setFormData({ ...formData, car_id: e.target.value })}
                        className="sr-only"
                      />
                      <img
                        src={car.photo_url}
                        alt={`${car.brand} ${car.model}`}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                          {car.brand} {car.model}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {car.capacity} {t.booking?.passengers || 'passengers'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground font-medium">
                          {formatPrice(carPrice, settings)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formData.booking_type === 'transfer' 
                            ? `${formatPrice(car.price_per_km || 0, settings)}/${t.fleet.perKm?.replace('per ', '') || 'km'}`
                            : `${formatPrice(car.price_per_day || car.base_fee * 3 || 0, settings)}/${t.hero.perDay?.replace('per ', '') || 'day'}`
                          }
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Chauffeur Option - Only show if enabled in settings */}
              {settings.showChauffeurService && (
                <div className="mt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.with_driver}
                      onChange={(e) => setFormData({ ...formData, with_driver: e.target.checked })}
                      className="w-5 h-5 rounded border-border bg-input text-foreground focus:ring-foreground"
                    />
                    <span className="text-foreground">
                      {t.booking?.includeChauffeur || 'Include professional chauffeur'}
                      {selectedCar && (
                        <span className="text-muted-foreground ml-2">
                          (+{formatPrice(selectedCar.driver_fee, settings)})
                        </span>
                      )}
                    </span>
                  </label>
                </div>
              )}

              {/* Price Breakdown Card - Show when car is selected */}
              {selectedCar && (
                <div className="mt-6 p-5 bg-card border border-border rounded-xl space-y-4">
                  {/* From/To Locations */}
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground font-medium">{t.hero.from || 'From'}:</span>{' '}
                      <span className="text-foreground">{formData.pickup || '—'}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground font-medium">{t.hero.to || 'To'}:</span>{' '}
                      <span className="text-foreground">{formData.dropoff || '—'}</span>
                    </p>
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    {formData.booking_type === 'transfer' ? (
                      <>
                        {/* Transfer pricing breakdown */}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t.admin.distance || 'Distance'}</span>
                          <span className="text-foreground font-medium">{formData.distance_km} km</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t.fleet.baseFee || 'Base fee'}</span>
                          <span className="text-foreground">{formatPrice(selectedCar.base_fee || 0, settings)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t.fleet.distanceCost || 'Distance cost'} ({formData.distance_km} km × {formatPrice(selectedCar.price_per_km || 0, settings)}/km)
                          </span>
                          <span className="text-foreground">
                            {formatPrice((formData.distance_km * (selectedCar.price_per_km || 0)), settings)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Daily rental pricing breakdown */}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t.hero.rentalDuration || 'Rental Duration'}</span>
                          <span className="text-foreground font-medium">
                            {formData.rental_days} {formData.rental_days > 1 ? t.hero.days || 'days' : t.hero.day || 'day'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t.fleet.dailyRate || 'Daily rate'} ({formData.rental_days} × {formatPrice(selectedCar.price_per_day || selectedCar.base_fee * 3 || 0, settings)}/{t.hero.day || 'day'})
                          </span>
                          <span className="text-foreground">
                            {formatPrice((selectedCar.price_per_day || selectedCar.base_fee * 3 || 0) * formData.rental_days, settings)}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Chauffeur fee if enabled */}
                    {settings.showChauffeurService && formData.with_driver && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.fleet.chauffeurFee || 'Chauffeur fee'}</span>
                        <span className="text-foreground">{formatPrice(selectedCar.driver_fee || 0, settings)}</span>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between pt-3 border-t border-border">
                      <span className="text-foreground font-semibold">{t.fleet.estimatedTotal || 'Estimated Total'}</span>
                      <span className="text-foreground text-xl font-bold">
                        {formatPrice(
                          calculateTotalPrice(
                            selectedCar,
                            formData.distance_km,
                            formData.with_driver,
                            formData.booking_type,
                            formData.rental_days,
                            settings.showChauffeurService
                          ),
                          settings
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Personal Details */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-foreground mb-6">
                {t.booking?.yourDetails || 'Your Details'}
              </h2>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  {t.booking?.fullName || 'Full Name'}
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t.booking?.enterFullName || 'Enter your full name'}
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="ec-input w-full pl-11"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  {t.booking?.emailAddress || 'Email Address'}
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder={t.booking?.enterEmail || 'Enter your email'}
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    className="ec-input w-full pl-11"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  {t.booking?.phoneNumber || 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder={t.booking?.enterPhone || 'Enter your phone number'}
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="ec-input w-full pl-11"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  {t.booking?.specialRequests || 'Special Requests (Optional)'}
                </label>
                <textarea
                  placeholder={t.booking?.anySpecialRequests || 'Any special requirements or notes'}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="ec-input w-full min-h-[100px]"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="ec-btn-outline"
              >
                {t.booking?.back || 'Back'}
              </button>
            ) : (
              <div />
            )}
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="ec-btn-gold"
              >
                {t.booking?.continue || 'Continue'}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="ec-btn-gold disabled:opacity-50"
              >
                {isSubmitting ? (t.booking?.processing || 'Processing...') : (t.booking?.confirmReservation || 'Confirm Reservation')}
              </button>
            )}
          </div>
        </div>

        {/* Price Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-card border border-border rounded-xl p-6">
            <h3 className="font-serif text-xl text-foreground mb-6">
              {t.booking?.bookingSummary || 'Booking Summary'}
            </h3>

            {/* Service Type */}
            <div className="mb-4 pb-4 border-b border-border">
              <p className="text-sm text-muted-foreground mb-1">{t.booking?.serviceType || 'Service Type'}</p>
              <p className="text-foreground font-medium">
                {formData.booking_type === 'transfer' ? t.hero.transfer : t.hero.dailyRental}
              </p>
            </div>

            {formData.pickup && (
              <div className="mb-4 pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground mb-1">{t.booking?.route || 'Route'}</p>
                <p className="text-foreground text-sm">{formData.pickup}</p>
                <p className="text-muted-foreground text-xs my-1">{t.booking?.to || 'to'}</p>
                <p className="text-foreground text-sm">{formData.dropoff || (t.booking?.notSet || 'Not set')}</p>
              </div>
            )}

            {formData.date && (
              <div className="mb-4 pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground mb-1">
                  {formData.booking_type === 'transfer' ? (t.booking?.dateTime || 'Date & Time') : (t.booking?.rentalPeriod || 'Rental Period')}
                </p>
                <p className="text-foreground">
                  {formatDate(formData.date)} {formData.time && `at ${formatTime(formData.time)}`}
                </p>
                {formData.booking_type === 'daily' && formData.return_date && (
                  <p className="text-foreground text-sm mt-1">
                    {t.booking?.to || 'to'} {formatDate(formData.return_date)} {formData.return_time && `at ${formatTime(formData.return_time)}`}
                  </p>
                )}
              </div>
            )}

            {selectedCar && (
              <div className="mb-4 pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground mb-1">{t.booking?.vehicle || 'Vehicle'}</p>
                <p className="text-foreground">{selectedCar.brand} {selectedCar.model}</p>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              {selectedCar && (
                <>
                  {formData.booking_type === 'transfer' ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base fee</span>
                        <span className="text-foreground">{formatPrice(selectedCar.base_fee, settings)}</span>
                      </div>
                      {formData.distance_km > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {formData.distance_km} km × {formatPrice(selectedCar.price_per_km, settings)}
                          </span>
                          <span className="text-foreground">
                            {formatPrice(formData.distance_km * selectedCar.price_per_km, settings)}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formData.rental_days} day{formData.rental_days > 1 ? 's' : ''} × {formatPrice(selectedCar.price_per_day || selectedCar.base_fee * 3 || 0, settings)}
                      </span>
                      <span className="text-foreground">
                        {formatPrice((selectedCar.price_per_day || selectedCar.base_fee * 3 || 0) * formData.rental_days, settings)}
                      </span>
                    </div>
                  )}
                  
                  {formData.with_driver && settings.showChauffeurService && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.booking?.chauffeur || 'Chauffeur'}</span>
                      <span className="text-foreground">{formatPrice(selectedCar.driver_fee, settings)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.booking?.total || 'Total'}</span>
                <span className="font-serif text-2xl text-foreground">
                  {formatPrice(totalPrice, settings)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function BookPageContent() {
  const { t } = useLanguage();
  
  return (
    <main className="min-h-screen bg-background">
      <PublicNavbar />
      
      <section className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-4">
              {t.booking?.pageTitle || 'Book Your Journey'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.booking?.pageSubtitle || 'Complete your reservation in just a few simple steps.'}
            </p>
          </div>

          <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
            <BookingForm />
          </Suspense>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

export default function BookPage() {
  return <BookPageContent />;
}
