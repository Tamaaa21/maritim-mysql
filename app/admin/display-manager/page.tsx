"use client";

import DisplaySlideManager from "./DisplaySlideManager";

export default function DisplayManager() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Display</h1>
          <p className="text-gray-500 mt-2">Atur Display slideshow yang tampil di bagian Prakiraan.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Daftar Display</h2>
        <p className="text-gray-500 text-sm mb-4">Tambahkan atau kelola gambar Display di sini.</p>
        <DisplaySlideManager />
      </div>
    </div>
  );
}
