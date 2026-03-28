# Supabase Database Fix Instructions

## Issues Fixed
1. ❌ **Bookings relationship error** - Missing agent_id relationship
2. ❌ **Property UUID error** - Invalid UUID "1" being used
3. ❌ **User profile fetch errors** - Improved error handling
4. ❌ **Missing database columns** - Added required columns
5. ❌ **RLS policy recursion** - Simplified policies to avoid infinite loops

## Steps to Fix

### 1. Run the SQL Fix Script
Go to Supabase Dashboard → SQL Editor and run **`SUPABASE_COMPLETE_FIX.sql`**

This script will:
- Drop all existing conflicting policies
- Add missing columns (listing_type, beds, baths, suburb, province, coordinates, verified, bookings, agent_id in bookings, etc.)
- Create simplified RLS policies without recursion
- Add proper indexes
- Fix the bookings table to include agent_id

### 2. Verify the Changes
After running the script, verify in Supabase:
- ✅ Table `bookings` has column `agent_id`
- ✅ Table `properties` has columns: `listing_type`, `beds`, `baths`, `suburb`, `province`, `coordinates`, `verified`, `bookings`
- ✅ Table `users` has column `last_active`
- ✅ No RLS policy errors in the logs

### 3. Test Authentication Flow
1. **Signup**: Create a new account
2. **Login**: Login with existing credentials
3. **Profile**: View user profile in account page

### 4. Test Property & Booking Flow
1. **View Properties**: Browse properties on home page
2. **View Property Detail**: Click on a property (should work with any property ID)
3. **Create Booking**: Select date/time and book a tour
4. **View Bookings**: Check bookings page

## What Was Changed in the Code

### Fixed Files:
1. **`hooks/useSupabaseBookings.ts`**
   - Fixed agent relationship query
   - Added proper user info fetching when creating bookings
   - Added all required fields for bookings table

2. **`hooks/useSupabaseProperties.ts`**
   - Added support for both `beds`/`bedrooms` and `baths`/`bathrooms` columns
   - Fixed property transformation to handle legacy and new column names

3. **`utils/supabase-auth.ts`**
   - Improved error handling for profile fetches
   - Auto sign-out when profile fetch fails
   - Better error messages

4. **`app/property/[id].tsx`**
   - Fixed property ID extraction to handle string/array properly
   - Prevents passing invalid UUIDs like "1"

## Expected Behavior After Fix

### ✅ Authentication
- Signup creates user profile automatically
- Login fetches and caches user profile
- Profile updates work correctly
- Auth errors are handled gracefully

### ✅ Properties
- Properties load on home page
- Property detail page works with real UUIDs
- Property views increment correctly

### ✅ Bookings
- Users can create bookings
- Bookings show agent information
- Agents can see their property bookings
- Booking status updates work

### ✅ Admin Features
- Admin can view users
- Admin can view and manage banners
- Admin can view and manage homepage sections

## Troubleshooting

### If you still see errors:

1. **"Could not find relationship"**
   - Make sure the SQL fix script ran completely
   - Check that all indexes are created
   - Verify foreign keys exist

2. **"Invalid UUID"**
   - Clear app storage/cache
   - Make sure you're not navigating to old mock property IDs

3. **"Permission denied"**
   - Check RLS policies are created
   - Verify user is authenticated
   - Check user role is correct

4. **Profile not loading**
   - Sign out and sign in again
   - Check the `users` table has your record
   - Verify the auth.users record exists

## Database Schema Summary

### Key Tables:
- `users` - User profiles and authentication
- `agents` - Agent/Agency profiles (linked to users)
- `properties` - Property listings
- `bookings` - Property viewing bookings
- `messages` - User-to-user messages
- `notifications` - User notifications
- `wishlists` - Saved properties
- `banners` - Homepage banners (admin)
- `homepage_sections` - Homepage sections (admin)
- `staff` - Agent staff members
- `managed_properties` - Agent managed properties

### Important Relationships:
- `users` → `agents` (one-to-one via user_id)
- `agents` → `properties` (one-to-many via agent_id)
- `properties` → `bookings` (one-to-many via property_id)
- `users` → `bookings` (one-to-many via user_id)
- `agents` → `bookings` (one-to-many via agent_id) ← **FIXED**
