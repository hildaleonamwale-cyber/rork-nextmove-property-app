# Avatar Upload Fix

## Problem
Avatar uploads are failing with "new row violates row-level security policy" error.

## Root Cause
The Supabase Storage buckets don't have Row Level Security (RLS) policies configured to allow authenticated users to upload files.

## Solution

### Step 1: Apply Storage Policies
Execute the SQL in `SUPABASE_STORAGE_POLICIES.sql` in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `SUPABASE_STORAGE_POLICIES.sql`
4. Paste and run it

This will:
- Create storage buckets (`avatars`, `properties`, `banners`) if they don't exist
- Set up RLS policies for each bucket
- Allow authenticated users to upload avatars to their own folder

### Step 2: Code Fix Applied
The code has been updated to use the correct folder structure for avatar uploads:
- Old: `{userId}-{timestamp}.jpg` (root of bucket)
- New: `{userId}/avatar-{timestamp}.jpg` (in user's folder)

This matches the RLS policy requirement that files must be in a folder named by the user's ID.

## Testing
1. Apply the SQL script
2. Log in to the app
3. Go to Account > Personal Information
4. Tap the camera icon on the profile picture
5. Select a photo from your library
6. The upload should now succeed without RLS errors

## What the Policies Do

### Avatars Bucket
- ✅ Anyone can view avatars (SELECT)
- ✅ Authenticated users can upload to their own folder (INSERT)
- ✅ Authenticated users can update their own avatars (UPDATE)
- ✅ Authenticated users can delete their own avatars (DELETE)

### Properties Bucket
- ✅ Anyone can view property images (SELECT)
- ✅ Authenticated users can upload property images (INSERT)
- ✅ Authenticated users can update property images (UPDATE)
- ✅ Authenticated users can delete property images (DELETE)

### Banners Bucket
- ✅ Anyone can view banners (SELECT)
- ✅ Only service role (admin operations) can manage banners (INSERT/UPDATE/DELETE)

## Notes
- The avatar upload now includes the user ID in the file path for proper access control
- All buckets are set to public for read access (getPublicUrl works)
- Write operations are restricted by RLS policies based on authentication and ownership
