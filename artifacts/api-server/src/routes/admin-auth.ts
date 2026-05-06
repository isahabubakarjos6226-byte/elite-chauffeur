import { Router } from "express";
import { createHash, randomBytes } from "crypto";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { findUserByEmail, verifyUserPassword } from "./users";

const router = Router();

const DEFAULT_PASSWORD = "elite2024";

function hashPassword(password: string, salt: string): string {
  return createHash("sha256").update(salt + password).digest("hex");
}

async function getSetting(key: string): Promise<string | null> {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
  return row?.value ?? null;
}

async function upsertSetting(key: string, value: string): Promise<void> {
  await db
    .insert(settingsTable)
    .values({ key, value })
    .onConflictDoUpdate({ target: settingsTable.key, set: { value, updatedAt: new Date() } });
}

async function verifyMasterPassword(input: string): Promise<boolean> {
  let salt = await getSetting("adminPasswordSalt");
  let hash = await getSetting("adminPasswordHash");

  if (!salt || !hash) {
    salt = randomBytes(16).toString("hex");
    hash = hashPassword(DEFAULT_PASSWORD, salt);
    await upsertSetting("adminPasswordSalt", salt);
    await upsertSetting("adminPasswordHash", hash);
  }

  return hashPassword(input, salt) === hash;
}

// POST /api/admin/login
// Body: { password } → master login (super_admin)
// Body: { email, password } → staff user login (admin | user)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!password) {
      res.status(400).json({ success: false, error: "Password required" });
      return;
    }

    // Staff user login
    if (email && email.trim()) {
      const user = await findUserByEmail(email.trim().toLowerCase());
      if (!user) {
        res.status(401).json({ success: false, error: "Invalid email or password" });
        return;
      }
      const ok = verifyUserPassword(password, user.password_hash, user.password_salt);
      if (!ok) {
        res.status(401).json({ success: false, error: "Invalid email or password" });
        return;
      }
      res.json({ success: true, role: user.role, name: user.name, userId: user.id });
      return;
    }

    // Master password login
    const ok = await verifyMasterPassword(password);
    if (ok) {
      res.json({ success: true, role: "super_admin", name: "Administrator" });
    } else {
      res.status(401).json({ success: false, error: "Invalid password" });
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: "Both passwords required" });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ success: false, error: "New password must be at least 6 characters" });
      return;
    }

    const ok = await verifyMasterPassword(currentPassword);
    if (!ok) {
      res.status(401).json({ success: false, error: "Current password is incorrect" });
      return;
    }

    const newSalt = randomBytes(16).toString("hex");
    const newHash = hashPassword(newPassword, newSalt);
    await upsertSetting("adminPasswordSalt", newSalt);
    await upsertSetting("adminPasswordHash", newHash);

    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
