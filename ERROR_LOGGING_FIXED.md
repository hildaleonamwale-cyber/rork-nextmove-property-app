# Error Logging Fixes Applied

## Problem
Errors were being logged as `[object Object]` instead of showing actual error messages:
- "Error fetching user profile: [object Object]"
- "[Auth] Profile fetch error: [object Object]"

## Root Cause
Error objects from Supabase have their properties in non-enumerable fields. When trying to log them with `JSON.stringify(error)` or convert them to strings, they appear as `[object Object]`.

## Solutions Applied

### 1. Fixed Error Logging in `utils/supabase-auth.ts`
Updated three locations to properly extract error messages:

**Before:**
```typescript
console.error('Error fetching user profile:', error.message || JSON.stringify(error));
```

**After:**
```typescript
const errorMsg = error instanceof Error 
  ? error.message 
  : (typeof error === 'string' ? error : JSON.stringify(error, Object.getOwnPropertyNames(error)));
console.error('Error fetching user profile:', errorMsg);
```

This uses `Object.getOwnPropertyNames(error)` to access hidden error properties.

### 2. Fixed Error Logging in `app/profile/[id].tsx`
**Before:**
```typescript
const errorMsg = err?.message || JSON.stringify(err) || 'Unknown error';
console.error('Profile fetch error:', errorMsg);
```

**After:**
```typescript
const errorMsg = err instanceof Error 
  ? err.message 
  : (typeof err === 'string' ? err : (err?.message || 'Unknown error'));
console.error('Profile fetch error:', errorMsg, '- Full error:', err);
```

## What This Fixes
- ✅ Error messages will now display actual error details
- ✅ Developers can debug authentication and profile fetch issues
- ✅ Users won't see confusing `[object Object]` errors

## Next Steps for Debugging
Now that errors are properly logged, you should:

1. **Check the console** - Look for the actual error messages now being displayed
2. **Common issues to look for:**
   - "No rows returned" - Profile doesn't exist in database
   - "JWT expired" - Session expired, need to re-login
   - "Permission denied" - RLS policies blocking access
   - "Connection refused" - Database connection issues
   - "Invalid token" - Authentication token is invalid

3. **Verify database setup:**
   - Check if `users` table exists
   - Verify RLS policies allow authenticated users to read their own profile
   - Ensure the auth trigger creates user profiles on signup

4. **Test authentication flow:**
   - Try logging out and back in
   - Check if new signups create profiles correctly
   - Verify session tokens are being stored properly

## Files Modified
- `utils/supabase-auth.ts` - Lines 116, 217-218, 352-353
- `app/profile/[id].tsx` - Lines 140-141
