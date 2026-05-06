import { pgTable, serial, text, boolean, numeric, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const driversTable = pgTable("drivers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  photoUrl: text("photo_url"),
  available: boolean("available").notNull().default(true),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull().default("5.0"),
  languages: jsonb("languages").$type<string[]>().notNull().default([]),
  yearsExperience: integer("years_experience").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDriverSchema = createInsertSchema(driversTable).omit({ id: true, createdAt: true });
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof driversTable.$inferSelect;
