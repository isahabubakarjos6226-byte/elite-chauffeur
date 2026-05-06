'use client';

import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { HeroSection } from '@/components/public/HeroSection';
import { FeaturesSection } from '@/components/public/FeaturesSection';
import { FleetPreview } from '@/components/public/FleetPreview';
import { CTASection } from '@/components/public/CTASection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <PublicNavbar />
      <HeroSection />
      <FeaturesSection />
      <FleetPreview />
      <CTASection />
      <PublicFooter />
    </main>
  );
}
