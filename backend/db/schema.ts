import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  unique,
} from "drizzle-orm/sqlite-core";
const timestamp = (name: string) =>
  integer(name, { mode: "timestamp" }).default(sql`(unixepoch())`);

const createId = () => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  avatar: text("avatar"),
  role: text("role", {
    enum: ["client", "agent", "agency", "admin"],
  })
    .notNull()
    .default("client"),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  blocked: integer("blocked", { mode: "boolean" }).notNull().default(false),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    refreshToken: text("refresh_token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    refreshExpiresAt: timestamp("refresh_expires_at").notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => ({
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
  })
);

export const agents = sqliteTable(
  "agents",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    companyName: text("company_name"),
    bio: text("bio"),
    specialization: text("specialization"),
    licenseNumber: text("license_number"),
    yearsOfExperience: integer("years_of_experience"),
    packageLevel: text("package_level", {
      enum: ["free", "pro", "agency"],
    })
      .notNull()
      .default("free"),
    packageExpiry: timestamp("package_expiry"),
    areasServed: text("areas_served"),
    website: text("website"),
    facebook: text("facebook"),
    twitter: text("twitter"),
    instagram: text("instagram"),
    linkedin: text("linkedin"),
    rating: integer("rating").default(0),
    reviewCount: integer("review_count").default(0),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    userIdIdx: index("agents_user_id_idx").on(table.userId),
  })
);

export const properties = sqliteTable(
  "properties",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    propertyType: text("property_type").notNull(),
    listingCategory: text("listing_category", {
      enum: ["property", "stand", "room", "commercial"],
    })
      .notNull()
      .default("property"),
    status: text("status", {
      enum: ["For Rent", "For Sale", "Internal Management"],
    })
      .notNull()
      .default("For Rent"),
    price: integer("price").notNull(),
    priceType: text("price_type", { enum: ["monthly", "total"] })
      .notNull()
      .default("monthly"),
    images: text("images").notNull(),
    bedrooms: integer("bedrooms"),
    bathrooms: integer("bathrooms"),
    area: integer("area"),
    areaUnit: text("area_unit"),
    furnished: integer("furnished", { mode: "boolean" }),
    parking: integer("parking", { mode: "boolean" }),
    amenities: text("amenities"),
    address: text("address").notNull(),
    city: text("city").notNull(),
    state: text("state"),
    country: text("country").notNull(),
    zipCode: text("zip_code"),
    latitude: text("latitude"),
    longitude: text("longitude"),
    featured: integer("featured", { mode: "boolean" }).default(false),
    views: integer("views").default(0),
    inquiries: integer("inquiries").default(0),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    agentIdIdx: index("properties_agent_id_idx").on(table.agentId),
    userIdIdx: index("properties_user_id_idx").on(table.userId),
    cityIdx: index("properties_city_idx").on(table.city),
    statusIdx: index("properties_status_idx").on(table.status),
  })
);

export const bookings = sqliteTable(
  "bookings",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    propertyId: text("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    propertyTitle: text("property_title"),
    date: text("date").notNull(),
    time: text("time").notNull(),
    clientName: text("client_name").notNull(),
    clientEmail: text("client_email").notNull(),
    clientPhone: text("client_phone").notNull(),
    notes: text("notes"),
    status: text("status", {
      enum: ["pending", "confirmed", "cancelled"],
    })
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => ({
    propertyIdIdx: index("bookings_property_id_idx").on(table.propertyId),
    userIdIdx: index("bookings_user_id_idx").on(table.userId),
    statusIdx: index("bookings_status_idx").on(table.status),
  })
);

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    receiverId: text("receiver_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    read: integer("read", { mode: "boolean" }).notNull().default(false),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => ({
    senderIdIdx: index("messages_sender_id_idx").on(table.senderId),
    receiverIdIdx: index("messages_receiver_id_idx").on(table.receiverId),
    conversationIdx: index("messages_conversation_idx").on(
      table.senderId,
      table.receiverId
    ),
  })
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    data: text("data"),
    read: integer("read", { mode: "boolean" }).notNull().default(false),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => ({
    userIdIdx: index("notifications_user_id_idx").on(table.userId),
    readIdx: index("notifications_read_idx").on(table.read),
  })
);

export const wishlists = sqliteTable(
  "wishlists",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    propertyId: text("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => ({
    userPropertyUnique: unique("user_property_unique").on(
      table.userId,
      table.propertyId
    ),
    userIdIdx: index("wishlists_user_id_idx").on(table.userId),
    propertyIdIdx: index("wishlists_property_id_idx").on(table.propertyId),
  })
);

export const banners = sqliteTable("banners", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  imageUrl: text("image_url").notNull(),
  title: text("title").notNull(),
  link: text("link").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const homepageSections = sqliteTable("homepage_sections", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  type: text("type", {
    enum: ["featured_properties", "browse_properties", "featured_agencies", "custom"],
  }).notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  icon: text("icon"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  order: integer("order").notNull().default(0),
  config: text("config").notNull(),
  analytics: text("analytics"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const staff = sqliteTable(
  "staff",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    role: text("role").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    permissions: text("permissions").notNull(),
    active: integer("active", { mode: "boolean" }).notNull().default(false),
    inviteToken: text("invite_token"),
    inviteExpiry: timestamp("invite_expiry"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    agentIdIdx: index("staff_agent_id_idx").on(table.agentId),
  })
);

export const managedProperties = sqliteTable(
  "managed_properties",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    address: text("address").notNull(),
    type: text("type", { enum: ["Residential", "Commercial"] })
      .notNull()
      .default("Residential"),
    status: text("status", {
      enum: ["Vacant", "Occupied", "Under Maintenance", "For Sale"],
    })
      .notNull()
      .default("Vacant"),
    notes: text("notes"),
    images: text("images"),
    documents: text("documents"),
    tenantName: text("tenant_name"),
    tenantPhone: text("tenant_phone"),
    tenantEmail: text("tenant_email"),
    tenantMoveInDate: timestamp("tenant_move_in_date"),
    isListed: integer("is_listed", { mode: "boolean" }).notNull().default(false),
    listedPropertyId: text("listed_property_id").references(() => properties.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    agentIdIdx: index("managed_properties_agent_id_idx").on(table.agentId),
  })
);
