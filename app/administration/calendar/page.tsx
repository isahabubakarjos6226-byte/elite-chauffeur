'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, List } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const statusColors = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  in_progress: 'bg-purple-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export default function AdminCalendarPage() {
  const { reservations, cars, updateReservation } = useStore();
  const { t, locale } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString(locale, { month: 'long' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    
    // Previous month padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, date: null });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayReservations = reservations.filter(r => r.pickup_date === date);
      days.push({ day: i, date, reservations: dayReservations });
    }
    
    return days;
  }, [year, month, firstDayOfMonth, daysInMonth, reservations]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleCancelReservation = (id: number) => {
    updateReservation(id, { status: 'cancelled' });
  };

  const getCarName = (carId: number) => {
    const car = cars.find(c => c.id === carId);
    return car ? car.brand : 'Unknown';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return t.admin.pending;
      case 'confirmed': return t.admin.confirmed;
      case 'in_progress': return t.admin.inProgress;
      case 'completed': return t.admin.completed;
      case 'cancelled': return t.admin.cancelled;
      default: return status;
    }
  };

  const statusCounts = useMemo(() => {
    return {
      pending: reservations.filter(r => r.status === 'pending').length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      in_progress: reservations.filter(r => r.status === 'in_progress').length,
      completed: reservations.filter(r => r.status === 'completed').length,
      cancelled: reservations.filter(r => r.status === 'cancelled').length,
    };
  }, [reservations]);

  // Get day names in current locale
  const getDayNames = () => {
    const days = [];
    const date = new Date(2024, 0, 7); // Start from Sunday
    for (let i = 0; i < 7; i++) {
      date.setDate(7 + i);
      days.push(date.toLocaleString(locale, { weekday: 'short' }));
    }
    return days;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">{t.admin.calendar}</h1>
          <p className="text-muted-foreground">{t.admin.calendarDesc || 'View and manage scheduled reservations.'}</p>
        </div>
        <Link
          href="/administration/reservations"
          className="ec-btn-outline inline-flex items-center gap-2"
        >
          <List size={18} />
          {t.admin.listView || 'List View'}
        </Link>
      </div>

      {/* Calendar Header */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <h2 className="font-serif text-xl text-foreground capitalize">
            {monthName} {year}
          </h2>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm bg-secondary text-foreground rounded-lg hover:bg-foreground hover:text-background transition-colors"
          >
            {t.admin.today || 'Today'}
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {getDayNames().map((day, i) => (
            <div key={i} className="px-2 py-3 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const isToday = day.date === new Date().toISOString().split('T')[0];
            
            return (
              <div 
                key={index}
                className={cn(
                  'min-h-[120px] p-2 border-b border-r border-border',
                  !day.day && 'bg-secondary/30',
                  isToday && 'bg-foreground/5'
                )}
              >
                {day.day && (
                  <>
                    <div className={cn(
                      'text-sm mb-2',
                      isToday 
                        ? 'w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center font-medium'
                        : 'text-muted-foreground'
                    )}>
                      {day.day}
                    </div>
                    <div className="space-y-1">
                      {day.reservations?.slice(0, 3).map((reservation) => (
                        <div
                          key={reservation.id}
                          className={cn(
                            'group relative px-2 py-1 rounded text-xs text-white truncate',
                            statusColors[reservation.status]
                          )}
                          title={`${reservation.customer_name} - ${getCarName(reservation.car_id)}`}
                        >
                          <span className="truncate">
                            {reservation.customer_name} - {getCarName(reservation.car_id)}
                          </span>
                          {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                            <button
                              onClick={() => handleCancelReservation(reservation.id)}
                              className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                              title={t.common.cancel}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      {day.reservations && day.reservations.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{day.reservations.length - 3} {t.admin.more || 'more'}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Stats */}
      <div className="mt-6 grid sm:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">{t.admin.statusLegend || 'Status Legend'}</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded-full', color)} />
                <span className="text-sm text-muted-foreground capitalize">
                  {getStatusLabel(status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">{t.admin.summary || 'Summary'}</h3>
          <div className="grid grid-cols-5 gap-2 text-center">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status}>
                <div className={cn(
                  'w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-white text-sm font-medium',
                  statusColors[status as keyof typeof statusColors]
                )}>
                  {count}
                </div>
                <p className="text-xs text-muted-foreground capitalize">
                  {getStatusLabel(status)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
