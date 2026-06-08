"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Calendar, User, AlertCircle, Loader } from "lucide-react";

interface PrakiraanDetail {
  id: string;
  title: string;
  url: string;
  explanation: string;
  waktu_berakhir?: string;
  created_at?: string;
  uploader?: string;
}

export default function PrakiraanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<PrakiraanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchDetail() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/prakiraan-images/${id}`);
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
  }, [id]);

  const isExpired = data?.waktu_berakhir && new Date(data.waktu_berakhir) < new Date();

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#003399] hover:text-[#0044cc] font-semibold text-sm mb-8 mt-4 group transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Prakiraan
          </button>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader size={40} className="text-[#003399] animate-spin" />
              <p className="text-gray-500 text-sm">Memuat data prakiraan...</p>
            </div>
          ) : notFound || !data ? (
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
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Hero Image */}
              <div className="relative w-full h-64 md:h-96 bg-gray-100 overflow-hidden">
                <img
                  src={data.url}
                  alt={data.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Expired overlay badge */}
                {isExpired && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      Informasi Kadaluarsa
                    </span>
                  </div>
                )}

                {/* Title on image */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-md">
                    {data.title}
                  </h1>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-10 space-y-8">
                {/* Expired warning */}
                {isExpired && (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
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

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {data.uploader && (
                    <span className="flex items-center gap-1.5">
                      <User size={14} />
                      <span>{data.uploader}</span>
                    </span>
                  )}
                  {data.created_at && (
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>
                        Diunggah: {new Date(data.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
                      </span>
                    </span>
                  )}
                  {data.waktu_berakhir && (
                    <span className={`flex items-center gap-1.5 font-medium ${isExpired ? "text-red-500" : "text-emerald-600"}`}>
                      <Calendar size={14} />
                      <span>
                        {isExpired ? "Berakhir" : "Berlaku hingga"}:{" "}
                        {new Date(data.waktu_berakhir).toLocaleDateString("id-ID", { dateStyle: "long" })}
                      </span>
                    </span>
                  )}
                </div>

                {/* Explanation */}
                {data.explanation ? (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Penjelasan Detail</h2>
                    <div
                      className="prose prose-sm max-w-none text-gray-700 leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:font-bold [&_em]:italic [&_a]:text-[#003399] [&_a]:underline break-words"
                      dangerouslySetInnerHTML={{ __html: data.explanation }}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
                    <p className="text-gray-400 text-sm italic">Belum ada penjelasan tersedia untuk prakiraan ini.</p>
                  </div>
                )}

                {/* Footer actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => router.push("/prakiraan")}
                    className="flex items-center gap-2 px-6 py-2.5 border-2 border-[#003399] text-[#003399] font-semibold rounded-xl hover:bg-[#003399] hover:text-white transition-all text-sm"
                  >
                    <ArrowLeft size={15} />
                    Kembali
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
