import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/lib/admin-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2, Eye, EyeOff, KeyRound, ShieldCheck, Coins, ImageIcon, Upload, X, Globe, FileDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CURRENCIES, useSiteSettings } from "@/lib/site-settings";

interface SiteSettingsData {
  showChauffeurService: boolean;
  currency: string;
  websiteLogoUrl: string | null;
  invoiceLogoUrl: string | null;
}

function LogoUploadCard({
  title, description, icon: Icon, value, settingKey, onSaved,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  value: string | null;
  settingKey: "websiteLogoUrl" | "invoiceLogoUrl";
  onSaved: (url: string | null) => void;
}) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      await saveLogo(data.url);
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const saveLogo = async (url: string | null) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [settingKey]: url ?? "" }),
      });
      if (res.ok) {
        onSaved(url);
        toast({ title: url ? "Logo saved" : "Logo removed", description: url ? "Logo updated successfully." : "Logo has been removed." });
      }
    } catch {
      toast({ title: "Error saving logo", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {value ? (
          <div className="relative group w-fit">
            <div className="border border-border rounded-lg p-3 bg-white/5 flex items-center justify-center min-w-[160px] min-h-[80px]">
              <img
                src={value}
                alt="logo"
                className="max-h-16 max-w-[220px] object-contain"
              />
            </div>
            <button
              onClick={() => saveLogo(null)}
              disabled={saving}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow"
              title="Remove logo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-lg p-6 text-center bg-secondary/20">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No logo uploaded</p>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <Button
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || saving}
          className="gap-2 w-full"
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading…" : value ? "Replace Logo" : "Upload Logo"}
        </Button>
        <p className="text-xs text-muted-foreground">PNG, JPG, SVG recommended. Max 10 MB.</p>
      </CardContent>
    </Card>
  );
}

export default function AdminSettings() {
  const { toast } = useToast();
  const { changePassword } = useAdminAuth();
  const { t } = useI18n();
  const { refresh: refreshSiteSettings } = useSiteSettings();
  const a = t.admin.settings;

  const [settings, setSettings] = useState<SiteSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currencySaving, setCurrencySaving] = useState(false);

  if (loading && settings === null) {
    fetch("/api/settings")
      .then(r => r.json())
      .then((d: SiteSettingsData) => { setSettings(d); setLoading(false); })
      .catch(() => { setSettings({ showChauffeurService: true, currency: "USD", websiteLogoUrl: null, invoiceLogoUrl: null }); setLoading(false); });
  }

  const updateSetting = async (key: keyof SiteSettingsData, value: boolean | string) => {
    if (!settings) return;
    const next = { ...settings, [key]: value };
    setSettings(next);
    setSaving(true);
    try {
      await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      toast({ title: a.settingSaved, description: a.settingSavedDesc });
      refreshSiteSettings();
    } catch {
      toast({ title: "Error", description: "Could not save setting.", variant: "destructive" });
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  const saveCurrency = async () => {
    if (!settings) return;
    setCurrencySaving(true);
    try {
      await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currency: settings.currency }) });
      toast({ title: a.currencySaved, description: a.currencySavedDesc });
      refreshSiteSettings();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setCurrencySaving(false);
    }
  };

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    if (newPwd.length < 6) { setPwdError("New password must be at least 6 characters."); return; }
    if (newPwd !== confirmPwd) { setPwdError("New passwords do not match."); return; }
    setPwdLoading(true);
    const result = await changePassword(currentPwd, newPwd);
    setPwdLoading(false);
    if (result.success) {
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      toast({ title: a.pwdUpdated, description: a.pwdUpdatedDesc });
    } else {
      setPwdError(result.error ?? "Failed to change password.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings2 className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-primary">{a.title}</h1>
      </div>

      {/* ── Logo uploads ──────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Branding & Logos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {loading ? (
            <>
              <Skeleton className="h-56 w-full rounded-xl" />
              <Skeleton className="h-56 w-full rounded-xl" />
            </>
          ) : (
            <>
              <LogoUploadCard
                title="Website Logo"
                description="Displayed in the public site header and navigation."
                icon={Globe}
                value={settings?.websiteLogoUrl ?? null}
                settingKey="websiteLogoUrl"
                onSaved={(url) => { setSettings(s => s ? { ...s, websiteLogoUrl: url } : s); refreshSiteSettings(); }}
              />
              <LogoUploadCard
                title="Invoice Logo"
                description="Printed on PDF invoice exports from the reservations page."
                icon={FileDown}
                value={settings?.invoiceLogoUrl ?? null}
                settingKey="invoiceLogoUrl"
                onSaved={(url) => { setSettings(s => s ? { ...s, invoiceLogoUrl: url } : s); refreshSiteSettings(); }}
              />
            </>
          )}
        </div>
      </div>

      {/* ── Booking form toggle ───────────────────────── */}
      <Card className="bg-card border-border shadow-md max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">{a.bookingForm}</CardTitle>
          <CardDescription>{a.bookingFormDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="flex items-start justify-between gap-6 rounded-lg border border-border p-4 bg-secondary/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {settings?.showChauffeurService
                    ? <Eye className="h-4 w-4 text-primary" />
                    : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  <Label htmlFor="chauffeur-toggle" className="text-base font-semibold cursor-pointer">
                    {a.chauffeurOption}
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {settings?.showChauffeurService ? a.chauffeurOnDesc : a.chauffeurOffDesc}
                </p>
              </div>
              <Switch
                id="chauffeur-toggle"
                checked={settings?.showChauffeurService ?? true}
                onCheckedChange={(v) => updateSetting("showChauffeurService", v)}
                disabled={saving}
                className="shrink-0 mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Currency ─────────────────────────────────── */}
      <Card className="bg-card border-border shadow-md max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{a.currencyCard}</CardTitle>
          </div>
          <CardDescription>{a.currencyDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="currency-select" className="text-sm mb-1.5 block">{a.currencyLabel}</Label>
                <Select
                  value={settings?.currency ?? "USD"}
                  onValueChange={(v) => setSettings(s => s ? { ...s, currency: v } : s)}
                >
                  <SelectTrigger id="currency-select" className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        <span className="font-mono mr-2 text-primary min-w-[2.5rem] inline-block">{c.symbol}</span>
                        {c.code} — {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={saveCurrency} disabled={currencySaving} className="mt-6 shrink-0">
                {currencySaving ? t.admin.common.loading : t.admin.common.save}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Password ─────────────────────────────────── */}
      <Card className="bg-card border-border shadow-md max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{a.passwordCard}</CardTitle>
          </div>
          <CardDescription>{a.passwordDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current-pwd" className="text-sm font-medium">{a.currentPwd}</Label>
              <div className="relative">
                <Input id="current-pwd" type={showCurrent ? "text" : "password"} value={currentPwd}
                  onChange={e => { setCurrentPwd(e.target.value); setPwdError(""); }}
                  placeholder={a.currentPlaceholder} autoComplete="current-password" className="pr-10 bg-background border-border" />
                <button type="button" onClick={() => setShowCurrent(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pwd" className="text-sm font-medium">{a.newPwd}</Label>
              <div className="relative">
                <Input id="new-pwd" type={showNew ? "text" : "password"} value={newPwd}
                  onChange={e => { setNewPwd(e.target.value); setPwdError(""); }}
                  placeholder={a.newPlaceholder} autoComplete="new-password" className="pr-10 bg-background border-border" />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pwd" className="text-sm font-medium">{a.confirmPwd}</Label>
              <Input id="confirm-pwd" type="password" value={confirmPwd}
                onChange={e => { setConfirmPwd(e.target.value); setPwdError(""); }}
                placeholder={a.confirmPlaceholder} autoComplete="new-password" className="bg-background border-border" />
            </div>
            {pwdError && <p className="text-sm text-red-400">{pwdError}</p>}
            <Button type="submit" disabled={pwdLoading || !currentPwd || !newPwd || !confirmPwd} className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              {pwdLoading ? a.updating : a.updatePwd}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
