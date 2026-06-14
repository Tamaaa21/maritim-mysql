"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, 
  Wrench, 
  GraduationCap, 
  Waves, 
  Coins, 
  Gift, 
  Compass, 
  ChevronRight, 
  Info, 
  X,
  Shield
} from "lucide-react";

interface LayananCard {
  id: string;
  nama_layanan: string;
  deskripsi: string;
  url_google_form: string | null;
  cover_url?: string | null;
}

const getServiceConfig = (title: string) => {
  const t = title.toLowerCase();
  
  if (t.includes("data") || t.includes("informasi") || t.includes("dokumen") || t.includes("laporan") || t.includes("arsip")) {
    return {
      Icon: Database,
      bg: "bg-blue-50 border-blue-100",
      iconColor: "text-blue-600",
      accent: "hover:border-blue-300 hover:shadow-blue-500/5",
      badgeText: "Layanan Data",
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
    };
  }
  if (t.includes("kalibrasi") || t.includes("alat") || t.includes("uji") || t.includes("stasiun") || t.includes("instrumen") || t.includes("perawatan")) {
    return {
      Icon: Wrench,
      bg: "bg-amber-50 border-amber-100",
      iconColor: "text-amber-600",
      accent: "hover:border-amber-300 hover:shadow-amber-500/5",
      badgeText: "Jasa Kalibrasi",
      coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80"
    };
  }
  if (t.includes("kunjungan") || t.includes("sosialisasi") || t.includes("edukasi") || t.includes("sekolah") || t.includes("magang") || t.includes("pkl") || t.includes("wisata")) {
    return {
      Icon: GraduationCap,
      bg: "bg-indigo-50 border-indigo-100",
      iconColor: "text-indigo-600",
      accent: "hover:border-indigo-300 hover:shadow-indigo-500/5",
      badgeText: "Edukasi & Sosial",
      coverImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80"
    };
  }
  if (t.includes("maritim") || t.includes("pelayaran") || t.includes("cuaca") || t.includes("laut") || t.includes("gelombang") || t.includes("pelabuhan")) {
    return {
      Icon: Waves,
      bg: "bg-cyan-50 border-cyan-100",
      iconColor: "text-cyan-600",
      accent: "hover:border-cyan-300 hover:shadow-cyan-500/5",
      badgeText: "Info Maritim",
      coverImage: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=600&q=80"
    };
  }
  if (t.includes("berbayar") || t.includes("tarif") || t.includes("pnbp") || t.includes("komersial") || t.includes("harga")) {
    return {
      Icon: Coins,
      bg: "bg-emerald-50 border-emerald-100",
      iconColor: "text-emerald-600",
      accent: "hover:border-emerald-300 hover:shadow-emerald-500/5",
      badgeText: "PNBP Berbayar",
      coverImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80"
    };
  }
  if (t.includes("gratis") || t.includes("nol") || t.includes("non-pnbp")) {
    return {
      Icon: Gift,
      bg: "bg-teal-50 border-teal-100",
      iconColor: "text-teal-600",
      accent: "hover:border-teal-300 hover:shadow-teal-500/5",
      badgeText: "Tarif Rp 0,-",
      coverImage: "https://images.unsplash.com/photo-1494707924465-e1426acb48cb?auto=format&fit=crop&w=600&q=80"
    };
  }
  
  // Default fallback
  return {
    Icon: Compass,
    bg: "bg-slate-50 border-slate-100",
    iconColor: "text-slate-600",
    accent: "hover:border-slate-300 hover:shadow-slate-500/5",
    badgeText: "Layanan Umum",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80"
  };
};

