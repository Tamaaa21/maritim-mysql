"use client";

import { useState, useEffect } from "react";
import { Upload, X, GripVertical, Link, Image, Video, Trash2 } from "lucide-react";
import { showSuccess, showError, showConfirm } from '@/lib/sweetalert';
import { CardGridSkeleton } from '@/components/LoadingSkeleton';
import { useAdminUser } from '@/hooks/useAdminUser';
import { isVideoUrl } from '@/lib/utils';
import { csrfFetch } from '@/lib/csrf';

export default function HeroManager() {
  const { isAdmin } = useAdminUser();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [formFiles, setFormFiles] = useState<File[]>([]);
  const [formUrl, setFormUrl] = useState("");
  const [formInputMode, setFormInputMode] = useState<"file" | "url">("file");

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isAdmin) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!isAdmin || draggedIndex === null || draggedIndex === targetIndex) return;
    const reorderedImages = [...images];
    const [draggedImage] = reorderedImages.splice(draggedIndex, 1);
    reorderedImages.splice(targetIndex, 0, draggedImage);
    setDraggedIndex(targetIndex);
    setImages(reorderedImages);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  const moveImageUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    setImages(newImages);
  };

  const moveImageDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    setImages(newImages);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      await Promise.all(images.map((img, idx) =>
        csrfFetch(`/api/admin/hero-images/${img.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_index: idx })
        })
      ));
      showSuccess('Berhasil Disimpan', 'Urutan slider berhasil disimpan!');
    } catch (e) {
      console.error(e);
      showError('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan urutan.');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleSubmit = async () => {
    if (formInputMode === "file" && formFiles.length === 0) return;
    if (formInputMode === "url" && !formUrl.trim()) return;

    setUploading(true);
    try {
      if (formInputMode === "file") {
        for (let i = 0; i < formFiles.length; i++) {
          const form = new FormData();
          form.append("file", formFiles[i]);
          form.append("name", formFiles[i].name);
          form.append("description", "");
          form.append("order", String(images.length + i));

          const res = await csrfFetch("/api/admin/hero-images", { method: "POST", body: form });
          const body = await res.json();
          if (body?.success && body.data) {
            setImages(prev => [...prev, body.data]);
          }
        }
        showSuccess('Berhasil Upload', `${formFiles.length} media berhasil diupload.`);
      } else {
        const res = await csrfFetch("/api/admin/hero-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: formUrl.trim(),
            name: formUrl.trim(),
            description: "",
            order: images.length,
          }),
        });
        const body = await res.json();
        if (body?.success && body.data) {
          setImages(prev => [...prev, body.data]);
          showSuccess('Berhasil Ditambahkan', 'Media dari URL berhasil ditambahkan.');
        } else {
          showError('Gagal', body?.message || 'Gagal menambahkan URL');
        }
      }
      resetForm();
    } catch (err) {
      console.error(err);
      showError('Error', 'Terjadi kesalahan saat upload.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormFiles([]);
    setFormUrl("");
    setFormOpen(false);
  };

  const handleDelete = async (id: number) => {
    const confirm = await showConfirm('Hapus Media?', 'Media ini akan dihapus dari slider.');
    if (!confirm.isConfirmed) return;
    setImages(images.filter(img => img.id !== id));
    csrfFetch(`/api/admin/hero-images/${id}`, { method: "DELETE" }).then(() => {
      showSuccess('Berhasil Dihapus', 'Media slider telah dihapus.');
    }).catch(err => {
      console.error(err);
      showError('Gagal Menghapus', 'Terjadi kesalahan saat menghapus media.');
    });
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    csrfFetch('/api/admin/hero-images').then(r => r.json()).then((b) => {
      if (!mounted) return;
      if (b?.success) setImages(b.data || []);
    }).catch(err => console.error(err))
    .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Slider Home</h1>
          <p className="text-gray-500 mt-2">Atur media latar belakang Hero Section (gambar, video, YouTube)</p>
        </div>
        {!formOpen && isAdmin && (
          <button
            onClick={() => setFormOpen(true)}
            className="px-5 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <Upload size={18} /> Tambah Media
          </button>
        )}
      </div>

      {/* Form Section */}
      {formOpen && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Tambah Media Baru</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {/* Input Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit mt-4">
            <button
              onClick={() => setFormInputMode("file")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                formInputMode === "file" ? "bg-white shadow-sm text-[#003399]" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Image size={16} /> Upload File
            </button>
            <button
              onClick={() => setFormInputMode("url")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                formInputMode === "url" ? "bg-white shadow-sm text-[#003399]" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Link size={16} /> Tambah URL
            </button>
          </div>

          {formInputMode === "file" ? (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">File Gambar/Video</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#003399] transition-colors">
                  <Upload size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-700">{formFiles.length > 0 ? `${formFiles.length} file dipilih` : 'Pilih file'}</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => setFormFiles(Array.from(e.target.files || []))}
                    className="hidden"
                  />
                </label>
              </div>
              {formFiles.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {formFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-lg">
                      <span>{f.name}</span>
                      <button onClick={() => setFormFiles(formFiles.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Media</label>
              <input
                type="url"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://example.com/image.jpg atau https://youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] text-sm"
              />
              {formUrl && (
                <div className="mt-2 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  {isVideoUrl(formUrl) || formUrl.includes("youtube") || formUrl.includes("youtu.be") ? (
                    <div className="w-full h-32 bg-black rounded-lg flex items-center justify-center">
                      <Video size={24} className="text-gray-400" />
                      <span className="text-gray-400 text-sm ml-2">Video Preview</span>
                    </div>
                  ) : (
                    <img src={formUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-4 justify-end">
            <button onClick={resetForm} className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploading || (formInputMode === "file" && formFiles.length === 0) || (formInputMode === "url" && !formUrl.trim())}
              className="px-5 py-2 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              {uploading ? 'Mengupload...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {/* Images List */}
      {loading ? (
        <CardGridSkeleton count={4} />
      ) : images.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <p>Belum ada media slider.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Daftar Media ({images.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {images.map((image, idx) => (
              <div
                key={image.id}
                draggable={isAdmin}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 p-4 transition-all duration-200 select-none ${
                  isAdmin ? "cursor-grab active:cursor-grabbing" : ""
                } ${
                  draggedIndex === idx
                    ? "bg-blue-50 border-y border-dashed border-[#003399]/40 opacity-55 scale-[0.99] shadow-inner"
                    : "hover:bg-gray-50 border-y border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 text-gray-400">
                  {isAdmin && (
                    <GripVertical size={18} className="text-gray-400 select-none pointer-events-none mr-1" />
                  )}
                  <div className="flex flex-col">
                    <button onClick={() => moveImageUp(idx)} disabled={idx === 0} className="hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                    </button>
                    <button onClick={() => moveImageDown(idx)} disabled={idx === images.length - 1} className="hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                  </div>
                </div>
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                  {isVideoUrl(image.url) || image.url?.includes("youtube") || image.url?.includes("youtu.be") ? (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <Video size={24} className="text-gray-400" />
                    </div>
                  ) : (
                    <img src={image.url} alt={image.name} loading="lazy" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{image.name}</p>
                  <p className="text-gray-500 text-sm">Urutan: #{idx + 1}</p>
                  <p className="text-gray-400 text-xs truncate mt-0.5">{image.url}</p>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(image.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      {images.length > 0 && (
        <div className="flex gap-3 justify-end">
          <button onClick={() => window.location.reload()} className="px-6 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button
            onClick={saveOrder}
            disabled={savingOrder}
            className="px-6 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {savingOrder ? 'Menyimpan...' : 'Simpan Perubahan Urutan'}
          </button>
        </div>
      )}
    </div>
  );
}
