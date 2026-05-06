import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText, Save, RotateCcw, Loader2 } from "lucide-react";

interface TermsSection {
  title: string;
  content: string;
}

interface TermsContent {
  lastUpdated: string;
  intro: string;
  sections: TermsSection[];
}

const DEFAULT_TERMS: TermsContent = {
  lastUpdated: "January 2025",
  intro: "By accessing or using Elite Chauffeur services, you agree to be bound by these Terms & Conditions. Please read them carefully.",
  sections: [
    { title: "1. Booking & Reservations", content: "All reservations must be made at least 2 hours in advance. We reserve the right to decline any booking at our discretion. A confirmation email will be sent upon successful booking." },
    { title: "2. Cancellation Policy", content: "Cancellations made more than 24 hours before the scheduled pickup time are fully refundable. Cancellations within 24 hours may incur a 50% cancellation fee. No-shows will be charged the full booking amount." },
    { title: "3. Pricing & Payments", content: "All prices displayed are estimates based on distance and vehicle selection. Final pricing may vary based on actual distance, waiting time, tolls, and additional services requested. Payment is due upon completion of service unless otherwise agreed." },
    { title: "4. Passenger Conduct", content: "Passengers are expected to conduct themselves in a respectful and lawful manner at all times. Elite Chauffeur reserves the right to terminate a journey if a passenger's behavior endangers the driver, vehicle, or other passengers." },
    { title: "5. Liability", content: "Elite Chauffeur maintains full commercial insurance on all vehicles and journeys. We are not liable for delays caused by traffic conditions, weather events, road closures, or other circumstances beyond our reasonable control." },
    { title: "6. Privacy & Data", content: "Your personal information is collected and handled in accordance with applicable privacy laws. We do not share your data with third parties without your explicit consent, except where required by law." },
    { title: "7. Governing Law", content: "These terms and conditions are governed by applicable local and international laws. Any disputes shall be resolved through binding arbitration in the jurisdiction where the service was provided." },
  ],
};

export default function AdminTerms() {
  const [terms, setTerms] = useState<TermsContent>(DEFAULT_TERMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then((d: { termsContent?: string | null }) => {
        if (d.termsContent) {
          try {
            setTerms(JSON.parse(d.termsContent));
          } catch {
            setTerms(DEFAULT_TERMS);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateSection = (i: number, field: keyof TermsSection, value: string) => {
    setTerms(t => {
      const sections = [...t.sections];
      sections[i] = { ...sections[i], [field]: value };
      return { ...t, sections };
    });
  };

  const addSection = () => {
    setTerms(t => ({
      ...t,
      sections: [...t.sections, { title: `${t.sections.length + 1}. New Section`, content: "" }],
    }));
  };

  const removeSection = (i: number) => {
    setTerms(t => ({ ...t, sections: t.sections.filter((_, idx) => idx !== i) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termsContent: JSON.stringify(terms) }),
      });
      if (res.ok) {
        toast({ title: "Terms saved", description: "Changes are now live on the public Terms page." });
      } else {
        toast({ title: "Error saving terms", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!confirm("Reset all terms to the default content? This cannot be undone.")) return;
    setTerms(DEFAULT_TERMS);
    toast({ title: "Reset to defaults", description: "Click Save to apply." });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Terms & Conditions Editor</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Changes appear instantly on the public Terms page.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Meta */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Page Header</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Last Updated Text</Label>
            <Input
              value={terms.lastUpdated}
              onChange={e => setTerms(t => ({ ...t, lastUpdated: e.target.value }))}
              placeholder="e.g. January 2025"
              className="bg-background border-border text-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Introduction Paragraph</Label>
            <Textarea
              value={terms.intro}
              onChange={e => setTerms(t => ({ ...t, intro: e.target.value }))}
              rows={4}
              className="bg-background border-border text-foreground resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        {terms.sections.map((section, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <Input
                  value={section.title}
                  onChange={e => updateSection(i, "title", e.target.value)}
                  className="text-sm font-semibold bg-background border-border text-foreground flex-1"
                  placeholder="Section title…"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(i)}
                  className="text-red-400 hover:text-red-500 hover:bg-red-500/10 shrink-0"
                >
                  Remove
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={section.content}
                onChange={e => updateSection(i, "content", e.target.value)}
                rows={4}
                className="bg-background border-border text-foreground resize-none text-sm"
                placeholder="Section content…"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={addSection} className="w-full border-dashed">
        + Add Section
      </Button>

      <div className="flex justify-end pt-2 border-t border-border">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
