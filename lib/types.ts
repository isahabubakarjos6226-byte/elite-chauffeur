export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  category: 'sedan' | 'suv' | 'van' | 'limousine' | 'electric' | 'sports';
  capacity: number;
  price_per_km: number;
  price_per_day: number;
  base_fee: number;
  driver_fee: number;
  description: string;
  features: string[];
  photo_url: string;
  available: boolean;
  available_for_hourly: boolean;
  internal_name: string;
  created_at: string;
}

export interface Driver {
  id: number;
  name: string;
  phone: string;
  email: string;
  rating: number;
  experience: number;
  languages: string;
  photo_url: string;
  daily_rate: number;
  available: boolean;
  created_at: string;
}

export interface Reservation {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  pickup_time: string;
  // For daily rentals
  return_date?: string;
  return_time?: string;
  booking_type: 'transfer' | 'daily';
  rental_days?: number;
  distance_km: number;
  car_id: number;
  driver_id: number | null;
  with_driver: boolean;
  driver_fee: number;
  total_price: number;
  notes: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  car?: Car;
  driver?: Driver;
}

export interface PricingTier {
  id: number;
  name: string;
  category: string;
  price_per_km: number;
  base_fee: number;
  active: boolean;
  created_at: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  image_url: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface TermsSection {
  id: number;
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  active: boolean;
  created_at: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  // Homepage content
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  heroButtonText1: string;
  heroButtonText2: string;
  featuresTitle: string;
  fleetTitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  // Contact
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  contactHours: string;
  // Currency
  currencySymbol: string;
  currencyPos: 'before' | 'after';
  currencyCode: string;
  showChauffeurService: boolean;
  // Theme
  themeAccentColor: string;
  themeBgColor: string;
  themeFontBody: string;
  themeFontHeading: string;
  // Branding
  websiteLogoUrl: string;
  invoiceLogoUrl: string;
  heroImageUrl: string;
  // Integrations
  googleMapsApiKey: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  fleetTotal: number;
  fleetAvailable: number;
  driversTotal: number;
  driversAvailable: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}
