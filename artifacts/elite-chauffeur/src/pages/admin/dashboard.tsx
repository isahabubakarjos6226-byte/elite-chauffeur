import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, CalendarDays, Car, UserCircle, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useI18n } from "@/lib/i18n";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();
  const { t } = useI18n();
  const a = t.admin.dashboard;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">{a.title}</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-primary">{a.title}</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{a.totalRevenue}</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${stats?.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{a.reservations}</CardTitle>
            <CalendarDays className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.totalReservations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.pendingReservations} {a.pending} | {stats?.confirmedReservations} {a.confirmed}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{a.fleetStatus}</CardTitle>
            <Car className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.availableCars} <span className="text-lg text-muted-foreground font-normal">/ {stats?.totalCars}</span></div>
            <p className="text-xs text-muted-foreground mt-1">{a.vehiclesAvailable}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{a.drivers}</CardTitle>
            <UserCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.availableDrivers} <span className="text-lg text-muted-foreground font-normal">/ {stats?.totalDrivers}</span></div>
            <p className="text-xs text-muted-foreground mt-1">{a.driversOnDuty}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-4 bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {a.revenueOverview}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.revenueByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--secondary))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle>{a.recentActivity}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats?.recentReservations?.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{reservation.customerName}</p>
                    <p className="text-xs text-muted-foreground">{reservation.pickupDate} at {reservation.pickupTime}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">${reservation.totalPrice?.toFixed(2)}</div>
                    <div className={`text-xs uppercase font-bold mt-1 ${
                      reservation.status === 'pending' ? 'text-yellow-500' :
                      reservation.status === 'confirmed' ? 'text-blue-500' :
                      reservation.status === 'completed' ? 'text-green-500' :
                      'text-muted-foreground'
                    }`}>{reservation.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
