"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LogIn, User, Lock } from "lucide-react";
import { Input } from '@/components/ui/input';
import DistortedCaptcha, { DistortedCaptchaRef } from "@/components/ui/DistortedCaptcha";

export default function AdminLoginPage() {
  const router = useRouter();
  const captchaRef = useRef<DistortedCaptchaRef>(null);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!captchaValid) {
      setError("Captcha tidak valid. Silakan coba lagi.");
      captchaRef.current?.refresh();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        const text = await response.text();
        console.error("Failed to parse JSON from /api/admin/login:", parseErr, text);
        setError("Terjadi kesalahan pada respons server");
        return;
      }

      if (!response.ok) {
        setError(data?.message || "Login gagal");
        captchaRef.current?.refresh();
        return;
      }

      router.push("/admin/dashboard");
    } catch (err) {
      setError("Terjadi kesalahan server");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-[#001133] via-[#002266] to-[#003399]">
      {/* Modern ambient glows for a premium look */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-8 md:p-10 relative">
          
          {/* Subtle top highlight */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#003399]/20 to-transparent" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white p-2 rounded-2xl shadow-md border border-slate-100 flex items-center justify-center mx-auto mb-4 hover:scale-105 transition-transform duration-350">
              <img src="/bmkg-logo.png" alt="BMKG Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-[10px] font-bold text-[#003399] uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              Portal Admin
            </span>
            <h1 className="text-xl font-bold text-gray-800 mt-4">BMKG Maritim Tegal</h1>
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed font-medium">
              Stasiun Meteorologi Maritim Tegal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-red-700 text-sm font-medium leading-normal">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 pl-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003399] transition-colors">
                  <User size={18} />
                </div>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="pl-10 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-[#003399] focus-visible:border-[#003399] h-12 rounded-xl transition-all focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 pl-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003399] transition-colors">
                  <Lock size={18} />
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="pl-10 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-[#003399] focus-visible:border-[#003399] h-12 rounded-xl transition-all focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="bg-slate-50 p-4 rounded-xl shadow-inner border border-slate-200/60">
                <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Verifikasi Keamanan</p>
                <DistortedCaptcha 
                  ref={captchaRef} 
                  onValidateChange={setCaptchaValid} 
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 bg-[#003399] hover:bg-[#002a80] text-white font-semibold rounded-xl transition-all duration-300 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Masuk ke Sistem
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
