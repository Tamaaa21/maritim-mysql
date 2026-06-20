import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft, Target, Compass, Award } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visi & Misi",
  description: "Visi, Misi, dan Tujuan BMKG Periode 2020-2024",
};

export default function VisiMisiPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
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
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Visi, Misi, & Tujuan</h1>
            <p className="text-blue-100 mt-3 max-w-2xl mx-auto text-sm md:text-base">
              Visi, Misi, dan Tujuan Badan Meteorologi, Klimatologi, dan Geofisika (BMKG) Periode 2020-2024.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-[#f8fafc]">
          <div className="max-w-4xl mx-auto px-6 space-y-12">
            
            {/* Visi Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#003399] flex items-center justify-center shrink-0">
                  <Target size={24} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-850">Visi BMKG</h2>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">Periode 2020 - 2024</p>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-6">
                Dalam rangka mendukung pelaksanaan visi Presiden maka visi Badan Meteorologi, Klimatologi, dan Geofisika 2020-2024 dirumuskan sebagai berikut:
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 border-l-4 border-[#003399] p-5 md:p-6 rounded-r-2xl mb-8">
                <p className="text-slate-800 font-extrabold text-base md:text-lg italic leading-relaxed">
                  &quot;BMKG yang berkelas dunia dengan spirit socioentrepreneur untuk mewujudkan Indonesia Maju yang Berdaulat, Mandiri, dan berkepribadian berlandaskan Gotong-Royong&quot;
                </p>
              </div>

              {/* Terminologies */}
              <div className="space-y-6 border-t border-slate-100 pt-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Terminologi Visi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                    <h4 className="font-extrabold text-[#003399] text-sm mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Kelas Dunia
                    </h4>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                      BMKG dalam hal ini menjadi rujukan tingkat regional dan global. Dimana informasi BMKG menjadi rujukan masyarakat internasional, SDM BMKG berperan aktif dalam organisasi Meteorologi, Klimatologi, dan Geofisika (MKG) Internasional dan menjadi Regional Modelling Centre.
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                    <h4 className="font-extrabold text-[#003399] text-sm mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Socio-Entrepreneur
                    </h4>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                      Dimaksudkan BMKG dalam menjalankan bisnis pelayanan MKG tidak hanya sekedar melakukan pelayanan informasi untuk publik dan berbagai sektor antara lain sektor transportasi, pariwisata, pertahanan dan keamanan, pertanian dan kehutanan, sumber daya air, energi dan pertambangan, penanggulangan bencana, namun juga memproduksi informasi premium untuk kesejahteraan masyarakat menuju penguatan kemandirian keuangan BMKG.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Misi Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0ea5a6] flex items-center justify-center shrink-0">
                  <Compass size={24} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-850">Misi BMKG</h2>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">Uraian Misi Presiden & Wakil Presiden</p>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-6">
                BMKG melaksanakan misi Presiden dan Wakil Presiden nomor 1 (Peningkatan Kualitas Manusia Indonesia), Nomor 4 (Mencapai Lingkungan Hidup yang Berkelanjutan), dan Nomor 7 (Perlindungan bagi Segenap Bangsa dan Memberikan Rasa Aman pada Seluruh Warga), dengan uraian sebagai berikut:
              </p>

              <div className="space-y-4">
                {[
                  "Menjadikan informasi BMKG sebagai rujukan masyarakat internasional dan mewujudkan Regional Modelling Centre.",
                  "Mendorong SDM BMKG berperan aktif dalam organisasi MKG Internasional.",
                  "Mewujudkan sebagian unit layanan jasa dan informasi BMKG menjadi unit Badan Layanan Umum (BLU)."
                ].map((misi, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <div className="w-7 h-7 rounded-full bg-teal-50 text-[#0ea5a6] flex items-center justify-center shrink-0 font-extrabold text-xs">
                      {idx + 1}
                    </div>
                    <p className="text-slate-700 text-xs md:text-sm leading-relaxed mt-0.5">
                      {misi}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tujuan Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Award size={24} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-850">Tujuan BMKG</h2>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">Sasaran & Tujuan Strategis</p>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-6">
                Tujuan strategis dalam kurun waktu 5 Tahun ke depan ini merupakan penjabaran dan implementasi dari pernyataan misi yang akan dicapai. Untuk merealisasikan visi dan misi, perlu dirumuskan tujuan strategis BMKG 2020-2024 yang dapat menggambarkan terlaksana dan tercapainya visi dan misi. Rumusan Tujuan BMKG adalah sebagai berikut:
              </p>

              <div className="space-y-4">
                {[
                  "Menjamin terselenggaranya pelayanan informasi dan jasa meteorologi, klimatologi, kualitas udara, dan geofisika yang cepat, tepat, akurat, luas cakupan dan mudah dipahami untuk keselamatan, kesejahteraan, ketahanan dan berkelanjutan yang menjadi rujukan masyarakat internasional.",
                  "Terwujudnya ketangguhan ekonomi dan masyarakat terhadap faktor MKG.",
                  "Terwujudnya lembaga dengan tata kelola yang transparan, bersih, akuntabel dan berkualitas, serta mampu mewujudkan layanan premium menuju penguatan kemandirian keuangan BMKG."
                ].map((tujuan, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-extrabold text-xs">
                      {idx + 1}
                    </div>
                    <p className="text-slate-700 text-xs md:text-sm leading-relaxed mt-0.5">
                      {tujuan}
                    </p>
                  </div>
                ))}
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
