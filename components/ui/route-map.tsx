'use client';

import { useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface Coordinates {
  lat: number;
  lon: number;
  display_name?: string;
}

interface RouteMapProps {
  pickup: Coordinates | null;
  dropoff: Coordinates | null;
  className?: string;
}

export function RouteMap({ pickup, dropoff, className = '' }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically import Leaflet on client side only
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      // Import CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!mapRef.current) return;

      // Initialize map if not already done
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
        }).setView([33.5731, -7.5898], 12); // Default to Casablanca

        // Add dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(mapInstanceRef.current);
      }

      const map = mapInstanceRef.current;

      // Clear existing markers and polyline
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }

      // Custom marker icons
      const pickupIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: #ffffff; border: 3px solid #0d0d0d; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
          <span style="color: #0d0d0d; font-weight: bold; font-size: 14px;">A</span>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const dropoffIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: #0d0d0d; border: 3px solid #ffffff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
          <span style="color: #ffffff; font-weight: bold; font-size: 14px;">B</span>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const bounds: L.LatLngBoundsExpression = [];

      // Add pickup marker
      if (pickup) {
        const pickupMarker = L.marker([pickup.lat, pickup.lon], { icon: pickupIcon })
          .addTo(map)
          .bindPopup(`<strong>Pickup</strong><br/>${pickup.display_name || 'Point A'}`);
        markersRef.current.push(pickupMarker);
        bounds.push([pickup.lat, pickup.lon]);
      }

      // Add dropoff marker
      if (dropoff) {
        const dropoffMarker = L.marker([dropoff.lat, dropoff.lon], { icon: dropoffIcon })
          .addTo(map)
          .bindPopup(`<strong>Dropoff</strong><br/>${dropoff.display_name || 'Point B'}`);
        markersRef.current.push(dropoffMarker);
        bounds.push([dropoff.lat, dropoff.lon]);
      }

      // Draw line between points
      if (pickup && dropoff) {
        polylineRef.current = L.polyline(
          [[pickup.lat, pickup.lon], [dropoff.lat, dropoff.lon]],
          { 
            color: '#ffffff', 
            weight: 3, 
            opacity: 0.8,
            dashArray: '10, 10'
          }
        ).addTo(map);
      }

      // Fit bounds if we have markers
      if (bounds.length > 0) {
        if (bounds.length === 1) {
          map.setView(bounds[0] as L.LatLngExpression, 14);
        } else {
          map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50] });
        }
      }
    };

    initMap();

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [pickup, dropoff]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-xl overflow-hidden border border-border"
        style={{ minHeight: '300px' }}
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-foreground border-2 border-background flex items-center justify-center text-xs font-bold text-background">A</div>
          <span className="text-foreground">Pickup</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-background border-2 border-foreground flex items-center justify-center text-xs font-bold text-foreground">B</div>
          <span className="text-foreground">Dropoff</span>
        </div>
      </div>
      
      {/* No locations message */}
      {!pickup && !dropoff && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-xl">
          <div className="text-center text-muted-foreground">
            <MapPin size={32} className="mx-auto mb-2 opacity-50" />
            <p>Enter pickup and dropoff locations to see the route</p>
          </div>
        </div>
      )}
    </div>
  );
}
