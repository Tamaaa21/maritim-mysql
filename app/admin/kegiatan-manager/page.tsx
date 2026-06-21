"use client";

import { useState, useEffect } from "react";
import { Upload, Trash } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError, showConfirm } from '@/lib/sweetalert';
import { CardGridSkeleton } from '@/components/LoadingSkeleton';
import { useAdminUser } from '@/hooks/useAdminUser';
import AdminPagination from '@/components/AdminPagination';
import { csrfFetch } from '@/lib/csrf';

export default function KegiatanManager() {
  const { isAdmin } = useAdminUser();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await csrfFetch('/api/admin/kegiatan-documents');
      const json = await res.json();
      if (json?.success) setItems(json.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [items.length, totalPages, currentPage]);

  const handleUpload = async () => {
    if (files.length === 0 && !youtubeUrl) return;
    setUploading(true);
    try {
      const form = new FormData();
      for (const f of files) form.append('files', f);
      form.append('title', title || files[0]?.name || 'Kegiatan');
      if (description) form.append('description', description);
      if (eventDate) form.append('event_date', eventDate);
      if (youtubeUrl) form.append('youtube_url', youtubeUrl);
      const res = await csrfFetch('/api/admin/kegiatan-documents', { method: 'POST', body: form });
      const json = await res.json();
      if (json?.success) {
        showSuccess('Berhasil Upload', 'Dokumen berhasil diupload.');
        setItems([json.data, ...items]);
        setFiles([]); setTitle(''); setDescription(''); setEventDate(''); setYoutubeUrl('');
      } else {
        showError('Upload Gagal', json?.message || '');
      }
    } catch (e) { console.error(e); showError('Upload Error', 'Terjadi kesalahan saat upload.'); }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    const confirm = await showConfirm('Hapus Dokumen?', 'Dokumen ini akan dihapus permanen.');
    if (!confirm.isConfirmed) return;
    try {
      const res = await csrfFetch(`/api/admin/kegiatan-documents/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json?.success) {
        showSuccess('Berhasil Dihapus', 'Dokumen telah dihapus.');
        setItems(items.filter(i => i.id !== id));
      } else {
        showError('Gagal Menghapus', json?.message || '');
      }
    } catch (e) { console.error(e); showError('Error', 'Terjadi kesalahan saat menghapus.'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dokumentasi Kegiatan</h1>
        <p className="text-gray-500 mt-2">Upload foto atau dokumen kegiatan</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Judul</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tanggal Kegiatan</label>
            <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Link YouTube (opsional)</label>
          <Input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="mt-1" />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1" rows={3} />
        </div>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed rounded-md cursor-pointer">
            <Upload /> <span>{files.length > 0 ? `${files.length} file dipilih` : 'Pilih file'}</span>
            <input type="file" accept="image/*,application/pdf" multiple onChange={e => { const selected = Array.from(e.target.files || []); if (selected.length > 0) setFiles(prev => [...prev, ...selected]); }} className="hidden" />
          </label>
          {files.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {Array.from(files).map((f, i) => (
                <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{f.name}</span>
              ))}
            </div>
          )}
          <button onClick={handleUpload} disabled={uploading || (files.length === 0 && !youtubeUrl)} className="px-4 py-2 bg-[#003399] text-white rounded-md">{uploading ? 'Mengupload...' : 'Upload'}</button>
        </div>
      </div>

      {loading ? (
        <CardGridSkeleton count={4} />
      ) : paginatedItems.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Belum ada kegiatan.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {paginatedItems.map(item => (
              <div key={item.id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1 min-w-0">
                  <div className="flex-shrink-0 flex gap-1">
                    {(() => {
                      const urls = Array.isArray(item.image_urls) ? item.image_urls : [];
                      const displayUrls = urls.length > 0 ? urls : (item.url ? [item.url] : []);
                      return displayUrls.filter(Boolean).slice(0, 3).map((url: string, i: number) => (
                        <div key={i} className="w-16 h-12 overflow-hidden rounded-md bg-gray-100 relative flex items-center justify-center border border-gray-200 shadow-sm">
                          <img src={url} alt={item.title} loading="lazy" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          {item.youtube_url && i === 0 && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                    {!item.url && (!Array.isArray(item.image_urls) || item.image_urls.length === 0) && item.youtube_url && (
                      <div className="w-16 h-12 overflow-hidden rounded-md bg-gray-200 flex items-center justify-center border border-gray-200">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#999"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      {editingId === item.id ? (
                        <Input className="font-semibold w-full border-b max-w-sm h-8" value={editValues.title || ''} onChange={e => setEditValues({...editValues, title: e.target.value})} />
                      ) : (
                        <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                      )}
                    </div>

                    {editingId === item.id ? (
                      <div className="mt-2 space-y-2 max-w-xl">
                        <Textarea value={editValues.description || ''} onChange={e => setEditValues({...editValues, description: e.target.value})} className="w-full" rows={2} />
                        <div className="flex gap-2 flex-wrap">
                          <Input type="date" value={editValues.event_date || ''} onChange={e => setEditValues({...editValues, event_date: e.target.value})} className="w-40 h-8 text-xs" />
                          <Input value={editValues.youtube_url || ''} onChange={e => setEditValues({...editValues, youtube_url: e.target.value})} placeholder="Link YouTube" className="flex-1 min-w-[150px] h-8 text-xs" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(editValues.existing_urls || []).filter((url: string) => !(editValues.removed_urls || []).includes(url)).map((url: string, i: number) => (
                            <div key={i} className="relative w-16 h-12 overflow-hidden rounded-md border border-gray-200 group">
                              <img src={url} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => setEditValues({...editValues, removed_urls: [...(editValues.removed_urls || []), url] })} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">Hapus</button>
                            </div>
                          ))}
                          {(editValues.removed_urls || []).map((url: string, i: number) => (
                            <div key={`removed-${i}`} className="relative w-16 h-12 overflow-hidden rounded-md border-2 border-red-300 opacity-50">
                              <img src={url} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center text-white text-[8px] font-bold text-center leading-tight px-0.5">DIHAPUS</div>
                            </div>
                          ))}
                          {editValues.files && editValues.files.length > 0 && (editValues.files as File[]).map((f: File, i: number) => (
                            <div key={`new-${i}`} className="w-16 h-12 overflow-hidden rounded-md border-2 border-green-300 flex items-center justify-center bg-green-50 text-[8px] text-green-700 font-medium text-center px-0.5 leading-tight">Baru</div>
                          ))}
                        </div>
                        <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-dashed text-xs rounded-md cursor-pointer text-gray-600 hover:bg-gray-50">
                          <Upload size={14} /> <span>{editValues.files && editValues.files.length > 0 ? `${editValues.files.length} gambar baru dipilih` : 'Tambah Gambar'}</span>
                          <input type="file" accept="image/*,application/pdf" multiple onChange={e => setEditValues({...editValues, files: [...(editValues.files || []), ...Array.from(e.target.files || [])]})} className="hidden" />
                        </label>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {item.event_date && (
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                              {new Date(item.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                          {item.youtube_url && (
                            <a href={item.youtube_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-red-600 font-semibold hover:underline">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                              YouTube Link
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 md:mt-0 flex-shrink-0 self-end md:self-center">
                  {editingId === item.id ? (
                    <>
                      <button onClick={async () => {
                        try {
                          const hasFiles = editValues.files && editValues.files.length > 0;
                          const hasRemoved = editValues.removed_urls && editValues.removed_urls.length > 0;
                          let res;
                          if (hasFiles || hasRemoved) {
                            const form = new FormData();
                            if (hasFiles) for (const f of editValues.files) form.append('files', f);
                            if (hasRemoved) form.append('removed_urls', JSON.stringify(editValues.removed_urls));
                            if (editValues.title) form.append('title', editValues.title);
                            if (editValues.description) form.append('description', editValues.description);
                            if (editValues.event_date) form.append('event_date', editValues.event_date);
                            if (editValues.youtube_url) form.append('youtube_url', editValues.youtube_url);
                            res = await csrfFetch(`/api/admin/kegiatan-documents/${item.id}`, { method: 'PATCH', body: form });
                          } else {
                            const body = {
                              title: editValues.title,
                              description: editValues.description,
                              event_date: editValues.event_date,
                              youtube_url: editValues.youtube_url || null,
                            };
                            res = await csrfFetch(`/api/admin/kegiatan-documents/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                          }
                          const json = await res.json();
                          if (json?.success) {
                            showSuccess('Berhasil Disimpan', 'Perubahan berhasil disimpan.');
                            setItems(items.map(i => i.id === item.id ? json.data : i));
                            setEditingId(null);
                          } else {
                            showError('Gagal Menyimpan', json?.message || '');
                          }
                        } catch (e) { console.error(e); showError('Error', 'Terjadi kesalahan saat menyimpan.'); }
                      }} className="text-xs px-2.5 py-1 bg-green-600 hover:bg-green-700 font-semibold text-white rounded">Simpan</button>
                      <button onClick={() => setEditingId(null)} className="text-xs px-2.5 py-1 bg-gray-200 hover:bg-gray-300 font-semibold rounded text-gray-700">Batal</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => {
                        const urls = Array.isArray(item.image_urls) ? item.image_urls : (item.url ? [item.url] : []);
                        setEditingId(item.id);
                        setEditValues({ title: item.title, description: item.description, event_date: item.event_date, youtube_url: item.youtube_url || '', files: [], existing_urls: urls, removed_urls: [] });
                      }} className="text-xs px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 font-semibold text-white rounded-lg transition-colors border border-blue-600">Edit</button>
                      {isAdmin && (
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 border border-red-100 hover:text-red-700 rounded-lg transition-colors"><Trash size={16} /></button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={items.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}
