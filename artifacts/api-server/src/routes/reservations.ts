import { Router } from "express";
import { db, reservationsTable, carsTable, driversTable } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import {
  CreateReservationBody,
  ListReservationsQueryParams,
  GetReservationParams,
  UpdateReservationParams,
  UpdateReservationBody,
  DeleteReservationParams,
  GetCalendarReservationsQueryParams,
} from "@workspace/api-zod";
import nodemailer from "nodemailer";

const router = Router();

function mapReservation(r: any, car?: any, driver?: any) {
  return {
    ...r,
    distanceKm: r.distanceKm ? parseFloat(r.distanceKm) : null,
    driverFee: r.driverFee ? parseFloat(r.driverFee) : null,
    totalPrice: r.totalPrice ? parseFloat(r.totalPrice) : null,
    car: car ? { ...car, pricePerKm: parseFloat(car.pricePerKm), baseFee: parseFloat(car.baseFee), driverFee: parseFloat(car.driverFee ?? "0") } : null,
    driver: driver ? { ...driver, rating: parseFloat(driver.rating) } : null,
  };
}

// Calendar endpoint must be before /:id
router.get("/calendar", async (req, res) => {
  const query = GetCalendarReservationsQueryParams.safeParse(req.query);
  const now = new Date();
  const month = query.success && query.data.month ? query.data.month : now.getMonth() + 1;
  const year = query.success && query.data.year ? query.data.year : now.getFullYear();

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;

  const reservations = await db
    .select({ reservation: reservationsTable, car: carsTable, driver: driversTable })
    .from(reservationsTable)
    .leftJoin(carsTable, eq(reservationsTable.carId, carsTable.id))
    .leftJoin(driversTable, eq(reservationsTable.driverId, driversTable.id))
    .where(and(gte(reservationsTable.pickupDate, startDate), lte(reservationsTable.pickupDate, endDate)));

  const events = reservations.map(({ reservation, car, driver }) => ({
    id: reservation.id,
    title: `${reservation.customerName} - ${car?.name ?? "No car"}`,
    date: reservation.pickupDate,
    time: reservation.pickupTime,
    status: reservation.status,
    customerName: reservation.customerName,
    carName: car?.name ?? null,
    driverName: driver?.name ?? null,
  }));

  res.json(events);
});

router.get("/", async (req, res) => {
  const query = ListReservationsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }

  const conditions: any[] = [];
  if (query.data.status) conditions.push(eq(reservationsTable.status, query.data.status));
  if (query.data.from) conditions.push(gte(reservationsTable.pickupDate, query.data.from));
  if (query.data.to) conditions.push(lte(reservationsTable.pickupDate, query.data.to));

  const rows = await db
    .select({ reservation: reservationsTable, car: carsTable, driver: driversTable })
    .from(reservationsTable)
    .leftJoin(carsTable, eq(reservationsTable.carId, carsTable.id))
    .leftJoin(driversTable, eq(reservationsTable.driverId, driversTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${reservationsTable.pickupDate} DESC`);

  res.json(rows.map(({ reservation, car, driver }) => mapReservation(reservation, car, driver)));
});

router.post("/", async (req, res) => {
  const body = CreateReservationBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body", details: body.error.flatten() });
    return;
  }
  const [reservation] = await db.insert(reservationsTable).values({
    carId: body.data.carId ?? null,
    driverId: body.data.driverId ?? null,
    customerName: body.data.customerName,
    customerEmail: body.data.customerEmail,
    customerPhone: body.data.customerPhone ?? null,
    pickupLocation: body.data.pickupLocation,
    dropoffLocation: body.data.dropoffLocation,
    pickupDate: body.data.pickupDate,
    pickupTime: body.data.pickupTime,
    distanceKm: body.data.distanceKm != null ? String(body.data.distanceKm) : null,
    driverFee: body.data.driverFee != null ? String(body.data.driverFee) : null,
    totalPrice: body.data.totalPrice != null ? String(body.data.totalPrice) : null,
    withDriver: body.data.withDriver,
    notes: body.data.notes ?? null,
  }).returning();
  res.status(201).json(mapReservation(reservation));
});

// Email reminder — must be before /:id
router.post("/:id/remind", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .select({ reservation: reservationsTable, car: carsTable, driver: driversTable })
    .from(reservationsTable)
    .leftJoin(carsTable, eq(reservationsTable.carId, carsTable.id))
    .leftJoin(driversTable, eq(reservationsTable.driverId, driversTable.id))
    .where(eq(reservationsTable.id, id));

  if (!row) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }

  const reservation = row.reservation;
  const customMessage: string | undefined = (req.body as any)?.message;

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");

  if (!smtpHost || !smtpUser || !smtpPass) {
    req.log.warn("SMTP not configured — reminder not sent");
    res.json({
      success: true,
      note: "SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS (and optionally SMTP_FROM, SMTP_PORT) to enable email sending.",
    });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const emailBody = customMessage ?? [
    `Dear ${reservation.customerName},`,
    "",
    "This is a reminder for your upcoming reservation with Elite Chauffeur.",
    "",
    `Date: ${reservation.pickupDate} at ${reservation.pickupTime}`,
    `From: ${reservation.pickupLocation}`,
    `To: ${reservation.dropoffLocation}`,
    `Amount: $${parseFloat(reservation.totalPrice ?? "0").toFixed(2)}`,
    "",
    "If you have any questions or need to make changes, please contact us.",
    "",
    "Thank you,",
    "Elite Chauffeur Team",
  ].join("\n");

  await transporter.sendMail({
    from: `"Elite Chauffeur" <${smtpFrom}>`,
    to: reservation.customerEmail,
    subject: `Reservation Reminder — ${reservation.pickupDate} at ${reservation.pickupTime}`,
    text: emailBody,
    html: `<pre style="font-family:sans-serif;white-space:pre-wrap">${emailBody}</pre>`,
  });

  req.log.info({ reservationId: id, to: reservation.customerEmail }, "Reminder email sent");
  res.json({ success: true, note: `Reminder sent to ${reservation.customerEmail}` });
});

// Email confirmation — must be before /:id
router.post("/:id/confirm", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [row] = await db
    .select({ reservation: reservationsTable, car: carsTable, driver: driversTable })
    .from(reservationsTable)
    .leftJoin(carsTable, eq(reservationsTable.carId, carsTable.id))
    .leftJoin(driversTable, eq(reservationsTable.driverId, driversTable.id))
    .where(eq(reservationsTable.id, id));

  if (!row) { res.status(404).json({ error: "Reservation not found" }); return; }

  const reservation = row.reservation;
  const customMessage: string | undefined = (req.body as any)?.message;

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");

  if (!smtpHost || !smtpUser || !smtpPass) {
    req.log.warn("SMTP not configured — confirmation not sent");
    res.json({
      success: true,
      note: "SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS (and optionally SMTP_FROM, SMTP_PORT) to enable email sending.",
    });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost, port: smtpPort, secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const emailBody = customMessage ?? [
    `Dear ${reservation.customerName},`,
    "",
    "We are pleased to confirm your reservation with Elite Chauffeur.",
    "",
    `Reference: #${String(reservation.id).padStart(5, "0")}`,
    `Date: ${reservation.pickupDate} at ${reservation.pickupTime}`,
    `Pickup: ${reservation.pickupLocation}`,
    `Drop-off: ${reservation.dropoffLocation}`,
    `Total: $${parseFloat(reservation.totalPrice ?? "0").toFixed(2)}`,
    "",
    "Our chauffeur will be waiting for you. For any questions, please contact us.",
    "",
    "Thank you for choosing Elite Chauffeur.",
    "",
    "Warm regards,",
    "Elite Chauffeur Team",
  ].join("\n");

  await transporter.sendMail({
    from: `"Elite Chauffeur" <${smtpFrom}>`,
    to: reservation.customerEmail,
    subject: `Reservation Confirmed — #${String(reservation.id).padStart(5, "0")}`,
    text: emailBody,
    html: `<pre style="font-family:sans-serif;white-space:pre-wrap">${emailBody}</pre>`,
  });

  req.log.info({ reservationId: id, to: reservation.customerEmail }, "Confirmation email sent");
  res.json({ success: true, note: `Confirmation sent to ${reservation.customerEmail}` });
});

