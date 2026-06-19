"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

export default function WhatsAppFloating() {
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (pathname && (pathname.startsWith("/admin") || pathname === "/display" || pathname === "/buku_tamu")) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  }, [pathname]);

  if (hidden) return null;

  const phone = "628112562200"; // Indonesian full international format without +
  const text = encodeURIComponent("Halo Stasiun Meteorologi Maritim Tegal, saya ingin bertanya tentang layanan.");
  const href = `https://wa.me/${phone}?text=${text}`;

  const handleCloseTooltip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTooltip(false);
  };

  return (
    <div className="fixed right-6 bottom-6 md:right-8 md:bottom-8 z-50 flex flex-col items-end gap-2.5 pointer-events-none">
      {/* Styles for the custom animation */}
      <style>{`
        @keyframes waBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-wa-bounce {
          animation: waBounce 2.5s infinite ease-in-out;
        }
      `}</style>

      {/* Speech Bubble Tooltip (Bouncing text bubble) */}
      {showTooltip && (
        <div 
          className="pointer-events-auto bg-white text-slate-800 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center gap-2 border border-slate-100 animate-bounce transition-all duration-300"
          style={{ animationDuration: "2.5s" }}
        >
          <span>Hubungi via WhatsApp</span>
          <button 
            onClick={handleCloseTooltip}
            className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-full hover:bg-slate-100"
            aria-label="Tutup"
          >
            <X size={14} className="shrink-0" />
          </button>
        </div>
      )}

      {/* WhatsApp Static Circle Button (Slightly smaller size) */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp"
        className="pointer-events-auto w-11 h-11 md:w-13 md:h-13 rounded-full bg-[#25D366] hover:bg-[#20ba56] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
      >
        {/* WhatsApp SVG logo */}
        <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 md:w-6.5 md:h-6.5 fill-white" aria-hidden>
          <path d="M12.031 2c-5.523 0-10 4.477-10 10 0 1.777.47 3.5 1.359 5.02L2 22l5.148-1.313A9.96 9.96 0 0 0 12.031 22c5.522 0 10-4.477 10-10s-4.478-10-10-10zm.04 18c-1.636 0-3.2-.435-4.573-1.26l-.328-.196-3.064.782.795-2.981-.215-.342A7.95 7.95 0 0 1 4.072 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm3.556-5.833c-.195-.097-1.15-.567-1.328-.631-.177-.064-.307-.097-.435.097-.129.195-.5.631-.613.759-.113.129-.226.145-.42.048-.195-.097-.822-.303-1.564-.966-.578-.516-.967-1.153-1.08-1.347-.113-.195-.012-.299.085-.396.088-.088.195-.226.291-.339.097-.113.129-.194.194-.323.064-.13.032-.242-.016-.34-.048-.097-.435-1.048-.597-1.435-.156-.379-.311-.328-.435-.328-.113 0-.242-.016-.371-.016-.129 0-.339.048-.516.242-.177.194-.677.662-.677 1.613 0 .951.693 1.871.79 2.001.097.129 1.363 2.08 3.3 2.919.461.199.82.319 1.1.408.463.147.884.126 1.217.077.371-.056 1.15-.468 1.312-.919.162-.452.162-.839.113-.919-.048-.08-.177-.129-.371-.226z" />
        </svg>
      </a>
    </div>
  );
}
