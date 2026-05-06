import { Router } from "express";
import { db, reservationsTable, carsTable, driversTable } from "@workspace/db";
import { eq, count, sum, sql } from "drizzle-orm";

const router = Router();

router.get("/stats", async (req, res) => {
  const [totalReservations] = await db.select({ count: count() }).from(reservationsTable);
  const [pending] = await db.select({ count: count() }).from(reservationsTable).where(eq(reservationsTable.status, "pending"));
  const [confirmed] = await db.select({ count: count() }).from(reservationsTable).where(eq(reservationsTable.status, "confirmed"));
  const [completed] = await db.select({ count: count() }).from(reservationsTable).where(eq(reservationsTable.status, "completed"));
  const [cancelled] = await db.select({ count: count() }).from(reservationsTable).where(eq(reservationsTable.status, "cancelled"));
  const [revenue] = await db.select({ total: sum(reservationsTable.totalPrice) }).from(reservationsTable).where(eq(reservationsTable.status, "completed"));
  const [totalCars] = await db.select({ count: count() }).from(carsTable);
  const [availableCars] = await db.select({ count: count() }).from(carsTable).where(eq(carsTable.available, true));
  const [totalDrivers] = await db.select({ count: count() }).from(driversTable);
  const [availableDrivers] = await db.select({ count: count() }).from(driversTable).where(eq(driversTable.available, true));

  const recentRows = await db
    .select({
      reservation: reservationsTable,
      car: carsTable,
      driver: driversTable,
    })
    .from(reservationsTable)
    .leftJoin(carsTable, eq(reservationsTable.carId, carsTable.id))
    .leftJoin(driversTable, eq(reservationsTable.driverId, driversTable.id))
    .orderBy(sql`${reservationsTable.createdAt} DESC`)
    .limit(5);

  const recentReservations = recentRows.map(({ reservation, car, driver }) => ({
    ...reservation,
    distanceKm: reservation.distanceKm ? parseFloat(reservation.distanceKm) : null,
    totalPrice: reservation.totalPrice ? parseFloat(reservation.totalPrice) : null,
    car: car ? { ...car, pricePerKm: parseFloat(car.pricePerKm), baseFee: parseFloat(car.baseFee) } : null,
    driver: driver ? { ...driver, rating: parseFloat(driver.rating) } : null,
  }));

  const revenueByMonthRows = await db.execute(sql`
    SELECT 
      TO_CHAR(created_at, 'Mon YYYY') as month,
      SUM(CAST(total_price AS DECIMAL)) as revenue
    FROM reservations
    WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '6 months'
    GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at) ASC
  `);

  const revenueByMonth = (revenueByMonthRows.rows as any[]).map((r: any) => ({
    month: r.month,
    revenue: parseFloat(r.revenue ?? "0"),
  }));

  res.json({
    totalReservations: totalReservations.count,
    pendingReservations: pending.count,
    confirmedReservations: confirmed.count,
    completedReservations: completed.count,
    cancelledReservations: cancelled.count,
    totalRevenue: parseFloat(revenue.total ?? "0"),
    totalCars: totalCars.count,
    availableCars: availableCars.count,
    totalDrivers: totalDrivers.count,
    availableDrivers: availableDrivers.count,
    recentReservations,
    revenueByMonth,
  });
});

export default router;
