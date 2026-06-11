"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import supabase from "@/lib/supabaseBrowser";
import { useNotification } from "@/components/NotificationProvider";

interface Stats {
  bukuTamu: number;
  layananBerbayar: number;
  layananNolRupiah: number;
}

const DEFAULT_STATS: Stats = { bukuTamu: 0, layananBerbayar: 0, layananNolRupiah: 0 };

const AdminRealtimeContext = createContext<{ stats: Stats } | undefined>(undefined);

export function AdminRealtimeProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const { showNotification } = useNotification();

  useEffect(() => {
    const client = supabase;
    const fetchInitial = async () => {
      try {
        const paths = [
          "/api/admin/stats/buku-tamu",
          "/api/admin/stats/layanan-berbayar",
          "/api/admin/stats/layanan-nol-rupiah",
        ];

        const [bukuRes, berbayarRes, nolRes] = await Promise.all(paths.map(p => fetch(p)));

        if (!bukuRes.ok || !berbayarRes.ok || !nolRes.ok) {
          console.warn("Failed to fetch admin stats:", {
            buku: bukuRes.status,
            berbayar: berbayarRes.status,
            nol: nolRes.status,
          });
        }

        const buku = await bukuRes.json().catch(() => ({ count: 0 }));
        const berbayar = await berbayarRes.json().catch(() => ({ count: 0 }));
        const nol = await nolRes.json().catch(() => ({ count: 0 }));

        setStats({
          bukuTamu: typeof buku.count === "number" ? buku.count : 0,
          layananBerbayar: typeof berbayar.count === "number" ? berbayar.count : 0,
          layananNolRupiah: typeof nol.count === "number" ? nol.count : 0,
        });
      } catch (e) {
        console.error("Error fetching initial admin stats:", e);
      }
    };

    fetchInitial();

    if (!client) return;

    const subs: any[] = [];

    const subscribeTo = (table: string, message: string, updater?: () => void) => {
      try {
        const ch = client
          .channel(`global-realtime:${table}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table }, () => {
            if (updater) updater();
            showNotification(message, "success", 4000);
          })
          .subscribe();
        subs.push(ch);
      } catch (e) {
        // ignore
      }
    };

    subscribeTo("buku_tamu", "Data Buku Tamu baru masuk", () => setStats(s => ({ ...s, bukuTamu: s.bukuTamu + 1 })));
    subscribeTo("layanan_berbayar", "Layanan Berbayar baru masuk", () => setStats(s => ({ ...s, layananBerbayar: s.layananBerbayar + 1 })));
    subscribeTo("layanan_nol_rupiah", "Layanan Nol Rupiah baru masuk", () => setStats(s => ({ ...s, layananNolRupiah: s.layananNolRupiah + 1 })));

    return () => {
      try {
        subs.forEach(ch => client.removeChannel(ch));
      } catch (e) {
        try { subs.forEach(ch => ch.unsubscribe && ch.unsubscribe()); } catch {}
      }
    };
  }, [showNotification]);

  return <AdminRealtimeContext.Provider value={{ stats }}>{children}</AdminRealtimeContext.Provider>;
}

export function useAdminRealtime() {
  const ctx = useContext(AdminRealtimeContext);
  if (!ctx) throw new Error("useAdminRealtime must be used within AdminRealtimeProvider");
  return ctx;
}
