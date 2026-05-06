import { pgTable, serial, text, integer, boolean, numeric, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { carsTable } from "./cars";
import { driversTable } from "./drivers";

export const reservationsTable = pgTable("reservations", {
  id: serial("id").primaryKey(),
  carId: integer("car_id").references(() => carsTable.id, { onDelete: "set null" }),
  driverId: integer("driver_id").references(() => driversTable.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  pickupDate: date("pickup_date").notNull(),
  pickupTime: text("pickup_time").notNull(),
  distanceKm: numeric("distance_km", { precision: 10, scale: 2 }),
  driverFee: numeric("driver_fee", { precision: 10, scale: 2 }),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }),
  withDriver: boolean("with_driver").notNull().default(true),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReservationSchema = createInsertSchema(reservationsTable).omit({ id: true, createdAt: true });
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservationsTable.$inferSelect;
