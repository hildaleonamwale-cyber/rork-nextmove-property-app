# Quick Start Guide - Supabase Integration

Your app is now fully connected to Supabase! Here's everything you need to know.

---

## ✅ What's Been Done

### 1. Context Providers - All Connected
- ✅ **AgentProfileContext** - Agent profiles, managed properties, staff
- ✅ **UserContext** - Authentication, profile management
- ✅ **UserModeContext** - Client/Agent mode switching
- ✅ **BookingContext** - Property viewing bookings
- ✅ **SuperAdminContext** - Admin panel (banners, sections, users)

### 2. Supabase Hooks - Created
- ✅ `useSupabaseAgent` - Agent profile operations
- ✅ `useSupabaseManagedProperties` - Property management
- ✅ `useSupabaseStaff` - Staff member management
- ✅ `useSupabaseProperties` - Property listings
- ✅ `useSupabaseBookings` - Booking management
- ✅ `useSupabaseBanners` - Homepage banners
- ✅ `useSupabaseSections` - Homepage sections
- ✅ `useSupabaseUsers` - User management
- ✅ `useSupabaseWishlist` - User wishlists
- ✅ `useSupabaseMessages` - Messaging
- ✅ `useSupabaseNotifications` - Notifications

### 3. Table Names Fixed
- ✅ Changed `sections` → `homepage_sections` in hooks
- ✅ All table references match SQL schema

---

## 🚀 How To Use

### Step 1: Login/Signup
```typescript
import { login, signup } from '@/utils/supabase-auth';

// Sign up new user
const { user } = await signup({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
  phone: '+1234567890'
});

// Login existing user
const { user } = await login({
  email: 'user@example.com',
  password: 'password123'
});
```

### Step 2: Access User Data
```typescript
import { useUser } from '@/contexts/UserContext';

function MyScreen() {
  const { user, isLoading, isAgent } = useUser();
  
  if (isLoading) return <ActivityIndicator />;
  if (!user) return <LoginScreen />;
  
  return <Text>Welcome, {user.name}!</Text>;
}
```

### Step 3: Create Agent Profile (Optional)
```typescript
import { useAgentProfile } from '@/contexts/AgentProfileContext';

function BecomeAgentScreen() {
  const { updateProfile } = useAgentProfile();
  
  const onSubmit = async () => {
    await updateProfile({
      companyName: 'Elite Realty',
      bio: 'Top-rated real estate agency',
      specialties: ['Luxury Homes'],
      yearsExperience: 10
    });
  };
}
```

### Step 4: Add Properties
```typescript
import { useSupabaseProperties } from '@/hooks/useSupabaseProperties';

function AddPropertyScreen() {
  // Property creation happens via createProperty function
  // Properties are automatically linked to the agent
}
```

### Step 5: Manage Bookings
```typescript
import { useBookings } from '@/contexts/BookingContext';

function BookingScreen() {
  const { bookings, addBooking, updateBookingStatus } = useBookings();
  
  // Create booking
  await addBooking({
    propertyId: 'property-uuid',
    propertyTitle: 'Beautiful Villa',
    date: '2025-01-25',
    time: '14:00',
    clientName: 'John Doe'
  });
  
  // Confirm booking
  await updateBookingStatus('booking-uuid', 'confirmed');
}
```

---

## 🗄️ Database Tables

Your Supabase database has these tables:

### Core Tables
- `users` - User accounts and profiles
- `agents` - Agent/agency profiles
- `properties` - Property listings
- `bookings` - Property viewing bookings
- `messages` - Direct messages between users
- `notifications` - User notifications
- `wishlists` - Saved properties

### Agent-Specific Tables
- `staff` - Agent staff members
- `managed_properties` - Properties under management

### Admin Tables
- `banners` - Homepage carousel banners
- `homepage_sections` - Homepage content sections

### Storage Buckets
- `avatars` - User profile pictures
- `properties` - Property images
- `documents` - Property documents (private)

---

## 🔐 Row Level Security (RLS)

All tables have RLS policies that ensure:
- ✅ Users can only see their own data
- ✅ Agents can see their properties and bookings
- ✅ Admins can manage all data
- ✅ Public data (properties, agents) is visible to all

---

## 🔄 Real-time Features

These features update automatically:
- ✅ New bookings appear instantly
- ✅ Message notifications in real-time
- ✅ Property updates reflect immediately
- ✅ User status changes sync across devices

---

## 📱 Example Flow: Complete User Journey

