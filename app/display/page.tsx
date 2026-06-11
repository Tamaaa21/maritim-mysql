"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  Loader,
  Thermometer, 
  Droplets, 
  Wind, 
  Waves, 
  Activity, 
  MapPin, 
  Clock, 
  Calendar,
  CloudLightning,
  CloudRain,
  Cloud,
  Sun
} from "lucide-react";

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
  waves: number;
  updated: string;
}

interface GempaData {
  Tanggal: string;
  Jam: string;
  DateTime: string;
  Coordinates: string;
  Lintang: string;
  Bujur: string;
  Magnitude: string;
  Kedalaman: string;
  Wilayah: string;
  Potensi: string;
  Dirasakan: string;
  Shakemap: string;
}

export default function DisplayPage() {
  const [pamphletImages, setPamphletImages] = useState<string[]>([]);
  const [pamphletIndex, setPamphletIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Time & Date State for Header Clock
  const [timeString, setTimeString] = useState("");
  const [dateString, setDateString] = useState("");

  // Port Weather State
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // Earthquake State
  const [gempa, setGempa] = useState<GempaData | null>(null);
  const [loadingGempa, setLoadingGempa] = useState(true);

  // Clock ticks every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
      setDateString(now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Pamphlets on Mount
  useEffect(() => {
    let mounted = true;
    async function fetchPamflets() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/pamflets");
        const j = await res.json();
        if (mounted && j?.success && Array.isArray(j.data)) {
          const urls = j.data.map((it: any) => it.url).filter(Boolean);
          setPamphletImages(urls);
          setPamphletIndex(0);
        }
      } catch (e) {
        console.error("Gagal memuat display:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPamflets();
    return () => { mounted = false; };
  }, []);

  // Fetch Weather Data (loops every 10 mins)
  const fetchWeather = async () => {
    try {
      setLoadingWeather(true);
      const res = await fetch("/api/bmkg/tegal");
      const json = await res.json();
      if (json.success && json.data) {
        setWeather(json.data);
      }
    } catch (err) {
      console.error("Error fetching weather:", err);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Earthquake Data (loops every 5 mins)
  const fetchGempa = async () => {
    try {
      setLoadingGempa(true);
      const res = await fetch("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json", {
        cache: "no-store"
      });
      if (!res.ok) throw new Error("Network response error");
      const json = await res.json();
      const data: GempaData = json?.Infogempa?.gempa;
      if (data) {
        setGempa(data);
      }
    } catch (err) {
      console.error("Error fetching earthquake data:", err);
    } finally {
      setLoadingGempa(false);
    }
  };

  useEffect(() => {
    fetchGempa();
    const interval = setInterval(fetchGempa, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Pamphlet Slideshow Loop
  useEffect(() => {
    if (!isPlaying || !pamphletImages || pamphletImages.length <= 1) return;
    const t = setInterval(() => {
      setPamphletIndex((s) => (s + 1) % pamphletImages.length);
    }, 15000);
    return () => clearInterval(t);
  }, [pamphletImages, isPlaying]);

  const handlePrev = () => {
    if (pamphletImages.length === 0) return;
    setPamphletIndex((s) => (s - 1 + pamphletImages.length) % pamphletImages.length);
  };

  const handleNext = () => {
    if (pamphletImages.length === 0) return;
    setPamphletIndex((s) => (s + 1) % pamphletImages.length);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Map condition to icons
  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("hujan") && c.includes("petir")) return <CloudLightning className="text-amber-500" size={24} />;
    if (c.includes("hujan")) return <CloudRain className="text-blue-500" size={24} />;
    if (c.includes("berawan")) return <Cloud className="text-slate-400" size={24} />;
    return <Sun className="text-amber-500" size={24} />;
  };

  return (
    <main className="h-screen w-screen bg-[#f8fafc] text-slate-800 flex flex-col overflow-y-auto md:overflow-hidden select-none">
      
      {/* CSS Keyframes for smooth rotating border glow */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes border-spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}} />
      
      {/* ───── Custom Blue Dashboard Header ───── */}
      <header className="h-16 shrink-0 bg-[#003399] text-white px-6 md:px-8 flex items-center justify-between shadow-lg z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm border border-slate-100">
            <img src="/bmkg-logo.png" alt="BMKG" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-extrabold text-white tracking-tight leading-tight uppercase">
              STASIUN METEOROLOGI MARITIM TEGAL
            </h1>
            <p className="text-[9px] md:text-[10px] text-blue-200 font-bold tracking-widest uppercase">
              Display Informasi Digital
            </p>
          </div>
        </div>

        {/* Real-time Clock */}
        <div className="flex items-center gap-3 text-right">
          <div className="hidden sm:block">
            <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">{dateString}</p>
            <p className="text-sm font-black text-white font-mono leading-none mt-1">
              {timeString} <span className="text-yellow-400 text-xs font-extrabold">WIB</span>
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
        </div>
      </header>

      {/* ───── Main Content Viewport ───── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto md:overflow-hidden min-h-0">

        {/* Left Side: Main Pamphlet Slideshow Display with Animated Glow */}
        <div className="w-full lg:flex-1 h-full flex flex-col justify-center items-center min-w-0 relative p-[3px]">
          {/* Animated Moving Blue Glow (Hidden in Fullscreen) */}
          {!isFullscreen && (
            <>
              {/* Sharp border light track */}
              <div className="absolute inset-0 rounded-[28px] overflow-hidden pointer-events-none z-0">
                <div 
                  className="absolute top-1/2 left-1/2 w-[250%] h-[250%]"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 30%, #00d2ff 45%, #3b82f6 50%, #003399 55%, transparent 70%)',
                    animation: 'border-spin 8s linear infinite'
                  }}
                />
              </div>
              {/* Soft blur overlay shadow */}
              <div className="absolute inset-0 rounded-[28px] overflow-hidden pointer-events-none blur-xl opacity-40 z-0">
                <div 
                  className="absolute top-1/2 left-1/2 w-[250%] h-[250%]"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 30%, #00d2ff 45%, #3b82f6 50%, #003399 55%, transparent 70%)',
                    animation: 'border-spin 8s linear infinite'
                  }}
                />
              </div>
            </>
          )}

          <div
            ref={containerRef}
            className={`relative rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-md h-full w-full flex justify-center items-center group transition-all duration-300 z-10 ${
              isFullscreen ? "rounded-none border-none max-w-none w-screen h-screen aspect-auto" : ""
            }`}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-3 px-12">
                <Loader size={32} className="text-blue-600 animate-spin" />
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Memuat display...</p>
              </div>
            ) : pamphletImages.length > 0 ? (
              <>
                {/* Slide image rendered directly - wraps borders to image dimensions */}
                <img
                  src={pamphletImages[pamphletIndex]}
                  alt={`Display ${pamphletIndex + 1}`}
                  className="h-full w-auto object-contain max-w-full max-h-full transition-all duration-300 shadow-inner rounded-3xl"
                />

                {/* Bottom Overlay Controls (Visible on Hover) */}
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 z-10">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={togglePlay} 
                      className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-[#003399] active:scale-95 rounded-full flex items-center justify-center transition-all shadow-sm"
                      title={isPlaying ? "Jeda" : "Putar"}
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                    </button>
                    <span className="text-xs text-slate-600 font-bold">
                      Slide {pamphletIndex + 1} / {pamphletImages.length}
                      {isPlaying && <span className="ml-1.5 text-blue-600 text-[10px] uppercase font-black tracking-wider animate-pulse">(Auto)</span>}
                    </span>
                  </div>

                  <div className="hidden md:flex items-center gap-1.5">
                    {pamphletImages.map((_, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setPamphletIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === pamphletIndex ? "bg-[#003399] w-4" : "bg-slate-200 hover:bg-slate-300 w-1.5"}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button onClick={handlePrev} className="w-8 h-8 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-full flex items-center justify-center transition-all border" title="Sebelumnya">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={handleNext} className="w-8 h-8 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-full flex items-center justify-center transition-all border" title="Selanjutnya">
                      <ChevronRight size={16} />
                    </button>
                    <button 
                      onClick={toggleFullscreen} 
                      className="w-8 h-8 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-full flex items-center justify-center transition-all border ml-1" 
                      title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
                    >
                      {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-slate-800 font-bold">Tidak Ada Display</h3>
                <p className="text-slate-400 text-xs mt-1">Belum ada pamphlet yang diunggah.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Port Weather & Earthquake parameters (Compact, constrained width) */}
        <div className="w-full lg:w-[440px] shrink-0 lg:h-full flex flex-col gap-4 overflow-hidden min-h-0">

          {/* ───── Panel 1: Cuaca Pelabuhan (Port Weather) ───── */}
          <div className="flex-1 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between min-h-0">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-slate-850 text-sm md:text-base leading-tight">Cuaca Pelabuhan</h3>
                  <p className="text-[9px] text-slate-400 mt-0.5">Stasiun Meteorologi Maritim Tegal</p>
                </div>
                {weather && (
                  <div className="p-1.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100 shadow-inner">
                    {getWeatherIcon(weather.condition)}
                  </div>
                )}
              </div>

              {loadingWeather ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <Loader size={20} className="text-blue-500 animate-spin" />
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Memuat data cuaca...</span>
                </div>
              ) : weather ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">{weather.temp}°C</span>
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-100/60 px-2 py-0.5 rounded-full">{weather.condition}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 flex items-center gap-2">
                      <Thermometer size={15} className="text-blue-600 shrink-0" />
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider leading-none">Kelembapan</span>
                        <span className="text-xs font-extrabold text-slate-800">{weather.humidity}%</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 flex items-center gap-2">
                      <Wind size={15} className="text-teal-600 shrink-0" />
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider leading-none">Kecepatan Angin</span>
                        <span className="text-xs font-extrabold text-slate-800">{weather.wind.speed_knots} knot</span>
                      </div>
                    </div>
                    <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-2xl p-2.5 flex items-center gap-2">
                      <Waves size={15} className="text-cyan-600 shrink-0" />
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider leading-none">Tinggi Gelombang</span>
                        <span className="text-xs font-extrabold text-slate-800">{weather.waves} meter</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-red-500 mt-4">Gagal memuat cuaca.</p>
              )}
            </div>
            {weather && (
              <p className="text-[9px] text-slate-400 border-t pt-2 border-slate-100 shrink-0 flex items-center justify-between">
                <span>Update data otomatis</span>
                <span className="font-semibold">{new Date(weather.updated).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</span>
              </p>
            )}
          </div>

          {/* ───── Panel 2: Custom Earthquake Parameter (Includes visual map + all telemetry) ───── */}
          <div className="flex-1 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between min-h-0">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-slate-850 text-sm md:text-base leading-tight">Gempabumi Terkini</h3>
                  <p className="text-[9px] text-slate-400 mt-0.5">BMKG TEWS Nasional (M ≥ 5.0)</p>
                </div>
                {gempa && (
                  <div className={`p-1.5 rounded-xl border shadow-inner shrink-0 ${
                    gempa.Potensi.toLowerCase().includes("tidak berpotensi") 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                      : "bg-red-50 text-red-600 border-red-100 animate-pulse"
                  }`}>
                    <Activity size={16} />
                  </div>
                )}
              </div>

              {loadingGempa ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <Loader size={20} className="text-red-500 animate-spin" />
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Memuat data gempa...</span>
                </div>
              ) : gempa ? (
                <div className="mt-3 flex flex-col sm:flex-row gap-4 items-stretch flex-1 min-h-0">
                  {/* Visual Shakemap Image (Capped size to prevent overflow) */}
                  <div className="h-32 sm:h-36 aspect-square bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 shadow-inner relative self-center">
                    <img 
                      src={`https://data.bmkg.go.id/DataMKG/TEWS/${encodeURIComponent(gempa.Shakemap)}`} 
                      alt="Shakemap" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Telemetry Parameters */}
                  <div className="flex-1 flex flex-col justify-between gap-1.5 min-h-0 text-left py-0.5">
                    {/* Mag & Kedalaman */}
                    <div className="grid grid-cols-2 gap-1.5 shrink-0">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-1 flex items-center gap-1.5">
                        <div className="bg-red-50 border border-red-100 px-2 py-0.5 rounded-lg text-center shrink-0">
                          <span className="text-xs font-black text-red-600 font-mono leading-none">{gempa.Magnitude}</span>
                          <span className="text-[7px] block text-red-500 font-bold leading-none">SR</span>
                        </div>
                        <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider leading-none">Mag</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-1 flex items-center gap-1.5">
                        <div className="bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg text-center shrink-0">
                          <span className="text-xs font-black text-blue-600 font-mono leading-none">{gempa.Kedalaman}</span>
                        </div>
                        <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider leading-none">Kedalaman</span>
                      </div>
                    </div>

                    {/* Wilayah / Pusat Gempa (Removed truncation to show full text) */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-1.5 flex items-start gap-1.5 shrink-0">
                      <MapPin size={11} className="text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider leading-none">Pusat Gempa / Wilayah</span>
                        <span className="text-[9px] font-extrabold text-slate-800 leading-tight block">{gempa.Wilayah}</span>
                      </div>
                    </div>

                    {/* Additional Metadata Grid */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8.5px] border-t border-slate-100 pt-1.5 shrink-0">
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[7px] leading-none mb-0.5">Tanggal</span>
                        <span className="text-slate-700 font-semibold">{gempa.Tanggal}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[7px] leading-none mb-0.5">Waktu</span>
                        <span className="text-slate-700 font-semibold">{gempa.Jam} WIB</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[7px] leading-none mb-0.5">Koordinat</span>
                        <span className="text-slate-700 font-semibold">{gempa.Lintang} - {gempa.Bujur}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[7px] leading-none mb-0.5">Sistem</span>
                        <span className="text-slate-700 font-semibold font-mono">Auto-TEWS</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-red-500 mt-4">Gagal memuat info gempa.</p>
              )}
            </div>
            {gempa && (
              <div className="space-y-1 shrink-0 mt-1">
                {/* Tsunami Potency */}
                <div className={`p-1.5 rounded-xl text-[9px] font-bold text-center border ${
                  gempa.Potensi.toLowerCase().includes("tidak berpotensi")
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-red-50 text-red-700 border-red-150 animate-pulse"
                }`}>
                  <span className="uppercase text-[7px] tracking-wider block opacity-75 leading-none mb-0.5">Potensi Ancaman</span>
                  {gempa.Potensi}
                </div>
                {/* MMI Scale if available (Removed truncation to show full text) */}
                {gempa.Dirasakan && (
                  <div className="p-1.5 rounded-xl text-[9px] font-semibold text-center border bg-slate-50 border-slate-100 text-slate-700">
                    <span className="uppercase text-[7px] font-bold tracking-wider block text-slate-400 leading-none mb-0.5">Dirasakan (MMI)</span>
                    {gempa.Dirasakan}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
