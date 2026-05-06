#!/usr/bin/env bash
# ============================================================
#  Elite Chauffeur — Local Install Script
#  Creates a local PostgreSQL database so your data stays
#  on your own server and is not hosted online.
# ============================================================
set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}   Elite Chauffeur — Local Setup${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# ── 1. Check Node.js ─────────────────────────────────────────
info "Checking Node.js..."
if ! command -v node &>/dev/null; then
  error "Node.js is not installed. Please install Node 20+ from https://nodejs.org"
fi
NODE_VER=$(node -e "process.stdout.write(process.version)")
info "Node.js $NODE_VER found."

# ── 2. Check pnpm ────────────────────────────────────────────
info "Checking pnpm..."
if ! command -v pnpm &>/dev/null; then
  warn "pnpm not found. Installing pnpm..."
  npm install -g pnpm
fi
success "pnpm $(pnpm -v) ready."

# ── 3. Check PostgreSQL ──────────────────────────────────────
info "Checking PostgreSQL..."
if ! command -v psql &>/dev/null; then
  echo ""
  warn "PostgreSQL is not installed."
  echo "  Please install it first, then re-run this script:"
  echo ""
  echo "  macOS:   brew install postgresql@16 && brew services start postgresql@16"
  echo "  Ubuntu:  sudo apt install postgresql postgresql-contrib && sudo service postgresql start"
  echo "  Windows: https://www.postgresql.org/download/windows/"
  echo ""
  error "PostgreSQL not found. Aborting."
fi
PG_VER=$(psql --version | head -1)
success "$PG_VER found."

# ── 4. Configure DB ──────────────────────────────────────────
echo ""
info "Database configuration:"
read -rp "  DB name      [elite_chauffeur]: " DB_NAME
DB_NAME="${DB_NAME:-elite_chauffeur}"

read -rp "  DB user      [elite_user]: " DB_USER
DB_USER="${DB_USER:-elite_user}"

read -rsp "  DB password  [leave blank to auto-generate]: " DB_PASS
echo ""
if [ -z "$DB_PASS" ]; then
  DB_PASS=$(LC_ALL=C tr -dc 'A-Za-z0-9!@#%^&*' </dev/urandom | head -c 20)
  info "Generated password: $DB_PASS  (saved to .env)"
fi

read -rp "  DB port      [5432]: " DB_PORT
DB_PORT="${DB_PORT:-5432}"

DB_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}"

# ── 5. Create DB user & database ─────────────────────────────
info "Creating database user '$DB_USER'..."
psql -U postgres -p "$DB_PORT" -c "
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
      CREATE ROLE \"${DB_USER}\" LOGIN PASSWORD '${DB_PASS}';
    ELSE
      ALTER ROLE \"${DB_USER}\" LOGIN PASSWORD '${DB_PASS}';
    END IF;
  END
  \$\$;
" 2>/dev/null || {
  warn "Could not connect as 'postgres'. Trying as current user..."
  psql -p "$DB_PORT" -c "
    DO \$\$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
        CREATE ROLE \"${DB_USER}\" LOGIN PASSWORD '${DB_PASS}';
      ELSE
        ALTER ROLE \"${DB_USER}\" LOGIN PASSWORD '${DB_PASS}';
      END IF;
    END
    \$\$;
  "
}
success "User '$DB_USER' ready."

info "Creating database '$DB_NAME'..."
psql -U postgres -p "$DB_PORT" -c "
  SELECT 'CREATE DATABASE \"${DB_NAME}\" OWNER \"${DB_USER}\"'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname='${DB_NAME}')
  \gexec
" 2>/dev/null || psql -p "$DB_PORT" -c "
  SELECT 'CREATE DATABASE \"${DB_NAME}\" OWNER \"${DB_USER}\"'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname='${DB_NAME}')
  \gexec
"
success "Database '$DB_NAME' ready."

# Grant privileges
psql -U postgres -p "$DB_PORT" -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON DATABASE \"${DB_NAME}\" TO \"${DB_USER}\";" 2>/dev/null || \
psql -p "$DB_PORT" -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON DATABASE \"${DB_NAME}\" TO \"${DB_USER}\";"

# ── 6. Create tables ─────────────────────────────────────────
info "Creating database tables..."
psql "$DB_URL" <<'SQL'

