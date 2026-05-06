import { Router } from "express";
import { db, carsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateCarBody,
  ListCarsQueryParams,
  GetCarParams,
  UpdateCarParams,
  UpdateCarBody,
  DeleteCarParams,
} from "@workspace/api-zod";

const router = Router();

async function ensureHourlyColumn() {
  try {
    await db.execute(sql`
      ALTER TABLE cars ADD COLUMN IF NOT EXISTS available_for_hourly BOOLEAN NOT NULL DEFAULT false
    `);
  } catch {
    // column may already exist
  }
}

function mapCar(c: any) {
  return {
    ...c,
    pricePerKm: parseFloat(c.pricePerKm),
    baseFee: parseFloat(c.baseFee),
    driverFee: parseFloat(c.driverFee ?? "0"),
    availableForHourly: c.availableForHourly ?? false,
  };
}

router.get("/", async (req, res) => {
  await ensureHourlyColumn();
  const query = ListCarsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const conditions = [];
  if (query.data.available !== undefined) {
    const { eq } = await import("drizzle-orm");
    conditions.push(eq(carsTable.available, query.data.available));
  }
  if (query.data.category) {
    const { eq, or } = await import("drizzle-orm");
    conditions.push(or(eq(carsTable.category, query.data.category), eq(carsTable.category, "both"))!);
  }
  // Filter for hourly charter vehicles
  const hourlyCharter = req.query.hourlyCharter;
  if (hourlyCharter === "true") {
    conditions.push(eq(carsTable.availableForHourly, true));
  } else if (hourlyCharter === "false") {
    conditions.push(eq(carsTable.availableForHourly, false));
  }

  const { and } = await import("drizzle-orm");
  const cars = await db.select().from(carsTable).where(conditions.length > 0 ? and(...conditions) : undefined);
  res.json(cars.map(mapCar));
});

router.post("/", async (req, res) => {
  await ensureHourlyColumn();
  const body = CreateCarBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { name, brand, model, year, imageUrl, capacity, pricePerKm, baseFee, driverFee, available, category, description, features } = body.data;
  const availableForHourly = (req.body as any).availableForHourly ?? false;
  const [car] = await db.insert(carsTable).values({
    name, brand, model, year,
    imageUrl: imageUrl ?? null,
    capacity: capacity ?? 4,
    pricePerKm: String(pricePerKm),
    baseFee: String(baseFee),
    driverFee: String(driverFee ?? 0),
    available: available ?? true,
    category: category ?? "both",
    description: description ?? null,
    features: features ?? [],
    availableForHourly,
  }).returning();
  res.status(201).json(mapCar(car));
});

router.get("/:id", async (req, res) => {
  await ensureHourlyColumn();
  const params = GetCarParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [car] = await db.select().from(carsTable).where(eq(carsTable.id, params.data.id));
  if (!car) {
    res.status(404).json({ error: "Car not found" });
    return;
  }
  res.json(mapCar(car));
});

router.put("/:id", async (req, res) => {
  await ensureHourlyColumn();
  const params = UpdateCarParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateCarBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { name, brand, model, year, imageUrl, capacity, pricePerKm, baseFee, driverFee, available, category, description, features } = body.data;
  const availableForHourly = (req.body as any).availableForHourly ?? false;
  const [car] = await db.update(carsTable)
    .set({
      name, brand, model, year,
      imageUrl: imageUrl ?? null,
      capacity,
      pricePerKm: String(pricePerKm),
      baseFee: String(baseFee),
      driverFee: String(driverFee ?? 0),
      available, category,
      description: description ?? null,
      features: features ?? [],
      availableForHourly,
    })
    .where(eq(carsTable.id, params.data.id))
    .returning();
  if (!car) {
    res.status(404).json({ error: "Car not found" });
    return;
  }
  res.json(mapCar(car));
});

router.delete("/:id", async (req, res) => {
  const params = DeleteCarParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(carsTable).where(eq(carsTable.id, params.data.id));
  res.json({ success: true });
});

export default router;
