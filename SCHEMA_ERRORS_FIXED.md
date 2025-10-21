# Schema Errors Fixed

## Summary

Fixed two critical database schema errors that were preventing wishlist and conversations from working:

1. ✅ **Wishlist Error**: Column `properties.beds` does not exist
2. ✅ **Conversations Error**: Relationship between 'conversations' and 'properties' not found

## What Was Done

### 1. Created SQL Migration File

**File**: `SCHEMA_FIXES.sql`

This comprehensive SQL file will:
- Rename `bedrooms` → `beds` and `bathrooms` → `baths` in properties table
- Add missing columns: `suburb`, `province`, `coordinates`, `verified`, `bookings`
- Create the `conversations` table with proper structure
- Add `conversation_id` column to messages table
- Migrate existing messages to conversations
- Set up proper RLS policies for conversations
- Create triggers for automatic timestamp updates
- Grant necessary permissions

### 2. Updated Frontend Hooks

**Files Modified**:
- `hooks/useSupabaseWishlist.ts`
- `hooks/useSupabaseMessages.ts`

**Changes**:
- Made hooks more defensive to handle both old and new column names
- Query both `beds`/`bedrooms` and `baths`/`bathrooms` columns
- Handle both `suburb`/`state` and `province` columns
- Handle both `coordinates` object and separate `latitude`/`longitude` fields
- Fixed conversations query to fetch property titles separately (no join)
- Improved error handling and fallback values

### 3. Created Documentation

**Files**:
- `SCHEMA_FIXES_INSTRUCTIONS.md` - Detailed instructions for applying the fix
- `SCHEMA_ERRORS_FIXED.md` - This summary document

## Next Steps - ACTION REQUIRED

### Execute the SQL Migration

You **MUST** run the SQL migration for full functionality:

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Create a new query
4. Copy and paste the entire contents of `SCHEMA_FIXES.sql`
5. Click "Run" to execute

### Verify the Fix

After running the SQL:

```sql
-- Check properties columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name IN ('beds', 'baths', 'suburb', 'province');

-- Check conversations table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'conversations'
);

-- Check messages have conversation_id
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name = 'conversation_id';
```

All queries should return results indicating the columns/tables exist.

## Current State

### Without SQL Migration (Current)
- ❌ Wishlist will show errors but hooks will try to work around it
- ❌ Conversations will fail completely (no table exists)
- ⚠️ Limited functionality, many features broken

### With SQL Migration (After you run it)
- ✅ Wishlist will work perfectly
- ✅ Conversations will load and display correctly
- ✅ Real-time messaging will function
- ✅ All property data will be properly structured
- ✅ Full functionality restored

## Technical Details

### Schema Changes

**Properties Table**:
- `bedrooms` renamed to `beds`
- `bathrooms` renamed to `baths`
- Added: `suburb TEXT`
- Added: `province TEXT`
- Added: `coordinates JSONB`
- Added: `verified BOOLEAN`
- Added: `bookings INTEGER`

**New Conversations Table**:
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  participants TEXT[] NOT NULL,
  property_id UUID REFERENCES properties(id),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Messages Table Update**:
- Added: `conversation_id UUID REFERENCES conversations(id)`

### Hook Improvements

Both hooks now:
- Query multiple column variations to ensure compatibility
- Provide sensible defaults for missing data
- Handle coordinate formats (object vs separate fields)
- Have better error messages and logging
- Are defensive against schema mismatches

## Troubleshooting

### If wishlist still shows errors:
1. Check if SQL migration was applied successfully
2. Verify `beds` and `baths` columns exist
3. Clear browser cache and reload

### If conversations still fail:
1. Check if `conversations` table exists in Supabase
2. Check if `messages` table has `conversation_id` column
3. Verify RLS policies were created
4. Check browser console for detailed error messages

### If you see "relation does not exist":
- The SQL migration hasn't been run yet
- Run the full `SCHEMA_FIXES.sql` file in Supabase SQL Editor

## Support

If issues persist after applying the SQL migration:
1. Check Supabase SQL Editor for any error messages during migration
2. Verify all RLS policies were created successfully
3. Check browser console for detailed error logs
4. Ensure you're logged in with a valid session

## Files Reference

- `SCHEMA_FIXES.sql` - SQL migration to run in Supabase
- `SCHEMA_FIXES_INSTRUCTIONS.md` - Detailed setup instructions
- `hooks/useSupabaseWishlist.ts` - Updated wishlist hook
- `hooks/useSupabaseMessages.ts` - Updated messages/conversations hooks
