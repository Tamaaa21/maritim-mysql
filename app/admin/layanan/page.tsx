"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Edit2, Trash2, Link as LinkIcon, Info, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface LayananCard {
  id: string;
  nama_layanan: string;
  deskripsi: string;
  url_google_form: string | null;
  cover_url: string | null;
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

export default function LayananAdminPage() {
  const [services, setServices] = useState<LayananCard[]>([]);
  const [filtered, setFiltered] = useState<LayananCard[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form Fields
  const [namaLayanan, setNamaLayanan] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [urlGoogleForm, setUrlGoogleForm] = useState("");
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const matched = services.filter(
      (item) =>
        item.nama_layanan.toLowerCase().includes(term) ||
        (item.deskripsi && item.deskripsi.toLowerCase().includes(term))
    );
    setFiltered(matched);
  }, [search, services]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/layanan-cards");
      const json = await res.json();
      if (json?.success) {
        setServices(json.data || []);
        setFiltered(json.data || []);
      }
    } catch (e) {
      console.error("Error fetching services:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedId(null);
    setNamaLayanan("");
    setDeskripsi("");
    setUrlGoogleForm("");
    setCoverFile(null);
    setCoverPreview("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc: LayananCard) => {
    setModalMode("edit");
    setSelectedId(svc.id);
    setNamaLayanan(svc.nama_layanan);
    setDeskripsi(svc.deskripsi || "");
    setUrlGoogleForm(svc.url_google_form || "");
    setCoverFile(null);
    setCoverPreview(svc.cover_url || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kartu layanan ini?")) return;

    try {
      const res = await fetch(`/api/admin/layanan-cards/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json?.success) {
        setServices(services.filter((s) => s.id !== id));
        alert("Berhasil menghapus layanan");
      } else {
        alert("Gagal menghapus: " + (json?.message || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan saat menghapus");
    }
  };

  const uploadCoverImage = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const json = await res.json();
    if (json?.success && json.url) return json.url;
    throw new Error(json?.message || "Upload cover gagal");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLayanan.trim()) {
      alert("Nama Layanan wajib diisi");
      return;
    }

    setSaving(true);
    try {
      let coverUrl = coverPreview || null;
      if (coverFile) {
        setUploadingCover(true);
        coverUrl = await uploadCoverImage(coverFile);
        setUploadingCover(false);
      }

      if (modalMode === "add") {
        const res = await fetch("/api/admin/layanan-cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama_layanan: namaLayanan,
            deskripsi: deskripsi || null,
            url_google_form: urlGoogleForm || null,
            cover_url: coverUrl,
          }),
        });
        const json = await res.json();
        if (json?.success && json.data) {
          setServices([...services, json.data]);
          setIsModalOpen(false);
          alert("Berhasil menambahkan layanan baru");
        } else {
          alert("Gagal menyimpan: " + (json?.message || "Unknown error"));
        }
      } else {
        const res = await fetch(`/api/admin/layanan-cards/${selectedId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama_layanan: namaLayanan,
            deskripsi: deskripsi,
            url_google_form: urlGoogleForm,
            cover_url: coverUrl,
          }),
        });
        const json = await res.json();
        if (json?.success && json.data) {
          setServices(services.map((s) => (s.id === selectedId ? json.data : s)));
          setIsModalOpen(false);
          alert("Berhasil memperbarui layanan");
        } else {
          alert("Gagal menyimpan: " + (json?.message || "Unknown error"));
        }
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setSaving(false);
      setUploadingCover(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Kartu Layanan</h1>
          <p className="text-gray-500 mt-2">Manajemen kartu layanan yang tampil pada halaman utama pengguna.</p>
        </div>
        {isAdmin() && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm shrink-0"
          >
            <Plus size={18} />
            Tambah Pelayanan
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berdasarkan nama atau deskripsi..."
          className="pl-12 bg-white shadow-sm border-gray-200 focus-visible:ring-[#003399] rounded-xl h-11"
        />
      </div>

      {/* Cards Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-[#003399] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Memuat kartu layanan...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Info className="mx-auto text-gray-400 mb-3" size={36} />
            <p className="font-semibold text-gray-700">Tidak ada layanan ditemukan</p>
            <p className="text-sm text-gray-400 mt-1">Coba gunakan kata kunci pencarian yang lain atau tambahkan layanan baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 md:px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Sampul</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Nama Layanan</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">Deskripsi Singkat</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Tautan Google Form</th>
                  <th className="px-4 md:px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-24 md:w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 md:px-6 py-5 hidden sm:table-cell">
                      {item.cover_url ? (
                        <img src={item.cover_url} alt="Cover" className="w-12 md:w-16 h-8 md:h-10 object-cover rounded" />
                      ) : (
                        <span className="text-gray-400 text-xs italic">Tidak ada</span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-5 text-sm font-semibold text-gray-900 leading-snug">
                      {item.nama_layanan}
                    </td>
                    <td className="px-4 md:px-6 py-5 text-sm text-gray-600 leading-relaxed max-w-md hidden md:table-cell">
                      {item.deskripsi || <span className="text-gray-400 italic">Tidak ada deskripsi</span>}
                    </td>
                    <td className="px-4 md:px-6 py-5 text-sm text-[#003399] hidden lg:table-cell">
                      {item.url_google_form ? (
                        <a
                          href={item.url_google_form}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:underline font-medium"
                        >
                          <LinkIcon size={14} className="shrink-0" />
                          Buka Google Form
                        </a>
                      ) : (
                        <span className="text-red-500 font-medium italic">Belum diset (Menampilkan Alert)</span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 hover:bg-blue-50 text-[#003399] rounded-lg transition-colors"
                          title="Edit Kartu Layanan"
                        >
                          <Edit2 size={18} />
                        </button>
                        {isAdmin() && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Hapus Kartu Layanan"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 relative animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 mb-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === "add" ? "Tambah Kartu Layanan" : "Edit Kartu Layanan"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nama Layanan <span className="text-red-500">*</span>
                </label>
                <Input
                  value={namaLayanan}
                  onChange={(e) => setNamaLayanan(e.target.value)}
                  placeholder="Contoh: Layanan Berbayar (PNBP)"
                  className="rounded-lg border-gray-200 focus-visible:ring-[#003399]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Deskripsi Singkat <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Tulis penjelasan singkat mengenai cakupan layanan ini..."
                  className="rounded-lg border-gray-200 focus-visible:ring-[#003399] min-h-[100px] resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tautan URL Google Form <span className="text-gray-400 text-xs font-normal">(Kosongkan jika belum tersedia)</span>
                </label>
                <Input
                  type="url"
                  value={urlGoogleForm}
                  onChange={(e) => setUrlGoogleForm(e.target.value)}
                  placeholder="https://docs.google.com/forms/d/..."
                  className="rounded-lg border-gray-200 focus-visible:ring-[#003399]"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Jika dikosongkan, pengguna akan melihat pesan pemberitahuan bahwa halaman belum diperbarui saat mengklik kartu.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Gambar Sampul
                </label>
                {coverPreview && (
                  <div className="relative w-full h-32 mb-2 rounded-lg overflow-hidden border">
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setCoverFile(null); setCoverPreview(""); }}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setCoverFile(f);
                      setCoverPreview(URL.createObjectURL(f));
                    }
                  }}
                  className="rounded-lg border-gray-200 focus-visible:ring-[#003399]"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Upload gambar sampul untuk kartu layanan. Ukuran optimal: 600x400px.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 px-4 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-1.5 ${saving ? "opacity-70 pointer-events-none" : ""
                    }`}
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
