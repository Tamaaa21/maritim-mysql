"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

interface StrukturItem {
  id: string;
  jabatan: string;
  nama: string;
  inisial: string;
  deskripsi: string;
  urutan: number;
}

export default function StrukturOrganisasiPage() {
  const [items, setItems] = useState<StrukturItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/struktur-organisasi")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setItems(res.data);
        }
      })
      .catch((err) => console.error("Gagal memuat struktur organisasi:", err))
      .finally(() => setLoading(false));
  }, []);

  // Separate Head of Station from other sections
  // Kepala Stasiun is usually the one with inisial "K" or lowest urutan
  const kepala = items.find((item) => item.inisial.toUpperCase() === "K" || item.urutan === 1);
  const staff = items.filter((item) => item.id !== kepala?.id);

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
            
            {loading ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-4 border-[#003399] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Memuat data struktur organisasi...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Tidak ada data struktur organisasi.
              </div>
            ) : (
              /* Hierarchical Tree Visual */
              <div className="flex flex-col items-center">
                
                {/* Leader (Level 1) */}
                {kepala && (
                  <div className="relative flex flex-col items-center">
                    <div className="bg-white border-2 border-[#003399] rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 w-72">
                      <div className="w-16 h-16 mx-auto rounded-full bg-[#003399] text-white flex items-center justify-center font-bold text-xl mb-4 shadow-md uppercase">
                        {kepala.inisial}
                      </div>
                      <h3 className="text-gray-900 font-bold text-lg">{kepala.jabatan}</h3>
                      <p className="text-gray-500 text-sm mt-1 font-medium">{kepala.nama}</p>
                      <span className="inline-block mt-3 px-3 py-1 bg-blue-50 text-[#003399] text-xs font-semibold rounded-full">
                        {kepala.deskripsi || "Pimpinan UPT"}
                      </span>
                    </div>
                    
                    {/* Connecting Line Down from Leader */}
                    {staff.length > 0 && <div className="w-0.5 h-12 bg-gray-300"></div>}
                  </div>
                )}

                {/* Horizontal Connector Line for the branches */}
                {staff.length > 1 && (
                  <div className="hidden md:flex items-center w-3/4 relative">
                    <div className="w-1/2 h-0.5 bg-gray-300"></div>
                    <div className="w-1/2 h-0.5 bg-gray-300"></div>
                  </div>
                )}

                {/* Vertical line dropdowns for each branch on desktop */}
                {staff.length > 1 && (
                  <div className="hidden md:flex justify-between w-3/4 mb-4">
                    {staff.map((_, idx) => {
                      // We need endpoints and a middle line
                      let alignClass = "justify-center";
                      if (idx === 0) alignClass = "justify-start";
                      if (idx === staff.length - 1) alignClass = "justify-end";
                      return (
                        <div key={idx} className={`flex w-full ${alignClass}`}>
                          <div className="w-0.5 h-8 bg-gray-300"></div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Single staff line on desktop if only 1 staff */}
                {staff.length === 1 && (
                  <div className="hidden md:block w-0.5 h-8 bg-gray-300 mb-4"></div>
                )}

                {/* Staff Sections (Level 2) */}
                <div className={`grid grid-cols-1 ${
                  staff.length === 2 ? "md:grid-cols-2 max-w-3xl" : 
                  staff.length >= 3 ? "md:grid-cols-3 max-w-5xl" : "md:grid-cols-1"
                } gap-8 w-full mt-4 md:mt-0`}>
                  
                  {staff.map((member) => {
                    // Predefined matching bg colors for O, D, P or fallback
                    let bgIconColor = "bg-[#0ea5a6]";
                    const ini = member.inisial.toUpperCase();
                    if (ini === "O") bgIconColor = "bg-[#0ea5a6]";
                    else if (ini === "D") bgIconColor = "bg-[#f59e0b]";
                    else if (ini === "P") bgIconColor = "bg-[#ef4444]";
                    else bgIconColor = "bg-[#64748b]"; // generic gray for extra categories
                    
                    return (
                      <div 
                        key={member.id}
                        className="bg-white border border-gray-150 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col justify-between"
                      >
                        <div>
                          <div className={`w-14 h-14 mx-auto rounded-full ${bgIconColor} text-white flex items-center justify-center font-bold text-lg mb-4 shadow-sm uppercase`}>
                            {member.inisial}
                          </div>
                          <h4 className="text-gray-900 font-bold text-base">{member.jabatan}</h4>
                          <p className="text-gray-500 text-sm mt-1">{member.nama}</p>
                        </div>
                        {member.deskripsi && (
                          <div className="mt-6 pt-4 border-t border-gray-50">
                            <p className="text-xs text-gray-450 italic leading-relaxed">{member.deskripsi}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                </div>

              </div>
            )}

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
