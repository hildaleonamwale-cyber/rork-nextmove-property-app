-- ============================================
-- COMPLETE SUPABASE SCHEMA
-- All tables, policies, triggers, and storage configuration
-- Execute this to set up the entire database
-- ============================================

-- ============================================
-- CLEANUP: DROP EXISTING OBJECTS
-- ============================================

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "users_select_all" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "service_role_all" ON users;

DROP POLICY IF EXISTS "sessions_select_own" ON sessions;
DROP POLICY IF EXISTS "sessions_insert_own" ON sessions;
DROP POLICY IF EXISTS "sessions_update_own" ON sessions;
DROP POLICY IF EXISTS "sessions_delete_own" ON sessions;
DROP POLICY IF EXISTS "sessions_service_role" ON sessions;

DROP POLICY IF EXISTS "agents_select_all" ON agents;
DROP POLICY IF EXISTS "agents_insert_own" ON agents;
DROP POLICY IF EXISTS "agents_update_own" ON agents;
DROP POLICY IF EXISTS "agents_delete_own" ON agents;
DROP POLICY IF EXISTS "agents_service_role" ON agents;

DROP POLICY IF EXISTS "properties_select_all" ON properties;
DROP POLICY IF EXISTS "properties_insert_own" ON properties;
DROP POLICY IF EXISTS "properties_update_own" ON properties;
DROP POLICY IF EXISTS "properties_delete_own" ON properties;
DROP POLICY IF EXISTS "properties_service_role" ON properties;

DROP POLICY IF EXISTS "bookings_select_own" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_own" ON bookings;
DROP POLICY IF EXISTS "bookings_update_own" ON bookings;
DROP POLICY IF EXISTS "bookings_service_role" ON bookings;

DROP POLICY IF EXISTS "messages_select_own" ON messages;
DROP POLICY IF EXISTS "messages_insert_as_sender" ON messages;
DROP POLICY IF EXISTS "messages_update_as_receiver" ON messages;
DROP POLICY IF EXISTS "messages_service_role" ON messages;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
DROP POLICY IF EXISTS "notifications_service_role" ON notifications;

DROP POLICY IF EXISTS "wishlists_select_own" ON wishlists;
DROP POLICY IF EXISTS "wishlists_insert_own" ON wishlists;
DROP POLICY IF EXISTS "wishlists_delete_own" ON wishlists;
DROP POLICY IF EXISTS "wishlists_service_role" ON wishlists;

DROP POLICY IF EXISTS "banners_select_all" ON banners;
DROP POLICY IF EXISTS "banners_service_role" ON banners;

DROP POLICY IF EXISTS "sections_select_all" ON homepage_sections;
DROP POLICY IF EXISTS "sections_service_role" ON homepage_sections;

DROP POLICY IF EXISTS "staff_select_by_agent" ON staff;
DROP POLICY IF EXISTS "staff_insert_by_agent" ON staff;
DROP POLICY IF EXISTS "staff_update_by_agent" ON staff;
DROP POLICY IF EXISTS "staff_delete_by_agent" ON staff;
DROP POLICY IF EXISTS "staff_service_role" ON staff;

DROP POLICY IF EXISTS "managed_properties_select_by_agent" ON managed_properties;
DROP POLICY IF EXISTS "managed_properties_insert_by_agent" ON managed_properties;
DROP POLICY IF EXISTS "managed_properties_update_by_agent" ON managed_properties;
DROP POLICY IF EXISTS "managed_properties_delete_by_agent" ON managed_properties;
DROP POLICY IF EXISTS "managed_properties_service_role" ON managed_properties;

-- Drop storage policies
DROP POLICY IF EXISTS "avatars_select_all" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;

DROP POLICY IF EXISTS "properties_select_all" ON storage.objects;
DROP POLICY IF EXISTS "properties_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "properties_update_own" ON storage.objects;
DROP POLICY IF EXISTS "properties_delete_own" ON storage.objects;

DROP POLICY IF EXISTS "banners_select_all" ON storage.objects;
DROP POLICY IF EXISTS "banners_insert_service_role" ON storage.objects;
DROP POLICY IF EXISTS "banners_update_service_role" ON storage.objects;
DROP POLICY IF EXISTS "banners_delete_service_role" ON storage.objects;

