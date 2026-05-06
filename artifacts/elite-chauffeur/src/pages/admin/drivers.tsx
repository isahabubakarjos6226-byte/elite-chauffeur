import { useState } from "react";
import { useListDrivers, useCreateDriver, useUpdateDriver, useDeleteDriver, getListDriversQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

const driverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional().nullable(),
  email: z.string().email("Valid email required").optional().nullable().or(z.literal('')),
  photoUrl: z.string().optional().nullable(),
  available: z.boolean().default(true),
  rating: z.coerce.number().min(0).max(5).default(5),
  languages: z.string().optional(),
  yearsExperience: z.coerce.number().min(0).default(0)
});

export default function AdminDrivers() {
  const { data: drivers, isLoading } = useListDrivers();
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();
  const deleteDriver = useDeleteDriver();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useI18n();
  const a = t.admin.drivers;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);

  const form = useForm<z.infer<typeof driverSchema>>({
    resolver: zodResolver(driverSchema),
    defaultValues: { name: "", phone: "", email: "", photoUrl: "", available: true, rating: 5, languages: "", yearsExperience: 0 }
  });

  const openNewDriverDialog = () => {
    setEditingDriver(null);
    form.reset({ name: "", phone: "", email: "", photoUrl: "", available: true, rating: 5, languages: "", yearsExperience: 0 });
    setIsDialogOpen(true);
  };

  const openEditDriverDialog = (driver: any) => {
    setEditingDriver(driver);
    form.reset({ ...driver, email: driver.email || "", languages: driver.languages ? driver.languages.join(", ") : "" });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof driverSchema>) => {
    const data = {
      ...values,
      email: values.email || null,
      languages: values.languages ? values.languages.split(",").map((l: string) => l.trim()).filter((l: string) => l) : []
    };
    if (editingDriver) {
      updateDriver.mutate({ id: editingDriver.id, data }, {
        onSuccess: () => { toast({ title: a.editChauffeur }); queryClient.invalidateQueries({ queryKey: getListDriversQueryKey() }); setIsDialogOpen(false); }
      });
    } else {
      createDriver.mutate({ data }, {
        onSuccess: () => { toast({ title: a.addChauffeur }); queryClient.invalidateQueries({ queryKey: getListDriversQueryKey() }); setIsDialogOpen(false); }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(t.admin.common.areYouSure)) {
      deleteDriver.mutate({ id }, {
        onSuccess: () => { toast({ title: t.admin.common.delete }); queryClient.invalidateQueries({ queryKey: getListDriversQueryKey() }); }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">{a.title}</h1>
        <Button onClick={openNewDriverDialog}>
          <Plus className="mr-2 h-4 w-4" /> {a.addDriver}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">{t.admin.common.loading}</div>
        ) : drivers?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">{a.noDrivers}</div>
        ) : (
          drivers?.map((driver) => (
            <div key={driver.id} className="bg-card border border-border rounded-xl p-6 shadow-md relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-full bg-secondary/50 border border-primary/20 flex items-center justify-center overflow-hidden">
                  {driver.photoUrl ? (
                    <img src={driver.photoUrl} alt={driver.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold font-serif text-primary">{driver.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm font-medium">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  {driver.rating}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-1">{driver.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{driver.yearsExperience} {a.yearsExp}</p>

              <div className="space-y-2 mb-6">
                <div className="text-sm">
                  <span className="text-muted-foreground block text-xs">{a.contact}</span>
                  {driver.phone || a.noPhone} <br/>
                  <span className="text-xs text-muted-foreground">{driver.email || a.noEmail}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground block text-xs mb-1">{a.languages}</span>
                  <div className="flex flex-wrap gap-1">
                    {driver.languages?.length ? driver.languages.map((l: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-[10px] bg-secondary border-none">{l}</Badge>
                    )) : <span className="text-xs text-muted-foreground">{a.notSpecified}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  {driver.available ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-green-500">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> {t.admin.cars.available}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-red-500">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> {t.admin.cars.unavailable}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDriverDialog(driver)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleDelete(driver.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-primary">
              {editingDriver ? a.editChauffeur : a.addChauffeur}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>{a.fullName}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>{a.phone}</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>{a.email}</FormLabel><FormControl><Input type="email" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="rating" render={({ field }) => (
                  <FormItem><FormLabel>{a.rating}</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="yearsExperience" render={({ field }) => (
                  <FormItem><FormLabel>{a.experience}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="languages" render={({ field }) => (
                <FormItem><FormLabel>{a.langLabel}</FormLabel><FormControl><Input placeholder="English, French…" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="photoUrl" render={({ field }) => (
                <FormItem><FormLabel>{a.photoUrl}</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="available" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>{a.activeStatus}</FormLabel>
                    <p className="text-xs text-muted-foreground">{a.availableForAssignment}</p>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full h-12 mt-4" disabled={createDriver.isPending || updateDriver.isPending}>
                {editingDriver ? a.editChauffeur : a.addChauffeur}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
