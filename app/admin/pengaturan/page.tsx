"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Save, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { showSuccess, showError } from '@/lib/sweetalert';

export default function PengaturanPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      showError("Gagal", "Semua field harus diisi");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Gagal", "Konfirmasi kata sandi baru tidak cocok");
      return;
    }

    if (newPassword.length < 6) {
      showError("Gagal", "Kata sandi baru harus minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      // Get current username from session
      let username = "";
      try {
        const stored = sessionStorage.getItem("adminUser");
        if (stored) username = JSON.parse(stored).username || "";
      } catch {}

      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-username": username,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess("Berhasil", "Kata sandi berhasil diubah");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showError("Gagal", data.message || "Gagal mengubah kata sandi");
      }
    } catch (err) {
      console.error(err);
      showError("Gagal", "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan Akun</h1>
        <p className="text-gray-500 mt-2">Kelola kata sandi dan keamanan panel administrator.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="text-[#003399]" size={20} />
          Ubah Kata Sandi
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Old Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Kata Sandi Lama</label>
            <div className="relative">
              <Input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan kata sandi lama"
                className="pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Kata Sandi Baru</label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan kata sandi baru (min. 6 karakter)"
                className="pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Konfirmasi Kata Sandi Baru</label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#003399] hover:bg-[#0044cc] text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Menyimpan..." : "Simpan Kata Sandi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
