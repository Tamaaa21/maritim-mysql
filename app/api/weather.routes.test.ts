import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const originalFetch = global.fetch;

describe("API: /api/bmkg/tegal GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should return weather data from BMKG API", async () => {
    const mockBMKGResponse = {
      lokasi: { kotkab: "Kota Tegal", provinsi: "Jawa Tengah" },
      data: [{
        cuaca: [[{
          local_datetime: new Date().toISOString(),
          t: 29,
          weather_desc: "Cerah Berawan",
          hu: 75,
          ws: 7,
          wd: "E",
        }]],
      }],
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBMKGResponse),
    } as Response);

    const { GET } = await import("./bmkg/tegal/route");
    const req = new Request("http://localhost:3000/api/bmkg/tegal");
    const response = await GET(req as any);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("should return fallback data when BMKG API fails", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 503,
    } as Response);

    const { GET } = await import("./bmkg/tegal/route");
    const req = new Request("http://localhost:3000/api/bmkg/tegal");
    const response = await GET(req as any);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.city).toBe("Kota Tegal, Jawa Tengah");
  });
});

describe("API: /api/weather GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    process.env.BMKG_API_URL = "";
    process.env.OPENWEATHER_API_KEY = "";
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should return 400 when no lat/lon and no bmkg source", async () => {
    const { GET } = await import("./weather/route");
    const req = new Request("http://localhost:3000/api/weather");
    const response = await GET(req as any);
    expect(response.status).toBe(400);
  });
});
