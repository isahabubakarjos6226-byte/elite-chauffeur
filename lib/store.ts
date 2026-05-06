import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Car, Driver, Reservation, PricingTier, Service, TermsSection, User, SiteSettings } from './types';

// Sample data matching reference design
const sampleCars: Car[] = [
  {
    id: 1,
    brand: 'BMW',
    model: '760i',
    year: 2024,
    category: 'sedan',
    capacity: 4,
    price_per_km: 4.20,
    price_per_day: 450,
    base_fee: 75,
    driver_fee: 150,
    description: 'Executive flagship with Sky Lounge panoramic roof and Executive Lounge rear seating.',
    features: ['Executive Lounge Seats', 'Sky Lounge Roof', 'Harman Kardon Audio', 'Massage Seats', 'Ambient Lighting', 'Rear Entertainment'],
    photo_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    available: true,
    available_for_hourly: false,
    internal_name: 'BMW-760i',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    brand: 'Bentley',
    model: 'Flying Spur',
    year: 2023,
    category: 'sedan',
    capacity: 4,
    price_per_km: 8.00,
    price_per_day: 850,
    base_fee: 150,
    driver_fee: 200,
    description: 'Handcrafted British luxury at its finest — a grand touring saloon with unparalleled refinement.',
    features: ['Handcrafted Interior', 'Naim Audio', 'Massaging Seats', 'Diamond Quilting', 'Rotating Display', 'Night Vision'],
    photo_url: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&q=80',
    available: true,
    available_for_hourly: false,
    internal_name: 'BENT-FS',
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    brand: 'Land Rover',
    model: 'Range Rover Autobiography',
    year: 2024,
    category: 'suv',
    capacity: 5,
    price_per_km: 5.50,
    price_per_day: 550,
    base_fee: 100,
    driver_fee: 175,
    description: 'Ultimate SUV luxury — commanding presence with rear executive seating and air suspension.',
    features: ['Executive Rear Seats', 'Meridian Audio', 'Heated/Cooled Seats', 'Air Suspension', 'Terrain Response', 'Pixel LED'],
    photo_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
    available: true,
    available_for_hourly: false,
    internal_name: 'RR-AUTO',
    created_at: '2024-01-03T00:00:00Z',
  },
  {
    id: 4,
    brand: 'Rolls-Royce',
    model: 'Ghost',
    year: 2023,
    category: 'limousine',
    capacity: 4,
    price_per_km: 15.00,
    price_per_day: 1500,
    base_fee: 350,
    driver_fee: 400,
    description: 'The whisper of luxury — post-opulent design with the iconic Spirit of Ecstasy.',
    features: ['Starlight Headliner', 'Bespoke Audio', 'Self-Closing Doors', 'Champagne Cooler', 'Lamb Wool Mats', 'Planar Suspension'],
    photo_url: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=800&q=80',
    available: true,
    available_for_hourly: false,
    internal_name: 'RR-GHOST',
    created_at: '2024-01-04T00:00:00Z',
  },
  {
    id: 5,
    brand: 'Mercedes-Benz',
    model: 'V-Class VIP',
    year: 2024,
    category: 'van',
    capacity: 7,
    price_per_km: 5.00,
    price_per_day: 500,
    base_fee: 120,
    driver_fee: 180,
    description: 'Executive van with conference seating — ideal for group transfers and corporate events.',
    features: ['Conference Table', 'Captain Seats', 'Partition', 'Burmester Audio', 'Ambient Lighting', 'Privacy Glass'],
    photo_url: 'https://images.unsplash.com/photo-1570294646112-27ce4f174e47?w=800&q=80',
    available: true,
    available_for_hourly: false,
    internal_name: 'MB-VCLASS',
    created_at: '2024-01-05T00:00:00Z',
  },
  {
    id: 6,
    brand: 'Mercedes-Benz',
    model: 'S-Class',
    year: 2024,
    category: 'sedan',
    capacity: 4,
    price_per_km: 4.50,
    price_per_day: 480,
    base_fee: 85,
    driver_fee: 160,
    description: 'The pinnacle of Mercedes luxury — S580 with massage seats, ambient lighting, and Burmester...',
    features: ['Massage Seats', 'Panoramic Roof', 'Burmester Audio', 'MBUX Hyperscreen', 'Air Balance', 'E-Active Body'],
    photo_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    available: true,
    available_for_hourly: true,
    internal_name: 'MB-S580',
    created_at: '2024-01-06T00:00:00Z',
  },
];

