"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LogIn } from "lucide-react";
import { Input } from '@/components/ui/input';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
        // If response is not JSON (e.g., HTML error page), fall back to text
        const text = await response.text();
        console.error("Failed to parse JSON from /api/admin/login:", parseErr, text);
        setError("Terjadi kesalahan pada respons server");
        return;
      }

      if (!response.ok) {
        setError(data?.message || "Login gagal");
        return;
      }

      sessionStorage.setItem("adminToken", data.token);
      if (data.user) {
        sessionStorage.setItem("adminUser", JSON.stringify(data.user));
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
    <div className="min-h-screen bg-gradient-to-br from-[#003399] to-[#0055cc] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#003399] rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-2">BMKG Stasiun Meteorologi Maritim Tegal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        {/* <p className="text-center text-gray-500 text-xs mt-6">
          Demo: username: <span className="font-mono">admin</span> | password: <span className="font-mono">admin123</span>
        </p> */}
      </div>
    </div>
  );
}
