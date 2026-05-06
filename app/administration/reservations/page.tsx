'use client';

import { useState, useMemo } from 'react';
import { Eye, Trash2, X, MapPin, Calendar, Clock, User, Mail, Phone, DollarSign, FileText, Send, Bell, Check, ChevronDown, Plus, Car, Loader2, CalendarDays } from 'lucide-react';
import { useStore, formatPrice, calculateTotalPrice, calculateRentalDays } from '@/lib/store';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { useLanguage } from '@/lib/language-context';
import { locales, getTranslation, type Locale } from '@/lib/i18n';
import { FlagIcon } from '@/components/public/FlagIcon';
import { cn } from '@/lib/utils';
import type { Reservation } from '@/lib/types';
import { DatePicker, TimePicker, formatDate, formatTime } from '@/components/ui/date-time-picker';
import { RouteMap } from '@/components/ui/route-map';

const statusFilters = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
const statusOptions = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

export default function AdminReservationsPage() {
  const { reservations, cars, drivers, settings, currentUser, updateReservation, deleteReservation, addReservation } = useStore();
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [page, setPage] = useState(1);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailType, setEmailType] = useState<'confirmation' | 'reminder'>('confirmation');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailLanguage, setEmailLanguage] = useState<Locale>('en');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [includePdfInvoice, setIncludePdfInvoice] = useState(true);
  const [showStatusDropdown, setShowStatusDropdown] = useState<number | null>(null);
  const [editingDate, setEditingDate] = useState<{ id: number; field: 'date' | 'time' } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReservation, setNewReservation] = useState({
    booking_type: 'transfer' as 'transfer' | 'daily',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    pickup_location: '',
    dropoff_location: '',
    pickup_date: '',
    pickup_time: '',
    return_date: '',
    return_time: '',
    rental_days: 1,
    distance_km: 0,
    car_id: 0,
    driver_id: null as number | null,
    with_driver: true,
    notes: '',
    status: 'pending' as const,
  });
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [newPickupCoords, setNewPickupCoords] = useState<{ lat: number; lon: number; display_name?: string } | null>(null);
  const [newDropoffCoords, setNewDropoffCoords] = useState<{ lat: number; lon: number; display_name?: string } | null>(null);
  const perPage = 15;

  // Check if current user is admin (can add/delete reservations)
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  const filteredReservations = useMemo(() => {
    let filtered = [...reservations];
    if (activeFilter !== 'all') {
      filtered = filtered.filter(r => r.status === activeFilter);
    }
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [reservations, activeFilter]);

  const paginatedReservations = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredReservations.slice(start, start + perPage);
  }, [filteredReservations, page]);

  const totalPages = Math.ceil(filteredReservations.length / perPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'ec-status--pending';
      case 'confirmed': return 'ec-status--confirmed';
      case 'in_progress': return 'ec-status--in_progress';
      case 'completed': return 'ec-status--completed';
      case 'cancelled': return 'ec-status--cancelled';
      default: return '';
    }
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

  const handleStatusUpdate = (id: number, status: string) => {
    updateReservation(id, { status: status as Reservation['status'] });
    if (selectedReservation?.id === id) {
      setSelectedReservation({ ...selectedReservation, status: status as Reservation['status'] });
    }
    setShowStatusDropdown(null);
  };

  const handleDateTimeUpdate = (id: number, field: 'pickup_date' | 'pickup_time', value: string) => {
    updateReservation(id, { [field]: value });
    if (selectedReservation?.id === id) {
      setSelectedReservation({ ...selectedReservation, [field]: value });
    }
    setEditingDate(null);
  };

  const handleDelete = (id: number) => {
    if (!isAdmin) return;
    if (confirm(t.admin.confirmDelete || 'Are you sure you want to delete this reservation?')) {
      deleteReservation(id);
      setSelectedReservation(null);
    }
  };

  const getCarDetails = (carId: number) => cars.find(c => c.id === carId);
  const getDriverDetails = (driverId: number | null) => driverId ? drivers.find(d => d.id === driverId) : null;