const sampleDrivers: Driver[] = [
  {
    id: 1,
    name: 'James Richardson',
    phone: '+1 555-0101',
    email: 'james.r@elitechauffeur.com',
    rating: 4.9,
    experience: 12,
    languages: 'English, French, Spanish',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    daily_rate: 350,
    available: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Michael Chen',
    phone: '+1 555-0102',
    email: 'michael.c@elitechauffeur.com',
    rating: 4.8,
    experience: 8,
    languages: 'English, Mandarin, Cantonese',
    photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    daily_rate: 320,
    available: true,
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    name: 'David Williams',
    phone: '+1 555-0103',
    email: 'david.w@elitechauffeur.com',
    rating: 4.95,
    experience: 15,
    languages: 'English, German, Italian',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    daily_rate: 400,
    available: false,
    created_at: '2024-01-03T00:00:00Z',
  },
];

const sampleReservations: Reservation[] = [
  {
    id: 1,
    customer_name: 'Alexandra Thompson',
    customer_email: 'alexandra.t@email.com',
    customer_phone: '+1 555-1001',
    pickup_location: 'JFK International Airport, Terminal 4',
    dropoff_location: 'The Plaza Hotel, Fifth Avenue, New York',
    pickup_date: '2024-12-15',
    pickup_time: '14:30',
    booking_type: 'transfer',
    distance_km: 35,
    car_id: 1,
    driver_id: 1,
    with_driver: true,
    driver_fee: 150,
    total_price: 347.50,
    notes: 'Flight arrives at 14:00. Please have a name sign ready.',
    status: 'confirmed',
    created_at: '2024-12-10T10:00:00Z',
  },
  {
    id: 2,
    customer_name: 'Robert Chen',
    customer_email: 'r.chen@business.com',
    customer_phone: '+1 555-1002',
    pickup_location: 'Four Seasons Hotel, 57 E 57th St',
    dropoff_location: 'Newark Liberty International Airport',
    pickup_date: '2024-12-16',
    pickup_time: '06:00',
    booking_type: 'transfer',
    distance_km: 45,
    car_id: 2,
    driver_id: 2,
    with_driver: true,
    driver_fee: 200,
    total_price: 710,
    notes: 'Early morning pickup. Business travel.',
    status: 'pending',
    created_at: '2024-12-11T15:30:00Z',
  },
  {
    id: 3,
    customer_name: 'Victoria Sterling',
    customer_email: 'v.sterling@luxury.com',
    customer_phone: '+1 555-1003',
    pickup_location: 'The Ritz-Carlton, Central Park',
    dropoff_location: 'Metropolitan Opera House',
    pickup_date: '2024-12-14',
    pickup_time: '18:30',
    booking_type: 'transfer',
    distance_km: 8,
    car_id: 4,
    driver_id: 3,
    with_driver: true,
    driver_fee: 400,
    total_price: 870,
    notes: 'Opera evening. Return trip required.',
    status: 'completed',
    created_at: '2024-12-08T09:00:00Z',
  },
  {
    id: 4,
    customer_name: 'James Whitmore',
    customer_email: 'j.whitmore@corp.com',
    customer_phone: '+1 555-1004',
    pickup_location: 'Wall Street, Financial District',
    dropoff_location: 'LaGuardia Airport',
    pickup_date: '2024-12-17',
    pickup_time: '16:00',
    booking_type: 'transfer',
    distance_km: 20,
    car_id: 3,
    driver_id: 1,
    with_driver: true,
    driver_fee: 175,
    total_price: 385,
    notes: 'Corporate account. Invoice required.',
    status: 'in_progress',
    created_at: '2024-12-12T11:00:00Z',
  },
  {
    id: 5,
    customer_name: 'Emily Davis',
    customer_email: 'emily.d@email.com',
    customer_phone: '+1 555-1005',
    pickup_location: 'Brooklyn Bridge Park',
    dropoff_location: 'Times Square',
    pickup_date: '2024-12-13',
    pickup_time: '20:00',
    booking_type: 'daily',
    return_date: '2024-12-15',
    return_time: '18:00',
    rental_days: 2,
    distance_km: 12,
    car_id: 1,
    driver_id: null,
    with_driver: false,
    driver_fee: 0,
    total_price: 125.40,
    notes: '',
    status: 'cancelled',
    created_at: '2024-12-09T14:00:00Z',
  },
];

