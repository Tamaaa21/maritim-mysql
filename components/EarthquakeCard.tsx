"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Loader, RefreshCw } from "lucide-react";

/* ──────────────────────────────────────────────
   EarthquakeCard — fetches latest quake data
   from BMKG public JSON API (no proxy needed,
   same-origin fetch is not used here as BMKG
   allows CORS on their public data endpoint).
   The shakemap image URL is constructed client-
   side and rendered with a sanitised <img> tag.
────────────────────────────────────────────── */

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

export default function EarthquakeCard() {
  const [gempa, setGempa] = useState<GempaData | null>(null);
  const [imgError, setImgError] = useState(false);
  const [loadingGempa, setLoadingGempa] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchGempa = async () => {
    setLoadingGempa(true);
    setFetchError(null);
    setImgError(false);
    try {
      // BMKG public REST API — returns JSON with CORS headers allowed
      const res = await fetch("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const data: GempaData = json?.Infogempa?.gempa;
      if (!data) throw new Error("Data gempa tidak tersedia");
      setGempa(data);
    } catch (e: any) {
      setFetchError(e?.message || "Gagal memuat data gempa");
    } finally {
      setLoadingGempa(false);
    }
  };

  useEffect(() => {
    fetchGempa();
    // Refresh every 5 minutes
    const iv = setInterval(fetchGempa, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  // Build the shakemap URL safely — only allow filenames from BMKG domain
  const shakemapUrl = gempa?.Shakemap
    ? `https://data.bmkg.go.id/DataMKG/TEWS/${encodeURIComponent(gempa.Shakemap)}`
    : null;

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-orange-400" />
          <p className="text-white text-xs font-bold uppercase tracking-widest">Gempa Terkini</p>
        </div>
        <button
          onClick={fetchGempa}
          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
          title="Refresh data gempa"
        >
          <RefreshCw size={12} className={loadingGempa ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {loadingGempa && !gempa ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader size={24} className="text-orange-400 animate-spin" />
          </div>
        ) : fetchError && !gempa ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 p-4">
            <AlertTriangle size={24} className="text-red-400" />
            <p className="text-red-300 text-xs text-center">{fetchError}</p>
            <button onClick={fetchGempa} className="mt-1 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
              Coba Lagi
            </button>
          </div>
        ) : gempa ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Shakemap image */}
            {shakemapUrl && !imgError ? (
              <div className="w-2/5 flex-shrink-0 bg-gray-900/50 flex items-center justify-center p-1">
                <img
                  src={shakemapUrl}
                  alt="Peta Shakemap Gempa BMKG"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={() => setImgError(true)}
                  loading="lazy"
                />
              </div>
            ) : null}

            {/* Info text */}
            <div className="flex-1 min-w-0 overflow-y-auto px-3 py-2 space-y-1.5 text-xs">
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-wide">Magnitudo</p>
                <p className="text-orange-400 text-lg font-extrabold leading-none">{gempa.Magnitude} SR</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-wide">Waktu</p>
                <p className="text-white font-medium">{gempa.Tanggal} — {gempa.Jam}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-wide">Kedalaman</p>
                <p className="text-white font-medium">{gempa.Kedalaman}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-wide">Wilayah</p>
                <p className="text-white font-medium leading-snug">{gempa.Wilayah}</p>
              </div>
              {gempa.Potensi && (
                <div className="pt-1 border-t border-white/10">
                  <p className="text-yellow-300 text-[10px] font-semibold leading-snug">{gempa.Potensi}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
