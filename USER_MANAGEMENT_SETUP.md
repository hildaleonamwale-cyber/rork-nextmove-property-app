# User Management Setup

User management with profiles and roles is now fully integrated with the backend.

## Overview

The system includes:
- User profiles (name, email, phone, avatar, etc.)
- Agent profiles (company details, bio, specialties, etc.)
- Role-based access control (client, agent, agency, admin)
- Admin user management (list, block, verify, update roles)

## User Roles

### Client
- Default role for new users
- Can browse properties, make bookings, save favorites
- Limited access to agent features

### Agent
- Can create and manage property listings
- Access to booking calendar
- Can receive messages and inquiries
- Tier-based features (free, pro, agency)

### Agency
- Same as Agent but with agency-level features
- Staff management
- Shared dashboard
- Portfolio page

### Admin
- Full system access
- User management
- Content moderation
- System settings

## API Endpoints

### User Profile
```typescript
// Get current user
const user = await trpc.auth.me.useQuery();

// Get any user profile (protected)
const profile = await trpc.users.getProfile.useQuery({ userId: "user-id" });

// Update profile
await trpc.users.updateProfile.useMutation({
  name: "John Doe",
  phone: "+263771234567"
});

// Upload avatar
await trpc.users.uploadAvatar.useMutation({
  base64Image: "base64-encoded-image"
});
```

### Agent Profile
```typescript
// Get agent profile (public)
const agentProfile = await trpc.agents.getProfile.useQuery({ userId: "user-id" });

// Create agent profile
await trpc.agents.createProfile.useMutation({
  package: "free",
  companyName: "My Agency",
  bio: "Professional real estate agent",
  specialties: ["Residential", "Commercial"],
  yearsExperience: 5,
  languages: ["English", "Shona"]
});

// Update agent profile
await trpc.agents.updateProfile.useMutation({
  bio: "Updated bio",
  specialties: ["Luxury Homes"],
  accountSetupComplete: true
});

// Upgrade package
await trpc.agents.upgradePackage.useMutation({
  package: "pro"
});
```

### Admin User Management
```typescript
// List users with filters
const users = await trpc.admin.listUsers.useQuery({
  role: "agent",
  search: "john",
  blocked: false,
  limit: 50,
  offset: 0
});

// Update user role
await trpc.admin.updateUserRole.useMutation({
  userId: "user-id",
  role: "agent"
});

// Block user
await trpc.admin.blockUser.useMutation({
  userId: "user-id",
  reason: "Violation of terms"
});

// Unblock user
await trpc.admin.unblockUser.useMutation({
  userId: "user-id"
});

// Verify user
await trpc.admin.verifyUser.useMutation({
  userId: "user-id",
  verified: true
});

// Get user statistics
const stats = await trpc.admin.getUserStats.useQuery();
```

## React Contexts

### UserContext
Manages authenticated user state and profile operations.

```typescript
import { useUser } from "@/contexts/UserContext";

const { 
  user,              // Current user object
  isLoading,         // Loading state
  updateProfile,     // Update profile function
  uploadAvatar,      // Upload avatar function
  refetch,           // Refetch user data
  isClient,          // Is user a client
  isAgent,           // Is user an agent/agency
  isAdmin,           // Is user an admin
  isAuthenticated    // Is user logged in
} = useUser();
```

### AgentContext
Manages agent profile state (requires UserContext).

```typescript
import { useAgent } from "@/contexts/AgentContext";

const {
  profile,            // Agent profile object
  isLoading,          // Loading state
  createProfile,      // Create agent profile
  updateProfile,      // Update agent profile
  upgradePackage,     // Upgrade package
  completeOnboarding, // Mark onboarding complete
  hasFeature,         // Check if feature is available
  refetch             // Refetch agent data
} = useAgent();
```

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email
- `password` - Hashed password
- `name` - Full name
- `phone` - Phone number
- `avatar` - Avatar URL
- `role` - User role (client, agent, agency, admin)
- `verified` - Email verified flag
- `blocked` - Account blocked flag
- `lastActive` - Last activity timestamp
- `createdAt` - Account creation date
- `updatedAt` - Last update date

### Agent Profiles Table
- `id` - Primary key
- `userId` - Foreign key to users
- `package` - Subscription tier (free, pro, agency)
- `accountSetupComplete` - Onboarding complete flag
- `companyName` - Company name
- `companyLogo` - Logo URL
- `banner` - Banner image URL
- `bio` - Agent bio
- `specialties` - JSON array of specialties
- `yearsExperience` - Years of experience
- `languages` - JSON array of languages
- `phone` - Business phone
- `email` - Business email
- `website` - Website URL
- `address` - Business address
- `socialMedia` - JSON object of social links
- `followers` - Follower count
- `following` - Following count
- `verified` - Verified badge flag
- `createdAt` - Profile creation date
- `updatedAt` - Last update date

## Feature Gating

Agent features are gated by package tier:

### Free Tier
- basic_listing
- profile_edit
- banner_upload
- updates
- basic_analytics

### Pro Tier
All Free features plus:
- booking_calendar
- messaging
- verified_badge
- full_analytics

### Agency Tier
All Pro features plus:
- staff_accounts
- shared_dashboard
- portfolio_page
- 3d_tours
- property_management

Check feature access:
```typescript
const { hasFeature } = useAgent();

if (hasFeature('booking_calendar')) {
  // Show booking calendar
}
```

## Middleware & Authorization

### Public Procedures
Anyone can access (e.g., viewing agent profiles)

### Protected Procedures
Requires authentication (e.g., updating own profile)

### Agent Procedures
Requires agent/agency/admin role (e.g., creating properties)

### Admin Procedures
Requires admin role only (e.g., user management)

## Audit Logging

All admin actions are logged to the `audit_logs` table:
- User role changes
- User blocks/unblocks
- User verification changes
- Includes admin info, action type, and metadata

## Next Steps

1. **Properties Management**: Add property CRUD operations
2. **Bookings System**: Implement booking management
3. **Messaging**: Build real-time messaging
4. **Notifications**: Set up push/email notifications
5. **Analytics**: Track user activity and engagement
6. **Search & Filters**: Advanced search functionality

## Testing

To test user management:

1. **Create a user**: Sign up via `/signup`
2. **Login**: Get authentication token
3. **View profile**: Call `auth.me` to see user data
4. **Update profile**: Change name, phone, avatar
5. **Create agent profile**: If you're an agent
6. **Admin features**: Change role to admin in database, then access admin endpoints

## Security Notes

- Passwords are hashed with bcrypt
- Sessions expire after 7 days
- Admin actions are audited
- Users cannot remove their own admin role
- Users cannot block themselves
- Blocked users cannot access protected endpoints
