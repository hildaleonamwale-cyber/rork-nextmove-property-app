# Supabase Migration Guide - NextMove Property App

## Overview
This guide provides complete instructions for migrating the NextMove Property App from Rork backend (Hono + tRPC + Drizzle + SQLite) to Supabase (PostgreSQL + Auth + Storage + Realtime).

---

## 1. Database Schema & Tables

### Complete Table Structure

#### 1.1 Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'agent', 'agency', 'admin')),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Note:** Supabase Auth handles passwords automatically. You don't need a `password_hash` column.

#### 1.2 Sessions Table
```sql
-- Supabase Auth handles sessions automatically
-- This table is NOT needed when using Supabase Auth
-- auth.sessions table is built-in
```

#### 1.3 Agents Table
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
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
```

#### 1.4 Properties Table
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);
```

#### 1.5 Bookings Table
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

#### 1.6 Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id);
```

#### 1.7 Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

#### 1.8 Wishlists Table
```sql
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_property_id ON wishlists(property_id);
```

#### 1.9 Banners Table
```sql
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 1.10 Homepage Sections Table
```sql
CREATE TABLE homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('featured_properties', 'browse_properties', 'featured_agencies', 'custom')),
  title TEXT NOT NULL,
  subtitle TEXT,
  icon TEXT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  order INTEGER NOT NULL DEFAULT 0,
  config TEXT NOT NULL,
  analytics TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 1.11 Staff Table
```sql
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  permissions TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  invite_token TEXT,
  invite_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_agent_id ON staff(agent_id);
```

#### 1.12 Managed Properties Table
```sql
CREATE TABLE managed_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  is_listed BOOLEAN NOT NULL DEFAULT FALSE,
  listed_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_managed_properties_agent_id ON managed_properties(agent_id);
```

---

## 2. Row Level Security (RLS) Policies

Supabase requires RLS policies for data security. Here are the essential policies:

### 2.1 Enable RLS on All Tables
```sql
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
```

### 2.2 Users Policies
```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Public can read basic user info (for agent profiles, etc.)
CREATE POLICY "Public can read basic user info" ON users
  FOR SELECT USING (true);
```

### 2.3 Properties Policies
```sql
-- Anyone can read published properties
CREATE POLICY "Anyone can read properties" ON properties
  FOR SELECT USING (true);

-- Agents can create properties
CREATE POLICY "Agents can create properties" ON properties
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role IN ('agent', 'agency', 'admin')
    )
  );

-- Agents can update their own properties
CREATE POLICY "Agents can update own properties" ON properties
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Agents can delete their own properties
CREATE POLICY "Agents can delete own properties" ON properties
  FOR DELETE USING (user_id = auth.uid()::text);
```

### 2.4 Messages Policies
```sql
-- Users can read messages they sent or received
CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid()::text OR receiver_id = auth.uid()::text
  );

-- Users can send messages
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid()::text);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update received messages" ON messages
  FOR UPDATE USING (receiver_id = auth.uid()::text);
```

### 2.5 Bookings Policies
```sql
-- Users can read their own bookings
CREATE POLICY "Users can read own bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid()::text);

-- Users can create bookings
CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Property owners can read bookings for their properties
CREATE POLICY "Property owners can read bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = bookings.property_id 
      AND properties.user_id = auth.uid()::text
    )
  );

-- Property owners can update booking status
CREATE POLICY "Property owners can update bookings" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = bookings.property_id 
      AND properties.user_id = auth.uid()::text
    )
  );
```

### 2.6 Wishlists Policies
```sql
-- Users can read their own wishlist
CREATE POLICY "Users can read own wishlist" ON wishlists
  FOR SELECT USING (user_id = auth.uid()::text);

-- Users can add to their wishlist
CREATE POLICY "Users can add to wishlist" ON wishlists
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Users can remove from their wishlist
CREATE POLICY "Users can remove from wishlist" ON wishlists
  FOR DELETE USING (user_id = auth.uid()::text);
```

### 2.7 Notifications Policies
```sql
-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid()::text);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (user_id = auth.uid()::text);
```

### 2.8 Admin Tables Policies
```sql
-- Anyone can read banners and sections
CREATE POLICY "Anyone can read banners" ON banners
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read homepage sections" ON homepage_sections
  FOR SELECT USING (true);

