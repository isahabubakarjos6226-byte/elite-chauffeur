import { NextRequest, NextResponse } from 'next/server';

interface GeoPoint {
  lat: number;
  lon: number;
  display_name?: string;
}

// Geocode an address using Nominatim
async function geocode(query: string): Promise<GeoPoint | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EliteChauffeur/1.0',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data || data.length === 0) return null;
    
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Calculate distance using Haversine formula
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  
  return 2 * R * Math.asin(Math.sqrt(a));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pickup, dropoff } = body;
    
    if (!pickup || !dropoff) {
      return NextResponse.json(
        { error: 'Missing pickup or dropoff address' },
        { status: 400 }
      );
    }
    
    // Geocode both addresses
    const [pickupCoords, dropoffCoords] = await Promise.all([
      geocode(pickup),
      geocode(dropoff),
    ]);
    
    if (!pickupCoords || !dropoffCoords) {
      return NextResponse.json(
        { 
          error: 'Could not geocode one or both addresses',
          distanceKm: null,
          pickup: pickupCoords,
          dropoff: dropoffCoords,
        },
        { status: 200 }
      );
    }
    
    // Calculate distance
    const distanceKm = haversineDistance(
      pickupCoords.lat, pickupCoords.lon,
      dropoffCoords.lat, dropoffCoords.lon
    );
    
    return NextResponse.json({
      distanceKm: Math.round(distanceKm * 100) / 100,
      pickup: pickupCoords,
      dropoff: dropoffCoords,
    });
  } catch (error) {
    console.error('Geocode API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
