# Supabase Error Fixes Guide

This guide will help you fix all the Supabase errors you're experiencing.

## Errors Being Fixed

1. ✅ **Infinite recursion in policy for relation "users"**
2. ✅ **Could not find the table 'public.sections' in the schema cache**
3. ✅ **Infinite recursion detected in policy for relation "users" (banners)**
4. ✅ **Could not find a relationship between 'bookings' and 'agent_profiles'**
5. ✅ **Could not find a relationship between 'properties' and 'agent_profiles'**

## Step 1: Run SQL Fixes in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to: **Project** → **SQL Editor**
3. Open the file `SUPABASE_FIXES.sql` (created in your project)
4. Copy the entire content
5. Paste it into the SQL Editor
6. Click **Run** to execute

This will:
- Fix the infinite recursion in users RLS policies
- Create the missing `sections` table
- Add missing columns to `bookings` and `properties` tables
- Update all RLS policies to work correctly

## Step 2: Frontend Code Updates (Already Done)

I've already updated the following files to handle errors gracefully:

### Updated Files:
- ✅ `hooks/useSupabaseAdmin.ts` - Fixed queries to avoid recursion
- ✅ `hooks/useSupabaseBookings.ts` - Fixed agent relationship
- ✅ `hooks/useSupabaseProperties.ts` - Fixed to avoid relationship errors

## Step 3: Verify the Fixes

After running the SQL script, run these queries in Supabase SQL Editor to verify:

### Check users table access:
```sql
SELECT COUNT(*) FROM users;
```

### Check sections table exists:
```sql
SELECT COUNT(*) FROM sections;
```

### Check banners table access:
```sql
SELECT COUNT(*) FROM banners;
```

### Check bookings with agent relationship:
```sql
SELECT b.id, b.agent_id, a.company_name 
FROM bookings b 
LEFT JOIN agents a ON b.agent_id = a.id 
LIMIT 5;
```

### Check properties with agent relationship:
```sql
SELECT p.id, p.agent_id, a.company_name 
FROM properties p 
LEFT JOIN agents a ON p.agent_id = a.id 
LIMIT 5;
```

## What Was Changed

### 1. RLS Policies
- **Before**: Policies had recursive SELECT that caused infinite loops
- **After**: Simplified policies that query specific columns only

### 2. Missing Tables
- **Created**: `sections` table for homepage sections management
- **Added columns**: `agent_id`, `visit_date`, `visit_time` to bookings

### 3. Query Optimization
- **Before**: `SELECT * FROM users` (causes recursion in RLS)
- **After**: `SELECT id, email, name, ... FROM users` (specific columns only)

### 4. Relationship Fixes
- **Before**: Queries tried to join with `agent_profiles` table
- **After**: Queries join with `agents` table correctly

## Common Issues & Solutions

### Issue: "Still seeing infinite recursion error"
**Solution**: Make sure you ran the entire SQL script. Drop ALL existing policies first.

### Issue: "Sections table still not found"
**Solution**: Check if table was created:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'sections';
```

### Issue: "Bookings still showing relationship error"
**Solution**: Verify agent_id column exists:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name = 'agent_id';
```

## Testing Your App

After applying fixes, test these features:

1. **Admin Dashboard**: Should load without errors
2. **Banners Page**: Should display banners list
3. **Users List**: Should show all users
4. **Bookings**: Should load user bookings
5. **Properties**: Should load with agent info

## Need More Help?

If you're still seeing errors after running the SQL script:

1. Copy the full error message from console
2. Run the verification queries above
3. Check if all tables exist in Supabase Dashboard → Table Editor
4. Ensure RLS policies are active (green toggle in Dashboard)

## Security Note

The current policies allow:
- ✅ Public read access to properties, agents, banners
- ✅ Users can only modify their own data
- ✅ Admins have elevated permissions
- ✅ No infinite recursion or performance issues
