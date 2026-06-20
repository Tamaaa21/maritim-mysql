import Navbar from '@/components/Navbar';
import KegiatanSection from '@/components/KegiatanSection';
import Footer from '@/components/Footer';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kegiatan",
  description: "Dokumentasi Kegiatan BMKG Maritim Tegal",
};

export default function KegiatanPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-0">
        <KegiatanSection />
      </div>
      <Footer />
    </main>
  );
}
