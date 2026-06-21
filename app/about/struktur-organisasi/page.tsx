import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getStrukturOrganisasi } from "@/services/public.service";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Struktur Organisasi",
  description: "Struktur Organisasi BMKG Maritim Tegal",
};

function StrukturCard({ item, large }: { item: any; large?: boolean }) {
  const isPhoto = item.inisial?.startsWith("http") || item.inisial?.startsWith("/");
  return (
    <div className={`bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all text-center h-full flex flex-col ${large ? "p-6 md:p-8" : "p-4 md:p-5"}`}>
      <div className="flex flex-col items-center gap-3 flex-1">
        {isPhoto ? (
          <img src={item.inisial} alt={item.nama || item.jabatan} loading="lazy" className={`${large ? "w-20 h-20" : "w-14 h-14"} rounded-full object-cover border-2 border-slate-200 shadow-md`} />
        ) : (
          <div className={`${large ? "w-20 h-20 text-2xl" : "w-14 h-14 text-lg"} rounded-full bg-gradient-to-br from-[#003399] to-[#002266] text-white flex items-center justify-center font-extrabold shadow-md`}>
            {item.inisial?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
        <div className="min-w-0 w-full flex-1">
          {item.nama ? (
            <>
              <h3 className={`font-bold text-slate-800 ${large ? "text-lg md:text-xl" : "text-sm md:text-base"}`}>{item.nama}</h3>
              <p className="text-[#003399] font-semibold text-xs md:text-sm mt-0.5">{item.jabatan}</p>
            </>
          ) : (
            <h3 className={`font-bold text-[#003399] ${large ? "text-lg md:text-xl" : "text-sm md:text-base"}`}>{item.jabatan}</h3>
          )}
          {item.deskripsi && (
            <p className="mt-2 text-slate-500 text-xs leading-relaxed">{item.deskripsi}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function StrukturOrganisasiPage() {
  const items = await getStrukturOrganisasi();
  const leader = items.find((item: any) => item.urutan === 1);
  const subordinates = items.filter((item: any) => item.urutan !== 1).sort((a: any, b: any) => a.urutan - b.urutan);

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
            {items.length === 0 ? (
              <p className="text-center text-slate-400 py-12">Belum ada data struktur organisasi.</p>
            ) : (
              <div className="flex flex-col items-center gap-8">
                {/* Row 1: Leader (urutan 1) */}
                {leader && (
                  <div className="flex flex-col items-center">
                    <StrukturCard item={leader} large />
                    {/* Connector line */}
                    {subordinates.length > 0 && (
                      <div className="w-0.5 h-8 bg-slate-300" />
                    )}
                  </div>
                )}

                {/* Connector horizontal line */}
                {subordinates.length > 0 && (
                  <div className="w-full max-w-2xl h-0.5 bg-slate-300 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-300 -mt-4" />
                  </div>
                )}

                {/* Row 2+: Subordinates */}
                {subordinates.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full items-stretch">
                    {subordinates.map((item: any) => (
                      <StrukturCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            )}

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
