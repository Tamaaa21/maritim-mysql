"use client";

import { MessageSquare, FileText, ImageIcon, Users, LogIn, ArrowRight, ShieldCheck, Compass, CheckCircle2, Calendar, HelpCircle, AlertTriangle } from "lucide-react";
import { useAdminRealtime } from "@/components/AdminRealtimeProvider";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const { stats } = useAdminRealtime();
  const [userCount, setUserCount] = useState(0);
  const [prakiraanStats, setPrakiraanStats] = useState({ active: 0, inactive: 0 });
  const [expiringPrakiraan, setExpiringPrakiraan] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/stats/users")
      .then(r => r.json())
      .then(d => { if (typeof d.count === "number") setUserCount(d.count); })
      .catch(() => {});

    fetch("/api/admin/stats/prakiraan")
      .then(r => r.json())
      .then(d => { if (d.success) setPrakiraanStats({ active: d.active, inactive: d.inactive }); })
      .catch(() => {});

    fetch("/api/admin/stats/prakiraan/expiring")
      .then(r => r.json())
      .then(d => { if (d.success) setExpiringPrakiraan(d.data || []); })
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
      title: "Prakiraan Aktif",
      value: prakiraanStats.active,
      icon: CheckCircle2,
      color: "bg-emerald-50/80 border-emerald-100/60 text-emerald-600",
      href: "/admin/prakiraan-manager",
      desc: "Sedang tayang di publik",
    },
    {
      title: "Prakiraan Tidak Aktif",
      value: prakiraanStats.inactive,
      icon: Calendar,
      color: "bg-rose-50/80 border-rose-100/60 text-rose-500",
      href: "/admin/prakiraan-manager",
      desc: "Sudah kedaluwarsa",
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

      {/* Expiring Prakiraan Warning */}
      {expiringPrakiraan.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-200 text-amber-600 flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-extrabold text-amber-800 text-sm">
                    {expiringPrakiraan.length} Prakiraan Akan Kedaluwarsa
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Prakiraan berikut akan berakhir dalam 24 jam ke depan:
                  </p>
                </div>
                <Link
                  href="/admin/prakiraan-manager"
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-xl transition-colors text-xs"
                >
                  Kelola <ArrowRight size={14} />
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {expiringPrakiraan.map((item: Record<string, unknown>) => (
                  <span
                    key={item.id as string}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-semibold text-amber-700"
                  >
                    {item.title as string}
                    <span className="text-amber-400 font-normal">
                      &middot;{" "}
                      {item.waktu_berakhir
                        ? new Date(item.waktu_berakhir as string).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
              <p className="text-slate-400 text-xs mt-0.5">Atur hak akses pengguna dan profil akun user</p>
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
