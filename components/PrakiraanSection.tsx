"use client";

import { ChevronRight, MapPin, Anchor, Waves, TrendingUp, Sun, X, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const defaultForecastCards = [
  {
    id: null,
    title: "Prakiraan Cuaca Kota",
    desc: "Prakiraan cuaca untuk wilayah kota di sekitar Tegal",
    image: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=600",
    icon: MapPin,
    color: "from-blue-900/80",
    created_at: null,
    waktu_berakhir: null,
  },
  {
    id: null,
    title: "Prakiraan Cuaca Pelabuhan",
    desc: "Informasi khusus untuk pelabuhan di Tegal",
    image: "https://images.pexels.com/photos/753331/pexels-photo-753331.jpeg?auto=compress&cs=tinysrgb&w=600",
    icon: Anchor,
    color: "from-teal-900/80",
    created_at: null,
    waktu_berakhir: null,
  },
  {
    id: null,
    title: "Prakiraan Cuaca Maritim",
    desc: "Prakiraan cuaca maritim untuk keselamatan pelayaran",
    image: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=600",
    icon: Waves,
    color: "from-cyan-900/80",
    created_at: null,
    waktu_berakhir: null,
  },
  {
    id: null,
    title: "Informasi Pasang Surut / Wisata Bahari",
    desc: "Informasi pasang surut dan kondisi wisata bahari",
    image: "https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=600",
    icon: TrendingUp,
    color: "from-sky-900/80",
    created_at: null,
    waktu_berakhir: null,
  },
];

const getCardConfig = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("kota") || t.includes("wilayah") || t.includes("darat")) {
    return { icon: MapPin, color: "from-blue-900/80" };
  }
  if (t.includes("pelabuhan") || t.includes("pantai") || t.includes("dermaga") || t.includes("pelaut")) {
    return { icon: Anchor, color: "from-teal-900/80" };
  }
  if (t.includes("maritim") || t.includes("laut") || t.includes("gelombang") || t.includes("perairan")) {
    return { icon: Waves, color: "from-cyan-900/80" };
  }
  if (t.includes("pasang") || t.includes("surut") || t.includes("wisata") || t.includes("bahari")) {
    return { icon: TrendingUp, color: "from-sky-900/80" };
  }
  return { icon: Sun, color: "from-indigo-900/80" };
};

// Popup shown when user clicks an expired card
function ExpiredPopup({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertCircle size={28} className="text-amber-500" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Halaman Belum Diperbarui</h3>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Informasi prakiraan <span className="font-semibold text-gray-700">"{title}"</span> sudah melewati masa tayang. Silakan kembali lagi nanti untuk informasi terbaru.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}

export default function PrakiraanSection({ limit }: { limit?: number }) {
  const router = useRouter();
  const [forecastCards, setForecastCards] = useState<any[]>(defaultForecastCards);
  const [loading, setLoading] = useState(true);
  const [expiredPopup, setExpiredPopup] = useState<{ title: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchPrakiraan() {
      try {
        // Fetch all cards WITHOUT filtering expired — we want to show expired cards too
        const res = await fetch("/api/admin/prakiraan-images");
        const json = await res.json();
        if (mounted && json?.success && Array.isArray(json.data)) {
          if (json.data.length > 0) {
            const mapped = json.data.map((it: any) => {
              const { icon, color } = getCardConfig(it.title);
              return {
                id: it.id,
                title: it.title,
                desc: it.explanation || "",
                image: it.url,
                icon: icon,
                color: color,
                created_at: it.created_at || null,
                waktu_berakhir: it.waktu_berakhir || null,
              };
            });
            setForecastCards(mapped);
          } else {
            setForecastCards([]);
          }
        }
      } catch (e) {
        console.error("Error fetching forecast:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPrakiraan();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCardClick = (card: any) => {
    const isExpired = card.waktu_berakhir && new Date(card.waktu_berakhir) < new Date();
    if (isExpired) {
      // Show "belum diperbarui" popup — card stays visible but doesn't navigate
      setExpiredPopup({ title: card.title });
    } else if (card.id) {
      // Navigate to full detail page
      router.push(`/prakiraan/${card.id}`);
    } else {
      // Default cards (no id from DB) — show expired popup as fallback
      setExpiredPopup({ title: card.title });
    }
  };

  return (
    <section id="prakiraan" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Informasi Prakiraan</h2>
          <p className="text-gray-500 mt-2">Pilih kategori informasi prakiraan yang Anda butuhkan</p>
        </div>

        {/* 4-column Responsive Grid for Forecast Cards */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-[#003399] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : forecastCards.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
            <p className="text-gray-500 font-medium text-sm">Tidak ada informasi prakiraan cuaca saat ini.</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-stretch gap-6">
            {(limit ? forecastCards.slice(0, limit) : forecastCards).map((card, i) => {
              const Icon = card.icon;
              const isExpired = card.waktu_berakhir && new Date(card.waktu_berakhir) < new Date();
              return (
                <button
                  key={i}
                  onClick={() => handleCardClick(card)}
                  className={`w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col text-left h-full relative ${
                    isExpired
                      ? "border-gray-200 opacity-75 hover:opacity-100"
                      : "border-gray-200 hover:border-[#003399]"
                  }`}
                >
                  {/* Expired badge */}
                  {isExpired && (
                    <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      Belum Diperbarui
                    </span>
                  )}

                  <div className="relative h-44 w-full overflow-hidden flex-shrink-0">
                    <img
                      src={card.image}
                      alt={card.title}
                      className={`w-full h-full object-cover transition-transform duration-500 ${isExpired ? "" : "group-hover:scale-105"}`}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${card.color} to-transparent ${isExpired ? "opacity-80" : "opacity-65"}`} />
                    {isExpired && (
                      <div className="absolute inset-0 bg-gray-900/20" />
                    )}
                    <div className="absolute top-4 left-4 w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white">
                      <Icon size={18} />
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className={`font-bold text-sm md:text-base mb-2 leading-snug line-clamp-2 transition-colors ${isExpired ? "text-gray-500" : "text-gray-900 group-hover:text-[#003399]"}`}>
                        {card.title}
                      </h3>
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                        {card.desc ? card.desc.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : ""}
                      </p>
                    </div>
                    <div className={`mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold ${isExpired ? "text-amber-500" : "text-[#003399]"}`}>
                      <span>{isExpired ? "Belum Diperbarui" : "Lihat Detail"}</span>
                      <ChevronRight size={14} className={isExpired ? "" : "group-hover:translate-x-1 transition-transform"} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Selanjutnya */}
        {limit && (
          <div className="mt-10 text-center">
            <a
              href="/prakiraan"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#003399] text-[#003399] hover:bg-[#003399] hover:text-white font-semibold text-sm rounded-full transition-all duration-200"
            >
              Selanjutnya <ChevronRight size={16} />
            </a>
          </div>
        )}
      </div>

      {/* Expired Popup */}
      {expiredPopup && (
        <ExpiredPopup
          title={expiredPopup.title}
          onClose={() => setExpiredPopup(null)}
        />
      )}
    </section>
  );
}
