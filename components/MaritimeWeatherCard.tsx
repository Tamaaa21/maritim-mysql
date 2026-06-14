"use client";

import { useEffect, useState } from "react";
import { CloudRain, Sun, Wind, Waves, Thermometer, Droplets, Cloud, CloudLightning } from "lucide-react";

interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  wind: {
    speed_kmh: number;
    speed_knots: number;
    direction_from: string;
  };
  humidity: number;
  updated: string;
}

export default function MaritimeWeatherCard() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch("/api/bmkg/tegal");
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("hujan") && c.includes("petir")) return <CloudLightning className="text-yellow-400" size={32} />;
    if (c.includes("hujan")) return <CloudRain className="text-blue-300" size={32} />;
    if (c.includes("berawan")) return <Cloud className="text-gray-300" size={32} />;
    return <Sun className="text-yellow-400" size={32} />;
  };

  if (loading) {
    return (
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex justify-center items-center h-48 mx-auto shadow-xl">
        <div className="w-8 h-8 border-4 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex justify-center items-center text-white/70 mx-auto text-sm">
        Gagal memuat data cuaca.
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:bg-white/15 transition-all duration-300">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl group-hover:bg-blue-400/40 transition-all duration-500"></div>

      <div className="relative z-10 flex flex-col gap-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-white">Cuaca Kota Tegal</h3>
            <p className="text-xs text-blue-100 mt-1 opacity-80">Update: {new Date(data.updated).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</p>
          </div>
          <div className="p-2 bg-white/10 rounded-xl border border-white/10 shadow-sm">
            {getWeatherIcon(data.condition)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black">{data.temp}°C</span>
            <span className="text-sm font-medium text-blue-100">{data.condition}</span>
          </div>
          <div className="flex flex-col gap-2 justify-center pl-4 border-l border-white/20">
            <div className="flex items-center gap-2 text-sm">
              <Thermometer size={14} className="text-blue-200" />
              <span>Suhu</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Droplets size={14} className="text-blue-200" />
              <span>{data.humidity}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
          <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <Wind size={20} className="text-blue-200" />
            <div className="flex flex-col">
              <span className="text-[10px] text-blue-200 uppercase tracking-wider">Angin</span>
              <span className="text-sm font-semibold">{data.wind.speed_knots} kt</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <Waves size={20} className="text-blue-200" />
            <div className="flex flex-col">
              <span className="text-[10px] text-blue-200 uppercase tracking-wider">Arah Angin</span>
              <span className="text-sm font-semibold">{data.wind.direction_from}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
