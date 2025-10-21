-- ============================================
-- SUPABASE CORRECTED MIGRATION SCRIPT
-- NextMove Property App - Fixed Version
-- ============================================

BEGIN;

-- ============================================
-- 1. DROP EXISTING TABLES IF ANY
-- ============================================

DROP TABLE IF EXISTS managed_properties CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS homepage_sections CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS agent_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 2. CREATE TABLES
-- ============================================

-- 2.1 Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'agent', 'agency', 'admin')),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  has_agent_profile BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2.2 Agent Profiles Table (RENAMED from agents)
CREATE TABLE agent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT,
  company_logo TEXT,
  banner TEXT,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  years_experience INTEGER,
  languages TEXT[] DEFAULT '{}',
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  social_media JSONB DEFAULT '{}',
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  package TEXT NOT NULL DEFAULT 'free' CHECK (package IN ('free', 'pro', 'agency')),
  package_expiry TIMESTAMPTZ,
  account_setup_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_profiles_user_id ON agent_profiles(user_id);

-- 2.3 Properties Table (FIXED column names)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL,
  listing_category TEXT NOT NULL DEFAULT 'property' CHECK (listing_category IN ('property', 'stand', 'room', 'commercial')),
  status TEXT NOT NULL DEFAULT 'For Rent' CHECK (status IN ('For Rent', 'For Sale', 'Internal Management')),
  price INTEGER NOT NULL,
  listing_type TEXT NOT NULL DEFAULT 'monthly' CHECK (listing_type IN ('monthly', 'sale')),
  images TEXT[] DEFAULT '{}',
  beds INTEGER,
  baths INTEGER,
  area INTEGER,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  suburb TEXT,
  province TEXT,
  country TEXT NOT NULL DEFAULT 'Zimbabwe',
  coordinates JSONB,
  amenities TEXT[] DEFAULT '{}',
  furnished BOOLEAN,
  parking BOOLEAN,
  featured BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  bookings INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);

-- 2.4 Bookings Table (FIXED column names)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
  visit_date TIMESTAMPTZ NOT NULL,
  visit_time TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_agent_id ON bookings(agent_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- 2.5 Conversations Table (NEW - was missing)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participants UUID[] NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_participants ON conversations USING GIN(participants);

-- 2.6 Messages Table (FIXED with conversation_id)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

-- 2.7 Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- 2.8 Wishlists Table
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_property_id ON wishlists(property_id);

-- 2.9 Banners Table
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  link TEXT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.10 Sections Table (RENAMED from homepage_sections)
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('featured', 'new', 'popular', 'custom')),
  title TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.11 Staff Table
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT FALSE,
  invite_token TEXT,
  invite_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_agent_id ON staff(agent_id);

-- 2.12 Managed Properties Table
CREATE TABLE managed_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Residential' CHECK (type IN ('Residential', 'Commercial')),
  status TEXT NOT NULL DEFAULT 'Vacant' CHECK (status IN ('Vacant', 'Occupied', 'Under Maintenance', 'For Sale')),
  notes TEXT,
  images TEXT[] DEFAULT '{}',
  documents TEXT[] DEFAULT '{}',
  tenant_name TEXT,
  tenant_phone TEXT,
  tenant_email TEXT,
  tenant_move_in_date TIMESTAMPTZ,
  is_listed BOOLEAN NOT NULL DEFAULT FALSE,
  listed_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_managed_properties_agent_id ON managed_properties(agent_id);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE managed_properties ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- 4.1 Users Policies (FIXED - removed recursive policy)
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Public can read basic user info" ON users
  FOR SELECT USING (true);

-- 4.2 Agent Profiles Policies
CREATE POLICY "Anyone can read agent profiles" ON agent_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create agent profile" ON agent_profiles
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Agents can update own profile" ON agent_profiles
  FOR UPDATE USING (user_id::text = auth.uid()::text);

-- 4.3 Properties Policies
CREATE POLICY "Anyone can read properties" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Agents can create properties" ON properties
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Agents can update own properties" ON properties
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Agents can delete own properties" ON properties
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- 4.4 Bookings Policies
CREATE POLICY "Users can read own bookings" ON bookings
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Agents can read bookings for their properties" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agent_profiles 
      WHERE agent_profiles.id = bookings.agent_id 
      AND agent_profiles.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Agents can update bookings for their properties" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM agent_profiles 
      WHERE agent_profiles.id = bookings.agent_id 
      AND agent_profiles.user_id::text = auth.uid()::text
    )
  );

-- 4.5 Conversations Policies
CREATE POLICY "Users can read own conversations" ON conversations
  FOR SELECT USING (auth.uid()::text = ANY(participants::text[]));

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid()::text = ANY(participants::text[]));

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid()::text = ANY(participants::text[]));

-- 4.6 Messages Policies
CREATE POLICY "Users can read messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND auth.uid()::text = ANY(conversations.participants::text[])
    )
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id::text = auth.uid()::text);

CREATE POLICY "Users can update received messages" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND auth.uid()::text = ANY(conversations.participants::text[])
    )
  );

-- 4.7 Notifications Policies
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- 4.8 Wishlists Policies
CREATE POLICY "Users can read own wishlist" ON wishlists
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can add to wishlist" ON wishlists
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can remove from wishlist" ON wishlists
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- 4.9 Banners Policies
CREATE POLICY "Anyone can read banners" ON banners
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage banners" ON banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- 4.10 Sections Policies
CREATE POLICY "Anyone can read sections" ON sections
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage sections" ON sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- 4.11 Staff Policies
CREATE POLICY "Agents can read own staff" ON staff
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agent_profiles 
      WHERE agent_profiles.id = staff.agent_id 
      AND agent_profiles.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Agents can manage own staff" ON staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agent_profiles 
      WHERE agent_profiles.id = staff.agent_id 
      AND agent_profiles.user_id::text = auth.uid()::text
    )
  );

-- 4.12 Managed Properties Policies
CREATE POLICY "Agents can read own managed properties" ON managed_properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agent_profiles 
      WHERE agent_profiles.id = managed_properties.agent_id 
      AND agent_profiles.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Agents can manage own managed properties" ON managed_properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agent_profiles 
      WHERE agent_profiles.id = managed_properties.agent_id 
      AND agent_profiles.user_id::text = auth.uid()::text
    )
  );

-- ============================================
-- 5. CREATE FUNCTIONS & TRIGGERS
-- ============================================

-- 5.1 Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_profiles_updated_at BEFORE UPDATE ON agent_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_managed_properties_updated_at BEFORE UPDATE ON managed_properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5.2 Create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

COMMIT;

-- ============================================
-- 6. SEED DATA (Optional)
-- ============================================

-- You can add sample data here if needed

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Key changes from previous script:
-- 1. Renamed 'agents' to 'agent_profiles'
-- 2. Added 'conversations' table
-- 3. Renamed 'homepage_sections' to 'sections'
-- 4. Fixed column names in properties (bedrooms->beds, bathrooms->baths, etc.)
-- 5. Fixed column names in bookings (date->visit_date, time->visit_time)
-- 6. Updated all foreign key references
-- 7. Fixed infinite recursion in users policies
-- ============================================
