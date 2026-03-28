# Database Setup Guide

## 1. Database Configuration ✅

The database has been set up using:
- **SQLite** - Lightweight, serverless database perfect for development
- **Drizzle ORM** - Type-safe database toolkit
- **Better-SQLite3** - Synchronous SQLite driver

## 2. Database Schema

All entities have been mapped to database tables:

### Core Tables
- **users** - All user accounts (clients, agents, agencies, admins)
- **agent_profiles** - Extended agent information
- **properties** - All property listings
- **managed_properties** - Properties under agent management
- **property_documents** - Documents attached to managed properties

### Booking & Calendar
- **bookings** - Property viewing bookings
- **booking_slots** - Agent availability slots

### Social & Engagement
- **wishlists** - User saved properties
- **messages** - Direct messaging between users
- **notifications** - User notifications
- **agent_updates** - Agent timeline posts
- **profile_cards** - Agent profile showcase cards

### Staff & Team
- **staff** - Agent team members

### Admin & Moderation
- **property_flags** - Flagged properties
- **user_flags** - Flagged users
- **audit_logs** - Admin action logs
- **banners** - Homepage banners
- **sections** - Homepage sections

### Authentication
- **sessions** - User session tokens

## 3. Setup Instructions

### Step 1: Generate Database Migrations
```bash
bun run db:generate
```
This creates migration files from your schema.

### Step 2: Push Schema to Database
```bash
bun run db:push
```
This creates all tables in the database.

### Step 3: Seed Initial Data
```bash
bun run db:seed
```
This populates the database with demo data.

## 4. Demo Credentials

After seeding, you can log in with:

**Admin Account:**
- Email: `admin@nextmove.com`
- Password: `admin123`

**Agent Account:**
- Email: `agent@demo.com`
- Password: `agent123`

**Client Account:**
- Email: `client@demo.com`
- Password: `client123`

## 5. Database Tools

### View Database
```bash
bun run db:studio
```
Opens Drizzle Studio - a visual database browser at http://localhost:4983

### Database Location
The SQLite database file is located at:
```
backend/db/app.db
```

## 6. Schema Features

### Type Safety
All database operations are fully typed with TypeScript.

### Relationships
- Foreign keys with cascade deletes
- Proper indexing on referenced columns

### JSON Fields
Complex objects are stored as JSON strings:
- Location data
- Images arrays
- Social media links
- Metadata

### Timestamps
All tables include:
- `createdAt` - Record creation time
- `updatedAt` - Last modification time

## 7. Migration Management

### Create New Migration
After modifying `backend/db/schema.ts`:
```bash
bun run db:generate
```

### Apply Migrations
```bash
bun run db:migrate
```

## 8. Next Steps

Now that the database is set up, proceed to:
1. ✅ Database Setup (COMPLETED)
2. Authentication & Sessions
3. tRPC Procedures
4. Frontend Integration

## 9. Environment Variables

The database works out of the box with no configuration needed. For production, you might want to:

1. Change the database path in `drizzle.config.ts`
2. Use PostgreSQL or MySQL instead of SQLite
3. Add connection pooling
4. Set up backups

## 10. Important Notes

- The database file (`app.db`) is created automatically on first push
- Migrations are stored in `backend/db/migrations/`
- Always run migrations before seeding
- The seed script can be run multiple times (but will create duplicates)
