# Context Providers Usage Guide

Quick reference for using all Supabase-connected context providers in your app.

---

## 🔐 Authentication & User

### UserContext
Manages user authentication and profile data.

```typescript
import { useUser } from '@/contexts/UserContext';

function MyComponent() {
  const {
    user,              // Current user profile
    isLoading,         // Loading state
    isAuthenticated,   // Boolean - is user logged in
    isClient,          // Boolean - user role is 'client'
    isAgent,           // Boolean - user role is 'agent', 'agency', or 'admin'
    isAdmin,           // Boolean - user role is 'admin'
    updateProfile,     // Update user profile
    uploadAvatar,      // Upload avatar image
    refetch            // Refresh user data
  } = useUser();

  // Update profile
  await updateProfile({ name: 'John Doe', phone: '+1234567890' });

  // Upload avatar
  const avatarUrl = await uploadAvatar(base64Image);

  // Force refresh from backend
  refetch(true);
}
```

**User Object**:
```typescript
{
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'client' | 'agent' | 'agency' | 'admin';
  verified: boolean;
  blocked: boolean;
  createdAt: Date;
  lastActive: Date;
}
```

---

## 🎭 User Mode

### UserModeContext
Manages switching between client and agent modes.

```typescript
import { useUserMode } from '@/contexts/UserModeContext';
import { useUser } from '@/contexts/UserContext';

function ModeSwitcher() {
  const { isAgent } = useUser();
  const {
    mode,              // 'client' | 'agent'
    isClient,          // Boolean
    isAgent: isAgentMode, // Boolean
    switchMode,        // Switch mode function
    isLoading
  } = useUserMode();

  // Only agents can switch to agent mode
  if (isAgent) {
    await switchMode('agent');
  }

  return (
    <View>
      <Text>Current mode: {mode}</Text>
    </View>
  );
}
```

---

## 🏢 Agent Profile

### AgentProfileContext
Manages agent profile, properties, staff, and analytics.

```typescript
import { useAgentProfile } from '@/contexts/AgentProfileContext';

function AgentDashboard() {
  const {
    profile,                  // Agent profile data
    managedProperties,        // Managed properties array
    propertyDrafts,           // Property drafts (placeholder)
    isLoading,
    
    // Profile operations
    updateProfile,
    upgradePackage,
    completeOnboarding,
    
    // Managed properties
    addManagedProperty,
    updateManagedProperty,
    deleteManagedProperty,
    listManagedProperty,
    
    // Staff management
    addStaffMember,
    updateStaffMember,
    removeStaffMember,
    
    // Feature checking
    hasFeature
  } = useAgentProfile();

  // Update agent profile
  await updateProfile({
    companyName: 'Elite Realty',
    bio: 'Top-rated agency',
    specialties: ['Luxury Homes'],
    yearsExperience: 10,
    website: 'https://example.com',
    socialMedia: {
      facebook: 'https://facebook.com/...',
      instagram: 'https://instagram.com/...'
    }
  });

  // Upgrade package
  await upgradePackage('pro'); // 'free' | 'pro' | 'agency'

  // Add managed property
  await addManagedProperty({
    name: 'Sunset Villa',
    address: '123 Main St',
    type: 'Residential',
    status: 'Occupied',
    images: ['url1', 'url2'],
    documents: [],
    tenant: {
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      moveInDate: new Date()
    }
  });

  // Add staff member
  await addStaffMember({
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Property Manager',
    phone: '+1234567890',
    permissions: ['view_properties', 'manage_bookings'],
    active: true
  });

  // Check if feature is available
  if (hasFeature('staff_accounts')) {
    // Show staff management UI
  }
}
```

**Profile Object**:
```typescript
{
  id: string;
  userId: string;
  package: 'free' | 'pro' | 'agency';
  accountSetupComplete: boolean;
  companyName?: string;
  bio?: string;
  specialties: string[];
  yearsExperience?: number;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  staff: StaffMember[];
  analytics: {
    views: { total: number; thisMonth: number; trend: number };
    inquiries: { total: number; thisMonth: number; trend: number };
    bookings: { total: number; thisMonth: number; trend: number };
    propertyViews: { propertyId: string; views: number }[];
  };
  verified: boolean;
}
```

**Package Features**:
- **Free**: basic_listing, profile_edit, banner_upload, updates, basic_analytics
- **Pro**: + booking_calendar, messaging, verified_badge, full_analytics
- **Agency**: + staff_accounts, shared_dashboard, portfolio_page, 3d_tours, property_management

---

## 📅 Bookings

### BookingContext
Manages property viewing bookings.

