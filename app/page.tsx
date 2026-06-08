"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import PrakiraanSection from "@/components/PrakiraanSection";
import LayananSection from "@/components/LayananSection";
import KegiatanSection from "@/components/KegiatanSection";
import BuletinSection from "@/components/BuletinSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import EarthquakeCard from "@/components/EarthquakeCard";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      {/* <AboutSection showExtras={false} /> */}
      <BuletinSection />
      <EarthquakeCard />
      <PrakiraanSection limit={4} />
      <LayananSection limit={4} />
      <KegiatanSection limit={4} />
      <ContactSection />
      <Footer />
    </main>
  );
}
