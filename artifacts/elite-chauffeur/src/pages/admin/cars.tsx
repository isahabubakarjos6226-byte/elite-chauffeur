import { useState, useRef } from "react";
import { useListCars, useDeleteCar, getListCarsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Clock, Camera, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import CarPhotoUpload from "@/components/car-photo-upload";
import { useI18n } from "@/lib/i18n";

const carSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900),
  imageUrl: z.string().optional().nullable(),
  capacity: z.coerce.number().min(1),
  pricePerKm: z.coerce.number().min(0),
  baseFee: z.coerce.number().min(0),
  driverFee: z.coerce.number().min(0),
  available: z.boolean().default(true),
  availableForHourly: z.boolean().default(false),
  category: z.enum(["with_driver", "without_driver", "both"]),
  description: z.string().optional().nullable(),
  features: z.string().optional()
});

type CarFormValues = z.infer<typeof carSchema>;

const defaultValues: CarFormValues = {
  name: "", brand: "", model: "", year: new Date().getFullYear(),
  imageUrl: "", capacity: 4, pricePerKm: 5, baseFee: 50, driverFee: 0,
  available: true, availableForHourly: false, category: "with_driver", description: "", features: ""
};

// Inline photo uploader — shows a camera button that opens a file picker
function QuickPhotoUpload({ carId, onUploaded }: { carId: number; onUploaded: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const uploadRes = await fetch("/api/upload/car-photo", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json() as { url: string };
      const saveRes = await fetch(`/api/cars/${carId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });
      if (!saveRes.ok) throw new Error("Save failed");
      toast({ title: "Photo uploaded successfully" });
      onUploaded();
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />
      <Button
        variant="ghost"
        size="icon"
        title="Upload photo"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </Button>
    </>
  );
}

export default function AdminCars() {
  const { data: cars, isLoading } = useListCars();
  const deleteCar = useDeleteCar();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useI18n();
  const a = t.admin.cars;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);

  const form = useForm<CarFormValues>({ resolver: zodResolver(carSchema), defaultValues });

  const openNewCarDialog = () => {
    setEditingCar(null);
    form.reset(defaultValues);
    setIsDialogOpen(true);
  };

  const openEditCarDialog = (car: any) => {
    setEditingCar(car);
    form.reset({
      ...car,
      driverFee: car.driverFee ?? 0,
      availableForHourly: car.availableForHourly ?? false,
      features: car.features ? car.features.join(", ") : ""
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: CarFormValues) => {
    const data = {
      ...values,
      driverFee: values.driverFee ?? 0,
      features: values.features ? values.features.split(",").map(f => f.trim()).filter(Boolean) : [],
      availableForHourly: values.availableForHourly,
    };

    if (editingCar) {
      const res = await fetch(`/api/cars/${editingCar.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast({ title: a.editVehicle });
        queryClient.invalidateQueries({ queryKey: getListCarsQueryKey() });
        setIsDialogOpen(false);
      }
    } else {
      const res = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast({ title: a.addVehicle });
        queryClient.invalidateQueries({ queryKey: getListCarsQueryKey() });
        setIsDialogOpen(false);
      }
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(t.admin.common.areYouSure)) {
      deleteCar.mutate({ id }, {
        onSuccess: () => { toast({ title: t.admin.common.delete }); queryClient.invalidateQueries({ queryKey: getListCarsQueryKey() }); }
      });
    }
  };

  const refreshCars = () => queryClient.invalidateQueries({ queryKey: getListCarsQueryKey() });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">{a.title}</h1>
        <Button onClick={openNewCarDialog}>
          <Plus className="mr-2 h-4 w-4" /> {a.addVehicle}
        </Button>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead>{a.photo}</TableHead>
              <TableHead>{a.vehicle}</TableHead>
              <TableHead>{a.category}</TableHead>
              <TableHead>{a.capacity}</TableHead>
              <TableHead>{a.priceCol}</TableHead>
              <TableHead>{a.statusCol}</TableHead>
              <TableHead className="text-right">{a.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center h-24">{t.admin.common.loading}</TableCell></TableRow>
            ) : cars?.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center h-24 text-muted-foreground">{a.noCars}</TableCell></TableRow>
            ) : (
              cars?.map((car) => {
                const extCar = car as typeof car & { availableForHourly?: boolean };
                return (
                  <TableRow key={car.id}>
                    {/* Photo cell — shows image or upload button */}
                    <TableCell>
                      {car.imageUrl ? (
                        <div className="relative group w-20 h-14">
                          <img
                            src={car.imageUrl}
                            alt={`${car.brand} ${car.model}`}
                            className="w-20 h-14 object-cover rounded-md border border-border"
                          />
                          {/* Change photo overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                            <QuickPhotoUpload carId={car.id} onUploaded={refreshCars} />
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-14 rounded-md border border-dashed border-border bg-secondary/40 flex flex-col items-center justify-center gap-1">
                          <QuickPhotoUpload carId={car.id} onUploaded={refreshCars} />
                          <span className="text-[9px] text-muted-foreground">Add photo</span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-sm">{car.brand} {car.model}</div>
                      <div className="text-xs text-muted-foreground">{car.year} | {car.name}</div>
                      {extCar.availableForHourly && (
                        <Badge className="mt-1 text-[9px] bg-primary/15 text-primary border-none h-4 px-1.5">
                          <Clock className="w-2.5 h-2.5 mr-0.5" /> {t.fleet.hourlyCharter}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-secondary border-none">
                        {car.category.replace('_', ' ')}
                      </Badge>
                    </TableCell>

                    <TableCell>{car.capacity} pax</TableCell>

                    <TableCell>
                      <div className="text-sm font-medium text-primary">{car.pricePerKm}/km</div>
                      <div className="text-xs text-muted-foreground">{car.baseFee} base{car.driverFee > 0 ? ` · ${car.driverFee} driver` : ""}</div>
                    </TableCell>

                    <TableCell>
                      {car.available ? (
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-500/20 text-green-500">{a.available}</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-500/20 text-red-500">{a.unavailable}</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditCarDialog(car)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(car.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-primary">
              {editingCar ? a.editVehicle : a.addVehicle}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Photo upload */}
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>{a.vehiclePhoto}</FormLabel>
                  <FormControl><CarPhotoUpload value={field.value} onChange={field.onChange} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>{a.internalName}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="brand" render={({ field }) => (
                  <FormItem><FormLabel>{a.brand}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="model" render={({ field }) => (
                  <FormItem><FormLabel>{a.model}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="year" render={({ field }) => (
                  <FormItem><FormLabel>{a.year}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="capacity" render={({ field }) => (
                  <FormItem><FormLabel>{a.capacity} (pax)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="pricePerKm" render={({ field }) => (
                  <FormItem><FormLabel>{a.pricePerKm}</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="baseFee" render={({ field }) => (
                  <FormItem><FormLabel>{a.baseFee}</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="driverFee" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{a.driverFee}</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <p className="text-[0.75rem] text-muted-foreground mt-1">{a.driverFeeNote}</p>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{a.category}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="with_driver">{a.withDriver}</SelectItem>
                        <SelectItem value="without_driver">{a.withoutDriver}</SelectItem>
                        <SelectItem value="both">{a.both}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="available" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm h-[72px] mt-2">
                    <div className="space-y-0.5"><FormLabel>{a.availableLabel}</FormLabel></div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              </div>

              {/* Hourly Charter toggle */}
              <FormField control={form.control} name="availableForHourly" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-primary/30 p-4 shadow-sm bg-primary/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <FormLabel className="text-sm font-semibold cursor-pointer">{a.hourlyLabel}</FormLabel>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.hourlyNote}</p>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>{a.description}</FormLabel><FormControl><Textarea {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="features" render={({ field }) => (
                <FormItem>
                  <FormLabel>{a.features}</FormLabel>
                  <FormControl><Input placeholder={a.featuresPlaceholder} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full h-12" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t.admin.common.loading : (editingCar ? a.editVehicle : a.addVehicle)}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
