"use client";

import { Play, Download, Share2, ChevronRight, FileText } from "lucide-react";
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Pub = {
  id: string;
  title: string;
  date?: string;
  created_at?: string;
  url: string;
  cover_url?: string;
  description?: string;
  uploader?: string
};

export default function AboutSection({ showExtras = true }: { showExtras?: boolean }) {
  const [publications, setPublications] = useState<Pub[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/publications')
      .then((r) => r.json())
      .then((b) => {
        if (!mounted) return;
        if (b?.success && Array.isArray(b.data)) {
          const mapped = b.data.map((d: any) => ({
            id: d.id,
            title: d.title || d.name || 'Publikasi',
            date: d.created_at || d.date || '',
            url: d.url,
            cover_url: d.cover_url || '',
            description: d.description || '',
            uploader: d.uploader || ''
          }));
          setPublications(mapped);
        } else {
          setPublications([]);
        }
      })
      .catch(() => setPublications([]));
    return () => { mounted = false };
  }, []);
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Stasiun Meteorologi Maritim Tegal</h2>
        </div>
        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Text */}
          <div>
            <p
              className="text-gray-600 leading-relaxed mb-6"
              style={{ textAlign: "justify" }}
            >
              Sejarah pengamatan Meteorologi Klimatologi dan Geofisika di Indonesia dimulai pada tahun 1841 diawali dengan pengamatan yang dilakukan secara perorangan oleh Dr. Onnen, Kepala Rumah Sakit di Bogor. Pada tahun 1866, kegiatan pengamatan perorangan tersebut oleh Pemerintah Hindia Belanda diresmikan menjadi instansi pemerintah dengan nama Magnetisch en Meteorologisch Observatorium atau Observatorium Magnetik dan Meteorologi dipimpin oleh Dr. Bergsma. Pada tahun 1879 dibangun jaringan penakar hujan sebanyak 74 stasiun pengamatan di Jawa. Selanjutnya, pada tahun 1950 Indonesia secara resmi masuk sebagai anggota Organisasi Meteorologi Dunia (World Meteorological Organization atau WMO) dan Kepala Jawatan Meteorologi dan Geofisika menjadi Permanent Representative of Indonesia with WMO.            </p>
            <p
              className="text-gray-600 leading-relaxed mb-6"
              style={{ textAlign: "justify" }}
            >
              Stasiun Metorologi Tegal didirikan pada tahun 1976 yang sebelumnya berlokasi di Tegal Timur, dan sekarang beralih lokasi di Jalan Kolonel Sugiono No. 100 Tegal dari tahun 1986 sampai sekarang. Stasiun Meteorologi Tegal memiliki luas tanah 4335 m2.            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/about/visi-misi"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white text-sm font-semibold rounded-full transition-colors shadow-md"
              >
                Visi & Misi <ChevronRight size={16} />
              </Link>
              <Link
                href="/about/struktur-organisasi"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-50 text-[#003399] border border-[#003399]/30 text-sm font-semibold rounded-full transition-colors shadow-sm"
              >
                Struktur Organisasi <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right: Video Player */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
            <iframe
              className="w-full h-64 md:h-72 object-cover"
              src="https://www.youtube.com/embed/wBkyfeTdfVc"
              title="BMKG Stasiun Meteorologi Maritim Tegal"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Visi & Misi */}
        {showExtras && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Visi</h4>
              <p className="text-gray-700">Menjadi penyedia informasi meteorologi maritim terpercaya yang mendukung keselamatan pelayaran dan kesejahteraan masyarakat pesisir di wilayah Tegal dan sekitarnya.</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Misi</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Menyediakan informasi prakiraan cuaca dan peringatan dini yang akurat dan tepat waktu.</li>
                <li>Mengembangkan sistem observasi dan pemrosesan data untuk peningkatan kualitas layanan.</li>
                <li>Menyelenggarakan edukasi dan koordinasi kepada pemangku kepentingan terkait keselamatan maritim.</li>
                <li>Meningkatkan kapabilitas sumber daya manusia dan infrastruktur stasiun.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Struktur Organisasi */}
        {showExtras && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Struktur Organisasi</h3>
            <p className="text-gray-500 text-sm mb-6">Susunan organisasi singkat Stasiun Meteorologi Maritim Tegal.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#003399] text-white flex items-center justify-center font-bold text-lg mb-3">K</div>
                <p className="text-gray-900 font-semibold">Kepala Stasiun</p>
                <p className="text-gray-500 text-sm">Drs. Nama Kepala</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#0ea5a6] text-white flex items-center justify-center font-bold text-lg mb-3">O</div>
                <p className="text-gray-900 font-semibold">Seksi Observasi</p>
                <p className="text-gray-500 text-sm">Kepala Seksi Observasi</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#f59e0b] text-white flex items-center justify-center font-bold text-lg mb-3">D</div>
                <p className="text-gray-900 font-semibold">Seksi Data & Informasi</p>
                <p className="text-gray-500 text-sm">Kepala Seksi Data</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#ef4444] text-white flex items-center justify-center font-bold text-lg mb-3">P</div>
                <p className="text-gray-900 font-semibold">Seksi Pelayanan</p>
                <p className="text-gray-500 text-sm">Kepala Seksi Pelayanan</p>
              </div>
            </div>
          </div>
        )}

        {/* Publications */}

      </div>
    </section>
  );
}
