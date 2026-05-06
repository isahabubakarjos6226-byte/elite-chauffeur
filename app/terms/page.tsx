'use client';

import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { useStore } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';

const defaultTerms = [
  {
    id: 1,
    title: 'Booking and Reservations',
    content: 'All reservations must be made at least 24 hours in advance. For airport transfers, we recommend booking 48 hours ahead. Bookings can be made through our website, mobile app, or by contacting our concierge service directly. A valid credit card is required to secure your reservation.',
    sort_order: 1,
  },
  {
    id: 2,
    title: 'Cancellation Policy',
    content: 'Cancellations made more than 24 hours before the scheduled pickup time are eligible for a full refund. Cancellations within 24 hours will incur a 50% charge. No-shows will be charged the full amount. Special event bookings may have different cancellation terms.',
    sort_order: 2,
  },
  {
    id: 3,
    title: 'Payment Terms',
    content: 'We accept all major credit cards, corporate accounts, and bank transfers for corporate clients. Payment is due upon completion of service unless prior arrangements have been made. Gratuity is not included and is at the discretion of the client.',
    sort_order: 3,
  },
  {
    id: 4,
    title: 'Service Standards',
    content: 'Our chauffeurs are professionally trained and maintain the highest standards of service. All vehicles are regularly maintained, cleaned, and inspected. We provide complimentary water, Wi-Fi, and phone chargers in all vehicles.',
    sort_order: 4,
  },
  {
    id: 5,
    title: 'Waiting Time Policy',
    content: 'For airport pickups, we provide 60 minutes of complimentary waiting time after the flight lands. For all other pickups, 15 minutes of waiting time is included. Additional waiting time is charged at the applicable hourly rate.',
    sort_order: 5,
  },
  {
    id: 6,
    title: 'Liability and Insurance',
    content: 'All our vehicles carry comprehensive insurance coverage. Elite Chauffeur is not liable for delays caused by traffic, weather, or other circumstances beyond our control. We recommend allowing adequate time for your journey.',
    sort_order: 6,
  },
  {
    id: 7,
    title: 'Privacy Policy',
    content: 'We respect your privacy and are committed to protecting your personal information. Your data is collected solely for the purpose of providing our services and will never be shared with third parties without your consent.',
    sort_order: 7,
  },
];

export default function TermsPage() {
  const termsSections = useStore((state) => state.termsSections);
  const { t, dir } = useLanguage();
  const sections = termsSections.length > 0 
    ? termsSections.sort((a, b) => a.sort_order - b.sort_order)
    : defaultTerms;

  return (
    <main className="min-h-screen">
      <PublicNavbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-5xl sm:text-6xl text-foreground mb-6">
            {t.terms.title}
          </h1>
          <div className="w-16 h-0.5 bg-foreground mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.terms.subtitle}
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div 
                key={section.id}
                className={cn(
                  "bg-card border border-border rounded-xl p-8",
                  dir === 'rtl' && 'text-right'
                )}
              >
                <div className={cn(
                  "flex items-start gap-4",
                  dir === 'rtl' && 'flex-row-reverse'
                )}>
                  <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                    <span className="text-background font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-foreground mb-4">
                      {section.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm">
              Last updated: January 2024
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Questions about our terms? Contact us at{' '}
              <a href="mailto:legal@elitechauffeur.com" className="text-foreground hover:underline">
                legal@elitechauffeur.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