const samplePricing: PricingTier[] = [
  { id: 1, name: 'Economy Sedan', category: 'sedan', price_per_km: 2.50, base_fee: 50, active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Executive Sedan', category: 'sedan', price_per_km: 4.50, base_fee: 85, active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 3, name: 'Luxury SUV', category: 'suv', price_per_km: 5.50, base_fee: 100, active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 4, name: 'Ultra Luxury', category: 'limousine', price_per_km: 15.00, base_fee: 350, active: true, created_at: '2024-01-01T00:00:00Z' },
];

const sampleServices: Service[] = [
  {
    id: 1,
    title: 'Airport Transfers',
    description: 'Seamless airport pickups and drop-offs with flight tracking. Our chauffeurs monitor your flight status to ensure timely arrivals and departures.',
    icon: 'Plane',
    image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
    sort_order: 1,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Corporate Travel',
    description: 'Professional transportation solutions for business executives. Reliable, punctual, and discreet service for all your corporate needs.',
    icon: 'Building2',
    image_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80',
    sort_order: 2,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    title: 'Special Events',
    description: 'Make your special occasions unforgettable with our premium fleet. Weddings, galas, premieres, and milestone celebrations.',
    icon: 'PartyPopper',
    image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    sort_order: 3,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 4,
    title: 'Hourly Charter',
    description: 'Flexible hourly bookings for city tours, shopping excursions, or multiple stops. Your vehicle and chauffeur at your disposal.',
    icon: 'Clock',
    image_url: 'https://images.unsplash.com/photo-1449965408869-ebd3fee56f67?w=800&q=80',
    sort_order: 4,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 5,
    title: 'Long Distance',
    description: 'Comfortable intercity travel for those who prefer luxury over conventional transportation. Arrive refreshed and ready.',
    icon: 'Route',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
    sort_order: 5,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

const sampleTermsSections: TermsSection[] = [
  {
    id: 1,
    title: 'Booking and Reservations',
    content: 'All reservations must be made at least 24 hours in advance. For airport transfers, we recommend booking 48 hours ahead. Bookings can be made through our website, mobile app, or by contacting our concierge service directly. A valid credit card is required to secure your reservation.',
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Cancellation Policy',
    content: 'Cancellations made more than 24 hours before the scheduled pickup time are eligible for a full refund. Cancellations within 24 hours will incur a 50% charge. No-shows will be charged the full amount. Special event bookings may have different cancellation terms.',
    sort_order: 2,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    title: 'Payment Terms',
    content: 'We accept all major credit cards, corporate accounts, and bank transfers for corporate clients. Payment is due upon completion of service unless prior arrangements have been made. Gratuity is not included and is at the discretion of the client.',
    sort_order: 3,
    created_at: '2024-01-01T00:00:00Z',
  },
];

const defaultSettings: SiteSettings = {
  siteName: 'Elite Chauffeur',
  tagline: 'Luxury Black Car Service',
  // Homepage content
  heroTitle1: 'Uncompromising',
  heroTitle2: 'Elegance',
  heroSubtitle: 'Experience the pinnacle of luxury transportation. Our fleet of meticulously maintained vehicles and professional chauffeurs ensure every journey is extraordinary.',
  heroButtonText1: 'Explore Our Fleet',
  heroButtonText2: 'Our Services',
  featuresTitle: 'THE ELITE STANDARD',
  fleetTitle: 'OUR FLEET',
  ctaTitle: 'Experience Luxury',
  ctaSubtitle: 'Ready to elevate your journey? Book your premium ride today.',
  // Contact
  contactPhone: '+1 (888) 555-0100',
  contactEmail: 'concierge@elitechauffeur.com',
  contactAddress: '500 Fifth Avenue, Suite 2400, New York, NY 10110',
  contactHours: '24/7 Concierge Service',
  // Currency
  currencySymbol: 'MAD ',
  currencyPos: 'before',
  currencyCode: 'MAD',
  showChauffeurService: true,
  // Theme
  themeAccentColor: '#ffffff',
  themeBgColor: '#0d0d0d',
  themeFontBody: 'Inter',
  themeFontHeading: 'Cormorant Garamond',
  // Branding
  websiteLogoUrl: '',
  invoiceLogoUrl: '',
  heroImageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920&q=80',
  // Integrations
  googleMapsApiKey: '',
};

interface StoreState {
  // Data
  cars: Car[];
  drivers: Driver[];
  reservations: Reservation[];
  pricing: PricingTier[];
  services: Service[];
  termsSections: TermsSection[];
  users: User[];
  settings: SiteSettings;
  
  // Auth
  isAuthenticated: boolean;
  currentUser: User | null;
  
  // Actions - Cars
  addCar: (car: Omit<Car, 'id' | 'created_at'>) => void;
  updateCar: (id: number, car: Partial<Car>) => void;
  deleteCar: (id: number) => void;
  
  // Actions - Drivers
  addDriver: (driver: Omit<Driver, 'id' | 'created_at'>) => void;
  updateDriver: (id: number, driver: Partial<Driver>) => void;
  deleteDriver: (id: number) => void;
  
  // Actions - Reservations
  addReservation: (reservation: Omit<Reservation, 'id' | 'created_at'>) => void;
  updateReservation: (id: number, reservation: Partial<Reservation>) => void;
  deleteReservation: (id: number) => void;
  
  // Actions - Pricing
  addPricingTier: (tier: Omit<PricingTier, 'id' | 'created_at'>) => void;
  updatePricingTier: (id: number, tier: Partial<PricingTier>) => void;
  deletePricingTier: (id: number) => void;
  
  // Actions - Services
  addService: (service: Omit<Service, 'id' | 'created_at'>) => void;
  updateService: (id: number, service: Partial<Service>) => void;
  deleteService: (id: number) => void;
  
  // Actions - Terms
  addTermsSection: (section: Omit<TermsSection, 'id' | 'created_at'>) => void;
  updateTermsSection: (id: number, section: Partial<TermsSection>) => void;
  deleteTermsSection: (id: number) => void;
  
  // Actions - Users
  addUser: (user: Omit<User, 'id' | 'created_at'>) => void;
  updateUser: (id: number, user: Partial<User>) => void;
  deleteUser: (id: number) => void;
  
  // Actions - Settings
  updateSettings: (settings: Partial<SiteSettings>) => void;
  
  // Actions - Auth
  login: (email: string, password: string) => boolean;
  loginWithMasterPassword: (password: string) => boolean;
  logout: () => void;
}

const defaultUser: User = {
  id: 1,
  name: 'Super Admin',
  email: 'admin@elitechauffeur.com',
  role: 'super_admin',
  active: true,
  created_at: '2024-01-01T00:00:00Z',
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial data
      cars: sampleCars,
      drivers: sampleDrivers,
      reservations: sampleReservations,
      pricing: samplePricing,
      services: sampleServices,
      termsSections: sampleTermsSections,
      users: [defaultUser],
      settings: defaultSettings,
      isAuthenticated: false,
      currentUser: null,
      
      // Cars
      addCar: (car) => set((state) => ({
        cars: [...state.cars, { ...car, id: Math.max(0, ...state.cars.map(c => c.id)) + 1, created_at: new Date().toISOString() }]
      })),
      updateCar: (id, car) => set((state) => ({
        cars: state.cars.map(c => c.id === id ? { ...c, ...car } : c)
      })),
      deleteCar: (id) => set((state) => ({
        cars: state.cars.filter(c => c.id !== id)
      })),
      
      // Drivers
      addDriver: (driver) => set((state) => ({
        drivers: [...state.drivers, { ...driver, id: Math.max(0, ...state.drivers.map(d => d.id)) + 1, created_at: new Date().toISOString() }]
      })),
      updateDriver: (id, driver) => set((state) => ({
        drivers: state.drivers.map(d => d.id === id ? { ...d, ...driver } : d)
      })),
      deleteDriver: (id) => set((state) => ({
        drivers: state.drivers.filter(d => d.id !== id)
      })),
      
      // Reservations
      addReservation: (reservation) => set((state) => ({
        reservations: [...state.reservations, { ...reservation, id: Math.max(0, ...state.reservations.map(r => r.id)) + 1, created_at: new Date().toISOString() }]
      })),
      updateReservation: (id, reservation) => set((state) => ({
        reservations: state.reservations.map(r => r.id === id ? { ...r, ...reservation } : r)
      })),
      deleteReservation: (id) => set((state) => ({
        reservations: state.reservations.filter(r => r.id !== id)
      })),
      
      // Pricing
      addPricingTier: (tier) => set((state) => ({
        pricing: [...state.pricing, { ...tier, id: Math.max(0, ...state.pricing.map(p => p.id)) + 1, created_at: new Date().toISOString() }]
      })),
      updatePricingTier: (id, tier) => set((state) => ({
        pricing: state.pricing.map(p => p.id === id ? { ...p, ...tier } : p)
      })),
      deletePricingTier: (id) => set((state) => ({
        pricing: state.pricing.filter(p => p.id !== id)
      })),
      
      // Services
      addService: (service) => set((state) => ({
        services: [...state.services, { ...service, id: Math.max(0, ...state.services.map(s => s.id)) + 1, created_at: new Date().toISOString() }]
      })),
      updateService: (id, service) => set((state) => ({
        services: state.services.map(s => s.id === id ? { ...s, ...service } : s)
      })),
      deleteService: (id) => set((state) => ({
        services: state.services.filter(s => s.id !== id)
      })),
      
      // Terms
      addTermsSection: (section) => set((state) => ({
        termsSections: [...state.termsSections, { ...section, id: Math.max(0, ...state.termsSections.map(t => t.id)) + 1, created_at: new Date().toISOString() }]
      })),
      updateTermsSection: (id, section) => set((state) => ({
        termsSections: state.termsSections.map(t => t.id === id ? { ...t, ...section } : t)
      })),
      deleteTermsSection: (id) => set((state) => ({
        termsSections: state.termsSections.filter(t => t.id !== id)
      })),
      
      // Users
      addUser: (user) => set((state) => ({
        users: [...state.users, { ...user, id: Math.max(0, ...state.users.map(u => u.id)) + 1, created_at: new Date().toISOString() }]
      })),
      updateUser: (id, user) => set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, ...user } : u)
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id)
      })),
      
      // Settings
      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),
      
      // Auth
      login: (email, password) => {
        const user = get().users.find(u => u.email === email && u.active);
        // In real app, would check hashed password
        if (user && password === 'admin123') {
          set({ isAuthenticated: true, currentUser: user });
          return true;
        }
        return false;
      },
      loginWithMasterPassword: (password) => {
        if (password === 'admin123') {
          set({ isAuthenticated: true, currentUser: { ...defaultUser, name: 'Master Admin' } });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false, currentUser: null }),
    }),
    {
      name: 'elite-chauffeur-storage',
    }
  )
);

