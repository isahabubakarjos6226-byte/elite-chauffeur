import pg from "pg";

const { Client } = pg;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERROR: DATABASE_URL environment variable is not set.");
    process.exit(1);
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  console.log("Connected to database.");

  try {
    await client.query("BEGIN");

    // ── TABLES ────────────────────────────────────────────────────────────

    await client.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id            SERIAL PRIMARY KEY,
        name          TEXT    NOT NULL,
        brand         TEXT    NOT NULL,
        model         TEXT    NOT NULL,
        year          INTEGER NOT NULL,
        image_url     TEXT,
        capacity      INTEGER NOT NULL DEFAULT 4,
        price_per_km  NUMERIC(10,2) NOT NULL DEFAULT 3.00,
        base_fee      NUMERIC(10,2) NOT NULL DEFAULT 50.00,
        driver_fee    NUMERIC(10,2) NOT NULL DEFAULT 0.00,
        available     BOOLEAN NOT NULL DEFAULT TRUE,
        category      TEXT    NOT NULL DEFAULT 'both',
        description   TEXT,
        features      JSONB   NOT NULL DEFAULT '[]',
        created_at    TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Table: cars — OK");

    await client.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id               SERIAL PRIMARY KEY,
        name             TEXT    NOT NULL,
        phone            TEXT,
        email            TEXT,
        photo_url        TEXT,
        available        BOOLEAN NOT NULL DEFAULT TRUE,
        rating           NUMERIC(3,1) NOT NULL DEFAULT 5.0,
        languages        JSONB   NOT NULL DEFAULT '[]',
        years_experience INTEGER NOT NULL DEFAULT 1,
        created_at       TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Table: drivers — OK");

    await client.query(`
      CREATE TABLE IF NOT EXISTS pricing (
        id           SERIAL PRIMARY KEY,
        name         TEXT    NOT NULL,
        description  TEXT,
        price_per_km NUMERIC(10,2) NOT NULL,
        base_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
        category     TEXT    NOT NULL DEFAULT 'both',
        created_at   TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Table: pricing — OK");

    await client.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id               SERIAL PRIMARY KEY,
        car_id           INTEGER REFERENCES cars(id) ON DELETE SET NULL,
        driver_id        INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
        customer_name    TEXT    NOT NULL,
        customer_email   TEXT    NOT NULL,
        customer_phone   TEXT,
        pickup_location  TEXT    NOT NULL,
        dropoff_location TEXT    NOT NULL,
        pickup_date      DATE    NOT NULL,
        pickup_time      TEXT    NOT NULL,
        distance_km      NUMERIC(10,2),
        driver_fee       NUMERIC(10,2),
        total_price      NUMERIC(10,2),
        with_driver      BOOLEAN NOT NULL DEFAULT TRUE,
        status           TEXT    NOT NULL DEFAULT 'pending',
        notes            TEXT,
        created_at       TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Table: reservations — OK");

    await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key        TEXT PRIMARY KEY,
        value      TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Table: site_settings — OK");

    // ── SEED DATA (skipped if rows already exist) ─────────────────────────

    const { rows: carRows } = await client.query("SELECT COUNT(*) FROM cars");
    if (parseInt(carRows[0].count) === 0) {
      await client.query(`
        INSERT INTO cars (name, brand, model, year, capacity, price_per_km, base_fee, driver_fee, available, category, description, features) VALUES
        ('Mercedes S-Class',  'Mercedes-Benz', 'S-Class',     2023, 3, 4.50, 80.00, 120.00, TRUE, 'both',           'The flagship of luxury sedans.',             '["Leather seats","WiFi","Minibar","Climate control"]'),
        ('BMW 7 Series',      'BMW',           '7 Series',    2023, 3, 4.20, 75.00, 110.00, TRUE, 'both',           'Refined performance meets executive comfort.','["Massage seats","Panoramic roof","WiFi","Sound system"]'),
        ('Mercedes V-Class',  'Mercedes-Benz', 'V-Class',     2022, 7, 3.80, 90.00, 130.00, TRUE, 'both',           'Spacious luxury van for groups.',             '["7 seats","Leather","WiFi","Air suspension"]'),
        ('Rolls-Royce Ghost', 'Rolls-Royce',   'Ghost',       2023, 3, 8.00,150.00, 200.00, TRUE, 'both',           'Ultra-luxury for the most discerning clients.','["Starlight ceiling","Bespoke interior","Champagne cooler","WiFi"]'),
        ('Tesla Model S',     'Tesla',         'Model S',     2023, 4, 3.50, 60.00,  90.00, TRUE, 'both',           'Premium electric travel, zero emissions.',    '["Autopilot","17\" display","Fast charging","WiFi"]'),
        ('Sprinter VIP',      'Mercedes-Benz', 'Sprinter VIP',2022,12, 3.20,100.00, 150.00, TRUE, 'both',           'Executive shuttle for large groups.',         '["12 seats","Conference setup","WiFi","Fridge"]');
      `);
      console.log("Seed: 6 cars inserted.");
    } else {
      console.log("Seed: cars already present, skipped.");
    }

    const { rows: driverRows } = await client.query("SELECT COUNT(*) FROM drivers");
    if (parseInt(driverRows[0].count) === 0) {
      await client.query(`
        INSERT INTO drivers (name, phone, email, available, rating, languages, years_experience) VALUES
        ('Jean-Pierre Moreau', '+33 6 12 34 56 78', 'jp.moreau@elite.com',    TRUE, 5.0, '["FR","EN"]', 12),
        ('Marcus Weber',       '+49 151 23456789',  'm.weber@elite.com',      TRUE, 4.9, '["DE","EN"]',  8),
        ('Carlos Ruiz',        '+34 612 345 678',   'c.ruiz@elite.com',       TRUE, 5.0, '["ES","EN","FR"]', 10),
        ('Sophie Laurent',     '+33 6 98 76 54 32', 's.laurent@elite.com',    TRUE, 4.8, '["FR","EN","DE"]',  6);
      `);
      console.log("Seed: 4 drivers inserted.");
    } else {
      console.log("Seed: drivers already present, skipped.");
    }

    const { rows: pricingRows } = await client.query("SELECT COUNT(*) FROM pricing");
    if (parseInt(pricingRows[0].count) === 0) {
      await client.query(`
        INSERT INTO pricing (name, description, price_per_km, base_fee, category) VALUES
        ('Standard',  'Everyday luxury transfers.',          3.50,  60.00, 'both'),
        ('Business',  'Executive class for business trips.', 4.50,  80.00, 'both'),
        ('First Class','Ultimate luxury experience.',         7.00, 120.00, 'both'),
        ('Group',     'Comfortable group transport.',         3.20,  90.00, 'both');
      `);
      console.log("Seed: 4 pricing tiers inserted.");
    } else {
      console.log("Seed: pricing already present, skipped.");
    }

    await client.query(`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('showChauffeurService', 'true', NOW())
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log("Seed: site_settings defaults ensured.");

    await client.query("COMMIT");
    console.log("\nDatabase setup complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Setup failed, rolled back.", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
