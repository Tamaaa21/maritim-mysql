"use client";

import { X, Camera, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

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
  const [fotoData, setFotoData] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setShowCamera(true); // Show camera UI first
      
      // Small delay to ensure DOM is ready
      await new Promise(r => setTimeout(r, 100));
      
      // Request camera with minimal constraints first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user"
        },
        audio: false,
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        // Set srcObject
        videoRef.current.srcObject = stream;
        
        // Add event listener for when metadata loads
        const onLoadedMetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log("Video playing successfully");
            }).catch(err => {
              console.error("Play error:", err);
              setCameraError("Tidak dapat memutar video kamera");
            });
          }
        };
        
        videoRef.current.addEventListener("loadedmetadata", onLoadedMetadata);
        
        // Fallback in case loadedmetadata doesn't fire
        setTimeout(() => {
          if (videoRef.current && videoRef.current.readyState < 2) {
            videoRef.current.play().catch(err => console.error("Fallback play error:", err));
          }
        }, 500);
      }
    } catch (error: any) {
      setShowCamera(false);
      let errMsg = "Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.";
      if (error.name === "NotReadableError" || error.message?.includes("Could not start video source")) {
        errMsg = "Kamera sedang digunakan oleh aplikasi atau tab lain (seperti Zoom, Google Meet, atau kamera Windows). Silakan tutup aplikasi tersebut dan coba lagi.";
      } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errMsg = "Izin akses kamera ditolak. Silakan berikan izin akses kamera pada pengaturan browser Anda.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errMsg = "Kamera tidak ditemukan. Pastikan perangkat kamera Anda terhubung dengan benar.";
      }
      setCameraError(errMsg);
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const captureFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        // Mirror the image (flip horizontally)
        context.scale(-1, 1);
        context.drawImage(videoRef.current, -videoRef.current.videoWidth, 0);
        
        const imageData = canvasRef.current.toDataURL("image/jpeg", 0.85);
        setFotoData(imageData);
        stopCamera();
      }
    }
  };

  const retakeFoto = () => {
    setFotoData(null);
    startCamera();
  };

  const removeFoto = () => {
    setFotoData(null);
  };

  const onSubmit = async (data: BukuTamuFormData) => {
    if (!fotoData) {
      alert("Foto wajib diambil!");
      return;
    }

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
          foto_data: fotoData,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      setSubmitted(true);
      await new Promise(r => setTimeout(r, 1500));
      reset();
      setFotoData(null);
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
        suppressHydrationWarning
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#003399] to-[#0055cc] text-white px-6 py-4 flex items-center justify-between border-b">
          <div>
            <h2 className="text-xl font-bold">Buku Tamu</h2>
            <p className="text-blue-100 text-xs mt-1">Silakan isi data Anda untuk menjadi tamu kami</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0">
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

            {/* Foto Section */}
            <div className="border-t pt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Foto <span className="text-red-500">*</span></label>
              
              {showCamera ? (
                <div className="space-y-3">
                  <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      disablePictureInPicture
                      className="absolute inset-0 w-full h-full bg-black"
                      style={{
                        WebkitTransform: 'scaleX(-1)',
                        MozTransform: 'scaleX(-1)',
                        transform: 'scaleX(-1)',
                        display: 'block',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                  {cameraError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-600">{cameraError}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={captureFoto}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Camera size={16} />
                      Ambil Foto
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : fotoData ? (
                <div className="space-y-3">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                    <img
                      src={fotoData}
                      alt="Captured foto"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={retakeFoto}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Camera size={16} />
                      Ulangi Foto
                    </button>
                    <button
                      type="button"
                      onClick={removeFoto}
                      className="flex-1 px-4 py-2 border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full px-4 py-3 border-2 border-dashed border-[#003399] bg-blue-50 hover:bg-blue-100 text-[#003399] font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Camera size={18} />
                  Buka Kamera
                </button>
              )}
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
                className="flex-1 px-4 py-2 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!fotoData}
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

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </div>
  );
}
