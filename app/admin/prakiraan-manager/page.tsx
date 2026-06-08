"use client";

import { useState, useEffect } from "react";
import { Upload, X, Edit3, Trash2, Check, Plus, Calendar, Clock, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface PrakiraanItem {
  id: string;
  title: string;
  url: string;
  explanation: string;
  waktu_berakhir?: string;
  created_at?: string;
  uploader?: string;
}

const formatToDateOnly = (isoString?: string) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  } catch (e) {
    return "";
  }
};

// Convert a YYYY-MM-DD string to end-of-day ISO string (23:59:59)
const dateToEndOfDayISO = (dateStr: string) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr + "T23:59:59");
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
};


export default function PrakiraanManager() {
  const [items, setItems] = useState<PrakiraanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal Editor States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingEntry, setEditingEntry] = useState<{
    id?: string;
    title: string;
    url: string;
    explanation: string;
    waktu_berakhir?: string;
    file?: File;
  } | null>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/prakiraan-images");
      const b = await res.json();
      if (b?.success) {
        setItems(b.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch prakiraan items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenAdd = () => {
    setModalMode("add");
    setEditingEntry({
      title: "",
      url: "",
      explanation: "",
      waktu_berakhir: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PrakiraanItem) => {
    setModalMode("edit");
    setEditingEntry({
      id: item.id,
      title: item.title,
      url: item.url,
      explanation: item.explanation || "",
      waktu_berakhir: item.waktu_berakhir ? formatToDateOnly(item.waktu_berakhir) : "",
    });
    setIsModalOpen(true);
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kartu prakiraan ini?")) return;
    try {
      const res = await fetch(`/api/admin/prakiraan-images/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data?.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Gagal menghapus kartu");
      }
    } catch (e) {
      console.error("deleteEntry error", e);
    }
  };

  const handleModalSave = async () => {
    if (!editingEntry) return;
    if (!editingEntry.title.trim()) {
      alert("Judul kartu harus diisi");
      return;
    }
    if (modalMode === "add" && !editingEntry.file) {
      alert("Silakan pilih/unggah gambar kartu terlebih dahulu");
      return;
    }

    setSaving(true);
    try {
      let username = "admin";
      try {
        const token = typeof window !== "undefined" ? sessionStorage.getItem("adminToken") : null;
        if (token) {
          username = atob(token).split(":")[0] || "admin";
        }
      } catch (e) { }

      if (modalMode === "add" && editingEntry.file) {
        // Upload new file and create card
        const form = new FormData();
        form.append("file", editingEntry.file);
        form.append("title", editingEntry.title);
        form.append("explanation", editingEntry.explanation);
        form.append("uploader", username);
        if (editingEntry.waktu_berakhir) {
          form.append("waktu_berakhir", dateToEndOfDayISO(editingEntry.waktu_berakhir) || "");
        }

        const res = await fetch("/api/admin/prakiraan-images", {
          method: "POST",
          body: form,
        });
        const body = await res.json();
        if (body?.success) {
          alert("Berhasil menambahkan kartu prakiraan baru");
          fetchItems();
          setIsModalOpen(false);
          setEditingEntry(null);
        } else {
          alert("Gagal menambahkan kartu: " + (body?.message || "Error"));
        }
      } else if (modalMode === "edit" && editingEntry.id) {
        let finalUrl = editingEntry.url;

        // If a new file was chosen during edit, upload it first
        if (editingEntry.file) {
          const form = new FormData();
          form.append("file", editingEntry.file);
          form.append("title", editingEntry.title + " (temp)");
          const uploadRes = await fetch("/api/admin/prakiraan-images", {
            method: "POST",
            body: form,
          });
          const uploadBody = await uploadRes.json();
          if (uploadBody?.success && uploadBody.data?.url) {
            finalUrl = uploadBody.data.url;
            // Clean up the temporary row created by upload
            await fetch(`/api/admin/prakiraan-images/${uploadBody.data.id}`, { method: "DELETE" });
          } else {
            throw new Error("Gagal mengunggah gambar baru");
          }
        }

        // Update existing entry
        const res = await fetch(`/api/admin/prakiraan-images/${editingEntry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editingEntry.title,
            url: finalUrl,
            explanation: editingEntry.explanation,
            waktu_berakhir: editingEntry.waktu_berakhir ? dateToEndOfDayISO(editingEntry.waktu_berakhir) : null,
            uploader: username,
          }),
        });
        const body = await res.json();
        if (body?.success) {
          alert("Berhasil memperbarui kartu prakiraan");
          fetchItems();
          setIsModalOpen(false);
          setEditingEntry(null);
        } else {
          alert("Gagal memperbarui kartu: " + (body?.message || "Error"));
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Terjadi kesalahan saat menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Prakiraan</h1>
          <p className="text-gray-500 mt-2">Atur kartu prakiraan cuaca dinamis yang tampil di halaman depan.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-[#003399] hover:bg-[#0044cc] text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus size={18} /> Tambah Kartu Baru
        </button>
      </div>

      {/* Cards List Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Daftar Kartu Prakiraan Cuaca</h2>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-[#003399] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl bg-gray-50">
            <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500 text-sm">Belum ada kartu prakiraan cuaca yang ditambahkan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const isExpired = item.waktu_berakhir && new Date(item.waktu_berakhir) < new Date();
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="w-full h-40 overflow-hidden bg-gray-100 relative">
                      <img src={item.url} className="w-full h-full object-cover" alt={item.title} />
                      {isExpired && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                          Kadaluwarsa
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Uploader: {item.uploader || "admin"}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Penjelasan</p>
                        <p className="text-gray-700 text-xs leading-relaxed line-clamp-3 mt-0.5">
                          {item.explanation ? item.explanation.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : <span className="text-gray-400 italic">Belum ada penjelasan</span>}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {item.waktu_berakhir ? (
                            <span className={isExpired ? "text-red-500 font-medium" : "text-emerald-600 font-medium"}>
                              Exp: {new Date(item.waktu_berakhir).toLocaleDateString("id-ID")}
                            </span>
                          ) : (
                            "Tidak Berakhir"
                          )}
                        </span>
                        {item.waktu_berakhir && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(item.waktu_berakhir).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 p-4 pt-0 border-t border-gray-50 mt-3">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 border border-blue-100 rounded-lg text-[#003399] hover:bg-blue-50/50 font-semibold transition-colors"
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => deleteEntry(item.id)}
                      className="flex items-center justify-center p-2 border border-red-100 rounded-lg text-red-600 hover:bg-red-50/50 transition-colors"
                      title="Hapus kartu"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Editor */}
      {isModalOpen && editingEntry && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => {
            if (!saving) {
              setIsModalOpen(false);
              setEditingEntry(null);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col animate-zoom-in max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === "add" ? "Tambah Kartu Prakiraan Baru" : "Edit Kartu Prakiraan"}
              </h2>
              {!saving && (
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingEntry(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Judul Kartu */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Judul Kartu Prakiraan</label>
                <Input
                  value={editingEntry.title}
                  onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                  placeholder="Contoh: Prakiraan Cuaca Pelabuhan Tegal"
                  disabled={saving}
                />
              </div>

              {/* Upload Gambar */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Unggah Gambar Kartu</label>
                <div className="flex items-center gap-4">
                  {editingEntry.url && (
                    <div className="w-24 h-16 rounded-lg overflow-hidden border bg-gray-100 shrink-0">
                      <img src={editingEntry.url} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 hover:border-[#003399] rounded-xl hover:bg-blue-50/10 cursor-pointer transition-all duration-200">
                    <Upload size={16} className="text-gray-400" />
                    <span className="text-xs text-gray-600 font-semibold">
                      {editingEntry.file ? editingEntry.file.name : "Pilih Gambar (Image)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditingEntry({
                            ...editingEntry,
                            file,
                            url: URL.createObjectURL(file),
                          });
                        }
                      }}
                      disabled={saving}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Penjelasan Textarea */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Penjelasan Cuaca Detail</label>
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                  <ReactQuill
                    theme="snow"
                    value={editingEntry.explanation}
                    onChange={(content) => setEditingEntry({ ...editingEntry, explanation: content })}
                    placeholder="Tuliskan informasi penjelasan detail mengenai kondisi cuaca secara lengkap dan jelas..."
                    readOnly={saving}
                    className="min-h-[150px] quill-editor"
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['clean']
                      ],
                    }}
                  />
                </div>
                <style jsx global>{`
                  .quill-editor .ql-editor {
                    min-height: 150px;
                    font-size: 0.875rem;
                    line-height: 1.625;
                  }
                  .quill-editor .ql-toolbar {
                    border-top: none !important;
                    border-left: none !important;
                    border-right: none !important;
                    border-bottom: 1px solid #e5e7eb !important;
                    background-color: #f9fafb;
                  }
                  .quill-editor .ql-container {
                    border: none !important;
                  }
                `}</style>
              </div>

              {/* Tanggal Berakhir */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Tanggal Berakhir</label>
                <input
                  type="date"
                  value={editingEntry.waktu_berakhir || ""}
                  onChange={(e) => setEditingEntry({ ...editingEntry, waktu_berakhir: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-900"
                  disabled={saving}
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Kartu prakiraan ini akan otomatis disembunyikan dari halaman pengguna setelah tanggal di atas. Kosongkan jika tidak berdurasi.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingEntry(null);
                }}
                disabled={saving}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleModalSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-1.5"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
