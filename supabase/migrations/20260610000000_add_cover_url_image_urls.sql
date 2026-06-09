ALTER TABLE public.layanan_cards ADD COLUMN IF NOT EXISTS cover_url text;

ALTER TABLE public.kegiatan_documents ADD COLUMN IF NOT EXISTS image_urls jsonb DEFAULT '[]'::jsonb;
