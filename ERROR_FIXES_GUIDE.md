# Error Fixes Guide

This guide addresses the specific errors you're experiencing and how to fix them.

---

## 🔴 Error 1: "Could not find the table 'public.conversations'"

### Problem
The app is trying to access a `conversations` table that doesn't exist.

### Fix
The messages system doesn't use a separate conversations table. Messages are queried directly. This error is coming from `useSupabaseMessages` hook.

**Solution**: Messages are fetched by querying the `messages` table with sender/receiver filters. No action needed if you're not using the messages feature yet.

If you want to implement conversations:
```sql
-- Optional: Create a conversations view (not required)
CREATE OR REPLACE VIEW conversations AS
SELECT DISTINCT
  LEAST(sender_id, receiver_id) as user1_id,
  GREATEST(sender_id, receiver_id) as user2_id,
  MAX(created_at) as last_message_at
FROM messages
GROUP BY user1_id, user2_id;
```

---

## 🔴 Error 2: "Could not find a relationship between 'properties' and 'agent_profiles'"

### Problem
Query is looking for `agent_profiles` table but it's named `agents` in Supabase.

### Fix
The hooks already use the correct table name (`agents`). This error suggests old code is still running.

**Solution**:
1. Clear app cache: Stop the app and restart
2. If using web: Clear browser cache and reload
3. Check there are no old imports or cached files

The relationship is:
```
properties.agent_id → agents.id
agents.user_id → users.id
```

---

## 🔴 Error 3: "Could not find a relationship between 'bookings' and 'agents'"

### Problem
Missing foreign key or trying to join bookings with agents incorrectly.

### Fix
Run this SQL in Supabase:

```sql
-- Add agent_id to bookings if missing
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents(id);

-- Populate agent_id from properties
UPDATE bookings b
SET agent_id = p.agent_id
FROM properties p
WHERE b.property_id = p.id AND b.agent_id IS NULL;

-- Add index
CREATE INDEX IF NOT EXISTS idx_bookings_agent_id ON bookings(agent_id);

-- Update RLS policy
DROP POLICY IF EXISTS "Agents can read bookings" ON bookings;
CREATE POLICY "Agents can read bookings" ON bookings
  FOR SELECT USING (
    agent_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.user_id::text = auth.uid()::text 
      AND agents.id = bookings.agent_id
    )
  );
```

---

## 🔴 Error 4: "column agents_2.name does not exist"

### Problem
Query is trying to access a `name` column in the `agents` table, but agents use `company_name`.

### Fix
The `agents` table doesn't have a `name` column. Agent name comes from the linked `users` table.

**Solution**: Update the query in `useSupabaseBookings` to properly join users:

```typescript
// In useSupabaseBookings.ts
const { data, error: fetchError } = await query = supabase
  .from('bookings')
  .select(`
    *,
    properties(title, images),
    users!bookings_user_id_fkey(name, email, phone),
    agents(id, company_name, users!agents_user_id_fkey(name))
  `)
```

Or run this SQL to add a name column to agents:
```sql
-- Add computed column for agent name
ALTER TABLE agents 
  ADD COLUMN IF NOT EXISTS display_name TEXT 
  GENERATED ALWAYS AS (
    COALESCE(company_name, 'Agent')
  ) STORED;
```

---

## 🔴 Error 5: "invalid input syntax for type uuid: '1'"

### Problem
Trying to query a property with ID "1" which is not a valid UUID format.

### Fix
Supabase uses UUID (universally unique identifier) format like: `550e8400-e29b-41d4-a716-446655440000`

**Solution**:
1. Make sure you're passing the correct property ID from the list
2. Don't hardcode IDs like "1", "2", etc.
3. Get the ID from the property object: `property.id`

Example:
```typescript
// ❌ Wrong
router.push(`/property/1`);

// ✅ Correct
router.push(`/property/${property.id}`);
```

---

## 🔴 Error 6: Blank screen after agent onboarding

### Problem
Agent profile created but dashboard not loading.

### Possible Causes & Fixes

### Cause 1: Agent profile not created
**Check**: Open Supabase dashboard → Table Editor → `agents` table
**Fix**: If no agent record exists, create one:
```sql
INSERT INTO agents (user_id, company_name, package_level, rating, review_count)
VALUES (
  'your-user-id',  -- Get from users table
  'My Company',
  'free',
  0,
  0
);
```

### Cause 2: User role not updated
**Check**: In `users` table, verify `role` is 'agent', not 'client'
**Fix**:
```sql
UPDATE users 
SET role = 'agent' 
WHERE id = 'your-user-id';
```

### Cause 3: Missing data in AgentProfileContext
**Check console logs** for errors in data fetching

**Fix**: Ensure user is logged in and has an agent profile:
```typescript
const { user } = useUser();
const { profile, isLoading } = useAgentProfile();

console.log('User:', user);
console.log('Profile:', profile);
console.log('Loading:', isLoading);
```

