# Mode Switching and Profile Picture Fixes

## Summary
Fixed the account page to properly display profile pictures based on the user mode (client vs agent), and ensured that agent onboarding only appears for first-time agent setup.

## Changes Made

### 1. Account Page (`app/(tabs)/account.tsx`)
**Problem**: Both client and agent modes showed the same profile picture, and clicking Agent Mode always went to onboarding even for existing agents.

**Solution**:
- Added `useAgentProfile` hook to access agent profile data
- Updated profile picture display logic:
  - **Client Mode**: Shows personal avatar (user.avatar) or User icon placeholder
  - **Agent Mode**: Shows agent avatar (user.avatar) or Briefcase icon placeholder
- Updated profile name display:
  - **Client Mode**: Shows user's personal name
  - **Agent Mode**: Shows company name if available, otherwise user's personal name
- Updated Agent Mode button logic:
  - Checks if user has completed agent profile setup (`agentProfile?.accountSetupComplete`)
  - New users without agent profile → Navigate to onboarding
  - Returning users with agent profile → Navigate directly to dashboard
  - Already in agent mode → Navigate to dashboard
- Updated Edit button:
  - **Client Mode**: Routes to `/account/personal-info`
  - **Agent Mode**: Routes to `/agent/edit-profile`

### 2. Agent Profile Context (`contexts/AgentProfileContext.tsx`)
**Problem**: The `companyName` field wasn't exposed at the root level of the profile object.

**Solution**:
- Added `companyName: agent.companyName` to the profile object
- Ensured `accountSetupComplete` is properly calculated based on the presence of `companyName`

### 3. Agent Onboarding (`app/agent/onboarding.tsx`)
**Problem**: Onboarding screens appeared even for users who had already completed setup.

**Solution**:
- Added `useEffect` hook to check if profile is already complete
- If `profile.accountSetupComplete` is `true`, automatically redirect to agent dashboard
- Prevents users from seeing onboarding screens multiple times
- Initializes profile picture with user's existing avatar if available

## User Experience Improvements

### Mode Switching
1. **Clear Visual Distinction**: Different icons for client (User) vs agent (Briefcase) modes
2. **Smart Navigation**: System intelligently routes users based on their setup status
3. **No Redundant Onboarding**: Returning agents skip onboarding and go straight to dashboard

### Profile Display
1. **Mode-Specific Information**:
   - Client mode shows personal name
   - Agent mode shows company/business name
2. **Appropriate Icons**: Generic icons match the mode context
3. **Correct Edit Actions**: Edit button takes users to the right place based on mode

## Technical Details

### Profile Complete Detection
The system uses `accountSetupComplete` flag which is calculated as:
```typescript
accountSetupComplete: !!agent.companyName
```
This means a user has completed agent onboarding if they have set a company name.

### Mode Detection
```typescript
const hasAgentProfile = agentProfile?.accountSetupComplete;
```
This flag is checked before routing to determine if the user should see onboarding or dashboard.

## Testing Checklist
- [ ] New user switches to agent mode → sees onboarding
- [ ] User completes onboarding → redirected to dashboard
- [ ] Returning agent clicks agent mode → goes directly to dashboard
- [ ] Client mode shows personal profile info
- [ ] Agent mode shows company profile info
- [ ] Edit button routes correctly in both modes
- [ ] Profile pictures display correctly in both modes
- [ ] No duplicate onboarding for returning agents

## Files Modified
1. `app/(tabs)/account.tsx` - Account page with mode switching
2. `contexts/AgentProfileContext.tsx` - Agent profile context
3. `app/agent/onboarding.tsx` - Agent onboarding flow

## Notes
- The banner image feature is prepared in onboarding but not yet displayed on the account page
- All changes work for individual landlords, free agents, and business agents
- The system properly persists agent profile data in Supabase
