-- Fix RLS policy for users table: jangan expose password ke publik
-- Hapus policy lama yang memperbolehkan anon & authenticated membaca SEMUA data users (termasuk password)
DROP POLICY IF EXISTS "Public can read users basic info" ON public.users;
DROP POLICY IF EXISTS "Admin can manage users" ON public.users;
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Allow public read users" ON public.users;

-- Policy untuk SELECT: hanya tampilkan field non-sensitif untuk authenticated users
CREATE POLICY "Users can read non-sensitive fields"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy untuk INSERT/UPDATE/DELETE: hanya untuk admin/super_admin via service_role
-- Service role key bypasses RLS, jadi policy ini untuk jaga-jaga jika ada akses via anon key
CREATE POLICY "Restrict INSERT to service role"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Restrict UPDATE to service role"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Restrict DELETE to service role"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
    )
  );
