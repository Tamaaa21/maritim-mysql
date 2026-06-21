import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username harus diisi"),
  password: z.string().min(1, "Password harus diisi"),
});

const passwordSchema = z.string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[A-Z]/, "Password harus mengandung huruf besar")
  .regex(/[a-z]/, "Password harus mengandung huruf kecil")
  .regex(/[0-9]/, "Password harus mengandung angka");

export const createUserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: passwordSchema,
  role: z.enum(["super_admin", "admin", "karyawan"]).default("karyawan"),
  nama: z.string().optional(),
});

export const updateUserSchema = z.object({
  nama: z.string().optional(),
  role: z.enum(["super_admin", "admin", "karyawan"]).optional(),
  is_active: z.boolean().optional(),
  password: passwordSchema.optional(),
});

export const prakiraanSchema = z.object({
  title: z.string().min(1, "Judul harus diisi"),
  slug: z.string().nullable().optional(),
  explanation: z.string().nullable().optional(),
  waktu_mulai: z.string().nullable().optional(),
  waktu_berakhir: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  display_type: z.enum(["gambar_saja", "gambar_teks", "gambar_galeri"]).nullable().optional(),
  url: z.string().nullable().optional(),
  next_url: z.string().nullable().optional(),
  next_explanation: z.string().nullable().optional(),
  next_waktu_mulai: z.string().nullable().optional(),
  next_waktu_berakhir: z.string().nullable().optional(),
  gallery_images: z.array(z.string()).nullable().optional(),
  prioritas: z.number().int().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  uploader: z.string().nullable().optional(),
});

export const bukuTamuSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  email: z.string().email("Email tidak valid"),
  no_telepon: z.string().min(1, "No telepon harus diisi"),
  instansi: z.string().optional(),
  keperluan: z.string().min(1, "Keperluan harus diisi"),
});

export const layananCardSchema = z.object({
  nama_layanan: z.string().min(1, "Nama layanan harus diisi"),
  deskripsi: z.string().nullable().optional(),
  url_google_form: z.string().nullable().optional(),
  cover_url: z.string().nullable().optional(),
});

export const strukturOrganisasiSchema = z.object({
  jabatan: z.string().min(1, "Jabatan harus diisi"),
  nama: z.string().optional(),
  inisial: z.string().optional(),
  deskripsi: z.string().optional(),
  urutan: z.number().int().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini harus diisi"),
  newPassword: passwordSchema,
});

export const heroImageSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  url: z.string().min(1, "URL harus diisi"),
  is_active: z.boolean().optional(),
});

export const displaySchema = z.object({
  title: z.string().optional(),
  url: z.string().optional(),
  waktu_berakhir: z.string().optional(),
});

export const publicationSchema = z.object({
  title: z.string().min(1, "Judul harus diisi"),
  description: z.string().optional(),
  url: z.string().optional(),
  cover_url: z.string().optional(),
  file_path: z.string().optional(),
});

export const kegiatanDocumentSchema = z.object({
  title: z.string().min(1, "Judul harus diisi").optional(),
  description: z.string().optional(),
  event_date: z.string().optional(),
  youtube_url: z.string().nullable().optional(),
});

export const bukuTamuSubmitSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  email: z.string().email("Email tidak valid"),
  no_telepon: z.string().min(1, "No telepon harus diisi"),
  instansi: z.string().optional(),
  keperluan: z.string().min(1, "Keperluan harus diisi"),
  foto_data: z.string().optional(),
});
