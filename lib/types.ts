export interface User {
  id: string;
  username: string;
  role: "super_admin" | "admin" | "karyawan";
  nama: string;
  is_active: boolean;
  created_at: string;
}

export interface BukuTamu {
  id: string;
  nama: string;
  email: string;
  no_telepon: string;
  instansi: string | null;
  keperluan: string;
  foto_url: string | null;
  foto_data: string | null;
  created_at: string;
}

export interface PrakiraanImage {
  id: string;
  title: string;
  slug: string | null;
  url: string;
  explanation: string | null;
  waktu_mulai: string | null;
  waktu_berakhir: string | null;
  created_at: string;
  uploader: string | null;
  category_id: string | null;
  category: PrakiraanCategory | null;
  next_url: string | null;
  next_explanation: string | null;
  next_waktu_mulai: string | null;
  next_waktu_berakhir: string | null;
  display_type: string | null;
  gallery_images: string[] | null;
  prioritas: number | null;
}

export interface PrakiraanCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
}

export interface HeroImage {
  id: string;
  name: string;
  url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface KegiatanDocument {
  id: string;
  title: string;
  description: string | null;
  url: string;
  file_path: string | null;
  file_type: string | null;
  event_date: string | null;
  image_urls: string[] | null;
  youtube_url: string | null;
  created_at: string;
}

export interface LayananCard {
  id: string;
  nama_layanan: string;
  deskripsi: string | null;
  url_google_form: string | null;
  cover_url: string | null;
  created_at: string;
}

export interface LayananBerbayar {
  id: string;
  email: string;
  nama_lengkap: string;
  alamat: string;
  instansi: string | null;
  no_hp: string;
  ktp_file_path: string | null;
  surat_file_path: string | null;
  form_file_path: string | null;
  status: string;
  created_at: string;
}

export interface LayananNolRupiah {
  id: string;
  email: string;
  nama_lengkap: string;
  alamat: string;
  instansi: string | null;
  no_hp: string;
  tipe: string;
  ktp_file_path: string | null;
  surat_file_path: string | null;
  form_file_path: string | null;
  photo_path: string | null;
  status: string;
  created_at: string;
}

export interface LoginLog {
  id: string;
  user_id: string | null;
  username: string;
  ip_address: string | null;
  user_agent: string | null;
  aktivitas: string | null;
  created_at: string;
}

export interface StrukturOrganisasi {
  id: string;
  jabatan: string;
  nama: string;
  inisial: string | null;
  deskripsi: string | null;
  urutan: number;
  created_at: string;
}

export interface DisplaySlide {
  id: string;
  title: string;
  url: string;
  order: number;
  uploader: string | null;
  created_at: string;
}

export interface Publication {
  id: string;
  title: string;
  description: string | null;
  url: string;
  cover_url: string | null;
  uploader: string | null;
  created_at: string;
}
