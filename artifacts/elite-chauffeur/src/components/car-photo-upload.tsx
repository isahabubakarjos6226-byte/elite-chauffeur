import { useRef, useState, useCallback } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarPhotoUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export default function CarPhotoUpload({ value, onChange }: CarPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError("Upload failed. Please try again or paste a URL below.");
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
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <div className="space-y-2">
      {/* Drop zone / preview */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors cursor-pointer select-none overflow-hidden",
          dragging ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/50 hover:bg-secondary/30",
          value ? "h-44" : "h-36",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Car photo"
              className="absolute inset-0 w-full h-full object-cover rounded-md"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
              <span className="text-white text-sm font-medium flex items-center gap-2">
                <Upload className="w-4 h-4" /> Change photo
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
            {uploading ? (
              <>
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Uploading…</span>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-secondary">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Drop photo here or click to browse</p>
                  <p className="text-xs mt-0.5">JPG, PNG, WEBP — max 10 MB</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Remove button */}
        {value && !uploading && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(null); }}
            className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-1 text-white hover:bg-red-600 transition-colors"
            title="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* URL fallback */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">or paste URL</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <input
        type="url"
        value={value ?? ""}
        onChange={e => onChange(e.target.value || null)}
        placeholder="https://example.com/car.jpg"
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
