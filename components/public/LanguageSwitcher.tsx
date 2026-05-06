'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { FlagIconDetailed } from './FlagIcon';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { locale, setLocale, locales, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocale = locales.find(l => l.code === locale) || locales[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5 border border-transparent hover:border-border"
        aria-label="Select language"
      >
        <FlagIconDetailed code={currentLocale.code} size={22} />
        <span className="text-sm font-medium hidden sm:inline">{currentLocale.code.toUpperCase()}</span>
        <ChevronDown size={14} className={cn('transition-transform text-muted-foreground', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div 
          className={cn(
            "absolute top-full mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden min-w-[200px] z-50",
            dir === 'rtl' ? 'left-0' : 'right-0'
          )}
        >
          <div className="py-1">
            {locales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => {
                  setLocale(loc.code);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-sm transition-colors",
                  locale === loc.code 
                    ? 'bg-foreground/10 text-foreground' 
                    : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <FlagIconDetailed code={loc.code} size={22} />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{loc.nativeName}</span>
                    <span className="text-xs text-muted-foreground">{loc.name}</span>
                  </div>
                </div>
                {locale === loc.code && <Check size={16} className="text-foreground" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
