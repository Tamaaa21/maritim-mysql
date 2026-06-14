"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Camera, Trash2, CheckCircle2, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";

interface BukuTamuFormData {
  nama: string;
  email: string;
  instansi: string;
  keperluan: string;
  noTelepon: string;
}

export default function BukuTamuPage() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<BukuTamuFormData>();
  const [submitted, setSubmitted] = useState(false);
  const [fotoData, setFotoData] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera stream on unmount
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
      setShowCamera(true);

      await new Promise(r => setTimeout(r, 100));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        const onLoadedMetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error("Play error:", err);
              setCameraError("Tidak dapat memutar video kamera");
            });
          }
        };

        videoRef.current.addEventListener("loadedmetadata", onLoadedMetadata);

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

    setLoading(true);
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

      if (!response.ok) throw new Error("Gagal mengirim data");

      setSubmitted(true);
      reset();
      setFotoData(null);
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim data buku tamu. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-[#f0f4fa] to-slate-50 flex flex-col justify-between relative overflow-hidden">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl -z-10 -ml-20 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl -z-10 -mr-20 pointer-events-none" />

      <Navbar minimal />

      <div className="flex-1 flex items-center justify-center pt-28 pb-16 px-4 md:px-8">
        <div className="max-w-6xl w-full">
          {/* Main Card Split Layout */}
          <div className="w-full bg-white border border-slate-200/80 rounded-[32px] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
            
            {/* Left Column: Dark Blue Info Banner */}
            <div className="w-full lg:w-[38%] bg-gradient-to-br from-[#002266] to-[#003399] p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white p-2 border border-white/10 shadow-sm flex items-center justify-center mb-8">
                  <img src="/bmkg-logo.png" alt="BMKG" className="w-full h-full object-contain" />
                </div>
                
                <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">Buku Tamu Digital</span>
                <h1 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight mt-2">
                  Buku Tamu Kunjungan
                </h1>
                <p className="text-blue-100/80 text-xs mt-4 leading-relaxed max-w-sm">
                  Selamat datang di Stasiun Meteorologi Maritim Tegal. Silakan isi formulir di samping untuk mendokumentasikan kunjungan Anda secara resmi.
                </p>

                {/* Steps / Guidelines */}
                <div className="space-y-5 mt-8 lg:mt-12">
                  <div className="flex gap-3.5 items-start">
                    <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-blue-200 font-extrabold text-xs">1</div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-normal">Data Diri</h4>
                      <p className="text-[11px] text-blue-100/70 leading-normal">Isi nama, email, telepon, dan instansi Anda.</p>
                    </div>
                  </div>
                  <div className="flex gap-3.5 items-start">
                    <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-blue-200 font-extrabold text-xs">2</div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-normal">Foto Identitas/Kunjungan</h4>
                      <p className="text-[11px] text-blue-100/70 leading-normal">Ambil foto selfie/kunjungan Anda melalui kamera.</p>
                    </div>
                  </div>
                  <div className="flex gap-3.5 items-start">
                    <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-blue-200 font-extrabold text-xs">3</div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-normal">Kirim</h4>
                      <p className="text-[11px] text-blue-100/70 leading-normal">Kirim formulir dan data Anda terenkripsi dengan aman.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-12 lg:mt-0 pt-6 border-t border-white/10">
                <p className="text-[9px] uppercase tracking-widest font-black text-blue-300/75 leading-none">
                  Stasiun Maritim Tegal
                </p>
                <p className="text-[8px] text-blue-300/40 mt-1 leading-none" suppressHydrationWarning>
                  © {new Date().getFullYear()} BMKG Indonesia. All rights reserved.
                </p>
              </div>
            </div>

            {/* Right Column: Form Container */}
            <div className="w-full lg:w-[62%] p-6 sm:p-8 lg:p-12 bg-white flex flex-col justify-center">
              {!submitted ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Grid for text inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Nama */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        {...register("nama", { required: "Nama lengkap wajib diisi" })}
                        placeholder="Masukkan nama lengkap Anda"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#003399] text-sm transition-all"
                      />
                      {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        {...register("email", {
                          required: "Email wajib diisi",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Format email tidak valid"
                          }
                        })}
                        placeholder="nama@email.com"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#003399] text-sm transition-all"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    {/* No. Telepon */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">No. Telepon/WhatsApp <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        {...register("noTelepon", { required: "Nomor telepon wajib diisi" })}
                        placeholder="Contoh: 081234567890"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#003399] text-sm transition-all"
                      />
                      {errors.noTelepon && <p className="text-red-500 text-xs mt-1">{errors.noTelepon.message}</p>}
                    </div>

                    {/* Instansi */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Instansi / Organisasi / Sekolah</label>
                      <input
                        type="text"
                        {...register("instansi")}
                        placeholder="Nama instansi (opsional)"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#003399] text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Keperluan */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Keperluan Kunjungan <span className="text-red-500">*</span></label>
                    <textarea
                      {...register("keperluan", { required: "Jelaskan tujuan atau keperluan kunjungan Anda" })}
                      placeholder="Contoh: Koordinasi data maritim, kunjungan sekolah, studi banding, dll."
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#003399] text-sm resize-none transition-all"
                    />
                    {errors.keperluan && <p className="text-red-500 text-xs mt-1">{errors.keperluan.message}</p>}
                  </div>

                  {/* Kamera / Capture Foto */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Foto Kunjungan / Identitas <span className="text-red-500">*</span></label>

                    {showCamera ? (
                      <div className="space-y-4">
                        <div className="relative w-full bg-black rounded-2xl overflow-hidden aspect-video border border-slate-250 shadow-inner max-w-md mx-auto animate-fade-in">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            disablePictureInPicture
                            className="absolute inset-0 w-full h-full bg-black object-cover"
                            style={{ transform: "scaleX(-1)" }}
                          />
                        </div>
                        {cameraError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto">
                            <p className="text-xs text-red-600 text-center">{cameraError}</p>
                          </div>
                        )}
                        <div className="flex gap-3 max-w-md mx-auto">
                          <button
                            type="button"
                            onClick={captureFoto}
                            className="flex-1 px-5 py-3 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-md active:scale-95"
                          >
                            <Camera size={14} />
                            Ambil Foto
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="flex-1 px-5 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all text-xs active:scale-95"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : fotoData ? (
                      <div className="space-y-4">
                        <div className="relative bg-slate-50 rounded-2xl overflow-hidden aspect-video border border-slate-200 max-w-md mx-auto shadow-inner">
                          <img
                            src={fotoData}
                            alt="Foto kunjungan"
                            className="w-full h-full object-cover animate-fade-in"
                          />
                        </div>
                        <div className="flex gap-3 max-w-md mx-auto">
                          <button
                            type="button"
                            onClick={retakeFoto}
                            className="flex-1 px-5 py-3 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-md active:scale-95"
                          >
                            <Camera size={14} />
                            Foto Ulang
                          </button>
                          <button
                            type="button"
                            onClick={removeFoto}
                            className="flex-1 px-5 py-3 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all text-xs flex items-center justify-center gap-2 active:scale-95"
                          >
                            <Trash2 size={14} />
                            Hapus Foto
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-md mx-auto w-full">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="w-full px-5 py-6 border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50/20 hover:border-blue-500/50 text-slate-500 hover:text-[#003399] font-bold rounded-2xl transition-all text-xs flex flex-col items-center justify-center gap-2.5 cursor-pointer active:scale-98"
                        >
                          <div className="w-10 h-10 bg-blue-50 border border-blue-100/50 rounded-full flex items-center justify-center mb-0.5 text-[#003399] shadow-sm">
                            <Camera size={18} />
                          </div>
                          Buka Kamera & Ambil Foto
                        </button>
                        <p className="text-slate-400 text-[9px] text-center mt-2.5">
                          * Kamera perangkat akan diaktifkan untuk validasi foto tamu.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Submit button */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={loading || !fotoData}
                      className="w-full py-3.5 bg-[#003399] hover:bg-[#0044cc] text-white font-bold rounded-xl transition-all text-xs shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      {loading ? "Mengirim..." : "Kirim Buku Tamu"}
                      {!loading && <ChevronRight size={14} />}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-8 lg:p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Buku Tamu Terkirim!</h3>
                  <p className="text-gray-500 text-sm mt-3 max-w-sm leading-relaxed">
                    Terima kasih telah berkunjung. Data kunjungan Anda telah disimpan secara aman di Stasiun Meteorologi Maritim Tegal.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all border border-slate-200/50"
                  >
                    Isi Kembali
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}
