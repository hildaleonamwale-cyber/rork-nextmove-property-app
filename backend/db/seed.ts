import { db } from "./index";
import * as schema from "./schema";
import { randomUUID } from "crypto";

const hashPassword = (password: string): string => {
  return Buffer.from(password).toString("base64");
};

export async function seed() {
  console.log("🌱 Starting database seed...");

  const adminId = randomUUID();
  const agentId = randomUUID();
  const clientId = randomUUID();
  const agent2Id = randomUUID();

  await db.insert(schema.users).values([
    {
      id: adminId,
      email: "admin@nextmove.com",
      password: hashPassword("admin123"),
      name: "Super Admin",
      phone: "+1234567890",
      avatar: "https://i.pravatar.cc/150?img=1",
      role: "admin",
      verified: true,
      blocked: false,
    },
    {
      id: agentId,
      email: "agent@demo.com",
      password: hashPassword("agent123"),
      name: "John Smith",
      phone: "+1234567891",
      avatar: "https://i.pravatar.cc/150?img=12",
      role: "agent",
      verified: true,
      blocked: false,
    },
    {
      id: agent2Id,
      email: "sarah@premier.com",
      password: hashPassword("agent123"),
      name: "Sarah Williams",
      phone: "+1234567892",
      avatar: "https://i.pravatar.cc/150?img=5",
      role: "agent",
      verified: true,
      blocked: false,
    },
    {
      id: clientId,
      email: "client@demo.com",
      password: hashPassword("client123"),
      name: "Jane Doe",
      phone: "+1234567893",
      avatar: "https://i.pravatar.cc/150?img=8",
      role: "client",
      verified: true,
      blocked: false,
    },
  ]);

  console.log("✅ Users created");

  await db.insert(schema.agentProfiles).values([
    {
      id: randomUUID(),
      userId: agentId,
      package: "pro",
      accountSetupComplete: true,
      companyName: "Premier Realty",
      companyLogo: "https://i.pravatar.cc/150?img=50",
      banner:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200",
      bio: "Leading real estate agent with 10+ years of experience",
      specialties: JSON.stringify([
        "Luxury Properties",
        "Commercial Real Estate",
      ]),
      yearsExperience: 10,
      languages: JSON.stringify(["English", "Spanish"]),
      phone: "+1234567891",
      email: "agent@demo.com",
      website: "https://premierrealty.com",
      address: "123 Main St, New York, NY 10001",
      socialMedia: JSON.stringify({
        linkedin: "https://linkedin.com/in/johnsmith",
        instagram: "https://instagram.com/johnsmith",
      }),
      followers: 1250,
      following: 340,
      verified: true,
    },
    {
      id: randomUUID(),
      userId: agent2Id,
      package: "agency",
      accountSetupComplete: true,
      companyName: "Elite Properties",
      companyLogo: "https://i.pravatar.cc/150?img=51",
      banner:
        "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200",
      bio: "Specialized in luxury residential and commercial properties",
      specialties: JSON.stringify(["Residential", "Investment Properties"]),
      yearsExperience: 8,
      languages: JSON.stringify(["English", "French"]),
      phone: "+1234567892",
      email: "sarah@premier.com",
      website: "https://eliteproperties.com",
      address: "456 Park Ave, New York, NY 10022",
      socialMedia: JSON.stringify({
        linkedin: "https://linkedin.com/in/sarahwilliams",
        instagram: "https://instagram.com/sarahwilliams",
      }),
      followers: 890,
      following: 230,
      verified: true,
    },
  ]);

  console.log("✅ Agent profiles created");

  const property1Id = randomUUID();
  const property2Id = randomUUID();
  const property3Id = randomUUID();

  await db.insert(schema.properties).values([
    {
      id: property1Id,
      title: "Modern Downtown Apartment",
      description:
        "Beautiful 2-bedroom apartment in the heart of downtown with stunning city views",
      price: 2500,
      priceType: "monthly",
      location: JSON.stringify({
        address: "123 Downtown St",
        area: "Downtown",
        city: "New York",
        province: "NY",
        country: "USA",
        coordinates: { latitude: 40.7128, longitude: -74.006 },
      }),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      ]),
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      propertyType: "apartment",
      listingCategory: "property",
      status: "For Rent",
      verified: true,
      featured: true,
      amenities: JSON.stringify([
        "Pool",
        "Gym",
        "Parking",
        "Security",
        "WiFi",
      ]),
      tourLink: "https://my.matterport.com/show/?m=example",
      agentId: agentId,
      views: 245,
      bookings: 12,
      inquiries: 35,
    },
    {
      id: property2Id,
      title: "Luxury Villa with Ocean View",
      description:
        "Stunning 4-bedroom villa with panoramic ocean views and private pool",
      price: 1250000,
      priceType: "sale",
      location: JSON.stringify({
        address: "789 Ocean Drive",
        area: "Beachfront",
        city: "Miami",
        province: "FL",
        country: "USA",
        coordinates: { latitude: 25.7617, longitude: -80.1918 },
      }),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      ]),
      bedrooms: 4,
      bathrooms: 3,
      area: 3500,
      propertyType: "villa",
      listingCategory: "property",
      status: "For Sale",
      verified: true,
      featured: true,
      amenities: JSON.stringify([
        "Pool",
        "Garden",
        "Parking",
        "Security",
        "Ocean View",
      ]),
      agentId: agent2Id,
      views: 456,
      bookings: 8,
      inquiries: 42,
    },
    {
      id: property3Id,
      title: "Commercial Office Space",
      description: "Prime commercial space in business district",
      price: 5000,
      priceType: "monthly",
      location: JSON.stringify({
        address: "456 Business Blvd",
        area: "Business District",
        city: "New York",
        province: "NY",
        country: "USA",
        coordinates: { latitude: 40.7589, longitude: -73.9851 },
      }),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
      ]),
      bedrooms: 0,
      bathrooms: 2,
      area: 2000,
      propertyType: "office",
      listingCategory: "commercial",
      status: "For Rent",
      verified: true,
      featured: false,
      features: JSON.stringify([
        "Conference Room",
        "Reception Area",
        "Parking",
      ]),
      agentId: agentId,
      views: 123,
      bookings: 5,
      inquiries: 18,
      floors: 2,
      parkingSpaces: 10,
    },
  ]);

  console.log("✅ Properties created");

  await db.insert(schema.wishlists).values([
    {
      id: randomUUID(),
      userId: clientId,
      propertyId: property1Id,
    },
    {
      id: randomUUID(),
      userId: clientId,
      propertyId: property2Id,
    },
  ]);

  console.log("✅ Wishlists created");

  await db.insert(schema.bookings).values([
    {
      id: randomUUID(),
      propertyId: property1Id,
      clientId: clientId,
      agentId: agentId,
      date: new Date("2025-11-25T10:00:00"),
      time: "10:00 AM",
      clientName: "Jane Doe",
      clientEmail: "client@demo.com",
      clientPhone: "+1234567893",
      notes: "Looking forward to seeing the property",
      status: "confirmed",
    },
  ]);

  console.log("✅ Bookings created");

  await db.insert(schema.banners).values([
    {
      id: randomUUID(),
      image:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200",
      title: "Find Your Dream Home",
      description: "Browse thousands of properties",
      ctaText: "Search Now",
      ctaLink: "/search",
      order: 1,
      active: true,
    },
  ]);

  console.log("✅ Banners created");

  console.log("🎉 Database seeded successfully!");
  console.log("\n📝 Login credentials:");
  console.log("Admin: admin@nextmove.com / admin123");
  console.log("Agent: agent@demo.com / agent123");
  console.log("Client: client@demo.com / client123");
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
