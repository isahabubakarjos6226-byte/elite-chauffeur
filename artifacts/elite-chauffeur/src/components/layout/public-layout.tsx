import { Link } from "wouter";
import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import { useI18n, LanguageSwitcher } from "@/lib/i18n";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground dark">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold tracking-widest text-foreground uppercase">ELITE CHAUFFEUR</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t.nav.home}</Link>
            <Link href="/fleet" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t.nav.fleet}</Link>
            <Link href="/services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t.nav.services}</Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t.nav.contact}</Link>
            <LanguageSwitcher />
            <Link href="/book" className="text-sm font-semibold text-background bg-foreground px-5 py-1.5 rounded hover:opacity-90 transition-opacity">{t.nav.bookNow}</Link>
          </nav>

          {/* Mobile: language + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <LanguageSwitcher />
            <button onClick={() => setMobileOpen(v => !v)} className="p-1 text-muted-foreground hover:text-foreground">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-3">
            <Link href="/" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-1">{t.nav.home}</Link>
            <Link href="/fleet" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-1">{t.nav.fleet}</Link>
            <Link href="/services" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-1">{t.nav.services}</Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-1">{t.nav.contact}</Link>
            <Link href="/book" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-background bg-foreground px-4 py-2 rounded text-center">{t.nav.bookNow}</Link>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <span className="tracking-wider">&copy; {new Date().getFullYear()} ELITE CHAUFFEUR. {t.footer.rights}</span>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link href="/fleet" className="hover:text-foreground transition-colors">{t.nav.fleet}</Link>
            <Link href="/services" className="hover:text-foreground transition-colors">{t.nav.services}</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">{t.footer.contact}</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">{t.footer.terms}</Link>
            <Link href="/book" className="hover:text-foreground transition-colors">{t.nav.bookNow}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
