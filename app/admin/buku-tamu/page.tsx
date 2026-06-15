"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, Eye, Download } from "lucide-react";
import { Input } from '@/components/ui/input';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { showSuccess, showError, showConfirm } from '@/lib/sweetalert';

interface BukuTamuEntry {
  id: string;
  nama: string;
  email: string;
  no_telepon: string;
  instansi: string | null;
  keperluan: string;
  foto_data: string | null;
  created_at: string;
}

function getUserRole(): string {
  try {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("adminUser") : null;
    if (stored) return JSON.parse(stored).role || "";
  } catch {}
  return "";
}

function isAdmin() {
  const role = getUserRole();
  return role === "admin" || role === "super_admin";
}

export default function BukuTamuPage() {
  const [data, setData] = useState<BukuTamuEntry[]>([]);
  const [filtered, setFiltered] = useState<BukuTamuEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<BukuTamuEntry | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/admin/buku-tamu");
      const result = await response.json();
      setData(result || []);
      setFiltered(result || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.no_telepon.includes(search)
    );
    setFiltered(filtered);
    setCurrentPage(1);
  }, [search, data]);

  const handleClearHistory = async () => {
    if (selectedLogs.size === 0) {
      showError('Pilih Data', 'Silakan pilih data yang ingin dihapus terlebih dahulu.');
      return;
    }

    const confirm = await showConfirm(
      'Hapus Data Terpilih?',
      `Apakah Anda yakin ingin menghapus ${selectedLogs.size} data terpilih?`
    );
    if (!confirm.isConfirmed) return;

    try {
      const payload = JSON.stringify({ ids: Array.from(selectedLogs) });
      const res = await fetch("/api/admin/buku-tamu", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: payload
      });
      const resData = await res.json();
      if (resData.success) {
        showSuccess('Berhasil Dihapus', resData.message || 'Data telah dihapus.');
        setSelectedLogs(new Set());
        setIsDeleteMode(false);
        fetchData();
      } else {
        showError('Gagal Menghapus', resData.message || 'Terjadi kesalahan saat menghapus data.');
      }
    } catch (error) {
      console.error(error);
      showError('Gagal Menghapus', 'Terjadi kesalahan koneksi.');
    }
  };

  const toggleSelectAll = () => {
    if (selectedLogs.size === filtered.length && filtered.length > 0) {
      setSelectedLogs(new Set());
    } else {
      setSelectedLogs(new Set(filtered.map(l => l.id)));
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

  const handleDelete = async (id: string) => {
    const confirm = await showConfirm('Hapus Data?', 'Data ini akan dihapus permanen.');
    if (!confirm.isConfirmed) return;
    try {
      const res = await fetch(`/api/admin/buku-tamu`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] })
      });
      const resData = await res.json();
      if (resData.success) {
        showSuccess('Berhasil Dihapus', 'Data telah dihapus.');
        fetchData();
      } else {
        showError('Gagal Menghapus', resData.message || 'Terjadi kesalahan.');
      }
    } catch (error) {
      console.error(error);
      showError('Gagal Menghapus', 'Terjadi kesalahan koneksi.');
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF("landscape");
    const pageW = doc.internal.pageSize.width;
    const pageH = doc.internal.pageSize.height;
    const margin = 10;

    const fotoDataMap: Record<number, string> = {};
    const rows = filtered.map((item, idx) => {
      if (item.foto_data) fotoDataMap[idx] = item.foto_data;
      return [
        String(idx + 1),
        item.nama,
        item.email,
        item.no_telepon,
        item.instansi || "-",
        item.keperluan,
        new Date(item.created_at).toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' }),
        "",
      ];
    });

    // Title
    doc.setFontSize(14);
    doc.text("Laporan Buku Tamu - Stasiun Meteorologi Maritim Tegal", margin, margin + 5);
    doc.setFontSize(8);
    doc.text(`Diekspor: ${new Date().toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, margin + 12);

    autoTable(doc, {
      startY: margin + 16,
      head: [["No.", "Nama", "Email", "Telepon", "Instansi", "Keperluan", "Tanggal", "Foto"]],
      body: rows,
      theme: "grid",
      styles: { fontSize: 7, valign: "middle" },
      headStyles: {
        fillColor: [0, 51, 153],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2,
        minCellHeight: 18,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 30 },
        2: { cellWidth: 35 },
        3: { cellWidth: 22 },
        4: { cellWidth: 30 },
        5: { cellWidth: "auto" },
        6: { cellWidth: 25, halign: "center" },
        7: { cellWidth: 80, halign: "center" },
      },
      margin: { top: margin + 14, right: margin, bottom: margin, left: margin },
      didParseCell: (data) => {
        if (data.column.index === 7 && fotoDataMap[data.row.index]) {
          const fotoW = data.cell.width - 4;
          data.cell.height = fotoW + 4;
        }
      },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 7) {
          const foto = fotoDataMap[data.row.index];
          if (!foto) return;
          const imgData = foto.startsWith("data:") ? foto : `data:image/jpeg;base64,${foto}`;
          try {
            const padding = 2;
            const size = Math.min(data.cell.width, data.cell.height) - padding * 2;
            if (size <= 2) return;
            const x = data.cell.x + (data.cell.width - size) / 2;
            const y = data.cell.y + (data.cell.height - size) / 2;
            doc.addImage(imgData, "JPEG", x, y, size, size);
          } catch (e) {
            console.error("Gagal menambahkan foto ke PDF:", e);
          }
        }
      },
      didDrawPage: () => {
        doc.setFontSize(6);
        doc.text(
          "Halaman " + String(doc.getCurrentPageInfo().pageNumber),
          pageW - margin,
          pageH - 5,
          { align: "right" }
        );
      },
    });

    doc.save(`Buku_Tamu_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const handleBackup = async () => {
    try {
      const res = await fetch("/api/admin/buku-tamu/backup");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `buku_tamu_backup_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      showError('Gagal', 'Gagal melakukan backup');
    }
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
      const res = await fetch("/api/admin/buku-tamu/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json?.success) {
        showSuccess('Berhasil', json.message || 'Restore berhasil');
        fetchData();
      } else {
        showError('Gagal', json?.message || 'Restore gagal');
      }
    } catch (e) {
      console.error(e);
      showError('File Tidak Valid', 'File backup tidak valid');
    } finally {
      setRestoring(false);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-6 p-4 md:p-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Data Buku Tamu</h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">Manajemen data pengunjung dan tamu</p>
      </div>

      {/* Search & Export */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari berdasarkan nama, email, atau telepon..." className="pl-12 text-sm" />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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
                <Trash2 size={18} /> Hapus Data
              </button>
            )
          )}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-[#003399] hover:bg-[#0044cc] text-white px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm shadow-sm"
          >
            <Download size={18} /> Cetak PDF
          </button>
          <button
            onClick={handleBackup}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Backup
          </button>
          <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm shadow-sm cursor-pointer ${restoring ? "bg-gray-400" : "bg-amber-600 hover:bg-amber-700"} text-white`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            {restoring ? "Memulihkan..." : "Restore"}
            <input type="file" accept=".json" onChange={handleRestore} className="hidden" disabled={restoring} />
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-[#003399] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Tidak ada data ditemukan
          </div>
        ) : (
          (() => {
            const totalPages = Math.ceil(filtered.length / itemsPerPage);
            const indexOfLastItem = currentPage * itemsPerPage;
            const indexOfFirstItem = indexOfLastItem - itemsPerPage;
            const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
            
            return (
              <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {isDeleteMode && (
                        <th className="px-3 md:px-6 py-3 text-left w-10">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-[#003399] focus:ring-[#003399]"
                            checked={filtered.length > 0 && selectedLogs.size === filtered.length}
                            onChange={toggleSelectAll}
                          />
                        </th>
                      )}
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-700">No</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-700">Nama</th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                      <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-700">Telepon</th>
                      <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-700">Instansi</th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-700">Tanggal</th>
                      {!isDeleteMode && (
                        <th className="px-3 md:px-6 py-3 text-center text-xs font-semibold text-gray-700">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentItems.map((item, index) => {
                      const globalIndex = indexOfFirstItem + index + 1;
                      return (
                        <tr key={item.id} className={`transition-colors ${selectedLogs.has(item.id) ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                          {isDeleteMode && (
                            <td className="px-3 md:px-6 py-4 w-10">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-[#003399] focus:ring-[#003399]"
                                checked={selectedLogs.has(item.id)}
                                onChange={() => toggleSelectLog(item.id)}
                              />
                            </td>
                          )}
                          <td className="px-3 md:px-6 py-4 text-xs md:text-sm text-gray-500 font-mono">{globalIndex}</td>
                          <td className="px-3 md:px-6 py-4 text-xs md:text-sm font-medium text-gray-900">{item.nama}</td>
                          <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-600 truncate">{item.email}</td>
                          <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-600">{item.no_telepon}</td>
                          <td className="hidden xl:table-cell px-6 py-4 text-sm text-gray-600">{item.instansi || "-"}</td>
                          <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-600">
                            {new Date(item.created_at).toLocaleDateString("id-ID")}
                          </td>
                          {!isDeleteMode && (
                            <td className="px-3 md:px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setSelectedEntry(item)}
                                  className="p-2 hover:bg-blue-50 text-[#003399] rounded-lg transition-colors"
                                >
                                  <Eye size={18} />
                                </button>
                                {isAdmin() && (
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100 gap-4">
                    <div className="text-xs md:text-sm text-gray-500">
                      Menampilkan <span className="font-semibold">{indexOfFirstItem + 1}</span> - <span className="font-semibold">{Math.min(indexOfLastItem, filtered.length)}</span> dari <span className="font-semibold">{filtered.length}</span> data
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs md:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Sebelumnya
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 border rounded-lg text-xs md:text-sm font-medium transition-colors ${
                            currentPage === page
                              ? "bg-[#003399] border-[#003399] text-white"
                              : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs md:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        )}
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Detail Pengunjung</h2>
            <div className="space-y-4">
              {/* Foto */}
              {selectedEntry.foto_data && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-2">Foto</p>
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                    <img
                      src={selectedEntry.foto_data}
                      alt="Foto pengunjung"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Nama</p>
                <p className="text-gray-900 font-medium">{selectedEntry.nama}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Email</p>
                <p className="text-gray-900 font-medium text-sm break-all">{selectedEntry.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Telepon</p>
                <p className="text-gray-900 font-medium">{selectedEntry.no_telepon}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Instansi</p>
                <p className="text-gray-900 font-medium">{selectedEntry.instansi || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Keperluan</p>
                <p className="text-gray-900 font-medium text-sm">{selectedEntry.keperluan}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Tanggal</p>
                <p className="text-gray-900 font-medium">{new Date(selectedEntry.created_at).toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedEntry(null)}
              className="w-full mt-6 px-4 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
