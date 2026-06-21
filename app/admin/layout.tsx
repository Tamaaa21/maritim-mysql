"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ImageIcon,
  MessageSquare,
  FileText,
  LogOut,
  Menu,
  X,
  Settings,
  Users,
  LogIn,
  Compass,
  Monitor,
  Camera,
  ConciergeBell,
  Clock,
  Network,
  Bell,
} from "lucide-react";
import { AdminRealtimeProvider, useAdminRealtime } from "@/components/AdminRealtimeProvider";
import { Toaster } from "@/components/ui/sonner";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { AdminUserContext } from "@/hooks/useAdminUser";
import { csrfFetch } from "@/lib/csrf";

interface UserInfo {
  username: string;
  role: string;
  nama: string;
  id: string;
}

const navSections = [
  {
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "INFORMASI",
    items: [
      { href: "/admin/prakiraan-manager", label: "Prakiraan", icon: Compass },
      { href: "/admin/publikasi-manager", label: "Publikasi / Buletin", icon: FileText },
      { href: "/admin/kegiatan-manager", label: "Dokumentasi Kegiatan", icon: Camera },
      { href: "/admin/hero-manager", label: "Slider Home", icon: ImageIcon },
      { href: "/admin/struktur-organisasi", label: "Struktur Organisasi", icon: Network },
    ]
  },
  {
    title: "LAYANAN PUBLIK",
    items: [
      { href: "/admin/buku-tamu", label: "Data Buku Tamu", icon: MessageSquare },
      { href: "/admin/layanan", label: "Kelola Layanan", icon: ConciergeBell },
    ]
  },
  {
    title: "DISPLAY",
    items: [
      { href: "/admin/display-manager", label: "Kelola Display", icon: Monitor },
    ]
  },
  {
    title: "ADMINISTRASI",
    adminOnly: true,
    items: [
      { href: "/admin/users", label: "Manajemen Karyawan", icon: Users },
    ]
  },
  {
    title: "SISTEM",
    items: [
      { href: "/admin/login-history", label: "History Login", icon: Clock },
      { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
    ]
  },
];

const ADMIN_ONLY_PATHS = [
  "/admin/users",
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRealtimeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminRealtimeProvider>
  );
}

function SessionTimeoutActive() {
  useSessionTimeout();
  return null;
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { unreadBukuTamu, resetUnreadBukuTamu } = useAdminRealtime();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const userInitial = user?.nama?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || "A";

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/me");
        const data = await res.json();

        if (cancelled) return;

        if (data.success && data.user) {
          setUser(data.user);
          setIsLoggedIn(true);
          setLoading(false);

          // Redirect jika role karyawan akses halaman admin-only
          const isUserAdmin = data.user.role === "admin" || data.user.role === "super_admin";
          if (!isUserAdmin && ADMIN_ONLY_PATHS.includes(pathname)) {
            router.push("/admin/dashboard");
          }

          if (pathname === "/admin/login") {
            router.push("/admin/dashboard");
          }
        } else {
          setIsLoggedIn(false);
          setLoading(false);
          if (pathname !== "/admin/login") {
            router.push("/admin/login");
          }
        }
      } catch {
        if (!cancelled) {
          setIsLoggedIn(false);
          setLoading(false);
          try { router.push("/admin/login"); } catch {}
        }
      }
    }

    checkAuth();
    return () => { cancelled = true; };
  }, [router, pathname]);

  const handleLogout = async () => {
    try {
      await csrfFetch("/api/admin/logout", { method: "POST" });
    } catch {}
    setIsLoggedIn(false);
    setLoading(false);
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#003399] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-650 font-medium">Memuat data panel...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (pathname === "/admin/login") {
      return <>{children}</>;
    }
    return null;
  }

  return (
    <AdminUserContext.Provider value={{ user, isAdmin: isAdmin, isLoggedIn }}>
    <SessionTimeoutActive />
    <div className="flex h-screen bg-blue-50/30">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#002266] border-r border-blue-900/40 transition-transform duration-300 lg:relative lg:translate-x-0 overflow-hidden flex flex-col justify-between ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Sidebar Brand Header */}
          <div className="p-5 border-b border-blue-900/40 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white p-1 border border-white/10 shadow-sm flex-shrink-0 flex items-center justify-center">
              <img src="/bmkg-logo.png" alt="BMKG" loading="lazy" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-black text-white leading-tight truncate">BMKG Admin</h1>
              <p className="text-blue-300 text-[9px] font-bold uppercase tracking-wider truncate">Tegal Maritim</p>
            </div>
          </div>

          {/* Sidebar Navigation items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {navSections.map((section, idx) => {
              if (section.adminOnly && !isAdmin) return null;

              return (
                <div key={idx} className="space-y-1">
                  {section.title && (
                    <div className="px-3 pb-2 pt-2">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{section.title}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-xs font-semibold ${isActive
                              ? "bg-white/10 text-white border-l-4 border-blue-400 pl-2 rounded-l-none font-bold"
                              : "text-blue-200/90 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                          <Icon size={16} className={`flex-shrink-0 ${isActive ? "text-blue-300" : "text-blue-400/80"}`} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer (Logout) */}
          <div className="p-4 border-t border-blue-900/40 bg-[#001a4d] flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-200 hover:text-red-100 border border-red-500/20 text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <LogOut size={14} className="flex-shrink-0" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors flex-shrink-0"
              aria-label="Toggle Sidebar"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-450 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Stasiun Maritim Tegal Connected
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => { resetUnreadBukuTamu(); router.push("/admin/buku-tamu"); }}
              className="relative p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-[#003399] transition-colors"
              title="Buku Tamu Baru"
            >
              <Bell size={20} />
              {unreadBukuTamu > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                  {unreadBukuTamu > 9 ? "9+" : unreadBukuTamu}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">{user?.nama || user?.username || "Administrator"}</p>
                <p className="text-[10px] text-slate-400 font-semibold capitalize mt-0.5">{user?.role === "super_admin" ? "Super Admin" : user?.role || "Admin Access"}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-[#003399] to-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 shadow-md shadow-blue-500/10">
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-auto bg-blue-50/40">
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Toaster richColors position="top-right" />
    </div>
    </AdminUserContext.Provider>
  );
}
