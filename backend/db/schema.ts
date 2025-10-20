import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  avatar: text("avatar"),
  role: text("role", { enum: ["client", "agent", "agency", "admin"] })
    .notNull()
    .default("client"),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  blocked: integer("blocked", { mode: "boolean" }).notNull().default(false),
  lastActive: integer("last_active", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const agentProfiles = sqliteTable("agent_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  package: text("package", { enum: ["free", "pro", "agency"] })
    .notNull()
    .default("free"),
  accountSetupComplete: integer("account_setup_complete", { mode: "boolean" })
    .notNull()
    .default(false),
  companyName: text("company_name"),
  companyLogo: text("company_logo"),
  banner: text("banner"),
  bio: text("bio"),
  specialties: text("specialties"),
  yearsExperience: integer("years_experience"),
  languages: text("languages"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  address: text("address"),
  socialMedia: text("social_media"),
  followers: integer("followers").notNull().default(0),
  following: integer("following").notNull().default(0),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const properties = sqliteTable("properties", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  priceType: text("price_type", { enum: ["monthly", "sale"] }).notNull(),
  location: text("location").notNull(),
  images: text("images").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  area: real("area").notNull(),
  propertyType: text("property_type"),
  listingCategory: text("listing_category", {
    enum: ["property", "stand", "room", "commercial"],
  })
    .notNull()
    .default("property"),
  status: text("status", {
    enum: ["For Rent", "For Sale", "Internal Management"],
  }).notNull(),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  amenities: text("amenities"),
  features: text("features"),
  tourLink: text("tour_link"),
  agentId: text("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  views: integer("views").notNull().default(0),
  bookings: integer("bookings").notNull().default(0),
  inquiries: integer("inquiries").notNull().default(0),
  lister: text("lister"),
  floors: integer("floors"),
  parkingSpaces: integer("parking_spaces"),
  titleDeeds: integer("title_deeds", { mode: "boolean" }),
  serviced: integer("serviced", { mode: "boolean" }),
  developerSession: text("developer_session"),
  furnished: integer("furnished", { mode: "boolean" }),
  yearBuilt: integer("year_built"),
  zoning: text("zoning"),
  flagged: integer("flagged", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const managedProperties = sqliteTable("managed_properties", {
  id: text("id").primaryKey(),
  agentId: text("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  type: text("type", { enum: ["Residential", "Commercial"] }).notNull(),
  status: text("status", {
    enum: ["Vacant", "Occupied", "Under Maintenance", "For Sale"],
  }).notNull(),
  notes: text("notes"),
  images: text("images").notNull(),
  tenant: text("tenant"),
  isListed: integer("is_listed", { mode: "boolean" }).notNull().default(false),
  listedPropertyId: text("listed_property_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const propertyDocuments = sqliteTable("property_documents", {
  id: text("id").primaryKey(),
  managedPropertyId: text("managed_property_id")
    .notNull()
    .references(() => managedProperties.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type", { enum: ["invoice", "inspection", "lease", "other"] })
    .notNull(),
  url: text("url").notNull(),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  clientId: text("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  agentId: text("agent_id")
    .notNull()
    .references(() => users.id),
  date: integer("date", { mode: "timestamp" }).notNull(),
  time: text("time").notNull(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").notNull(),
  notes: text("notes"),
  status: text("status", { enum: ["pending", "confirmed", "cancelled"] })
    .notNull()
    .default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const bookingSlots = sqliteTable("booking_slots", {
  id: text("id").primaryKey(),
  agentId: text("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: integer("date", { mode: "timestamp" }).notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  notes: text("notes"),
  booked: integer("booked", { mode: "boolean" }).notNull().default(false),
  bookedBy: text("booked_by"),
  clientId: text("client_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const staff = sqliteTable("staff", {
  id: text("id").primaryKey(),
  agentId: text("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  avatar: text("avatar"),
  role: text("role").notNull(),
  phone: text("phone"),
  permissions: text("permissions"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  inviteToken: text("invite_token"),
  inviteExpiry: integer("invite_expiry", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const agentUpdates = sqliteTable("agent_updates", {
  id: text("id").primaryKey(),
  agentId: text("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  images: text("images"),
  timestamp: integer("timestamp", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const profileCards = sqliteTable("profile_cards", {
  id: text("id").primaryKey(),
  agentId: text("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  image: text("image").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  ctaText: text("cta_text").notNull(),
  ctaLink: text("cta_link"),
  propertyId: text("property_id").references(() => properties.id),
  order: integer("order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id),
  receiverId: text("receiver_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  images: text("images"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  timestamp: integer("timestamp", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const wishlists = sqliteTable("wishlists", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type", {
    enum: ["booking", "message", "update", "system", "alert"],
  }).notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  data: text("data"),
  timestamp: integer("timestamp", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const propertyFlags = sqliteTable("property_flags", {
  id: text("id").primaryKey(),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  reportedBy: text("reported_by")
    .notNull()
    .references(() => users.id),
  reporterName: text("reporter_name").notNull(),
  reason: text("reason").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: ["pending", "resolved", "dismissed"] })
    .notNull()
    .default("pending"),
  resolvedBy: text("resolved_by"),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
  resolutionNotes: text("resolution_notes"),
  timestamp: integer("timestamp", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const userFlags = sqliteTable("user_flags", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  reportedBy: text("reported_by")
    .notNull()
    .references(() => users.id),
  reporterName: text("reporter_name").notNull(),
  reason: text("reason").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: ["pending", "resolved", "dismissed"] })
    .notNull()
    .default("pending"),
  resolvedBy: text("resolved_by"),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
  resolutionNotes: text("resolution_notes"),
  timestamp: integer("timestamp", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  adminId: text("admin_id")
    .notNull()
    .references(() => users.id),
  adminName: text("admin_name").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  details: text("details").notNull(),
  metadata: text("metadata"),
  timestamp: integer("timestamp", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const banners = sqliteTable("banners", {
  id: text("id").primaryKey(),
  image: text("image").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  ctaText: text("cta_text"),
  ctaLink: text("cta_link"),
  order: integer("order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const sections = sqliteTable("sections", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  properties: text("properties"),
  order: integer("order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
