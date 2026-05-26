"use client";

import { X, Camera } from "lucide-react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import Webcam from "react-webcam";

interface LayananNolRupiahFormData {
  email: string;
  namaLengkap: string;
  alamat: string;
  instansi: string;
  noHP: string;
  ktpFile: FileList;
  suratFile: FileList;
  formFile: FileList;
}

interface LayananNolRupiahModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LayananNolRupiahModal({ isOpen, onClose }: LayananNolRupiahModalProps) {
  const [stage, setStage] = useState<"choice" | "form">("choice");
  const [selectedType, setSelectedType] = useState<"instansi" | "pelajar" | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LayananNolRupiahFormData>();
  const [submitted, setSubmitted] = useState(false);
  const [fileErrors, setFileErrors] = useState<string>("");
  const webcamRef = useRef<Webcam>(null);

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

  const handleStartForm = (type: "instansi" | "pelajar") => {
    setSelectedType(type);
    setStage("form");
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedPhoto(imageSrc);
        setShowCamera(false);
      }
    }
  };

  const onSubmit = async (data: LayananNolRupiahFormData) => {
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
    if (!capturedPhoto) {
      setFileErrors("Foto verifikasi wajib diambil melalui kamera");
      return;
    }

    try {
      await fetch("/api/submit/layanan-nol-rupiah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          nama_lengkap: data.namaLengkap,
          alamat: data.alamat,
          instansi: data.instansi || null,
          no_hp: data.noHP,
          tipe: selectedType,
        }),
      });

      setSubmitted(true);
      await new Promise(r => setTimeout(r, 1500));
      reset();
      setCapturedPhoto(null);
      setSubmitted(false);
      setStage("choice");
      setSelectedType(null);
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
            <h2 className="text-xl font-bold">Layanan Nol Rupiah</h2>
            <p className="text-blue-100 text-xs mt-1">Layanan gratis untuk masyarakat dan pelajar</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {stage === "choice" && !submitted && (
          <div className="p-8 space-y-4">
            <p className="text-center text-gray-600 font-medium mb-8">Pilih kategori yang sesuai dengan Anda:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => handleStartForm("instansi")}
                className="p-6 border-2 border-gray-200 hover:border-[#003399] rounded-xl text-center transition-all group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200">
                  <svg className="w-6 h-6 text-[#003399]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4 0h1m-1-4h1" />
                  </svg>
                </div>
                <p className="font-bold text-gray-900">Instansi</p>
                <p className="text-gray-500 text-xs mt-2">Untuk instansi pemerintah atau swasta</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => handleStartForm("pelajar")}
                className="p-6 border-2 border-gray-200 hover:border-[#003399] rounded-xl text-center transition-all group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200">
                  <svg className="w-6 h-6 text-[#003399]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.25S6.5 28 12 28s10-4.745 10-10.75S17.5 6.253 12 6.253z" />
                  </svg>
                </div>
                <p className="font-bold text-gray-900">Pelajar/Mahasiswa</p>
                <p className="text-gray-500 text-xs mt-2">Untuk pelajar dan mahasiswa</p>
              </motion.button>
            </div>
          </div>
        )}

        {stage === "form" && !submitted && (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-[#003399] font-semibold rounded">{selectedType === "instansi" ? "Instansi" : "Pelajar/Mahasiswa"}</span>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                {...register("email", { required: "Email wajib diisi" })}
                placeholder="nama@email.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
              <input
                type="text"
                {...register("namaLengkap", { required: "Nama lengkap wajib diisi" })}
                placeholder="Masukkan nama lengkap"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm"
              />
              {errors.namaLengkap && <p className="text-red-500 text-xs mt-1">{errors.namaLengkap.message}</p>}
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat <span className="text-red-500">*</span></label>
              <textarea
                {...register("alamat", { required: "Alamat wajib diisi" })}
                placeholder="Masukkan alamat"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm resize-none"
              />
              {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat.message}</p>}
            </div>

            {/* Instansi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{selectedType === "pelajar" ? "Nama Sekolah/Universitas" : "Instansi"}</label>
              <input
                type="text"
                {...register("instansi")}
                placeholder={selectedType === "pelajar" ? "Nama sekolah atau universitas" : "Nama instansi"}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm"
              />
            </div>

            {/* No. HP */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">No. HP <span className="text-red-500">*</span></label>
              <input
                type="tel"
                {...register("noHP", { required: "No. HP wajib diisi" })}
                placeholder="08xx-xxxx-xxxx"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm"
              />
              {errors.noHP && <p className="text-red-500 text-xs mt-1">{errors.noHP.message}</p>}
            </div>

            {/* Camera Section */}
            <div className="border-t pt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Foto Verifikasi (via Kamera) <span className="text-red-500">*</span></label>
              {!showCamera && !capturedPhoto && (
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#003399] text-gray-600 hover:text-[#003399] transition-colors text-sm font-semibold"
                >
                  <Camera size={18} />
                  Ambil Foto
                </button>
              )}

              {showCamera && (
                <div className="space-y-3">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full rounded-lg"
                    videoConstraints={{ facingMode: "user" }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 px-3 py-2 bg-[#003399] text-white font-semibold rounded-lg hover:bg-[#0044cc] transition-colors text-sm"
                    >
                      Ambil Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCamera(false)}
                      className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {capturedPhoto && (
                <div className="space-y-2">
                  <div className="relative">
                    <img src={capturedPhoto} alt="Captured" className="w-full rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setCapturedPhoto(null)}
                      className="absolute top-2 right-2 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded font-semibold transition-colors"
                    >
                      Ubah
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* File Uploads */}
            <div className="pt-2 border-t">
              <p className="text-xs font-semibold text-gray-600 mb-3">Upload File (Format: PDF/JPG/PNG, Maks 1 MB)</p>

              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">KTP/SIM/Paspor <span className="text-red-500">*</span></label>
                <input
                  type="file"
                  {...register("ktpFile")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm file:mr-2 file:px-2 file:py-1 file:bg-blue-50 file:text-[#003399] file:rounded file:border-0 file:text-xs file:font-semibold"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Surat Permohonan <span className="text-red-500">*</span></label>
                <input
                  type="file"
                  {...register("suratFile")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm file:mr-2 file:px-2 file:py-1 file:bg-blue-50 file:text-[#003399] file:rounded file:border-0 file:text-xs file:font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Form Permintaan Data <span className="text-red-500">*</span></label>
                  <a href="https://bit.ly/formulir-permohonan-data" target="_blank" rel="noopener noreferrer" className="text-[#003399] hover:underline text-xs font-semibold">
                    Unduh
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

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => { setStage("choice"); setSelectedType(null); }}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Kirim Permohonan
              </button>
            </div>
          </form>
        )}

        {submitted && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold">Permohonan berhasil dikirim!</p>
            <p className="text-gray-500 text-sm mt-2">Terima kasih. Kami akan memproses permohonan Anda.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
