# Workspace

## Overview

pnpm workspace monorepo — **Elite Chauffeur** luxury black car booking platform with public website, booking form with Google Maps distance calculation, and a full admin dashboard. PostgreSQL database persists all data.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifact: `elite-chauffeur`)
- **API framework**: Express 5 (artifact: `api-server`)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Features

### Public Website
- Hero landing page with inline booking form
- Fleet showcase (`/fleet`) — cars loaded from DB with AI-generated images
- Services page (`/services`)
- Full booking page (`/book`) with distance calculation + cost estimator

### Booking Form
- Pickup / dropoff location fields
- "Calculate Distance" button — POSTs to `/api/distance/calculate` (Google Maps Distance Matrix API)
- Car selection dropdown (from DB)
- With/without driver toggle
- Cost = `distanceKm × car.pricePerKm + car.baseFee`

### Admin Dashboard (`/admin`)
- **Dashboard** — stats overview (total revenue, reservations, fleet, drivers) + revenue bar chart
- **Reservations** — list with status filter, edit status, assign car/driver, delete
- **Calendar** — monthly calendar view; click to cancel/remove reservations
- **Cars** — full fleet CRUD (add/edit/delete cars, set price per km, base fee, category)
- **Drivers** — driver CRUD with rating, languages, experience
- **Pricing** — pricing tier CRUD (name, price per km, base fee, category)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned)
- `GOOGLE_MAPS_API_KEY` — (optional) Google Maps Distance Matrix API key for real distance calculation. Without it, distance calculation returns 0 (users can enter manually).

## Database Schema

- `cars` — fleet vehicles with price per km, base fee, category (with_driver / without_driver / both)
- `drivers` — chauffeurs with rating, languages, availability
- `reservations` — bookings with pickup/dropoff, distance, total price, status, linked car & driver
- `pricing` — configurable pricing tiers

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