-- Drop existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS managed_properties CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS homepage_sections CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop views if they exist
DROP VIEW IF EXISTS user_stats CASCADE;
DROP VIEW IF EXISTS property_stats CASCADE;
DROP VIEW IF EXISTS agent_analytics CASCADE;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'agent', 'agency', 'admin')),
  user_mode TEXT DEFAULT 'client' CHECK (user_mode IN ('client', 'agent')),
  verified BOOLEAN NOT NULL DEFAULT false,
  blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- SESSIONS TABLE
-- ============================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  refresh_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  refresh_expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);

-- ============================================
-- AGENTS TABLE
-- ============================================
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT,
  bio TEXT,
  specialization TEXT,
  license_number TEXT,
  years_of_experience INTEGER,
  package_level TEXT NOT NULL DEFAULT 'free' CHECK (package_level IN ('free', 'pro', 'agency')),
  package_expiry TIMESTAMPTZ,
  areas_served TEXT,
  website TEXT,
  facebook TEXT,
  twitter TEXT,
  instagram TEXT,
  linkedin TEXT,
  rating INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_package_level ON agents(package_level);

-- ============================================
-- PROPERTIES TABLE
-- ============================================
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL,
  listing_category TEXT NOT NULL DEFAULT 'property' CHECK (listing_category IN ('property', 'stand', 'room', 'commercial')),
  status TEXT NOT NULL DEFAULT 'For Rent' CHECK (status IN ('For Rent', 'For Sale', 'Internal Management')),
  price INTEGER NOT NULL,
  price_type TEXT NOT NULL DEFAULT 'monthly' CHECK (price_type IN ('monthly', 'total')),
  images TEXT NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area INTEGER,
  area_unit TEXT,
  furnished BOOLEAN,
  parking BOOLEAN,
  amenities TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  zip_code TEXT,
  latitude TEXT,
  longitude TEXT,
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_listing_category ON properties(listing_category);

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_title TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ============================================
-- WISHLISTS TABLE
-- ============================================
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_property_id ON wishlists(property_id);

-- ============================================
-- BANNERS TABLE
-- ============================================
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_banners_enabled ON banners(enabled);
CREATE INDEX idx_banners_order ON banners("order");

-- ============================================
-- HOMEPAGE SECTIONS TABLE
-- ============================================
CREATE TABLE homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('featured_properties', 'browse_properties', 'featured_agencies', 'custom')),
  title TEXT NOT NULL,
  subtitle TEXT,
  icon TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  config TEXT NOT NULL,
  analytics TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_homepage_sections_enabled ON homepage_sections(enabled);
CREATE INDEX idx_homepage_sections_order ON homepage_sections("order");

-- ============================================
-- STAFF TABLE
-- ============================================
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  permissions TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT false,
  invite_token TEXT,
  invite_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_agent_id ON staff(agent_id);

-- ============================================
-- MANAGED PROPERTIES TABLE
-- ============================================
CREATE TABLE managed_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Residential' CHECK (type IN ('Residential', 'Commercial')),
  status TEXT NOT NULL DEFAULT 'Vacant' CHECK (status IN ('Vacant', 'Occupied', 'Under Maintenance', 'For Sale')),
  notes TEXT,
  images TEXT,
  documents TEXT,
  tenant_name TEXT,
  tenant_phone TEXT,
  tenant_email TEXT,
  tenant_move_in_date TIMESTAMPTZ,
  is_listed BOOLEAN NOT NULL DEFAULT false,
  listed_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_managed_properties_agent_id ON managed_properties(agent_id);
