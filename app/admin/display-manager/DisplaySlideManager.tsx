"use client";

import { useEffect, useState } from "react";
import { Upload, Trash, Calendar, AlertCircle, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { Input } from '@/components/ui/input';
import { showConfirm, showSuccess, showError } from '@/lib/sweetalert';
import { CardGridSkeleton } from '@/components/LoadingSkeleton';
import { useAdminUser } from '@/hooks/useAdminUser';
import { isVideoUrl } from '@/lib/utils';
import { getYoutubeEmbedUrl, isYoutubeUrl } from '@/lib/youtube';

export default function DisplaySlideManager() {
  const { isAdmin } = useAdminUser();
  const [items, setItems] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [addingUrl, setAddingUrl] = useState('');
  const [waktuBerakhir, setWaktuBerakhir] = useState('');
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const fetchList = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const r = await fetch('/api/admin/display');
      const j = await r.json();
      if (j?.success) {
        setItems(j.data);
      } else {
        setDbError(j?.message || "Terjadi kesalahan saat memuat data.");
      }
    } catch (e) {
      setDbError("Gagal terhubung ke server.");
    }
    setLoading(false);
  };

  useEffect(() => { fetchList(); }, []);

  const handleUpload = async () => {
    if (!file && !addingUrl) return;
    setUploading(true);
    try {
      const form = new FormData();
      if (file) form.append('file', file);
      if (addingUrl) form.append('url', addingUrl);
      form.append('title', 'Display');
      // If waktu_berakhir is set, convert date to end-of-day ISO
      if (waktuBerakhir) {
        try {
          const endOfDay = new Date(waktuBerakhir + 'T23:59:59');
          if (!isNaN(endOfDay.getTime())) {
            form.append('waktu_berakhir', endOfDay.toISOString());
          }
        } catch (e) { }
      }
      const r = await fetch('/api/admin/display', { method: 'POST', body: form });
      const j = await r.json();
      if (j?.success) {
        setFile(null);
        setAddingUrl('');
        setWaktuBerakhir('');
        fetchList();
        showSuccess('Berhasil!', 'Display baru telah ditambahkan.');
      } else {
        showError('Gagal', j?.message || 'Gagal mengunggah display.');
      }
    } catch (e) {
      showError('Gagal', 'Terjadi kesalahan server.');
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await showConfirm('Hapus Display?', 'Apakah Anda yakin ingin menghapus display ini?');
    if (!isConfirmed.isConfirmed) return;
    try {
      const r = await fetch(`/api/admin/display?id=${id}`, { method: 'DELETE' });
      const j = await r.json();
      if (j?.success) {
        showSuccess('Berhasil!', 'Display telah dihapus.');
        fetchList();
      } else {
        showError('Gagal', j?.message || 'Terjadi kesalahan saat menghapus display.');
      }
    } catch (e) {
      showError('Gagal', 'Terjadi kesalahan saat menghapus display.');
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    try {
      const r = await fetch('/api/admin/display', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, direction }),
      });
      const j = await r.json();
      if (j?.success) {
        fetchList();
      }
    } catch (e) {
      console.error("Gagal mengubah urutan:", e);
    }
  };

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

    const reorderedItems = [...items];
    const [draggedItem] = reorderedItems.splice(draggedIndex, 1);
    reorderedItems.splice(targetIndex, 0, draggedItem);

    setDraggedIndex(targetIndex);
    setItems(reorderedItems);
  };

  const handleDragEnd = async () => {
    if (!isAdmin) return;
    setDraggedIndex(null);
    try {
      const itemIds = items.map((item) => item.id);
      const r = await fetch('/api/admin/display', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemIds }),
      });
      const j = await r.json();
      if (j?.success) {
        setItems(j.data);
      } else {
        fetchList();
      }
    } catch (e) {
      console.error("Gagal memperbarui urutan:", e);
      fetchList();
    }
  };

  return (
    <div className="mt-4 bg-white rounded-2xl border p-6 space-y-6">
      {/* Upload Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* File Upload */}
          <label className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 hover:border-[#003399] rounded-xl cursor-pointer transition-colors hover:bg-blue-50/30 h-10">
            <Upload className="text-gray-400 flex-shrink-0" size={18} />
            <span className="text-sm text-gray-600 truncate">
              {file ? file.name : 'Pilih file gambar/video'}
            </span>
            <input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
          </label>

          {/* URL Input */}
          <Input
            value={addingUrl}
            onChange={e => setAddingUrl(e.target.value)}
            placeholder="Atau tempel URL gambar/video"
            className="h-10"
          />

          {/* Date Picker Input */}
          <div>
            <Input
              type="date"
              value={waktuBerakhir}
              onChange={e => setWaktuBerakhir(e.target.value)}
              className="h-10"
              title="Tanggal Kadaluarsa Display (Opsional)"
            />
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={uploading || (!file && !addingUrl)}
            className="px-6 py-2.5 bg-[#003399] hover:bg-[#0044cc] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {uploading ? 'Mengunggah...' : 'Tambah Display'}
          </button>
        </div>
      </div>

      {/* Database Connection / Table Missing Error */}
      {dbError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="flex-shrink-0 mt-0.5 text-red-600" size={18} />
          <div>
            <p className="font-semibold text-sm">Kesalahan Database</p>
            <p className="text-xs text-red-600/95 mt-1">{dbError}</p>
          </div>
        </div>
      )}

      {/* Items List (Row Layout) */}
      {loading ? (
        <CardGridSkeleton count={4} />
      ) : items.length === 0 ? (
        !dbError && (
          <div className="text-center py-10 border border-dashed rounded-xl bg-gray-50">
            <AlertCircle className="mx-auto text-gray-400 mb-2" size={28} />
            <p className="text-gray-500 text-sm">Belum ada Display yang diunggah.</p>
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
          <div className="divide-y divide-gray-100">
            {items.map((it, idx) => {
              const isExpired = it.waktu_berakhir && new Date(it.waktu_berakhir) < new Date();
              return (
                <div
                  key={it.id}
                  draggable={isAdmin}
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-all duration-200 select-none ${
                    isAdmin ? "cursor-grab active:cursor-grabbing" : ""
                  } ${
                    draggedIndex === idx 
                      ? "bg-blue-50 border-y border-dashed border-[#003399]/40 opacity-55 scale-[0.99] shadow-inner" 
                      : "hover:bg-gray-50 border-y border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {isAdmin && (
                      <GripVertical size={18} className="text-gray-400 select-none pointer-events-none flex-shrink-0" />
                    )}
                    
                    {/* Thumbnail */}
                    <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 flex items-center justify-center relative border border-gray-100">
                      {isYoutubeUrl(it.url) ? (
                        <div className="w-full h-full bg-black relative">
                          <iframe
                            src={getYoutubeEmbedUrl(it.url) || ""}
                            className="w-full h-full border-none pointer-events-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                          <div className="absolute inset-0 bg-transparent" />
                        </div>
                      ) : isVideoUrl(it.url) ? (
                        <video src={it.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={it.url} alt={it.title} loading="lazy" className="w-full h-full object-cover" />
                      )}
                      
                      {isExpired && (
                        <span className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                          Exp
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#003399] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-[10px]" title="Urutan Konten">
                          #{it.order || (idx + 1)}
                        </span>
                        <p className="font-semibold text-gray-900 truncate text-sm">
                          {it.title || 'Display Slide'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-1">{it.url}</p>
                      
                      {/* Expiry date label */}
                      {it.waktu_berakhir && (
                        <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-[10px] font-medium ${isExpired ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                          <Calendar size={10} />
                          {isExpired ? 'Kadaluarsa sejak:' : 'Berakhir:'} {new Date(it.waktu_berakhir).toLocaleDateString('id-ID')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleReorder(it.id, 'up')}
                        disabled={idx === 0}
                        className="p-2 text-gray-500 hover:bg-gray-200 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 rounded-lg transition-colors border border-gray-100"
                        title="Geser Naik"
                      >
                        <ChevronLeft size={16} className="rotate-90 sm:rotate-0" />
                      </button>
                      <button
                        onClick={() => handleReorder(it.id, 'down')}
                        disabled={idx === items.length - 1}
                        className="p-2 text-gray-500 hover:bg-gray-200 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 rounded-lg transition-colors border border-gray-100"
                        title="Geser Turun"
                      >
                        <ChevronRight size={16} className="rotate-90 sm:rotate-0" />
                      </button>
                      <button
                        onClick={() => handleDelete(it.id)}
                        className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-red-100 ml-1"
                        title="Hapus Display"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
