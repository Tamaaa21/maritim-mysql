-- MySQL Schema for BMKG Maritim Tegal
-- Run: mysql -u root -p < scripts/init.sql

CREATE DATABASE IF NOT EXISTS bmkg_maritim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bmkg_maritim;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'karyawan',
  nama VARCHAR(255) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin users (legacy)
CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Buku tamu
CREATE TABLE IF NOT EXISTS buku_tamu (
  id VARCHAR(36) PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  no_telepon VARCHAR(50) NOT NULL,
  instansi VARCHAR(255) DEFAULT NULL,
  keperluan TEXT NOT NULL,
  foto_url TEXT DEFAULT NULL,
  foto_data LONGTEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Layanan berbayar
CREATE TABLE IF NOT EXISTS layanan_berbayar (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(255) NOT NULL,
  alamat TEXT NOT NULL,
  instansi VARCHAR(255) DEFAULT NULL,
  no_hp VARCHAR(50) NOT NULL,
  ktp_file_path TEXT DEFAULT NULL,
  surat_file_path TEXT DEFAULT NULL,
  form_file_path TEXT DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Layanan nol rupiah
CREATE TABLE IF NOT EXISTS layanan_nol_rupiah (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(255) NOT NULL,
  alamat TEXT NOT NULL,
  instansi VARCHAR(255) DEFAULT NULL,
  no_hp VARCHAR(50) NOT NULL,
  tipe VARCHAR(50) NOT NULL,
  ktp_file_path TEXT DEFAULT NULL,
  surat_file_path TEXT DEFAULT NULL,
  form_file_path TEXT DEFAULT NULL,
  photo_path TEXT DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Hero images
CREATE TABLE IF NOT EXISTS hero_images (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Prakiraan categories
CREATE TABLE IF NOT EXISTS prakiraan_categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  icon VARCHAR(50) DEFAULT 'Sun',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Prakiraan images
CREATE TABLE IF NOT EXISTS prakiraan_images (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  slug VARCHAR(255) DEFAULT NULL,
  explanation TEXT DEFAULT NULL,
  waktu_mulai TIMESTAMP NULL DEFAULT NULL,
  waktu_berakhir TIMESTAMP NULL DEFAULT NULL,
  next_url TEXT DEFAULT NULL,
  next_explanation TEXT DEFAULT NULL,
  next_waktu_mulai TIMESTAMP NULL DEFAULT NULL,
  next_waktu_berakhir TIMESTAMP NULL DEFAULT NULL,
  display_type VARCHAR(50) DEFAULT NULL,
  gallery_images JSON DEFAULT NULL,
  prioritas INT DEFAULT 1,
  category_id VARCHAR(36) DEFAULT NULL,
  uploader VARCHAR(255) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES prakiraan_categories(id) ON DELETE SET NULL
);

-- Kegiatan documents
CREATE TABLE IF NOT EXISTS kegiatan_documents (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  category VARCHAR(255) DEFAULT NULL,
  url TEXT NOT NULL,
  file_path TEXT DEFAULT NULL,
  file_type VARCHAR(50) DEFAULT NULL,
  event_date DATE DEFAULT NULL,
  image_urls JSON DEFAULT '[]',
  youtube_url TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Layanan cards
CREATE TABLE IF NOT EXISTS layanan_cards (
  id VARCHAR(36) PRIMARY KEY,
  nama_layanan VARCHAR(255) NOT NULL,
  deskripsi TEXT DEFAULT NULL,
  url_google_form TEXT DEFAULT NULL,
  cover_url TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Struktur organisasi
CREATE TABLE IF NOT EXISTS struktur_organisasi (
  id VARCHAR(36) PRIMARY KEY,
  jabatan VARCHAR(255) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  inisial VARCHAR(50) NOT NULL,
  deskripsi TEXT DEFAULT NULL,
  urutan INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Display (pamflets)
CREATE TABLE IF NOT EXISTS display (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  `order` INT NOT NULL DEFAULT 0,
  uploader VARCHAR(255) DEFAULT NULL,
  waktu_berakhir TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Publications
CREATE TABLE IF NOT EXISTS publications (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT '',
  description TEXT DEFAULT NULL,
  url TEXT NOT NULL,
  file_path TEXT DEFAULT NULL,
  cover_url TEXT DEFAULT NULL,
  uploader VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Login logs
CREATE TABLE IF NOT EXISTS login_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) DEFAULT NULL,
  username VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  aktivitas VARCHAR(255) DEFAULT 'login',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default admin user (password: admin123)
-- NOTE: Password is bcrypt-hashed. To create with a custom password, run:
--   node scripts/seed.js
-- (requires .env.local with MySQL credentials)
-- INSERT INTO users (id, username, password, role, nama, is_active)
-- VALUES (UUID(), 'admin', '$2a$12$...', 'super_admin', 'Administrator', true);

-- Insert default prakiraan categories
INSERT INTO prakiraan_categories (id, name, slug, description, icon) VALUES
  (UUID(), 'Kota Tegal', 'kota-tegal', 'Prakiraan cuaca untuk wilayah Kota Tegal', 'Sun'),
  (UUID(), 'Pelabuhan', 'pelabuhan', 'Prakiraan cuaca untuk wilayah Pelabuhan', 'Ship'),
  (UUID(), 'Maritim', 'maritim', 'Prakiraan cuaca maritim', 'Waves'),
  (UUID(), 'Pasang Surut', 'pasang-surut', 'Informasi pasang surut air laut', 'Droplets')
ON DUPLICATE KEY UPDATE name = VALUES(name);
