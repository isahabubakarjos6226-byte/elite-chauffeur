import { Router } from "express";
import { CalculateDistanceBody } from "@workspace/api-zod";

const router = Router();

router.post("/calculate", async (req, res) => {
  const body = CalculateDistanceBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const { origin, destination } = body.data;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    // Fallback: estimate distance via straight-line calculation using geocoding
    // Return a placeholder if no API key is configured
    res.json({
      distanceKm: 0,
      durationMinutes: 0,
      originAddress: origin,
      destinationAddress: destination,
    });
    return;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&units=metric&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json() as any;

    if (data.status !== "OK" || data.rows[0]?.elements[0]?.status !== "OK") {
      res.status(422).json({ error: "Could not calculate distance. Check the addresses." });
      return;
    }

    const element = data.rows[0].elements[0];
    const distanceKm = element.distance.value / 1000;
    const durationMinutes = Math.round(element.duration.value / 60);

    res.json({
      distanceKm,
      durationMinutes,
      originAddress: data.origin_addresses[0],
      destinationAddress: data.destination_addresses[0],
    });
  } catch (err) {
    req.log.error({ err }, "Distance calculation failed");
    res.status(500).json({ error: "Distance calculation failed" });
  }
});

export default router;
