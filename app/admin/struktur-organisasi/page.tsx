"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, HelpCircle, Network, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

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

interface StrukturItem {
  id: string;
  jabatan: string;
  nama?: string;
  inisial: string; // Used to store photo URL or initial
  deskripsi: string;
  urutan: number;
}

export default function StrukturManagerPage() {
  const [items, setItems] = useState<StrukturItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StrukturItem | null>(null);
  
  // Form fields
  const [jabatan, setJabatan] = useState("");
  const [nama, setNama] = useState("");
  const [inisial, setInisial] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [urutan, setUrutan] = useState(0);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/struktur-organisasi");
      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) {
        setItems(data.data);
      }
    } catch (e) {
      console.error(e);
      setError("Gagal memuat data struktur organisasi");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setJabatan("");
    setNama("");
    setInisial("");
    setDeskripsi("");
    setUrutan(items.length > 0 ? Math.max(...items.map(i => i.urutan || 0)) + 1 : 1);
    setError("");
    setShowModal(true);
  };

  const handleOpenEdit = (item: StrukturItem) => {
    setEditingItem(item);
    setJabatan(item.jabatan);
    setNama(item.nama || "");
    setInisial(item.inisial);
    setDeskripsi(item.deskripsi || "");
    setUrutan(item.urutan || 0);
    setError("");
    setShowModal(true);
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setInisial(data.url);
      } else {
        setError(data.message || "Gagal mengunggah foto");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat mengunggah foto");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!jabatan || !inisial) {
      setError("Jabatan dan foto/inisial wajib diisi");
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        jabatan,
        nama,
        inisial,
        deskripsi,
        urutan: Number(urutan),
      };

      const isEdit = !!editingItem;
      const endpoint = isEdit 
        ? `/api/admin/struktur-organisasi/${editingItem.id}`
        : "/api/admin/struktur-organisasi";
      
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (resData.success) {
        setShowModal(false);
        fetchList();
      } else {
        setError(resData.message || "Gagal menyimpan data");
      }
    } catch (e: any) {
      console.error(e);
      setError("Terjadi kesalahan koneksi server");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jabatan ini dari struktur organisasi?")) return;

    try {
      const res = await fetch(`/api/admin/struktur-organisasi/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchList();
      } else {
        alert(data.message || "Gagal menghapus data");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan saat menghapus data");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Network size={28} className="text-[#003399]" />
            Kelola Struktur Organisasi
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Atur dan kelola hirarki organisasi yang tampil di halaman Tentang Kami.
          </p>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#003399] hover:bg-[#002266] text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg shrink-0"
        >
          <Plus size={16} />
          <span>Tambah Jabatan</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200/85 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-[#003399] mx-auto mb-3" size={28} />
            <p className="text-slate-500 text-sm">Memuat data struktur organisasi...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <HelpCircle className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="text-sm">Belum ada struktur organisasi yang terdaftar.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#003399] font-bold hover:underline"
            >
              Tambah data sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-widest w-16">Urutan</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-widest w-16">Inisial</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Jabatan</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Pejabat</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Deskripsi Tugas</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-widest w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  let badgeColor = "bg-slate-100 text-slate-600";
                  const ini = item.inisial.toUpperCase();
                  if (ini === "K") badgeColor = "bg-blue-50 text-[#003399]";
                  else if (ini === "O") badgeColor = "bg-teal-50 text-[#0ea5a6]";
                  else if (ini === "D") badgeColor = "bg-amber-50 text-[#f59e0b]";
                  else if (ini === "P") badgeColor = "bg-red-50 text-[#ef4444]";
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-slate-700">{item.urutan}</td>
                      <td className="px-6 py-4 text-center">
                        {item.inisial.startsWith("http") || item.inisial.startsWith("/") ? (
                          <img src={item.inisial} alt={item.jabatan} className="w-8 h-8 rounded-full mx-auto object-cover border border-slate-200" />
                        ) : (
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs uppercase ${badgeColor}`}>
                            {item.inisial}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">{item.jabatan}</td>
                      <td className="px-6 py-4 text-slate-650">{item.nama || "-"}</td>
                      <td className="px-6 py-4 text-slate-450 text-xs hidden md:table-cell max-w-xs truncate" title={item.deskripsi}>
                        {item.deskripsi || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                            title="Edit Jabatan"
                          >
                            <Edit2 size={16} />
                          </button>
                          {isAdmin() && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors"
                              title="Hapus Jabatan"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Input / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6 animate-in fade-in zoom-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                {editingItem ? "Edit Jabatan" : "Tambah Jabatan Baru"}
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Lengkapi bidang formulir berikut.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200/50 rounded-xl p-3.5 flex gap-2.5 text-red-700 text-xs font-semibold">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Row: Jabatan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nama Jabatan *</label>
                <Input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Contoh: Seksi Observasi"
                  required
                />
              </div>

              {/* Row: Nama */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nama Pejabat (Opsional)</label>
                <Input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Drs. Achmad Yani"
                />
              </div>

              {/* Grid: Inisial/Foto & Urutan */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Foto atau Inisial *</label>
                  <div className="flex gap-2 items-center">
                    {inisial.startsWith("http") || inisial.startsWith("/") ? (
                      <div className="relative w-10 h-10 shrink-0 rounded-full overflow-hidden border border-slate-200">
                        <img src={inisial} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <Input
                      type="text"
                      value={inisial}
                      onChange={(e) => setInisial(e.target.value)}
                      placeholder="URL Foto atau Inisial (ex: O)"
                      required
                    />
                    <label className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      {uploading ? <Loader2 size={16} className="animate-spin text-slate-500" /> : <Plus size={16} className="text-slate-500" />}
                      <input type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
                    </label>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Urutan Hirarki *</label>
                  <Input
                    type="number"
                    min={1}
                    value={urutan}
                    onChange={(e) => setUrutan(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              {/* Row: Deskripsi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Deskripsi Tugas (Opsional)</label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Deskripsikan peran atau tugas dari seksi/pejabat ini..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003399] min-h-[80px]"
                />
              </div>

              {/* Actions row */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitLoading}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2.5 bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
