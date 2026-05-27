"use client";

import { useState, useEffect } from "react";
import { Wind, Droplets, Eye, ArrowUp, Cloud, Thermometer, AlertTriangle, Satellite, Waves, BarChart2, Phone, Loader } from "lucide-react";
import HeroBackgroundSlideshow from "./HeroBackgroundSlideshow";

const quickLinks = [
  { icon: AlertTriangle, label: "Prakiraan", sub: "Cuaca Terkini", color: "text-yellow-400" },
  { icon: AlertTriangle, label: "Peringatan Dini", sub: "Informasi Waspada", color: "text-orange-400" },
  { icon: Waves, label: "Ocean Forecast", sub: "Prediksi Gelombang", color: "text-blue-400" },
  { icon: Satellite, label: "Satelit Cuaca", sub: "Citra Terkini", color: "text-green-400" },
];

const bottomLinks = [
  { icon: BarChart2, label: "Data & Informasi", sub: "Real-time" },
  { icon: Cloud, label: "Layanan", sub: "Informasi Layanan" },
  { icon: Phone, label: "Kegiatan", sub: "Dokumentasi" },
  { icon: Phone, label: "Kontak", sub: "Hubungi Kami" },
];

interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  wind: { speed: number; direction: string };
  humidity: number;
  waves: number;
  tide: string;
  tideTime: string;
  updated: string;
}

const FALLBACK_DATA: WeatherData = {
  city: "Tegal, Jawa Tengah",
  temp: 29,
  condition: "Cerah Berawan",
  wind: { speed: 15, direction: "Timur Laut" },
  humidity: 74,
  waves: 1.2,
  tide: "Naik",
  tideTime: "19.00 WIB",
  updated: new Date().toISOString(),
};

function formatUpdated(updated: string | undefined) {
  try {
    if (!updated) return '';
    return new Date(updated).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  } catch {
    return String(updated || '');
  }
}

export default function HeroSection() {
  const [currentTime, setCurrentTime] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Fetch weather data from API
  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/bmkg/tegal", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch weather data");
      const json = await res.json();
      if (json.success && json.data) {
        setWeatherData(json.data);
      } else {
        throw new Error(json.warning || "Invalid response format");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error fetching weather";
      setError(msg);
      console.error("Weather fetch error:", msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch on mount
    fetchWeatherData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchWeatherData, 1000 * 60 * 5);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB");
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex flex-col">
      <HeroBackgroundSlideshow />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#001a66]/90 via-[#003399]/75 to-[#003399]/50" />

      {/* Badge */}
      <div className="relative z-10 flex justify-start pt-24 px-6 md:px-16">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white text-xs">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Informasi Resmi BMKG
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center px-6 md:px-16 pb-8">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text */}
          <div className="text-white">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Selamat Datang di<br />
              <span className="text-yellow-400">Stasiun Meteorologi</span><br />
              Maritim Tegal
            </h1>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-8 max-w-md">
              Menyediakan informasi cuaca maritim yang akurat, cepat, dan terpercaya untuk keselamatan pelayaran dan masyarakat.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#prakiraan"
                className="px-6 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white text-sm font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-blue-500/30"
              >
                Lihat Prakiraan
              </a>
              <a
                href="#layanan"
                className="px-6 py-2.5 bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white text-sm font-semibold rounded-full border border-white/30 transition-all duration-200"
              >
                Peringatan Dini
              </a>
            </div>
            <button className="mt-4 text-yellow-400 text-sm underline underline-offset-2 hover:text-yellow-300 transition-colors">
              Lihat Detail Cuaca →
            </button>
          </div>

          {/* Right: Weather Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/20 pb-3">
              <div>
                <p className="text-white font-semibold text-sm">{weatherData.city}</p>
                <p className="text-blue-200 text-xs">
                  Update: {mounted ? (currentTime || formatUpdated(weatherData.updated)) : '—'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {loading ? (
                  <Loader size={14} className="text-blue-300 animate-spin" />
                ) : (
                  <>
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-300 text-xs">Live</span>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-2 mb-3 text-red-200 text-xs">
                {error}
              </div>
            )}

            <div className="flex items-center gap-4 mb-5">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mb-1">
                  <Cloud className="text-yellow-300" size={32} />
                </div>
              </div>
              <div>
                <div className="flex items-start">
                  <span className="text-white text-6xl font-bold leading-none">{weatherData.temp}</span>
                  <span className="text-white text-2xl font-light mt-2">°C</span>
                </div>
                <p className="text-blue-200 text-sm mt-1">{weatherData.condition}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <Wind size={16} className="text-blue-300 mx-auto mb-1" />
                <p className="text-white text-sm font-bold">{weatherData.wind.speed}</p>
                <p className="text-blue-200 text-xs">km/h</p>
                <p className="text-blue-200 text-xs">{weatherData.wind.direction}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <Droplets size={16} className="text-blue-300 mx-auto mb-1" />
                <p className="text-white text-sm font-bold">{weatherData.humidity}%</p>
                <p className="text-blue-200 text-xs">Kelembapan</p>
                <p className="text-blue-200 text-xs">Rendah</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <Waves size={16} className="text-blue-300 mx-auto mb-1" />
                <p className="text-white text-sm font-bold">{weatherData.waves}m</p>
                <p className="text-blue-200 text-xs">Gelombang</p>
                <p className="text-blue-200 text-xs">Rendah</p>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUp size={14} className="text-green-400" />
                <span className="text-white text-xs font-medium">Pasang Surut</span>
              </div>
              <div className="text-right">
                <p className="text-green-400 text-xs font-semibold">{weatherData.tide}</p>
                <p className="text-blue-200 text-xs">{weatherData.tideTime}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Bar */}
      <div className="relative z-10 bg-[#001a66]/80 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {quickLinks.map((item) => (
              <a
                key={item.label}
                href="#"
                className="flex items-center gap-3 px-4 py-4 hover:bg-white/5 transition-colors group"
              >
                <item.icon size={20} className={`${item.color} flex-shrink-0`} />
                <div>
                  <p className="text-white text-xs font-semibold group-hover:text-yellow-400 transition-colors">{item.label}</p>
                  <p className="text-blue-300 text-xs">{item.sub}</p>
                </div>
              </a>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 border-t border-white/10">
            {bottomLinks.map((item) => (
              <a
                key={item.label}
                href="#"
                className="flex items-center gap-3 px-4 py-4 hover:bg-white/5 transition-colors group"
              >
                <item.icon size={18} className="text-blue-300 flex-shrink-0" />
                <div>
                  <p className="text-white text-xs font-semibold group-hover:text-yellow-400 transition-colors">{item.label}</p>
                  <p className="text-blue-300 text-xs">{item.sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
