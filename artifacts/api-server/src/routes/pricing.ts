import { Router } from "express";
import { db, pricingTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreatePricingBody,
  UpdatePricingParams,
  UpdatePricingBody,
  DeletePricingParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const tiers = await db.select().from(pricingTable);
  const result = tiers.map((t) => ({
    ...t,
    pricePerKm: parseFloat(t.pricePerKm),
    baseFee: parseFloat(t.baseFee),
  }));
  res.json(result);
});

router.post("/", async (req, res) => {
  const body = CreatePricingBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [tier] = await db.insert(pricingTable).values({
    name: body.data.name,
    description: body.data.description ?? null,
    pricePerKm: String(body.data.pricePerKm),
    baseFee: String(body.data.baseFee),
    category: body.data.category,
  }).returning();
  res.status(201).json({ ...tier, pricePerKm: parseFloat(tier.pricePerKm), baseFee: parseFloat(tier.baseFee) });
});

router.put("/:id", async (req, res) => {
  const params = UpdatePricingParams.safeParse({ id: Number(req.params.id) });
  const body = UpdatePricingBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const [tier] = await db.update(pricingTable)
    .set({
      name: body.data.name,
      description: body.data.description ?? null,
      pricePerKm: String(body.data.pricePerKm),
      baseFee: String(body.data.baseFee),
      category: body.data.category,
    })
    .where(eq(pricingTable.id, params.data.id))
    .returning();
  if (!tier) {
    res.status(404).json({ error: "Pricing tier not found" });
    return;
  }
  res.json({ ...tier, pricePerKm: parseFloat(tier.pricePerKm), baseFee: parseFloat(tier.baseFee) });
});

router.delete("/:id", async (req, res) => {
  const params = DeletePricingParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(pricingTable).where(eq(pricingTable.id, params.data.id));
  res.json({ success: true });
});

export default router;
