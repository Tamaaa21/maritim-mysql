"use client";

import PrakiraanSection from "@/components/PrakiraanSection";
import dynamic from "next/dynamic";

const BuletinSection = dynamic(() => import("@/components/BuletinSection"), { ssr: false });
const InformasiLainnyaSection = dynamic(() => import("@/components/InformasiLainnyaSection"), { ssr: false });
const EarthquakeCard = dynamic(() => import("@/components/EarthquakeCard"), { ssr: false });
const LayananSection = dynamic(() => import("@/components/LayananSection"), { ssr: false });
const KegiatanSection = dynamic(() => import("@/components/KegiatanSection"), { ssr: false });
const ContactSection = dynamic(() => import("@/components/ContactSection"), { ssr: false });

export default function DynamicContent() {
  return (
    <>
      <BuletinSection />
      <PrakiraanSection limit={4} />
      <InformasiLainnyaSection />
      <EarthquakeCard />
      <LayananSection limit={4} />
      <KegiatanSection limit={4} />
      <ContactSection />
    </>
  );
}
