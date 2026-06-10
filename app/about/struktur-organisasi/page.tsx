"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function StrukturOrganisasiPage() {
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
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Struktur Organisasi</h1>
            <p className="text-blue-100 mt-3 max-w-2xl mx-auto text-sm md:text-base">
              Susunan Organisasi Stasiun Meteorologi Maritim Tegal.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            
            {/* Hierarchical Tree Visual */}
            <div className="flex flex-col items-center">
              
              {/* Leader (Level 1) */}
              <div className="relative flex flex-col items-center">
                <div className="bg-white border-2 border-[#003399] rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 w-72">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#003399] text-white flex items-center justify-center font-bold text-xl mb-4 shadow-md">
                    K
                  </div>
                  <h3 className="text-gray-900 font-bold text-lg">Kepala Stasiun</h3>
                  <p className="text-gray-500 text-sm mt-1 font-medium">Drs. Nama Kepala</p>
                  <span className="inline-block mt-3 px-3 py-1 bg-blue-50 text-[#003399] text-xs font-semibold rounded-full">
                    Pimpinan UPT
                  </span>
                </div>
                
                {/* Connecting Line Down from Leader */}
                <div className="w-0.5 h-12 bg-gray-300"></div>
              </div>

              {/* Horizontal Connector Line for the branches */}
              <div className="hidden md:flex items-center w-3/4 relative">
                {/* Left side line */}
                <div className="w-1/2 h-0.5 bg-gray-300"></div>
                {/* Right side line */}
                <div className="w-1/2 h-0.5 bg-gray-300"></div>
              </div>

              {/* Vertical line dropdowns for each branch on desktop */}
              <div className="hidden md:grid grid-cols-3 w-3/4 justify-items-center mb-4">
                <div className="w-0.5 h-8 bg-gray-300"></div>
                <div className="w-0.5 h-8 bg-gray-300"></div>
                <div className="w-0.5 h-8 bg-gray-300"></div>
              </div>

              {/* Staff Sections (Level 2) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-4 md:mt-0">
                
                {/* Seksi Observasi */}
                <div className="bg-white border border-gray-150 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 mx-auto rounded-full bg-[#0ea5a6] text-white flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                      O
                    </div>
                    <h4 className="text-gray-900 font-bold text-base">Seksi Observasi</h4>
                    <p className="text-gray-500 text-sm mt-1">Kepala Seksi Observasi</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-400 italic">Melakukan pengamatan, perekaman data cuaca maritim & instrumen meteorologi</p>
                  </div>
                </div>

                {/* Seksi Data & Informasi */}
                <div className="bg-white border border-gray-150 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 mx-auto rounded-full bg-[#f59e0b] text-white flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                      D
                    </div>
                    <h4 className="text-gray-900 font-bold text-base">Seksi Data & Informasi</h4>
                    <p className="text-gray-500 text-sm mt-1">Kepala Seksi Data</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-400 italic">Mengolah database, analisis klimatologi, dan penyebaran informasi cuaca</p>
                  </div>
                </div>

                {/* Seksi Pelayanan */}
                <div className="bg-white border border-gray-150 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 mx-auto rounded-full bg-[#ef4444] text-white flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                      P
                    </div>
                    <h4 className="text-gray-900 font-bold text-base">Seksi Pelayanan</h4>
                    <p className="text-gray-500 text-sm mt-1">Kepala Seksi Pelayanan</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-400 italic">Pelayanan jasa meteorologi, edukasi publik, dan hubungan kemitraan maritim</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Back Button Bottom */}
            <div className="mt-16 text-center">
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
