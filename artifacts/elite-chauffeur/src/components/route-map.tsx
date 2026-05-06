import { useEffect, useRef } from "react";

interface Coords {
  lat: number;
  lon: number;
  label: string;
}

interface RouteMapProps {
  pickup?: Coords;
  dropoff?: Coords;
  className?: string;
}

export default function RouteMap({ pickup, dropoff, className }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let mapInstance: any = null;

    const setup = async () => {
      const L = await import("leaflet");

      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!containerRef.current) return;

      const center: [number, number] = pickup
        ? [pickup.lat, pickup.lon]
        : dropoff
        ? [dropoff.lat, dropoff.lon]
        : [48.8566, 2.3522];

      mapInstance = L.map(containerRef.current, { zoomControl: true }).setView(center, 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapInstance);

      const goldIcon = L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#b8963e;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const bounds: [number, number][] = [];

      if (pickup) {
        L.marker([pickup.lat, pickup.lon], { icon: goldIcon })
          .addTo(mapInstance)
          .bindPopup(`<b style="color:#0f1f3d">Pickup</b><br/><span style="font-size:11px;color:#555">${pickup.label.split(",").slice(0, 3).join(", ")}</span>`);
        bounds.push([pickup.lat, pickup.lon]);
      }

      if (dropoff) {
        const blueIcon = L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;border-radius:50%;background:#2563eb;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker([dropoff.lat, dropoff.lon], { icon: blueIcon })
          .addTo(mapInstance)
          .bindPopup(`<b style="color:#0f1f3d">Dropoff</b><br/><span style="font-size:11px;color:#555">${dropoff.label.split(",").slice(0, 3).join(", ")}</span>`);
        bounds.push([dropoff.lat, dropoff.lon]);
      }

      if (pickup && dropoff) {
        L.polyline(
          [
            [pickup.lat, pickup.lon],
            [dropoff.lat, dropoff.lon],
          ],
          { color: "#b8963e", weight: 3, dashArray: "8 5", opacity: 0.85 }
        ).addTo(mapInstance);
        mapInstance.fitBounds(bounds as any, { padding: [40, 40] });
      } else if (bounds.length === 1) {
        mapInstance.setView(bounds[0], 13);
      }
    };

    setup();

    return () => {
      mapInstance?.remove();
    };
  }, [pickup?.lat, pickup?.lon, dropoff?.lat, dropoff?.lon]);

  return (
    <div
      ref={containerRef}
      className={className ?? "w-full h-52 rounded-lg overflow-hidden border border-border"}
      style={{ zIndex: 0, minHeight: "13rem" }}
    />
  );
}
