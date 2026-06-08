"use client";

import { useEffect, useState } from "react";
import { Upload, Trash, Calendar, AlertCircle } from "lucide-react";
import { Input } from '@/components/ui/input';

export default function PamfletManager() {
  const [items, setItems] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [addingUrl, setAddingUrl] = useState('');
  const [waktuBerakhir, setWaktuBerakhir] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    try {
      const r = await fetch('/api/admin/pamflets');
      const j = await r.json();
      if (j?.success) setItems(j.data);
    } catch (e) {}
  };

  useEffect(() => { fetchList(); }, []);

  const handleUpload = async () => {
    if (!file && !addingUrl) return;
    setLoading(true);
    try {
      const form = new FormData();
      if (file) form.append('file', file);
      if (addingUrl) form.append('url', addingUrl);
      // attach uploader info from adminToken (format: base64(username:ts))
      try {
        const token = typeof window !== 'undefined' ? sessionStorage.getItem('adminToken') : null;
        if (token) {
          const decoded = atob(token);
          const username = decoded.split(':')[0];
          if (username) form.append('uploader', username);
        }
      } catch (e) {
        // ignore
      }
      form.append('title', 'Pamflet');
      // If waktu_berakhir is set, convert date to end-of-day ISO
      if (waktuBerakhir) {
        try {
          const endOfDay = new Date(waktuBerakhir + 'T23:59:59');
          if (!isNaN(endOfDay.getTime())) {
            form.append('waktu_berakhir', endOfDay.toISOString());
          }
        } catch (e) {}
      }
      const r = await fetch('/api/admin/pamflets', { method: 'POST', body: form });
      const j = await r.json();
      if (j?.success) {
        setFile(null);
        setAddingUrl('');
        setWaktuBerakhir('');
        fetchList();
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pamflet ini?')) return;
    await fetch(`/api/admin/pamflets?id=${id}`, { method: 'DELETE' });
    fetchList();
  };

  return (
    <div className="mt-4 bg-white rounded-2xl border p-6 space-y-6">
      {/* Upload Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload */}
          <label className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 hover:border-[#003399] rounded-xl cursor-pointer transition-colors hover:bg-blue-50/30">
            <Upload className="text-gray-400 flex-shrink-0" size={18} />
            <span className="text-sm text-gray-600 truncate">
              {file ? file.name : 'Pilih file gambar untuk diunggah'}
            </span>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
          </label>

          {/* URL Input */}
          <Input
            value={addingUrl}
            onChange={e => setAddingUrl(e.target.value)}
            placeholder="Atau tempel URL gambar"
          />
        </div>

        {/* Date + Upload Button Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2 space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <Calendar size={14} className="text-gray-500" />
              Tanggal Berakhir (opsional)
            </label>
            <input
              type="date"
              value={waktuBerakhir}
              onChange={(e) => setWaktuBerakhir(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-900"
            />
            <p className="text-[11px] text-gray-400">
              Pamflet akan ditandai kadaluarsa setelah tanggal ini. Kosongkan jika tidak berbatas waktu.
            </p>
          </div>

          <button
            onClick={handleUpload}
            disabled={loading || (!file && !addingUrl)}
            className="px-6 py-2.5 bg-[#003399] hover:bg-[#0044cc] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {loading ? 'Mengunggah...' : 'Tambah Pamflet'}
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-xl bg-gray-50">
          <AlertCircle className="mx-auto text-gray-400 mb-2" size={28} />
          <p className="text-gray-500 text-sm">Belum ada pamflet yang diunggah.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(it => {
            const isExpired = it.waktu_berakhir && new Date(it.waktu_berakhir) < new Date();
            return (
              <div key={it.id} className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                <img src={it.url} alt={it.title} className="w-full h-36 object-cover" />
                {/* Expired badge */}
                {isExpired && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    Kadaluarsa
                  </span>
                )}
                {/* Expiry date label */}
                {it.waktu_berakhir && (
                  <div className={`absolute bottom-0 left-0 right-0 px-2 py-1 text-[10px] font-medium flex items-center gap-1 ${isExpired ? 'bg-red-600/80 text-white' : 'bg-black/50 text-gray-200'}`}>
                    <Calendar size={9} />
                    {isExpired ? 'Exp:' : 'Berakhir:'} {new Date(it.waktu_berakhir).toLocaleDateString('id-ID')}
                  </div>
                )}
                <button
                  className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                  onClick={() => handleDelete(it.id)}
                  title="Hapus pamflet"
                >
                  <Trash size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
