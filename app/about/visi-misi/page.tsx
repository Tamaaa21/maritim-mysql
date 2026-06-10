"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft, Target, Compass } from "lucide-react";

export default function VisiMisiPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-28 pb-12 bg-gradient-to-b from-[#003399] to-[#002266] text-white">
          <div className="max-w-7xl mx-auto px-6 md:px-16 text-center">
            <Link 
              href="/about" 
              className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 text-sm font-medium transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Kembali ke Tentang Kami
            </Link>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Visi & Misi</h1>
            <p className="text-blue-100 mt-3 max-w-2xl mx-auto text-sm md:text-base">
              Visi dan Misi Stasiun Meteorologi Maritim Tegal dalam mewujudkan pelayanan informasi meteorologi maritim yang andal dan tepercaya.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
              
              {/* Vision Card */}
              <div className="md:col-span-5 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#003399] flex items-center justify-center mb-6">
                    <Target size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Visi</h2>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    Menjadi penyedia informasi meteorologi maritim terpercaya yang mendukung keselamatan pelayaran dan kesejahteraan masyarakat pesisir di wilayah Tegal dan sekitarnya.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fokus Keselamatan & Kesejahteraan</span>
                </div>
              </div>

              {/* Mission Card */}
              <div className="md:col-span-7 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0ea5a6] flex items-center justify-center mb-6">
                  <Compass size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Misi</h2>
                <div className="space-y-4">
                  {[
                    "Menyediakan informasi prakiraan cuaca dan peringatan dini yang akurat dan tepat waktu.",
                    "Mengembangkan sistem observasi dan pemrosesan data untuk peningkatan kualitas layanan.",
                    "Menyelenggarakan edukasi dan koordinasi kepada pemangku kepentingan terkait keselamatan maritim.",
                    "Meningkatkan kapabilitas sumber daya manusia dan infrastruktur stasiun."
                  ].map((misi, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-teal-50 text-[#0ea5a6] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        {idx + 1}
                      </div>
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                        {misi}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Back Button Bottom */}
            <div className="mt-12 text-center">
              <Link 
                href="/about" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#003399] hover:bg-[#002266] text-white text-sm font-semibold rounded-full transition-all shadow-md hover:shadow-lg group"
              >
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
