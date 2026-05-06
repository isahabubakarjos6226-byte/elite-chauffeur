import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useListCars, useCreateReservation, getListReservationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import LocationAutocomplete from "@/components/location-autocomplete";
import RouteMap from "@/components/route-map";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/site-settings";

const bookingSchema = z.object({
  pickupLocation: z.string().min(2, "Pickup location is required"),
  dropoffLocation: z.string().min(2, "Dropoff location is required"),
  pickupDate: z.date({ required_error: "A date is required" }),
  pickupTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Valid time required (HH:MM)"),
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email required"),
  customerPhone: z.string().optional(),
  carId: z.string().min(1, "Please select a vehicle"),
  withDriver: z.boolean().default(true),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface Coords { lat: number; lon: number }

export default function BookingForm({ isFullPage = false }: { isFullPage?: boolean }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { showChauffeurService, formatPrice } = useSiteSettings();

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [pickupCoords, setPickupCoords] = useState<Coords | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<Coords | null>(null);

  const { data: cars, isLoading: isCarsLoading } = useListCars({ available: true });
  const createReservation = useCreateReservation();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      pickupLocation: "",
      dropoffLocation: "",
      pickupTime: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      carId: "",
      withDriver: true,
      notes: "",
    },
  });

  // Pre-select car from URL query param (e.g. /book?car=3)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const carId = params.get("car");
    if (carId) form.setValue("carId", carId);
  }, []);

  const selectedCarId = form.watch("carId");
  const selectedCar = cars?.find(c => c.id.toString() === selectedCarId);
  const withDriver = form.watch("withDriver");

  const driverFeeAmount = withDriver ? (selectedCar?.driverFee ?? 0) : 0;
  const rideCost = distanceKm && selectedCar
    ? (distanceKm * selectedCar.pricePerKm) + selectedCar.baseFee
    : null;
  const estimatedCost = rideCost != null ? rideCost + driverFeeAmount : null;

  const showPriceBox = !!selectedCar;
  const showMap = !!(pickupCoords || dropoffCoords);

  const calculateDistance = async () => {
    const origin = form.getValues("pickupLocation");
    const destination = form.getValues("dropoffLocation");

    if (!origin || !destination) {
      toast({ title: "Error", description: "Please enter both pickup and dropoff locations", variant: "destructive" });
      return;
    }

    setIsCalculating(true);
    try {
      const res = await fetch("/api/distance/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination })
      });
      const data = await res.json() as { distanceKm: number; durationMinutes: number };
      if (data.distanceKm > 0) {
        setDistanceKm(data.distanceKm);
        toast({ title: "Distance Calculated", description: `Estimated distance: ${data.distanceKm.toFixed(1)} km` });
      } else {
        if (pickupCoords && dropoffCoords) {
          const R = 6371;
          const dLat = (dropoffCoords.lat - pickupCoords.lat) * Math.PI / 180;
          const dLon = (dropoffCoords.lon - pickupCoords.lon) * Math.PI / 180;
          const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(pickupCoords.lat * Math.PI / 180) * Math.cos(dropoffCoords.lat * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
          const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const roadEst = km * 1.3;
          setDistanceKm(Math.round(roadEst * 10) / 10);
          toast({ title: "Distance Estimated", description: `Approx. ${roadEst.toFixed(1)} km (straight-line estimate ×1.3)` });
        } else {
          toast({ title: "Info", description: "Add a Google Maps API key for precise distance, or enter distance manually." });
        }
      }
    } catch {
      toast({ title: "Calculation Failed", description: "Could not calculate distance.", variant: "destructive" });
    } finally {
      setIsCalculating(false);
    }
  };

  const onSubmit = (data: BookingFormValues) => {
    const fallbackDriverFee = data.withDriver ? (selectedCar?.driverFee ?? 0) : 0;
    const finalPrice = estimatedCost || (selectedCar ? selectedCar.baseFee + (15 * selectedCar.pricePerKm) + fallbackDriverFee : 0);
    const finalDriverFee = withDriver ? (selectedCar?.driverFee ?? 0) : 0;

    createReservation.mutate({
      data: {
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        pickupDate: format(data.pickupDate, "yyyy-MM-dd"),
        pickupTime: data.pickupTime,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone || null,
        carId: parseInt(data.carId),
        withDriver: data.withDriver,
        notes: data.notes || null,
        distanceKm: distanceKm || 15,
        driverFee: finalDriverFee,
        totalPrice: finalPrice,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Reservation Submitted", description: "We will contact you shortly to confirm your booking." });
        queryClient.invalidateQueries({ queryKey: getListReservationsQueryKey() });
        form.reset();
        setDistanceKm(null);
        setPickupCoords(null);
        setDropoffCoords(null);
        if (!isFullPage) setLocation("/book");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to submit reservation. Please try again.", variant: "destructive" });
      }
    });
  };

  const pickupVal = form.watch("pickupLocation");
  const dropoffVal = form.watch("dropoffLocation");

  return (
    <div className={cn("bg-card text-card-foreground rounded-lg border border-border shadow-xl", isFullPage ? "p-8" : "p-6")}>
      {!isFullPage && <h2 className="text-2xl font-bold mb-6 text-primary uppercase tracking-wider">{t.form.reserveTitle}</h2>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pickupLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.form.pickup}</FormLabel>
                  <FormControl>
                    <LocationAutocomplete
                      value={field.value}
                      onChange={field.onChange}
                      onCoords={(lat, lon) => setPickupCoords({ lat, lon })}
                      placeholder={t.form.pickupPlaceholder}
                      icon={<MapPin className="h-4 w-4" />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dropoffLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.form.dropoff}</FormLabel>
                  <FormControl>
                    <LocationAutocomplete
                      value={field.value}
                      onChange={field.onChange}
                      onCoords={(lat, lon) => setDropoffCoords({ lat, lon })}
                      placeholder={t.form.dropoffPlaceholder}
                      icon={<Navigation className="h-4 w-4" />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {showMap && (
            <RouteMap
              pickup={pickupCoords ? { lat: pickupCoords.lat, lon: pickupCoords.lon, label: form.getValues("pickupLocation") } : undefined}
              dropoff={dropoffCoords ? { lat: dropoffCoords.lat, lon: dropoffCoords.lon, label: form.getValues("dropoffLocation") } : undefined}
            />
          )}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={calculateDistance}
              disabled={isCalculating}
              className="text-xs ml-auto"
            >
              {isCalculating && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              {t.form.calculateDistance}
            </Button>
            {distanceKm && (
              <span className="text-xs text-muted-foreground">
                {distanceKm.toFixed(1)} km
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pickupDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t.form.date}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-input border-border",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>{t.form.pickDate}</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pickupTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.form.time}</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className={`grid gap-4 ${showChauffeurService ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
            <FormField
              control={form.control}
              name="carId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.form.vehicle}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.form.vehiclePlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isCarsLoading ? (
                        <SelectItem value="loading" disabled>{t.form.loadingVehicles}</SelectItem>
                      ) : cars?.length === 0 ? (
                        <SelectItem value="none" disabled>{t.form.noVehicles}</SelectItem>
                      ) : (
                        cars?.map((car) => (
                          <SelectItem key={car.id} value={car.id.toString()}>
                            {car.brand} {car.model}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showChauffeurService && (
              <FormField
                control={form.control}
                name="withDriver"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm bg-input">
                    <div className="space-y-0.5">
                      <FormLabel>{t.form.chauffeur}</FormLabel>
                      <div className="text-[0.8rem] text-muted-foreground">
                        {t.form.chauffeurDesc}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={selectedCar?.category === "without_driver"}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Price breakdown */}
          {showPriceBox && (
            <div className="p-4 bg-secondary/50 rounded-lg border border-primary/20 space-y-2 transition-all">
              {/* Pickup / Dropoff summary */}
              {(pickupVal || dropoffVal) && (
                <div className="text-xs text-muted-foreground border-b border-primary/10 pb-2 mb-2 space-y-1">
                  {pickupVal && (
                    <div className="flex gap-2">
                      <span className="shrink-0 text-primary">{t.price.from}:</span>
                      <span className="truncate">{pickupVal}</span>
                    </div>
                  )}
                  {dropoffVal && (
                    <div className="flex gap-2">
                      <span className="shrink-0 text-primary">{t.price.to}:</span>
                      <span className="truncate">{dropoffVal}</span>
                    </div>
                  )}
                </div>
              )}

              {distanceKm ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.price.distance}</span>
                    <span>{distanceKm.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.price.baseFee}</span>
                    <span>{formatPrice(selectedCar.baseFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.price.distanceCost} ({distanceKm.toFixed(1)} km × {formatPrice(selectedCar.pricePerKm)}/km)</span>
                    <span>{formatPrice(distanceKm * selectedCar.pricePerKm)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.price.baseFee}</span>
                  <span>{formatPrice(selectedCar.baseFee)}</span>
                </div>
              )}

              {driverFeeAmount > 0 ? (
                <div className="flex justify-between text-sm text-foreground/90 transition-all">
                  <span className="text-muted-foreground">+ {t.price.chauffeurFee}</span>
                  <span className="font-medium">+{formatPrice(driverFeeAmount)}</span>
                </div>
              ) : withDriver && selectedCar.driverFee === 0 ? null : !withDriver && selectedCar.driverFee > 0 ? (
                <div className="flex justify-between text-sm line-through opacity-40">
                  <span>{t.price.chauffeurFee}</span>
                  <span>{formatPrice(selectedCar.driverFee)}</span>
                </div>
              ) : null}

              <div className="flex justify-between items-center pt-2 border-t border-primary/20">
                <span className="font-semibold text-primary">{t.price.estimatedTotal}</span>
                {estimatedCost != null ? (
                  <span className="text-2xl font-bold text-primary">{formatPrice(estimatedCost)}</span>
                ) : (
                  <div className="text-right">
                    <span className="text-xl font-bold text-primary">{formatPrice(selectedCar.baseFee + driverFeeAmount)}</span>
                    <div className="text-[0.7rem] text-muted-foreground">{t.price.calculateToSeeTotal}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.form.fullName}</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.form.email}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isFullPage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.form.phone}</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.form.notes}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t.form.notesPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <Button type="submit" className="w-full text-lg h-12" disabled={createReservation.isPending}>
            {createReservation.isPending ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t.form.processing}</>
            ) : (
              t.form.submit
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
