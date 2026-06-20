"use client";

import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    label: "Alamat",
    value: "Jl. Kolonel Sugiono No. 1\nTegal, Jawa Tengah 52113",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    icon: Phone,
    label: "Telepon",
    value: "0811 2562 200",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "0811 2562 200 ",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Mail,
    label: "Email",
    value: "stamet.tegal@bmkg.go.id",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: Clock,
    label: "Jam Layanan",
    value: "Senin – Jumat\n08.00 – 16.00 WIB",
    color: "text-[#003399]",
    bg: "bg-blue-50",
  },
];

export default function ContactSection() {
  return (
    <section id="kontak" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[#003399] text-sm font-semibold uppercase tracking-widest">Hubungi Kami</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Kontak & Lokasi</h2>
          <p className="text-gray-500 mt-2">Temukan kami di Tegal, Jawa Tengah</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left: Contact Info */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
            <div className="space-y-5">
              {contactInfo.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <item.icon size={18} className={item.color} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-0.5">{item.label}</p>
                    <p className="text-gray-800 text-sm font-semibold whitespace-pre-line">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/628112562200"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 w-full flex items-center justify-center gap-3 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-green-200"
            >
              <MessageCircle size={20} />
              Chat WhatsApp
            </a>
          </div>

          {/* Right: Google Maps */}
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 h-64 md:h-[400px]">
            <iframe
              src="https://www.google.com/maps?q=BMKG+Maritim+Tegal&output=embed"
              className="w-full h-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi BMKG Kota Tegal"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
