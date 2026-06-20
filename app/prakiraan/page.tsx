import Navbar from '@/components/Navbar';
import PrakiraanSection from '@/components/PrakiraanSection';
import Footer from '@/components/Footer';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prakiraan Cuaca",
  description: "Prakiraan Cuaca Maritim BMKG Tegal",
};

export default function PrakiraanPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-0">
        <PrakiraanSection />
      </div>
      <Footer />
    </main>
  );
}