### Cause 4: RLS policies blocking access
**Check**: User can't read their own agent profile
**Fix**:
```sql
-- Ensure this policy exists
CREATE POLICY "Users can create agent profile" ON agents
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Agents can read own profile" ON agents
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Agents can update own profile" ON agents
  FOR UPDATE USING (user_id::text = auth.uid()::text);
```

---

## 🔴 Error 7: Account page not updating

### Problem
Changes to user profile don't persist or show.

### Fix 1: Check authentication
```typescript
const { user, isAuthenticated } = useUser();
console.log('Authenticated:', isAuthenticated);
console.log('User:', user);
```

### Fix 2: Use refetch after update
```typescript
const { updateProfile, refetch } = useUser();

await updateProfile({ name: 'New Name' });
await refetch(true); // Force refresh from backend
```

### Fix 3: Clear AsyncStorage cache
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear user cache
await AsyncStorage.removeItem('@user_profile');
// Then refresh
await refetch(true);
```

### Fix 4: Check RLS policies
```sql
-- User should be able to update own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id::text = auth.uid()::text);
```

---

## 🔴 Error 8: Admin dashboard not loading

### Problem
SuperAdminContext shows loading forever or blank data.

### Cause 1: Table name mismatch
**Fix**: Run `SUPABASE_TABLE_FIX.sql` to rename `sections` to `homepage_sections`

### Cause 2: No data in tables
**Fix**: Add some initial data:
```sql
-- Add a banner
INSERT INTO banners (title, image_url, link, "order", enabled)
VALUES ('Welcome Banner', 'https://via.placeholder.com/800x400', '/', 1, true);

-- Add a section
INSERT INTO homepage_sections (type, title, "order", enabled, filters)
VALUES ('featured_properties', 'Featured Properties', 1, true, '{}'::jsonb);
```

### Cause 3: User is not admin
**Fix**: Update user role:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### Cause 4: RLS blocking admin access
**Fix**:
```sql
-- Admins can read everything
CREATE POLICY "Admins can manage banners" ON banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );
```

---

## 🔧 General Troubleshooting Steps

### 1. Check Supabase Connection
```typescript
import { supabase } from '@/lib/supabase';

// Test connection
const { data, error } = await supabase.from('users').select('count');
console.log('Connection test:', { data, error });
```

### 2. Verify Authentication
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User ID:', session?.user?.id);
```

### 3. Check Table Structure
```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check column names for a table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'your_table_name';
```

### 4. Verify RLS Policies
```sql
-- List all policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

### 5. Check Logs
- Open Supabase Dashboard → Logs
- Filter by error level
- Look for failed queries

---

## 🚀 Quick Fix Script

Run this to fix most common issues:

```bash
# In your Supabase SQL Editor, run:
```

```sql
-- Fix all common issues
BEGIN;

-- 1. Rename sections to homepage_sections
ALTER TABLE IF EXISTS sections RENAME TO homepage_sections;

-- 2. Add missing columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents(id);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'monthly';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT NOW();

-- 3. Populate missing data
UPDATE bookings b SET agent_id = p.agent_id FROM properties p WHERE b.property_id = p.id AND b.agent_id IS NULL;

-- 4. Add indexes
CREATE INDEX IF NOT EXISTS idx_bookings_agent_id ON bookings(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_verified ON properties(verified);

-- 5. Fix RLS policies
DROP POLICY IF EXISTS "Agents can read bookings" ON bookings;
CREATE POLICY "Agents can read bookings" ON bookings FOR SELECT USING (
  agent_id::text = auth.uid()::text OR
  EXISTS (SELECT 1 FROM agents WHERE agents.user_id::text = auth.uid()::text AND agents.id = bookings.agent_id)
);

COMMIT;
```

---

## ✅ Verification Checklist

After applying fixes, verify:

- [ ] Login works without errors
- [ ] User profile loads
- [ ] Agent dashboard shows data (if agent)
- [ ] Properties list displays
- [ ] Bookings can be created
- [ ] Admin panel loads (if admin)
- [ ] No console errors
- [ ] Data persists after refresh

---

## 📞 Still Having Issues?

1. **Check console logs** - All errors are logged with details
2. **Verify Supabase dashboard** - Check if data exists in tables
3. **Test with SQL Editor** - Run queries directly to isolate issues
4. **Clear all caches** - Remove AsyncStorage data and restart app
5. **Re-run migration** - Execute the full SQL migration script again

---

## 🎯 Expected Behavior

After all fixes:

✅ Login succeeds and redirects to home
✅ User profile displays in account page
✅ Agent dashboard shows when switching to agent mode
✅ Properties list from Supabase database
✅ Bookings create and display correctly
✅ Admin panel shows banners and sections
✅ All changes persist to database
✅ No "table not found" errors

---

**The key is ensuring your Supabase tables match the schema and all RLS policies are in place!**
