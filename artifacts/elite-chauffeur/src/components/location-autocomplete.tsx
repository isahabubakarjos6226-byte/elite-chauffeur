import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onCoords?: (lat: number, lon: number) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function LocationAutocomplete({
  value,
  onChange,
  onCoords,
  placeholder,
  icon,
  className,
}: LocationAutocompleteProps) {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=0`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = (await res.json()) as NominatimResult[];
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 420);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    search(val);
  };

  const handleSelect = (result: NominatimResult) => {
    onChange(result.display_name);
    onCoords?.(parseFloat(result.lat), parseFloat(result.lon));
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </span>
        )}
        <Input
          value={value}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={cn(icon ? "pl-10" : "", loading && "opacity-70")}
          autoComplete="off"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-xl max-h-60 overflow-auto">
          {results.map((r) => (
            <button
              key={r.place_id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-start gap-2"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(r);
              }}
            >
              <MapPin className="w-3 h-3 mt-0.5 text-primary shrink-0" />
              <span className="line-clamp-2 leading-tight">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
