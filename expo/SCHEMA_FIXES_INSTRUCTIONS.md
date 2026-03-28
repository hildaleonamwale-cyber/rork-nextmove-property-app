# Schema Fixes Instructions

## Issues Fixed

1. **Wishlist Error**: Column `properties.beds` does not exist
   - The database has `bedrooms` and `bathrooms` but the code expects `beds` and `baths`

2. **Conversations Error**: Could not find a relationship between 'conversations' and 'properties'
   - The `conversations` table was missing from the schema
   - Messages didn't have a `conversation_id` column

## How to Apply the Fix

### Execute the SQL File

Run the `SCHEMA_FIXES.sql` file in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the contents of `SCHEMA_FIXES.sql`
5. Click "Run" to execute

### What the Fix Does

1. **Renames columns in properties table**:
   - `bedrooms` → `beds`
   - `bathrooms` → `baths`

2. **Adds missing columns to properties**:
   - `suburb` (TEXT)
   - `province` (TEXT)
   - `coordinates` (JSONB)
   - `verified` (BOOLEAN)
   - `bookings` (INTEGER)

3. **Creates conversations table**:
   - Links messages together in conversations
   - Supports property-related conversations
   - Includes proper RLS policies

4. **Migrates existing messages**:
   - Creates conversations from existing sender-receiver pairs
   - Links all messages to their conversations

5. **Updates RLS policies**:
   - Proper security for conversations
   - Messages can only be accessed through conversations

## Verification

After running the SQL, verify the changes:

```sql
-- Check properties columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name IN ('beds', 'baths', 'suburb', 'province', 'coordinates', 'verified', 'bookings');

-- Check conversations table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'conversations';

-- Check messages have conversation_id
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name = 'conversation_id';
```

## Expected Results

- ✅ Wishlist fetching will work correctly
- ✅ Conversations will load properly
- ✅ Messages will be grouped into conversations
- ✅ Real-time updates will work for both features

## Troubleshooting

If you still see errors after applying the fix:

1. **Check if the SQL ran completely**: Look for any error messages in the Supabase SQL Editor

2. **Verify RLS policies**: Make sure the policies were created successfully
   ```sql
   SELECT * FROM pg_policies WHERE tablename IN ('conversations', 'messages', 'properties');
   ```

3. **Check data migration**: Ensure existing messages were migrated
   ```sql
   SELECT COUNT(*) FROM messages WHERE conversation_id IS NULL;
   ```
   (Should return 0)

4. **Refresh your app**: Clear cache and reload the application

## Note

The hooks have been updated to be more defensive and handle edge cases better, but the database schema must be fixed for full functionality.
