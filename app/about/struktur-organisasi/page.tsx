import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getStrukturOrganisasi } from "@/services/public.service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Struktur Organisasi",
  description: "Struktur Organisasi BMKG Maritim Tegal",
};

export default async function StrukturOrganisasiPage() {
  const items = await getStrukturOrganisasi();

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <Navbar />
        
        {/* Hero */}
        <section className="pt-28 pb-12 bg-gradient-to-b from-[#003399] to-[#002266] text-white">
          <div className="max-w-7xl mx-auto px-6 md:px-16 text-center">
            <Link href="/about" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 text-sm font-medium transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Kembali ke Tentang Kami
            </Link>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Struktur Organisasi</h1>
            <p className="text-blue-100 mt-3 max-w-2xl mx-auto text-sm md:text-base">
              Struktur organisasi BMKG Stasiun Meteorologi Maritim Tegal
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-[#f8fafc]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#003399] to-[#002266] text-white flex items-center justify-center font-extrabold text-lg shrink-0 shadow-md">
                      {item.inisial?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-base md:text-lg truncate">{item.nama}</h3>
                      <p className="text-[#003399] font-semibold text-sm">{item.jabatan}</p>
                    </div>
                  </div>
                  {item.deskripsi && (
                    <p className="mt-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                      {item.deskripsi}
                    </p>
                  )}
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-center text-slate-400 py-12">Belum ada data struktur organisasi.</p>
              )}
            </div>

            <div className="mt-10 text-center">
              <Link href="/about" className="inline-flex items-center gap-2 px-6 py-3 bg-[#003399] hover:bg-[#002266] text-white text-sm font-semibold rounded-full transition-all shadow-md hover:shadow-lg group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Kembali ke Tentang Kami
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
