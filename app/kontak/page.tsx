import Navbar from '@/components/Navbar';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Kontak BMKG Maritim Tegal",
};

export default function KontakPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-0">
        <ContactSection />
      </div>
      <Footer />
    </main>
  );
}