-- Only admins can manage banners and sections
CREATE POLICY "Admins can manage banners" ON banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage sections" ON homepage_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );
```

---

## 3. Database Functions & Triggers

### 3.1 Auto-update `updated_at` Timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
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
```

### 3.2 Create User Profile on Signup
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 4. Storage Buckets

Create storage buckets in Supabase Dashboard:

### 4.1 Avatars Bucket
- **Name:** `avatars`
- **Public:** `true`
- **File size limit:** 2MB
- **Allowed MIME types:** `image/jpeg, image/png, image/webp`

### 4.2 Properties Bucket
- **Name:** `properties`
- **Public:** `true`
- **File size limit:** 10MB
- **Allowed MIME types:** `image/jpeg, image/png, image/webp`

### 4.3 Documents Bucket
- **Name:** `documents`
- **Public:** `false`
- **File size limit:** 10MB
- **Allowed MIME types:** `application/pdf, image/jpeg, image/png`

### 4.4 Banners Bucket
- **Name:** `banners`
- **Public:** `true`
- **File size limit:** 5MB
- **Allowed MIME types:** `image/jpeg, image/png, image/webp`

### Storage Policies
```sql
-- Avatars - Users can upload their own
CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Properties - Agents can upload
CREATE POLICY "Agents can upload property images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'properties' 
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role IN ('agent', 'agency', 'admin')
    )
  );

CREATE POLICY "Anyone can view property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'properties');
```

---

## 5. Frontend Migration Steps

### 5.1 Install Supabase Client
```bash
bun add @supabase/supabase-js
```

### 5.2 Create Supabase Client (`lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
```

### 5.3 Update Environment Variables
Your `.env` file already has Supabase credentials. ✅

### 5.4 Files to Remove (Rork Backend)
```
backend/ (entire folder)
lib/trpc.ts
utils/api.ts
drizzle.config.ts
```

### 5.5 Files to Update

#### Update `utils/auth.ts`
Replace tRPC auth with Supabase Auth:
```typescript
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_DATA_KEY = '@user_data';

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'agent' | 'agency' | 'admin';
  accountTier?: 'free' | 'pro' | 'agency';
}

export async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function getUserData(): Promise<UserData | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile as UserData;
}

export async function clearAuthData(): Promise<void> {
  await supabase.auth.signOut();
  await AsyncStorage.removeItem(USER_DATA_KEY);
}

export async function isAuthenticated(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}
```

#### Update Context Files
Replace tRPC queries with Supabase queries in:
- `contexts/UserContext.tsx`
- `contexts/AgentContext.tsx`
- `contexts/BookingContext.tsx`
- etc.

Example for UserContext:
```typescript
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const [UserContext, useUser] = createContextHook(() => {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      return data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profile: Partial<UserData>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .update(profile)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    updateProfile: updateProfileMutation.mutate,
  };
});
```

### 5.6 Update `app/_layout.tsx`
Remove tRPC provider:
```typescript
// Remove these imports
import { trpc, trpcClient } from "@/lib/trpc";

// Remove this wrapper in the return
<trpc.Provider client={trpcClient} queryClient={queryClient}>
  ...
</trpc.Provider>

// Keep only QueryClientProvider
```

### 5.7 Authentication Examples

#### Signup
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      name,
      role: 'client',
    },
  },
});
```

#### Login
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

#### Logout
```typescript
await supabase.auth.signOut();
```

### 5.8 Data Queries Examples

#### Fetch Properties
```typescript
const { data: properties } = await supabase
  .from('properties')
  .select('*, agents(*), users(*)')
  .eq('status', 'For Rent')
  .order('created_at', { ascending: false })
  .limit(10);
```

#### Create Property
```typescript
const { data, error } = await supabase
  .from('properties')
  .insert({
    title: 'Modern Apartment',
    price: 1500,
    agent_id: agentId,
    user_id: userId,
    // ... other fields
  })
  .select()
  .single();
```

#### Upload Image
```typescript
const { data, error } = await supabase.storage
  .from('properties')
  .upload(`${userId}/${Date.now()}.jpg`, file);

const publicUrl = supabase.storage
  .from('properties')
  .getPublicUrl(data.path).data.publicUrl;
```

