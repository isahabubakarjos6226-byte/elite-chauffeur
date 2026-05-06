import { useEffect, useState } from "react";
import { Plane, Building2, CalendarDays, Clock, Car, MapPin, Shield, Star, Users, Briefcase, GlassWater, Music, LucideIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";

interface Service {
  id: number;
  title: string;
  description: string;
  iconName: string;
  imageUrl: string | null;
  sortOrder: number;
  active: boolean;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Plane, Building2, CalendarDays, Clock, Car, MapPin, Shield, Star, Users, Briefcase, GlassWater, Music,
};

const DEFAULT_IMAGES = ["/car-s-class.png", "/car-range-rover.png"];

function ServiceIcon({ name, className = "h-8 w-8" }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Star;
  return <Icon className={className} />;
}

export default function Services() {
  const { t } = useI18n();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then(r => r.json())
      .then((data: Service[]) => { setServices(data.filter(s => s.active)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Fall back to hardcoded services from i18n if DB is empty
  const hardcodedServices = [
    { key: "airport" as const, iconName: "Plane",       image: DEFAULT_IMAGES[0] },
    { key: "corporate" as const, iconName: "Building2", image: DEFAULT_IMAGES[1] },
    { key: "events" as const, iconName: "CalendarDays", image: DEFAULT_IMAGES[0] },
    { key: "hourly" as const, iconName: "Clock",        image: DEFAULT_IMAGES[1] },
  ];

  return (
    <div className="w-full">
      <div className="bg-card py-24 border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest text-primary mb-6" style={{ fontFamily: "var(--font-serif)" }}>{t.services.title}</h1>
          <div className="w-24 h-1 bg-primary mx-auto mb-8" />
          <p className="text-xl text-muted-foreground">{t.services.subtitle}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-24">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : services.length > 0 ? (
          /* DB-driven services */
          <div className="space-y-24">
            {services.map((service, index) => (
              <div key={service.id} className={`flex flex-col md:flex-row gap-12 items-center ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="w-full md:w-1/2">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-secondary relative">
                    <img
                      src={service.imageUrl || DEFAULT_IMAGES[index % 2]}
                      alt={service.title}
                      className="w-full h-full object-cover opacity-80"
                      onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGES[index % 2]; }}
                    />
                    <div className="absolute inset-0 border border-primary/20 m-4 rounded" />
                  </div>
                </div>
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <ServiceIcon name={service.iconName} className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold font-serif">{service.title}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">{service.description}</p>
                  <div className="pt-4">
                    <Link href="/book">
                      <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
                        {t.services.reserveService}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Fallback to i18n hardcoded services */
          <div className="space-y-24">
            {hardcodedServices.map(({ key, iconName, image }, index) => {
              const s = t.services[key] as { title: string; desc: string };
              return (
                <div key={key} className={`flex flex-col md:flex-row gap-12 items-center ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="w-full md:w-1/2">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-secondary relative">
                      <img src={image} alt={s.title} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 border border-primary/20 m-4 rounded" />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 space-y-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <ServiceIcon name={iconName} className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold font-serif">{s.title}</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">{s.desc}</p>
                    <div className="pt-4">
                      <Link href="/book">
                        <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
                          {t.services.reserveService}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-primary/10 border-y border-primary/20 py-24 text-center">
        <div className="container mx-auto px-4 max-w-2xl space-y-8">
          <h2 className="text-3xl font-bold font-serif text-primary">{t.services.customTitle}</h2>
          <p className="text-lg text-muted-foreground">{t.services.customDesc}</p>
          <Link href="/contact">
            <Button size="lg" className="px-8 h-14 text-base tracking-widest uppercase">{t.services.contactConcierge}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
