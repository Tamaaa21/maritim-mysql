"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Youtube, Twitter, MapPin, Phone, Mail } from "lucide-react";
import Script from "next/script";

const footerLinks = {
  Menu: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Publikasi", href: "/#buletin" },
    { label: "Info Prakiraan & Informasi", href: "/prakiraan" },
    { label: "Layanan", href: "/layanan" },
    { label: "Kegiatan", href: "/kegiatan" },
    { label: "Contact", href: "/kontak" },
  ],
  Informasi: [
    { label: "Peringatan Dini", href: "https://maritim.bmkg.go.id/cuaca/peringatan/gelombang" },
    { label: "Prakiraan Cuaca", href: "https://www.bmkg.go.id/cuaca/prakiraan-cuaca" },
    { label: "Pasang Surut", href: "https://maritim.bmkg.go.id/cuaca/pasut" },
    { label: "Prakiraan Maritim", href: "https://maritim.bmkg.go.id" },
    { label: "Berita & Artikel", href: "https://www.bmkg.go.id/berita/utama" },
  ],
  Layanan: [
    { label: "Cuaca Maritim", href: "https://maritim.bmkg.go.id/cuaca/perairan/perairan-tegal" },
    { label: "Cuaca Pelabuhan", href: "https://maritim.bmkg.go.id/cuaca/pelabuhan/pelabuhan-tegal-sari-kota-tegal" },
    { label: "Citra Satelit", href: "https://www.bmkg.go.id/cuaca/satelit/himawari-ir-enhanced" },
    { label: "Satelit Cuaca", href: "https://www.bmkg.go.id/cuaca/satelit" },
    { label: "Ocean Forecast", href: "https://peta-maritim.bmkg.go.id/ofs" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/share/1D8VfEyAeb/", label: "Facebook", color: "hover:bg-blue-600" },
  { icon: Instagram, href: "https://www.instagram.com/infobmkgtegal?igsh=M3NjaDZnY2pnM2Fw", label: "Instagram", color: "hover:bg-pink-600" },
  { icon: Youtube, href: "https://www.youtube.com/channel/UC2BAR7jrw0C26ZWzIGTVSkQ", label: "YouTube", color: "hover:bg-red-600" },
];

export default function Footer() {
  const pathname = usePathname();

  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, label: string) => {
    if (href.startsWith("http")) return;

    const isHome = pathname === "/";
    let targetId = "";

    if (isHome) {
      if (label === "Home" || href === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const lbl = label.toLowerCase();
      const hr = href.toLowerCase();

      if (lbl === "publikasi" || hr.includes("#buletin")) {
        targetId = "buletin";
      } else if (
        lbl === "info prakiraan & informasi" ||
        lbl === "peringatan dini" ||
        lbl === "prakiraan cuaca" ||
        lbl === "pasang surut" ||
        lbl === "kalender maritim" ||
        lbl === "cuaca maritim" ||
        lbl === "cuaca pelabuhan" ||
        lbl === "wisata bahari" ||
        hr.startsWith("/prakiraan")
      ) {
        targetId = "prakiraan";
      } else if (lbl === "layanan" || hr.startsWith("/layanan")) {
        targetId = "layanan";
      } else if (lbl === "kegiatan" || lbl === "berita & artikel" || hr.startsWith("/kegiatan")) {
        targetId = "kegiatan";
      } else if (lbl === "contact" || lbl === "kontak" || hr.startsWith("/kontak")) {
        targetId = "kontak";
      }
    } else {
      const isTargetPage = href === pathname || (href !== "/" && pathname.startsWith(href));
      if (isTargetPage) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    if (targetId) {
      const element = document.getElementById(targetId);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <img src="/bmkg-logo.png" alt="B" className="w-full h-full object-contain p-1" />
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
              < div className="mt-6">
                <div id="histats_counter"></div>
              </div>
            </div>

            {/* Links */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <h4 className="text-white font-bold text-sm mb-4 pb-2 border-b border-white/20">{category}</h4>
                  <ul className="space-y-2">
                    {links.map((link) => {
                      const isExternal = link.href.startsWith("http");
                      return (
                        <li key={link.label}>
                          <a
                            href={link.href}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            onClick={(e) => handleScrollClick(e, link.href, link.label)}
                            className="text-blue-300 text-xs hover:text-white transition-colors"
                          >
                            {link.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {/* Contact & App */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h4 className="text-white font-bold text-sm mb-4 pb-2 border-b border-white/20">Kontak Kami</h4>
                <div className="space-y-2.5">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Stasiun+Meteorologi+Maritim+Tegal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 text-xs text-blue-300 hover:text-white transition-colors group"
                  >
                    <MapPin size={12} className="flex-shrink-0 mt-0.5 group-hover:text-yellow-400 transition-colors" />
                    <span className="leading-relaxed">Jl. Kolonel Sugiono No. 1, Tegal, Jawa Tengah 52113</span>
                  </a>
                  <a
                    href="tel:0283356206"
                    className="flex items-center gap-2.5 text-xs text-blue-300 hover:text-white transition-colors group"
                  >
                    <Phone size={12} className="flex-shrink-0 group-hover:text-yellow-400 transition-colors" />
                    <span>0811 2562 200</span>
                  </a>
                  <a
                    href="https://wa.me/628112562200"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-xs text-blue-300 hover:text-white transition-colors group"
                  >
                    <Phone size={12} className="flex-shrink-0 group-hover:text-yellow-400 transition-colors" />
                    <span>0811 2562 200 (WhatsApp)</span>
                  </a>
                  <a
                    href="mailto:stamet.tegal@bmkg.go.id"
                    className="flex items-center gap-2.5 text-xs text-blue-300 hover:text-white transition-colors group"
                  >
                    <Mail size={12} className="flex-shrink-0 group-hover:text-yellow-400 transition-colors" />
                    <span>stamet.tegal@bmkg.go.id</span>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-4 pb-2 border-b border-white/20">Aplikasi Mobile</h4>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://apps.apple.com/id/app/info-bmkg/id1114372539"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white hover:bg-blue-50 text-[#001a55] border border-blue-100 rounded-lg px-3 py-2 transition-all active:scale-95 group shadow-sm w-full"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#001a55] flex-shrink-0 group-hover:scale-105 transition-transform">
                      <path d="M17.523 15.341c-.291.554-.432.795-.808 1.281-.524.687-1.264 1.542-2.184 1.549-.815.006-1.024-.527-2.13-.52-1.104.006-1.334.528-2.15.521-.919-.008-1.62-.81-2.145-1.497-1.469-1.92-1.625-4.164-.718-5.358.648-.852 1.664-1.35 2.62-1.35.978 0 1.595.528 2.404.528.788 0 1.268-.528 2.404-.528.854 0 1.765.416 2.41 1.136-.857.572-1.437 1.487-1.437 2.529 0 1.18.688 2.204 1.734 2.709zM14.337 5.2c.419-.521.737-1.258.622-2.014-.657.045-1.432.457-1.882 1.003-.408.493-.761 1.241-.627 1.975.718.023 1.471-.395 1.887-.964z" />
                    </svg>
                    <div>
                      <p className="text-[#001a55]/60 text-[9px] uppercase font-bold tracking-wider leading-none">Download on the</p>
                      <p className="text-[#001a55] font-bold text-xs leading-tight mt-0.5">App Store</p>
                    </div>
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.Info_BMKG"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white hover:bg-blue-50 text-[#001a55] border border-blue-100 rounded-lg px-3 py-2 transition-all active:scale-95 group shadow-sm w-full"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#001a55] flex-shrink-0 group-hover:scale-105 transition-transform">
                      <path d="M3.18 23.76c.28.17.6.24.93.22l12.34-7.01-2.65-2.65-10.62 9.44zM.5 1.48C.19 1.8 0 2.27 0 2.9v18.22c0 .63.19 1.1.5 1.42l.07.07 10.2-10.2v-.24L.57 1.41.5 1.48zM20.43 10.3l-2.9-1.65-2.96 2.96 2.96 2.96 2.91-1.65c.83-.47.83-1.24-.01-1.62zM4.11.24l12.34 7.01-2.65 2.65L3.18.24C3.51.02 3.84-.03 4.11.24z" />
                    </svg>
                    <div>
                      <p className="text-[#001a55]/60 text-[9px] uppercase font-bold tracking-wider leading-none">GET IT ON</p>
                      <p className="text-[#001a55] font-bold text-xs leading-tight mt-0.5">Google Play</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/15 pt-6 flex items-center justify-center text-xs text-blue-400 text-center">
            <p>© 2026 Stasiun Meteorologi Maritim Tegal – BMKG. All rights reserved.</p>
          </div>
        </div>

        <Script id="histats" strategy="afterInteractive">
          {`
    var _Hasync = _Hasync || [];
    _Hasync.push(['Histats.start', '1,5032900,4,430,112,75,00011111']);
    _Hasync.push(['Histats.fasi', '1']);
    _Hasync.push(['Histats.track_hits', '']);

    (function() {
      var hs = document.createElement('script');
      hs.type = 'text/javascript';
      hs.async = true;
      hs.src = '//s10.histats.com/js15_as.js';
      document.body.appendChild(hs);
    })();
  `}
        </Script>
      </div>
    </footer>
  );
}
