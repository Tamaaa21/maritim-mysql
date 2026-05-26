"use client";

import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useState } from "react";

interface BukuTamuFormData {
  nama: string;
  email: string;
  instansi: string;
  keperluan: string;
  noTelepon: string;
}

interface BukuTamuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BukuTamuModal({ isOpen, onClose }: BukuTamuModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<BukuTamuFormData>();
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: BukuTamuFormData) => {
    try {
      const response = await fetch("/api/submit/buku-tamu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: data.nama,
          email: data.email,
          no_telepon: data.noTelepon,
          instansi: data.instansi || null,
          keperluan: data.keperluan,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      setSubmitted(true);
      await new Promise(r => setTimeout(r, 1500));
      reset();
      setSubmitted(false);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim data");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-96 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#003399] to-[#0055cc] text-white px-6 py-4 flex items-center justify-between border-b">
          <div>
            <h2 className="text-xl font-bold">Buku Tamu</h2>
            <p className="text-blue-100 text-xs mt-1">Silakan isi data Anda untuk menjadi tamu kami</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {!submitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Nama */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nama <span className="text-red-500">*</span></label>
              <input
                type="text"
                {...register("nama", { required: "Nama wajib diisi" })}
                placeholder="Masukkan nama lengkap"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm"
              />
              {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                {...register("email", { required: "Email wajib diisi", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Email tidak valid" } })}
                placeholder="nama@email.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* No. Telepon */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">No. Telepon <span className="text-red-500">*</span></label>
              <input
                type="tel"
                {...register("noTelepon", { required: "No. telepon wajib diisi" })}
                placeholder="08xx-xxxx-xxxx"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm"
              />
              {errors.noTelepon && <p className="text-red-500 text-xs mt-1">{errors.noTelepon.message}</p>}
            </div>

            {/* Instansi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Instansi/Sekolah</label>
              <input
                type="text"
                {...register("instansi")}
                placeholder="Nama instansi atau sekolah (opsional)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm"
              />
            </div>

            {/* Keperluan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Keperluan <span className="text-red-500">*</span></label>
              <textarea
                {...register("keperluan", { required: "Keperluan wajib diisi" })}
                placeholder="Jelaskan keperluan kunjungan Anda"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm resize-none"
              />
              {errors.keperluan && <p className="text-red-500 text-xs mt-1">{errors.keperluan.message}</p>}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Kirim
              </button>
            </div>
          </form>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold">Data berhasil dikirim!</p>
            <p className="text-gray-500 text-sm mt-2">Terima kasih telah mengunjungi BMKG Tegal</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
