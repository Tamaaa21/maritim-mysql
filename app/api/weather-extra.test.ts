import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const originalFetch = global.fetch;

describe("API: /api/weather GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should return 400 when no lat/lon and no bmkg source", async () => {
    process.env.BMKG_API_URL = "";
    process.env.OPENWEATHER_API_KEY = "";
    const { GET } = await import("./weather/route");
    const req = new Request("http://localhost:3000/api/weather");
    const response = await GET(req as any);
    expect(response.status).toBe(400);
  });

  it("should proxy BMKG API when source=bmkg and URL configured", async () => {
    process.env.BMKG_API_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=33.76.01.1001";
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
          wd_deg: 90,
          analysis_date: new Date().toISOString(),
        }]],
      }],
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBMKGResponse),
    } as Response);

    const { GET } = await import("./weather/route");
    const req = new Request("http://localhost:3000/api/weather?source=bmkg");
    const response = await GET(req as any);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("should use OpenWeatherMap when lat/lon provided", async () => {
    process.env.OPENWEATHER_API_KEY = "test-key";
    const mockOWMResponse = {
      name: "Tegal",
      main: { temp: 30, humidity: 80 },
      weather: [{ description: "clear sky" }],
      visibility: 10000,
      wind: { speed: 5, deg: 180 },
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOWMResponse),
    } as Response);

    const { GET } = await import("./weather/route");
    const req = new Request("http://localhost:3000/api/weather?lat=-6.8683&lon=109.1256");
    const response = await GET(req as any);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.city).toBe("Tegal");
  });

  it("should return 502 when OpenWeatherMap fails", async () => {
    process.env.OPENWEATHER_API_KEY = "test-key";
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    } as Response);

    const { GET } = await import("./weather/route");
    const req = new Request("http://localhost:3000/api/weather?lat=-6.8683&lon=109.1256");
    const response = await GET(req as any);
    expect(response.status).toBe(502);
  });

  it("should return cached BMKG data on fetch failure", async () => {
    process.env.BMKG_API_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=33.76.01.1001";
    const mockData = { city: "Tegal", temp: 29 };
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 503,
    } as Response);

    const { GET } = await import("./weather/route");
    const req = new Request("http://localhost:3000/api/weather?source=bmkg");
    const response = await GET(req as any);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("should handle BMKG API response mapping with missing fields", async () => {
    process.env.BMKG_API_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=33.76.01.1001";
    const mockBMKGResponse = {
      lokasi: { kotkab: "Kota Tegal", provinsi: "Jawa Tengah" },
      data: [{
        cuaca: [[{
          local_datetime: new Date().toISOString(),
          t: 29,
          weather_desc: null,
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

    const { GET } = await import("./weather/route");
    const req = new Request("http://localhost:3000/api/weather?source=bmkg");
    const response = await GET(req as any);
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
