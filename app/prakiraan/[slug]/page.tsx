"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Calendar, AlertCircle, Clock, Loader, ChevronLeft, ChevronRight, X, Waves, TrendingUp } from "lucide-react";
import { getIcon } from "@/lib/prakiraan-icons";
import { usePageTitle } from "@/hooks/usePageTitle";

interface PrakiraanDetail {
  id: string;
  slug: string;
  title: string;
  url: string;
  explanation: string;
  waktu_mulai?: string;
  waktu_berakhir?: string;
  created_at?: string;
  uploader?: string;
  next_url?: string;
  next_explanation?: string;
  next_waktu_mulai?: string;
  next_waktu_berakhir?: string;
  display_type?: string;
  gallery_images?: string[];
  category?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
  } | null;
}

export default function PrakiraanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [data, setData] = useState<PrakiraanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  usePageTitle(data?.title || "Prakiraan Cuaca");

  const handleImageClick = (url?: string) => {
    if (!url) return;
    setPreviewUrl(url);
    setIsPreviewOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPreviewOpen(false);
      }
    };
    if (isPreviewOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isPreviewOpen]);

  useEffect(() => {
    if (!slug) return;
    async function fetchDetail() {
      try {
        setLoading(true);
        const res = await fetch(`/api/prakiraan/${slug}`);
        const json = await res.json();
        if (json?.success && json.data) {
          setData(json.data);
        } else {
          setNotFound(true);
        }
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [slug]);

  if (!data) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-28 pb-16 max-w-5xl mx-auto px-4 md:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader size={36} className="text-[#003399] animate-spin" />
              <p className="text-gray-500 text-sm">Memuat data prakiraan...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <AlertCircle size={48} className="text-gray-300" />
              <h2 className="text-xl font-bold text-gray-700">Data Tidak Ditemukan</h2>
              <p className="text-gray-500 text-sm max-w-sm">
                Prakiraan yang Anda cari tidak tersedia atau telah dihapus.
              </p>
              <button
                onClick={() => router.push("/prakiraan")}
                className="mt-2 px-6 py-2.5 bg-[#003399] text-white font-semibold rounded-xl hover:bg-[#0044cc] transition-colors text-sm"
              >
                Lihat Semua Prakiraan
              </button>
            </div>
          )}
        </div>
        <Footer />
      </main>
    );
  }

  const now = new Date();
  const isExpired = data.waktu_berakhir && new Date(data.waktu_berakhir) < now;
  const isScheduled = !isExpired && data.waktu_mulai && new Date(data.waktu_mulai) > now;
  const hasNextSchedule = data.next_waktu_mulai && new Date(data.next_waktu_mulai) > now;
  const showNextForecast = data.next_url && (!data.next_waktu_mulai || new Date(data.next_waktu_mulai) <= now);
  const CategoryIcon = data.category ? getIcon(data.category.icon) : null;
  const displayType = data.display_type || "gambar_saja";
  const uniqueGalleryImages = Array.from(new Set(data.gallery_images || [])).filter(img => img !== data.url);
  const allImages = displayType === "gambar_galeri" ? [data.url, ...uniqueGalleryImages] : [data.url];
  const showGallery = displayType === "gambar_galeri" && uniqueGalleryImages.length > 0;
  const showText = displayType === "gambar_teks" || displayType === "gambar_galeri";
  const isImageOnly = displayType === "gambar_saja";

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-[1650px] mx-auto px-4 md:px-8 lg:px-12">
          {/* <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#003399] hover:text-[#0044cc] font-semibold text-sm mb-6 mt-4 group transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Prakiraan
          </button> */}

          {/* ─── GAMBAR SAJA MODE ───────────────────────────── */}
          {isImageOnly && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative w-full bg-gray-100 flex items-center justify-center" style={{ minHeight: "60vh" }}>
                <img
                  src={allImages[activeImg]}
                  alt={data.title}
                  className="w-full h-full object-contain p-4 md:p-8 cursor-zoom-in hover:opacity-95 transition-opacity duration-200"
                  style={{ maxHeight: "80vh" }}
                  onClick={() => handleImageClick(allImages[activeImg])}
                />

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg((prev) => (prev - 1 + allImages.length) % allImages.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all border border-white/10 active:scale-95 z-20 shadow-md"
                      title="Sebelumnya"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() => setActiveImg((prev) => (prev + 1) % allImages.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all border border-white/10 active:scale-95 z-20 shadow-md"
                      title="Selanjutnya"
                    >
                      <ChevronRight size={24} />
                    </button>
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {activeImg + 1} / {allImages.length}
                    </div>
                  </>
                )}

                {data.category && (
                  <div className="absolute top-5 left-5 bg-white/80 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5 z-10">
                    {CategoryIcon && <CategoryIcon size={12} />}
                    {data.category.name}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 md:p-8 z-10">
                  <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight drop-shadow-lg max-w-3xl">
                    {data.title}
                  </h1>
                </div>
              </div>
            </div>
          )}

          {/* ─── GAMBAR + TEKS / GAMBAR + GALERI MODE ──────── */}
          {!isImageOnly && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header: Badges & Title (Aligned) */}
              <div className="max-w-[1300px] mx-auto w-full px-6 md:px-8 lg:px-10 pt-8 pb-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {isExpired && (
                    <span className="bg-red-50 text-red-600 border border-red-100 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <Clock size={12} />
                      Kadaluwarsa
                    </span>
                  )}
                  {isScheduled && (
                    <span className="bg-blue-50 text-blue-600 border border-blue-100 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <Clock size={12} />
                      Terjadwal
                    </span>
                  )}
                  {data.category && (
                    <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      {CategoryIcon && <CategoryIcon size={12} />}
                      {data.category.name}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {data.title}
                </h1>
              </div>

              {/* Layout: Image on top, explanation below */}
              <div className="flex flex-col">
                {/* TOP: Image & Gallery Slider */}
                <div className="w-full bg-white border-y border-gray-100 flex flex-col items-center">
                  <div className="relative w-full flex items-center justify-center bg-gray-50/30 min-h-[260px] sm:min-h-[400px] md:min-h-[500px]">
                    <img
                      src={allImages[activeImg]}
                      alt={data.title}
                      className="w-full h-auto max-h-[85vh] object-contain cursor-zoom-in hover:opacity-95 transition-opacity duration-200"
                      onClick={() => handleImageClick(allImages[activeImg])}
                    />
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImg((prev) => (prev - 1 + allImages.length) % allImages.length)}
                          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all border border-white/10 active:scale-95 z-20 shadow-md"
                          title="Sebelumnya"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          onClick={() => setActiveImg((prev) => (prev + 1) % allImages.length)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all border border-white/10 active:scale-95 z-20 shadow-md"
                          title="Selanjutnya"
                        >
                          <ChevronRight size={24} />
                        </button>
                        <div className="absolute top-4 right-6 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                          {activeImg + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Gallery thumbnails below image */}
                  {showGallery && allImages.length > 1 && (
                    <div className="flex gap-2 py-4 overflow-x-auto justify-center max-w-full pb-2">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImg(idx)}
                          className={`w-16 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${activeImg === idx ? "border-[#003399] shadow-md scale-105" : "border-gray-200 opacity-60 hover:opacity-100"
                            }`}
                        >
                          <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* BOTTOM: Explanation and Meta Info (Split Grid Layout) */}
                <div className="w-full max-w-[1300px] mx-auto p-6 md:p-8 lg:p-10">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left Column: Detailed Explanation & Next Forecast */}
                    <div className="lg:col-span-2 space-y-6">

                      {/* Detailed Explanation Card */}
                      {showText && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                            <Waves className="text-[#003399]" size={20} />
                            Penjelasan Detail
                          </h2>
                          {data.explanation ? (
                            <div
                              className="prose prose-sm max-w-none text-gray-700 leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:font-bold [&_em]:italic [&_a]:text-[#003399] [&_a]:underline break-words text-justify"
                              dangerouslySetInnerHTML={{ __html: data.explanation }}
                            />
                          ) : (
                            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
                              <p className="text-gray-400 text-sm italic">Belum ada penjelasan tersedia untuk prakiraan ini.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Next Forecast Section */}
                      {showNextForecast && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                            <TrendingUp className="text-[#003399]" size={20} />
                            Prakiraan Berikutnya
                          </h2>
                          <div className="bg-blue-50/50 border border-blue-100/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative w-full h-64 bg-gray-100 flex items-center justify-center">
                              <img
                                src={data.next_url}
                                alt="Prakiraan Berikutnya"
                                className="w-full h-full object-contain bg-gray-50 p-4 cursor-zoom-in hover:opacity-95 transition-opacity duration-200"
                                onClick={() => handleImageClick(data.next_url)}
                              />
                              <div className="absolute top-4 left-4">
                                <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                  Tersedia
                                </span>
                              </div>
                            </div>
                            <div className="p-6 space-y-4">
                              {(data.next_waktu_mulai || data.next_waktu_berakhir) && (
                                <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500">
                                  {data.next_waktu_mulai && (
                                    <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-100"><Calendar size={13} className="text-[#003399]" /> Mulai: {new Date(data.next_waktu_mulai).toLocaleDateString("id-ID", { dateStyle: "long" })}</span>
                                  )}
                                  {data.next_waktu_berakhir && (
                                    <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-100"><Calendar size={13} className="text-[#003399]" /> Berakhir: {new Date(data.next_waktu_berakhir).toLocaleDateString("id-ID", { dateStyle: "long" })}</span>
                                  )}
                                </div>
                              )}
                              {data.next_explanation && (
                                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:font-bold [&_em]:italic [&_a]:text-[#003399] [&_a]:underline break-words text-justify"
                                  dangerouslySetInnerHTML={{ __html: data.next_explanation }} />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Metadata Sidebar */}
                    <div className="space-y-6">

                      {/* Sidebar Card */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                        <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                          <Calendar className="text-[#003399]" size={18} />
                          Informasi Prakiraan
                        </h3>

                        {/* Upload Date Section */}
                        <div className="space-y-1">
                          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Tanggal Upload</span>
                          <p className="text-sm font-semibold text-gray-800">
                            {data.created_at
                              ? new Date(data.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })
                              : "-"}
                          </p>
                        </div>

                        {/* Additional Info List */}
                        <div className="pt-4 border-t border-gray-100 space-y-3">
                          {data.category && (
                            <div className="flex items-center justify-between text-xs py-1">
                              <span className="text-gray-400 flex items-center gap-1.5">
                                {CategoryIcon && <CategoryIcon size={14} className="text-[#003399]" />}
                                Kategori
                              </span>
                              <span className="font-semibold text-gray-700">{data.category.name}</span>
                            </div>
                          )}

                        </div>
                      </div>

                      {/* Warnings direct in Sidebar */}
                      {isScheduled && (
                        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
                          <AlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5 animate-bounce" />
                          <div>
                            <p className="text-blue-800 font-semibold text-xs">Informasi Belum Tersedia</p>
                            <p className="text-blue-700 text-[11px] mt-1 leading-relaxed">
                              Prakiraan ini belum mulai tayang. Silakan kembali pada tanggal mulai berlaku.
                            </p>
                          </div>
                        </div>
                      )}
                      {isExpired && (
                        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 shadow-sm">
                          <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-amber-800 font-semibold text-xs">Informasi Kadaluwarsa</p>
                            <p className="text-amber-700 text-[11px] mt-1 leading-relaxed">
                              Prakiraan ini telah melewati masa tayang. Data mungkin sudah tidak lagi akurat.
                            </p>
                          </div>
                        </div>
                      )}

                      {hasNextSchedule && (
                        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
                          <Clock size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-blue-800 font-semibold text-xs">Jadwal Berikutnya</p>
                            <p className="text-blue-700 text-[11px] mt-1 leading-relaxed">
                              Prakiraan berikutnya dijadwalkan tersedia pada{" "}
                              {data.next_waktu_mulai ? new Date(data.next_waktu_mulai).toLocaleDateString("id-ID", { dateStyle: "long" }) : ""}.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>

              {/* Back button (Aligned) */}
              <div className="max-w-[1300px] mx-auto w-full px-6 md:px-8 lg:px-10 pb-8">
                <button
                  onClick={() => router.push("/prakiraan")}
                  className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-[#003399] text-[#003399] font-semibold rounded-xl hover:bg-[#003399] hover:text-white transition-all text-sm"
                >
                  <ArrowLeft size={15} />
                  Semua Prakiraan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Lightbox / Fullscreen Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsPreviewOpen(false)}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-white hover:text-gray-300 focus:outline-none p-2 bg-black/45 rounded-full hover:bg-black/70 transition-all active:scale-95 z-50"
            onClick={() => setIsPreviewOpen(false)}
          >
            <X size={28} />
          </button>

          {/* Fullscreen Image Container */}
          <div className="relative max-w-full max-h-full p-4 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewUrl}
              alt="Fullscreen Preview"
              className="max-w-[95vw] max-h-[90vh] object-contain rounded shadow-2xl animate-in fade-in zoom-in-95 duration-200 select-none pointer-events-none"
            />
          </div>
        </div>
      )}
    </main>
  );
}
