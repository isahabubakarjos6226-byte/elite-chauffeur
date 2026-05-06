import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from "date-fns";
import { useGetCalendarReservations, useDeleteReservation, getGetCalendarReservationsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
  confirmed: "bg-blue-500/20 text-blue-500 border-blue-500/50",
  in_progress: "bg-orange-500/20 text-orange-500 border-orange-500/50",
  completed: "bg-green-500/20 text-green-500 border-green-500/50",
  cancelled: "bg-red-500/20 text-red-500 border-red-500/50",
};

export default function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { t } = useI18n();
  const a = t.admin.calendar;

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const { data: events, isLoading } = useGetCalendarReservations({ month, year });
  const deleteReservation = useDeleteReservation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month, 1));

  const handleDelete = (id: number) => {
    if (confirm(t.admin.common.areYouSure)) {
      deleteReservation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: t.admin.common.delete });
          queryClient.invalidateQueries({ queryKey: getGetCalendarReservationsQueryKey({ month, year }) });
        }
      });
    }
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const startingDayIndex = getDay(startOfMonth(currentDate));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">{a.title}</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold w-48 text-center">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border border-border bg-card rounded-lg overflow-hidden shadow-md">
        <div className="grid grid-cols-7 border-b border-border bg-secondary/50">
          {a.days.map((day) => (
            <div key={day} className="py-3 text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr">
          {Array.from({ length: startingDayIndex }).map((_, index) => (
            <div key={`empty-${index}`} className="min-h-[120px] p-2 border-r border-b border-border/50 bg-muted/20" />
          ))}

          {days.map((day) => {
            const dayEvents = events?.filter(e => e.date === format(day, "yyyy-MM-dd")) || [];
            return (
              <div
                key={day.toString()}
                className={`min-h-[120px] p-2 border-r border-b border-border/50 hover:bg-secondary/10 transition-colors ${
                  isSameDay(day, new Date()) ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'text-primary bg-primary/20 rounded-full w-6 h-6 flex items-center justify-center' : 'text-muted-foreground'}`}>
                    {format(day, "d")}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1.5 rounded border flex justify-between items-start group ${statusColors[event.status] || 'bg-accent border-border text-foreground'}`}
                      title={`${event.time} - ${event.customerName}`}
                    >
                      <div className="truncate pr-1">
                        <span className="font-semibold mr-1">{event.time}</span>
                        {event.customerName}
                      </div>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
