"use client";

import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useState, useRef } from "react";

interface LayananBerbayarFormData {
  email: string;
  namaLengkap: string;
  alamat: string;
  instansi: string;
  noHP: string;
  ktpFile: FileList;
  suratFile: FileList;
  formFile: FileList;
}

interface LayananBerbayarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LayananBerbayarModal({ isOpen, onClose }: LayananBerbayarModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LayananBerbayarFormData>();
  const [submitted, setSubmitted] = useState(false);
  const [fileErrors, setFileErrors] = useState<string>("");

  const validateFile = (file: File | undefined, maxSize: number = 1): boolean => {
    if (!file) return false;
    if (file.size > maxSize * 1024 * 1024) {
      setFileErrors(`Ukuran file maksimal ${maxSize} MB`);
      return false;
    }
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setFileErrors("Tipe file harus PDF atau gambar (JPG/PNG)");
      return false;
    }
    return true;
  };

  const onSubmit = async (data: LayananBerbayarFormData) => {
    setFileErrors("");

    if (!data.ktpFile?.[0] || !validateFile(data.ktpFile[0])) {
      setFileErrors("KTP/SIM/Paspor wajib diupload (maks 1 MB)");
      return;
    }
    if (!data.suratFile?.[0] || !validateFile(data.suratFile[0])) {
      setFileErrors("Surat Permohonan wajib diupload (maks 1 MB)");
      return;
    }
    if (!data.formFile?.[0] || !validateFile(data.formFile[0])) {
      setFileErrors("Form Permintaan Data wajib diupload (maks 1 MB)");
      return;
    }

    try {
      await fetch("/api/submit/layanan-berbayar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          nama_lengkap: data.namaLengkap,
          alamat: data.alamat,
          instansi: data.instansi || null,
          no_hp: data.noHP,
        }),
      });

      setSubmitted(true);
      await new Promise(r => setTimeout(r, 1500));
      reset();
      setSubmitted(false);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim permohonan");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#003399] to-[#0055cc] text-white px-6 py-4 flex items-center justify-between border-b z-10">
          <div>
            <h2 className="text-xl font-bold">Permohonan Layanan Berbayar</h2>
            <p className="text-blue-100 text-xs mt-1">Isi form berikut untuk mengajukan layanan berbayar</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {!submitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
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

            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap (Sesuai Kartu Identitas) <span className="text-red-500">*</span></label>
              <input
                type="text"
                {...register("namaLengkap", { required: "Nama lengkap wajib diisi" })}
                placeholder="Masukkan nama sesuai identitas"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm"
              />
              {errors.namaLengkap && <p className="text-red-500 text-xs mt-1">{errors.namaLengkap.message}</p>}
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat (Sesuai Kartu Identitas) <span className="text-red-500">*</span></label>
              <textarea
                {...register("alamat", { required: "Alamat wajib diisi" })}
                placeholder="Masukkan alamat sesuai identitas"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm resize-none"
              />
              {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat.message}</p>}
            </div>

            {/* Instansi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Instansi</label>
              <input
                type="text"
                {...register("instansi")}
                placeholder="Nama instansi (opsional)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm"
              />
            </div>

            {/* No. HP */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">No. HP (Nomor Aktif) <span className="text-red-500">*</span></label>
              <input
                type="tel"
                {...register("noHP", { required: "No. HP wajib diisi" })}
                placeholder="08xx-xxxx-xxxx"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm"
              />
              {errors.noHP && <p className="text-red-500 text-xs mt-1">{errors.noHP.message}</p>}
            </div>

            {/* File Uploads */}
            <div className="pt-2 border-t">
              <p className="text-xs font-semibold text-gray-600 mb-3">Upload File (Format: PDF/JPG/PNG, Maks 1 MB)</p>

              {/* KTP */}
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">KTP/SIM/Paspor <span className="text-red-500">*</span></label>
                <input
                  type="file"
                  {...register("ktpFile")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm file:mr-2 file:px-2 file:py-1 file:bg-blue-50 file:text-[#003399] file:rounded file:border-0 file:text-xs file:font-semibold"
                />
              </div>

              {/* Surat Permohonan */}
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Surat Permohonan (Ditujukan kepada Kepala Stasiun) <span className="text-red-500">*</span></label>
                <input
                  type="file"
                  {...register("suratFile")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm file:mr-2 file:px-2 file:py-1 file:bg-blue-50 file:text-[#003399] file:rounded file:border-0 file:text-xs file:font-semibold"
                />
              </div>

              {/* Form Permintaan */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Form Permintaan Data <span className="text-red-500">*</span></label>
                  <a href="https://bit.ly/formulir-permohonan-data" target="_blank" rel="noopener noreferrer" className="text-[#003399] hover:underline text-xs font-semibold">
                    Unduh Template
                  </a>
                </div>
                <input
                  type="file"
                  {...register("formFile")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm file:mr-2 file:px-2 file:py-1 file:bg-blue-50 file:text-[#003399] file:rounded file:border-0 file:text-xs file:font-semibold"
                />
              </div>

              {fileErrors && <p className="text-red-500 text-xs mt-2">{fileErrors}</p>}
            </div>

            {/* Footer Note */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-4">
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Catatan:</span> Setelah mengupload, harap konfirmasi via WhatsApp ke <span className="font-bold text-[#003399]">0811-2562-200</span>
              </p>
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
                Kirim Permohonan
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
            <p className="text-gray-700 font-semibold">Permohonan berhasil dikirim!</p>
            <p className="text-gray-500 text-sm mt-2">Kami akan memproses permohonan Anda. Silakan tunggu konfirmasi dari kami.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
