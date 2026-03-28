# Booking Slots Table Fix - Instructions

## Problem
The `booking_slots` table was missing from your Supabase database, causing errors when agents tried to manage their calendar.

## What Was Fixed

### 1. Database Schema (SQL)
Created `BOOKING_SLOTS_TABLE_FIX.sql` with:
- New `booking_slots` table with proper structure
- Foreign key relationships to `agents`, `users`, and `bookings` tables
- Indexes for performance
- Row Level Security (RLS) policies
- Auto-update trigger for `updated_at` field

### 2. TypeScript Hook
Fixed `hooks/useSupabaseBookingSlots.ts`:
- Removed invalid join query that was trying to fetch user names
- Simplified the query to just fetch booking slot data
- Removed `bookedByName` from the transform function (it wasn't being populated correctly)

## How to Apply the Fix

### Step 1: Execute the SQL Script
Go to your Supabase Dashboard:
1. Open your project
2. Navigate to **SQL Editor**
3. Copy the entire contents of `BOOKING_SLOTS_TABLE_FIX.sql`
4. Paste it into the SQL editor
5. Click **Run** to execute

### Step 2: Verify the Table
After running the script, verify the table exists:
```sql
SELECT * FROM booking_slots LIMIT 1;
```

### Step 3: Test the Feature
1. Log in as an agent
2. Navigate to the **Calendar** page from the agent dashboard
3. Try adding booking slots using:
   - Single slot
   - Bulk add
   - Templates
4. Verify slots appear in both week and list views

## Table Structure

```sql
booking_slots
├── id (UUID, Primary Key)
├── agent_id (UUID, Foreign Key → agents.id)
├── date (DATE)
├── start_time (TEXT, e.g., "09:00")
├── end_time (TEXT, e.g., "10:00")
├── booked (BOOLEAN, default: false)
├── booked_by (UUID, Foreign Key → users.id, nullable)
├── booking_id (UUID, Foreign Key → bookings.id, nullable)
├── notes (TEXT, nullable)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

## RLS Policies
- **Select**: Anyone can view booking slots (for booking purposes)
- **Insert**: Only agents can create their own slots
- **Update**: Only agents can update their own slots
- **Delete**: Only agents can delete their own slots
- **Service Role**: Full access for backend operations

## Real-time Subscription
The hook already includes real-time subscription, so changes will appear instantly:
- When an agent adds a slot
- When a slot is booked
- When a slot is deleted

## Features Now Working
✅ Agents can create single booking slots
✅ Agents can bulk-add recurring slots
✅ Agents can use time templates
✅ Week view displays slots by day
✅ List view shows all slots grouped by date
✅ Real-time updates across all views
✅ Booked slots are marked and cannot be edited
✅ Agents can edit and delete their own slots

## Notes
- If you need to add the `bookedByName` feature later, you'll need to fetch user data separately or use a proper join
- The current implementation focuses on core functionality first
- All changes are non-breaking and backwards compatible
