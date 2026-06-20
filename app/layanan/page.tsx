import Navbar from '@/components/Navbar';
import LayananSection from '@/components/LayananSection';
import Footer from '@/components/Footer';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Layanan",
  description: "Layanan BMKG Maritim Tegal",
};

export default function LayananPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-0">
        <LayananSection />
      </div>
      <Footer />
    </main>
  );
}
