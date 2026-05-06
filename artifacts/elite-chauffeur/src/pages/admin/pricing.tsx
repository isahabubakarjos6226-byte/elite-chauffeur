import { useState } from "react";
import { useListPricing, useCreatePricing, useUpdatePricing, useDeletePricing, getListPricingQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";

const pricingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  pricePerKm: z.coerce.number().min(0),
  baseFee: z.coerce.number().min(0),
  category: z.enum(["with_driver", "without_driver", "both"]),
});

export default function AdminPricing() {
  const { data: pricingTiers, isLoading } = useListPricing();
  const createPricing = useCreatePricing();
  const updatePricing = useUpdatePricing();
  const deletePricing = useDeletePricing();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useI18n();
  const a = t.admin.pricing;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<any>(null);

  const form = useForm<z.infer<typeof pricingSchema>>({
    resolver: zodResolver(pricingSchema),
    defaultValues: { name: "", description: "", pricePerKm: 0, baseFee: 0, category: "with_driver" }
  });

  const openNewDialog = () => {
    setEditingTier(null);
    form.reset({ name: "", description: "", pricePerKm: 0, baseFee: 0, category: "with_driver" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (tier: any) => {
    setEditingTier(tier);
    form.reset({ ...tier, description: tier.description || "" });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: z.infer<typeof pricingSchema>) => {
    if (editingTier) {
      updatePricing.mutate({ id: editingTier.id, data }, {
        onSuccess: () => { toast({ title: a.editRule }); queryClient.invalidateQueries({ queryKey: getListPricingQueryKey() }); setIsDialogOpen(false); }
      });
    } else {
      createPricing.mutate({ data }, {
        onSuccess: () => { toast({ title: a.addRule }); queryClient.invalidateQueries({ queryKey: getListPricingQueryKey() }); setIsDialogOpen(false); }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(t.admin.common.areYouSure)) {
      deletePricing.mutate({ id }, {
        onSuccess: () => { toast({ title: t.admin.common.delete }); queryClient.invalidateQueries({ queryKey: getListPricingQueryKey() }); }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">{a.title}</h1>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" /> {a.addRule}
        </Button>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead>{a.ruleName}</TableHead>
              <TableHead>{a.category}</TableHead>
              <TableHead className="text-right">{a.baseFee}</TableHead>
              <TableHead className="text-right">{a.pricePerKm}</TableHead>
              <TableHead className="text-right">{t.admin.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24">{t.admin.common.loading}</TableCell></TableRow>
            ) : pricingTiers?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">{a.noRules}</TableCell></TableRow>
            ) : (
              pricingTiers?.map((tier) => (
                <TableRow key={tier.id}>
                  <TableCell>
                    <div className="font-semibold">{tier.name}</div>
                    <div className="text-xs text-muted-foreground max-w-md truncate">{tier.description}</div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-secondary text-secondary-foreground border border-border">
                      {tier.category.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">${tier.baseFee.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium text-primary">${tier.pricePerKm.toFixed(2)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(tier)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(tier.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-primary">
              {editingTier ? a.editRule : a.addRuleTitle}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>{a.ruleName}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="baseFee" render={({ field }) => (
                  <FormItem><FormLabel>{a.baseFee}</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="pricePerKm" render={({ field }) => (
                  <FormItem><FormLabel>{a.pricePerKm}</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>{a.category}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>{a.description}</FormLabel><FormControl><Textarea {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" className="w-full h-12 mt-4" disabled={createPricing.isPending || updatePricing.isPending}>
                {editingTier ? a.editRule : a.addRule}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
