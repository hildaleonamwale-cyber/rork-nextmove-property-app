# Database Fixes Applied

## Issues Fixed

### 1. Wishlist Error - Column `listing_type` does not exist
**Problem**: The hook was querying `listing_type` but Supabase uses `price_type`
**Fix**: Updated `hooks/useSupabaseWishlist.ts` to query `price_type` instead

### 2. Conversations Error - Relationship not found
**Problem**: The messages table didn't have a `conversation_id` column, causing relationship issues
**Fix**: 
- Created SQL migration to add `conversations` table
- Added `conversation_id` to messages table
- Updated `hooks/useSupabaseMessages.ts` to fetch messages separately for each conversation

## SQL Migration

Run the SQL file `SUPABASE_RELATIONSHIP_FIX.sql` in your Supabase SQL Editor. This will:

1. Add missing columns to properties table (`price_type`, `beds`, `baths`, `suburb`, etc.)
2. Create the `conversations` table
3. Add `conversation_id` column to messages
4. Migrate existing messages to conversations
5. Set up proper RLS policies
6. Add `user_mode` column to users table

## Steps to Apply

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `SUPABASE_RELATIONSHIP_FIX.sql`
4. Paste and run it
5. Refresh your app

The errors should now be resolved!
