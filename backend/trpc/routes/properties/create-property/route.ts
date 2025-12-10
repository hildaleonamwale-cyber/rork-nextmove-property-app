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
      images: JSON.stringify(input.images),
      bedrooms: input.bedrooms ?? null,
      bathrooms: input.bathrooms ?? null,
      area: input.area,
      areaUnit: null,
      propertyType: input.propertyType ?? null,
      listingCategory: input.listingCategory,
      status: input.status,
      featured: false,
      amenities: input.amenities ? JSON.stringify(input.amenities) : null,
      agentId: userId,
      userId: userId,
      views: 0,
      inquiries: 0,
      furnished: input.furnished ?? null,
      parking: null,
      address: input.location.address,
      city: input.location.city,
      state: input.location.province ?? null,
      country: input.location.country,
      zipCode: null,
      latitude: input.location.coordinates?.latitude?.toString() ?? null,
      longitude: input.location.coordinates?.longitude?.toString() ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
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
        location: input.location,
        images: JSON.parse(property.images),
        amenities: property.amenities ? JSON.parse(property.amenities) : [],
        features: input.features ?? [],
        lister: input.lister ?? null,
        featured: Boolean(property.featured),
        furnished: property.furnished ? Boolean(property.furnished) : false,
        parking: property.parking ? Boolean(property.parking) : false,
      },
    };
  });
