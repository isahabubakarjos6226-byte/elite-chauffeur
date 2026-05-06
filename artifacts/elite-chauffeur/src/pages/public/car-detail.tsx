import { useParams, Link } from "wouter";
import { useGetCar } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Users, Clock, ArrowRightLeft, Star, CheckCircle2,
  CalendarDays, Fuel, Gauge, Shield, Wifi, Car
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/site-settings";

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  "Wi-Fi": <Wifi className="w-4 h-4" />,
  "WiFi": <Wifi className="w-4 h-4" />,
  "GPS": <Gauge className="w-4 h-4" />,
  "Shield": <Shield className="w-4 h-4" />,
  "Insurance": <Shield className="w-4 h-4" />,
};

function FeatureIcon({ name }: { name: string }) {
  return FEATURE_ICONS[name] ?? <CheckCircle2 className="w-4 h-4" />;
}

function getCategoryLabel(category: string, t: ReturnType<typeof useI18n>["t"]) {
  if (category === "with_driver") return t.admin.cars.withDriver;
  if (category === "without_driver") return t.admin.cars.withoutDriver;
  return t.admin.cars.both;
}

export default function CarDetail() {
  const params = useParams<{ id: string }>();
  const carId = parseInt(params.id ?? "0");
  const { data: car, isLoading, error } = useGetCar(carId);
  const { t } = useI18n();
  const { formatPrice } = useSiteSettings();

  const extCar = car as typeof car & { availableForHourly?: boolean } | undefined;

  const heroImage = car?.imageUrl
    || (car?.brand?.toLowerCase().includes("rover") ? "/car-range-rover.png" : "/car-s-class.png");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-[50vh] w-full rounded-none" />
        <div className="container mx-auto px-4 py-12 max-w-6xl grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          </div>
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <Car className="w-16 h-16 text-muted-foreground opacity-30" />
        <p className="text-xl text-muted-foreground">Vehicle not found.</p>
        <Link href="/fleet">
          <Button variant="outline"><ArrowLeft className="mr-2 w-4 h-4" /> Back to Fleet</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="relative h-[55vh] min-h-[380px] overflow-hidden">
        <img
          src={heroImage}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Back button */}
        <div className="absolute top-6 left-6">
          <Link href="/fleet">
            <Button variant="outline" size="sm" className="bg-black/40 border-white/20 text-white hover:bg-black/60 backdrop-blur-sm">
              <ArrowLeft className="mr-2 w-4 h-4" /> {t.fleet.title}
            </Button>
          </Link>
        </div>

        {/* Badges */}
        <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
          <Badge className="bg-background/80 backdrop-blur text-foreground border-none text-sm px-3 py-1">
            {car.year}
          </Badge>
          {extCar?.availableForHourly && (
            <Badge className="bg-primary/90 text-primary-foreground flex items-center gap-1 px-3">
              <Clock className="w-3 h-3" /> {t.fleet.hourlyCharter}
            </Badge>
          )}
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto max-w-6xl">
            <p className="text-white/60 text-sm uppercase tracking-widest mb-1 font-medium">{car.year} · {getCategoryLabel(car.category, t)}</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-serif">
              {car.brand} <span className="text-primary">{car.model}</span>
            </h1>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Left: specs + features ──────────────────── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 text-center">
                <Users className="w-6 h-6 text-primary" />
                <p className="text-2xl font-bold">{car.capacity}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Passengers</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 text-center">
                <CalendarDays className="w-6 h-6 text-primary" />
                <p className="text-2xl font-bold">{car.year}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Year</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 text-center">
                {extCar?.availableForHourly
                  ? <Clock className="w-6 h-6 text-primary" />
                  : <ArrowRightLeft className="w-6 h-6 text-primary" />}
                <p className="text-sm font-bold leading-tight">
                  {extCar?.availableForHourly ? t.fleet.hourlyCharter : t.fleet.transferOnly}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Service</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 text-center">
                <Star className="w-6 h-6 text-primary" />
                <p className="text-sm font-bold leading-tight">{getCategoryLabel(car.category, t)}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Category</p>
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div>
                <h2 className="text-xl font-bold mb-3 text-primary uppercase tracking-wider text-sm">About this vehicle</h2>
                <div className="w-12 h-0.5 bg-primary mb-4" />
                <p className="text-muted-foreground leading-relaxed text-base">{car.description}</p>
              </div>
            )}

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div>
                <h2 className="text-sm font-bold mb-3 text-primary uppercase tracking-wider">Features & Amenities</h2>
                <div className="w-12 h-0.5 bg-primary mb-5" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {car.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
                      <span className="text-primary shrink-0">
                        <FeatureIcon name={feature} />
                      </span>
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Internal name */}
            <div className="text-xs text-muted-foreground border-t border-border pt-4">
              Vehicle ID: {car.id} · Reference: {car.name}
            </div>
          </div>

          {/* ── Right: pricing card + CTA ────────────────── */}
          <div className="space-y-6">

            {/* Sticky pricing card */}
            <div className="sticky top-24">
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-primary/10 border-b border-primary/20 px-6 py-5">
                  <p className="text-xs uppercase tracking-widest text-primary mb-1 font-medium">Starting from</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-primary">{formatPrice(car.baseFee)}</span>
                    <span className="text-muted-foreground mb-1 text-sm">base fee</span>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                  {/* Rate breakdown */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base fee</span>
                      <span className="font-medium">{formatPrice(car.baseFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Per kilometre</span>
                      <span className="font-medium">{formatPrice(car.pricePerKm)}/km</span>
                    </div>
                    {car.driverFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Chauffeur fee</span>
                        <span className="font-medium">{formatPrice(car.driverFee)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                    Final price calculated at checkout based on distance.
                  </div>

                  {/* Capacity + service type */}
                  <div className="flex gap-3">
                    <div className="flex-1 flex items-center gap-2 bg-secondary/40 rounded-lg px-3 py-2">
                      <Users className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm">{t.fleet.upTo} {car.capacity}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2 bg-secondary/40 rounded-lg px-3 py-2">
                      {extCar?.availableForHourly
                        ? <Clock className="w-4 h-4 text-primary shrink-0" />
                        : <ArrowRightLeft className="w-4 h-4 text-primary shrink-0" />}
                      <span className="text-xs">{extCar?.availableForHourly ? t.fleet.hourlyCharter : t.fleet.transferOnly}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href={`/book?car=${car.id}`} className="block">
                    <Button className="w-full h-12 uppercase tracking-widest text-sm font-bold">
                      {t.fleet.reserveNow}
                    </Button>
                  </Link>
                  <Link href="/contact" className="block">
                    <Button variant="outline" className="w-full h-10 text-xs border-primary/30 hover:bg-primary/10">
                      Contact Concierge
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: <Shield className="w-4 h-4" />, label: "Insured" },
                  { icon: <CheckCircle2 className="w-4 h-4" />, label: "Verified" },
                  { icon: <Star className="w-4 h-4" />, label: "5-Star" },
                ].map(({ icon, label }) => (
                  <div key={label} className="bg-card border border-border rounded-lg py-2.5 flex flex-col items-center gap-1">
                    <span className="text-primary">{icon}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
