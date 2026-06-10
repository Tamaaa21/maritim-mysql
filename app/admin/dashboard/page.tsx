"use client";

import { MessageSquare, FileText, ImageIcon, Users, LogIn, ArrowRight, ShieldCheck, Compass, HelpCircle } from "lucide-react";
import { useAdminRealtime } from "@/components/AdminRealtimeProvider";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const { stats } = useAdminRealtime();
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/stats/users")
      .then(r => r.json())
      .then(d => { if (typeof d.count === "number") setUserCount(d.count); })
      .catch(() => {});
  }, []);

  const cards = [
    {
      title: "Buku Tamu",
      value: stats.bukuTamu,
      icon: MessageSquare,
      color: "bg-blue-50/80 border-blue-100/60 text-blue-600",
      href: "/admin/buku-tamu",
      desc: "Total tamu berkunjung",
    },
    {
      title: "Layanan Berbayar",
      value: stats.layananBerbayar,
      icon: FileText,
      color: "bg-emerald-50/80 border-emerald-100/60 text-emerald-600",
      href: "/admin/layanan?tab=berbayar",
      desc: "Permintaan layanan berbayar",
    },
    {
      title: "Layanan Nol Rupiah",
      value: stats.layananNolRupiah,
      icon: FileText,
      color: "bg-violet-50/80 border-violet-100/60 text-violet-600",
      href: "/admin/layanan?tab=nol-rupiah",
      desc: "Permintaan layanan Rp 0",
    },
    {
      title: "Karyawan Aktif",
      value: userCount,
      icon: Users,
      color: "bg-amber-50/80 border-amber-100/60 text-amber-600",
      href: "/admin/users",
      desc: "Pengguna panel aktif",
    },
    {
      title: "History Login",
      value: "Lihat",
      icon: LogIn,
      color: "bg-teal-50/80 border-teal-100/60 text-teal-600",
      href: "/admin/login-history",
      desc: "Log masuk sistem admin",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#003399] uppercase tracking-wider mb-1">
            <ShieldCheck size={14} className="text-[#003399]" />
            BMKG Tegal Admin Workspace
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Utama</h1>
          <p className="text-slate-500 text-sm mt-1">Selamat datang di portal manajemen konten dan data Stasiun Meteorologi Maritim Tegal.</p>
        </div>
        <div className="text-slate-400 text-xs font-medium shrink-0 flex items-center gap-1.5 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Sistem Online
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest block">Ringkasan Statistik</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#003399]/30 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{card.title}</span>
                    <div className={`p-2.5 rounded-xl border ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <div className="mb-2">
                    <p className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">{card.value}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{card.desc}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center text-xs font-bold text-[#003399] transition-all group-hover:gap-1.5 gap-1">
                  <span>Lihat Detail</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Compass size={18} className="text-[#003399]" />
          <h2 className="text-base font-extrabold text-slate-800 tracking-tight">Akses Cepat Pengelolaan</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/hero-manager"
            className="flex items-center gap-4 p-4 border border-slate-150 rounded-xl hover:border-[#003399]/40 hover:bg-blue-50/30 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#003399] group-hover:scale-105 transition-transform flex-shrink-0">
              <ImageIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm md:text-base truncate group-hover:text-[#003399] transition-colors">Kelola Slider Home</p>
              <p className="text-slate-400 text-xs mt-0.5">Ubah gambar latar hero section dan slider utama</p>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-[#003399] group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          <Link
            href="/admin/prakiraan-manager"
            className="flex items-center gap-4 p-4 border border-slate-150 rounded-xl hover:border-[#003399]/40 hover:bg-blue-50/30 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#003399] group-hover:scale-105 transition-transform flex-shrink-0">
              <ImageIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm md:text-base truncate group-hover:text-[#003399] transition-colors">Kelola Prakiraan</p>
              <p className="text-slate-400 text-xs mt-0.5">Ubah gambar utama dan wilayah info prakiraan cuaca</p>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-[#003399] group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-4 p-4 border border-slate-150 rounded-xl hover:border-[#003399]/40 hover:bg-blue-50/30 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#003399] group-hover:scale-105 transition-transform flex-shrink-0">
              <Users size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm md:text-base truncate group-hover:text-[#003399] transition-colors">Manajemen Karyawan</p>
              <p className="text-slate-400 text-xs mt-0.5">Atur hak akses pengguna dan profil akun karyawan</p>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-[#003399] group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          <Link
            href="/admin/login-history"
            className="flex items-center gap-4 p-4 border border-slate-150 rounded-xl hover:border-[#003399]/40 hover:bg-blue-50/30 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#003399] group-hover:scale-105 transition-transform flex-shrink-0">
              <LogIn size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm md:text-base truncate group-hover:text-[#003399] transition-colors">History Login</p>
              <p className="text-slate-400 text-xs mt-0.5">Pantau dan verifikasi log aktivitas masuk admin sistem</p>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-[#003399] group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
