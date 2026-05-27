import type { NextRequest } from 'next/server';

// Simple in-memory cache (server instance scoped). TTL configurable via BMKG_CACHE_TTL (ms)
let CACHE: { data: any | null; expires: number } = { data: null, expires: 0 };

// Fallback mock data if scraping fails
const FALLBACK_DATA = {
  city: 'Tegal, Jawa Tengah',
  temp: 28,
  condition: 'Cerah Berawan',
  wind: { speed: 12, direction: 'Timur Laut' },
  humidity: 75,
  waves: 1.0,
  tide: 'Naik',
  tideTime: '19.00 WIB',
  updated: new Date().toISOString(),
};

export async function GET(req: NextRequest) {
  const ttl = process.env.BMKG_CACHE_TTL ? parseInt(process.env.BMKG_CACHE_TTL) : 1000 * 60 * 5; // 5m default

  if (CACHE.expires > Date.now() && CACHE.data) {
    return new Response(
      JSON.stringify({ success: true, cached: true, data: CACHE.data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Try BMKG public API for Tegal (Jawa Tengah)
    const data = await fetchBMKGData();
    CACHE = { data, expires: Date.now() + ttl };
    return new Response(
      JSON.stringify({ success: true, cached: false, data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    const errMsg = String(err?.message || err);
    // Return last known cache if available, otherwise fallback
    const fallback = CACHE.data || FALLBACK_DATA;
    return new Response(
      JSON.stringify({ success: true, cached: !CACHE.data, data: fallback, warning: errMsg }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function fetchBMKGData() {
  // Try BMKG public API (data.bmkg.go.id)
  const apiUrl = 'https://data.bmkg.go.id/DataMKG/MEWS/LatestObservasi/';
  const res = await fetch(apiUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BMKG-Client/1.0)' },
  });

  if (!res.ok) throw new Error(`BMKG API fetch failed: ${res.status}`);

  const json = (await res.json()) as any;

  // Parse BMKG JSON response - find Tegal data
  if (!json || !Array.isArray(json.Pesan)) {
    throw new Error('Unexpected BMKG response format');
  }

  // Search for Tegal or use first maritime station
  let tegalData = json.Pesan.find((item: any) =>
    item.lokasi?.toLowerCase().includes('tegal')
  );

  if (!tegalData) {
    // Fallback: use first available data
    tegalData = json.Pesan[0];
  }

  if (!tegalData) {
    throw new Error('No station data found in BMKG response');
  }

  const updated = new Date(tegalData.periode || Date.now());
  const formatted = {
    city: tegalData.lokasi || 'Tegal, Jawa Tengah',
    temp: parseInt(tegalData.T || '28'),
    condition: tegalData.Cuaca || 'Cerah Berawan',
    wind: {
      speed: parseInt(tegalData.Ff || '12'),
      direction: parseWindDirection(parseInt(tegalData.dd || '45')),
    },
    humidity: parseInt(tegalData.RH || '75'),
    waves: parseFloat(tegalData.Tn || '1.0'),
    tide: 'Naik',
    tideTime: formatTime(updated),
    updated: updated.toISOString(),
  };

  return formatted;
}

function parseWindDirection(degrees: number): string {
  const directions = [
    'Utara', 'Utara Timur Laut', 'Timur Laut', 'Timur Timur Laut',
    'Timur', 'Timur Tenggara', 'Tenggara', 'Selatan Tenggara',
    'Selatan', 'Selatan Barat Daya', 'Barat Daya', 'Barat Barat Daya',
    'Barat', 'Barat Laut Barat', 'Barat Laut', 'Utara Barat Laut',
  ];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}.${minutes} WIB`;
}

export const runtime = 'nodejs';
