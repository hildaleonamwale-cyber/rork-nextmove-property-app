-- ============================================
-- SUPABASE STORAGE BUCKETS AND POLICIES
-- Execute this in Supabase SQL Editor to fix avatar upload issues
-- ============================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('properties', 'properties', true),
  ('banners', 'banners', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- ============================================
-- AVATARS BUCKET POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "avatars_select_all" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;

-- Allow anyone to view avatars
CREATE POLICY "avatars_select_all"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "avatars_insert_authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatars
CREATE POLICY "avatars_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatars
CREATE POLICY "avatars_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- PROPERTIES BUCKET POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "properties_select_all" ON storage.objects;
DROP POLICY IF EXISTS "properties_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "properties_update_own" ON storage.objects;
DROP POLICY IF EXISTS "properties_delete_own" ON storage.objects;

-- Allow anyone to view property images
CREATE POLICY "properties_select_all"
ON storage.objects FOR SELECT
USING (bucket_id = 'properties');

-- Allow authenticated users to upload property images
CREATE POLICY "properties_insert_authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'properties');

-- Allow authenticated users to update property images
CREATE POLICY "properties_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'properties')
WITH CHECK (bucket_id = 'properties');

-- Allow authenticated users to delete property images
CREATE POLICY "properties_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'properties');

-- ============================================
-- BANNERS BUCKET POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "banners_select_all" ON storage.objects;
DROP POLICY IF EXISTS "banners_insert_service_role" ON storage.objects;
DROP POLICY IF EXISTS "banners_update_service_role" ON storage.objects;
DROP POLICY IF EXISTS "banners_delete_service_role" ON storage.objects;

-- Allow anyone to view banners
CREATE POLICY "banners_select_all"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Only service role can manage banners (admin operations)
CREATE POLICY "banners_insert_service_role"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'banners');

CREATE POLICY "banners_update_service_role"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'banners')
WITH CHECK (bucket_id = 'banners');

CREATE POLICY "banners_delete_service_role"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'banners');

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Storage buckets and policies created successfully!';
  RAISE NOTICE '📁 Buckets: avatars (public), properties (public), banners (public)';
  RAISE NOTICE '🔒 Avatar policies: authenticated users can upload/update/delete their own';
  RAISE NOTICE '🔒 Property policies: authenticated users can upload/update/delete';
  RAISE NOTICE '🔒 Banner policies: service role only';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ NOTE: The avatar policy expects files to be in folders named by user ID';
  RAISE NOTICE '   Example: {userId}/avatar-123456.jpg';
END $$;
