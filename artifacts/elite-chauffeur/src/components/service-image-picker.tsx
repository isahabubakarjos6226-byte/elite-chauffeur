import { useRef, useState, useCallback, useEffect } from "react";
import { Upload, X, ImageIcon, Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Car {
  id: number;
  brand: string;
  model: string;
  imageUrl: string | null;
}

interface ServiceImagePickerProps {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export default function ServiceImagePicker({ value, onChange }: ServiceImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carImages, setCarImages] = useState<{ url: string; label: string }[]>([]);
  const [urlInput, setUrlInput] = useState(value ?? "");

  useEffect(() => {
    fetch("/api/cars")
      .then(r => r.json())
      .then((cars: Car[]) => {
        const imgs = cars
          .filter(c => c.imageUrl)
          .map(c => ({ url: c.imageUrl!, label: `${c.brand} ${c.model}` }));
        // deduplicate by url
        const seen = new Set<string>();
        setCarImages(imgs.filter(i => seen.has(i.url) ? false : (seen.add(i.url), true)));
      })
      .catch(() => {});
  }, []);

  // keep url input in sync when value is cleared externally
  useEffect(() => { setUrlInput(value ?? ""); }, [value]);

  const uploadFile = useCallback(async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch("/api/upload/car-photo", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json() as { url: string };
      onChange(url);
    } catch {
      setError("Upload failed. Please try again or paste a URL.");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="space-y-3">
      {/* Current preview */}
      {value && (
        <div className="relative rounded-lg overflow-hidden border border-border h-36">
          <img src={value} alt="Service" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            type="button"
            onClick={() => { onChange(null); setUrlInput(""); }}
            className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-1 text-white hover:bg-red-600 transition-colors"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="absolute bottom-2 left-3 text-xs text-white/80">Current image</span>
        </div>
      )}

      <Tabs defaultValue="gallery">
        <TabsList className="w-full bg-secondary/50">
          <TabsTrigger value="gallery" className="flex-1 text-xs">Fleet Photos</TabsTrigger>
          <TabsTrigger value="upload" className="flex-1 text-xs">Upload New</TabsTrigger>
          <TabsTrigger value="url" className="flex-1 text-xs">Paste URL</TabsTrigger>
        </TabsList>

        {/* Existing car images gallery */}
        <TabsContent value="gallery" className="mt-2">
          {carImages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No fleet photos uploaded yet.</p>
              <p className="text-xs mt-1">Add images to your vehicles first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto p-1">
              {carImages.map(({ url, label }) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => onChange(url)}
                  title={label}
                  className={cn(
                    "relative aspect-[4/3] rounded-md overflow-hidden border-2 transition-all",
                    value === url
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-transparent hover:border-primary/50"
                  )}
                >
                  <img src={url} alt={label} className="w-full h-full object-cover" />
                  {value === url && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white drop-shadow" />
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 px-1 py-0.5">
                    <span className="text-[9px] text-white/90 truncate block">{label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Upload new photo */}
        <TabsContent value="upload" className="mt-2">
          <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => !uploading && inputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
              uploading ? "border-border opacity-60 pointer-events-none" : "border-border hover:border-primary/50 hover:bg-secondary/30"
            )}
          >
            {uploading ? (
              <>
                <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs text-muted-foreground">Uploading…</span>
              </>
            ) : (
              <>
                <div className="p-2.5 rounded-full bg-secondary mb-2">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Drop image here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WEBP — max 10 MB</p>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </TabsContent>

        {/* Paste URL */}
        <TabsContent value="url" className="mt-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onBlur={() => onChange(urlInput || null)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="button"
              onClick={() => onChange(urlInput || null)}
              className="shrink-0 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Use
            </button>
          </div>
          {urlInput && (
            <img
              src={urlInput}
              alt="preview"
              className="mt-2 h-20 w-full object-cover rounded border border-border"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
