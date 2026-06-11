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
  Trash2, 
  Settings, 
  Users, 
  LogIn, 
  Compass, 
  Monitor, 
  Camera, 
  ConciergeBell, 
  Clock,
  Network
} from "lucide-react";
import { NotificationProvider, useNotification } from "@/components/NotificationProvider";
import { AdminRealtimeProvider } from "@/components/AdminRealtimeProvider";
import supabase from "@/lib/supabaseBrowser";

interface UserInfo {
  username: string;
  role: string;
  nama: string;
  id: string;
}

function decodeUserFromToken(): UserInfo | null {
  try {
    const token = sessionStorage.getItem("adminToken");
    if (!token) return null;
    const decoded = atob(token);
    // Format: username:id:timestamp
    const parts = decoded.split(":");
    if (parts.length >= 2) {
      const stored = sessionStorage.getItem("adminUser");
      if (stored) return JSON.parse(stored);
    }
    return null;
  } catch {
    return null;
  }
}

const contentNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hero-manager", label: "Slider Home", icon: ImageIcon },
  { href: "/admin/struktur-organisasi", label: "Struktur Organisasi", icon: Network },
  { href: "/admin/publikasi-manager", label: "Publikasi / Buletin", icon: FileText },
  { href: "/admin/prakiraan-manager", label: "Prakiraan", icon: Compass },
  { href: "/admin/display-manager", label: "Kelola Display", icon: Monitor },
  { href: "/admin/kegiatan-manager", label: "Dokumentasi Kegiatan", icon: Camera },
  { href: "/admin/buku-tamu", label: "Data Buku Tamu", icon: MessageSquare },
  { href: "/admin/layanan", label: "Kelola Layanan", icon: ConciergeBell },
  { href: "/admin/login-history", label: "History Login", icon: Clock },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

const adminNavItems = [
  { href: "/admin/users", label: "Manajemen Karyawan", icon: Users },
];

const ADMIN_ONLY_PATHS = [
  "/admin/users",
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AdminRealtimeProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminRealtimeProvider>
    </NotificationProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const { notifications, removeNotification, showNotification } = useNotification();
  const [notifOpen, setNotifOpen] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const userInitial = user?.nama?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || "A";

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const subs: any[] = [];

    const subscribeTo = (table: string, message: string) => {
      try {
        const ch = client
          .channel(`global-notif:${table}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table },
            (payload: any) => {
              showNotification(message, "success", 5000);
            }
          )
          .subscribe();
        subs.push(ch);
      } catch (e) {
        // ignore
      }
    };

    subscribeTo("buku_tamu", "Data Buku Tamu baru masuk");

    subscribeTo("kegiatan_documents", "Dokumentasi kegiatan baru masuk");

    return () => {
      try {
        subs.forEach((ch) => client.removeChannel(ch));
      } catch (e) {
        try {
          subs.forEach((ch) => ch.unsubscribe && ch.unsubscribe());
        } catch (err) {
          // ignore
        }
      }
    };
  }, [showNotification]);

  useEffect(() => {
    try {
      const token = sessionStorage.getItem("adminToken");
      const storedUser = sessionStorage.getItem("adminUser");
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        if (pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      } else {
        let userData: UserInfo | null = null;
        if (storedUser) {
          try { userData = JSON.parse(storedUser); setUser(userData); } catch {}
        }
        setIsLoggedIn(true);
        setLoading(false);

        if (userData) {
          const isUserAdmin = userData.role === "admin" || userData.role === "super_admin";
          if (!isUserAdmin && ADMIN_ONLY_PATHS.includes(pathname)) {
            router.push("/admin/dashboard");
          }
        }

        if (pathname === "/admin/login") {
          router.push("/admin/dashboard");
        }
      }
    } catch (err) {
      console.error("Error checking admin token:", err);
      setIsLoggedIn(false);
      setLoading(false);
      try { router.push("/admin/login"); } catch (e) { /* ignore */ }
    }
  }, [router, pathname]);

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminUser");
    } catch (e) {
      // ignore
    }
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
    <div className="flex h-screen bg-blue-50/30">
      {/* Sidebar - Light, elegant, professional layout */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 transition-transform duration-300 lg:relative lg:translate-x-0 overflow-hidden flex flex-col justify-between ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Sidebar Brand Header */}
          <div className="p-5 border-b border-slate-100 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white p-1 border border-slate-150 shadow-sm flex-shrink-0 flex items-center justify-center">
              <img src="/bmkg-logo.png" alt="BMKG" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-black text-slate-800 leading-tight truncate">BMKG Admin</h1>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider truncate">Tegal Maritim</p>
            </div>
          </div>

          {/* Sidebar Navigation items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Content Section */}
            <div className="space-y-1">
              <div className="px-3 pb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Konten Utama</p>
              </div>
              <div className="space-y-1">
                {contentNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-xs font-semibold ${
                        isActive
                          ? "bg-blue-50 text-[#003399] border-l-4 border-[#003399] pl-2 rounded-l-none font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon size={16} className={`flex-shrink-0 ${isActive ? "text-[#003399]" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Administration Section (Admin only) */}
            {isAdmin && (
              <div className="space-y-1">
                <div className="px-3 pb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrasi</p>
                </div>
                <div className="space-y-1">
                  {adminNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-xs font-semibold ${
                          isActive
                            ? "bg-blue-50 text-[#003399] border-l-4 border-[#003399] pl-2 rounded-l-none font-bold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <Icon size={16} className={`flex-shrink-0 ${isActive ? "text-[#003399]" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          {/* Sidebar Footer (Logout) */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-bold rounded-xl transition-colors shadow-sm"
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
        <header className="bg-[#003399] border-b border-blue-900/50 px-4 sm:px-8 py-3.5 flex items-center justify-between flex-shrink-0 shadow-md z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-blue-800 rounded-xl text-white transition-colors flex-shrink-0"
              aria-label="Toggle Sidebar"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-blue-200 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Stasiun Maritim Tegal Connected
            </div>
          </div>

          {/* Right Controls: Notification & Profile */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-white/20">
              <div className="text-right hidden sm:block text-white">
                <p className="text-xs font-bold text-white leading-tight">{user?.nama || user?.username || "Administrator"}</p>
                <p className="text-[10px] text-blue-200 font-semibold capitalize mt-0.5">{user?.role === "super_admin" ? "Super Admin" : user?.role || "Admin Access"}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-white to-blue-50 rounded-xl flex items-center justify-center text-[#003399] font-extrabold text-sm flex-shrink-0 shadow-md">
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
    </div>
  );
}
