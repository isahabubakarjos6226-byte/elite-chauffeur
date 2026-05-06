'use client';

import { useMemo } from 'react';
import { DollarSign, ClipboardList, Car, Users, TrendingUp } from 'lucide-react';
import { useStore, formatPrice } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { reservations, cars, drivers, settings } = useStore();
  const { t } = useLanguage();

  const stats = useMemo(() => {
    const completedReservations = reservations.filter(r => r.status === 'completed');
    const totalRevenue = completedReservations.reduce((sum, r) => sum + r.total_price, 0);
    const pendingCount = reservations.filter(r => r.status === 'pending').length;
    const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
    const availableCars = cars.filter(c => c.available).length;
    const availableDrivers = drivers.filter(d => d.available).length;

    return {
      totalRevenue,
      totalReservations: reservations.length,
      pendingCount,
      confirmedCount,
      fleetTotal: cars.length,
      fleetAvailable: availableCars,
      driversTotal: drivers.length,
      driversAvailable: availableDrivers,
    };
  }, [reservations, cars, drivers]);

  const monthlyRevenue = useMemo(() => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      revenue: Math.floor(Math.random() * 15000) + 5000 + (index * 1000),
    }));
  }, []);

  const recentReservations = useMemo(() => {
    return [...reservations]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [reservations]);

  const statCards = [
    {
      title: t.admin.totalRevenue,
      value: formatPrice(stats.totalRevenue, settings),
      icon: DollarSign,
      description: t.admin.fromCompletedBookings,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: t.admin.reservations,
      value: stats.totalReservations.toString(),
      icon: ClipboardList,
      description: `${stats.pendingCount} ${t.admin.pending.toLowerCase()}, ${stats.confirmedCount} ${t.admin.confirmed.toLowerCase()}`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: t.admin.fleet,
      value: `${stats.fleetAvailable}/${stats.fleetTotal}`,
      icon: Car,
      description: t.admin.vehiclesAvailable,
      color: 'text-foreground',
      bgColor: 'bg-foreground/10',
    },
    {
      title: t.admin.drivers,
      value: `${stats.driversAvailable}/${stats.driversTotal}`,
      icon: Users,
      description: t.admin.chauffeursAvailable,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-foreground mb-2">{t.admin.dashboard}</h1>
        <p className="text-muted-foreground">
          {t.admin.welcomeBack}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div 
            key={index}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', stat.bgColor)}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">{stat.title}</h3>
            <p className="text-2xl font-semibold text-foreground mb-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h2 className="font-serif text-xl text-foreground mb-6">{t.admin.revenueOverview}</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--foreground)' }}
                  formatter={(value: number) => [formatPrice(value, settings), t.admin.revenue]}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="var(--foreground)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-serif text-xl text-foreground mb-6">{t.admin.recentActivity}</h2>
          <div className="space-y-4">
            {recentReservations.map((reservation) => (
              <div 
                key={reservation.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {reservation.customer_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {reservation.pickup_date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {formatPrice(reservation.total_price, settings)}
                  </p>
                  <span className={cn(
                    'inline-block px-2 py-0.5 rounded-full text-xs capitalize',
                    getStatusColor(reservation.status)
                  )}>
                    {getStatusLabel(reservation.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
