'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, Check } from 'lucide-react';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { useStore } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';

export default function ContactPage() {
  const settings = useStore((state) => state.settings);
  const { t, dir } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen">
      <PublicNavbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-5xl sm:text-6xl text-foreground mb-6">
            {t.contact.title}
          </h1>
          <div className="w-16 h-0.5 bg-foreground mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.contact.subtitle}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn(
            "grid lg:grid-cols-2 gap-16",
            dir === 'rtl' && 'lg:grid-flow-dense'
          )}>
            {/* Contact Form */}
            <div className={cn(dir === 'rtl' && 'text-right lg:col-start-2')}>
              <h2 className="font-serif text-3xl text-foreground mb-8">
                {t.contact.getInTouch}
              </h2>

              {submitted ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check size={32} className="text-green-500" />
                  </div>
                  <h3 className="font-serif text-2xl text-foreground mb-2">
                    {t.common.success}!
                  </h3>
                  <p className="text-muted-foreground">
                    Thank you for reaching out.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      {t.contact.name}
                    </label>
                    <input
                      type="text"
                      placeholder={t.contact.yourName}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={cn(
                        "w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors",
                        dir === 'rtl' && 'text-right'
                      )}
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        {t.contact.email}
                      </label>
                      <input
                        type="email"
                        placeholder={t.contact.yourEmail}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={cn(
                          "w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors",
                          dir === 'rtl' && 'text-right'
                        )}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        {t.contact.phone}
                      </label>
                      <input
                        type="tel"
                        placeholder={t.contact.yourPhone}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={cn(
                          "w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors",
                          dir === 'rtl' && 'text-right'
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      {t.contact.message}
                    </label>
                    <textarea
                      placeholder={t.contact.yourMessage}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={cn(
                        "w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors min-h-[150px]",
                        dir === 'rtl' && 'text-right'
                      )}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className={cn(
                      "inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-medium rounded-lg transition-all hover:bg-foreground/90",
                      dir === 'rtl' && 'flex-row-reverse'
                    )}
                  >
                    <Send size={18} />
                    {t.contact.sendMessage}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className={cn(dir === 'rtl' && 'text-right lg:col-start-1')}>
              <h2 className="font-serif text-3xl text-foreground mb-8">
                {t.contact.contactInfo}
              </h2>

              <div className="space-y-6 mb-12">
                <div className={cn(
                  "flex items-start gap-4 p-6 bg-card border border-border rounded-xl",
                  dir === 'rtl' && 'flex-row-reverse'
                )}>
                  <div className="w-12 h-12 rounded-lg bg-foreground/10 flex items-center justify-center flex-shrink-0">
                    <Phone size={24} className="text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{t.contact.phoneLabel}</h3>
                    <a 
                      href={`tel:${settings.contactPhone}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {settings.contactPhone}
                    </a>
                  </div>
                </div>

                <div className={cn(
                  "flex items-start gap-4 p-6 bg-card border border-border rounded-xl",
                  dir === 'rtl' && 'flex-row-reverse'
                )}>
                  <div className="w-12 h-12 rounded-lg bg-foreground/10 flex items-center justify-center flex-shrink-0">
                    <Mail size={24} className="text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{t.contact.emailLabel}</h3>
                    <a 
                      href={`mailto:${settings.contactEmail}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {settings.contactEmail}
                    </a>
                  </div>
                </div>

                <div className={cn(
                  "flex items-start gap-4 p-6 bg-card border border-border rounded-xl",
                  dir === 'rtl' && 'flex-row-reverse'
                )}>
                  <div className="w-12 h-12 rounded-lg bg-foreground/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={24} className="text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{t.contact.addressLabel}</h3>
                    <p className="text-muted-foreground">
                      {settings.contactAddress}
                    </p>
                  </div>
                </div>

                <div className={cn(
                  "flex items-start gap-4 p-6 bg-card border border-border rounded-xl",
                  dir === 'rtl' && 'flex-row-reverse'
                )}>
                  <div className="w-12 h-12 rounded-lg bg-foreground/10 flex items-center justify-center flex-shrink-0">
                    <Clock size={24} className="text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{t.contact.hoursLabel}</h3>
                    <p className="text-muted-foreground">
                      {settings.contactHours}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="p-8 bg-card border border-foreground/30 rounded-xl">
                <blockquote className="font-serif text-xl text-foreground italic mb-4">
                  {t.contact.brandQuote}
                </blockquote>
                <p className="text-foreground/60 text-sm uppercase tracking-wider">
                  — The Elite Chauffeur Promise
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
