'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Format helpers
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${monthNames[month - 1]} ${day}, ${year}`;
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
}

// Date Picker Component
interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: string;
  defaultOpen?: boolean;
}

export function DatePicker({ value, onChange, placeholder = 'Select date', className, minDate, defaultOpen = false }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const [year, month] = value.split('-').map(Number);
      return new Date(year, month - 1, 1);
    }
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handleSelectDate = (day: number) => {
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${currentMonth.getFullYear()}-${month}-${dayStr}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const isDateDisabled = (day: number) => {
    if (!minDate) return false;
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr < minDate;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const [year, month, d] = value.split('-').map(Number);
    return (
      day === d &&
      currentMonth.getMonth() === month - 1 &&
      currentMonth.getFullYear() === year
    );
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${monthNames[month - 1]} ${day}, ${year}`;
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 bg-input border border-border rounded-lg px-4 py-3 text-left transition-colors hover:border-foreground/50",
          className
        )}
      >
        <Calendar size={18} className="text-muted-foreground flex-shrink-0" />
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-card border border-border rounded-xl shadow-2xl p-4 w-72">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="p-1 hover:bg-secondary rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-foreground" />
            </button>
            <span className="font-medium text-foreground">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="p-1 hover:bg-secondary rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-foreground" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div key={index} className="aspect-square">
                {day !== null && (
                  <button
                    type="button"
                    onClick={() => handleSelectDate(day)}
                    disabled={isDateDisabled(day)}
                    className={cn(
                      "w-full h-full flex items-center justify-center text-sm rounded-lg transition-colors",
                      isSelected(day) && "bg-foreground text-background font-medium",
                      isToday(day) && !isSelected(day) && "border border-foreground",
                      !isSelected(day) && !isDateDisabled(day) && "hover:bg-secondary text-foreground",
                      isDateDisabled(day) && "text-muted-foreground/50 cursor-not-allowed"
                    )}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Today button */}
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const day = String(today.getDate()).padStart(2, '0');
              const dateStr = `${today.getFullYear()}-${month}-${day}`;
              onChange(dateStr);
              setCurrentMonth(today);
              setIsOpen(false);
            }}
            className="w-full mt-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
}

// Time Picker Component
interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  defaultOpen?: boolean;
}

export function TimePicker({ value, onChange, placeholder = 'Select time', className, defaultOpen = false }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate time slots (every 30 minutes)
  const timeSlots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = String(hour).padStart(2, '0');
      const m = String(minute).padStart(2, '0');
      timeSlots.push(`${h}:${m}`);
    }
  }

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  const handleSelectTime = (time: string) => {
    onChange(time);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 bg-input border border-border rounded-lg px-4 py-3 text-left transition-colors hover:border-foreground/50",
          className
        )}
      >
        <Clock size={18} className="text-muted-foreground flex-shrink-0" />
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value ? formatDisplayTime(value) : placeholder}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-card border border-border rounded-xl shadow-2xl p-2 w-48 max-h-64 overflow-y-auto">
          <div className="space-y-0.5">
            {timeSlots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleSelectTime(time)}
                className={cn(
                  "w-full px-3 py-2 text-sm rounded-lg text-left transition-colors",
                  value === time 
                    ? "bg-foreground text-background font-medium" 
                    : "text-foreground hover:bg-secondary"
                )}
              >
                {formatDisplayTime(time)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
