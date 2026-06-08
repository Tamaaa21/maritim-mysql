"use client";

import { Facebook, Instagram, Youtube, Twitter, MapPin, Phone, Mail } from "lucide-react";

const footerLinks = {
  Menu: ["Home", "About", "Publikasi", "Info Prakiraan & Informasi", "Layanan", "Kegiatan", "Contact"],
  Informasi: ["Peringatan Dini", "Prakiraan Cuaca", "Pasang Surut", "Kalender Maritim", "Berita & Artikel", "Publikasi"],
  Layanan: ["Cuaca Maritim", "Cuaca Pelabuhan", "Wisata Bahari", "Citra Satelit", "Satelit Cuaca", "Ocean Forecast"],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook", color: "hover:bg-blue-600" },
  { icon: Instagram, href: "#", label: "Instagram", color: "hover:bg-pink-600" },
  { icon: Youtube, href: "#", label: "YouTube", color: "hover:bg-red-600" },
  { icon: Twitter, href: "#", label: "Twitter", color: "hover:bg-sky-500" },
];

export default function Footer() {
  return (
    <footer
      className="relative bg-[#001a55] text-white overflow-hidden"
      style={{
        backgroundColor: "#001a55",
        backgroundPosition: "center bottom",
      }}
    >
      <div className="absolute inset-0 bg-[#001a55]/92" />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-16 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <img src="bmkg-logo.png" alt="B" className="w-full h-full object-contain p-1" />
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight">STASIUN METEOROLOGI</p>
                  <p className="font-black text-base leading-tight">MARITIM TEGAL</p>
                </div>
              </div>
              <p className="text-blue-300 text-sm italic mb-6">Cepat, Tepat, Selamat Selalu</p>

              {/* Social */}
              <div className="flex gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className={`w-9 h-9 bg-white/10 ${s.color} rounded-full flex items-center justify-center transition-colors`}
                  >
                    <s.icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-white font-bold text-sm mb-4 pb-2 border-b border-white/20">{category}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-blue-300 text-xs hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact & App */}
            <div className="lg:col-span-2">
              <div>
                <h4 className="text-white font-bold text-sm mb-4 pb-2 border-b border-white/20">Kontak Kami</h4>
                <div className="space-y-2 mb-6">
                  <div className="flex items-start gap-2 text-xs text-blue-300">
                    <MapPin size={12} className="flex-shrink-0 mt-0.5" />
                    <span>Jl. Kolonel Sugiono No. 1, Tegal, Jawa Tengah 52113</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-300">
                    <Phone size={12} />
                    <span>(0283) 356206</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-300">
                    <Phone size={12} />
                    <span>0811-2636-067</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-300">
                    <Mail size={12} />
                    <span>stamar.tegal@bmkg.go.id</span>
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-blue-400">
            <p>© 2024 Stasiun Meteorologi Maritim Tegal – BMKG. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
