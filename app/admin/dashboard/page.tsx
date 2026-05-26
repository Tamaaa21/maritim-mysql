"use client";

import { useEffect, useState } from "react";
import { MessageSquare, FileText, ImageIcon, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    bukuTamu: 0,
    layananBerbayar: 0,
    layananNolRupiah: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bukuTamuRes, berbayarRes, nolRupiahRes] = await Promise.all([
          fetch("/api/admin/stats/buku-tamu"),
          fetch("/api/admin/stats/layanan-berbayar"),
          fetch("/api/admin/stats/layanan-nol-rupiah"),
        ]);

        const bukuTamu = await bukuTamuRes.json();
        const berbayar = await berbayarRes.json();
        const nolRupiah = await nolRupiahRes.json();

        setStats({
          bukuTamu: bukuTamu.count || 0,
          layananBerbayar: berbayar.count || 0,
          layananNolRupiah: nolRupiah.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Buku Tamu",
      value: stats.bukuTamu,
      icon: MessageSquare,
      color: "bg-blue-100",
      textColor: "text-blue-600",
      href: "/admin/buku-tamu",
    },
    {
      title: "Layanan Berbayar",
      value: stats.layananBerbayar,
      icon: FileText,
      color: "bg-green-100",
      textColor: "text-green-600",
      href: "/admin/layanan?tab=berbayar",
    },
    {
      title: "Layanan Nol Rupiah",
      value: stats.layananNolRupiah,
      icon: FileText,
      color: "bg-purple-100",
      textColor: "text-purple-600",
      href: "/admin/layanan?tab=nol-rupiah",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Selamat datang di panel administrasi BMKG Tegal</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <a
              key={card.title}
              href={card.href}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-[#003399]/20 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon size={24} className={card.textColor} />
                </div>
              </div>
              <p className="text-[#003399] text-sm font-semibold group-hover:gap-1 flex items-center gap-0 transition-all">
                Lihat Detail →
              </p>
            </a>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a
            href="/admin/hero-manager"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#003399] hover:bg-blue-50 transition-all group"
          >
            <ImageIcon size={20} className="text-[#003399] group-hover:scale-110 transition-transform" />
            <div>
              <p className="font-semibold text-gray-900">Kelola Slider Home</p>
              <p className="text-gray-500 text-xs">Ubah gambar latar hero section</p>
            </div>
          </a>
          <a
            href="/admin/prakiraan-manager"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#003399] hover:bg-blue-50 transition-all group"
          >
            <ImageIcon size={20} className="text-[#003399] group-hover:scale-110 transition-transform" />
            <div>
              <p className="font-semibold text-gray-900">Kelola Prakiraan</p>
              <p className="text-gray-500 text-xs">Ubah gambar utama prakiraan</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
