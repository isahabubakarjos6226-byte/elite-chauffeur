'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, locales, getTranslation, Translations } from './i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  dir: 'ltr' | 'rtl';
  locales: typeof locales;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved locale from localStorage
    const savedLocale = localStorage.getItem('elite-chauffeur-locale') as Locale | null;
    if (savedLocale && locales.some(l => l.code === savedLocale)) {
      setLocaleState(savedLocale);
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('elite-chauffeur-locale', newLocale);
    
    // Update document direction for RTL languages
    const localeConfig = locales.find(l => l.code === newLocale);
    if (localeConfig) {
      document.documentElement.dir = localeConfig.dir;
      document.documentElement.lang = newLocale;
    }
  };

  const currentLocaleConfig = locales.find(l => l.code === locale) || locales[0];
  const t = getTranslation(locale);

  // Update document direction on mount and locale change
  useEffect(() => {
    if (mounted) {
      document.documentElement.dir = currentLocaleConfig.dir;
      document.documentElement.lang = locale;
    }
  }, [locale, mounted, currentLocaleConfig.dir]);

  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
        dir: currentLocaleConfig.dir,
        locales,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
