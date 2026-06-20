"use client";

import { useState, useEffect } from "react";
import { Download, FileText, ChevronRight } from "lucide-react";

export default function BuletinSection() {
  const [buletin, setBuletin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchBuletin() {
      try {
        const res = await fetch("/api/admin/publications");
        const json = await res.json();
        if (mounted && json?.success && Array.isArray(json.data) && json.data.length > 0) {
          // Get the latest publication (first one)
          setBuletin(json.data[0]);
        }
      } catch (e) {
        console.error("Gagal mengambil data buletin:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchBuletin();
    return () => { mounted = false; };
  }, []);

  if (loading || !buletin) return null;

  return (
    <section id="buletin" className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Left Side: Cover Image inside a minimalist frame */}
          <div className="w-full md:w-1/2 flex justify-center relative">
            <div className="relative w-3/5 max-w-sm p-3 bg-white rounded-2xl shadow-2xl border border-gray-200/80 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                src={buletin.cover_url || buletin.url}
                alt={buletin.title}
                className="w-full h-auto rounded-xl border border-gray-100"
                loading="lazy"
              />
            </div>
            {/* Decorative background blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-100 rounded-full blur-3xl -z-10 opacity-50" />
          </div>

          {/* Right Side: Info */}
          <div className="w-full md:w-1/2">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-[#003399] text-xs font-bold rounded-full mb-4 uppercase tracking-widest">
              Publikasi Terbaru
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{buletin.title}</h2>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {buletin.description || "Dapatkan rangkuman mendalam mengenai kondisi meteorologi maritim selama sebulan terakhir. Analisis data kami membantu stakeholder dalam pengambilan keputusan strategis."}
            </p>

            <ul className="space-y-3 mb-8">
              {[
                "Dinamika Atmosfer & Anomali SST",
                "Ikhtisar Cuaca & Kondisi Ekstrim",
                "Statistik Tinggi Gelombang & Angin"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-[#003399] text-white flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href={buletin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#005544] hover:bg-[#004033] text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Lihat Buletin <Download size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
