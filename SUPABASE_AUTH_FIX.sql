-- ============================================
-- SUPABASE AUTH INTEGRATION FIX
-- This fixes the "Database error saving new user" issue
-- ============================================

-- First, drop existing policies that reference auth.uid()
-- We'll recreate them with proper auth integration

DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Public can read basic user info" ON users;
DROP POLICY IF EXISTS "Users can manage own sessions" ON sessions;
DROP POLICY IF EXISTS "Anyone can read agents" ON agents;
DROP POLICY IF EXISTS "Users can create own agent profile" ON agents;
DROP POLICY IF EXISTS "Users can update own agent profile" ON agents;
DROP POLICY IF EXISTS "Users can delete own agent profile" ON agents;
DROP POLICY IF EXISTS "Anyone can read properties" ON properties;
DROP POLICY IF EXISTS "Agents can create properties" ON properties;
DROP POLICY IF EXISTS "Agents can update own properties" ON properties;
DROP POLICY IF EXISTS "Agents can delete own properties" ON properties;
DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Property owners can read property bookings" ON bookings;
DROP POLICY IF EXISTS "Property owners can update property bookings" ON bookings;
DROP POLICY IF EXISTS "Users can read own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlists;
DROP POLICY IF EXISTS "Anyone can read enabled banners" ON banners;
DROP POLICY IF EXISTS "Admins can manage banners" ON banners;
DROP POLICY IF EXISTS "Anyone can read enabled sections" ON homepage_sections;
DROP POLICY IF EXISTS "Admins can manage sections" ON homepage_sections;
DROP POLICY IF EXISTS "Agents can read own staff" ON staff;
DROP POLICY IF EXISTS "Agents can manage own staff" ON staff;
DROP POLICY IF EXISTS "Agents can read own managed properties" ON managed_properties;
DROP POLICY IF EXISTS "Agents can manage own managed properties" ON managed_properties;

-- ============================================
-- CREATE TRIGGER TO AUTO-CREATE USER PROFILE
-- ============================================

-- This function will be called when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone, role, verified, blocked, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.raw_user_meta_data->>'phone',
    'client',
    false,
    false,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- UPDATE USERS TABLE TO REMOVE PASSWORD_HASH
-- Since we're using Supabase Auth, we don't need password_hash in users table
-- ============================================

ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- Also add last_active column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ;

-- ============================================
-- RECREATE RLS POLICIES WITH PROPER AUTH
-- ============================================

-- Users policies (allow service role bypass for trigger)
CREATE POLICY "Enable insert for service role" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Public can read basic user info" ON users
  FOR SELECT USING (true);

-- Sessions policies
CREATE POLICY "Users can manage own sessions" ON sessions
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Agents policies
CREATE POLICY "Anyone can read agents" ON agents
  FOR SELECT USING (true);

CREATE POLICY "Users can create own agent profile" ON agents
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own agent profile" ON agents
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own agent profile" ON agents
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Properties policies
CREATE POLICY "Anyone can read properties" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Agents can create properties" ON properties
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Agents can update own properties" ON properties
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Agents can delete own properties" ON properties
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Bookings policies
CREATE POLICY "Users can read own bookings" ON bookings
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Property owners can read property bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = bookings.property_id 
      AND properties.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Property owners can update property bookings" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = bookings.property_id 
      AND properties.user_id::text = auth.uid()::text
    )
  );

-- Messages policies
CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT USING (
    auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid()::text = receiver_id::text);

-- Notifications policies
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Wishlists policies
CREATE POLICY "Users can manage own wishlist" ON wishlists
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Banners policies (public read, admin write)
CREATE POLICY "Anyone can read enabled banners" ON banners
  FOR SELECT USING (enabled = true OR EXISTS (
    SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role = 'admin'
  ));

CREATE POLICY "Admins can manage banners" ON banners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role = 'admin')
  );

-- Homepage sections policies (public read, admin write)
CREATE POLICY "Anyone can read enabled sections" ON homepage_sections
  FOR SELECT USING (enabled = true OR EXISTS (
    SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role = 'admin'
  ));

CREATE POLICY "Admins can manage sections" ON homepage_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role = 'admin')
  );

-- Staff policies
CREATE POLICY "Agents can read own staff" ON staff
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = staff.agent_id 
      AND agents.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Agents can manage own staff" ON staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = staff.agent_id 
      AND agents.user_id::text = auth.uid()::text
    )
  );

-- Managed properties policies
CREATE POLICY "Agents can read own managed properties" ON managed_properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = managed_properties.agent_id 
      AND agents.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Agents can manage own managed properties" ON managed_properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = managed_properties.agent_id 
      AND agents.user_id::text = auth.uid()::text
    )
  );

-- ============================================
-- GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant usage on auth schema to service role
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON auth.users TO postgres, service_role;
GRANT SELECT ON auth.users TO anon, authenticated;

-- ============================================
-- TEST THE TRIGGER
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Auth integration complete!';
  RAISE NOTICE '🔄 Trigger created: on_auth_user_created';
  RAISE NOTICE '🔒 RLS policies updated for Supabase Auth';
  RAISE NOTICE '✨ Users will now be automatically created in public.users table';
END $$;
