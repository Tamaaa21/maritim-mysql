"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2, Loader } from "lucide-react";
import MaritimeWeatherCard from "@/components/MaritimeWeatherCard";
import EarthquakeCard from "@/components/EarthquakeCard";

export default function DisplayPage() {
  const [pamphletImages, setPamphletImages] = useState<string[]>([]);
  const [pamphletIndex, setPamphletIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <main className="h-screen w-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      <Navbar minimal />

      {/* Content area — mt-16 clears fixed navbar, pt-2 adds small top breathing room */}
      <div className="h-[calc(100vh-64px)] mt-16 flex flex-col pt-2 pb-2 px-4 md:px-10 w-full max-w-[1600px] mx-auto overflow-hidden">

        {/* Main Grid Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden min-h-0">

          {/* ───── Left Column: Main Pamphlet Display ───── */}
          <div className="lg:col-span-2 flex flex-col h-full min-h-0">
            <div
              ref={containerRef}
              className={`relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl w-full flex-1 flex flex-col justify-center items-center group transition-all duration-300 ${isFullscreen ? "rounded-none border-none max-w-none w-screen h-screen aspect-auto" : ""
                }`}
            >
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader size={36} className="text-blue-500 animate-spin" />
                  <p className="text-gray-400 text-sm">Memuat display informasi...</p>
                </div>
              ) : pamphletImages.length > 0 ? (
                <>
                  {/* Slide image */}
                  <div className="absolute inset-0 w-full h-full">
                    <img
                      src={pamphletImages[pamphletIndex]}
                      alt={`Display ${pamphletIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50 pointer-events-none" />

                  {/* Controls (visible on hover) */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-4">
                      <button onClick={togglePlay} className="w-9 h-9 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full flex items-center justify-center transition-all" title={isPlaying ? "Jeda" : "Putar"}>
                        {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                      </button>
                      <span className="text-xs text-gray-300 font-medium">
                        Slide {pamphletIndex + 1} / {pamphletImages.length}
                        {isPlaying && <span className="ml-2 text-blue-400 text-[10px] uppercase tracking-wider animate-pulse">(Auto)</span>}
                      </span>
                    </div>

                    <div className="hidden md:flex items-center gap-1.5">
                      {pamphletImages.map((_, idx) => (
                        <button key={idx} onClick={() => setPamphletIndex(idx)}
                          className={`h-2 rounded-full transition-all duration-300 ${idx === pamphletIndex ? "bg-blue-500 w-5" : "bg-white/30 hover:bg-white/50 w-2"}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={handlePrev} className="w-9 h-9 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full flex items-center justify-center transition-all" title="Sebelumnya">
                        <ChevronLeft size={18} />
                      </button>
                      <button onClick={handleNext} className="w-9 h-9 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full flex items-center justify-center transition-all" title="Selanjutnya">
                        <ChevronRight size={18} />
                      </button>
                      <button onClick={toggleFullscreen} className="w-9 h-9 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full flex items-center justify-center transition-all ml-1" title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}>
                        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-white font-semibold">Tidak Ada Display</h3>
                  <p className="text-gray-500 text-sm mt-1">Belum ada pamflet atau display yang diunggah.</p>
                </div>
              )}
            </div>
            {pamphletImages.length > 1 && (
              <p className="text-gray-600 text-[10px] mt-1.5 italic text-center flex-shrink-0">
                * Arahkan kursor ke display untuk membuka kontrol navigasi & layar penuh.
              </p>
            )}
          </div>

          {/* ───── Right Column: Video + Earthquake ───── */}
          <div className="hidden lg:flex lg:col-span-1 flex-col gap-4 h-full min-h-0">

            {/* Card 1 (top-right): Video Card */}
            <div className="flex flex-col gap-4 h-full min-h-0">
              <div className="shrink-0">
                <MaritimeWeatherCard />
              </div>

              <div className="flex-1 min-h-0">
                <EarthquakeCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

