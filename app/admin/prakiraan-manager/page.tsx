"use client";

import { useState, useEffect } from "react";
import { Upload, X, Edit3, Trash2, Plus, Calendar, Clock, AlertCircle, ChevronDown, ChevronRight, Image, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
}

interface PrakiraanItem {
  id: string;
  title: string;
  slug?: string;
  url: string;
  explanation: string;
  waktu_mulai?: string;
  waktu_berakhir?: string;
  created_at?: string;
  uploader?: string;
  category_id?: string;
  category?: Category | null;
  next_url?: string;
  next_explanation?: string;
  next_waktu_mulai?: string;
  next_waktu_berakhir?: string;
  display_type?: string;
  gallery_images?: string[];
}

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

const formatToDateOnly = (isoString?: string) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  } catch { return ""; }
};

const dateToEndOfDayISO = (dateStr: string) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr + "T23:59:59");
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch { return null; }
};

const dateToStartOfDayISO = (dateStr: string) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr + "T00:00:00");
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch { return null; }
};

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function PrakiraanManager() {
  const [items, setItems] = useState<PrakiraanItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNextSection, setShowNextSection] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);

  // Category management
  const [catForm, setCatForm] = useState<{ id?: string; name: string; description: string; icon: string }>({ name: "", description: "", icon: "Sun" });
  const [showCatForm, setShowCatForm] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingEntry, setEditingEntry] = useState<{
    id?: string;
    title: string;
    slug: string;
    url: string;
    explanation: string;
    waktu_mulai?: string;
    waktu_berakhir?: string;
    file?: File;
    category_id?: string;
    next_url?: string;
    next_explanation?: string;
    next_waktu_mulai?: string;
    next_waktu_berakhir?: string;
    nextFile?: File;
    display_type?: string;
    gallery_images?: string[];
    galleryFiles?: File[];
  } | null>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/prakiraan-images");
      const b = await res.json();
      if (b?.success) setItems(b.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/prakiraan-categories");
      const b = await res.json();
      if (b?.success) setCategories(b.data || []);
    } catch {}
  };

  useEffect(() => {
    Promise.all([fetchItems(), fetchCategories()]);
  }, []);

  // ─── CATEGORY MANAGEMENT ─────────────────────────────────

  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) { alert("Nama kategori harus diisi"); return; }
    try {
      if (catForm.id) {
        const res = await fetch(`/api/admin/prakiraan-categories/${catForm.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: catForm.name, description: catForm.description, icon: catForm.icon }),
        });
        const json = await res.json();
        if (json?.success) {
          fetchCategories();
          setShowCatForm(false);
          setCatForm({ name: "", description: "", icon: "Sun" });
        } else { alert(json?.message || "Gagal"); }
      } else {
        const res = await fetch("/api/admin/prakiraan-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: catForm.name, description: catForm.description, icon: catForm.icon }),
        });
        const json = await res.json();
        if (json?.success) {
          fetchCategories();
          setShowCatForm(false);
          setCatForm({ name: "", description: "", icon: "Sun" });
        } else { alert(json?.message || "Gagal"); }
      }
    } catch (e) { alert("Error"); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Hapus kategori? Kartu prakiraan dengan kategori ini akan menjadi tidak berkategori.")) return;
    try {
      const res = await fetch(`/api/admin/prakiraan-categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json?.success) fetchCategories();
      else alert("Gagal");
    } catch {}
  };

  // ─── PRAKIRAAN CRUD ─────────────────────────────────────

  const handleOpenAdd = () => {
    setModalMode("add");
    setShowNextSection(false);
    setEditingEntry({
      title: "",
      slug: "",
      url: "",
      explanation: "",
      waktu_mulai: "",
      waktu_berakhir: "",
      category_id: "",
      next_url: "",
      next_explanation: "",
      next_waktu_mulai: "",
      next_waktu_berakhir: "",
      display_type: "gambar_saja",
      gallery_images: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PrakiraanItem) => {
    setModalMode("edit");
    setShowNextSection(!!item.next_url);
    setEditingEntry({
      id: item.id,
      title: item.title,
      slug: item.slug || "",
      url: item.url,
      explanation: item.explanation || "",
      waktu_mulai: item.waktu_mulai ? formatToDateOnly(item.waktu_mulai) : "",
      waktu_berakhir: item.waktu_berakhir ? formatToDateOnly(item.waktu_berakhir) : "",
      category_id: item.category_id || "",
      next_url: item.next_url || "",
      next_explanation: item.next_explanation || "",
      next_waktu_mulai: item.next_waktu_mulai ? formatToDateOnly(item.next_waktu_mulai) : "",
      next_waktu_berakhir: item.next_waktu_berakhir ? formatToDateOnly(item.next_waktu_berakhir) : "",
      display_type: item.display_type || "gambar_saja",
      gallery_images: item.gallery_images || [],
    });
    setIsModalOpen(true);
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kartu prakiraan ini?")) return;
    try {
      const res = await fetch(`/api/admin/prakiraan-images/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data?.success) setItems((prev) => prev.filter((item) => item.id !== id));
      else alert("Gagal menghapus kartu");
    } catch (e) { console.error(e); }
  };

  const handleModalSave = async () => {
    if (!editingEntry) return;
    if (!editingEntry.title.trim()) { alert("Judul kartu harus diisi"); return; }
    if (modalMode === "add" && !editingEntry.file) { alert("Silakan pilih/unggah gambar kartu terlebih dahulu"); return; }

    setSaving(true);
    try {
      let username = "admin";
      try {
        const token = typeof window !== "undefined" ? sessionStorage.getItem("adminToken") : null;
        if (token) username = atob(token).split(":")[0] || "admin";
      } catch {}

      const finalSlug = editingEntry.slug || slugify(editingEntry.title);

      if (modalMode === "add" && editingEntry.file) {
        const form = new FormData();
        form.append("file", editingEntry.file);
        form.append("title", editingEntry.title);
        form.append("slug", finalSlug);
        form.append("explanation", editingEntry.explanation);
        form.append("uploader", username);
        form.append("display_type", editingEntry.display_type || "gambar_saja");
        if (editingEntry.category_id) form.append("category_id", editingEntry.category_id);
        if (editingEntry.waktu_berakhir) form.append("waktu_berakhir", dateToEndOfDayISO(editingEntry.waktu_berakhir) || "");
        if (editingEntry.waktu_mulai) form.append("waktu_mulai", dateToStartOfDayISO(editingEntry.waktu_mulai) || "");
        if (editingEntry.nextFile) form.append("nextFile", editingEntry.nextFile);
        if (editingEntry.next_explanation) form.append("next_explanation", editingEntry.next_explanation);
        if (editingEntry.next_waktu_mulai) form.append("next_waktu_mulai", dateToStartOfDayISO(editingEntry.next_waktu_mulai) || "");
        if (editingEntry.next_waktu_berakhir) form.append("next_waktu_berakhir", dateToEndOfDayISO(editingEntry.next_waktu_berakhir) || "");

        // Upload gallery images
        if (editingEntry.galleryFiles && editingEntry.galleryFiles.length > 0) {
          const galleryUrls: string[] = [];
          for (const gf of editingEntry.galleryFiles) {
            const gfForm = new FormData();
            gfForm.append("file", gf);
            gfForm.append("title", editingEntry.title + " (gallery)");
            const upRes = await fetch("/api/admin/prakiraan-images", { method: "POST", body: gfForm });
            const upJson = await upRes.json();
            if (upJson?.success && upJson.data?.url) {
              await fetch(`/api/admin/prakiraan-images/${upJson.data.id}`, { method: "DELETE" });
              galleryUrls.push(upJson.data.url);
            }
          }
          form.append("gallery_images", JSON.stringify([...(editingEntry.gallery_images || []), ...galleryUrls]));
        } else if (editingEntry.gallery_images && editingEntry.gallery_images.length > 0) {
          form.append("gallery_images", JSON.stringify(editingEntry.gallery_images));
        }

        const res = await fetch("/api/admin/prakiraan-images", { method: "POST", body: form });
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
        let finalNextUrl = editingEntry.next_url;

        const uploadTempImage = async (file: File): Promise<string> => {
          const form = new FormData();
          form.append("file", file);
          form.append("title", editingEntry.title + " (temp)");
          const uploadRes = await fetch("/api/admin/prakiraan-images", { method: "POST", body: form });
          const uploadBody = await uploadRes.json();
          if (uploadBody?.success && uploadBody.data?.url) {
            await fetch(`/api/admin/prakiraan-images/${uploadBody.data.id}`, { method: "DELETE" });
            return uploadBody.data.url;
          }
          throw new Error("Gagal mengunggah gambar");
        };

        if (editingEntry.file) finalUrl = await uploadTempImage(editingEntry.file);
        if (editingEntry.nextFile) finalNextUrl = await uploadTempImage(editingEntry.nextFile);

        // Upload new gallery files
        let finalGallery = [...(editingEntry.gallery_images || [])];
        if (editingEntry.galleryFiles && editingEntry.galleryFiles.length > 0) {
          for (const gf of editingEntry.galleryFiles) {
            const url = await uploadTempImage(gf);
            finalGallery.push(url);
          }
        }

        const patchPayload: any = {
          title: editingEntry.title,
          slug: finalSlug,
          url: finalUrl,
          explanation: editingEntry.explanation,
          waktu_mulai: editingEntry.waktu_mulai ? dateToStartOfDayISO(editingEntry.waktu_mulai) : null,
          waktu_berakhir: editingEntry.waktu_berakhir ? dateToEndOfDayISO(editingEntry.waktu_berakhir) : null,
          display_type: editingEntry.display_type || "gambar_saja",
          uploader: username,
          category_id: editingEntry.category_id || null,
          gallery_images: finalGallery,
        };
        if (finalNextUrl !== undefined) patchPayload.next_url = finalNextUrl;
        if (editingEntry.next_explanation !== undefined) patchPayload.next_explanation = editingEntry.next_explanation;
        if (editingEntry.next_waktu_mulai) patchPayload.next_waktu_mulai = dateToStartOfDayISO(editingEntry.next_waktu_mulai);
        else patchPayload.next_waktu_mulai = null;
        if (editingEntry.next_waktu_berakhir) patchPayload.next_waktu_berakhir = dateToEndOfDayISO(editingEntry.next_waktu_berakhir);
        else patchPayload.next_waktu_berakhir = null;

        const res = await fetch(`/api/admin/prakiraan-images/${editingEntry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchPayload),
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
    } finally { setSaving(false); }
  };

  // ─── RENDER ────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Prakiraan</h1>
          <p className="text-gray-500 mt-2">Atur kartu prakiraan cuaca dan kategori.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowCatManager(true); fetchCategories(); }}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-semibold transition-all text-sm"
          >
            <FolderOpen size={16} /> Kelola Kategori
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-[#003399] hover:bg-[#0044cc] text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all"
          >
            <Plus size={18} /> Tambah Kartu Baru
          </button>
        </div>
      </div>

      {/* Auto-Switch Bar */}
      <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Auto-Switch Prakiraan</p>
            <p className="text-xs text-gray-500">Konten yang sudah kadaluwarsa dan memiliki jadwal berikutnya akan otomatis dipromosikan.</p>
          </div>
        </div>
        <button
          onClick={async () => {
            if (!confirm("Jalankan auto-switch? Konten expired dengan jadwal berikutnya akan dipromosikan.")) return;
            try {
              const res = await fetch("/api/admin/prakiraan-images/auto-switch", { method: "POST" });
              const json = await res.json();
              alert(json.message || "Selesai");
              fetchItems();
            } catch { alert("Gagal menjalankan auto-switch"); }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl transition-colors text-xs border border-blue-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/></svg>
          Jalankan Auto-Switch
        </button>
      </div>

      {/* Cards List */}
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
              const now = new Date();
              const isExpired = item.waktu_berakhir && new Date(item.waktu_berakhir) < now;
              const isScheduled = item.waktu_mulai && new Date(item.waktu_mulai) > now;
              const isActive = !isExpired && !isScheduled;
              const daysUntilStart = isScheduled && item.waktu_mulai
                ? Math.ceil((new Date(item.waktu_mulai).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
              const daysUntilExpiry = !isExpired && item.waktu_berakhir
                ? Math.ceil((new Date(item.waktu_berakhir).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
              const galCount = item.gallery_images?.length || 0;

              return (
                <div key={item.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-lg transition-all group ${
                  isScheduled ? "border-amber-200 ring-1 ring-amber-100" :
                  isExpired ? "border-red-200 opacity-75" : "border-gray-200"
                }`}>
                  {/* Image Preview */}
                  <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                    <img src={item.url} className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isExpired ? "grayscale" : ""}`} alt={item.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {isExpired && <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />Kadaluwarsa</span>}
                      {isScheduled && !isExpired && <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />Terjadwal</span>}
                      {isActive && <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />Aktif</span>}
                    </div>

                    {/* Category badge */}
                    {item.category && (
                      <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                        {item.category.name}
                      </div>
                    )}

                    {/* Gallery indicator */}
                    {galCount > 0 && (
                      <div className="absolute top-10 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Image size={10} /> {galCount + 1}
                      </div>
                    )}

                    {/* Slug badge */}
                    {item.slug && (
                      <div className="absolute bottom-1 left-3">
                        <span className="bg-black/40 backdrop-blur-sm text-white/70 text-[9px] px-2 py-0.5 rounded-full font-mono">
                          /prakiraan/{item.slug}
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-1">
                      <h3 className="font-bold text-white text-sm line-clamp-1 drop-shadow">{item.title}</h3>
                      <p className="text-white/70 text-[10px] mt-0.5">oleh {item.uploader || "admin"}</p>
                    </div>
                  </div>

                  {/* Info Body */}
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div className={`rounded-xl p-3 flex flex-col gap-2 text-xs ${
                      isScheduled ? "bg-amber-50 border border-amber-100" :
                      isExpired ? "bg-red-50 border border-red-100" :
                      "bg-emerald-50 border border-emerald-100"
                    }`}>
                      <p className={`font-bold uppercase tracking-wide text-[10px] ${
                        isScheduled ? "text-amber-700" : isExpired ? "text-red-700" : "text-emerald-700"
                      }`}>
                        {isScheduled ? "Jadwal Tayang" : isExpired ? "Sudah Berakhir" : "Sedang Tayang"}
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {item.waktu_mulai && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 flex items-center gap-1"><Calendar size={10} /> Mulai</span>
                            <span className={`font-semibold ${isScheduled ? "text-amber-700" : "text-gray-700"}`}>
                              {new Date(item.waktu_mulai).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        )}
                        {isScheduled && daysUntilStart !== null && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-[10px]">Mulai dalam</span>
                            <span className="text-amber-600 font-bold text-[11px]">{daysUntilStart === 0 ? "Hari Ini" : `${daysUntilStart} hari`}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 flex items-center gap-1"><Clock size={10} /> Berakhir</span>
                          {item.waktu_berakhir ? (
                            <span className={`font-semibold ${isExpired ? "text-red-600" : "text-gray-700"}`}>
                              {new Date(item.waktu_berakhir).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          ) : <span className="text-gray-400 italic text-[10px]">Tidak terbatas</span>}
                        </div>
                        {isActive && daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
                          <div className="mt-1">
                            <div className="flex justify-between text-[10px] text-orange-600 font-medium mb-1">
                              <span>Sisa waktu tayang</span>
                              <span>{daysUntilExpiry} hari</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${Math.max(5, (daysUntilExpiry / 7) * 100)}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {item.explanation && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Penjelasan</p>
                        <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                          {item.explanation.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ')}
                        </p>
                      </div>
                    )}

                    {item.next_url && isExpired && (
                      <div className="rounded-xl p-3 border border-amber-200 bg-amber-50">
                        <p className="font-bold uppercase tracking-wide text-[10px] text-amber-700 mb-1 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/></svg>
                          Siap Auto-Switch
                        </p>
                        <p className="text-[10px] text-amber-600">Konten berikutnya sudah siap, jalankan Auto-Switch untuk mempromosikan.</p>
                      </div>
                    )}

                    {item.next_url && (
                      <div className="rounded-xl p-3 border border-dashed border-blue-200 bg-blue-50/50">
                        <p className="font-bold uppercase tracking-wide text-[10px] text-blue-700 mb-2">Prakiraan Berikutnya</p>
                        <div className="flex gap-2 mb-2">
                          <img src={item.next_url} alt="Next" className="w-16 h-12 rounded-lg object-cover border border-blue-100 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            {item.next_waktu_mulai && <p className="text-[10px] text-gray-500 flex items-center gap-1"><Calendar size={9} /> Mulai: {new Date(item.next_waktu_mulai).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</p>}
                            {item.next_waktu_berakhir && <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5"><Clock size={9} /> Berakhir: {new Date(item.next_waktu_berakhir).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 px-4 pb-4">
                    <button onClick={() => handleOpenEdit(item)} className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 border border-blue-100 rounded-xl text-[#003399] hover:bg-blue-50/70 font-semibold transition-colors">
                      <Edit3 size={12} /> Edit Kartu
                    </button>
                    {isAdmin() && (
                      <button onClick={() => deleteEntry(item.id)} className="flex items-center justify-center px-3 py-2 border border-red-100 rounded-xl text-red-600 hover:bg-red-50/70 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── CATEGORY MANAGER MODAL ─────────────────────────── */}
      {showCatManager && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => { if (!saving) setShowCatManager(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Kelola Kategori Prakiraan</h2>
              <button onClick={() => { setShowCatManager(false); setShowCatForm(false); }} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1 max-h-[calc(90vh-140px)]">
              {/* Add Category Button */}
              <button
                onClick={() => { setCatForm({ name: "", description: "", icon: "Sun" }); setShowCatForm(true); }}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 hover:border-[#003399] rounded-xl text-gray-500 hover:text-[#003399] hover:bg-blue-50/30 transition-all text-sm font-semibold"
              >
                <Plus size={16} /> Tambah Kategori Baru
              </button>

              {/* Category Form */}
              {showCatForm && (
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-3">
                  <Input
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                    placeholder="Nama kategori (contoh: Kota Tegal)"
                  />
                  <Input
                    value={catForm.description}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                    placeholder="Deskripsi kategori (opsional)"
                  />
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Icon</label>
                    <select
                      value={catForm.icon}
                      onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 p-2.5 text-sm bg-white"
                    >
                      <option value="Sun">Sun (Default)</option>
                      <option value="MapPin">MapPin (Kota)</option>
                      <option value="Anchor">Anchor (Pelabuhan)</option>
                      <option value="Waves">Waves (Maritim)</option>
                      <option value="TrendingUp">TrendingUp (Pasang Surut)</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowCatForm(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
                    <button onClick={handleSaveCategory} className="flex-1 py-2 bg-[#003399] text-white rounded-xl text-sm font-semibold hover:bg-[#0044cc]">{catForm.id ? "Simpan" : "Tambah"}</button>
                  </div>
                </div>
              )}

              {/* Categories List */}
              {categories.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">Belum ada kategori.</div>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-white transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                          <FolderOpen size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">/prakiraan?kategori={cat.slug}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setCatForm({ id: cat.id, name: cat.name, description: cat.description || "", icon: cat.icon });
                            setShowCatForm(true);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD/EDIT MODAL ─────────────────────────────────── */}
      {isModalOpen && editingEntry && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => { if (!saving) { setIsModalOpen(false); setEditingEntry(null); } }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === "add" ? "Tambah Kartu Prakiraan Baru" : "Edit Kartu Prakiraan"}
              </h2>
              {!saving && (
                <button onClick={() => { setIsModalOpen(false); setEditingEntry(null); }} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Kategori</label>
                <select
                  value={editingEntry.category_id || ""}
                  onChange={(e) => setEditingEntry({ ...editingEntry, category_id: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-900"
                  disabled={saving}
                >
                  <option value="">Tanpa Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Judul Kartu Prakiraan</label>
                <Input
                  value={editingEntry.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setEditingEntry({
                      ...editingEntry,
                      title,
                      slug: modalMode === "add" && !editingEntry.slug ? slugify(title) : editingEntry.slug,
                    });
                  }}
                  placeholder="Contoh: Prakiraan Cuaca Pelabuhan Tegal"
                  disabled={saving}
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Slug (URL)</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono whitespace-nowrap">/prakiraan/</span>
                  <Input
                    value={editingEntry.slug}
                    onChange={(e) => setEditingEntry({ ...editingEntry, slug: slugify(e.target.value) })}
                    placeholder="contoh: prakiraan-cuaca-tegal"
                    disabled={saving}
                    className="font-mono text-sm"
                  />
                </div>
                <p className="text-[11px] text-gray-400">URL yang akan digunakan untuk halaman detail prakiraan ini. Otomatis dibuat dari judul.</p>
              </div>

              {/* Main Image Upload */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Gambar Utama</label>
                <div className="flex items-center gap-4">
                  {editingEntry.url && (
                    <div className="w-24 h-16 rounded-lg overflow-hidden border bg-gray-100 shrink-0">
                      <img src={editingEntry.url} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 hover:border-[#003399] rounded-xl hover:bg-blue-50/10 cursor-pointer transition-all duration-200">
                    <Upload size={16} className="text-gray-400" />
                    <span className="text-xs text-gray-600 font-semibold">{editingEntry.file ? editingEntry.file.name : "Pilih Gambar (Image)"}</span>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setEditingEntry({ ...editingEntry, file, url: URL.createObjectURL(file) });
                    }} disabled={saving} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Gallery Images Upload */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Foto Tambahan (Galeri)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(editingEntry.gallery_images || []).map((img, idx) => (
                    <div key={idx} className="relative w-16 h-12 rounded-lg overflow-hidden border bg-gray-100 group">
                      <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                      <button
                        onClick={() => {
                          const newGal = [...(editingEntry.gallery_images || [])];
                          newGal.splice(idx, 1);
                          setEditingEntry({ ...editingEntry, gallery_images: newGal });
                        }}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} className="text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-12 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#003399] flex items-center justify-center cursor-pointer hover:bg-blue-50/10 transition-all">
                    <Plus size={16} className="text-gray-400" />
                    <input type="file" accept="image/*" className="hidden" disabled={saving}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditingEntry({
                            ...editingEntry,
                            galleryFiles: [...(editingEntry.galleryFiles || []), file],
                            gallery_images: [...(editingEntry.gallery_images || []), URL.createObjectURL(file)],
                          });
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-gray-400">Tambahkan beberapa foto untuk ditampilkan sebagai galeri di halaman detail.</p>
              </div>

              {/* Display Type */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Mode Tampilan</label>
                <select
                  value={editingEntry.display_type || "gambar_saja"}
                  onChange={(e) => setEditingEntry({ ...editingEntry, display_type: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-900"
                  disabled={saving}
                >
                  <option value="gambar_saja">Gambar Saja</option>
                  <option value="gambar_teks">Gambar + Teks</option>
                  <option value="gambar_galeri">Gambar + Galeri</option>
                </select>
              </div>

              {/* Explanation */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Penjelasan Cuaca Detail</label>
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                  <ReactQuill
                    theme="snow"
                    value={editingEntry.explanation}
                    onChange={(content) => setEditingEntry({ ...editingEntry, explanation: content })}
                    placeholder="Tuliskan informasi penjelasan detail..."
                    readOnly={saving}
                    className="min-h-[150px] quill-editor"
                    modules={{ toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'ordered' }, { 'list': 'bullet' }], ['clean']] }}
                  />
                </div>
                <style jsx global>{`
                  .quill-editor .ql-editor { min-height: 150px; font-size: 0.875rem; line-height: 1.625; }
                  .quill-editor .ql-toolbar { border-top: none !important; border-left: none !important; border-right: none !important; border-bottom: 1px solid #e5e7eb !important; background-color: #f9fafb; }
                  .quill-editor .ql-container { border: none !important; }
                `}</style>
              </div>

              {/* Start Date */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Tanggal Mulai Tayang</label>
                <input type="date" value={editingEntry.waktu_mulai || ""} onChange={(e) => setEditingEntry({ ...editingEntry, waktu_mulai: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-900" disabled={saving} />
                <p className="text-[11px] text-gray-400">Kosongkan jika langsung tampil.</p>
              </div>

              {/* End Date */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Tanggal Berakhir</label>
                <input type="date" value={editingEntry.waktu_berakhir || ""} onChange={(e) => setEditingEntry({ ...editingEntry, waktu_berakhir: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-900" disabled={saving} />
                <p className="text-[11px] text-gray-400">Kosongkan jika tidak berdurasi.</p>
              </div>

              {/* Next Forecast Toggle */}
              <div className="border-t border-gray-100 pt-4">
                <button type="button" onClick={() => setShowNextSection(!showNextSection)} className="flex items-center justify-between w-full text-left">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Prakiraan Berikutnya</p>
                    <p className="text-[11px] text-gray-400">Tambah jadwal prakiraan cuaca untuk periode selanjutnya</p>
                  </div>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${showNextSection ? "rotate-180" : ""}`} />
                </button>
              </div>

              {showNextSection && (
                <div className="space-y-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">Informasi Prakiraan Berikutnya</p>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Gambar Prakiraan Berikutnya</label>
                    <div className="flex items-center gap-4">
                      {editingEntry.next_url && <div className="w-24 h-16 rounded-lg overflow-hidden border bg-gray-100 shrink-0"><img src={editingEntry.next_url} className="w-full h-full object-cover" alt="Next Preview" /></div>}
                      <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 hover:border-[#003399] rounded-xl hover:bg-blue-50/10 cursor-pointer transition-all duration-200">
                        <Upload size={16} className="text-gray-400" />
                        <span className="text-xs text-gray-600 font-semibold">{editingEntry.nextFile ? editingEntry.nextFile.name : "Pilih Gambar"}</span>
                        <input type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setEditingEntry({ ...editingEntry, nextFile: file, next_url: URL.createObjectURL(file) });
                        }} disabled={saving} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Penjelasan Prakiraan Berikutnya</label>
                    <div className="bg-white rounded-xl overflow-hidden border border-blue-200">
                      <ReactQuill theme="snow" value={editingEntry.next_explanation || ""} onChange={(content) => setEditingEntry({ ...editingEntry, next_explanation: content })}
                        placeholder="Tuliskan informasi penjelasan detail untuk prakiraan berikutnya..." readOnly={saving}
                        className="min-h-[120px] quill-editor" modules={{ toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'ordered' }, { 'list': 'bullet' }], ['clean']] }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Tanggal Mulai Tayang (Berikutnya)</label>
                    <input type="date" value={editingEntry.next_waktu_mulai || ""} onChange={(e) => setEditingEntry({ ...editingEntry, next_waktu_mulai: e.target.value })}
                      className="w-full rounded-xl border border-blue-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-900" disabled={saving} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Tanggal Berakhir (Berikutnya)</label>
                    <input type="date" value={editingEntry.next_waktu_berakhir || ""} onChange={(e) => setEditingEntry({ ...editingEntry, next_waktu_berakhir: e.target.value })}
                      className="w-full rounded-xl border border-blue-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-900" disabled={saving} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              <button type="button" onClick={() => { setIsModalOpen(false); setEditingEntry(null); }} disabled={saving}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                Batal
              </button>
              <button type="button" onClick={handleModalSave} disabled={saving}
                className="flex-1 px-4 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-1.5">
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