router.get("/:id", async (req, res) => {
  const params = GetReservationParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [row] = await db
    .select({ reservation: reservationsTable, car: carsTable, driver: driversTable })
    .from(reservationsTable)
    .leftJoin(carsTable, eq(reservationsTable.carId, carsTable.id))
    .leftJoin(driversTable, eq(reservationsTable.driverId, driversTable.id))
    .where(eq(reservationsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }
  res.json(mapReservation(row.reservation, row.car, row.driver));
});

router.put("/:id", async (req, res) => {
  const params = UpdateReservationParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateReservationBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const updateData: any = {};
  if (body.data.carId !== undefined) updateData.carId = body.data.carId;
  if (body.data.driverId !== undefined) updateData.driverId = body.data.driverId;
  if (body.data.customerName !== undefined) updateData.customerName = body.data.customerName;
  if (body.data.customerEmail !== undefined) updateData.customerEmail = body.data.customerEmail;
  if (body.data.customerPhone !== undefined) updateData.customerPhone = body.data.customerPhone;
  if (body.data.pickupLocation !== undefined) updateData.pickupLocation = body.data.pickupLocation;
  if (body.data.dropoffLocation !== undefined) updateData.dropoffLocation = body.data.dropoffLocation;
  if (body.data.pickupDate !== undefined) updateData.pickupDate = body.data.pickupDate;
  if (body.data.pickupTime !== undefined) updateData.pickupTime = body.data.pickupTime;
  if (body.data.distanceKm !== undefined) updateData.distanceKm = body.data.distanceKm != null ? String(body.data.distanceKm) : null;
  if (body.data.driverFee !== undefined) updateData.driverFee = body.data.driverFee != null ? String(body.data.driverFee) : null;
  if (body.data.totalPrice !== undefined) updateData.totalPrice = body.data.totalPrice != null ? String(body.data.totalPrice) : null;
  if (body.data.withDriver !== undefined) updateData.withDriver = body.data.withDriver;
  if (body.data.status !== undefined) updateData.status = body.data.status;
  if (body.data.notes !== undefined) updateData.notes = body.data.notes;

  const [reservation] = await db.update(reservationsTable)
    .set(updateData)
    .where(eq(reservationsTable.id, params.data.id))
    .returning();

  if (!reservation) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }
  res.json(mapReservation(reservation));
});

router.delete("/:id", async (req, res) => {
  const params = DeleteReservationParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(reservationsTable).where(eq(reservationsTable.id, params.data.id));
  res.json({ success: true });
});

export default router;