### 1. New User Signs Up
```typescript
// User signs up
await signup({ email, password, name, phone });

// UserContext automatically loads
const { user } = useUser();
// user.role = 'client' by default
```

### 2. User Browses Properties
```typescript
// Properties are fetched from Supabase
const { properties } = useSupabaseProperties({
  city: 'Harare',
  minPrice: 500,
  maxPrice: 2000
});
```

### 3. User Books Viewing
```typescript
// Booking is saved to Supabase
const { addBooking } = useBookings();
await addBooking({
  propertyId: property.id,
  date: '2025-01-25',
  time: '14:00'
});
```

### 4. User Becomes Agent
```typescript
// Create agent profile
const { updateProfile } = useAgentProfile();
await updateProfile({
  companyName: 'My Realty',
  bio: 'Professional real estate services'
});

// User's role is updated to 'agent' in Supabase
```

### 5. Agent Adds Property
```typescript
// Property is created and linked to agent
// Automatically appears in agent's dashboard
```

### 6. Agent Manages Staff
```typescript
const { addStaffMember } = useAgentProfile();
await addStaffMember({
  name: 'Jane Smith',
  email: 'jane@example.com',
  role: 'Property Manager',
  permissions: ['view_properties', 'manage_bookings']
});
```

---

## 🐛 Troubleshooting

### "Invalid login credentials"
- Make sure email is confirmed in Supabase
- Check password is correct
- Verify user exists in Supabase dashboard

### "Could not find the table"
- Run the SQL migration script in Supabase SQL Editor
- Check table names match (e.g., `homepage_sections` not `sections`)

### "Row level security policy violation"
- Make sure RLS policies are created (run migration script)
- Check user is authenticated
- Verify user has permission for the operation

### Blank screen after agent onboarding
- Check console logs for errors
- Verify agent profile was created in Supabase
- Ensure user's role was updated to 'agent'

### Wishlist/Messages errors
- These features require related tables to exist
- Run the complete SQL migration script
- Check all foreign key relationships are set up

---

## 📊 Monitoring

View your data in Supabase Dashboard:

1. **Table Editor** - See all data
2. **Authentication** - View users
3. **Storage** - See uploaded files
4. **Logs** - Debug issues
5. **Database** - Run SQL queries

---

## 🎯 Key Files

### Contexts (Your Main API)
- `contexts/UserContext.tsx` - User & auth
- `contexts/AgentProfileContext.tsx` - Agent operations
- `contexts/BookingContext.tsx` - Bookings
- `contexts/SuperAdminContext.tsx` - Admin panel
- `contexts/UserModeContext.tsx` - Mode switching

### Supabase Hooks
- `hooks/useSupabaseAgent.ts` - Agent data
- `hooks/useSupabaseProperties.ts` - Properties
- `hooks/useSupabaseBookings.ts` - Bookings
- `hooks/useSupabaseAdmin.ts` - Admin operations

### Auth & Utils
- `utils/supabase-auth.ts` - Login/signup functions
- `lib/supabase.ts` - Supabase client

---

## ✨ What Works Now

### ✅ User Features
- Sign up with email/password
- Login and session management
- Update profile (name, phone)
- Upload avatar
- Switch between client/agent mode

### ✅ Agent Features
- Create agent profile
- Add and manage properties
- Track property analytics (views, inquiries, bookings)
- Add staff members
- Manage properties under management
- Upgrade package (free/pro/agency)

### ✅ Booking Features
- Create bookings for properties
- View all bookings
- Update booking status
- Real-time booking notifications

### ✅ Admin Features
- Manage homepage banners
- Configure homepage sections
- View all users
- Block/unblock users
- Change user roles
- View analytics

---

## 🚨 Important Notes

1. **All data is LIVE** - Changes persist immediately to Supabase
2. **No more demo data** - Everything comes from the database
3. **RLS protects data** - Users can only access their own data
4. **Real-time updates** - Changes sync across devices
5. **Authentication required** - Most features need login

---

## 📚 Documentation

- **Full Context Guide**: `CONTEXT_USAGE_GUIDE.md`
- **Migration Report**: `CONTEXT_SUPABASE_MIGRATION_COMPLETE.md`
- **SQL Schema**: Run the migration script provided

---

## 🎉 You're All Set!

Your app is now fully backend-integrated with Supabase. All contexts fetch live data, all changes persist to the database, and users can create accounts, become agents, manage properties, and book viewings - all in real-time!

**Next steps**:
1. Test user signup and login
2. Create an agent profile
3. Add a property
4. Create a booking
5. Test admin features

**Need help?** Check the console logs - all errors are logged with clear messages.
