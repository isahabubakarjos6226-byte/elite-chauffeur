import { useState } from "react";
import { useListCars } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Users, Clock, ArrowRightLeft, Eye } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/site-settings";

type FleetTab = "all" | "transfer" | "hourly";

export default function Fleet() {
  const { t } = useI18n();
  const { formatPrice } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<FleetTab>("all");

  const { data: allCars, isLoading } = useListCars({ available: true });

  const cars = allCars?.filter(car => {
    const c = car as typeof car & { availableForHourly?: boolean };
    if (activeTab === "hourly") return c.availableForHourly === true;
    if (activeTab === "transfer") return !c.availableForHourly;
    return true;
  });

  const tabs: { key: FleetTab; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: t.fleet.allVehicles, icon: <Users className="w-4 h-4" /> },
    { key: "transfer", label: t.fleet.transferOnly, icon: <ArrowRightLeft className="w-4 h-4" /> },
    { key: "hourly", label: t.fleet.hourlyCharter, icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background pt-16 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest text-primary mb-4" style={{ fontFamily: "var(--font-serif)" }}>{t.fleet.title}</h1>
          <div className="w-24 h-1 bg-primary mx-auto mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t.fleet.subtitle}</p>
        </div>

        {/* Fleet tabs */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-card border border-border rounded-lg p-1 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden border-border bg-card">
                <Skeleton className="h-64 w-full rounded-none" />
                <CardHeader>
                  <Skeleton className="h-8 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-4/5" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : cars?.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            {t.fleet.noVehicles}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars?.map((car) => {
              const extCar = car as typeof car & { availableForHourly?: boolean };
              const heroImage = car.imageUrl
                || (car.brand.toLowerCase().includes("rover") ? "/car-range-rover.png" : "/car-s-class.png");

              return (
                <Card key={car.id} className="overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 group shadow-lg flex flex-col">
                  {/* Photo */}
                  <div className="relative h-64 overflow-hidden bg-secondary">
                    <img
                      src={heroImage}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Overlay on hover */}
                    <Link href={`/cars/${car.id}`}>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                          <Eye className="w-4 h-4" /> View Details
                        </span>
                      </div>
                    </Link>
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur text-foreground border-none">
                        {car.year}
                      </Badge>
                      {extCar.availableForHourly && (
                        <Badge className="bg-primary/90 text-primary-foreground text-[10px] uppercase tracking-wider border-none flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t.fleet.hourlyCharter}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl font-bold font-serif">{car.brand}</CardTitle>
                        <CardDescription className="text-lg text-primary">{car.model}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatPrice(car.pricePerKm)}</div>
                        <div className="text-xs text-muted-foreground">{t.fleet.perKm}</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                      {car.description || `The ${car.brand} ${car.model} offers an unparalleled luxury experience.`}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {car.features.slice(0, 3).map((feature, i) => (
                        <Badge key={i} variant="outline" className="bg-secondary text-secondary-foreground border-border text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {car.features.length > 3 && (
                        <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border text-xs">
                          +{car.features.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground border-t border-border pt-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{t.fleet.upTo} {car.capacity}</span>
                      </div>
                      {extCar.availableForHourly ? (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{t.fleet.hourlyCharter}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ArrowRightLeft className="w-4 h-4 text-primary" />
                          <span>{t.fleet.transferOnly}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="gap-3 pt-0">
                    <Link href={`/cars/${car.id}`} className="flex-1">
                      <Button variant="outline" className="w-full h-11 text-xs uppercase tracking-wider border-primary/40 hover:bg-primary/10">
                        <Eye className="mr-2 w-3.5 h-3.5" /> View Details
                      </Button>
                    </Link>
                    <Link href={`/book?car=${car.id}`} className="flex-1">
                      <Button className="w-full h-11 uppercase tracking-wider text-xs">
                        {t.fleet.reserveNow}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
