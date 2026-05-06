import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface TermsSection { title: string; content: string; }
interface TermsContent { lastUpdated: string; intro: string; sections: TermsSection[]; }

export default function Terms() {
  const { t } = useI18n();
  const tc = t.terms;
  const [custom, setCustom] = useState<TermsContent | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then((d: { termsContent?: string | null }) => {
        if (d.termsContent) {
          try { setCustom(JSON.parse(d.termsContent)); } catch { /* use i18n fallback */ }
        }
      })
      .catch(() => {});
  }, []);

  const i18nSections = [
    { title: tc.s1Title, content: tc.s1 },
    { title: tc.s2Title, content: tc.s2 },
    { title: tc.s3Title, content: tc.s3 },
    { title: tc.s4Title, content: tc.s4 },
    { title: tc.s5Title, content: tc.s5 },
    { title: tc.s6Title, content: tc.s6 },
    { title: tc.s7Title, content: tc.s7 },
  ];

  const lastUpdated = custom?.lastUpdated ?? tc.lastUpdated;
  const intro = custom?.intro ?? tc.intro;
  const sections = custom?.sections ?? i18nSections;

  return (
    <div className="w-full">
      <div className="bg-card py-24 border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest text-primary mb-6" style={{ fontFamily: "var(--font-serif)" }}>
            {tc.title}
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto mb-8" />
          <p className="text-muted-foreground text-sm">{lastUpdated}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <div className="mb-12 p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-muted-foreground leading-relaxed">{intro}</p>
        </div>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <div key={i} className="border-b border-border pb-10 last:border-0">
              <h2 className="text-xl font-bold font-serif text-primary mb-4">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center space-y-6">
          <p className="text-sm text-muted-foreground">{tc.contactLine}</p>
          <Link href="/contact">
            <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
              {t.nav.contact}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
