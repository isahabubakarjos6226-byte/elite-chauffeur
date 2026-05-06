import { Router } from "express";
import { db } from "@workspace/db";
import { createHash, randomBytes } from "crypto";
import { sql } from "drizzle-orm";

const router = Router();

function hashPassword(password: string, salt: string): string {
  return createHash("sha256").update(salt + password).digest("hex");
}

async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS staff_users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

router.get("/", async (req, res) => {
  try {
    await ensureTable();
    const result = await db.execute(sql`
      SELECT id, name, email, role, active, created_at FROM staff_users ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post("/", async (req, res) => {
  try {
    await ensureTable();
    const { name, email, password, role } = req.body as {
      name: string; email: string; password: string; role?: string;
    };
    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required" });
      return;
    }
    const salt = randomBytes(16).toString("hex");
    const hash = hashPassword(password, salt);
    const userRole = role === "admin" ? "admin" : "user";
    const result = await db.execute(sql`
      INSERT INTO staff_users (name, email, password_hash, password_salt, role, active)
      VALUES (${name}, ${email}, ${hash}, ${salt}, ${userRole}, true)
      RETURNING id, name, email, role, active, created_at
    `);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    await ensureTable();
    const id = parseInt(req.params.id);
    const { name, email, role, active, password } = req.body as {
      name?: string; email?: string; role?: string; active?: boolean; password?: string;
    };

    if (password) {
      const salt = randomBytes(16).toString("hex");
      const hash = hashPassword(password, salt);
      await db.execute(sql`
        UPDATE staff_users SET
          name = COALESCE(${name}, name),
          email = COALESCE(${email}, email),
          role = COALESCE(${role}, role),
          active = COALESCE(${active}, active),
          password_hash = ${hash},
          password_salt = ${salt}
        WHERE id = ${id}
      `);
    } else {
      await db.execute(sql`
        UPDATE staff_users SET
          name = COALESCE(${name}, name),
          email = COALESCE(${email}, email),
          role = COALESCE(${role}, role),
          active = COALESCE(${active}, active)
        WHERE id = ${id}
      `);
    }

    const result = await db.execute(sql`
      SELECT id, name, email, role, active, created_at FROM staff_users WHERE id = ${id}
    `);
    res.json(result.rows[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await ensureTable();
    const id = parseInt(req.params.id);
    await db.execute(sql`DELETE FROM staff_users WHERE id = ${id}`);
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export async function findUserByEmail(email: string): Promise<{
  id: number; name: string; email: string; role: string;
  password_hash: string; password_salt: string; active: boolean;
} | null> {
  try {
    await ensureTable();
    const result = await db.execute(sql`
      SELECT id, name, email, role, password_hash, password_salt, active
      FROM staff_users WHERE email = ${email} AND active = true LIMIT 1
    `);
    return (result.rows[0] as any) ?? null;
  } catch {
    return null;
  }
}

export function verifyUserPassword(password: string, hash: string, salt: string): boolean {
  return hashPassword(password, salt) === hash;
}

export default router;
