import { pgTable, serial, text, integer, boolean, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const carsTable = pgTable("cars", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  imageUrl: text("image_url"),
  capacity: integer("capacity").notNull().default(4),
  pricePerKm: numeric("price_per_km", { precision: 10, scale: 2 }).notNull().default("3.00"),
  baseFee: numeric("base_fee", { precision: 10, scale: 2 }).notNull().default("50.00"),
  available: boolean("available").notNull().default(true),
  category: text("category").notNull().default("both"),
  description: text("description"),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  driverFee: numeric("driver_fee", { precision: 10, scale: 2 }).notNull().default("0.00"),
  availableForHourly: boolean("available_for_hourly").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCarSchema = createInsertSchema(carsTable).omit({ id: true, createdAt: true });
export type InsertCar = z.infer<typeof insertCarSchema>;
export type Car = typeof carsTable.$inferSelect;
