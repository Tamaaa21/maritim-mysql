/*
  # Create CMS Tables for BMKG Portal

  1. New Tables
    - `admin_users` - Admin user mapping
    - `buku_tamu` - Guest book entries
    - `layanan_berbayar` - Paid service requests
    - `layanan_nol_rupiah` - Free service requests
    - `hero_images` - Hero section background images
    - `prakiraan_images` - Forecast section main image

  2. Security
    - Enable RLS on all tables
    - Public read for images, authenticated write
    - Private write for forms, admin read
*/

-- Create admin_users table first (no RLS - managed by system)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create buku_tamu table
CREATE TABLE IF NOT EXISTS public.buku_tamu (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  email text NOT NULL,
  no_telepon text NOT NULL,
  instansi text,
  keperluan text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.buku_tamu ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert buku tamu"
  ON public.buku_tamu FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Admin can read buku tamu"
  ON public.buku_tamu FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Create layanan_berbayar table
CREATE TABLE IF NOT EXISTS public.layanan_berbayar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  nama_lengkap text NOT NULL,
  alamat text NOT NULL,
  instansi text,
  no_hp text NOT NULL,
  ktp_file_path text,
  surat_file_path text,
  form_file_path text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.layanan_berbayar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert layanan berbayar"
  ON public.layanan_berbayar FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Admin can read layanan berbayar"
  ON public.layanan_berbayar FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Create layanan_nol_rupiah table
CREATE TABLE IF NOT EXISTS public.layanan_nol_rupiah (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  nama_lengkap text NOT NULL,
  alamat text NOT NULL,
  instansi text,
  no_hp text NOT NULL,
  tipe text NOT NULL,
  ktp_file_path text,
  surat_file_path text,
  form_file_path text,
  photo_path text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.layanan_nol_rupiah ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert layanan nol rupiah"
  ON public.layanan_nol_rupiah FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Admin can read layanan nol rupiah"
  ON public.layanan_nol_rupiah FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Create hero_images table
CREATE TABLE IF NOT EXISTS public.hero_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active hero images"
  ON public.hero_images FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Admin can manage hero images"
  ON public.hero_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Create prakiraan_images table
CREATE TABLE IF NOT EXISTS public.prakiraan_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.prakiraan_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active prakiraan images"
  ON public.prakiraan_images FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Admin can manage prakiraan images"
  ON public.prakiraan_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );
