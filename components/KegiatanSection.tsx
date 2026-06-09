"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, Calendar } from "lucide-react";
import { kegiatanTabs } from "@/components/kegiatanCategories";

const activities = [
  {
    title: "Sosialisasi Info Cuaca Maritim",
    date: "12 Mei 2024",
    category: "Sosialisasi",
    images: ["https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600"],
  },
  {
    title: "Pengamatan Maritim di Perairan",
    date: "10 Mei 2024",
    category: "Pengamatan",
    images: ["https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg?auto=compress&cs=tinysrgb&w=600"],
  },
  {
    title: "Kunjungan Tamu ke Stasiun",
    date: "8 Mei 2024",
    category: "Kunjungan",
    images: ["https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=600"],
  },
  {
    title: "Pemeliharaan Alat Observasi",
    date: "8 Mei 2024",
    category: "Lainnya",
    images: ["https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg?auto=compress&cs=tinysrgb&w=600"],
  },
  {
    title: "Pemasangan AWS di Perairan",
    date: "5 Mei 2024",
    category: "Lainnya",
    images: ["https://images.pexels.com/photos/2422290/pexels-photo-2422290.jpeg?auto=compress&cs=tinysrgb&w=600"],
  },
  {
    title: "Pelatihan Internal Pegawai",
    date: "3 Mei 2024",
    category: "Lainnya",
    images: ["https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=600"],
  },
  {
    title: "Sosialisasi ke Nelayan",
    date: "30 Apr 2024",
    category: "Sosialisasi",
    images: ["https://images.pexels.com/photos/1007865/pexels-photo-1007865.jpeg?auto=compress&cs=tinysrgb&w=600"],
  },
  {
    title: "Pengamatan Pasang Surut",
    date: "28 Apr 2024",
    category: "Pengamatan",
    images: ["https://images.pexels.com/photos/1430675/pexels-photo-1430675.jpeg?auto=compress&cs=tinysrgb&w=600"],
  },
];

export default function KegiatanSection({ limit }: { limit?: number }) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [lightbox, setLightbox] = useState<null | any>(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/kegiatan-documents').then(r => r.json()).then((b) => {
      if (!mounted) return;
      if (b?.success) {
        const data = b.data.map((d: any) => ({
          title: d.title,
          date: d.event_date ? new Date(d.event_date).toLocaleDateString('id-ID') : (new Date(d.created_at).toLocaleDateString('id-ID')),
          category: d.category || 'Lainnya',
          image: d.url,
          images: (d.image_urls && d.image_urls.length > 0) ? d.image_urls : [d.url],
          description: d.description || '',
        }));
        setItems(data);
      } else {
        setItems(activities);
      }
    }).catch(() => setItems(activities));
    return () => { mounted = false };
  }, []);

  const filtered = activeCategory === 'Semua' ? items : items.filter(a => a.category === activeCategory);

  return (
    <section id="kegiatan" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-[#003399] text-sm font-semibold uppercase tracking-widest">Dokumentasi</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Kegiatan Kami</h2>
          <p className="text-gray-500 mt-2">Dokumentasi kegiatan Stasiun Meteorologi Maritim Tegal</p>
        </div>

        {/* Gallery Grid */}
        <div className="flex flex-wrap justify-center gap-4">
          {(limit ? items.slice(0, limit) : items).map((item, i) => (
            <div
              key={i}
              className="relative rounded-xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300 w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] h-56 md:h-64"
              onClick={() => { setLightbox(item); setLightboxImageIndex(0); }}
            >
              <img
                src={item.images?.[0] || item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-xs font-semibold leading-tight">{item.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar size={10} className="text-blue-300" />
                  <p className="text-blue-300 text-xs">{item.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selanjutnya */}
        {limit && (
          <div className="mt-10 text-center">
            <a
              href="/kegiatan"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#003399] text-[#003399] hover:bg-[#003399] hover:text-white font-semibold text-sm rounded-full transition-all duration-200"
            >
              Selanjutnya <ChevronRight size={16} />
            </a>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-[#070b19]/97 backdrop-blur-md flex flex-col md:flex-row select-none"
          onClick={() => setLightbox(null)}
        >
          {/* Close Button (Floating Top Left/Right depending on layout) */}
          <button
            className="absolute top-4 right-4 z-50 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 backdrop-blur-sm border border-white/10"
            onClick={() => setLightbox(null)}
          >
            <X size={20} />
          </button>

          {/* Left: Image Viewer Area (Uncropped) */}
          <div 
            className="flex-1 flex items-center justify-center p-4 md:p-8 relative overflow-hidden"
            onClick={() => setLightbox(null)}
          >
            <div 
              className="relative max-w-full max-h-[45vh] md:max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={lightbox.images?.[lightboxImageIndex] || lightbox.image} 
                alt={lightbox.title} 
                className="max-w-full max-h-[45vh] md:max-h-[85vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-white/10" 
              />
              {(lightbox.images?.length || 1) > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightboxImageIndex(i => (i - 1 + lightbox.images.length) % lightbox.images.length); }}
                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm border border-white/10 text-xs"
                  >
                    Prev
                  </button>
                  <span className="text-white/70 text-xs">
                    {lightboxImageIndex + 1} / {lightbox.images.length}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightboxImageIndex(i => (i + 1) % lightbox.images.length); }}
                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm border border-white/10 text-xs"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Details Side Panel (Full height on md+, bottom sheet on mobile) */}
          <div 
            className="w-full md:w-96 md:h-full bg-[#0d1527]/95 border-t md:border-t-0 md:border-l border-slate-800/80 p-6 md:p-8 backdrop-blur-md shadow-[0_-10px_30px_rgba(0,0,0,0.3)] md:shadow-[-10px_0_30px_rgba(0,0,0,0.3)] flex flex-col justify-start text-left overflow-y-auto shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Category & Date Metadata */}
            <div className="flex flex-wrap items-center gap-3 mb-3 shrink-0">
              <span className="inline-flex items-center text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                {lightbox.category}
              </span>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Calendar size={14} className="text-blue-400 shrink-0" />
                <span>{lightbox.date}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-white font-extrabold text-lg sm:text-xl tracking-tight leading-tight shrink-0 mb-4">
              {lightbox.title}
            </h3>

            {/* Description */}
            {lightbox.description && (
              <div className="pt-4 border-t border-slate-800/80 flex-1">
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {lightbox.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