// Calculate total for new reservation
  const calculateNewReservationTotal = () => {
    const car = cars.find(c => c.id === newReservation.car_id);
    if (!car) return 0;
    
    // Calculate rental days if daily rental
    let rentalDays = newReservation.rental_days;
    if (newReservation.booking_type === 'daily' && newReservation.pickup_date && newReservation.return_date) {
      rentalDays = calculateRentalDays(newReservation.pickup_date, newReservation.return_date);
    }
    
    return calculateTotalPrice(
      car, 
      newReservation.distance_km, 
      newReservation.with_driver,
      newReservation.booking_type,
      rentalDays,
      settings.showChauffeurService
    );
  };

  // Calculate distance for new reservation
  const handleCalculateNewDistance = async () => {
    if (!newReservation.pickup_location || !newReservation.dropoff_location) return;
    
    setIsCalculatingDistance(true);
    
    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup: newReservation.pickup_location,
          dropoff: newReservation.dropoff_location,
        }),
      });
      
      const data = await response.json();
      
      if (data.distanceKm) {
        setNewReservation(prev => ({ ...prev, distance_km: data.distanceKm }));
        setNewPickupCoords(data.pickup);
        setNewDropoffCoords(data.dropoff);
      }
    } catch (error) {
      console.error('Distance calculation error:', error);
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  // Handle add reservation
  const handleAddReservation = () => {
    if (!isAdmin) return;
    
    const car = cars.find(c => c.id === newReservation.car_id);
    if (!car || !newReservation.customer_name || !newReservation.pickup_date) return;

    const total = calculateNewReservationTotal();
    
addReservation({
  ...newReservation,
  driver_fee: newReservation.with_driver && settings.showChauffeurService ? car.driver_fee : 0,
  total_price: total,
  });

// Reset form
  setNewReservation({
  booking_type: 'transfer',
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  pickup_location: '',
  dropoff_location: '',
  pickup_date: '',
  pickup_time: '',
  return_date: '',
  return_time: '',
  rental_days: 1,
  distance_km: 0,
  car_id: 0,
  driver_id: null,
  with_driver: true,
  notes: '',
  status: 'pending',
  });
  setNewPickupCoords(null);
  setNewDropoffCoords(null);
  setShowAddModal(false);
  };

  // Prepare email template
  const prepareEmailTemplate = (type: 'confirmation' | 'reminder', reservation: Reservation, lang: Locale) => {
    const langT = getTranslation(lang);
    const car = getCarDetails(reservation.car_id);
    
    const replacements: Record<string, string> = {
      '{name}': reservation.customer_name,
      '{date}': formatDate(reservation.pickup_date),
      '{time}': formatTime(reservation.pickup_time),
      '{pickup}': reservation.pickup_location,
      '{dropoff}': reservation.dropoff_location,
      '{vehicle}': car ? `${car.brand} ${car.model}` : 'Vehicle',
      '{total}': formatPrice(reservation.total_price, settings),
    };

    const subject = type === 'confirmation' ? langT.admin.confirmationSubject : langT.admin.reminderSubject;
    let body = type === 'confirmation' ? langT.admin.confirmationTemplate : langT.admin.reminderTemplate;
    
    Object.entries(replacements).forEach(([key, value]) => {
      body = body.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    return { subject, body };
  };

  // Open email modal
  const openEmailModal = (type: 'confirmation' | 'reminder') => {
    if (!selectedReservation) return;
    setEmailType(type);
    const { subject, body } = prepareEmailTemplate(type, selectedReservation, emailLanguage);
    setEmailSubject(subject);
    setEmailBody(body);
    setIncludePdfInvoice(true);
    setShowEmailModal(true);
  };

  // Handle language change in email modal
  const handleEmailLanguageChange = (lang: Locale) => {
    setEmailLanguage(lang);
    if (selectedReservation) {
      const { subject, body } = prepareEmailTemplate(emailType, selectedReservation, lang);
      setEmailSubject(subject);
      setEmailBody(body);
    }
  };

  // Generate PDF Invoice
  const generateInvoicePDF = async (reservation: Reservation) => {
    const car = getCarDetails(reservation.car_id);
    const driver = getDriverDetails(reservation.driver_id);
    const logoUrl = settings.invoiceLogoUrl || settings.websiteLogoUrl || '';
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${reservation.id.toString().padStart(4, '0')}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica', 'Arial', sans-serif; background: #fff; color: #000; padding: 40px; }
          .invoice { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .logo { font-size: 32px; font-weight: bold; letter-spacing: 2px; }
          .logo-img { max-height: 60px; max-width: 200px; object-fit: contain; }
          .logo-sub { font-size: 12px; color: #666; letter-spacing: 4px; }
          .invoice-info { text-align: right; }
          .invoice-number { font-size: 24px; font-weight: bold; }
          .invoice-date { color: #666; margin-top: 5px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 14px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-block h4 { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 5px; }
          .info-block p { font-size: 14px; }
          .journey-box { background: #f5f5f5; padding: 20px; border-radius: 8px; }
          .journey-item { margin-bottom: 15px; }
          .journey-item:last-child { margin-bottom: 0; }
          .journey-label { font-size: 12px; color: #666; text-transform: uppercase; }
          .journey-value { font-size: 14px; margin-top: 3px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
          .table th { background: #f5f5f5; font-size: 12px; text-transform: uppercase; color: #666; }
          .table td { font-size: 14px; }
          .table .amount { text-align: right; }
          .total-row { border-top: 2px solid #000; }
          .total-row td { font-weight: bold; font-size: 16px; padding-top: 15px; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; text-transform: uppercase; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-confirmed { background: #dbeafe; color: #1e40af; }
          .status-completed { background: #d1fae5; color: #065f46; }
          .status-cancelled { background: #fee2e2; color: #991b1b; }
          .status-in_progress { background: #e9d5ff; color: #6b21a8; }
          @media print { body { padding: 20px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div>
              ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo-img" />` : `<div class="logo">${settings.siteName.toUpperCase()}</div>`}
              <div class="logo-sub">${settings.tagline.toUpperCase()}</div>
            </div>
            <div class="invoice-info">
              <div class="invoice-number">INVOICE #${reservation.id.toString().padStart(4, '0')}</div>
              <div class="invoice-date">Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div style="margin-top: 10px;">
                <span class="status status-${reservation.status}">${reservation.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="info-grid">
              <div class="info-block"><h4>Name</h4><p>${reservation.customer_name}</p></div>
              <div class="info-block"><h4>Email</h4><p>${reservation.customer_email}</p></div>
              <div class="info-block"><h4>Phone</h4><p>${reservation.customer_phone}</p></div>
              <div class="info-block"><h4>Booking Date</h4><p>${reservation.created_at}</p></div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Journey Details</div>
            <div class="journey-box">
              <div class="info-grid">
                <div class="journey-item"><div class="journey-label">Pickup</div><div class="journey-value">${reservation.pickup_location}</div></div>
                <div class="journey-item"><div class="journey-label">Drop-off</div><div class="journey-value">${reservation.dropoff_location}</div></div>
                <div class="journey-item"><div class="journey-label">Date</div><div class="journey-value">${formatDate(reservation.pickup_date)}</div></div>
                <div class="journey-item"><div class="journey-label">Time</div><div class="journey-value">${formatTime(reservation.pickup_time)}</div></div>
                <div class="journey-item"><div class="journey-label">Distance</div><div class="journey-value">${reservation.distance_km} km</div></div>
              </div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Service Details</div>
            <table class="table">
              <thead><tr><th>Description</th><th class="amount">Amount</th></tr></thead>
              <tbody>
                <tr><td><strong>${car ? `${car.brand} ${car.model}` : 'Vehicle'}</strong>${car ? `<br><span style="color:#666;font-size:12px;">${car.category} - ${car.year}</span>` : ''}</td><td class="amount">${formatPrice(car?.base_fee || 0, settings)} (Base)</td></tr>
                <tr><td>Distance (${reservation.distance_km} km x ${formatPrice(car?.price_per_km || 0, settings)}/km)</td><td class="amount">${formatPrice((reservation.distance_km || 0) * (car?.price_per_km || 0), settings)}</td></tr>
                ${settings.showChauffeurService && reservation.with_driver && driver ? `<tr><td><strong>Chauffeur</strong><br><span style="color:#666;font-size:12px;">${driver.name}</span></td><td class="amount">${formatPrice(reservation.driver_fee || 0, settings)}</td></tr>` : ''}
                <tr class="total-row"><td>TOTAL</td><td class="amount">${formatPrice(reservation.total_price, settings)}</td></tr>
              </tbody>
            </table>
          </div>
          ${reservation.notes ? `<div class="section"><div class="section-title">Notes</div><p style="color:#666;">${reservation.notes}</p></div>` : ''}
          <div class="footer">
            <p><strong>${settings.siteName}</strong></p>
            <p>${settings.contactAddress || '123 Luxury Lane, New York, NY 10001'}</p>
            <p>Phone: ${settings.contactPhone || '+1 (555) 123-4567'} | Email: ${settings.contactEmail || 'concierge@elitechauffeur.com'}</p>
            <p style="margin-top:20px;">Thank you for choosing ${settings.siteName}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  // Send Email (simulation)
  const handleSendEmail = async () => {
    if (!selectedReservation) return;
    setEmailSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setEmailSending(false);
    setEmailSent(true);
    setTimeout(() => {
      setShowEmailModal(false);
      setEmailSent(false);
    }, 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">{t.admin.reservations}</h1>
          <p className="text-muted-foreground">{t.admin.manageReservations || 'Manage and track all bookings.'}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
          >
            <Plus size={18} />
            {t.admin.addReservation || 'Add Reservation'}
          </button>
        )}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => { setActiveFilter(filter); setPage(1); }}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all capitalize',
              activeFilter === filter
                ? 'bg-foreground text-background'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {filter === 'all' ? t.common.all : getStatusLabel(filter)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.customer}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.dateTime}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.route}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.amount}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.status}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground">#{reservation.id.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-foreground">{reservation.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{reservation.customer_email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 relative">
                      <button 
                        onClick={() => setEditingDate({ id: reservation.id, field: 'date' })}
                        className="text-sm text-foreground hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Calendar size={12} />
                        {formatDate(reservation.pickup_date)}
                      </button>
                      <button 
                        onClick={() => setEditingDate({ id: reservation.id, field: 'time' })}
                        className="text-xs text-muted-foreground hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Clock size={12} />
                        {formatTime(reservation.pickup_time)}
                      </button>
                      {editingDate?.id === reservation.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setEditingDate(null)} />
                          <div className="absolute mt-1 z-50">
                            {editingDate.field === 'date' ? (
                              <DatePicker
                                value={reservation.pickup_date}
                                onChange={(date) => handleDateTimeUpdate(reservation.id, 'pickup_date', date)}
                                defaultOpen={true}
                              />
                            ) : (
                              <TimePicker
                                value={reservation.pickup_time}
                                onChange={(time) => handleDateTimeUpdate(reservation.id, 'pickup_time', time)}
                                defaultOpen={true}
                              />
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground truncate max-w-[200px]">{reservation.pickup_location}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">to {reservation.dropoff_location}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{formatPrice(reservation.total_price, settings)}</td>
                  <td className="px-6 py-4">
                    {/* Status Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowStatusDropdown(showStatusDropdown === reservation.id ? null : reservation.id)}
                        className={cn('ec-status capitalize flex items-center gap-1 cursor-pointer', getStatusColor(reservation.status))}
                      >
                        {getStatusLabel(reservation.status)}
                        <ChevronDown size={14} />
                      </button>
                      {showStatusDropdown === reservation.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(null)} />
                          <div className="absolute left-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-xl z-50 py-1">
                            {statusOptions.map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusUpdate(reservation.id, status)}
                                className={cn(
                                  'w-full text-left px-3 py-2 text-sm capitalize hover:bg-secondary transition-colors flex items-center gap-2',
                                  reservation.status === status && 'bg-secondary'
                                )}
                              >
                                {reservation.status === status && <Check size={14} />}
                                {getStatusLabel(status)}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReservation(reservation)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        title={t.admin.viewDetails || 'View Details'}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReservation(reservation);
                          generateInvoicePDF(reservation);
                        }}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        title={t.admin.exportPdf || 'Export PDF'}
                      >
                        <FileText size={18} />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(reservation.id)}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title={t.admin.delete || 'Delete'}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {t.admin.showing || 'Showing'} {((page - 1) * perPage) + 1} {t.admin.to || 'to'} {Math.min(page * perPage, filteredReservations.length)} {t.admin.of || 'of'} {filteredReservations.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.admin.previous || 'Previous'}
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.admin.next || 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Reservation Modal */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-serif text-2xl text-foreground">{t.admin.addReservation || 'Add New Reservation'}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">{t.admin.customerInfo || 'Customer Information'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">{t.admin.name || 'Name'} *</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={newReservation.customer_name}
                        onChange={(e) => setNewReservation({ ...newReservation, customer_name: e.target.value })}
                        className="ec-input w-full pl-10"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">{t.admin.email || 'Email'}</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        value={newReservation.customer_email}
                        onChange={(e) => setNewReservation({ ...newReservation, customer_email: e.target.value })}
                        className="ec-input w-full pl-10"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-muted-foreground mb-2">{t.admin.phone || 'Phone'}</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="tel"
                        value={newReservation.customer_phone}
                        onChange={(e) => setNewReservation({ ...newReservation, customer_phone: e.target.value })}
                        className="ec-input w-full pl-10"
                        placeholder="+1 555-0100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Type */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Service Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewReservation({ ...newReservation, booking_type: 'transfer' })}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors",
                      newReservation.booking_type === 'transfer'
                        ? 'bg-foreground text-background'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Car size={18} />
                    Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewReservation({ ...newReservation, booking_type: 'daily' })}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors",
                      newReservation.booking_type === 'daily'
                        ? 'bg-foreground text-background'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <CalendarDays size={18} />
                    Daily Rental
                  </button>
                </div>
              </div>

              {/* Journey Info */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">{t.admin.journeyDetails || 'Journey Details'}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">{t.admin.pickupLocation || 'Pickup Location'} *</label>
                    <AddressAutocomplete
                      value={newReservation.pickup_location}
                      onChange={(value, coords) => {
                        setNewReservation({ ...newReservation, pickup_location: value });
                        if (coords) setNewPickupCoords({ ...coords, display_name: value });
                      }}
                      placeholder="JFK Airport, Terminal 4"
                      icon={<MapPin size={18} />}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">{t.admin.dropoffLocation || 'Drop-off Location'} *</label>
                    <AddressAutocomplete
                      value={newReservation.dropoff_location}
                      onChange={(value, coords) => {
                        setNewReservation({ ...newReservation, dropoff_location: value });
                        if (coords) setNewDropoffCoords({ ...coords, display_name: value });
                      }}
                      placeholder="The Plaza Hotel, Fifth Avenue"
                      icon={<MapPin size={18} />}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">{newReservation.booking_type === 'daily' ? 'Start Date' : t.admin.pickupDate || 'Date'} *</label>
                      <DatePicker
                        value={newReservation.pickup_date}
                        onChange={(date) => setNewReservation({ ...newReservation, pickup_date: date })}
                        placeholder={t.hero?.pickDate || 'Select date'}
                        minDate={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">{newReservation.booking_type === 'daily' ? 'Start Time' : t.admin.pickupTime || 'Time'} *</label>
                      <TimePicker
                        value={newReservation.pickup_time}
                        onChange={(time) => setNewReservation({ ...newReservation, pickup_time: time })}
                        placeholder={t.hero?.pickTime || 'Select time'}
                      />
                    </div>
                  </div>
                  
                  {/* Return Date/Time for daily rentals */}
                  {newReservation.booking_type === 'daily' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Return Date *</label>
                        <DatePicker
                          value={newReservation.return_date}
                          onChange={(date) => {
                            const days = calculateRentalDays(newReservation.pickup_date, date);
                            setNewReservation({ ...newReservation, return_date: date, rental_days: days });
                          }}
                          placeholder="Select return date"
                          minDate={newReservation.pickup_date || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Return Time *</label>
                        <TimePicker
                          value={newReservation.return_time}
                          onChange={(time) => setNewReservation({ ...newReservation, return_time: time })}
                          placeholder="Select return time"
                        />
                      </div>
                    </div>
                  )}
<div>
  <label className="block text-sm text-muted-foreground mb-2">{t.admin.distance || 'Distance'} (km)</label>
  <div className="flex gap-2">
  <input
  type="number"
  value={newReservation.distance_km || ''}
  onChange={(e) => setNewReservation({ ...newReservation, distance_km: parseFloat(e.target.value) || 0 })}
  className="ec-input flex-1"
  placeholder="35"
  min="0"
  step="0.1"
  />
  <button
  type="button"
  onClick={handleCalculateNewDistance}
  disabled={isCalculatingDistance || !newReservation.pickup_location || !newReservation.dropoff_location}
  className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
  >
  {isCalculatingDistance ? (
  <Loader2 size={16} className="animate-spin" />
  ) : (
  <MapPin size={16} />
  )}
  {isCalculatingDistance ? 'Calculating...' : 'Calculate'}
  </button>
  </div>
  </div>
  </div>
  
  {/* Map Preview */}
  {(newPickupCoords || newDropoffCoords) && (
  <div className="mt-4">
  <RouteMap 
  pickup={newPickupCoords} 
  dropoff={newDropoffCoords}
  className="h-[250px]"
  />
  </div>
  )}
  </div>
  
{/* Vehicle & Driver */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                    {settings.showChauffeurService 
                      ? `${t.admin.vehicle || 'Vehicle'} & ${t.admin.chauffeur || 'Chauffeur'}`
                      : (t.admin.vehicle || 'Vehicle')
                    }
                  </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">{t.admin.vehicle || 'Vehicle'} *</label>
                    <div className="relative">
                      <Car size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <select
                        value={newReservation.car_id}
                        onChange={(e) => setNewReservation({ ...newReservation, car_id: parseInt(e.target.value) })}
                        className="ec-input w-full pl-10 appearance-none"
                        required
                      >
                        <option value={0}>{t.admin.selectVehicle || 'Select a vehicle'}</option>
                        {cars.filter(c => c.available).map((car) => (
                          <option key={car.id} value={car.id}>
                            {car.brand} {car.model} ({car.year}) - {formatPrice(car.price_per_km, settings)}/km
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {settings.showChauffeurService && (
                    <>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="with_driver"
                          checked={newReservation.with_driver}
                          onChange={(e) => setNewReservation({ ...newReservation, with_driver: e.target.checked })}
                          className="w-5 h-5 rounded border-border bg-input accent-foreground"
                        />
                        <label htmlFor="with_driver" className="text-sm text-foreground cursor-pointer">
                          {t.admin.withChauffeur || 'Include Chauffeur'}
                        </label>
                      </div>
                      {newReservation.with_driver && (
                        <div>
                          <label className="block text-sm text-muted-foreground mb-2">{t.admin.chauffeur || 'Chauffeur'}</label>
                          <select
                            value={newReservation.driver_id || ''}
                            onChange={(e) => setNewReservation({ ...newReservation, driver_id: e.target.value ? parseInt(e.target.value) : null })}
                            className="ec-input w-full"
                          >
                            <option value="">{t.admin.selectChauffeur || 'Auto-assign chauffeur'}</option>
                            {drivers.filter(d => d.available).map((driver) => (
                              <option key={driver.id} value={driver.id}>
                                {driver.name} - {driver.rating} stars
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Status & Notes */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">{t.admin.status || 'Status'}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">{t.admin.status || 'Status'}</label>
                    <select
                      value={newReservation.status}
                      onChange={(e) => setNewReservation({ ...newReservation, status: e.target.value as 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' })}
                      className="ec-input w-full"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{getStatusLabel(status)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">{t.admin.notes || 'Notes'}</label>
                    <textarea
                      value={newReservation.notes}
                      onChange={(e) => setNewReservation({ ...newReservation, notes: e.target.value })}
                      className="ec-input w-full min-h-[80px] resize-y"
                      placeholder={t.admin.notesPlaceholder || 'Any special requirements or notes...'}
                    />
                  </div>
                </div>
              </div>

              {/* Price Preview */}
              {newReservation.car_id > 0 && (
                <div className="bg-secondary rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t.admin.estimatedTotal || 'Estimated Total'}</span>
                    <span className="text-xl font-bold text-foreground">
                      {formatPrice(calculateNewReservationTotal(), settings)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.common.cancel || 'Cancel'}
              </button>
              <button
                onClick={handleAddReservation}
                disabled={!newReservation.customer_name || !newReservation.pickup_date || !newReservation.car_id}
                className="px-6 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.admin.createReservation || 'Create Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReservation && !showEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-serif text-2xl text-foreground">
                {t.admin.reservationDetails || 'Reservation Details'} #{selectedReservation.id.toString().padStart(4, '0')}
              </h2>
              <button
                onClick={() => setSelectedReservation(null)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={cn('ec-status capitalize text-lg px-4 py-2', getStatusColor(selectedReservation.status))}>
                  {getStatusLabel(selectedReservation.status)}
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(showStatusDropdown === -1 ? null : -1)}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    {t.admin.changeStatus || 'Change Status'}
                    <ChevronDown size={14} />
                  </button>
                  {showStatusDropdown === -1 && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(null)} />
                      <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-xl z-50 py-1">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(selectedReservation.id, status)}
                            className={cn(
                              'w-full text-left px-3 py-2 text-sm capitalize hover:bg-secondary transition-colors flex items-center gap-2',
                              selectedReservation.status === status && 'bg-secondary'
                            )}
                          >
                            {selectedReservation.status === status && <Check size={14} />}
                            {getStatusLabel(status)}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">{t.admin.customerInfo || 'Customer Information'}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-muted-foreground" />
                    <span className="text-foreground">{selectedReservation.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-muted-foreground" />
                    <span className="text-foreground">{selectedReservation.customer_email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-muted-foreground" />
                    <span className="text-foreground">{selectedReservation.customer_phone}</span>
                  </div>
                </div>
              </div>

              {/* Journey Details */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">{t.admin.journeyDetails || 'Journey Details'}</h3>
                <div className="bg-secondary rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t.admin.pickupLocation || 'Pickup'}</p>
                      <p className="text-foreground">{selectedReservation.pickup_location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t.admin.dropoffLocation || 'Drop-off'}</p>
                      <p className="text-foreground">{selectedReservation.dropoff_location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-muted-foreground" />
                    <span className="text-foreground">{formatDate(selectedReservation.pickup_date)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-muted-foreground" />
                    <span className="text-foreground">{formatTime(selectedReservation.pickup_time)}</span>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">{t.admin.priceSummary || 'Price Summary'}</h3>
                <div className="bg-secondary rounded-xl p-4">
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-muted-foreground">{t.admin.total || 'Total'}</span>
                    <span className="font-bold text-foreground">{formatPrice(selectedReservation.total_price, settings)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedReservation.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">{t.admin.notes || 'Notes'}</h3>
                  <p className="text-muted-foreground">{selectedReservation.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 p-6 border-t border-border">
              <button
                onClick={() => generateInvoicePDF(selectedReservation)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <FileText size={18} />
                {t.admin.exportPdf || 'Export PDF'}
              </button>
              <button
                onClick={() => openEmailModal('confirmation')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Send size={18} />
                {t.admin.sendConfirmation || 'Send Confirmation'}
              </button>
              <button
                onClick={() => openEmailModal('reminder')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Bell size={18} />
                {t.admin.sendReminder || 'Send Reminder'}
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(selectedReservation.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                  {t.admin.delete || 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full">
            {emailSent ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-500" />
                </div>
                <h3 className="font-serif text-2xl text-foreground mb-2">{t.admin.emailSent || 'Email Sent!'}</h3>
                <p className="text-muted-foreground">{t.admin.emailSentDesc || 'The email has been sent successfully.'}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="font-serif text-xl text-foreground">
                    {emailType === 'confirmation' ? (t.admin.sendConfirmation || 'Send Confirmation') : (t.admin.sendReminder || 'Send Reminder')}
                  </h2>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">{t.admin.emailLanguage || 'Email Language'}</label>
                    <div className="flex gap-2">
                      {locales.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => handleEmailLanguageChange(loc)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
                            emailLanguage === loc
                              ? 'border-foreground bg-foreground/10'
                              : 'border-border hover:border-foreground/50'
                          )}
                        >
                          <FlagIcon locale={loc} size={16} />
                          <span className="text-sm uppercase">{loc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">{t.admin.recipient || 'Recipient'}</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
                      <Mail size={16} className="text-muted-foreground" />
                      <span className="text-foreground">{selectedReservation.customer_email}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">{t.admin.subject || 'Subject'}</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="ec-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">{t.admin.emailBody || 'Message'}</label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={10}
                      className="ec-input w-full resize-y font-mono text-sm"
                    />
                  </div>

                  {/* PDF Invoice checkbox */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="include_pdf"
                      checked={includePdfInvoice}
                      onChange={(e) => setIncludePdfInvoice(e.target.checked)}
                      className="w-5 h-5 rounded border-border bg-input accent-foreground"
                    />
                    <label htmlFor="include_pdf" className="text-sm text-foreground cursor-pointer">
                      {t.admin.attachPdfInvoice || 'Attach PDF invoice to email'}
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t.common.cancel || 'Cancel'}
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={emailSending}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
                  >
                    {emailSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        {t.admin.sending || 'Sending...'}
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        {t.admin.sendEmail || 'Send Email'}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
