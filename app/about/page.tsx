import Navbar from '@/components/Navbar';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang",
  description: "Profil BMKG Maritim Tegal",
};

export default function AboutPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-0">
        <AboutSection showExtras={false} />
      </div>
      <Footer />
    </main>
  );
}
