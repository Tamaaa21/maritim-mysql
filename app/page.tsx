import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PrakiraanSection from "@/components/PrakiraanSection";
import Footer from "@/components/Footer";
import DynamicContent from "./DynamicContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beranda",
  description: "BMKG Stasiun Meteorologi Maritim Tegal - Informasi cuaca maritim terkini",
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <DynamicContent />
      <PrakiraanSection limit={4} />
      <Footer />
    </main>
  );
}
