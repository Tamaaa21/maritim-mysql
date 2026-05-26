"use client";

import { useEffect, useState } from "react";
import { Search, Eye, Trash2, Download } from "lucide-react";

interface LayananEntry {
  id: string;
  email: string;
  nama_lengkap: string;
  alamat: string;
  no_hp: string;
  tipe?: string;
  photo_path?: string;
  status: string;
  created_at: string;
}

export default function LayananPage() {
  const [tab, setTab] = useState("berbayar");
  const [data, setData] = useState<LayananEntry[]>([]);
  const [filtered, setFiltered] = useState<LayananEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<LayananEntry | null>(null);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = tab === "berbayar" ? "/api/admin/layanan-berbayar" : "/api/admin/layanan-nol-rupiah";
      const response = await fetch(endpoint);
      const result = await response.json();
      setData(result || []);
      setFiltered(result || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        item.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filtered);
  }, [search, data]);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin?")) return;
    try {
      const endpoint = tab === "berbayar" ? "/api/admin/layanan-berbayar" : "/api/admin/layanan-nol-rupiah";
      await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      setData(data.filter(item => item.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Layanan</h1>
        <p className="text-gray-500 mt-2">Manajemen data permohonan layanan</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab("berbayar")}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            tab === "berbayar"
              ? "text-[#003399] border-[#003399]"
              : "text-gray-600 border-transparent hover:text-gray-900"
          }`}
        >
          Layanan Berbayar
        </button>
        <button
          onClick={() => setTab("nol-rupiah")}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            tab === "nol-rupiah"
              ? "text-[#003399] border-[#003399]"
              : "text-gray-600 border-transparent hover:text-gray-900"
          }`}
        >
          Layanan Nol Rupiah
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-[#003399] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Tidak ada data ditemukan
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">No. HP</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Tanggal</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nama_lengkap}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.no_hp}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedEntry(item)}
                          className="p-2 hover:bg-blue-50 text-[#003399] rounded-lg transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6">Detail Permohonan</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Nama Lengkap</p>
                <p className="text-gray-900 font-medium">{selectedEntry.nama_lengkap}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Email</p>
                <p className="text-gray-900 font-medium">{selectedEntry.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">No. HP</p>
                <p className="text-gray-900 font-medium">{selectedEntry.no_hp}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Status</p>
                <p className="text-gray-900 font-medium">{selectedEntry.status}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 font-semibold mb-1">Alamat</p>
                <p className="text-gray-900 font-medium">{selectedEntry.alamat}</p>
              </div>
              {selectedEntry.tipe && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Tipe</p>
                  <p className="text-gray-900 font-medium">{selectedEntry.tipe}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button
                onClick={() => setSelectedEntry(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
              <a
                href="#"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-lg transition-colors"
              >
                <Download size={16} />
                Unduh File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
