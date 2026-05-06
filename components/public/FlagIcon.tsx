'use client';

interface FlagIconProps {
  code?: string;
  locale?: string;
  size?: number;
  className?: string;
}

export function FlagIcon({ code, locale, size = 20, className = '' }: FlagIconProps) {
  const flagCode = code || locale || 'en';
  const flags: Record<string, JSX.Element> = {
    en: (
      // UK Flag
      <svg width={size} height={size} viewBox="0 0 60 30" className={className}>
        <clipPath id="uk-clip">
          <rect width="60" height="30" rx="2" />
        </clipPath>
        <g clipPath="url(#uk-clip)">
          <rect width="60" height="30" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#uk-diag)" />
          <clipPath id="uk-diag">
            <path d="M30,15 L60,30 L60,15 L30,15 L60,0 L30,0 L30,15 L0,0 L0,15 L30,15 L0,30 L30,30 Z" />
          </clipPath>
          <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
          <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
        </g>
      </svg>
    ),
    fr: (
      // France Flag
      <svg width={size} height={size} viewBox="0 0 30 20" className={className}>
        <rect width="30" height="20" rx="2" fill="#fff" />
        <rect width="10" height="20" fill="#002395" />
        <rect x="20" width="10" height="20" fill="#ED2939" />
      </svg>
    ),
    de: (
      // Germany Flag
      <svg width={size} height={size} viewBox="0 0 30 18" className={className}>
        <rect width="30" height="18" rx="2" fill="#000" />
        <rect y="6" width="30" height="6" fill="#DD0000" />
        <rect y="12" width="30" height="6" fill="#FFCE00" />
      </svg>
    ),
    ar: (
      // Saudi Arabia Flag (commonly used for Arabic)
      <svg width={size} height={size} viewBox="0 0 30 20" className={className}>
        <rect width="30" height="20" rx="2" fill="#006C35" />
        <g fill="#fff" transform="translate(5, 4) scale(0.4)">
          <text x="0" y="20" fontSize="16" fontFamily="Arial" fill="#fff">العربية</text>
        </g>
        <rect x="10" y="13" width="10" height="3" fill="#fff" rx="0.5" />
      </svg>
    ),
  };

  return flags[flagCode] || (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// Detailed flag SVGs for better quality
export function FlagIconDetailed({ code, size = 24, className = '' }: FlagIconProps) {
  switch (code) {
    case 'en':
      return (
        <svg width={size} height={Math.round(size * 0.5)} viewBox="0 0 60 30" className={`rounded-sm overflow-hidden ${className}`}>
          <rect width="60" height="30" fill="#012169" />
          <path d="M0 0L60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
          <path d="M0 0L60 30" stroke="#C8102E" strokeWidth="2" strokeDasharray="0 0 30 60" />
          <path d="M60 0L0 30" stroke="#C8102E" strokeWidth="2" strokeDasharray="30 60" />
          <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
          <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
        </svg>
      );
    case 'fr':
      return (
        <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 30 20" className={`rounded-sm overflow-hidden ${className}`}>
          <rect width="30" height="20" fill="#fff" />
          <rect width="10" height="20" fill="#002395" />
          <rect x="20" width="10" height="20" fill="#ED2939" />
        </svg>
      );
    case 'de':
      return (
        <svg width={size} height={Math.round(size * 0.6)} viewBox="0 0 30 18" className={`rounded-sm overflow-hidden ${className}`}>
          <rect width="30" height="6" fill="#000" />
          <rect y="6" width="30" height="6" fill="#DD0000" />
          <rect y="12" width="30" height="6" fill="#FFCE00" />
        </svg>
      );
    case 'ar':
      return (
        <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 30 20" className={`rounded-sm overflow-hidden ${className}`}>
          <rect width="30" height="20" fill="#006C35" />
          <g transform="translate(4, 3) scale(0.7)">
            <path fill="#fff" d="M12 4c0 1-0.5 2-1.5 2.5L12 8l-1.5 1.5c1 0.5 1.5 1.5 1.5 2.5s-0.5 2-1.5 2.5L12 16l-2-2c0.5-0.5 1-1 1-2s-0.5-1.5-1-2l2-2-2-2c0.5-0.5 1-1 1-2s-0.5-1.5-1-2l2-2z" />
            <rect x="5" y="14" width="20" height="2" rx="0.5" fill="#fff" />
          </g>
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
  }
}
