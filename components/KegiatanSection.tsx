"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, Calendar } from "lucide-react";
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

function isImageFile(url: string): boolean {
  if (!url) return false;
  const ext = url.split('?')[0].toLowerCase();
  return /\.(jpe?g|png|gif|bmp|webp|svg|ico)$/i.test(ext);
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function KegiatanSection({ limit }: { limit?: number }) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [lightbox, setLightbox] = useState<null | any>(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [brokenImgs, setBrokenImgs] = useState<Set<string>>(new Set());

  const markBroken = (url: string) => {
    if (!brokenImgs.has(url)) setBrokenImgs(new Set(brokenImgs).add(url));
  };

  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/kegiatan-documents').then(r => r.json()).then((b) => {
      if (!mounted) return;
      if (b?.success) {
        const data = b.data.map((d: any) => {
          const imgs: string[] = [];
          const imgUrls = Array.isArray(d.image_urls) ? d.image_urls : [];
          if (imgUrls.length > 0) {
            imgs.push(...imgUrls.filter(Boolean));
          } else if (d.url && !d.url.includes('img.youtube.com')) {
            imgs.push(d.url);
          } else if (d.url) {
            imgs.push(d.url);
          }
          if (d.youtube_url) {
            const ytId = getYouTubeId(d.youtube_url);
            if (ytId && !imgs.some(i => i.includes('img.youtube.com'))) {
              imgs.push(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
            }
          }
          return {
            title: d.title,
            date: d.event_date ? new Date(d.event_date).toLocaleDateString('id-ID') : (new Date(d.created_at).toLocaleDateString('id-ID')),
            category: d.category || 'Lainnya',
            image: imgs[0] || '',
            images: imgs,
            description: d.description || '',
            youtube_url: d.youtube_url || '',
            file_type: d.file_type || '',
          };
        });
        setItems(data);
      } else {
        setItems(activities);
      }
    }).catch(() => setItems(activities));
    return () => { mounted = false };
  }, []);

  const filtered = activeCategory === 'Semua' ? items : items.filter(a => a.category === activeCategory);
  const displayItems = limit ? filtered.slice(0, limit) : filtered;
  const totalSlides = lightbox ? (lightbox.images?.length || 0) : 0;

  const goToSlide = (idx: number) => {
    setLightboxImageIndex(idx);
    setShowVideo(false);
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalSlides > 1) goToSlide((lightboxImageIndex + 1) % totalSlides);
  };
  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalSlides > 1) goToSlide((lightboxImageIndex - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    if (!lightbox) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); setLightboxImageIndex(i => totalSlides > 1 ? (i + 1) % totalSlides : i); }
      if (e.key === "ArrowLeft") { e.preventDefault(); setLightboxImageIndex(i => totalSlides > 1 ? (i - 1 + totalSlides) % totalSlides : i); }
      if (e.key === "Escape") { setLightbox(null); setShowVideo(false); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox, totalSlides]);

  const openLightbox = (item: any) => {
    setLightbox(item);
    setLightboxImageIndex(0);
    setShowVideo(false);
  };

  return (
    <section id="kegiatan" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-[#003399] text-sm font-semibold uppercase tracking-widest">Dokumentasi</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Kegiatan Kami</h2>
          <p className="text-gray-500 mt-2">Dokumentasi kegiatan Stasiun Meteorologi Maritim Tegal</p>
        </div>

        {/* Category Tabs */}
      

        {/* Gallery Grid */}
        <div className="flex flex-wrap justify-center gap-4">
          {displayItems.map((item, i) => (
            <div
              key={i}
              className="relative rounded-xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300 w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] h-56 md:h-64"
              onClick={() => openLightbox(item)}
            >
              {item.image && !brokenImgs.has(item.image) && isImageFile(item.image) ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                  onError={() => markBroken(item.image)}
                  className="w-full h-full object-contain bg-gray-100 group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  {item.file_type?.includes('pdf') ? (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  )}
                </div>
              )}
              {item.images.length > 1 && (
                <div className="absolute top-2 left-2 z-10 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                  {item.images.length}
                </div>
              )}
              {item.youtube_url && (
                <div className="absolute top-2 right-2 z-10 bg-red-600 text-white p-1.5 rounded-full shadow-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </div>
              )}
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
        {limit && items.length > limit && (
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
          onClick={() => { setLightbox(null); setShowVideo(false); }}
        >
          <button
            className="absolute top-4 right-4 z-50 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 backdrop-blur-sm border border-white/10"
            onClick={() => { setLightbox(null); setShowVideo(false); }}
          >
            <X size={20} />
          </button>

          {/* Left: Viewer Area */}
          <div
            className={`flex-1 flex items-center justify-center p-4 md:p-8 relative overflow-hidden ${totalSlides > 1 ? 'pb-20 md:pb-24' : ''}`}
            onClick={() => { setLightbox(null); setShowVideo(false); }}
          >
            <div
              className="relative max-w-full max-h-[45vh] md:max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* YouTube Embed */}
              {showVideo && lightbox.youtube_url ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(lightbox.youtube_url)}?autoplay=1`}
                  title={lightbox.title}
                  className="w-full max-w-2xl aspect-video rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-white/10"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  {/* Prev Arrow */}
                  {totalSlides > 1 && (
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm border border-white/10"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                  )}

                  {/* Image or YouTube Thumbnail */}
                  <div className="relative">
                    <img
                      src={lightbox.images?.[lightboxImageIndex] || lightbox.image}
                      alt={lightbox.title}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      className="max-w-full max-h-[45vh] md:max-h-[85vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-white/10"
                    />
                    {lightbox.images?.[lightboxImageIndex]?.includes('img.youtube.com') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowVideo(true); }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Next Arrow */}
                  {totalSlides > 1 && (
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm border border-white/10"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  )}

                  {/* Image Counter */}
                  {totalSlides > 1 && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                      {lightboxImageIndex + 1} / {totalSlides}
                    </div>
                  )}

                  {/* Thumbnail Strip */}
                  {totalSlides > 1 && (
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[90vw] overflow-x-auto pb-1">
                      {lightbox.images.map((url: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                          className={`w-10 h-8 rounded border-2 shrink-0 overflow-hidden transition-all ${
                            idx === lightboxImageIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-75'
                          }`}
                        >
                          <img src={url} className="w-full h-full object-cover" alt="" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right: Details Side Panel */}
          <div
            className="w-full h-[50vh] md:h-full max-h-[50vh] md:max-h-none md:w-96 bg-[#0d1527]/95 border-t md:border-t-0 md:border-l border-slate-800/80 p-6 md:p-8 backdrop-blur-md shadow-[0_-10px_30px_rgba(0,0,0,0.3)] md:shadow-[-10px_0_30px_rgba(0,0,0,0.3)] flex flex-col justify-start text-left overflow-y-auto shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center gap-3 mb-3 shrink-0">
              <span className="inline-flex items-center text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                {lightbox.category}
              </span>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Calendar size={14} className="text-blue-400 shrink-0" />
                <span>{lightbox.date}</span>
              </div>
              {lightbox.youtube_url && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  Video
                </span>
              )}
            </div>

            <h3 className="text-white font-extrabold text-lg sm:text-xl tracking-tight leading-tight shrink-0 mb-4">
              {lightbox.title}
            </h3>

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
