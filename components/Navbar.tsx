"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Clock } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Prakiraan", href: "/prakiraan" },
  { label: "Layanan", href: "/layanan" },
  { label: "Kegiatan", href: "/kegiatan" },
  { label: "Kontak", href: "/kontak" },
];

export default function Navbar({ minimal = false }: { minimal?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [active, setActive] = useState("Home");

  useEffect(() => {
    if (minimal) return;
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [minimal]);

  useEffect(() => {
    if (!pathname || minimal) return;
    const found = navLinks.find(n => n.href === pathname || (n.href !== '/' && pathname.startsWith(n.href)));
    setActive(found?.label || 'Home');
  }, [pathname, minimal]);

  const isHome = pathname ? pathname === "/" : false;
  const showScrolledBg = false; // Always blue background, matching other pages
  
  const [timeString, setTimeString] = useState("");
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      setDateString(now.toLocaleDateString('id-ID', options));

      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setTimeString(`${hours}:${minutes}:${seconds} WIB`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showScrolledBg ? "bg-transparent" : "bg-[#003399] shadow-lg"
      }`}
    >
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => {
              setMenuOpen(false);
              if (isHome) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                window.location.href = "/";
              }
            }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-white">
              <img src="/bmkg-logo.png" alt="B" className="w-full h-full object-contain" />
            </div>
            <div className="block">
              <p className="text-white font-bold text-sm sm:text-base leading-tight">BMKG</p>
              <p className="text-blue-200 text-xs leading-tight">Stasiun Meteorologi Maritim Tegal</p>
            </div>
          </button>

          {/* Desktop Nav */}
          {!minimal && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                if (link.label === "Home" && isHome) {
                  return (
                    <button
                      key={link.label}
                      onClick={() => {
                        setMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`px-4 py-2 text-sm font-medium transition-colors rounded-md relative group ${
                        active === link.label ? "text-white" : "text-blue-100 hover:text-white"
                      }`}
                    >
                      {link.label}
                      <span
                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-yellow-400 transition-all duration-200 ${
                          active === link.label ? "w-3/4" : "w-0 group-hover:w-3/4"
                        }`}
                      />
                    </button>
                  );
                }
                return (
                  <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)} className={`px-4 py-2 text-sm font-medium transition-colors rounded-md relative group ${
                    active === link.label ? "text-white" : "text-blue-100 hover:text-white"
                  }`}>
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-yellow-400 transition-all duration-200 ${
                        active === link.label ? "w-3/4" : "w-0 group-hover:w-3/4"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Actions */}
          {!minimal && (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-mono text-blue-100 border border-blue-300/40 rounded-full bg-blue-900/30">
                <Clock size={14} className="text-blue-300 shrink-0" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0"></span>
                <span className="truncate">
                  {isHome && dateString ? `${dateString} | ` : ""}
                  {timeString || "--:--:-- WIB"}
                </span>
              </div>
              <button
                className="md:hidden p-2 text-blue-100 hover:text-white"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {!minimal && menuOpen && (
        <div className="md:hidden bg-[#003399] border-t border-blue-700 px-4 py-3">
          {navLinks.map((link) => {
            if (link.label === "Home" && isHome) {
              return (
                <button
                  key={link.label}
                  onClick={() => {
                    setActive("Home");
                    setMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-blue-100 hover:text-white hover:bg-blue-800 rounded-md transition-colors"
                >
                  {link.label}
                </button>
              );
            }
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => { setActive(link.label); setMenuOpen(false); }}
                className="block px-3 py-2 text-sm text-blue-100 hover:text-white hover:bg-blue-800 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
