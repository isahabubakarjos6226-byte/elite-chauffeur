import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

const DEFAULTS: Record<string, string> = {
  showChauffeurService:  "true",
  currency:              "USD",
  websiteLogoUrl:        "",
  invoiceLogoUrl:        "",
  termsContent:          "",
  heroImageUrl:          "",
  heroOverlayOpacity:    "0.6",
  heroBlackWhite:        "false",
  heroTitle:             "",
  heroSubtitle:          "",
  themeAccentColor:      "#ebebeb",
  themeFontBody:         "Inter",
  themeFontHeading:      "",
};

async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

async function getSetting(key: string): Promise<string> {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
  return row?.value ?? DEFAULTS[key] ?? "";
}

async function upsertSetting(key: string, value: string): Promise<void> {
  await db
    .insert(settingsTable)
    .values({ key, value })
    .onConflictDoUpdate({ target: settingsTable.key, set: { value, updatedAt: new Date() } });
}

router.get("/", async (req, res) => {
  try {
    await ensureTable();
    const keys = Object.keys(DEFAULTS);
    const values = await Promise.all(keys.map(k => getSetting(k)));
    const map: Record<string, string> = {};
    keys.forEach((k, i) => { map[k] = values[i]; });

    res.json({
      showChauffeurService: map.showChauffeurService !== "false",
      currency:             map.currency || "USD",
      websiteLogoUrl:       map.websiteLogoUrl  || null,
      invoiceLogoUrl:       map.invoiceLogoUrl  || null,
      termsContent:         map.termsContent    || null,
      heroImageUrl:         map.heroImageUrl    || null,
      heroOverlayOpacity:   parseFloat(map.heroOverlayOpacity) || 0.6,
      heroBlackWhite:       map.heroBlackWhite  === "true",
      heroTitle:            map.heroTitle        || "",
      heroSubtitle:         map.heroSubtitle     || "",
      themeAccentColor:     map.themeAccentColor || "#ebebeb",
      themeFontBody:        map.themeFontBody    || "Inter",
      themeFontHeading:     map.themeFontHeading || "",
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.put("/", async (req, res) => {
  try {
    await ensureTable();
    const body = req.body as Record<string, unknown>;
    const ops: Promise<void>[] = [];

    if (typeof body.showChauffeurService === "boolean")
      ops.push(upsertSetting("showChauffeurService", String(body.showChauffeurService)));
    if (typeof body.currency === "string" && body.currency)
      ops.push(upsertSetting("currency", body.currency));
    if (typeof body.websiteLogoUrl === "string")
      ops.push(upsertSetting("websiteLogoUrl", body.websiteLogoUrl));
    if (typeof body.invoiceLogoUrl === "string")
      ops.push(upsertSetting("invoiceLogoUrl", body.invoiceLogoUrl));
    if (typeof body.termsContent === "string")
      ops.push(upsertSetting("termsContent", body.termsContent));

    // Theme fields
    if (typeof body.heroImageUrl === "string")
      ops.push(upsertSetting("heroImageUrl", body.heroImageUrl));
    if (typeof body.heroOverlayOpacity === "number")
      ops.push(upsertSetting("heroOverlayOpacity", String(body.heroOverlayOpacity)));
    if (typeof body.heroBlackWhite === "boolean")
      ops.push(upsertSetting("heroBlackWhite", String(body.heroBlackWhite)));
    if (typeof body.heroTitle === "string")
      ops.push(upsertSetting("heroTitle", body.heroTitle));
    if (typeof body.heroSubtitle === "string")
      ops.push(upsertSetting("heroSubtitle", body.heroSubtitle));
    if (typeof body.themeAccentColor === "string" && /^#[0-9a-fA-F]{3,6}$/.test(body.themeAccentColor))
      ops.push(upsertSetting("themeAccentColor", body.themeAccentColor));
    if (typeof body.themeFontBody === "string")
      ops.push(upsertSetting("themeFontBody", body.themeFontBody));
    if (typeof body.themeFontHeading === "string")
      ops.push(upsertSetting("themeFontHeading", body.themeFontHeading));

    await Promise.all(ops);

    // Return updated state
    const keys = Object.keys(DEFAULTS);
    const values = await Promise.all(keys.map(k => getSetting(k)));
    const map: Record<string, string> = {};
    keys.forEach((k, i) => { map[k] = values[i]; });

    res.json({
      showChauffeurService: map.showChauffeurService !== "false",
      currency:             map.currency || "USD",
      websiteLogoUrl:       map.websiteLogoUrl  || null,
      invoiceLogoUrl:       map.invoiceLogoUrl  || null,
      termsContent:         map.termsContent    || null,
      heroImageUrl:         map.heroImageUrl    || null,
      heroOverlayOpacity:   parseFloat(map.heroOverlayOpacity) || 0.6,
      heroBlackWhite:       map.heroBlackWhite  === "true",
      heroTitle:            map.heroTitle        || "",
      heroSubtitle:         map.heroSubtitle     || "",
      themeAccentColor:     map.themeAccentColor || "#ebebeb",
      themeFontBody:        map.themeFontBody    || "Inter",
      themeFontHeading:     map.themeFontHeading || "",
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
