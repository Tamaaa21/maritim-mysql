"use client";

import { useState, useEffect } from "react";
import { Plus, X, Edit3, Trash2, UserPlus, Shield, ShieldOff, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { showSuccess, showError, showConfirm } from '@/lib/sweetalert';
import { csrfFetch } from '@/lib/csrf';

interface User {
  id: string;
  username: string;
  role: string;
  nama: string;
  is_active: boolean;
  created_at: string;
}

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingUser, setEditingUser] = useState<{
    id?: string;
    username: string;
    password: string;
    confirmPassword: string;
    nama: string;
    role: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await csrfFetch("/api/admin/users");
      const json = await res.json();
      if (json?.success) {
        setUsers(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setModalMode("add");
    setEditingUser({ username: "", password: "", confirmPassword: "", nama: "", role: "user" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setModalMode("edit");
    setEditingUser({
      id: user.id,
      username: user.username,
      password: "",
      confirmPassword: "",
      nama: user.nama,
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (user: User) => {
    const confirm = await showConfirm(user.is_active ? "Nonaktifkan Akun?" : "Aktifkan Akun?", `Anda akan ${user.is_active ? "menonaktifkan" : "mengaktifkan"} akun ${user.username}`);
    if (!confirm.isConfirmed) return;
    try {
      const res = await csrfFetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      const json = await res.json();
      if (json?.success) {
        showSuccess('Berhasil', `Akun berhasil ${user.is_active ? "dinonaktifkan" : "diaktifkan"}`);
        fetchUsers();
      } else {
        showError('Gagal', json?.message || 'Gagal mengubah status');
      }
    } catch (err) {
      console.error(err);
      showError('Error', 'Terjadi kesalahan koneksi');
    }
  };

  const handleDelete = async (user: User) => {
    const confirm = await showConfirm('Hapus Akun?', `Hapus akun ${user.username}? Tindakan ini tidak dapat dibatalkan.`);
    if (!confirm.isConfirmed) return;
    try {
      const res = await csrfFetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json?.success) {
        showSuccess('Berhasil Dihapus', 'Akun berhasil dihapus');
        fetchUsers();
      } else {
        showError('Gagal Menghapus', json?.message || "Gagal menghapus pengguna");
      }
    } catch (err) {
      console.error(err);
      showError('Error', 'Terjadi kesalahan saat menghapus');
    }
  };

  const handleModalSave = async () => {
    if (!editingUser) return;
    if (!editingUser.username.trim()) {
      showError('Validasi Gagal', "Username harus diisi");
      return;
    }
    if (modalMode === "add" && !editingUser.password) {
      showError('Validasi Gagal', "Password harus diisi");
      return;
    }
    if (editingUser.password && editingUser.password !== editingUser.confirmPassword) {
      showError('Validasi Gagal', "Konfirmasi password tidak cocok");
      return;
    }

    setSaving(true);
    try {
      if (modalMode === "add") {
        const res = await csrfFetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingUser),
        });
        const json = await res.json();
        if (json?.success) {
          showSuccess('Berhasil', 'Pengguna berhasil ditambahkan');
          fetchUsers();
          setIsModalOpen(false);
          setEditingUser(null);
        } else {
          showError('Gagal', json?.message || "Gagal menambahkan pengguna");
        }
      } else if (editingUser.id) {
        const payload: Record<string, unknown> = { nama: editingUser.nama, role: editingUser.role };
        if (editingUser.password) {
          payload.password = editingUser.password;
        }
        const res = await csrfFetch(`/api/admin/users/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json?.success) {
          showSuccess('Berhasil', 'Pengguna berhasil diperbarui');
          fetchUsers();
          setIsModalOpen(false);
          setEditingUser(null);
        } else {
          showError('Gagal', json?.message || "Gagal memperbarui pengguna");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      showError('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.nama || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Karyawan</h1>
          <p className="text-gray-500 mt-2">Kelola hak akses pengguna panel administrasi.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-[#003399] hover:bg-[#0044cc] text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <UserPlus size={18} /> Tambah Karyawan
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Daftar Pengguna</h2>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pengguna..."
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-[#003399] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl bg-gray-50">
            <UserPlus className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500 text-sm">Belum ada pengguna.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 font-semibold text-gray-500">Username</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-500 hidden sm:table-cell">Nama</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-500">Role</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-500 hidden md:table-cell">Status</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-500 hidden lg:table-cell">Dibuat</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-semibold text-gray-900">{user.username}</span>
                      <span className="sm:hidden text-gray-400 text-[10px] block">{user.nama || "-"}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 hidden sm:table-cell">{user.nama || "-"}</td>
                    <td className="py-3 px-3">
                      {user.role === "super_admin" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] font-bold">
                          <Shield size={10} /> Super Admin
                        </span>
                      ) : user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold">
                          <Shield size={10} /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-full text-[10px] font-bold">
                          Karyawan
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 hidden md:table-cell">
                      {user.is_active ? (
                        <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold">Aktif</span>
                      ) : (
                        <span className="text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-[10px] font-bold">Nonaktif</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-gray-500 text-xs hidden lg:table-cell">
                      {new Date(user.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-[#003399] transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`p-2 hover:bg-orange-50 rounded-lg transition-colors ${user.is_active ? "text-orange-500" : "text-emerald-500"}`}
                          title={user.is_active ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {user.is_active ? <ShieldOff size={14} /> : <Shield size={14} />}
                        </button>
                        {user.role !== "super_admin" && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && editingUser && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => { if (!saving) { setIsModalOpen(false); setEditingUser(null); } }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === "add" ? "Tambah Karyawan Baru" : "Edit Karyawan"}
              </h2>
              {!saving && (
                <button onClick={() => { setIsModalOpen(false); setEditingUser(null); }}
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Username</label>
                <Input
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  placeholder="Masukkan username"
                  disabled={modalMode === "edit" || saving}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Nama Lengkap</label>
                <Input
                  value={editingUser.nama}
                  onChange={(e) => setEditingUser({ ...editingUser, nama: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  disabled={saving}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Password {modalMode === "edit" ? "(kosongkan jika tidak diubah)" : ""}
                </label>
                <Input
                  type="password"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  placeholder={modalMode === "add" ? "Minimal 6 karakter" : "Biarkan kosong jika tidak diubah"}
                  disabled={saving}
                />
              </div>

              {editingUser.password && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Konfirmasi Password</label>
                  <Input
                    type="password"
                    value={editingUser.confirmPassword}
                    onChange={(e) => setEditingUser({ ...editingUser, confirmPassword: e.target.value })}
                    placeholder="Ulangi password"
                    disabled={saving}
                    className={editingUser.confirmPassword && editingUser.password !== editingUser.confirmPassword ? "border-red-400 focus:ring-red-400" : ""}
                  />
                  {editingUser.confirmPassword && editingUser.password !== editingUser.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">Password tidak cocok</p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Hak Akses (Role)</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-900"
                  disabled={saving}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  <strong>Admin:</strong> bisa tambah/hapus pengguna. <strong>Karyawan:</strong> hanya bisa upload/edit konten.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              <button onClick={() => { setIsModalOpen(false); setEditingUser(null); }}
                disabled={saving}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                Batal
              </button>
              <button onClick={handleModalSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-1.5">
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
