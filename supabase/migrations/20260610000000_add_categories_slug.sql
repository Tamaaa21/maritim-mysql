-- Migration: Add prakiraan_categories table + slug and category_id to prakiraan_images

-- 1) Create prakiraan_categories table
CREATE TABLE IF NOT EXISTS public.prakiraan_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text DEFAULT 'Sun',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.prakiraan_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read prakiraan categories"
  ON public.prakiraan_categories FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admin can manage prakiraan categories"
  ON public.prakiraan_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
    )
  );

-- 2) Add slug and category_id to prakiraan_images
ALTER TABLE public.prakiraan_images
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.prakiraan_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_prakiraan_images_slug ON public.prakiraan_images(slug);
CREATE INDEX IF NOT EXISTS idx_prakiraan_images_category_id ON public.prakiraan_images(category_id);

-- 3) Insert default categories
INSERT INTO public.prakiraan_categories (name, slug, description, icon) VALUES
  ('Kota Tegal', 'kota-tegal', 'Prakiraan cuaca untuk wilayah Kota Tegal', 'MapPin'),
  ('Pelabuhan', 'pelabuhan', 'Informasi cuaca khusus pelabuhan', 'Anchor'),
  ('Maritim', 'maritim', 'Prakiraan cuaca maritim untuk keselamatan pelayaran', 'Waves'),
  ('Pasang Surut', 'pasang-surut', 'Informasi pasang surut dan wisata bahari', 'TrendingUp')
ON CONFLICT (slug) DO NOTHING;
