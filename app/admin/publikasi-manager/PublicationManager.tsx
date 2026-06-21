"use client";

import { useEffect, useState } from "react";
import { Upload, Trash, Plus, FileText, Image } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError, showConfirm } from '@/lib/sweetalert';
import { CardGridSkeleton } from '@/components/LoadingSkeleton';
import { useAdminUser } from '@/hooks/useAdminUser';
import { csrfFetch } from '@/lib/csrf';

export default function PublicationManager() {
  const { isAdmin } = useAdminUser();
  const [items, setItems] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [addingUrl, setAddingUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    setLoading(true);
    try {
      const r = await csrfFetch('/api/admin/publications');
      const j = await r.json();
      if (j?.success) setItems(j.data);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleUpload = async () => {
    if (!file && !addingUrl) {
      showError('Validasi Gagal', 'Silakan pilih file publikasi atau isi URL file');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      if (file) form.append('file', file);
      if (addingUrl) form.append('url', addingUrl);
      if (coverFile) form.append('coverFile', coverFile);
      if (coverUrl)       form.append('coverUrl', coverUrl);
      form.append('title', title || 'Publikasi Baru');
      form.append('description', description || '');

      const r = await csrfFetch('/api/admin/publications', { method: 'POST', body: form });
      const j = await r.json();
      if (j?.success) {
        setFile(null);
        setAddingUrl('');
        setCoverFile(null);
        setCoverUrl('');
        setTitle('');
        setDescription('');
        fetchList();
        showSuccess('Berhasil', 'Publikasi berhasil ditambahkan');
      } else {
        showError('Gagal Menambahkan', j?.error || 'Error');
      }
    } catch (e) {
      console.error(e);
      showError('Error Koneksi', 'Terjadi kesalahan koneksi');
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    const confirm = await showConfirm('Hapus Publikasi?', 'Apakah Anda yakin ingin menghapus publikasi/buletin ini?');
    if (!confirm.isConfirmed) return;
    try {
      const res = await csrfFetch(`/api/admin/publications?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data?.success) {
        showSuccess('Berhasil Dihapus', 'Publikasi telah dihapus.');
        fetchList();
      } else {
        showError('Gagal Menghapus', data?.error || 'Error saat menghapus');
      }
    } catch (e) {
      console.error(e);
      showError('Error Koneksi', 'Terjadi kesalahan koneksi');
    }
  };

  return (
    <div className="mt-4 bg-white rounded-2xl border p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Unggah Publikasi / Buletin Baru</h2>
      
      {/* File & URL Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="col-span-2 flex items-center gap-3 p-3.5 border-2 border-dashed border-gray-300 hover:border-[#003399] rounded-xl cursor-pointer bg-gray-50/20 transition-all">
          <Upload className="text-gray-400" />
          <span className="text-sm text-gray-600">
            {file ? `File: ${file.name}` : "Pilih File Publikasi (PDF / Gambar) *"}
          </span>
          <input type="file" accept="image/*,application/pdf" onChange={(e)=>setFile(e.target.files?.[0]||null)} className="hidden" />
        </label>
        <Input value={addingUrl} onChange={e=>setAddingUrl(e.target.value)} placeholder="Atau tempel URL file publikasi" className="h-full rounded-xl" />
      </div>

      {/* Cover Image Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
        <label className="col-span-2 flex items-center gap-3 p-3.5 border-2 border-dashed border-gray-300 hover:border-[#003399] rounded-xl cursor-pointer bg-gray-50/20 transition-all">
          <Image className="text-gray-400" />
          <span className="text-sm text-gray-600">
            {coverFile ? `Cover: ${coverFile.name}` : "Pilih Cover Gambar Buletin (Opsional)"}
          </span>
          <input type="file" accept="image/*" onChange={(e)=>setCoverFile(e.target.files?.[0]||null)} className="hidden" />
        </label>
        <Input value={coverUrl} onChange={e=>setCoverUrl(e.target.value)} placeholder="Atau tempel URL Cover" className="h-full rounded-xl" />
      </div>

      {/* Metadata Inputs */}
      <div className="grid grid-cols-1 gap-4 pt-2 border-t border-gray-100">
        <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Judul Publikasi / Buletin (Contoh: BULETIN MEI 2026) *" className="rounded-xl p-3" />
        <Textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Deskripsi Singkat Buletin" className="rounded-xl p-3 min-h-[80px]" />
      </div>

      <div className="flex justify-end pt-2">
        <button 
          onClick={handleUpload} 
          disabled={uploading} 
          className="px-6 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={18} />
          {uploading ? 'Mengirim...' : 'Tambah Publikasi'}
        </button>
      </div>

      {/* Publication List Display */}
      <div className="pt-6 border-t border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Daftar Publikasi Saat Ini</h3>
        
        {loading ? (
          <CardGridSkeleton count={4} />
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Belum ada publikasi yang diunggah.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map(it => (
              <div key={it.id} className="relative rounded-xl overflow-hidden border border-gray-200 p-2.5 flex flex-col justify-between hover:shadow-md transition-shadow group bg-white">
                <div>
                  {/* Thumbnail / Cover */}
                  <div className="w-full h-36 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative flex items-center justify-center">
                    {it.cover_url ? (
                      <img src={it.cover_url} alt={it.title} loading="lazy" className="w-full h-full object-cover" />
                    ) : it.url.endsWith('.pdf') ? (
                      <div className="flex flex-col items-center gap-1.5 text-center p-3 select-none">
                        <FileText size={32} className="text-red-500" />
                        <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wider">PDF</span>
                      </div>
                    ) : (
                      <img src={it.url} alt={it.title} loading="lazy" className="w-full h-full object-cover" />
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-[#003399] transition-colors">{it.title}</div>
                    <div className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">{it.description || "Tidak ada deskripsi"}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2 text-[10px] text-gray-400">
                  <span>Oleh: {it.uploader || "admin"}</span>
                  {isAdmin && (
                    <button 
                      className="bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 text-red-600 rounded-lg p-1.5 transition-colors" 
                      onClick={()=>handleDelete(it.id)}
                      title="Hapus publikasi"
                    >
                      <Trash size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
