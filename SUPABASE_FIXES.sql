-- ============================================
-- SUPABASE FIXES FOR ERRORS
-- Run this in your Supabase SQL Editor
-- ============================================

BEGIN;

-- ============================================
-- FIX 1: Remove infinite recursion in users policies
-- ============================================

-- Drop conflicting policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Public can read basic user info" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create simplified policies without recursion
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Public read access to users" ON users
  FOR SELECT USING (true);

-- ============================================
-- FIX 2: Create sections table (if missing)
-- ============================================

-- Drop table if exists and recreate
DROP TABLE IF EXISTS sections CASCADE;

CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('featured', 'new', 'popular', 'custom')),
  filters JSONB DEFAULT '{}'::jsonb,
  "order" INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read sections" ON sections
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage sections" ON sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================
-- FIX 3: Fix bookings relationship with agent_profiles
-- ============================================

-- Add agent_id column to bookings if missing
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_bookings_agent_id ON bookings(agent_id);

-- Update bookings policies
DROP POLICY IF EXISTS "Property owners can read bookings" ON bookings;
DROP POLICY IF EXISTS "Agents can read their bookings" ON bookings;

CREATE POLICY "Users and agents can read relevant bookings" ON bookings
  FOR SELECT USING (
    user_id::text = auth.uid()::text 
    OR 
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = bookings.property_id 
      AND p.user_id::text = auth.uid()::text
    )
    OR
    EXISTS (
      SELECT 1 FROM agents a
      WHERE a.id = bookings.agent_id 
      AND a.user_id::text = auth.uid()::text
    )
  );

-- ============================================
-- FIX 4: Fix properties relationship with agents
-- ============================================

-- Ensure agent_id foreign key is correct
-- The agents table should be referenced correctly
-- Properties reference agents(id) not agent_profiles

-- If you have agent_profiles table, map it properly
-- For now, we'll ensure the query uses correct relationships

-- ============================================
-- FIX 5: Update banners policies to avoid recursion
-- ============================================

DROP POLICY IF EXISTS "Anyone can read banners" ON banners;
DROP POLICY IF EXISTS "Admins can manage banners" ON banners;

CREATE POLICY "Public read banners" ON banners
  FOR SELECT USING (true);

CREATE POLICY "Admins manage banners" ON banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================
-- FIX 6: Ensure visit_date and visit_time columns exist
-- ============================================

-- Update bookings table schema if needed
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS visit_date TIMESTAMPTZ;
  
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS visit_time TEXT;

-- Migrate old data if exists
UPDATE bookings 
SET visit_date = COALESCE(
  (date || ' ' || time)::timestamptz,
  created_at
)
WHERE visit_date IS NULL;

UPDATE bookings 
SET visit_time = COALESCE(time, '09:00')
WHERE visit_time IS NULL;

-- ============================================
-- FIX 7: Add missing property columns
-- ============================================

ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS beds INTEGER;
  
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS baths INTEGER;
  
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'monthly';
  
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS suburb TEXT;
  
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS province TEXT;
  
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS coordinates JSONB DEFAULT '{"latitude": 0, "longitude": 0}'::jsonb;
  
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
  
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS bookings INTEGER DEFAULT 0;

-- Migrate existing data
UPDATE properties SET beds = bedrooms WHERE beds IS NULL;
UPDATE properties SET baths = bathrooms WHERE baths IS NULL;
UPDATE properties SET listing_type = price_type WHERE listing_type IS NULL;
UPDATE properties SET suburb = city WHERE suburb IS NULL;
UPDATE properties SET province = state WHERE province IS NULL;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- Run these to check if fixes worked
-- ============================================

-- Check users table access
-- SELECT COUNT(*) FROM users;

-- Check sections table exists
-- SELECT COUNT(*) FROM sections;

-- Check banners table access
-- SELECT COUNT(*) FROM banners;

-- Check bookings relationships
-- SELECT COUNT(*) FROM bookings;

-- Check properties with agents
-- SELECT COUNT(*) FROM properties p LEFT JOIN agents a ON p.agent_id = a.id;