```typescript
import { useBookings } from '@/contexts/BookingContext';

function BookingsList() {
  const {
    bookings,              // Array of bookings
    isLoading,
    addBooking,            // Create new booking
    updateBookingStatus,   // Update booking status
    getBookingById,        // Get single booking
    getBookingsByProperty, // Get bookings for property
    loadBookings           // Refresh bookings
  } = useBookings();

  // Create booking
  await addBooking({
    propertyId: 'property-uuid',
    propertyTitle: 'Beautiful Villa',
    propertyImage: 'https://...',
    date: '2025-01-25',
    time: '14:00',
    clientName: 'John Doe'
  });

  // Update booking status
  await updateBookingStatus('booking-uuid', 'confirmed');
  // Status: 'pending' | 'confirmed' | 'cancelled'

  // Get specific booking
  const booking = getBookingById('booking-uuid');

  // Get all bookings for a property
  const propertyBookings = getBookingsByProperty('property-uuid');

  return (
    <ScrollView>
      {bookings.map(booking => (
        <View key={booking.id}>
          <Text>{booking.propertyTitle}</Text>
          <Text>{booking.date} at {booking.time}</Text>
          <Text>Status: {booking.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
```

**Booking Object**:
```typescript
{
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  date: string;
  time: string;
  clientName: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}
```

---

## 👑 Super Admin

### SuperAdminContext
Manages admin operations (banners, sections, users).

```typescript
import { useSuperAdmin } from '@/contexts/SuperAdminContext';

function AdminDashboard() {
  const {
    isSuperAdmin,
    isLoading,
    
    // Banners
    banners,
    addBanner,
    updateBanner,
    deleteBanner,
    reorderBanners,
    
    // Homepage sections
    sections,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
    
    // User management
    users,
    updateUser,
    blockUser,
    unblockUser,
    upgradeUserTier,
    
    // Analytics
    analytics
  } = useSuperAdmin();

  // Add banner
  await addBanner({
    imageUrl: 'https://...',
    title: 'Summer Sale',
    link: '/properties/sale',
    enabled: true,
    order: 1
  });

  // Add homepage section
  await addSection({
    type: 'featured_properties',
    title: 'Featured Properties',
    enabled: true,
    order: 1,
    config: {
      filterType: 'featured',
      limit: 10,
      layoutType: 'carousel'
    }
  });

  // Block user
  await blockUser('user-uuid');

  // Unblock user
  await unblockUser('user-uuid');

  // View analytics
  console.log(analytics);
  // {
  //   totalUsers: number,
  //   totalAgents: number,
  //   totalAgencies: number,
  //   totalProperties: number,
  //   totalBookings: number,
  //   blockedUsers: number
  // }
}
```

---

## 🔄 Real-time Updates

All contexts support real-time updates:

```typescript
// Bookings auto-update via Supabase realtime
const { bookings } = useBookings();
// bookings array updates automatically when changes occur

// Manual refresh if needed
const { refetch } = useUser();
await refetch(true); // Skip cache
```

---

## 🎨 UI Integration Examples

### Show loading states
```typescript
const { user, isLoading } = useUser();

if (isLoading) {
  return <ActivityIndicator />;
}

return <Text>Welcome, {user?.name}!</Text>;
```

### Conditional rendering based on role
```typescript
const { isAgent, isAdmin } = useUser();

{isAgent && <AgentDashboard />}
{isAdmin && <AdminPanel />}
{!isAgent && !isAdmin && <ClientView />}
```

### Mode-based navigation
```typescript
const { mode } = useUserMode();

<Tabs>
  <Tabs.Screen name="home" />
  {mode === 'agent' && <Tabs.Screen name="dashboard" />}
</Tabs>
```

### Feature-gated UI
```typescript
const { hasFeature } = useAgentProfile();

{hasFeature('staff_accounts') && (
  <Button onPress={addStaff}>Add Staff</Button>
)}

{!hasFeature('property_management') && (
  <UpgradePrompt feature="property_management" />
)}
```

---

## ⚠️ Error Handling

All context operations handle errors gracefully:

```typescript
try {
  await updateProfile({ name: 'New Name' });
} catch (error) {
  console.error('Update failed:', error);
  Alert.alert('Error', 'Failed to update profile');
}
```

---

## 📝 Best Practices

1. **Always check loading states** before rendering data
2. **Use destructuring** to get only what you need
3. **Check user role** before showing agent/admin features
4. **Validate feature availability** with `hasFeature()`
5. **Handle errors** in try-catch blocks
6. **Use refetch** sparingly - data updates automatically

---

## 🚀 Quick Start Example

Complete example using multiple contexts:

```typescript
import { useUser } from '@/contexts/UserContext';
import { useUserMode } from '@/contexts/UserModeContext';
import { useAgentProfile } from '@/contexts/AgentProfileContext';
import { useBookings } from '@/contexts/BookingContext';

export default function DashboardScreen() {
  const { user, isLoading: userLoading } = useUser();
  const { mode, switchMode } = useUserMode();
  const { profile, managedProperties } = useAgentProfile();
  const { bookings } = useBookings();

  if (userLoading) {
    return <ActivityIndicator />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <ScrollView>
      <Text>Welcome, {user.name}!</Text>
      <Text>Mode: {mode}</Text>
      
      {mode === 'agent' && (
        <View>
          <Text>Your Properties: {managedProperties.length}</Text>
          <Text>Bookings: {bookings.length}</Text>
          <Text>Package: {profile.package}</Text>
        </View>
      )}
      
      <Button onPress={() => switchMode(mode === 'client' ? 'agent' : 'client')}>
        Switch Mode
      </Button>
    </ScrollView>
  );
}
```

---

**Everything is now connected to live Supabase data!** 🎉
