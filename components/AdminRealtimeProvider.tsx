"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";

interface Stats {
  bukuTamu: number;
}

interface AdminRealtimeContextType {
  stats: Stats;
  unreadBukuTamu: number;
  resetUnreadBukuTamu: () => void;
}

const DEFAULT_STATS: Stats = { bukuTamu: 0 };

const AdminRealtimeContext = createContext<AdminRealtimeContextType | undefined>(undefined);

export function AdminRealtimeProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [unreadBukuTamu, setUnreadBukuTamu] = useState(0);
  const previousBukuCountRef = useRef(0);
  const initialisedRef = useRef(false);

  const resetUnreadBukuTamu = useCallback(() => setUnreadBukuTamu(0), []);

  const onNewBukuTamu = useCallback(() => {
    setStats(s => ({ ...s, bukuTamu: s.bukuTamu + 1 }));
    setUnreadBukuTamu(u => u + 1);
    previousBukuCountRef.current += 1;
    toast.success("Buku Tamu Baru", {
      description: "Ada pengunjung baru yang mengisi buku tamu.",
      duration: 5000,
    });
  }, []);

  useEffect(() => {
    if (initialisedRef.current) return;
    initialisedRef.current = true;

    let pollingTimer: ReturnType<typeof setInterval> | null = null;

    const fetchInitial = async () => {
      try {
        const res = await fetch("/api/admin/stats/buku-tamu");
        const buku = await res.json().catch(() => ({ count: 0 }));
        const bukuCount = typeof buku.count === "number" ? buku.count : 0;
        previousBukuCountRef.current = bukuCount;
        setStats({ bukuTamu: bukuCount });
      } catch (e) {
        console.error("Error fetching initial admin stats:", e);
      }
    };

    fetchInitial();

    pollingTimer = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/stats/buku-tamu");
        const json = await res.json();
        const currentCount = typeof json.count === "number" ? json.count : previousBukuCountRef.current;
        if (currentCount > previousBukuCountRef.current) {
          const diff = currentCount - previousBukuCountRef.current;
          for (let i = 0; i < diff; i++) {
            onNewBukuTamu();
          }
        }
        previousBukuCountRef.current = currentCount;
      } catch {
        // ignore polling errors
      }
    }, 30000);

    return () => {
      if (pollingTimer) clearInterval(pollingTimer);
    };
  }, [onNewBukuTamu]);

  return (
    <AdminRealtimeContext.Provider value={{ stats, unreadBukuTamu, resetUnreadBukuTamu }}>
      {children}
    </AdminRealtimeContext.Provider>
  );
}

export function useAdminRealtime() {
  const ctx = useContext(AdminRealtimeContext);
  if (!ctx) throw new Error("useAdminRealtime must be used within AdminRealtimeProvider");
  return ctx;
}
