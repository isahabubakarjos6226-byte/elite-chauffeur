'use client';

import { Star, Shield, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useStore } from '@/lib/store';

export function FeaturesSection() {
  const { t, dir } = useLanguage();
  const settings = useStore((state) => state.settings);

  const features = [
    {
      icon: Star,
      title: t.features.impeccableFleet,
      description: t.features.impeccableFleetDesc,
    },
    {
      icon: Shield,
      title: t.features.discreetSecure,
      description: t.features.discreetSecureDesc,
    },
    {
      icon: Clock,
      title: t.features.absolutePunctuality,
      description: t.features.absolutePunctualityDesc,
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl text-foreground mb-4 tracking-tight">
            {settings.featuresTitle || t.features.title}
          </h2>
          <div className="w-16 h-0.5 bg-foreground mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className={`text-center ${dir === 'rtl' ? 'rtl' : ''}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-border mb-6">
                  <Icon size={24} className="text-foreground" strokeWidth={1.5} />
                </div>
                <h3 className="text-foreground text-xl font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