CREATE INDEX idx_managed_properties_status ON managed_properties(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE managed_properties ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================
CREATE POLICY "users_select_all" ON users 
  FOR SELECT 
  USING (true);

CREATE POLICY "users_insert_own" ON users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON users 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "service_role_all" ON users 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================
-- SESSIONS TABLE POLICIES
-- ============================================
CREATE POLICY "sessions_select_own" ON sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "sessions_insert_own" ON sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sessions_update_own" ON sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "sessions_delete_own" ON sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "sessions_service_role" ON sessions 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================
-- AGENTS TABLE POLICIES (AGENT PROFILES)
-- ============================================
CREATE POLICY "agents_select_all" ON agents 
  FOR SELECT 
  USING (true);

CREATE POLICY "agents_insert_own" ON agents 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agents_update_own" ON agents 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "agents_delete_own" ON agents 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "agents_service_role" ON agents 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================
-- PROPERTIES TABLE POLICIES
-- ============================================
CREATE POLICY "properties_select_all" ON properties 
  FOR SELECT 
  USING (true);

CREATE POLICY "properties_insert_own" ON properties 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "properties_update_own" ON properties 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "properties_delete_own" ON properties 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "properties_service_role" ON properties 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================
-- BOOKINGS TABLE POLICIES
-- ============================================
CREATE POLICY "bookings_select_own" ON bookings 
  FOR SELECT 
  USING (auth.uid() = user_id OR 
         EXISTS (SELECT 1 FROM properties WHERE properties.id = bookings.property_id AND properties.user_id = auth.uid()));

CREATE POLICY "bookings_insert_own" ON bookings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_update_own" ON bookings 
  FOR UPDATE 
  USING (auth.uid() = user_id OR 
         EXISTS (SELECT 1 FROM properties WHERE properties.id = bookings.property_id AND properties.user_id = auth.uid()));

CREATE POLICY "bookings_service_role" ON bookings 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================
-- MESSAGES TABLE POLICIES
-- ============================================
CREATE POLICY "messages_select_own" ON messages 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "messages_insert_as_sender" ON messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update_as_receiver" ON messages 
  FOR UPDATE 
  USING (auth.uid() = receiver_id);

CREATE POLICY "messages_service_role" ON messages 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================
CREATE POLICY "notifications_select_own" ON notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own" ON notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_service_role" ON notifications 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================
-- WISHLISTS TABLE POLICIES
-- ============================================
CREATE POLICY "wishlists_select_own" ON wishlists 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "wishlists_insert_own" ON wishlists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlists_delete_own" ON wishlists 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "wishlists_service_role" ON wishlists 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================
-- BANNERS TABLE POLICIES
-- ============================================
CREATE POLICY "banners_select_all" ON banners 
  FOR SELECT 
  USING (true);

CREATE POLICY "banners_service_role" ON banners 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================
-- HOMEPAGE SECTIONS TABLE POLICIES
-- ============================================
CREATE POLICY "sections_select_all" ON homepage_sections 
  FOR SELECT 
  USING (true);

CREATE POLICY "sections_service_role" ON homepage_sections 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================
-- STAFF TABLE POLICIES
-- ============================================
CREATE POLICY "staff_select_by_agent" ON staff 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = staff.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "staff_insert_by_agent" ON staff 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = staff.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "staff_update_by_agent" ON staff 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = staff.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "staff_delete_by_agent" ON staff 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = staff.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "staff_service_role" ON staff 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================
-- MANAGED PROPERTIES TABLE POLICIES
-- ============================================
CREATE POLICY "managed_properties_select_by_agent" ON managed_properties 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = managed_properties.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "managed_properties_insert_by_agent" ON managed_properties 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = managed_properties.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "managed_properties_update_by_agent" ON managed_properties 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = managed_properties.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "managed_properties_delete_by_agent" ON managed_properties 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = managed_properties.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "managed_properties_service_role" ON managed_properties 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================
-- STORAGE BUCKETS SETUP
-- ============================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('properties', 'properties', true),
  ('banners', 'banners', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- ============================================
-- STORAGE POLICIES: AVATARS BUCKET
-- ============================================

CREATE POLICY "avatars_select_all"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

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

CREATE POLICY "avatars_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- STORAGE POLICIES: PROPERTIES BUCKET
-- ============================================

CREATE POLICY "properties_select_all"
ON storage.objects FOR SELECT
USING (bucket_id = 'properties');

CREATE POLICY "properties_insert_authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'properties');

CREATE POLICY "properties_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'properties')
WITH CHECK (bucket_id = 'properties');

CREATE POLICY "properties_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'properties');

-- ============================================
-- STORAGE POLICIES: BANNERS BUCKET
-- ============================================

CREATE POLICY "banners_select_all"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

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
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homepage_sections_updated_at BEFORE UPDATE ON homepage_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_managed_properties_updated_at BEFORE UPDATE ON managed_properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUPABASE AUTH TRIGGERS
-- ============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    phone,
    password_hash,
    role,
    verified,
    blocked
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'phone',
    '',
    'client',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate auth trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email != OLD.email THEN
    UPDATE public.users
    SET email = NEW.email
    WHERE id = NEW.id;
  END IF;
  
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.users
    SET verified = true
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_delete();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.agents TO service_role;
GRANT ALL ON public.properties TO service_role;
GRANT ALL ON public.bookings TO service_role;
GRANT ALL ON public.messages TO service_role;
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.wishlists TO service_role;
GRANT ALL ON public.staff TO service_role;
GRANT ALL ON public.managed_properties TO service_role;
GRANT ALL ON public.banners TO service_role;
GRANT ALL ON public.homepage_sections TO service_role;
GRANT ALL ON public.sessions TO service_role;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- SEED DATA (Optional)
-- ============================================

-- Insert a default admin user
INSERT INTO users (id, email, password_hash, name, role, verified)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  '$2a$10$rN8eJLJ3Z3Z3Z3Z3Z3Z3ZeN8eJLJ3Z3Z3Z3Z3Z3Z3ZeN8eJLJ3Z3Z',
  'System Admin',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert sample banners
INSERT INTO banners (image_url, title, link, enabled, "order")
VALUES
  ('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', 'Luxury Apartments', '/search-results?type=apartment', true, 1),
  ('https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf', 'Modern Houses', '/search-results?type=house', true, 2),
  ('https://images.unsplash.com/photo-1512917774080-9991f1c4c750', 'Premium Villas', '/search-results?type=villa', true, 3)
ON CONFLICT DO NOTHING;

-- Insert sample homepage sections
INSERT INTO homepage_sections (type, title, subtitle, enabled, "order", config)
VALUES
  ('featured_properties', 'Featured Properties', 'Discover our handpicked selection', true, 1, '{"limit": 6, "showVerified": true}'),
  ('browse_properties', 'Browse by Category', 'Find your perfect property', true, 2, '{"categories": ["apartment", "house", "villa", "commercial"]}'),
  ('featured_agencies', 'Top Agencies', 'Connect with verified professionals', true, 3, '{"limit": 4, "verifiedOnly": true}')
ON CONFLICT DO NOTHING;

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

CREATE OR REPLACE VIEW user_stats AS
SELECT
  role,
  COUNT(*) as total,
  COUNT(CASE WHEN verified THEN 1 END) as verified_count,
  COUNT(CASE WHEN blocked THEN 1 END) as blocked_count,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_this_month
FROM users
GROUP BY role;

CREATE OR REPLACE VIEW property_stats AS
SELECT
  listing_category,
  status,
  COUNT(*) as total,
  SUM(views) as total_views,
  SUM(inquiries) as total_inquiries,
  AVG(price) as avg_price
FROM properties
GROUP BY listing_category, status;

CREATE OR REPLACE VIEW agent_analytics AS
SELECT
  a.id as agent_id,
  a.user_id,
  a.package_level,
  COUNT(DISTINCT p.id) as total_properties,
  SUM(p.views) as total_views,
  SUM(p.inquiries) as total_inquiries,
  COUNT(DISTINCT b.id) as total_bookings
FROM agents a
LEFT JOIN properties p ON p.agent_id = a.id
LEFT JOIN bookings b ON b.property_id = p.id
GROUP BY a.id, a.user_id, a.package_level;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Complete schema created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables created:';
  RAISE NOTICE '   - users, sessions, agents, properties';
  RAISE NOTICE '   - bookings, messages, notifications, wishlists';
  RAISE NOTICE '   - banners, homepage_sections, staff, managed_properties';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 RLS Policies configured for:';
  RAISE NOTICE '   - All main tables (users, agents, properties, etc.)';
  RAISE NOTICE '   - Agent profiles (agents table)';
  RAISE NOTICE '   - Wishlists (full CRUD policies)';
  RAISE NOTICE '   - Staff and managed properties';
  RAISE NOTICE '';
  RAISE NOTICE '📁 Storage buckets and policies:';
  RAISE NOTICE '   - avatars (user-specific folders)';
  RAISE NOTICE '   - properties (authenticated users)';
  RAISE NOTICE '   - banners (service role only)';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Auto-update triggers configured';
  RAISE NOTICE '🔐 Auth triggers for automatic profile creation';
  RAISE NOTICE '📈 Analytics views created';
  RAISE NOTICE '';
  RAISE NOTICE '✨ Database is ready to use!';
END $$;
