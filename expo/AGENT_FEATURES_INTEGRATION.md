# Agent Features Backend Integration

## Overview
This document outlines the backend integration completed for Agent Features including Staff Management and Property Management.

## Completed Work

### 1. Database Schema Updates ✅
**File:** `backend/db/schema.ts`

Added two new tables:
- **staff** - For managing team members under agencies
  - Fields: agentId, name, role, email, phone, permissions, active, inviteToken, inviteExpiry
- **managedProperties** - For managing properties under agent supervision
  - Fields: agentId, name, address, type, status, notes, images, documents, tenant info, listing status

### 2. Backend Endpoints Created ✅

#### Staff Management
- `trpc.staff.add` - Add new staff member with invite token
- `trpc.staff.list` - List all staff members for the logged-in agent
- `trpc.staff.update` - Update staff member details
- `trpc.staff.remove` - Remove a staff member

#### Managed Properties
- `trpc.managedProperties.add` - Add a new managed property
- `trpc.managedProperties.list` - List all managed properties for the agent
- `trpc.managedProperties.update` - Update property details
- `trpc.managedProperties.delete` - Delete a managed property

#### Agent Analytics
- `trpc.agents.getAnalytics` - Get analytics for agent (views, inquiries, bookings)

### 3. Frontend Integration Completed ✅

#### Staff Management Screen (`app/agent/staff.tsx`)
- Replaced AsyncStorage with tRPC queries
- Uses `trpc.staff.list.useQuery()` to fetch staff
- Uses mutations for add/update/remove operations
- Real-time refetch after mutations
- Error handling with user feedback

## Next Steps (To Complete)

### 1. Property Management Screen Integration
**Files to update:**
- `app/agent/property-management.tsx`
- `app/agent/add-managed-property.tsx`

**Changes needed:**
- Replace `useAgentProfile()` context with tRPC calls
- Use `trpc.managedProperties.list.useQuery()`
- Use mutations for CRUD operations
- Update managed property forms to use backend

### 2. Agent Dashboard Integration  
**File:** `app/agent/dashboard.tsx`

**Changes needed:**
- Replace `useAgentProfile()` analytics with `trpc.agents.getAnalytics.useQuery()`
- Fetch properties from `trpc.properties.list.useQuery()` filtered by agent
- Update property drafts section to use real properties

###3. Database Migration
**Important:** Run the database migration to create new tables:
```bash
cd backend
bun run db:migrate
```

## Usage Example

### Staff Management
```typescript
// List staff
const staffQuery = trpc.staff.list.useQuery();

// Add staff member
const addMutation = trpc.staff.add.useMutation();
await addMutation.mutateAsync({
  name: "John Doe",
  role: "Agent",
  email: "john@example.com",
  phone: "+1234567890",
  permissions: ["manage_properties", "view_analytics"],
  inviteToken: "generated_token",
  inviteExpiry: new Date()
});

// Update staff
const updateMutation = trpc.staff.update.useMutation();
await updateMutation.mutateAsync({
  staffId: "staff_id",
  name: "Updated Name",
  permissions: ["manage_bookings"]
});
```

### Managed Properties
```typescript
// List properties
const propertiesQuery = trpc.managedProperties.list.useQuery();

// Add property
const addMutation = trpc.managedProperties.add.useMutation();
await addMutation.mutateAsync({
  name: "Sunset Villa",
  address: "123 Main St",
  type: "Residential",
  status: "Vacant",
  notes: "Beautiful property",
  images: ["url1", "url2"]
});
```

## Testing
1. Ensure database is migrated
2. Login as an agent user
3. Navigate to Staff Management screen
4. Test adding, editing, and removing staff members
5. Verify data persistence across app restarts

## Notes
- All endpoints require authentication (use protectedProcedure)
- Staff and managed properties are scoped to the logged-in agent
- Images and documents are stored as JSON arrays in the database
- Permissions are stored as JSON array for flexibility
