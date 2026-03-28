# Complete Setup and Fix Guide

## ⚠️ Important - Read This First!

This guide will help you fix all authentication, database, and flow issues in the app.

---

## 🔧 Step 1: Reset Supabase Database

1. Open your Supabase project at [https://supabase.com](https://supabase.com)
2. Go to **SQL Editor**
3. Open the file `SUPABASE_COMPLETE_SCHEMA_FIX.sql` in this repository
4. **Copy the ENTIRE contents** of that file
5. Paste it into the SQL Editor in Supabase
6. Click **Run** (F5 or the Run button)

This will:
- Drop all existing tables safely
- Create correct tables with proper relationships
- Add proper indexes and foreign keys
- Set up Row Level Security (RLS) policies
- Create storage buckets for avatars and property images
- Add database triggers for automatic timestamps

---

## 🧪 Step 2: Test Database Setup

After running the SQL, verify it worked:

```sql
-- Run this in Supabase SQL Editor to check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see these tables:
- users
- agents
- properties
- bookings
- messages
- notifications
- wishlists
- banners
- homepage_sections
- staff
- managed_properties

---

## 🔐 Step 3: Create Your First User

### Option A: Through the App (Recommended)

1. Stop your development server if running
2. Start your app: `npm start` or `bun start`
3. Click on "Sign Up" button
4. Fill in:
   - Name: Your Name
   - Email: your-email@example.com
   - Phone: (optional)
   - Password: minimum 6 characters
   - Confirm Password
   - Check "I agree to Terms"
5. Click "Sign Up"

**What happens:**
- User is created in Supabase Auth
- A trigger automatically creates a profile in the `users` table
- User is logged in and redirected to the home page
- Role is set to 'client' by default

### Option B: Through Supabase Dashboard

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click "Add User"
3. Enter email and password
4. **IMPORTANT:** The user profile will be auto-created via database trigger

---

## 👤 Step 4: Upgrade to Agent/Admin (If Needed)

### To Become an Agent:

**Method 1: Through the App (Recommended)**
1. Log in as a client user
2. Go to Account tab (bottom navigation)
3. Look for "Become an Agent" option  
4. Click and follow onboarding steps
5. Complete the agent profile setup

**Method 2: Via SQL**
```sql
-- Update user role to agent
UPDATE users 
SET role = 'agent' 
WHERE email = 'your-email@example.com';

-- Create agent profile
INSERT INTO agents (user_id, company_name, package_level)
SELECT id, 'My Real Estate', 'free'
FROM users 
WHERE email = 'your-email@example.com';
```

### To Become an Admin:

```sql
-- Only via SQL - Update user role to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

Then login, go to login screen, and click "Admin Login" toggle (web only) or the app will automatically redirect admins to admin dashboard.

---

## 🏠 Step 5: Add Test Properties (Optional)

```sql
-- First, get your agent ID
SELECT id, user_id FROM agents WHERE user_id = (
  SELECT id FROM users WHERE email = 'your-email@example.com'
);

-- Then insert a test property (replace agent_id and user_id with yours)
INSERT INTO properties (
  agent_id, 
  user_id, 
  title, 
  description, 
  property_type, 
  listing_category, 
  status, 
  price, 
  price_type,
  images, 
  beds, 
  baths, 
  area, 
  address, 
  city, 
  country
) VALUES (
  'YOUR-AGENT-ID-HERE',
  'YOUR-USER-ID-HERE',
  '3 Bedroom House in Borrowdale',
  'Beautiful modern house with garden and pool',
  'House',
  'property',
  'For Rent',
  1500,
  'monthly',
  '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"]'::jsonb,
  3,
  2,
  250,
  '123 Borrowdale Road',
  'Harare',
  'Zimbabwe'
);
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Invalid login credentials"
**Solution:** 
- Make sure you signed up first
- Check email and password are correct
- Try "Forgot Password" if needed
- Check Supabase Auth dashboard to see if user exists

### Issue 2: "Not authenticated" errors
**Solution:**
```javascript
// Clear AsyncStorage cache and re-login
// Run this in your app console or add a logout button:
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
// Then login again
```

### Issue 3: "Cannot create agent profile"
**Solution:**
- Make sure you're logged in
- Check if user role is 'agent' in the database:
```sql
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';
```
- If role is 'client', update it manually or go through onboarding

### Issue 4: "Could not find relationship" errors
**Solution:** 
- Re-run the `SUPABASE_COMPLETE_SCHEMA_FIX.sql` file
- This happens when foreign keys are missing

### Issue 5: Blank/Black pages after signup or login
**Solution:**
- Check browser console (F12) for errors
- Check `useUser` context is loading:
```javascript
const { user, isLoading, error } = useUser();
console.log({ user, isLoading, error });
```
- If `isLoading` is stuck on true, there's an async issue - refresh the page

### Issue 6: "Column does not exist" errors
**Solution:**
- The database schema doesn't match the code
- Re-run `SUPABASE_COMPLETE_SCHEMA_FIX.sql`
- Check column names match in both schema and queries

---

## 📱 App Flow Guide

### Client Flow:
1. **Signup** → Home screen with properties
2. **Browse Properties** → Click to view details
3. **Save to Wishlist** → View saved items in Wishlist tab
4. **Book Viewing** → Select date/time, submit booking
5. **Messages** → Chat with agents about properties
6. **Account** → Update profile, view bookings

### Agent Flow:
1. **Signup** → Complete agent onboarding
2. **Agent Dashboard** → View analytics, bookings, properties
3. **Add Property** → Fill form, upload images, publish
4. **Manage Bookings** → Confirm/cancel bookings
5. **Messages** → Respond to client inquiries
6. **Edit Profile** → Update company info, social media

### Admin Flow:
1. **Login as Admin** → Admin Dashboard
2. **User Management** → View/edit users, change roles, block users
3. **Banner Management** → Add/edit homepage banners
4. **Section Management** → Configure homepage sections
5. **Analytics** → View platform statistics

---

## 🧪 Testing Checklist

After setup, test these flows:

- [ ] Sign up a new user
- [ ] Log in with that user
- [ ] View user profile in Account tab
- [ ] Update profile name/phone
- [ ] Browse properties on home screen
- [ ] View property details
- [ ] Add property to wishlist
- [ ] Remove from wishlist
- [ ] Become an agent (onboarding flow)
- [ ] Add a property as agent
- [ ] Create a booking
- [ ] Log in as admin
- [ ] View admin dashboard
- [ ] Edit a user's role
- [ ] Add a homepage banner

---

## 🔐 Environment Variables

Your `.env` file should have:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key-here
```

Get these from: Supabase Dashboard → Settings → API

---

## 🚀 Starting the App

```bash
# Install dependencies
npm install
# or
bun install

# Start development server
npm start
# or
bun start

# For web
npm run web
# or
bun web

# For iOS (Mac only)
npm run ios

# For Android
npm run android
```

---

## 📊 Database Schema Overview

### Key Tables:

**users** - All app users (clients, agents, admins)
- id (uuid, primary key)
- email, name, phone, avatar
- role (client | agent | agency | admin)
- verified, blocked

**agents** - Agent profiles (extends users)
- user_id → users(id)
- company_name, bio, specialization
- package_level (free | pro | agency)
- social media links

**properties** - Property listings
- agent_id → agents(id)
- user_id → users(id)
- title, description, price, images
- beds, baths, area
- city, address, coordinates

**bookings** - Viewing bookings
- property_id → properties(id)
- user_id → users(id)
- agent_id → agents(id)
- date, time, status

**wishlists** - Saved properties
- user_id → users(id)
- property_id → properties(id)

### Relationships:

```
users (1) -----> (*) bookings
users (1) -----> (1) agents
users (1) -----> (*) wishlists
agents (1) -----> (*) properties
properties (1) -----> (*) bookings
properties (1) -----> (*) wishlists
```

---

## 🎨 Key Context Providers

All contexts are now fully integrated with Supabase:

1. **UserContext** - User authentication & profile
   - `user` - Current user object
   - `isLoading` - Loading state
   - `isAuthenticated` - Boolean
   - `updateProfile()` - Update user info
   - `uploadAvatar()` - Upload profile pic
   - `refetch()` - Reload user data

2. **AgentContext** - Agent profile & operations
   - `profile` - Agent profile data
   - `createProfile()` - Become an agent
   - `updateProfile()` - Update agent info
   - `upgradePackage()` - Change subscription
   - `completeOnboarding()` - Finish setup

3. **UserModeContext** - Client/Agent mode toggle
   - `mode` - 'client' or 'agent'
   - `switchMode()` - Toggle between modes
   - Syncs with user role

4. **SuperAdminContext** - Admin operations
   - `users` - All users
   - `banners` - Homepage banners
   - `sections` - Homepage sections
   - `analytics` - Platform stats
   - CRUD operations for all

5. **BookingContext** - Booking management
   - `bookings` - User's bookings
   - `createBooking()` - Book a viewing
   - `updateStatus()` - Confirm/cancel

---

## 🆘 Still Having Issues?

1. **Clear everything and start fresh:**
```bash
# Stop the server
# Clear AsyncStorage (run in app):
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();

# Clear Metro cache:
npm start -- --reset-cache

# Re-run database setup SQL
```

2. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs
   - Look for errors in real-time

3. **Check browser/app console:**
   - Look for red error messages
   - Note the exact error text
   - Check which file/line is causing it

4. **Verify RLS policies:**
```sql
-- Check if policies are active
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## ✅ Success Indicators

You'll know everything is working when:

- ✅ You can sign up a new user without errors
- ✅ User is automatically logged in after signup
- ✅ Profile data appears in Account tab
- ✅ You can become an agent and see agent dashboard
- ✅ Properties load on home screen
- ✅ Wishlist shows saved properties (or "empty" state)
- ✅ Bookings can be created and appear in list
- ✅ Admin dashboard shows real user counts
- ✅ No "[object Object]" errors in console
- ✅ No infinite loading spinners

---

## 📝 Summary of Changes Made

### 1. Database Schema (`SUPABASE_COMPLETE_SCHEMA_FIX.sql`)
- Fixed all table relationships
- Added missing foreign keys
- Fixed column name mismatches (beds/baths vs bedrooms/bathrooms)
- Added proper RLS policies
- Set up auto-triggers for timestamps and user creation

### 2. Context Updates
- **UserContext**: Added proper error handling, loading states
- **AgentContext**: Fixed agent creation, role updates, error handling
- **UserModeContext**: Syncs with backend user role
- **SuperAdminContext**: Removed mock data, uses real Supabase queries

### 3. Page Fixes
- **Wishlist**: Removed mock agencies, shows only real saved properties
- **Agent Onboarding**: Properly creates agent profile and updates role
- **Login/Signup**: Better error messages, proper redirects

### 4. Auth Flow
- Signup automatically creates user profile via trigger
- Login checks for blocked users
- Session persists across app restarts
- Proper logout clears all cached data

---

## 🎯 Next Steps After Setup

1. **Add Real Properties** - Use the agent dashboard to add listings
2. **Customize Banners** - Admin panel → Banners → Add promotional images
3. **Configure Homepage** - Admin panel → Sections → Customize layout
4. **Test All Flows** - Go through client, agent, and admin flows
5. **Deploy** - When ready, build and deploy your app

---

## 🤝 Need More Help?

If you're still stuck:
1. Check the error message carefully
2. Look at the browser console (F12)
3. Check Supabase Dashboard → Logs for database errors
4. Verify your environment variables are correct
5. Make sure you ran the full SQL schema file

**Common mistake:** Running partial SQL queries instead of the complete schema file. Always run the ENTIRE `SUPABASE_COMPLETE_SCHEMA_FIX.sql` file.

---

Good luck! 🚀
