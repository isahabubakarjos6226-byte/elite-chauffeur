import { useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { useLocation } from "wouter";
import { Lock, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n, LanguageSwitcher } from "@/lib/i18n";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const a = t.admin.login;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(password, email || undefined);
    if (ok) {
      setLocation("/");
    } else {
      setError(email ? "Invalid email or password. Please try again." : "Invalid password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-border bg-card mb-6">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{a.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{a.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-lg p-8">
          {/* Email — optional, for staff users */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Email <span className="text-muted-foreground font-normal">(staff users)</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              placeholder="your@email.com"
              autoComplete="email"
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              {a.password}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder={a.placeholder}
                autoComplete="current-password"
                className="pr-10 bg-muted border-border text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading || !password}>
            {loading ? a.verifying : a.signIn}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">{a.note}</p>
      </div>
    </div>
  );
}
