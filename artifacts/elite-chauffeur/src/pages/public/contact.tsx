import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { Phone, Mail, Clock, MapPin, CheckCircle2, Loader2 } from "lucide-react";

export default function Contact() {
  const { t } = useI18n();
  const c = t.contact;

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending — in production connect to SMTP or a form service
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
  };

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="bg-card py-24 border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest text-primary mb-6" style={{ fontFamily: "var(--font-serif)" }}>
            {c.title}
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto mb-8" />
          <p className="text-xl text-muted-foreground">{c.subtitle}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Contact Form */}
          <div>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-serif text-primary">{c.sent}</h2>
                <p className="text-muted-foreground max-w-sm">{c.sentDesc}</p>
                <Button variant="outline" onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", message: "" }); }}>
                  {t.admin.common.cancel}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{c.name}</Label>
                  <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="John Doe" className="bg-card border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{c.email}</Label>
                  <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="john@example.com" className="bg-card border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{c.phone}</Label>
                  <Input id="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className="bg-card border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{c.message}</Label>
                  <Textarea id="message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required placeholder={c.messagePlaceholder} rows={6} className="bg-card border-border resize-none" />
                </div>
                <Button type="submit" size="lg" className="w-full h-14 text-base uppercase tracking-widest" disabled={sending}>
                  {sending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{c.sending}</>
                  ) : c.send}
                </Button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-8 lg:pl-8 lg:border-l lg:border-border">
            <div>
              <h2 className="text-2xl font-bold font-serif text-primary mb-8">{c.infoTitle}</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{c.addressTitle}</h3>
                  <p className="text-muted-foreground text-sm">{c.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{c.hoursTitle}</h3>
                  <p className="text-muted-foreground text-sm">{c.hours}</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{c.phoneTitle}</h3>
                  <a href={`tel:${c.phoneValue}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">{c.phoneValue}</a>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{c.emailTitle}</h3>
                  <a href={`mailto:${c.emailValue}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">{c.emailValue}</a>
                </div>
              </div>
            </div>

            {/* Decorative */}
            <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "Our concierge team is on call around the clock, ready to accommodate your most demanding schedules and bespoke requirements."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
