import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/lib/admin-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, ImageIcon, Upload, X, Type, ExternalLink, Loader2 } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";

interface ThemeSettings {
  heroImageUrl: string;
  heroOverlayOpacity: number;
  heroBlackWhite: boolean;
  heroTitle: string;
  heroSubtitle: string;
  themeAccentColor: string;
  themeFontBody: string;
  themeFontHeading: string;
}

const FONT_OPTIONS = [
  { value: "Inter",              label: "Inter (Default)" },
  { value: "Poppins",            label: "Poppins" },
  { value: "Montserrat",         label: "Montserrat" },
  { value: "DM Sans",            label: "DM Sans" },
  { value: "Raleway",            label: "Raleway" },
  { value: "Playfair Display",   label: "Playfair Display (Serif)" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond (Serif)" },
  { value: "Lora",               label: "Lora (Serif)" },
];

const COLOR_PRESETS = [
  { hex: "#ebebeb", label: "White" },
  { hex: "#d4af37", label: "Gold" },
  { hex: "#f59e0b", label: "Amber" },
  { hex: "#e5e7eb", label: "Silver" },
  { hex: "#10b981", label: "Emerald" },
  { hex: "#60a5fa", label: "Sky Blue" },
  { hex: "#a78bfa", label: "Violet" },
  { hex: "#f43f5e", label: "Rose" },
];

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const DEFAULTS: ThemeSettings = {
  heroImageUrl: "",
  heroOverlayOpacity: 0.6,
  heroBlackWhite: false,
  heroTitle: "",
  heroSubtitle: "",
  themeAccentColor: "#ebebeb",
  themeFontBody: "Inter",
  themeFontHeading: "",
};

export default function AdminTheme() {
  const { toast } = useToast();
  const { isFullAccess } = useAdminAuth() as any;
  const { refresh } = useSiteSettings();

  const [settings, setSettings] = useState<ThemeSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewColor, setPreviewColor] = useState(DEFAULTS.themeAccentColor);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then((d: any) => {
        setSettings({
          heroImageUrl:        d.heroImageUrl        ?? "",
          heroOverlayOpacity:  d.heroOverlayOpacity  ?? 0.6,
          heroBlackWhite:      d.heroBlackWhite       ?? false,
          heroTitle:           d.heroTitle            ?? "",
          heroSubtitle:        d.heroSubtitle         ?? "",
          themeAccentColor:    d.themeAccentColor     ?? "#ebebeb",
          themeFontBody:       d.themeFontBody        ?? "Inter",
          themeFontHeading:    d.themeFontHeading     ?? "",
        });
        setPreviewColor(d.themeAccentColor ?? "#ebebeb");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async (patch: Partial<ThemeSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error("Save failed");
      toast({ title: "Theme saved", description: "Changes are now live on the public site." });
      refresh();
    } catch {
      toast({ title: "Error saving", variant: "destructive" });
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      setSettings(s => ({ ...s, heroImageUrl: data.url! }));
      toast({ title: "Image uploaded", description: "Click Save Hero to apply it." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const loadGFont = (name: string) => {
    if (!name || name === "Inter") return;
    const id = `gf-${name.replace(/ /g, "-")}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id; link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}:wght@300;400;600;700&display=swap`;
    document.head.appendChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-primary">Theme</h1>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-4 h-4" /> Preview site
        </a>
      </div>
      <p className="text-muted-foreground text-sm -mt-2">
        Customise the hero image, accent colour, and fonts used across the public site.
      </p>

      <Tabs defaultValue="hero">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="hero"><ImageIcon className="w-3.5 h-3.5 mr-1.5" />Hero Image</TabsTrigger>
          <TabsTrigger value="colors"><Palette className="w-3.5 h-3.5 mr-1.5" />Colors</TabsTrigger>
          <TabsTrigger value="fonts"><Type className="w-3.5 h-3.5 mr-1.5" />Typography</TabsTrigger>
        </TabsList>

        {/* ── Hero Image ──────────────────────────────────────────────────── */}
        <TabsContent value="hero" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" /> Background Image
              </CardTitle>
              <CardDescription>
                Shown behind the hero section on the home page. Leave blank to use the default gradient.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Image URL</Label>
                    <Input
                      value={settings.heroImageUrl}
                      onChange={e => setSettings(s => ({ ...s, heroImageUrl: e.target.value }))}
                      placeholder="https://example.com/photo.jpg"
                      className="bg-background border-border font-mono text-xs"
                    />
                  </div>

                  <div className="text-center text-xs text-muted-foreground">— or —</div>

                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
                  <Button
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? "Uploading…" : "Upload Image File"}
                  </Button>

                  {settings.heroImageUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive gap-2"
                      onClick={() => setSettings(s => ({ ...s, heroImageUrl: "" }))}
                    >
                      <X className="w-4 h-4" /> Remove image
                    </Button>
                  )}
                </div>

                {/* Live preview box */}
                <div>
                  <Label className="text-sm block mb-2">Preview</Label>
                  <div
                    className="rounded-lg overflow-hidden border border-border relative"
                    style={{ height: 170, background: "#000" }}
                  >
                    {settings.heroImageUrl && (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url('${settings.heroImageUrl}')`,
                          filter: settings.heroBlackWhite ? "grayscale(1)" : "none",
                        }}
                      />
                    )}
                    {settings.heroImageUrl && (
                      <div
                        className="absolute inset-0"
                        style={{ background: `rgba(0,0,0,${settings.heroOverlayOpacity})` }}
                      />
                    )}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center gap-1.5">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-white/40">Preview</p>
                      <p className="text-lg font-bold text-white">Arrive in Style</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlay opacity */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm">Dark Overlay</Label>
                  <span className="text-xs font-mono text-muted-foreground">{Math.round(settings.heroOverlayOpacity * 100)}%</span>
                </div>
                <Slider
                  min={0} max={95} step={5}
                  value={[Math.round(settings.heroOverlayOpacity * 100)]}
                  onValueChange={([v]) => setSettings(s => ({ ...s, heroOverlayOpacity: v / 100 }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Transparent</span><span>Very Dark</span>
                </div>
              </div>

              {/* B&W toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-secondary/20">
                <div>
                  <p className="text-sm font-medium">Black &amp; White Filter</p>
                  <p className="text-xs text-muted-foreground">Removes colour from the background image</p>
                </div>
                <Switch
                  checked={settings.heroBlackWhite}
                  onCheckedChange={v => setSettings(s => ({ ...s, heroBlackWhite: v }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Hero Text Overrides</CardTitle>
              <CardDescription>Leave blank to use the default translated text.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Heading</Label>
                  <Input
                    value={settings.heroTitle}
                    onChange={e => setSettings(s => ({ ...s, heroTitle: e.target.value }))}
                    placeholder="Arrive in Style"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Subheading / Tagline</Label>
                  <Input
                    value={settings.heroSubtitle}
                    onChange={e => setSettings(s => ({ ...s, heroSubtitle: e.target.value }))}
                    placeholder="Luxury Black Car Service"
                    className="bg-background border-border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => save(settings)} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            {saving ? "Saving…" : "Save Hero Settings"}
          </Button>
        </TabsContent>

        {/* ── Colors ─────────────────────────────────────────────────────── */}
        <TabsContent value="colors" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" /> Primary Accent Color
              </CardTitle>
              <CardDescription>
                Used for buttons, highlights, and accent text. Changes take effect immediately after saving.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start gap-6 flex-wrap">
                <div className="space-y-3">
                  <Label className="text-sm">Color Picker</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.themeAccentColor}
                      onChange={e => {
                        setSettings(s => ({ ...s, themeAccentColor: e.target.value }));
                        setPreviewColor(e.target.value);
                      }}
                      className="w-12 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                    />
                    <Input
                      value={settings.themeAccentColor}
                      onChange={e => {
                        if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) {
                          setSettings(s => ({ ...s, themeAccentColor: e.target.value }));
                          if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setPreviewColor(e.target.value);
                        }
                      }}
                      className="w-28 bg-background border-border font-mono text-sm"
                      placeholder="#ebebeb"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Quick presets</p>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map(p => (
                        <button
                          key={p.hex}
                          title={p.label}
                          onClick={() => { setSettings(s => ({ ...s, themeAccentColor: p.hex })); setPreviewColor(p.hex); }}
                          className="w-7 h-7 rounded-md border border-white/10 hover:scale-110 transition-transform"
                          style={{ background: p.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2 min-w-[160px]">
                  <Label className="text-sm">Preview</Label>
                  <div className="rounded-lg border border-border p-4 bg-background space-y-3">
                    <button
                      className="w-full rounded-md px-4 py-2 text-sm font-semibold text-black transition-all"
                      style={{ background: previewColor }}
                    >
                      Book Now
                    </button>
                    <div className="text-sm font-bold" style={{ color: previewColor }}>
                      Accent Text
                    </div>
                    <div className="h-0.5 rounded" style={{ background: previewColor }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => save({ themeAccentColor: settings.themeAccentColor })} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
            {saving ? "Saving…" : "Save Color"}
          </Button>
        </TabsContent>

        {/* ── Typography ─────────────────────────────────────────────────── */}
        <TabsContent value="fonts" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" /> Font Choices
              </CardTitle>
              <CardDescription>
                Fonts are loaded from Google Fonts and apply to the public site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Body Font <span className="text-muted-foreground">(paragraphs, forms)</span></Label>
                  <Select
                    value={settings.themeFontBody || "Inter"}
                    onValueChange={v => { setSettings(s => ({ ...s, themeFontBody: v })); loadGFont(v); }}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Heading Font <span className="text-muted-foreground">(H1–H6)</span></Label>
                  <Select
                    value={settings.themeFontHeading || "__same__"}
                    onValueChange={v => {
                      const val = v === "__same__" ? "" : v;
                      setSettings(s => ({ ...s, themeFontHeading: val }));
                      loadGFont(val);
                    }}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Same as body font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__same__">Same as body font</SelectItem>
                      {FONT_OPTIONS.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Live font preview */}
              <div className="rounded-lg border border-border p-5 bg-background space-y-2">
                <p
                  className="text-2xl font-bold text-foreground"
                  style={{ fontFamily: `'${settings.themeFontHeading || settings.themeFontBody}', system-ui, serif` }}
                >
                  Luxury Black Car Service
                </p>
                <p
                  className="text-sm text-muted-foreground leading-relaxed"
                  style={{ fontFamily: `'${settings.themeFontBody}', system-ui, sans-serif` }}
                >
                  Experience premium chauffeur service with our fleet of meticulously maintained luxury vehicles.
                </p>
                <button
                  className="mt-1 rounded-md px-4 py-1.5 text-sm font-semibold text-black"
                  style={{ background: settings.themeAccentColor, fontFamily: `'${settings.themeFontBody}', system-ui, sans-serif` }}
                >
                  Book Now
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Font changes are applied to the public site on save.</p>
            </CardContent>
          </Card>

          <Button onClick={() => save({ themeFontBody: settings.themeFontBody, themeFontHeading: settings.themeFontHeading })} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type className="w-4 h-4" />}
            {saving ? "Saving…" : "Save Typography"}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
