"use client";

import { useState } from "react";
import { Upload, X, GripVertical } from "lucide-react";

export default function HeroManager() {
  const [images, setImages] = useState([
    { id: 1, name: "Gedung BMKG", url: "https://images.pexels.com/photos/1051073/pexels-photo-1051073.jpeg?auto=compress&cs=tinysrgb&w=1600", order: 0 },
    { id: 2, name: "Laut", url: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=1600", order: 1 },
    { id: 3, name: "Pelabuhan", url: "https://images.pexels.com/photos/753331/pexels-photo-753331.jpeg?auto=compress&cs=tinysrgb&w=1600", order: 2 },
  ]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Simulasi upload
    await new Promise(r => setTimeout(r, 1500));

    const newImage = {
      id: images.length + 1,
      name: file.name,
      url: URL.createObjectURL(file),
      order: images.length,
    };

    setImages([...images, newImage]);
    setUploading(false);
  };

  const handleDelete = (id: number) => {
    setImages(images.filter(img => img.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kelola Slider Home</h1>
        <p className="text-gray-500 mt-2">Atur gambar latar belakang Hero Section yang berubah otomatis setiap 20 detik</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#003399] transition-colors p-8">
        <label className="flex flex-col items-center gap-4 cursor-pointer">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Upload className="text-[#003399]" size={32} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">Upload Gambar Baru</p>
            <p className="text-gray-500 text-sm">Drag atau klik untuk memilih file</p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Images List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Daftar Gambar ({images.length})</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {images.map((image, idx) => (
            <div key={image.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 group">
              <div className="text-gray-400 group-hover:text-[#003399] cursor-grab">
                <GripVertical size={20} />
              </div>
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{image.name}</p>
                <p className="text-gray-500 text-sm">Urutan: #{idx + 1}</p>
              </div>
              <button
                onClick={() => handleDelete(image.id)}
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3 justify-end">
        <button className="px-6 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
          Batal
        </button>
        <button className="px-6 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-lg transition-colors">
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}