export default function LayananSection({ limit }: { limit?: number }) {
  const [services, setServices] = useState<LayananCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/admin/layanan-cards");
        const json = await res.json();
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setServices(json.data);
        } else {
          setServices([]);
        }
      } catch (e) {
        console.error("Gagal mengambil data layanan:", e);
        setServices([]);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const handleCardClick = (url: string | null) => {
    if (url && url.trim() !== "") {
      window.open(url, "_blank");
    } else {
      setAlertOpen(true);
    }
  };

  return (
    <section id="layanan" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#003399] text-xs font-bold uppercase tracking-wider mb-3">
            Portal Informasi & Pengaduan
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none mt-2">
            Layanan Kami
          </h2>
          <p className="text-slate-500 mt-3 text-sm md:text-base max-w-lg mx-auto">
            Akses berbagai jenis pelayanan publik resmi Stasiun Meteorologi Maritim Tegal secara daring.
          </p>
        </div>

        {/* Service Cards Grid */}
        {loading ? (
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-3xl p-6 h-64 animate-pulse flex flex-col justify-between w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]">
                <div>
                  <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
                  <div className="h-5 bg-gray-200 rounded w-2/3 mt-4" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200 mb-12">
            <Info size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">Belum ada kartu layanan yang terdaftar.</p>
            <p className="text-gray-400 text-sm mt-1">Admin dapat menambahkan layanan di Panel Admin.</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 mb-12 items-stretch">
            {(limit ? services.slice(0, limit) : services).map((svc) => {
              const { Icon, bg, iconColor, accent, badgeText, coverImage } = getServiceConfig(svc.nama_layanan);

              const imgSrc = svc.cover_url || coverImage;

              return (
                <button
                  key={svc.id}
                  onClick={() => handleCardClick(svc.url_google_form)}
                  className={`group bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col text-left h-full w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] ${accent}`}
                >
                  {/* Top: Cover Image with Overlays */}
                  <div className="relative w-full h-36 overflow-hidden shrink-0">
                    <img 
                      src={imgSrc} 
                      alt={svc.nama_layanan} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                    
                    {/* Badge */}
                    <span className={`absolute top-3 right-3 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${bg} ${iconColor} border shadow-sm`}>
                      {badgeText}
                    </span>

                    {/* Floating Overlapping Icon */}
                    <div className={`absolute -bottom-4 left-5 w-9.5 h-9.5 rounded-xl border flex items-center justify-center bg-white shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon size={18} className={iconColor} />
                    </div>
                  </div>

                  {/* Title & Description & CTA */}
                  <div className="p-5 pt-6 flex-1 flex flex-col justify-between w-full">
                    <div className="flex-1 flex flex-col justify-start">
                      <h3 className="text-slate-900 font-bold text-sm sm:text-base mb-1.5 group-hover:text-[#003399] transition-colors leading-snug line-clamp-2">
                        {svc.nama_layanan}
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3">
                        {svc.deskripsi}
                      </p>
                    </div>

                    <span className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm text-[#003399] font-bold group-hover:gap-2 transition-all">
                      Akses Layanan <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Selanjutnya */}
        {limit && services.length > limit && (
          <div className="mb-12 text-center">
            <a
              href="/layanan"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#003399] text-[#003399] hover:bg-[#003399] hover:text-white font-semibold text-sm rounded-full transition-all duration-200"
            >
              Selanjutnya <ChevronRight size={16} />
            </a>
          </div>
        )}

        {/* Bottom Banner */}
        <div className="bg-gray-50 border border-gray-150 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield size={16} className="text-[#003399]" />
            </div>
            <p className="text-slate-600 text-xs sm:text-sm">
              Seluruh permohonan layanan publik BMKG dapat diakses secara online melalui tautan formulir resmi di atas.
            </p>
          </div>
        </div>
      </div>

      {/* Alert Pop-up Modal */}
      <AnimatePresence>
        {alertOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setAlertOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              suppressHydrationWarning
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setAlertOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>

              {/* Icon */}
              <div className="w-14 h-14 bg-blue-50 text-[#003399] rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
                <Info size={28} />
              </div>

              {/* Title & Message */}
              <h3 className="text-base font-bold text-slate-900 mb-2">Layanan Belum Tersedia</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
                Mohon maaf, tautan permohonan untuk layanan ini belum diperbarui oleh administrator. Silakan hubungi kami untuk info lebih lanjut.
              </p>

              {/* Action Button */}
              <button
                onClick={() => setAlertOpen(false)}
                className="w-full py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-xs"
              >
                Mengerti
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
