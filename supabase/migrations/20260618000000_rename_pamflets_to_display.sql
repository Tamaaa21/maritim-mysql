-- Rename pamflets table to display
ALTER TABLE IF EXISTS public.pamflets RENAME TO "display";

ALTER TABLE public.display RENAME CONSTRAINT pamflets_pkey TO display_pkey;

ALTER INDEX IF EXISTS idx_pamflets_order RENAME TO idx_display_order;

ALTER POLICY "Public can read pamflets" ON public.display RENAME TO "Public can read display";

ALTER POLICY "Admin can manage pamflets" ON public.display RENAME TO "Admin can manage display";

COMMENT ON TABLE public.display IS 'Display slides for the public slideshow';
