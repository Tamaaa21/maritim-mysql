import type { NextRequest } from 'next/server';

export const runtime = "nodejs";

const BMKG_API = process.env.BMKG_API_URL || 'https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=33.76.01.1001';

interface BMKGCache {
  data: Record<string, unknown> | null;
  expires: number;
}

let CACHE: BMKGCache = { data: null, expires: 0 };

interface BMKGForecast {
  local_datetime: string;
  ws: string;
  wd: string;
  t: number | string;
  hu: number | string;
  weather_desc: string;
  [key: string]: unknown;
}

const WIND_DIR_MAP: Record<string, string> = {
  'N': 'Utara', 'NNE': 'Utara Timur Laut', 'NE': 'Timur Laut', 'ENE': 'Timur Timur Laut',
  'E': 'Timur', 'ESE': 'Timur Tenggara', 'SE': 'Tenggara', 'SSE': 'Selatan Tenggara',
  'S': 'Selatan', 'SSW': 'Selatan Barat Daya', 'SW': 'Barat Daya', 'WSW': 'Barat Barat Daya',
  'W': 'Barat', 'WNW': 'Barat Barat Laut', 'NW': 'Barat Laut', 'NNW': 'Utara Barat Laut',
};

function getWindDirection(wd: string): string {
  return WIND_DIR_MAP[wd] || wd;
}

function findClosestForecast(entries: BMKGForecast[]): BMKGForecast {
  const now = new Date();
  let closest = entries[0];
  let minDiff = Infinity;
  for (const e of entries) {
    const diff = Math.abs(new Date(e.local_datetime).getTime() - now.getTime());
    if (diff < minDiff) {
      minDiff = diff;
      closest = e;
    }
  }
  return closest;
}

async function fetchBMKGData() {
  const res = await fetch(BMKG_API, {
    headers: { 'User-Agent': 'BMKG-Maritim-Tegal/1.0' },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`BMKG API fetch failed: ${res.status}`);
  const json = await res.json();

  const allEntries = json.data.flatMap((d: Record<string, unknown>) =>
    (d.cuaca as BMKGForecast[][]).flatMap((group) => group)
  );
  const closest = findClosestForecast(allEntries);
  if (!closest) throw new Error('No forecast data found');

  const speedKmh = parseFloat(closest.ws) || 0;
  const speedKnots = Math.round(speedKmh / 1.852);

  return {
    city: `${json.lokasi.kotkab}, ${json.lokasi.provinsi}`,
    temp: Number(closest.t) || 0,
    condition: closest.weather_desc || 'Cerah',
    wind: {
      speed_kmh: Math.round(speedKmh),
      speed_knots: speedKnots,
      direction_from: getWindDirection(closest.wd),
    },
    humidity: Number(closest.hu) || 0,
    waves: null,
    updated: new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const ttl = process.env.BMKG_CACHE_TTL ? parseInt(process.env.BMKG_CACHE_TTL) : 1000 * 60 * 10;

  if (CACHE.expires > Date.now() && CACHE.data) {
    return Response.json({ success: true, cached: true, data: CACHE.data });
  }

  try {
    const data = await fetchBMKGData();
    CACHE = { data, expires: Date.now() + ttl };
    return Response.json({ success: true, cached: false, data });
  } catch (err: unknown) {
    const fallback = CACHE.data || {
      city: 'Kota Tegal, Jawa Tengah',
      temp: 29,
      condition: 'Cerah Berawan',
      wind: { speed_kmh: 7, speed_knots: 4, direction_from: 'Timur' },
      humidity: 75,
      waves: null,
      updated: new Date().toISOString(),
    };
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ success: true, cached: !!CACHE.data, data: fallback, warning: message });
  }
}
