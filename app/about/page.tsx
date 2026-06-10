"use client";

import Navbar from '@/components/Navbar';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';

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
