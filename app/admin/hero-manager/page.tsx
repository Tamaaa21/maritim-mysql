"use client";

import { useState, useEffect } from "react";
import { Upload, X, GripVertical } from "lucide-react";
import { showSuccess, showError, showConfirm } from '@/lib/sweetalert';
import { CardGridSkeleton } from '@/components/LoadingSkeleton';
import { useAdminUser } from '@/hooks/useAdminUser';
import { isVideoUrl } from '@/lib/utils';

export default function HeroManager() {
  const { isAdmin } = useAdminUser();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveImageUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index - 1];
    newImages[index - 1] = temp;
    setImages(newImages);
  };

  const moveImageDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index + 1];
    newImages[index + 1] = temp;
    setImages(newImages);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      await Promise.all(images.map((img, idx) => 
        fetch(`/api/admin/hero-images/${img.id}`, {
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("name", file.name);
      form.append("order", String(images.length));

      const res = await fetch("/api/admin/hero-images", {
        method: "POST",
        body: form,
      });
      const body = await res.json();
      if (body?.success && body.data) {
        showSuccess('Berhasil Upload', 'Gambar slider berhasil diupload.');
        const newImage = {
          id: images.length + 1,
          name: body.data.name || file.name,
          url: body.data.url,
          order: images.length,
        };
        setImages([...images, newImage]);
      } else {
        showError('Upload Gagal', body?.message || '');
        // fallback to local preview
        const newImage = {
          id: images.length + 1,
          name: file.name,
          url: URL.createObjectURL(file),
          order: images.length,
        };
        setImages([...images, newImage]);
      }
    } catch (err) {
      console.error(err);
      showError('Upload Error', 'Terjadi kesalahan saat upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await showConfirm('Hapus Gambar?', 'Gambar ini akan dihapus dari slider.');
    if (!confirm.isConfirmed) return;
    
    // optimistic UI update
    setImages(images.filter(img => img.id !== id));
    fetch(`/api/admin/hero-images/${id}`, { method: "DELETE" }).then(() => {
      showSuccess('Berhasil Dihapus', 'Gambar slider telah dihapus.');
    }).catch(err => {
      console.error(err);
      showError('Gagal Menghapus', 'Terjadi kesalahan saat menghapus gambar.');
    });
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/hero-images/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !current }),
      });
      const body = await res.json();
      if (body?.success) {
        setImages(images.map(img => (img.id === id ? body.data : img)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/admin/hero-images').then(r => r.json()).then((b) => {
      if (!mounted) return;
      if (b?.success) setImages(b.data || []);
    }).catch(err => console.error(err))
    .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kelola Slider Home</h1>
        <p className="text-gray-500 mt-2">Atur media latar belakang Hero Section yang berubah otomatis setiap 20 detik</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#003399] transition-colors p-8">
        <label className="flex flex-col items-center gap-4 cursor-pointer">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Upload className="text-[#003399]" size={32} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">Upload Gambar/Video Baru</p>
            <p className="text-gray-500 text-sm">Drag atau klik untuk memilih file gambar/video</p>
          </div>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

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
                  <button 
                    onClick={() => moveImageUp(idx)} 
                    disabled={idx === 0} 
                    className="hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </button>
                  <button 
                    onClick={() => moveImageDown(idx)} 
                    disabled={idx === images.length - 1} 
                    className="hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>
                </div>
              </div>
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                {isVideoUrl(image.url) ? (
                  <video src={image.url} className="w-full h-full object-cover bg-black" muted />
                ) : (
                  <img src={image.url} alt={image.name} loading="lazy" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{image.name}</p>
                <p className="text-gray-500 text-sm">Urutan: #{idx + 1}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(image.id)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Save Button */}
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
    </div>
  );
}
