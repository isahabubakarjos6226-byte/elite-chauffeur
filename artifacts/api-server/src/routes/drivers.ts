import { Router } from "express";
import { db, driversTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateDriverBody,
  ListDriversQueryParams,
  GetDriverParams,
  UpdateDriverParams,
  UpdateDriverBody,
  DeleteDriverParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const query = ListDriversQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const drivers = query.data.available !== undefined
    ? await db.select().from(driversTable).where(eq(driversTable.available, query.data.available))
    : await db.select().from(driversTable);
  const result = drivers.map((d) => ({ ...d, rating: parseFloat(d.rating) }));
  res.json(result);
});

router.post("/", async (req, res) => {
  const body = CreateDriverBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [driver] = await db.insert(driversTable).values({
    name: body.data.name,
    phone: body.data.phone ?? null,
    email: body.data.email ?? null,
    photoUrl: body.data.photoUrl ?? null,
    available: body.data.available ?? true,
    rating: String(body.data.rating ?? 5.0),
    languages: body.data.languages ?? [],
    yearsExperience: body.data.yearsExperience ?? 1,
  }).returning();
  res.status(201).json({ ...driver, rating: parseFloat(driver.rating) });
});

router.get("/:id", async (req, res) => {
  const params = GetDriverParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [driver] = await db.select().from(driversTable).where(eq(driversTable.id, params.data.id));
  if (!driver) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  res.json({ ...driver, rating: parseFloat(driver.rating) });
});

router.put("/:id", async (req, res) => {
  const params = UpdateDriverParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateDriverBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const [driver] = await db.update(driversTable)
    .set({
      name: body.data.name,
      phone: body.data.phone ?? null,
      email: body.data.email ?? null,
      photoUrl: body.data.photoUrl ?? null,
      available: body.data.available,
      rating: String(body.data.rating),
      languages: body.data.languages ?? [],
      yearsExperience: body.data.yearsExperience,
    })
    .where(eq(driversTable.id, params.data.id))
    .returning();
  if (!driver) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  res.json({ ...driver, rating: parseFloat(driver.rating) });
});

router.delete("/:id", async (req, res) => {
  const params = DeleteDriverParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(driversTable).where(eq(driversTable.id, params.data.id));
  res.json({ success: true });
});

export default router;
