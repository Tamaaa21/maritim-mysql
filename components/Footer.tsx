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
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
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
              <div>
                <h4 className="text-white font-bold text-sm mb-3">Download Aplikasi Mobile</h4>
                <p className="text-blue-300 text-xs mb-4">Unduh aplikasi info BMKG untuk informasi cuaca kapan saja, di mana saja.</p>
                <div className="flex flex-col gap-2">
                  <a
                    href="#"
                    className="flex items-center gap-3 bg-black/50 hover:bg-black/70 border border-white/20 rounded-xl px-4 py-2.5 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0">
                      <path d="M17.523 15.341c-.291.554-.432.795-.808 1.281-.524.687-1.264 1.542-2.184 1.549-.815.006-1.024-.527-2.13-.52-1.104.006-1.334.528-2.15.521-.919-.008-1.62-.81-2.145-1.497-1.469-1.92-1.625-4.164-.718-5.358.648-.852 1.664-1.35 2.62-1.35.978 0 1.595.528 2.404.528.788 0 1.268-.528 2.404-.528.854 0 1.765.416 2.41 1.136-.857.572-1.437 1.487-1.437 2.529 0 1.18.688 2.204 1.734 2.709zM14.337 5.2c.419-.521.737-1.258.622-2.014-.657.045-1.432.457-1.882 1.003-.408.493-.761 1.241-.627 1.975.718.023 1.471-.395 1.887-.964z" />
                    </svg>
                    <div>
                      <p className="text-white/60 text-xs leading-none">Download on the</p>
                      <p className="text-white font-bold text-sm leading-tight">App Store</p>
                    </div>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 bg-black/50 hover:bg-black/70 border border-white/20 rounded-xl px-4 py-2.5 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0">
                      <path d="M3.18 23.76c.28.17.6.24.93.22l12.34-7.01-2.65-2.65-10.62 9.44zM.5 1.48C.19 1.8 0 2.27 0 2.9v18.22c0 .63.19 1.1.5 1.42l.07.07 10.2-10.2v-.24L.57 1.41.5 1.48zM20.43 10.3l-2.9-1.65-2.96 2.96 2.96 2.96 2.91-1.65c.83-.47.83-1.24-.01-1.62zM4.11.24l12.34 7.01-2.65 2.65L3.18.24C3.51.02 3.84-.03 4.11.24z" />
                    </svg>
                    <div>
                      <p className="text-white/60 text-xs leading-none">GET IT ON</p>
                      <p className="text-white font-bold text-sm leading-tight">Google Play</p>
                    </div>
                  </a>
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
