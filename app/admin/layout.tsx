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

const navSections: Array<{
  title?: string;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  items: Array<{ href: string; label: string; icon: any }>;
}> = [
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
    superAdminOnly: true,
    items: [
      { href: "/admin/users", label: "Manajemen User", icon: Users },
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

          // Redirect jika role user akses halaman admin-only
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
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-[#001b4c] to-[#000a24] border-r border-white/5 shadow-2xl lg:shadow-none transition-transform duration-300 lg:relative lg:translate-x-0 overflow-hidden flex flex-col justify-between ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full overflow-hidden relative">
          {/* Decorative background blur */}
          <div className="absolute top-0 left-0 w-full h-48 bg-blue-500/10 blur-[80px] pointer-events-none -z-10" />

          {/* Sidebar Brand Header */}
          <div className="p-6 border-b border-white/5 flex items-center gap-4 flex-shrink-0 z-10 relative">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 p-1.5 border border-white/10 shadow-inner flex-shrink-0 flex items-center justify-center backdrop-blur-md">
              <img src="/bmkg-logo.png" alt="BMKG" loading="lazy" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[15px] font-extrabold text-white leading-tight tracking-wide drop-shadow-sm truncate">BMKG ADMIN</h1>
              <p className="text-blue-300/80 text-[10px] font-bold uppercase tracking-widest truncate mt-0.5">Tegal Maritim</p>
            </div>
          </div>

          {/* Sidebar Navigation items */}
          <nav className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent custom-scrollbar">
            {navSections.map((section, idx) => {
              if (section.adminOnly && !isAdmin) return null;
              if (section.superAdminOnly && user?.role !== "super_admin") return null;

              return (
                <div key={idx} className="space-y-1">
                  {section.title && (
                    <div className="px-3 pb-2 pt-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{section.title}</p>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 text-[13px] font-medium relative overflow-hidden ${isActive
                              ? "bg-gradient-to-r from-blue-500/20 to-blue-500/5 text-white border border-blue-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] font-semibold"
                              : "text-slate-300 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                          )}
                          <Icon size={18} className={`flex-shrink-0 transition-transform duration-200 relative z-10 ${isActive ? "text-blue-300" : "text-slate-400 group-hover:text-blue-300 group-hover:scale-110"}`} />
                          <span className="truncate relative z-10">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer (Logout) */}
          <div className="p-5 border-t border-white/5 bg-white/[0.02] flex-shrink-0 z-10 backdrop-blur-sm">
            <button
              onClick={handleLogout}
              className="group w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/20 text-xs font-bold rounded-2xl transition-all duration-300 shadow-sm"
            >
              <LogOut size={16} className="flex-shrink-0 transition-transform group-hover:-translate-x-1" />
              <span>Keluar Sistem</span>
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
