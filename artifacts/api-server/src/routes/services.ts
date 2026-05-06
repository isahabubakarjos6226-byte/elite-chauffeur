import { Router } from "express";
import { db, servicesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      icon_name TEXT NOT NULL DEFAULT 'Star',
      image_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

const DEFAULT_SERVICES = [
  {
    title: "Airport Transfers",
    description: "Punctual, stress-free airport pickups and drop-offs. We monitor your flight in real time so our chauffeur is always there, even if your schedule changes.",
    iconName: "Plane",
    imageUrl: null,
    sortOrder: 0,
    active: true,
  },
  {
    title: "Corporate Travel",
    description: "Elevate your business travel with discreet, professional chauffeur service. Wi-Fi enabled vehicles, privacy partitions, and on-account billing available.",
    iconName: "Building2",
    imageUrl: null,
    sortOrder: 1,
    active: true,
  },
  {
    title: "Special Events",
    description: "Weddings, galas, red-carpet arrivals — arrive in style. Our chauffeurs are impeccably dressed and your vehicle is flawlessly prepared for every occasion.",
    iconName: "CalendarDays",
    imageUrl: null,
    sortOrder: 2,
    active: true,
  },
  {
    title: "Hourly Charter",
    description: "Keep a luxury vehicle and professional chauffeur at your disposal for as many hours as you need — ideal for city tours, multi-stop days, or VIP city runs.",
    iconName: "Clock",
    imageUrl: null,
    sortOrder: 3,
    active: true,
  },
];

async function seedDefaultServices() {
  for (const svc of DEFAULT_SERVICES) {
    const existing = await db.execute(
      sql`SELECT id FROM services WHERE title = ${svc.title} LIMIT 1`
    );
    if ((existing.rows as any[]).length === 0) {
      await db.insert(servicesTable).values(svc);
    }
  }
}

router.get("/", async (req, res) => {
  try {
    await ensureTable();
    await seedDefaultServices();
    const services = await db.select().from(servicesTable).orderBy(servicesTable.sortOrder);
    res.json(services);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

router.post("/", async (req, res) => {
  try {
    await ensureTable();
    const { title, description, iconName, imageUrl, sortOrder, active } = req.body as {
      title: string; description?: string; iconName?: string; imageUrl?: string; sortOrder?: number; active?: boolean;
    };
    if (!title) { res.status(400).json({ error: "title is required" }); return; }
    const [service] = await db.insert(servicesTable).values({
      title,
      description: description ?? "",
      iconName: iconName ?? "Star",
      imageUrl: imageUrl ?? null,
      sortOrder: sortOrder ?? 0,
      active: active ?? true,
    }).returning();
    res.status(201).json(service);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create service" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const { title, description, iconName, imageUrl, sortOrder, active } = req.body as {
      title?: string; description?: string; iconName?: string; imageUrl?: string | null; sortOrder?: number; active?: boolean;
    };
    const [service] = await db.update(servicesTable).set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(iconName !== undefined && { iconName }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(active !== undefined && { active }),
    }).where(eq(servicesTable.id, id)).returning();
    if (!service) { res.status(404).json({ error: "Service not found" }); return; }
    res.json(service);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update service" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    await db.delete(servicesTable).where(eq(servicesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete service" });
  }
});

export default router;