### 5.9 Realtime Subscriptions

#### Listen to new messages
```typescript
const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${userId}`,
    },
    (payload) => {
      console.log('New message:', payload.new);
      // Update UI
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

---

## 6. API Mapping Reference

All tRPC routes need to be replaced with Supabase queries. Here's the complete mapping:

### Auth
- `trpc.auth.signup` → `supabase.auth.signUp()`
- `trpc.auth.login` → `supabase.auth.signInWithPassword()`
- `trpc.auth.logout` → `supabase.auth.signOut()`
- `trpc.auth.me` → `supabase.auth.getUser()`
- `trpc.auth.refresh` → Auto-handled by Supabase

### Users
- `trpc.users.getProfile` → `supabase.from('users').select().eq('id', userId)`
- `trpc.users.updateProfile` → `supabase.from('users').update()`
- `trpc.users.uploadAvatar` → `supabase.storage.from('avatars').upload()`

### Properties
- `trpc.properties.list` → `supabase.from('properties').select()`
- `trpc.properties.get` → `supabase.from('properties').select().eq('id', id).single()`
- `trpc.properties.create` → `supabase.from('properties').insert()`
- `trpc.properties.update` → `supabase.from('properties').update()`
- `trpc.properties.delete` → `supabase.from('properties').delete()`

### Bookings
- `trpc.bookings.list` → `supabase.from('bookings').select()`
- `trpc.bookings.create` → `supabase.from('bookings').insert()`
- `trpc.bookings.updateStatus` → `supabase.from('bookings').update()`

### Messages
- `trpc.messages.listConversations` → `supabase.from('messages').select()`
- `trpc.messages.send` → `supabase.from('messages').insert()`
- `trpc.messages.markAsRead` → `supabase.from('messages').update()`

### Wishlists
- `trpc.wishlists.list` → `supabase.from('wishlists').select()`
- `trpc.wishlists.add` → `supabase.from('wishlists').insert()`
- `trpc.wishlists.remove` → `supabase.from('wishlists').delete()`

---

## 7. Complete Migration Checklist

### Phase 1: Database Setup
- [ ] Create Supabase project
- [ ] Run all table creation scripts
- [ ] Enable RLS on all tables
- [ ] Create RLS policies
- [ ] Add database functions & triggers
- [ ] Create storage buckets
- [ ] Configure storage policies

### Phase 2: Frontend Setup
- [ ] Install `@supabase/supabase-js`
- [ ] Create `lib/supabase.ts` client
- [ ] Update `.env` with Supabase credentials
- [ ] Remove tRPC provider from `app/_layout.tsx`

### Phase 3: Code Migration
- [ ] Update `utils/auth.ts` for Supabase Auth
- [ ] Update all context files (UserContext, AgentContext, etc.)
- [ ] Replace all tRPC queries in pages
- [ ] Update file upload logic
- [ ] Update authentication screens (login, signup)

### Phase 4: Testing
- [ ] Test user signup/login
- [ ] Test property CRUD operations
- [ ] Test bookings
- [ ] Test messages & realtime
- [ ] Test file uploads
- [ ] Test admin features

### Phase 5: Cleanup
- [ ] Delete `backend/` folder
- [ ] Delete `lib/trpc.ts`
- [ ] Remove tRPC dependencies from `package.json`
- [ ] Remove unused imports

---

## 8. Migration Script

Run this SQL in Supabase SQL Editor to set up everything:

See `SUPABASE_MIGRATION_SCRIPT.sql` (will be created separately)

---

## 9. Benefits of Supabase

✅ **Built-in Authentication** - No manual JWT/session handling
✅ **Real-time Subscriptions** - WebSocket support out of the box
✅ **Row Level Security** - Database-level security policies
✅ **File Storage** - CDN-backed object storage
✅ **Auto-generated API** - REST & GraphQL endpoints
✅ **PostgreSQL** - More powerful than SQLite
✅ **Scalability** - Handles production workloads

---

## Need Help?

If you encounter issues during migration:
1. Check Supabase logs in Dashboard
2. Test RLS policies with different user roles
3. Verify storage bucket permissions
4. Check PostgreSQL error messages

Good luck with the migration! 🚀