// Helper function to format price
export function formatPrice(amount: number | undefined | null, settings: SiteSettings): string {
  const safeAmount = amount ?? 0;
  const formatted = safeAmount.toFixed(2);
  return settings.currencyPos === 'before' 
    ? `${settings.currencySymbol}${formatted}`
    : `${formatted}${settings.currencySymbol}`;
}

// Helper function to calculate total price
export function calculateTotalPrice(
  car: Car, 
  distanceKm: number, 
  withDriver: boolean,
  bookingType: 'transfer' | 'daily' = 'transfer',
  rentalDays: number = 1,
  showChauffeurService: boolean = true
): number {
  let total = 0;
  
  if (bookingType === 'transfer') {
    // Transfer: base fee + (km × price per km) + driver fee
    total = (car.base_fee || 0) + (distanceKm * (car.price_per_km || 0));
  } else {
    // Daily rental: price per day × number of days (fallback to base_fee * 3 if price_per_day not set)
    const dailyRate = car.price_per_day || (car.base_fee * 3) || 0;
    total = dailyRate * rentalDays;
  }
  
  // Only add driver fee if chauffeur service is enabled in settings
  if (withDriver && showChauffeurService) {
    total += car.driver_fee;
  }
  
  return total;
}

// Calculate rental days between two dates
export function calculateRentalDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}
