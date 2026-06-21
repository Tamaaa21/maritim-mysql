import type { NextRequest } from 'next/server'

const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'

// Simple in-memory cache for BMKG responses
let BMKG_CACHE: { data: Record<string, unknown> | null; expires: number } = { data: null, expires: 0 };
const BMKG_CACHE_TTL = process.env.BMKG_CACHE_TTL ? parseInt(process.env.BMKG_CACHE_TTL) : 1000 * 60 * 10;

function degToCompass(num: number) {
  const val = Math.floor((num / 22.5) + 0.5);
  const arr = ["Utara","Utara Timur Laut","Timur","Tenggara","Selatan","Barat Daya","Barat","Barat Laut"];
  return arr[(val % 8)];
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  // BMKG API URL (optional) — can be set to proxy BMKG instead of OpenWeatherMap
  const bmkgUrlEnv = process.env.BMKG_API_URL || (apiKey && apiKey.includes('bmkg') ? apiKey : undefined);

  const url = new URL(req.url);
  const source = url.searchParams.get('source');
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');

  // If not requesting BMKG proxy, require lat and lon
  if (source !== 'bmkg' && (!lat || !lon)) {
    return new Response(JSON.stringify({ success: false, message: 'lat and lon query parameters required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // If source=bmkg and BMKG url configured, proxy BMKG API with caching
    if (source === 'bmkg' && bmkgUrlEnv) {
      // return cached if fresh
      if (BMKG_CACHE.expires > Date.now() && BMKG_CACHE.data) {
        return new Response(JSON.stringify({ success: true, cached: true, data: BMKG_CACHE.data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // allow adm4 param override or use provided bmkgUrlEnv as-is
      const adm4 = url.searchParams.get('adm4');
      let target = bmkgUrlEnv;
      try {
        const u = new URL(bmkgUrlEnv);
        if (adm4) u.searchParams.set('adm4', adm4);
        target = u.toString();
      } catch {
        // if bmkgUrlEnv isn't a full URL, append adm4 if provided
        if (adm4) target = `${bmkgUrlEnv}${bmkgUrlEnv.includes('?') ? '&' : '?'}adm4=${encodeURIComponent(adm4)}`;
      }

      const r = await fetch(target, { headers: { 'User-Agent': 'BMKG-Maritim-Tegal/1.0' } });
      if (!r.ok) {
        const txt = await r.text().catch(() => '');
        // on error, return cached fallback if available
        if (BMKG_CACHE.data) {
          BMKG_CACHE.expires = Date.now() + BMKG_CACHE_TTL; // extend a bit
          return new Response(JSON.stringify({ success: true, cached: true, data: BMKG_CACHE.data, warning: `BMKG fetch failed ${r.status}` }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ success: false, status: r.status, body: txt || 'BMKG fetch failed' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }

      const raw = await r.json().catch(async () => { const t = await r.text(); return { raw: t }; });

      // Try to map BMKG response to our unified data schema
      try {
        const lokasi = raw?.lokasi || raw?.data?.[0]?.lokasi || null;
        const firstBlock = raw?.data?.[0]?.cuaca?.[0]?.[0] || raw?.data?.[0]?.cuaca?.[0] || null;
        const entry = firstBlock || null;

        const windMs = entry?.ws != null ? Number(entry.ws) : null;
        const windKmh = windMs != null ? Math.round(windMs * 3.6) : null;
        const windKnots = windKmh != null ? Math.round(windKmh / 1.852) : null;
        const windDeg = entry?.wd_deg != null ? Number(entry.wd_deg) : null;

        const mapped = {
          city: lokasi ? `${lokasi.kotkab || lokasi.provinsi || 'Tegal'}` : 'Tegal',
          temp: entry?.t ?? null,
          condition: entry?.weather_desc || entry?.weather_desc_en || null,
          humidity: entry?.hu ?? null,
          visibility: entry?.vs ?? entry?.vs_text ?? null,
          wind: {
            speed_m_s: windMs,
            speed_kmh: windKmh,
            speed_knots: windKnots,
            direction_deg: windDeg,
            direction_from: windDeg != null ? degToCompass(windDeg) : (entry?.wd || null),
          },
          waves: null,
          current: null,
          tide: null,
          tideTime: null,
          updated: entry?.analysis_date || entry?.utc_datetime || new Date().toISOString(),
          raw: raw,
        };

        BMKG_CACHE = { data: mapped, expires: Date.now() + BMKG_CACHE_TTL };
        return new Response(JSON.stringify({ success: true, cached: false, data: mapped }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (mapErr) {
        BMKG_CACHE = { data: raw, expires: Date.now() + BMKG_CACHE_TTL };
        return new Response(JSON.stringify({ success: true, cached: false, data: raw }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    }

    const fetchUrl = `${OPENWEATHER_URL}?lat=${encodeURIComponent(lat || '')}&lon=${encodeURIComponent(lon || '')}&units=metric&appid=${apiKey || ''}`;
    const r = await fetch(fetchUrl, { headers: { 'User-Agent': 'BMKG-Maritim-Tegal/1.0' } });
    if (!r.ok) {
      const text = await r.text();
      return new Response(JSON.stringify({ success: false, status: r.status, body: text }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }

    const json = await r.json();

    const windMs = json.wind?.speed ?? null;
    const windKmh = windMs != null ? Math.round(windMs * 3.6) : null;
    const windKnots = windKmh != null ? Math.round(windKmh / 1.852) : null;
    const windDirDeg = json.wind?.deg ?? null;
    const windDirText = windDirDeg != null ? degToCompass(windDirDeg) : null;

    const data = {
      city: json.name || null,
      temp: json.main?.temp ?? null,
      condition: json.weather && json.weather[0] ? (json.weather[0].description || null) : null,
      humidity: json.main?.humidity ?? null,
      visibility: json.visibility ?? null, // meters
      wind: {
        speed_m_s: windMs,
        speed_kmh: windKmh,
        speed_knots: windKnots,
        direction_deg: windDirDeg,
        direction_from: windDirText,
      },
      // maritime-specific fields not provided by OpenWeatherMap
      waves: null,
      current: null,
      tide: null,
      tideTime: null,
      updated: new Date().toISOString(),
    };

    return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ success: false, message: "Gagal mengambil data cuaca" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export const runtime = 'nodejs'
