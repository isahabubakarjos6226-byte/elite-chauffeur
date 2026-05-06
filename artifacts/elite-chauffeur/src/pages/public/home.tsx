import BookingForm from "@/components/booking-form";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Shield, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/site-settings";

export default function Home() {
  const { t } = useI18n();
  const {
    heroImageUrl,
    heroOverlayOpacity,
    heroBlackWhite,
    heroTitle,
    heroSubtitle,
  } = useSiteSettings();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">

        {/* Background layer — separate so filter doesn't affect text */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
            style={{
              backgroundImage: heroImageUrl
                ? `url('${heroImageUrl}')`
                : "url('/hero.png')",
              backgroundColor: "#0a1628",
              filter: heroBlackWhite ? "grayscale(1)" : "none",
            }}
          />
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: heroImageUrl
                ? `rgba(0,0,0,${heroOverlayOpacity})`
                : "rgba(0,0,0,0)",
            }}
          />
          {/* Default gradient when no custom image */}
          {!heroImageUrl && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
          )}
        </div>

        <div className="container relative z-10 mx-auto px-4 py-12 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 uppercase"
              style={{ fontFamily: "var(--font-heading, var(--font-serif))" }}
            >
              {heroTitle ? (
                heroTitle
              ) : (
                <>{t.hero.tagline} <br/> <span className="text-primary">{t.hero.highlight}</span></>
              )}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              {heroSubtitle || t.hero.subline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/fleet">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-primary/50 hover:bg-primary/10">
                  {t.hero.exploreFleet}
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="ghost" className="h-12 px-8 text-base">
                  {t.hero.ourServices} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full max-w-md lg:w-[450px] shrink-0">
            <BookingForm />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2
              className="text-3xl font-bold uppercase tracking-widest text-primary mb-4"
              style={{ fontFamily: "var(--font-heading, var(--font-serif))" }}
            >
              {t.features.sectionTitle}
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t.features.sectionSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.features.fleet.title}</h3>
              <p className="text-muted-foreground">{t.features.fleet.desc}</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.features.discreet.title}</h3>
              <p className="text-muted-foreground">{t.features.discreet.desc}</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.features.punctual.title}</h3>
              <p className="text-muted-foreground">{t.features.punctual.desc}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
