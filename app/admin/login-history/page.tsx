"use client";

import { useState, useEffect } from "react";
import { LogIn, Clock, Search, ChevronLeft, ChevronRight, Download, Monitor, Globe, Trash2, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { showSuccess, showError, showConfirm } from '@/lib/sweetalert';

function getUserRole(): string {
  try {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("adminUser") : null;
    if (stored) return JSON.parse(stored).role || "";
  } catch {}
  return "";
}

const isAdmin = () => {
  const role = getUserRole();
  return role === "admin" || role === "super_admin";
};

interface LoginLog {
  id: string;
  user_id: string;
  username: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  aktivitas?: string;
}

const ITEMS_PER_PAGE = 20;

export default function LoginHistoryPage() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [restoring, setRestoring] = useState(false);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/login-logs");
      const json = await res.json();
      if (json?.success) {
        setLogs(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch login logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBackup = async () => {
    try {
      const res = await fetch("/api/admin/login-logs/backup");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `login_logs_backup_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      showError('Gagal', "Gagal melakukan backup");
    }
  };

  const handleClearHistory = async () => {
    if (selectedLogs.size === 0) {
      showError('Pilih Data', 'Silakan pilih riwayat login yang ingin dihapus terlebih dahulu.');
      return;
    }

    const confirm = await showConfirm(
      'Hapus Riwayat Terpilih?',
      `Apakah Anda yakin ingin menghapus ${selectedLogs.size} riwayat login terpilih?`
    );
    if (!confirm.isConfirmed) return;
    
    try {
      const payload = JSON.stringify({ ids: Array.from(selectedLogs) });
      const res = await fetch("/api/admin/login-logs", { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: payload
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Berhasil Dihapus', data.message || "Riwayat login berhasil dihapus");
        setSelectedLogs(new Set());
        setIsDeleteMode(false);
        fetchLogs();
      } else {
        showError('Gagal Menghapus', data.message || "Gagal menghapus riwayat login");
      }
    } catch (e) {
      console.error(e);
      showError('Error', "Terjadi kesalahan koneksi");
    }
  };

  const toggleSelectAll = () => {
    if (selectedLogs.size === paginated.length && paginated.length > 0) {
      setSelectedLogs(new Set());
    } else {
      setSelectedLogs(new Set(paginated.map(l => l.id)));
    }
  };

  const toggleSelectLog = (id: string) => {
    const newSelected = new Set(selectedLogs);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLogs(newSelected);
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const confirm = await showConfirm('Restore Data?', `Restore data dari file ${file.name}? Data akan ditambahkan ke database.`);
    if (!confirm.isConfirmed) return;

    setRestoring(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const res = await fetch("/api/admin/login-logs/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json?.success) {
        showSuccess('Berhasil', json.message || "Restore berhasil");
        fetchLogs();
      } else {
        showError('Gagal', json?.message || "Restore gagal");
      }
    } catch (e) {
      console.error(e);
      showError('File Tidak Valid', "File backup tidak valid");
    } finally {
      setRestoring(false);
    }
    e.target.value = "";
  };

  const filtered = logs.filter(log => {
    const matchesSearch = log.username.toLowerCase().includes(search.toLowerCase()) ||
      (log.ip_address || "").includes(search) ||
      (log.user_agent || "").toLowerCase().includes(search.toLowerCase());
      
    if (!matchesSearch) return false;
    
    if (dateFilter) {
      const logDate = new Date(log.created_at).toISOString().slice(0, 10);
      if (logDate !== dateFilter) return false;
    }
    
    return true;
  });

  const sortedFiltered = [...filtered].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = sortedFiltered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  // Reset page and selections when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedLogs(new Set());
    setIsDeleteMode(false);
  }, [search, dateFilter]);

  return (
    <div className="space-y-6 p-4 md:p-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">History Login</h1>
        <p className="text-gray-500 mt-2">Pantau aktivitas masuk pengguna ke panel administrasi.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari username, IP, User Agent..." className="pl-12 text-sm w-full" />
          </div>
          <Input 
            type="date" 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)} 
            className="w-full sm:w-auto text-sm" 
            title="Filter by date"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm shadow-sm"
          >
            <ArrowUpDown size={18} /> {sortOrder === "desc" ? "Terbaru" : "Terlama"}
          </button>
          {isAdmin() && (
            isDeleteMode ? (
              <>
                <button
                  onClick={() => { setIsDeleteMode(false); setSelectedLogs(new Set()); }}
                  className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors text-sm shadow-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm shadow-sm"
                >
                  <Trash2 size={18} /> Hapus ({selectedLogs.size})
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsDeleteMode(true)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm shadow-sm"
              >
                <Trash2 size={18} /> Hapus Riwayat
              </button>
            )
          )}
          <button
            onClick={handleBackup}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm shadow-sm"
          >
            <Download size={18} /> Backup
          </button>
          <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm shadow-sm cursor-pointer ${restoring ? "bg-gray-400" : "bg-amber-600 hover:bg-amber-700"} text-white`}>
            <UploadIcon size={18} /> {restoring ? "Memulihkan..." : "Restore"}
            <input type="file" accept=".json" onChange={handleRestore} className="hidden" disabled={restoring} />
          </label>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LogIn size={20} className="text-[#003399]" />
            Riwayat Masuk
            {!loading && (
              <span className="text-sm font-normal text-gray-400">({filtered.length} catatan)</span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-[#003399] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl bg-gray-50">
            <LogIn className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500 text-sm">Belum ada riwayat login.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    {isDeleteMode && (
                      <th className="text-left py-3 px-3 w-10">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-[#003399] focus:ring-[#003399]"
                          checked={paginated.length > 0 && selectedLogs.size === paginated.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                    )}
                    <th className="text-left py-3 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">No</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Waktu</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">User</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Aktivitas</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((log, index) => (
                    <tr key={log.id} className={`border-b border-gray-50 transition-colors ${selectedLogs.has(log.id) ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}>
                      {isDeleteMode && (
                        <td className="py-3 px-3 w-10">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-[#003399] focus:ring-[#003399]"
                            checked={selectedLogs.has(log.id)}
                            onChange={() => toggleSelectLog(log.id)}
                          />
                        </td>
                      )}
                      <td className="py-3 px-3 w-10">
                        <span className="text-gray-400 text-xs font-mono">
                          {(safePage - 1) * ITEMS_PER_PAGE + index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400 shrink-0" />
                          <span className="text-gray-900 font-medium text-xs whitespace-nowrap">
                            {new Date(log.created_at).toLocaleDateString("id-ID", {
                              day: "2-digit", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-gray-900">{log.username}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-gray-600 text-sm capitalize">{log.aktivitas || "login"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Halaman <span className="font-bold text-gray-900">{safePage}</span> dari{" "}
                  <span className="font-bold text-gray-900">{totalPages}</span>{" "}
                  &bull; {filtered.length} total catatan
                </p>

                <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start mt-3 sm:mt-0">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {/* Sliding window pagination */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => {
                      if (totalPages <= 7) return true;
                      if (p === 1 || p === totalPages) return true;
                      if (Math.abs(p - safePage) <= 2) return true;
                      return false;
                    })
                    .reduce<(number | "...")[]>((acc, p, i, arr) => {
                      if (i > 0 && typeof arr[i - 1] === "number" && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "..." ? (
                        <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-xs text-gray-400 font-medium">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p as number)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            p === safePage
                              ? "bg-[#003399] text-white shadow-sm"
                              : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function UploadIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
  );
}
