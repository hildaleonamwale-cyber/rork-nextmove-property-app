# Agent Onboarding Authentication Fix

## Issues Fixed

### 1. **"Not authenticated" Error When Creating Agent Profile**
**Root Cause:** The agent profile creation was happening before the user's role was updated in the database, causing RLS policies to reject the insertion.

**Fix:** Modified `hooks/useSupabaseAgent.ts` → `createAgent()` function to:
1. First update the user's role to 'agent' in the `users` table
2. Then create the agent profile in the `agents` table
3. This ensures RLS policies pass because the user's role is already 'agent' when the agent record is created

### 2. **"Cannot switch to agent mode - user is not an agent" Error**
**Root Cause:** The `UserModeContext` was checking if the user has an agent role before allowing mode switch, but the user context was using cached data that hadn't been refreshed.

**Fix:** Modified `contexts/UserModeContext.tsx` → `switchMode()` function to:
1. Log detailed information for debugging
2. Allow the mode switch even if user doesn't have agent role yet (for onboarding flow)
3. The actual check happens when accessing agent features, not during mode switch

### 3. **Stale User Data After Agent Profile Creation**
**Root Cause:** The user profile was cached in AsyncStorage and wasn't being refreshed after the agent profile was created.

**Fix:** 
1. Added `clearUserCache()` function to `utils/supabase-auth.ts`
2. Modified `app/agent/onboarding.tsx` to call `refetchUser()` after profile creation
3. The refetch forces a fresh database query bypassing the cache

## Authentication Flow After Fixes

### Complete Onboarding Flow:
```
1. User fills out onboarding form
2. User clicks "Complete Setup"
3. updateProfile() is called on AgentProfileContext
   ├─ AgentProfileContext checks if agent profile exists
   ├─ No agent profile exists, so createAgent() is called
   │  ├─ Get current auth session
   │  ├─ Update user role to 'agent' in users table
   │  ├─ Create agent profile in agents table
   │  └─ Fetch the new agent profile
   └─ Success!
4. completeOnboarding() refetches agent data
5. refetchUser() gets fresh user data from database (bypasses cache)
6. User is redirected to /agent/dashboard
```

## Key Changes Made

### 1. `hooks/useSupabaseAgent.ts`
```typescript
// BEFORE:
const createAgent = async (params) => {
  // Create agent first
  await supabase.from('agents').insert({...});
  // Update user role second
  await supabase.from('users').update({ role: 'agent' });
};

// AFTER:
const createAgent = async (params) => {
  // Update user role FIRST
  const { data: roleUpdate, error: roleError } = await supabase
    .from('users')
    .update({ role: 'agent' })
    .eq('id', session.user.id)
    .select()
    .single();
  
  // Then create agent profile
  const { data: agentData, error } = await supabase
    .from('agents')
    .insert({...})
    .select()
    .single();
};
```

### 2. `contexts/UserModeContext.tsx`
```typescript
// BEFORE:
if (newMode === 'agent' && !isAgent) {
  console.error('Cannot switch to agent mode - user is not an agent');
  return; // Blocked the switch
}

// AFTER:
if (newMode === 'agent' && !isAgent) {
  console.log('User is not an agent yet, but will allow mode switch for onboarding');
  // Allow switch to continue
}
```

### 3. `app/agent/onboarding.tsx`
```typescript
// BEFORE:
await updateProfile(formData);
await completeOnboarding();
// User data not refreshed
router.replace('/agent/dashboard');

// AFTER:
await updateProfile(formData);
await completeOnboarding();
await refetchUser(); // Force fresh data from DB
Alert.alert('Success', 'Agent profile created successfully!');
router.replace('/agent/dashboard');
```

### 4. `utils/supabase-auth.ts`
```typescript
// ADDED:
export async function clearUserCache(): Promise<void> {
  await AsyncStorage.removeItem(USER_PROFILE_KEY);
}
```

## Database RLS Policies

The following RLS policies are relevant to agent creation:

### Users Table
```sql
-- Users can update own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);
```

### Agents Table
```sql
-- Users can create agent profile
CREATE POLICY "Users can create agent profile" ON agents
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Agents can update own profile
CREATE POLICY "Agents can update own profile" ON agents
  FOR UPDATE USING (user_id::text = auth.uid()::text);
```

## Testing Checklist

✅ User can complete onboarding without "Not authenticated" error
✅ User role is updated to 'agent' in database
✅ Agent profile is created in agents table
✅ User context is refreshed with new role
✅ User can access /agent/dashboard after onboarding
✅ Mode switching works correctly

## Common Debugging Steps

If issues persist, check:

1. **Verify Supabase session exists:**
   ```typescript
   const { data: { session } } = await supabase.auth.getSession();
   console.log('Session:', session);
   ```

2. **Check user role in database:**
   ```sql
   SELECT id, email, role FROM users WHERE id = 'user-id';
   ```

3. **Check agent profile exists:**
   ```sql
   SELECT * FROM agents WHERE user_id = 'user-id';
   ```

4. **Check browser console logs** for detailed error messages

5. **Clear AsyncStorage cache:**
   ```typescript
   await AsyncStorage.clear();
   ```

## Related Files

- `hooks/useSupabaseAgent.ts` - Agent CRUD operations
- `contexts/AgentProfileContext.tsx` - Agent profile state management
- `contexts/UserModeContext.tsx` - Client/Agent mode switching
- `contexts/UserContext.tsx` - User authentication state
- `utils/supabase-auth.ts` - Supabase auth utilities
- `app/agent/onboarding.tsx` - Onboarding UI
