import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pricingTable = pgTable("pricing", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  pricePerKm: numeric("price_per_km", { precision: 10, scale: 2 }).notNull(),
  baseFee: numeric("base_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  category: text("category").notNull().default("both"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPricingSchema = createInsertSchema(pricingTable).omit({ id: true, createdAt: true });
export type InsertPricing = z.infer<typeof insertPricingSchema>;
export type PricingTier = typeof pricingTable.$inferSelect;
