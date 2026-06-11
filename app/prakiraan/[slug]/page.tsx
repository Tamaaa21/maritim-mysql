"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Calendar, User, AlertCircle, Clock, Loader, MapPin, Anchor, Waves, TrendingUp, Sun, Image } from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
  MapPin, Anchor, Waves, TrendingUp, Sun,
};

function getIcon(name?: string) {
  return CATEGORY_ICONS[name || "Sun"] || Sun;
}

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
  const allImages = [data.url, ...(data.gallery_images || [])];
  const showGallery = displayType === "gambar_galeri" && data.gallery_images && data.gallery_images.length > 0;
  const showText = displayType === "gambar_teks" || displayType === "gambar_galeri";
  const isImageOnly = displayType === "gambar_saja";

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#003399] hover:text-[#0044cc] font-semibold text-sm mb-6 mt-4 group transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Prakiraan
          </button>

          {/* ─── GAMBAR SAJA MODE ───────────────────────────── */}
          {isImageOnly && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative w-full bg-gray-100 flex items-center justify-center" style={{ minHeight: "60vh" }}>
                <img
                  src={data.url}
                  alt={data.title}
                  className="w-full h-full object-contain p-4 md:p-8"
                  style={{ maxHeight: "80vh" }}
                />
                {data.category && (
                  <div className="absolute top-5 left-5 bg-white/80 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
                    {CategoryIcon && <CategoryIcon size={12} />}
                    {data.category.name}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 md:p-8">
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
              {/* Status & Category badges */}
              <div className="px-6 md:px-10 pt-6 pb-0 flex flex-wrap gap-2">
                {isExpired && (
                  <span className="bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Clock size={12} />
                    Kadaluwarsa
                  </span>
                )}
                {isScheduled && (
                  <span className="bg-blue-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Clock size={12} />
                    Terjadwal
                  </span>
                )}
                {data.category && (
                  <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    {CategoryIcon && <CategoryIcon size={12} />}
                    {data.category.name}
                  </span>
                )}
              </div>

              {/* Title */}
              <div className="px-6 md:px-10 pt-4 pb-2">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {data.title}
                </h1>
              </div>

              {/* Two-column layout: Text Left, Image Right */}
              <div className="flex flex-col-reverse md:flex-row gap-0">
                {/* LEFT: Explanation */}
                <div className="flex-1 md:w-3/5 p-6 md:p-10">
                  {/* Status info boxes */}
                  {isScheduled && (
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                      <AlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-800 font-semibold text-sm">Informasi Belum Tersedia</p>
                        <p className="text-blue-700 text-sm mt-0.5">
                          Prakiraan ini akan mulai tayang pada{" "}
                          {data.waktu_mulai
                            ? new Date(data.waktu_mulai).toLocaleDateString("id-ID", { dateStyle: "long" })
                            : ""}.
                        </p>
                      </div>
                    </div>
                  )}
                  {isExpired && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                      <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-800 font-semibold text-sm">Informasi Belum Diperbarui</p>
                        <p className="text-amber-700 text-sm mt-0.5">
                          Prakiraan ini telah melewati masa tayang (berakhir{" "}
                          {data.waktu_berakhir
                            ? new Date(data.waktu_berakhir).toLocaleDateString("id-ID", { dateStyle: "long" })
                            : ""}). Data mungkin tidak lagi akurat.
                        </p>
                      </div>
                    </div>
                  )}

                 

                  {/* Explanation */}
                  {showText && (
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-4">Penjelasan Detail</h2>
                      {data.explanation ? (
                        <div
                          className="prose prose-sm max-w-none text-gray-700 leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:font-bold [&_em]:italic [&_a]:text-[#003399] [&_a]:underline break-words"
                          dangerouslySetInnerHTML={{ __html: data.explanation }}
                        />
                      ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
                          <p className="text-gray-400 text-sm italic">Belum ada penjelasan tersedia untuk prakiraan ini.</p>
                        </div>
                      )}
                    </div>
                  )}

 {/* Meta info bar */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm mb-6">
                    {data.uploader && (
                      <span className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <User size={14} className="text-gray-400" />
                        {data.uploader}
                      </span>
                    )}
                    {data.created_at && (
                      <span className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(data.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
                      </span>
                    )}
                    {data.waktu_mulai && (
                      <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                        isScheduled ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-500"
                      }`}>
                        <Calendar size={14} />
                        Mulai {new Date(data.waktu_mulai).toLocaleDateString("id-ID", { dateStyle: "long" })}
                      </span>
                    )}
                    {data.waktu_berakhir && (
                      <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                        isExpired ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                      }`}>
                        <Calendar size={14} />
                        {isExpired ? "Berakhir" : "Berlaku hingga"}{" "}
                        {new Date(data.waktu_berakhir).toLocaleDateString("id-ID", { dateStyle: "long" })}
                      </span>
                    )}
                  </div>
                  {/* Gallery grid for gambar_galeri */}
                  {showGallery && data.gallery_images && data.gallery_images.length > 0 && (
                    <div className="mt-8">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Image size={18} />
                        Galeri Foto
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {data.gallery_images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImg(idx + 1)}
                            className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                              activeImg === idx + 1 ? "border-[#003399] ring-2 ring-[#003399]/30" : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <img src={img} alt={`${data.title} ${idx + 2}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Forecast Section */}
                  {showNextForecast && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                      <h2 className="text-lg font-bold text-gray-900 mb-4">Prakiraan Berikutnya</h2>
                      <div className="bg-blue-50 border border-blue-100 rounded-xl overflow-hidden">
                        <div className="relative w-full h-48 bg-gray-100">
                          <img src={data.next_url} alt="Prakiraan Berikutnya" className="w-full h-full object-contain bg-gray-50 p-2" />
                          <div className="absolute bottom-3 left-3">
                            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">Tersedia</span>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          {(data.next_waktu_mulai || data.next_waktu_berakhir) && (
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              {data.next_waktu_mulai && (
                                <span className="flex items-center gap-1.5"><Calendar size={13} /> Mulai: {new Date(data.next_waktu_mulai).toLocaleDateString("id-ID", { dateStyle: "long" })}</span>
                              )}
                              {data.next_waktu_berakhir && (
                                <span className="flex items-center gap-1.5"><Calendar size={13} /> Berakhir: {new Date(data.next_waktu_berakhir).toLocaleDateString("id-ID", { dateStyle: "long" })}</span>
                              )}
                            </div>
                          )}
                          {data.next_explanation && (
                            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:font-bold [&_em]:italic [&_a]:text-[#003399] [&_a]:underline break-words"
                              dangerouslySetInnerHTML={{ __html: data.next_explanation }} />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {hasNextSchedule && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <Clock size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-blue-800 font-semibold text-sm">Prakiraan Berikutnya Terjadwal</p>
                          <p className="text-blue-700 text-sm mt-0.5">
                            Jadwal berikutnya akan tersedia pada{" "}
                            {data.next_waktu_mulai ? new Date(data.next_waktu_mulai).toLocaleDateString("id-ID", { dateStyle: "long" }) : ""}.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT: Image */}
                <div className="md:w-2/5 bg-gray-50 border-l border-gray-100">
                  <div className="sticky top-24 p-4 md:p-6">
                    <div className="relative w-full rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100" style={{ minHeight: "400px" }}>
                      <img
                        src={allImages[activeImg]}
                        alt={data.title}
                        className="w-full h-full object-contain p-4"
                        style={{ maxHeight: "500px", margin: "0 auto" }}
                      />
                      {showGallery && allImages.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          {activeImg + 1} / {allImages.length}
                        </div>
                      )}
                    </div>

                    {/* Gallery thumbnails below image */}
                    {showGallery && data.gallery_images && data.gallery_images.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto">
                        <button
                          onClick={() => setActiveImg(0)}
                          className={`w-14 h-10 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                            activeImg === 0 ? "border-[#003399] shadow-md" : "border-gray-200 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={data.url} alt="Utama" className="w-full h-full object-cover" />
                        </button>
                        {data.gallery_images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImg(idx + 1)}
                            className={`w-14 h-10 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                              activeImg === idx + 1 ? "border-[#003399] shadow-md" : "border-gray-200 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img src={img} alt={`${idx + 2}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Back button */}
              <div className="px-6 md:px-10 pb-6">
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
    </main>
  );
}
