-- ============================================
-- SUPABASE TABLE NAME FIX
-- Run this if you're getting table not found errors
-- ============================================

-- This script fixes common table name issues

BEGIN;

-- 1. Check if 'sections' table exists and rename to 'homepage_sections'
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'sections'
  ) THEN
    ALTER TABLE IF EXISTS public.sections RENAME TO homepage_sections;
    RAISE NOTICE 'Renamed sections to homepage_sections';
  END IF;
END
$$;

-- 2. Ensure all required columns exist in homepage_sections
DO $$
BEGIN
  -- Add filters column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'homepage_sections' 
    AND column_name = 'filters'
  ) THEN
    ALTER TABLE homepage_sections ADD COLUMN filters JSONB NOT NULL DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Added filters column to homepage_sections';
  END IF;
END
$$;

-- 3. Ensure properties table has all required columns
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS beds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS baths INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS suburb TEXT,
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS coordinates JSONB,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bookings INTEGER DEFAULT 0;

-- 4. Ensure bookings table has all required columns
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS visit_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS visit_time TEXT,
  ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Update visit_date from date column if needed
UPDATE bookings 
SET visit_date = (date || ' 00:00:00')::timestamptz 
WHERE visit_date IS NULL AND date IS NOT NULL;

-- 6. Update visit_time from time column if needed  
UPDATE bookings 
SET visit_time = time 
WHERE visit_time IS NULL AND time IS NOT NULL;

-- 7. Populate agent_id from properties
UPDATE bookings b
SET agent_id = p.agent_id
FROM properties p
WHERE b.property_id = p.id AND b.agent_id IS NULL;

-- 8. Ensure users table has last_active column
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT NOW();

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_suburb ON properties(suburb);
CREATE INDEX IF NOT EXISTS idx_properties_province ON properties(province);
CREATE INDEX IF NOT EXISTS idx_properties_verified ON properties(verified);
CREATE INDEX IF NOT EXISTS idx_bookings_agent_id ON bookings(agent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_visit_date ON bookings(visit_date);

-- 10. Update RLS policies for bookings to include agent access
DROP POLICY IF EXISTS "Agents can read own bookings" ON bookings;
CREATE POLICY "Agents can read own bookings" ON bookings
  FOR SELECT USING (
    agent_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.user_id::text = auth.uid()::text 
      AND agents.id = bookings.agent_id
    )
  );

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'users', 'agents', 'properties', 'bookings', 
      'messages', 'notifications', 'wishlists', 
      'banners', 'homepage_sections', 'staff', 'managed_properties'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'users', 'agents', 'properties', 'bookings', 
  'messages', 'notifications', 'wishlists', 
  'banners', 'homepage_sections', 'staff', 'managed_properties',
  'sections'
)
ORDER BY table_name;

-- Check homepage_sections structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'homepage_sections'
ORDER BY ordinal_position;

-- Check if RLS is enabled on all tables
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'users', 'agents', 'properties', 'bookings', 
  'messages', 'notifications', 'wishlists', 
  'banners', 'homepage_sections', 'staff', 'managed_properties'
)
ORDER BY tablename;

-- ============================================
-- EXPECTED OUTPUT
-- ============================================
/*
After running this script, you should see:

Table Existence Check:
- users: ✅ EXISTS
- agents: ✅ EXISTS  
- properties: ✅ EXISTS
- bookings: ✅ EXISTS
- messages: ✅ EXISTS
- notifications: ✅ EXISTS
- wishlists: ✅ EXISTS
- banners: ✅ EXISTS
- homepage_sections: ✅ EXISTS (not 'sections')
- staff: ✅ EXISTS
- managed_properties: ✅ EXISTS

All tables should have RLS enabled (rls_enabled = true)

If any tables are missing, run the main migration script first.
*/
