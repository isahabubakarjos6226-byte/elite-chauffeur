import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export const CURRENCIES = [
  { code: "USD", symbol: "$",    name: "US Dollar" },
  { code: "EUR", symbol: "€",    name: "Euro" },
  { code: "GBP", symbol: "£",    name: "British Pound" },
  { code: "CHF", symbol: "CHF ", name: "Swiss Franc" },
  { code: "AED", symbol: "AED ", name: "UAE Dirham" },
  { code: "SAR", symbol: "SAR ", name: "Saudi Riyal" },
  { code: "MAD", symbol: "MAD ", name: "Moroccan Dirham" },
  { code: "CAD", symbol: "C$",   name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$",   name: "Australian Dollar" },
  { code: "JPY", symbol: "¥",    name: "Japanese Yen" },
  { code: "TRY", symbol: "₺",    name: "Turkish Lira" },
  { code: "INR", symbol: "₹",    name: "Indian Rupee" },
];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? "$";
}

export function formatPrice(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toFixed(2)}`;
}

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

function ensureGFont(name: string) {
  if (!name || name === "Inter") return;
  const id = `gf-${name.replace(/ /g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id; link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}:wght@300;400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}

interface SiteSettings {
  showChauffeurService: boolean;
  currency: string;
  websiteLogoUrl: string | null;
  invoiceLogoUrl: string | null;
  termsContent: string | null;
  heroImageUrl: string | null;
  heroOverlayOpacity: number;
  heroBlackWhite: boolean;
  heroTitle: string;
  heroSubtitle: string;
  themeAccentColor: string;
  themeFontBody: string;
  themeFontHeading: string;
}

interface SiteSettingsContextType extends SiteSettings {
  isLoading: boolean;
  formatPrice: (amount: number) => string;
  currencySymbol: string;
  refresh: () => void;
}

const DEFAULTS: SiteSettings = {
  showChauffeurService: true,
  currency: "USD",
  websiteLogoUrl: null,
  invoiceLogoUrl: null,
  termsContent: null,
  heroImageUrl: null,
  heroOverlayOpacity: 0.6,
  heroBlackWhite: false,
  heroTitle: "",
  heroSubtitle: "",
  themeAccentColor: "#ebebeb",
  themeFontBody: "Inter",
  themeFontHeading: "",
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  ...DEFAULTS,
  isLoading: true,
  formatPrice: (a) => `$${a.toFixed(2)}`,
  currencySymbol: "$",
  refresh: () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/settings")
      .then(r => r.json())
      .then((d: SiteSettings) => { setSettings({ ...DEFAULTS, ...d }); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [tick]);

  // Apply accent color as CSS variable
  useEffect(() => {
    const color = settings.themeAccentColor;
    if (color && /^#[0-9a-fA-F]{6}$/.test(color)) {
      const hsl = hexToHsl(color);
      document.documentElement.style.setProperty("--primary", hsl);
      document.documentElement.style.setProperty("--ring", hsl);
    }
  }, [settings.themeAccentColor]);

  // Apply fonts
  useEffect(() => {
    const body    = settings.themeFontBody    || "Inter";
    const heading = settings.themeFontHeading || body;
    ensureGFont(body);
    ensureGFont(heading);
    document.documentElement.style.setProperty("--font-body",    `'${body}', system-ui, sans-serif`);
    document.documentElement.style.setProperty("--font-heading",  `'${heading}', system-ui, sans-serif`);
    // Apply to body element so all text updates immediately
    document.body.style.fontFamily = `'${body}', system-ui, sans-serif`;
  }, [settings.themeFontBody, settings.themeFontHeading]);

  const currencySymbol = getCurrencySymbol(settings.currency);
  const fmt = (amount: number) => formatPrice(amount, settings.currency);

  return (
    <SiteSettingsContext.Provider value={{
      ...settings, isLoading, formatPrice: fmt, currencySymbol, refresh: () => setTick(t => t + 1),
    }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
