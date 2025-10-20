import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { properties } from "../../../../db/schema";

const locationSchema = z.object({
  address: z.string(),
  area: z.string(),
  city: z.string(),
  province: z.string(),
  country: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

const listerSchema = z.object({
  type: z.enum(["company", "private"]),
  companyName: z.string().optional(),
  companyLogo: z.string().optional(),
});

const createPropertyInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  priceType: z.enum(["monthly", "sale"]),
  location: locationSchema,
  images: z.array(z.string()).min(1),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  area: z.number().positive(),
  propertyType: z.string().optional(),
  listingCategory: z.enum(["property", "stand", "room", "commercial"]).default("property"),
  status: z.enum(["For Rent", "For Sale", "Internal Management"]),
  amenities: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  tourLink: z.string().optional(),
  lister: listerSchema.optional(),
  floors: z.number().int().optional(),
  parkingSpaces: z.number().int().optional(),
  titleDeeds: z.boolean().optional(),
  serviced: z.boolean().optional(),
  developerSession: z.string().optional(),
  furnished: z.boolean().optional(),
  yearBuilt: z.number().int().optional(),
  zoning: z.string().optional(),
});

export const createPropertyProcedure = protectedProcedure
  .input(createPropertyInputSchema)
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    const userRole = ctx.user.role;

    if (userRole !== "agent" && userRole !== "agency" && userRole !== "admin") {
      throw new Error("Only agents, agencies, and admins can create properties");
    }

    const propertyId = crypto.randomUUID();

    const insertData = {
      id: propertyId,
      title: input.title,
      description: input.description,
      price: input.price,
      priceType: input.priceType,
      location: JSON.stringify(input.location),
      images: JSON.stringify(input.images),
      bedrooms: input.bedrooms ?? null,
      bathrooms: input.bathrooms ?? null,
      area: input.area,
      propertyType: input.propertyType ?? null,
      listingCategory: input.listingCategory,
      status: input.status,
      verified: 0,
      featured: 0,
      amenities: input.amenities ? JSON.stringify(input.amenities) : null,
      features: input.features ? JSON.stringify(input.features) : null,
      tourLink: input.tourLink ?? null,
      agentId: userId,
      views: 0,
      bookings: 0,
      inquiries: 0,
      lister: input.lister ? JSON.stringify(input.lister) : null,
      floors: input.floors ?? null,
      parkingSpaces: input.parkingSpaces ?? null,
      titleDeeds: input.titleDeeds !== undefined ? (input.titleDeeds ? 1 : 0) : null,
      serviced: input.serviced !== undefined ? (input.serviced ? 1 : 0) : null,
      developerSession: input.developerSession ?? null,
      furnished: input.furnished !== undefined ? (input.furnished ? 1 : 0) : null,
      yearBuilt: input.yearBuilt ?? null,
      zoning: input.zoning ?? null,
      flagged: 0,
    };

    await ctx.db.insert(properties).values(insertData as any);

    const property = await ctx.db.query.properties.findFirst({
      where: (properties, { eq }) => eq(properties.id, propertyId),
    });

    if (!property) {
      throw new Error("Failed to create property");
    }

    return {
      success: true,
      property: {
        ...property,
        location: JSON.parse(property.location),
        images: JSON.parse(property.images),
        amenities: property.amenities ? JSON.parse(property.amenities) : [],
        features: property.features ? JSON.parse(property.features) : [],
        lister: property.lister ? JSON.parse(property.lister) : null,
        verified: Boolean(property.verified),
        featured: Boolean(property.featured),
        titleDeeds: Boolean(property.titleDeeds),
        serviced: Boolean(property.serviced),
        furnished: Boolean(property.furnished),
        flagged: Boolean(property.flagged),
      },
    };
  });
