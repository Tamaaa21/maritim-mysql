"use client";

import { useState, useEffect } from "react";
import { Upload, X, Edit3, Trash2, Plus, Calendar, Clock, FolderOpen, Search, Eye, CheckCircle2, FileText, ChevronRight, ChevronDown, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { showSuccess, showError, showConfirm } from '@/lib/sweetalert';
import { useAdminUser } from '@/hooks/useAdminUser';
import AdminPagination from '@/components/AdminPagination';
import { csrfFetch } from '@/lib/csrf';
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
  const { isAdmin, user } = useAdminUser();
  const [items, setItems] = useState<PrakiraanItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNextSection, setShowNextSection] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      const res = await csrfFetch("/api/admin/prakiraan-images");
      const b = await res.json();
      if (b?.success) setItems(b.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await csrfFetch("/api/admin/prakiraan-categories");
      const b = await res.json();
      if (b?.success) setCategories(b.data || []);
    } catch { }
  };

  useEffect(() => {
    Promise.all([fetchItems(), fetchCategories()]);
  }, []);

  // ─── CATEGORY MANAGEMENT ─────────────────────────────────

  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) { showError('Validasi Gagal', "Nama kategori harus diisi"); return; }
    try {
      if (catForm.id) {
        const res = await csrfFetch(`/api/admin/prakiraan-categories/${catForm.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: catForm.name, description: catForm.description, icon: catForm.icon }),
        });
        const json = await res.json();
        if (json?.success) {
          fetchCategories(); setShowCatForm(false); setCatForm({ name: "", description: "", icon: "Sun" });
          showSuccess('Berhasil', 'Kategori berhasil diperbarui');
        } else { showError('Gagal', json?.message || "Gagal"); }
      } else {
        const res = await csrfFetch("/api/admin/prakiraan-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: catForm.name, description: catForm.description, icon: catForm.icon }),
        });
        const json = await res.json();
        if (json?.success) {
          fetchCategories(); setShowCatForm(false); setCatForm({ name: "", description: "", icon: "Sun" });
          showSuccess('Berhasil', 'Kategori berhasil ditambahkan');
        } else { showError('Gagal', json?.message || "Gagal"); }
      }
    } catch (e) { showError('Error', "Terjadi kesalahan koneksi"); }
  };

  const handleDeleteCategory = async (id: string) => {
    const confirm = await showConfirm('Hapus Kategori?', "Kartu prakiraan dengan kategori ini akan menjadi tidak berkategori.");
    if (!confirm.isConfirmed) return;
    try {
      const res = await csrfFetch(`/api/admin/prakiraan-categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json?.success) {
        showSuccess('Berhasil Dihapus', 'Kategori telah dihapus.');
        fetchCategories();
      }
      else showError('Gagal Menghapus', "Gagal menghapus kategori");
    } catch { showError('Error', 'Terjadi kesalahan koneksi'); }
  };

  // ─── PRAKIRAAN CRUD ─────────────────────────────────────

  const openModal = (mode: "add" | "edit", item?: PrakiraanItem) => {
    setModalMode(mode);
    setShowNextSection(mode === "edit" ? !!(item?.next_url) : false);
    if (mode === "add") {
      setEditingEntry({
        title: "", slug: "", url: "", explanation: "",
        waktu_mulai: "", waktu_berakhir: "", category_id: "",
        next_url: "", next_explanation: "", next_waktu_mulai: "", next_waktu_berakhir: "",
        display_type: "gambar_saja", gallery_images: [],
      });
    } else if (item) {
      setEditingEntry({
        id: item.id, title: item.title, slug: item.slug || "", url: item.url,
        explanation: item.explanation || "",
        waktu_mulai: item.waktu_mulai ? formatToDateOnly(item.waktu_mulai) : "",
        waktu_berakhir: item.waktu_berakhir ? formatToDateOnly(item.waktu_berakhir) : "",
        category_id: item.category_id || "",
        next_url: item.next_url || "", next_explanation: item.next_explanation || "",
        next_waktu_mulai: item.next_waktu_mulai ? formatToDateOnly(item.next_waktu_mulai) : "",
        next_waktu_berakhir: item.next_waktu_berakhir ? formatToDateOnly(item.next_waktu_berakhir) : "",
        display_type: item.display_type || "gambar_saja",
        gallery_images: Array.isArray(item.gallery_images) ? item.gallery_images : typeof item.gallery_images === 'string' ? (() => { try { return JSON.parse(item.gallery_images as string); } catch { return []; } })() : [],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) { setIsModalOpen(false); setEditingEntry(null); }
  };

  const deleteEntry = async (id: string) => {
    const confirm = await showConfirm('Hapus Prakiraan?', "Apakah Anda yakin ingin menghapus kartu prakiraan ini?");
    if (!confirm.isConfirmed) return;
    try {
      const res = await csrfFetch(`/api/admin/prakiraan-images/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data?.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        showSuccess('Berhasil Dihapus', 'Kartu telah dihapus.');
      }
      else showError('Gagal Menghapus', "Gagal menghapus kartu");
    } catch (e) { console.error(e); showError('Error', 'Terjadi kesalahan koneksi'); }
  };

  const handleModalSave = async () => {
    if (!editingEntry) return;
    if (!editingEntry.title.trim()) { showError('Validasi Gagal', "Judul kartu harus diisi"); return; }
    if (modalMode === "add" && !editingEntry.file) { showError('Validasi Gagal', "Silakan pilih/unggah gambar kartu terlebih dahulu"); return; }

    setSaving(true);
    try {
      const username = user?.username || "admin";

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

        const existingGallery = (Array.isArray(editingEntry.gallery_images) ? editingEntry.gallery_images : []).filter(img => !img.startsWith("blob:"));
        if (editingEntry.galleryFiles && editingEntry.galleryFiles.length > 0) {
          const galleryUrls: string[] = [];
          for (const gf of editingEntry.galleryFiles) {
            const gfForm = new FormData();
            gfForm.append("file", gf);
            gfForm.append("title", editingEntry.title + " (gallery)");
            const upRes = await csrfFetch("/api/admin/prakiraan-images", { method: "POST", body: gfForm });
            const upJson = await upRes.json();
            if (upJson?.success && upJson.data?.url) {
              await csrfFetch(`/api/admin/prakiraan-images/${upJson.data.id}`, { method: "DELETE" });
              galleryUrls.push(upJson.data.url);
            }
          }
          form.append("gallery_images", JSON.stringify([...existingGallery, ...galleryUrls]));
        } else if (existingGallery.length > 0) {
          form.append("gallery_images", JSON.stringify(existingGallery));
        }

        const res = await csrfFetch("/api/admin/prakiraan-images", { method: "POST", body: form });
        const body = await res.json();
        if (body?.success) {
          showSuccess('Berhasil', "Berhasil menambahkan kartu prakiraan baru");
          fetchItems(); closeModal();
        } else {
          showError('Gagal Menyimpan', body?.message || "Error");
        }
      } else if (modalMode === "edit" && editingEntry.id) {
        let finalUrl = editingEntry.url;
        let finalNextUrl = editingEntry.next_url;

        const uploadTempImage = async (file: File): Promise<string> => {
          const form = new FormData();
          form.append("file", file);
          form.append("title", editingEntry.title + " (temp)");
          const uploadRes = await csrfFetch("/api/admin/prakiraan-images", { method: "POST", body: form });
          const uploadBody = await uploadRes.json();
          if (uploadBody?.success && uploadBody.data?.url) {
            await csrfFetch(`/api/admin/prakiraan-images/${uploadBody.data.id}`, { method: "DELETE" });
            return uploadBody.data.url;
          }
          throw new Error("Gagal mengunggah gambar");
        };

        if (editingEntry.file) finalUrl = await uploadTempImage(editingEntry.file);
        if (editingEntry.nextFile) finalNextUrl = await uploadTempImage(editingEntry.nextFile);

        let finalGallery = (Array.isArray(editingEntry.gallery_images) ? editingEntry.gallery_images : []).filter(img => !img.startsWith("blob:"));
        if (editingEntry.galleryFiles && editingEntry.galleryFiles.length > 0) {
          for (const gf of editingEntry.galleryFiles) {
            const url = await uploadTempImage(gf);
            finalGallery.push(url);
          }
        }

        const patchPayload: Record<string, unknown> = {
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
        patchPayload.next_waktu_mulai = editingEntry.next_waktu_mulai ? dateToStartOfDayISO(editingEntry.next_waktu_mulai) : null;
        patchPayload.next_waktu_berakhir = editingEntry.next_waktu_berakhir ? dateToEndOfDayISO(editingEntry.next_waktu_berakhir) : null;

        const res = await csrfFetch(`/api/admin/prakiraan-images/${editingEntry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchPayload),
        });
        const body = await res.json();
        if (body?.success) {
          showSuccess('Berhasil', "Berhasil memperbarui kartu prakiraan");
          fetchItems(); closeModal();
        } else {
          showError('Gagal Memperbarui', body?.message || "Error");
        }
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data";
      showError('Error', message);
    } finally { setSaving(false); }
  };

  // ─── STATUS RESOLVER ─────────────────────────────────────
  const now = new Date();
  const getStatus = (item: PrakiraanItem) => {
    const expired = item.waktu_berakhir && new Date(item.waktu_berakhir) < now;
    const scheduled = item.waktu_mulai && new Date(item.waktu_mulai) > now;
    if (expired) return "expired";
    if (scheduled) return "scheduled";
    return "active";
  };

  // ─── FILTER LOGIC ────────────────────────────────────────
  const filteredItems = items.filter((item) => {
    if (activeCategory && item.category_id !== activeCategory) return false;
    if (selectedStatus) {
      const status = getStatus(item);
      if (selectedStatus === "aktif" && status !== "active") return false;
      if (selectedStatus === "terjadwal" && status !== "scheduled") return false;
      if (selectedStatus === "kedaluwarsa" && status !== "expired") return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!item.title?.toLowerCase().includes(q) && !item.explanation?.toLowerCase().includes(q) && !item.uploader?.toLowerCase().includes(q)) return false;
    }
    if (selectedDate) {
      const selDate = new Date(selectedDate + "T12:00:00");
      if (item.waktu_mulai && new Date(item.waktu_mulai) > selDate) return false;
      if (item.waktu_berakhir && new Date(item.waktu_berakhir) < selDate) return false;
    }
    return true;
  });

  const totalCount = items.length;
  const activeCount = items.filter((i) => getStatus(i) === "active").length;
  const scheduledCount = items.filter((i) => getStatus(i) === "scheduled").length;
  const expiredCount = items.filter((i) => getStatus(i) === "expired").length;

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [filteredItems.length, itemsPerPage, totalPages, currentPage]);

  // ─── RENDER ─────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kelola Prakiraan</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola semua informasi prakiraan yang akan ditampilkan di halaman publik secara otomatis.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => { setShowCatManager(true); fetchCategories(); }}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-semibold transition-all text-sm shadow-sm"
          >
            <FolderOpen size={16} /> Kelola Kategori
          </button>
          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 bg-[#003399] hover:bg-[#002277] text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all text-sm"
          >
            <Plus size={18} /> Tambah Prakiraan
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Prakiraan", value: totalCount, sub: "Semua kategori", icon: <FileText size={20} />, color: "blue" },
          { label: "Aktif", value: activeCount, sub: "Sedang ditampilkan", icon: <CheckCircle2 size={20} />, color: "emerald" },
          { label: "Terjadwal", value: scheduledCount, sub: "Akan tampil", icon: <Clock size={20} />, color: "amber" },
          { label: "Kedaluwarsa", value: expiredCount, sub: "Tidak aktif", icon: <Calendar size={20} />, color: "gray" },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider text-${s.color}-600`}>{s.label}</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{s.value}</p>
              <p className={`text-[10px] text-${s.color}-500 font-medium mt-0.5`}>{s.sub}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center text-${s.color}-600`}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-gray-100 pb-3">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!activeCategory ? "bg-[#003399] text-white shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
          >Semua</button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === cat.id ? "bg-[#003399] text-white shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
            >{cat.name}</button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul prakiraan..."
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399]"
            />
          </div>
          <select value={activeCategory || ""} onChange={(e) => setActiveCategory(e.target.value || null)}
            className="rounded-xl border border-gray-200 p-2.5 text-xs bg-white text-gray-700 sm:w-44 focus:outline-none focus:ring-2 focus:ring-[#003399]"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <select value={selectedStatus || ""} onChange={(e) => setSelectedStatus(e.target.value || null)}
            className="rounded-xl border border-gray-200 p-2.5 text-xs bg-white text-gray-700 sm:w-36 focus:outline-none focus:ring-2 focus:ring-[#003399]"
          >
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="terjadwal">Terjadwal</option>
            <option value="kedaluwarsa">Kedaluwarsa</option>
          </select>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-gray-200 p-2.5 text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003399]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                <th className="py-4 px-6">Judul Prakiraan</th>
                <th className="py-4 px-4">Kategori</th>
                <th className="py-4 px-4 whitespace-nowrap">Masa Berlaku</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center"><div className="w-8 h-8 border-4 border-[#003399] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : paginatedItems.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400 text-sm">Tidak ada data prakiraan yang cocok.</td></tr>
              ) : paginatedItems.map((item) => {
                const status = getStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 min-w-[280px]">
                      <div className="flex gap-3 items-center">
                        <img src={item.url} alt="Thumb" loading="lazy" className="w-14 h-9 object-cover rounded-lg border border-gray-200/60 bg-gray-50 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate leading-snug">{item.title}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            oleh {item.uploader || "Admin"} &bull; {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "Baru"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {item.category
                        ? <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-100">{item.category.name}</span>
                        : <span className="text-gray-400 text-xs italic">—</span>}
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-gray-500 leading-normal">
                      <div>{item.waktu_mulai ? new Date(item.waktu_mulai).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) + " " + new Date(item.waktu_mulai).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "Langsung"}</div>
                      <div className="text-[10px] text-gray-300 font-bold py-0.5">s/d</div>
                      <div>{item.waktu_berakhir ? new Date(item.waktu_berakhir).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) + " " + new Date(item.waktu_berakhir).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "Tak Terbatas"}</div>
                    </td>
                    <td className="py-4 px-4">
                      {status === "active" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Aktif
                        </span>
                      ) : status === "scheduled" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Terjadwal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />Kedaluwarsa
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openModal("edit", item)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="Edit"><Edit3 size={14} /></button>
                        {isAdmin && <button onClick={() => deleteEntry(item.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Hapus"><Trash2 size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredItems.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(count) => { setItemsPerPage(count); setCurrentPage(1); }}
        />
      </div>

      {/* ─── ADD/EDIT MODAL ─────────────────────────────────── */}
      {isModalOpen && editingEntry && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={closeModal}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-7 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#003399]/5 to-transparent">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  {modalMode === "add" ? "Tambah Kartu Prakiraan Baru" : "Edit Kartu Prakiraan"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Lengkapi informasi untuk kartu prakiraan cuaca.</p>
              </div>
              {!saving && (
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-7 space-y-5 overflow-y-auto flex-1">

              {/* Category & Display Type side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Kategori</label>
                  <select
                    value={editingEntry.category_id || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, category_id: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-800"
                    disabled={saving}
                  >
                    <option value="">Tanpa Kategori</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Mode Tampilan</label>
                  <select
                    value={editingEntry.display_type || "gambar_saja"}
                    onChange={(e) => setEditingEntry({ ...editingEntry, display_type: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-800"
                    disabled={saving}
                  >
                    <option value="gambar_saja">Gambar Saja</option>
                    <option value="gambar_teks">Gambar + Teks</option>
                    <option value="gambar_galeri">Gambar + Teks + Galeri</option>
                  </select>
                </div>
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
              </div>

              {/* Gambar Utama */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Gambar Utama</label>
                <div className="flex items-center gap-4">
                  {editingEntry.url && (
                    <div className="w-24 h-16 rounded-xl overflow-hidden border bg-gray-100 shrink-0">
                      <img src={editingEntry.url} alt="Preview" loading="lazy" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 hover:border-[#003399] rounded-xl hover:bg-blue-50/10 cursor-pointer transition-all">
                    <Upload size={16} className="text-gray-400" />
                    <span className="text-xs text-gray-600 font-semibold">{editingEntry.file ? editingEntry.file.name : "Pilih Gambar"}</span>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setEditingEntry({ ...editingEntry, file, url: URL.createObjectURL(file) });
                    }} disabled={saving} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Gallery */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Foto Tambahan (Galeri)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(Array.isArray(editingEntry.gallery_images) ? editingEntry.gallery_images : []).map((img, idx) => (
                    <div key={idx} className="relative w-16 h-12 rounded-lg overflow-hidden border bg-gray-100 group">
                      <img src={img} alt={`Galeri ${idx}`} loading="lazy" className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          const newGal = [...(Array.isArray(editingEntry.gallery_images) ? editingEntry.gallery_images : [])];
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
                            gallery_images: [...(Array.isArray(editingEntry.gallery_images) ? editingEntry.gallery_images : []), URL.createObjectURL(file)],
                          });
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-gray-400">Tambahkan beberapa foto untuk ditampilkan sebagai galeri di halaman detail.</p>
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

              {/* Schedule dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Tanggal Mulai Tayang</label>
                  <input type="date" value={editingEntry.waktu_mulai || ""} onChange={(e) => setEditingEntry({ ...editingEntry, waktu_mulai: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-900" disabled={saving} />
                  <p className="text-[11px] text-gray-400">Kosongkan jika langsung tampil.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Tanggal Berakhir</label>
                  <input type="date" value={editingEntry.waktu_berakhir || ""} onChange={(e) => setEditingEntry({ ...editingEntry, waktu_berakhir: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-900" disabled={saving} />
                  <p className="text-[11px] text-gray-400">Kosongkan jika tidak berdurasi.</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-7 py-5 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              <button type="button" onClick={closeModal} disabled={saving}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                Batal
              </button>
              <button type="button" onClick={handleModalSave} disabled={saving}
                className="flex-1 px-4 py-2.5 bg-[#003399] hover:bg-[#002277] text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-1.5">
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CATEGORY MANAGER MODAL ─────────────────────────── */}
      {showCatManager && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => { if (!saving) setShowCatManager(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Kelola Kategori Prakiraan</h2>
              <button onClick={() => { setShowCatManager(false); setShowCatForm(false); }} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <button onClick={() => { setCatForm({ name: "", description: "", icon: "Sun" }); setShowCatForm(true); }}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 hover:border-[#003399] rounded-xl text-gray-500 hover:text-[#003399] hover:bg-blue-50/20 transition-all text-sm font-bold">
                <Plus size={16} /> Tambah Kategori Baru
              </button>

              {showCatForm && (
                <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-100 space-y-3">
                  <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Nama kategori (contoh: Kota Tegal)" />
                  <Input value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} placeholder="Deskripsi kategori (opsional)" />
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Icon</label>
                    <select value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 p-2.5 text-sm bg-white">
                      <option value="Sun">Sun (Default)</option>
                      <option value="MapPin">MapPin (Kota)</option>
                      <option value="Anchor">Anchor (Pelabuhan)</option>
                      <option value="Waves">Waves (Maritim)</option>
                      <option value="TrendingUp">TrendingUp (Pasang Surut)</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowCatForm(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
                    <button onClick={handleSaveCategory} className="flex-1 py-2 bg-[#003399] text-white rounded-xl text-sm font-semibold hover:bg-[#002277]">{catForm.id ? "Simpan" : "Tambah"}</button>
                  </div>
                </div>
              )}

              {categories.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">Belum ada kategori.</div>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-white transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500"><FolderOpen size={14} /></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">/prakiraan?kategori={cat.slug}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setCatForm({ id: cat.id, name: cat.name, description: cat.description || "", icon: cat.icon }); setShowCatForm(true); }}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"><Edit3 size={14} /></button>
                        {isAdmin && (
                          <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
