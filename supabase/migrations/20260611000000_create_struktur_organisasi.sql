-- Create table struktur_organisasi
CREATE TABLE IF NOT EXISTS public.struktur_organisasi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jabatan text NOT NULL,
  nama text NOT NULL,
  inisial text NOT NULL,
  deskripsi text,
  urutan integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.struktur_organisasi ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Public can read active struktur_organisasi"
  ON public.struktur_organisasi FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admin can manage struktur_organisasi"
  ON public.struktur_organisasi FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Insert default values
INSERT INTO public.struktur_organisasi (jabatan, nama, inisial, deskripsi, urutan)
VALUES
  ('Kepala Stasiun', 'Drs. Nama Kepala', 'K', 'Pimpinan UPT', 1),
  ('Seksi Observasi', 'Kepala Seksi Observasi', 'O', 'Melakukan pengamatan, perekaman data cuaca maritim & instrumen meteorologi', 2),
  ('Seksi Data & Informasi', 'Kepala Seksi Data', 'D', 'Mengolah database, analisis klimatologi, dan penyebaran informasi cuaca', 3),
  ('Seksi Pelayanan', 'Kepala Seksi Pelayanan', 'P', 'Pelayanan jasa meteorologi, edukasi publik, dan hubungan kemitraan maritim', 4)
ON CONFLICT DO NOTHING;