CREATE TABLE IF NOT EXISTS cars (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  brand       TEXT NOT NULL DEFAULT '',
  model       TEXT NOT NULL DEFAULT '',
  year        INTEGER NOT NULL DEFAULT 2024,
  image_url   TEXT,
  capacity    INTEGER NOT NULL DEFAULT 4,
  price_per_km NUMERIC(10,2) NOT NULL DEFAULT 5,
  base_fee    NUMERIC(10,2) NOT NULL DEFAULT 50,
  driver_fee  NUMERIC(10,2) NOT NULL DEFAULT 0,
  available   BOOLEAN NOT NULL DEFAULT true,
  available_for_hourly BOOLEAN NOT NULL DEFAULT false,
  category    TEXT NOT NULL DEFAULT 'with_driver',
  description TEXT,
  features    TEXT[],
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  license_number TEXT,
  available   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
  id               SERIAL PRIMARY KEY,
  pickup_location  TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_date      TEXT NOT NULL,
  pickup_time      TEXT NOT NULL,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT,
  car_id           INTEGER REFERENCES cars(id),
  driver_id        INTEGER REFERENCES drivers(id),
  with_driver      BOOLEAN NOT NULL DEFAULT true,
  notes            TEXT,
  distance_km      NUMERIC(10,2),
  driver_fee       NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price      NUMERIC(10,2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_rules (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  rule_type   TEXT NOT NULL DEFAULT 'flat',
  value       NUMERIC(10,2) NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id                     SERIAL PRIMARY KEY,
  show_chauffeur_service BOOLEAN NOT NULL DEFAULT true,
  currency               TEXT NOT NULL DEFAULT 'USD',
  admin_password_hash    TEXT,
  updated_at             TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon_name   TEXT NOT NULL DEFAULT 'Star',
  image_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed default site settings row
INSERT INTO site_settings (show_chauffeur_service, currency)
SELECT true, 'USD'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- Seed default services
INSERT INTO services (title, description, icon_name, sort_order)
SELECT * FROM (VALUES
  ('Airport Transfers',  'Punctual, stress-free airport pickups and drop-offs. We monitor your flight in real time so our chauffeur is always there.', 'Plane', 0),
  ('Corporate Travel',   'Elevate your business travel with discreet, professional chauffeur service. Wi-Fi enabled vehicles and on-account billing available.', 'Building2', 1),
  ('Special Events',     'Weddings, galas, red-carpet arrivals — arrive in style. Our chauffeurs are impeccably dressed for every occasion.', 'CalendarDays', 2),
  ('Hourly Charter',     'Keep a luxury vehicle and professional chauffeur at your disposal for as many hours as you need — ideal for city tours and VIP runs.', 'Clock', 3)
) AS s(title, description, icon_name, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM services);

SQL
success "All tables created and seeded."

# ── 7. Write .env ────────────────────────────────────────────
info "Writing .env file..."
ENV_FILE=".env"

# Don't overwrite a SESSION_SECRET that already exists
EXISTING_SECRET=""
if [ -f "$ENV_FILE" ]; then
  EXISTING_SECRET=$(grep "^SESSION_SECRET=" "$ENV_FILE" 2>/dev/null | cut -d= -f2-)
fi
SESSION_SECRET="${EXISTING_SECRET:-$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 64)}"

cat > "$ENV_FILE" <<ENVFILE
# Elite Chauffeur — Local Environment
# Generated by install.sh on $(date)
# ⚠  Keep this file private — never commit it to git

DATABASE_URL=${DB_URL}
SESSION_SECRET=${SESSION_SECRET}

# Set to 'production' when deploying
NODE_ENV=development
ENVFILE

success ".env written."

# ── 8. Install dependencies ───────────────────────────────────
info "Installing dependencies (this may take a minute)..."
pnpm install
success "Dependencies installed."

# ── 9. Done ──────────────────────────────────────────────────
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}   Setup complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "  Database : ${CYAN}${DB_NAME}${NC} (local PostgreSQL)"
echo "  User     : ${CYAN}${DB_USER}${NC}"
echo "  URL      : ${CYAN}${DB_URL}${NC}"
echo ""
echo "  To start the app:"
echo "    ${YELLOW}pnpm --filter @workspace/api-server run dev${NC}   (API, port 8080)"
echo "    ${YELLOW}pnpm --filter @workspace/elite-chauffeur run dev${NC} (Web, port 5173)"
echo ""
echo "  Admin panel: ${CYAN}http://localhost:5173/administration${NC}"
echo "  Default password: ${CYAN}elite2024${NC}"
echo ""
echo -e "${YELLOW}  ⚠  Change the admin password after your first login.${NC}"
echo ""
