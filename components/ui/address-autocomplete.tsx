'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, coords?: { lat: number; lon: number }) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  dir?: 'ltr' | 'rtl';
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Enter address',
  className,
  icon,
  dir = 'ltr',
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    // Close dropdown on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      const data = await response.json();
      setSuggestions(data);
      setShowDropdown(data.length > 0);
      setHighlightedIndex(-1);
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    // Debounced search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchAddresses(newValue);
    }, 300);
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    setInputValue(suggestion.display_name);
    onChange(suggestion.display_name, {
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
    });
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
    }
  };

  const formatAddress = (displayName: string) => {
    // Shorten long addresses for display
    const parts = displayName.split(', ');
    if (parts.length > 4) {
      return `${parts[0]}, ${parts[1]}, ${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
    }
    return displayName;
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {icon && (
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 text-muted-foreground",
            dir === 'rtl' ? 'right-4' : 'left-4'
          )}>
            {icon}
          </div>
        )}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className={cn(
            "w-full bg-input border border-border rounded-lg py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors",
            icon ? (dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4') : 'px-4',
            className
          )}
        />
        {isLoading && (
          <Loader2 
            size={16} 
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground animate-spin",
              dir === 'rtl' ? 'left-4' : 'right-4'
            )} 
          />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className={cn(
                "w-full px-4 py-3 text-left text-sm transition-colors flex items-start gap-3",
                highlightedIndex === index
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              )}
            >
              <MapPin size={16} className="flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{formatAddress(suggestion.display_name)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
