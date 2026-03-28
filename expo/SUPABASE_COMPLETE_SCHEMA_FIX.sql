-- =====================================================
-- COMPLETE SUPABASE SCHEMA FIX
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS managed_properties CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS homepage_sections CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'agent', 'agency', 'admin')),
  verified BOOLEAN NOT NULL DEFAULT false,
  blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to automatically set user_id from auth.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'phone',
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- AGENTS TABLE
-- =====================================================
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT,
  bio TEXT,
  specialization TEXT,
  license_number TEXT,
  years_of_experience INTEGER,
  package_level TEXT NOT NULL DEFAULT 'free' CHECK (package_level IN ('free', 'pro', 'agency')),
  package_expiry TIMESTAMP WITH TIME ZONE,
  areas_served TEXT,
  website TEXT,
  facebook TEXT,
  twitter TEXT,
  instagram TEXT,
  linkedin TEXT,
  rating INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agents_user_id ON agents(user_id);

-- =====================================================
-- PROPERTIES TABLE
-- =====================================================
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
  images JSONB NOT NULL DEFAULT '[]',
  beds INTEGER,
  baths INTEGER,
  area INTEGER,
  area_unit TEXT,
  furnished BOOLEAN,
  parking BOOLEAN,
  amenities JSONB DEFAULT '[]',
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_listing_category ON properties(listing_category);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  property_title TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_agent_id ON bookings(agent_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- =====================================================
-- MESSAGES TABLE
-- =====================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- =====================================================
-- WISHLISTS TABLE
-- =====================================================
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_property_id ON wishlists(property_id);

-- =====================================================
-- BANNERS TABLE
-- =====================================================
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- HOMEPAGE SECTIONS TABLE
-- =====================================================
CREATE TABLE homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('featured_properties', 'browse_properties', 'featured_agencies', 'custom')),
  title TEXT NOT NULL,
  subtitle TEXT,
  icon TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  filters JSONB NOT NULL DEFAULT '{}',
  analytics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STAFF TABLE
-- =====================================================
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
  active BOOLEAN NOT NULL DEFAULT false,
  invite_token TEXT,
  invite_expiry TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_staff_agent_id ON staff(agent_id);

-- =====================================================
-- MANAGED PROPERTIES TABLE
-- =====================================================
CREATE TABLE managed_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Residential' CHECK (type IN ('Residential', 'Commercial')),
  status TEXT NOT NULL DEFAULT 'Vacant' CHECK (status IN ('Vacant', 'Occupied', 'Under Maintenance', 'For Sale')),
  notes TEXT,
  images JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  tenant_name TEXT,
  tenant_phone TEXT,
  tenant_email TEXT,
  tenant_move_in_date TIMESTAMP WITH TIME ZONE,
  is_listed BOOLEAN NOT NULL DEFAULT false,
  listed_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_managed_properties_agent_id ON managed_properties(agent_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
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

-- Users policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public can view non-blocked users" ON users FOR SELECT USING (NOT blocked);

-- Agents policies
CREATE POLICY "Anyone can view agents" ON agents FOR SELECT USING (true);
CREATE POLICY "Agents can update their own profile" ON agents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create agent profiles" ON agents FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Properties policies
CREATE POLICY "Anyone can view properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Agents can create properties" ON properties FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM agents WHERE agents.user_id = auth.uid() AND agents.id = agent_id)
);
CREATE POLICY "Agents can update their properties" ON properties FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Agents can delete their properties" ON properties FOR DELETE USING (user_id = auth.uid());

-- Bookings policies
CREATE POLICY "Users can view their bookings" ON bookings FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM agents WHERE id = agent_id)
);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Agents can update bookings for their properties" ON bookings FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM agents WHERE id = agent_id)
);

-- Messages policies
CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their received messages" ON messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Wishlists policies
CREATE POLICY "Users can view their wishlists" ON wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to wishlist" ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from wishlist" ON wishlists FOR DELETE USING (auth.uid() = user_id);

-- Banners policies (admin only)
CREATE POLICY "Anyone can view enabled banners" ON banners FOR SELECT USING (enabled = true);
CREATE POLICY "Admins can manage banners" ON banners FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Homepage sections policies (admin only)
CREATE POLICY "Anyone can view enabled sections" ON homepage_sections FOR SELECT USING (enabled = true);
CREATE POLICY "Admins can manage sections" ON homepage_sections FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Staff policies
CREATE POLICY "Agents can view their staff" ON staff FOR SELECT USING (
  EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_id AND agents.user_id = auth.uid())
);
CREATE POLICY "Agents can manage their staff" ON staff FOR ALL USING (
  EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_id AND agents.user_id = auth.uid())
);

-- Managed properties policies
CREATE POLICY "Agents can view their managed properties" ON managed_properties FOR SELECT USING (
  EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_id AND agents.user_id = auth.uid())
);
CREATE POLICY "Agents can manage their properties" ON managed_properties FOR ALL USING (
  EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_id AND agents.user_id = auth.uid())
);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
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

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for property images
CREATE POLICY "Property images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');
CREATE POLICY "Agents can upload property images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'property-images' AND 
  EXISTS (SELECT 1 FROM agents WHERE user_id = auth.uid())
);

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Insert a test admin user (password: admin123)
-- Note: You'll need to create this user through Supabase Auth UI first
-- Then update their role to admin

-- Example seed data for banners
INSERT INTO banners (image_url, title, link, enabled, "order") VALUES
  ('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'Premium Properties', '/properties/premium', true, 1),
  ('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'Luxury Homes', '/properties/luxury', true, 2);

-- Example seed data for homepage sections
INSERT INTO homepage_sections (type, title, subtitle, enabled, "order", filters) VALUES
  ('featured_properties', 'Featured Properties', 'Hand-picked premium listings', true, 1, '{"filterType": "featured", "limit": 10}'),
  ('browse_properties', 'Just Listed', 'Recently added properties', true, 2, '{"filterType": "all", "limit": 20}');

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- =====================================================
-- COMPLETE!
-- =====================================================
-- Schema setup complete. You can now:
-- 1. Sign up users through your app
-- 2. Create agent profiles
-- 3. Add properties
-- 4. Create bookings
-- 5. Use all features
-- =====================================================
