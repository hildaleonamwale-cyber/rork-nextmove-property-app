-- ============================================
-- SUPABASE COMPLETE FIX SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================

BEGIN;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Public can read basic user info" ON users;
DROP POLICY IF EXISTS "Anyone can read agent profiles" ON agents;
DROP POLICY IF EXISTS "Users can create agent profile" ON agents;
DROP POLICY IF EXISTS "Agents can update own profile" ON agents;
DROP POLICY IF EXISTS "Anyone can read properties" ON properties;
DROP POLICY IF EXISTS "Agents can create properties" ON properties;
DROP POLICY IF EXISTS "Agents can update own properties" ON properties;
DROP POLICY IF EXISTS "Agents can delete own properties" ON properties;
DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Property owners can read bookings" ON bookings;
DROP POLICY IF EXISTS "Property owners can update bookings" ON bookings;
DROP POLICY IF EXISTS "Agents can read bookings" ON bookings;
DROP POLICY IF EXISTS "Agents can update bookings" ON bookings;
DROP POLICY IF EXISTS "Users can read own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update received messages" ON messages;
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can read own wishlist" ON wishlists;
DROP POLICY IF EXISTS "Users can add to wishlist" ON wishlists;
DROP POLICY IF EXISTS "Users can remove from wishlist" ON wishlists;
DROP POLICY IF EXISTS "Anyone can read banners" ON banners;
DROP POLICY IF EXISTS "Admins can manage banners" ON banners;
DROP POLICY IF EXISTS "Anyone can read homepage sections" ON homepage_sections;
DROP POLICY IF EXISTS "Admins can manage sections" ON homepage_sections;
DROP POLICY IF EXISTS "Agents can read own staff" ON staff;
DROP POLICY IF EXISTS "Agents can manage own staff" ON staff;
DROP POLICY IF EXISTS "Agents can read own managed properties" ON managed_properties;
DROP POLICY IF EXISTS "Agents can manage own managed properties" ON managed_properties;

-- Add missing columns to tables
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'monthly';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS beds INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS baths INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS suburb TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS coordinates JSONB;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bookings INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS visit_date TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS visit_time TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_bookings_agent_id ON bookings(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);

-- ============================================
-- CREATE SIMPLIFIED RLS POLICIES (NO RECURSION)
-- ============================================

-- Users Policies
CREATE POLICY "Users read own" ON users
  FOR SELECT USING (id::text = auth.uid()::text);

CREATE POLICY "Users update own" ON users
  FOR UPDATE USING (id::text = auth.uid()::text);

CREATE POLICY "Public read users" ON users
  FOR SELECT USING (true);

-- Agents Policies
CREATE POLICY "Public read agents" ON agents
  FOR SELECT USING (true);

CREATE POLICY "Users create agent" ON agents
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Agents update own" ON agents
  FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Properties Policies
CREATE POLICY "Public read properties" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Agents create properties" ON properties
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Agents update properties" ON properties
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Agents delete properties" ON properties
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- Bookings Policies
CREATE POLICY "Users read bookings" ON bookings
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Agents read bookings" ON bookings
  FOR SELECT USING (
    agent_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = bookings.agent_id 
      AND agents.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users create bookings" ON bookings
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Agents update bookings" ON bookings
  FOR UPDATE USING (
    agent_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = bookings.agent_id 
      AND agents.user_id::text = auth.uid()::text
    )
  );

-- Messages Policies
CREATE POLICY "Users read messages" ON messages
  FOR SELECT USING (
    sender_id::text = auth.uid()::text OR 
    receiver_id::text = auth.uid()::text
  );

CREATE POLICY "Users send messages" ON messages
  FOR INSERT WITH CHECK (sender_id::text = auth.uid()::text);

CREATE POLICY "Users update messages" ON messages
  FOR UPDATE USING (receiver_id::text = auth.uid()::text);

-- Notifications Policies
CREATE POLICY "Users read notifications" ON notifications
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users update notifications" ON notifications
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users delete notifications" ON notifications
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- Wishlists Policies
CREATE POLICY "Users read wishlist" ON wishlists
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users add wishlist" ON wishlists
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users remove wishlist" ON wishlists
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- Banners Policies
CREATE POLICY "Public read banners" ON banners
  FOR SELECT USING (true);

CREATE POLICY "Admins manage banners" ON banners
  FOR ALL USING (auth.uid()::text IN (
    SELECT id::text FROM users WHERE role = 'admin'
  ));

-- Homepage Sections Policies
CREATE POLICY "Public read sections" ON homepage_sections
  FOR SELECT USING (true);

CREATE POLICY "Admins manage sections" ON homepage_sections
  FOR ALL USING (auth.uid()::text IN (
    SELECT id::text FROM users WHERE role = 'admin'
  ));

-- Staff Policies
CREATE POLICY "Agents read staff" ON staff
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = staff.agent_id 
      AND agents.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Agents manage staff" ON staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = staff.agent_id 
      AND agents.user_id::text = auth.uid()::text
    )
  );

-- Managed Properties Policies
CREATE POLICY "Agents read managed" ON managed_properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = managed_properties.agent_id 
      AND agents.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Agents manage managed" ON managed_properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = managed_properties.agent_id 
      AND agents.user_id::text = auth.uid()::text
    )
  );

-- Add trigger for bookings updated_at
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
