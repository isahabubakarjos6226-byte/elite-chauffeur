import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, GripVertical, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { Plane, Building2, CalendarDays, Clock, Car, MapPin, Shield, Star, Users, Briefcase, GlassWater, Music, LucideIcon } from "lucide-react";
import ServiceImagePicker from "@/components/service-image-picker";

interface Service {
  id: number;
  title: string;
  description: string;
  iconName: string;
  imageUrl: string | null;
  sortOrder: number;
  active: boolean;
}

const ICONS: { name: string; Icon: LucideIcon }[] = [
  { name: "Plane", Icon: Plane },
  { name: "Building2", Icon: Building2 },
  { name: "CalendarDays", Icon: CalendarDays },
  { name: "Clock", Icon: Clock },
  { name: "Car", Icon: Car },
  { name: "MapPin", Icon: MapPin },
  { name: "Shield", Icon: Shield },
  { name: "Star", Icon: Star },
  { name: "Users", Icon: Users },
  { name: "Briefcase", Icon: Briefcase },
  { name: "GlassWater", Icon: GlassWater },
  { name: "Music", Icon: Music },
];

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(ICONS.map(i => [i.name, i.Icon]));

const DEFAULT_TITLES = ["Airport Transfers", "Corporate Travel", "Special Events", "Hourly Charter"];

function ServiceIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name] ?? Star;
  return <Icon className="w-5 h-5" />;
}

const emptyForm = { title: "", description: "", iconName: "Star", imageUrl: null as string | null, sortOrder: 0, active: true };

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();
  const a = t.admin.services;

  const fetchServices = () => {
    setLoading(true);
    fetch("/api/services")
      .then(r => r.json())
      .then((data: Service[]) => { setServices(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, sortOrder: services.length });
    setDialogOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ title: s.title, description: s.description, iconName: s.iconName, imageUrl: s.imageUrl, sortOrder: s.sortOrder, active: s.active });
    setDialogOpen(true);
  };

  const handleClone = async (s: Service) => {
    try {
      const body = {
        title: `${s.title} (Copy)`,
        description: s.description,
        iconName: s.iconName,
        imageUrl: s.imageUrl,
        sortOrder: services.length,
        active: false,
      };
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast({ title: "Service cloned", description: `"${s.title} (Copy)" created as draft.` });
        fetchServices();
      }
    } catch {
      toast({ title: "Failed to clone service", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const body = { ...form };
      const res = editing
        ? await fetch(`/api/services/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        toast({ title: a.saveService });
        setDialogOpen(false);
        fetchServices();
      } else {
        toast({ title: "Error saving service", variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.admin.common.areYouSure)) return;
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) { toast({ title: t.admin.common.delete }); fetchServices(); }
  };

  const toggleActive = async (s: Service) => {
    await fetch(`/api/services/${s.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !s.active }) });
    fetchServices();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">{a.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">Base services are seeded automatically. Clone any to create a variant.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> {a.addService}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">{t.admin.common.loading}</div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg text-muted-foreground">
          <Star className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>{a.noServices}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map(service => {
            const isDefault = DEFAULT_TITLES.includes(service.title);
            return (
              <div key={service.id} className={`flex items-center gap-4 bg-card border rounded-lg p-4 shadow-sm hover:border-primary/30 transition-colors ${isDefault ? "border-primary/20 bg-primary/3" : "border-border"}`}>
                <div className="text-muted-foreground cursor-grab shrink-0">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Icon circle */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <ServiceIcon name={service.iconName} />
                </div>

                {/* Image preview */}
                {service.imageUrl ? (
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="w-20 h-14 object-cover rounded-md border border-border shrink-0"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-20 h-14 rounded-md border border-dashed border-border bg-secondary/40 shrink-0 flex items-center justify-center">
                    <ServiceIcon name={service.iconName} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{service.title}</h3>
                    {isDefault && (
                      <Badge className="text-[10px] shrink-0 bg-primary/15 text-primary border-primary/20 border">
                        Base
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] shrink-0 bg-secondary border-none">
                      {service.iconName}
                    </Badge>
                    {!service.active && (
                      <Badge variant="outline" className="text-[10px] shrink-0 bg-red-500/10 text-red-400 border-none">
                        Hidden
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{service.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{a.activeLabel}</span>
                    <Switch checked={service.active} onCheckedChange={() => toggleActive(service)} />
                  </div>
                  <Button variant="ghost" size="icon" title="Clone service" onClick={() => handleClone(service)} className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(service)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl bg-card border-border max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-primary">
              {editing ? a.editService : a.addService}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-1.5">
              <Label>{a.titleLabel}</Label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Airport Transfers"
              />
            </div>

            <div className="space-y-1.5">
              <Label>{a.descLabel}</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder={a.descPlaceholder}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label>{a.iconLabel}</Label>
              <div className="grid grid-cols-6 gap-2 p-3 bg-secondary/30 border border-border rounded-md">
                {ICONS.map(({ name, Icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, iconName: name }))}
                    title={name}
                    className={`flex flex-col items-center gap-1 p-2 rounded transition-all ${form.iconName === name ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[9px] leading-none">{name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{a.imageLabel}</Label>
              <ServiceImagePicker
                value={form.imageUrl}
                onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{a.orderLabel}</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                />
              </div>
              <div className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm mt-2">
                <div className="space-y-0.5">
                  <Label>{a.activeLabel}</Label>
                  <p className="text-[0.7rem] text-muted-foreground">Visible on site</p>
                </div>
                <Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t.admin.common.cancel}</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t.admin.common.loading : a.saveService}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
